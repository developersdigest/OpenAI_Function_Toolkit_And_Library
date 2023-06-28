import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Dynamically import function from ./functions
async function getFunctions() {
  const openAIFunctions = {};

  const files = fs.readdirSync(path.resolve(__dirname, './functions'));

  for (const file of files) {
    if (file.endsWith('.js')) {
      const moduleName = file.slice(0, -3); // remove .js extension
      const modulePath = `./functions/${moduleName}.js`;
      const moduleFunction = await import(modulePath);
      openAIFunctions[moduleName] = moduleFunction[moduleName];
    }
  }

  return openAIFunctions;
}


export async function ai_functions({ message, functionArray }) {
  const openAIFunctions = await getFunctions();  // fetch functions dynamically

  // If no specific functions are requested, use all available functions
  if (!functionArray) {
    console.log("No specific functions requested. Using all available functions.");
    functionArray = Object.keys(openAIFunctions);
  } else {
    console.log(`Requested functions: ${functionArray.join(", ")}`);
  }

  const functionMap = {};

  for (const functionName of functionArray) {

    if (openAIFunctions.hasOwnProperty(functionName)) {
      functionMap[functionName] = openAIFunctions[functionName].execute;
    } else {
      throw new Error(`Unsupported function: ${functionName}`);
    }
}

  // Create a string of function names
  const functionNames = functionArray.join(', ');

  console.log(`Using functions: ${functionNames}`);
  const baseURL = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
  };



  let data = {
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "gpt-3.5-turbo-0613",
    functions: functionArray.map(
      (functionName) => openAIFunctions[functionName].details
    ),
    function_call: "auto",
  };

  try {
    console.log(`Sending initial request of "${message}" to OpenAI API...`);
    let response = await fetch(baseURL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    response = await response.json();

    let executedFunctions = {};

    while (
      response.choices &&
      response.choices[0].message.function_call &&
      response.choices[0].finish_reason !== "stop"
    ) {
      let message = response.choices[0].message;
      const function_name = message.function_call.name;

      if (executedFunctions[function_name]) {
        break;
      }

      let function_response = "";

      if (functionMap.hasOwnProperty(function_name)) {
        const functionArgs = JSON.parse(message.function_call.arguments);
        const functionToExecute = functionMap[function_name];
        function_response = await functionToExecute(functionArgs);
      } else {
        throw new Error(`Unsupported function: ${function_name}`);
      }
      

      executedFunctions[function_name] = true;

      console.log(`Sending function response of ${function_name} to OpenAI...`);
      data.messages.push({
        role: "function",
        name: function_name,
        content: function_response,
      });

      response = await fetch(baseURL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      response = await response.json();
    }
    console.log(response.choices[0].message.content);

    return response;
  } catch (error) {
    console.error("Error:", error);
  }
}