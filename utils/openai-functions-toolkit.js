import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

export class ai_functions {
  constructor(message, options = {}) {
    this.message = message;
    this.options = options;
  }

  async call() {
    const { message, options } = this;
    let functionArray = options.functionArray;

    const openAIFunctions = await this.getFunctions();

    if (!functionArray) {
      console.log(
        "No specific functions requested. Using all available functions."
      );
      functionArray = Object.keys(openAIFunctions);
    } else {
      console.log(`Requested functions: ${functionArray.join(", ")}`);
    }

    const functionMap = {};

    for (const functionName of functionArray) {
      if (openAIFunctions.hasOwnProperty(functionName)) {
        functionMap[functionName] = openAIFunctions[functionName];
      } else {
        throw new Error(`Unsupported function: ${functionName}`);
      }
    }

    const functionNames = functionArray.join(", ");

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
      console.log(`Sending initial request of "${message}" to OpenAI...`);
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

          function_response = await functionToExecute.execute(functionArgs);

        } else {
          throw new Error(`Unsupported function: ${function_name}`);
        }

        executedFunctions[function_name] = true;
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


      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async getFunctions() {
    const files = fs.readdirSync(path.resolve(__dirname, "./functions"));
    const openAIFunctions = {};

    for (const file of files) {
      if (file.endsWith(".js")) {
        const moduleName = file.slice(0, -3);
        const modulePath = `./functions/${moduleName}.js`;
        const { execute, details } = await import(modulePath);

        openAIFunctions[moduleName] = {
          execute,
          details,
        };
      }
    }

    return openAIFunctions;
  }
}
