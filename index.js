import { ai_functions } from "./utils/openai-functions-toolkit.js";

// 1. Take a screenshot of a website
// ai_functions({message: "Take a screenshot of Amazon.com",});

// // 2. Scrape a website and take a screenshot
// ai_functions({
//   message: "Scrape the website https://www.google.com and take a screenshot",
//   functionArray: ["scrapeWebsite", "takeScreenshot"],
// });

// 3. Open the calculator app
ai_functions({ message: "Open the calculator app on my computer" });

// 4. Open system preferences
ai_functions({ message: "Open the activity monitor on my computer" });