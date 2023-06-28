import { exec } from 'child_process';

// Declare the execute function
async function execute({ appName }) {
  return new Promise((resolve, reject) => {
    exec(`open -a "${appName}"`, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        reject(`Error opening ${appName}: ${error.message}`);
      }
      resolve(`${appName} opened successfully.`);
    });
  });
}

// Export the function and its details
export const openApp = {
  execute,
  details: {
    name: "openApp",
    description: "Opens a specified application on your computer",
    parameters: {
      type: "object",
      properties: {
        appName: {
          type: "string",
          description: "The name of the application to open"
        },
      },
      required: ["appName"],
    },
  },
  example: "Open the 'Calculator' application"
};
