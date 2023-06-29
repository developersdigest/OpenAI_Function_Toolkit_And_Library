import { ai_functions } from "./utils/openai-functions-toolkit.js";

const funcA = new ai_functions("Open the calculator on my computer");
const resB = await funcA.call();
console.log(resB);

const funcB = new ai_functions("Take a screenshot of Amazon.com");
const resA = await funcB.call();
console.log(resA);

const funcC = new ai_functions("Scrape the website https://www.google.com and take a screenshot", {
  functionArray: ["scrapeWebsite", "takeScreenshot"]
});
const resC = await funcC.call();
console.log(resC);
