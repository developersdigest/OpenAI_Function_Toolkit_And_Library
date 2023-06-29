import { exec } from 'child_process';

export const execute = (options) => {
    const { appName } = options;
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

export const details = {
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
    example: "Open the 'Calculator' application"
};
