import { ai_functions } from "./utils/openai-functions-toolkit.js";

const funcA = new ai_functions("Open the calculator on my computer");
const resA = await funcA.call();
console.log(resA);

const funcB = new ai_functions("Take a screenshot of Amazon.com");
const resB = await funcB.call();
console.log(resB);

const funcC = new ai_functions("Scrape the website https://www.google.com and take a screenshot", {
  // Limit the functions to be used and passed to OpenAI with the optional functionalArray setting
  functionArray: ["scrapeWebsite", "takeScreenshot"]
});
const resC = await funcC.call();
console.log(resC);
