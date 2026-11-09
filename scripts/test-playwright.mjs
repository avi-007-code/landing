import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  console.log("Launched Chrome with Playwright successfully!");
  await browser.close();
}

main().catch(console.error);

