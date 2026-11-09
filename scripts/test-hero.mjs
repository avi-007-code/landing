import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const VIEWPORTS = [1440, 1024, 768, 375];
const SCREENSHOT_DIR = path.resolve("./test-screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("Starting Chrome CDP test on http://localhost:3000...");
  
  const port = 9222;
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1080",
    "about:blank",
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const targets = await res.json();
      const pageTarget = targets.find((t) => t.type === "page");
      if (pageTarget?.webSocketDebuggerUrl) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    chromeProc.kill();
    throw new Error("Could not connect to Chrome DevTools port " + port);
  }

  console.log("Connected to Chrome:", wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => ws.onopen = resolve);

  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb(data);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      callbacks.set(id, (res) => resolve(res.result));
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");

  await send("Page.navigate", { url: "http://localhost:3000" });
  await new Promise((r) => setTimeout(r, 2000));

  for (const width of VIEWPORTS) {
    console.log(`\nTesting viewport width: ${width}px`);
    const height = width === 375 ? 812 : 900;
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 640,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Capture Screenshot (full page for 375px to see ticket below the fold)
    const screenshotData = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: width === 375,
    });
    if (screenshotData?.data) {
      const imgPath = path.join(SCREENSHOT_DIR, `hero-${width}px.png`);
      fs.writeFileSync(imgPath, Buffer.from(screenshotData.data, "base64"));
      console.log(`Screenshot saved to: ${imgPath}`);
    }
  }

  ws.close();
  chromeProc.kill();
  console.log("\nAll screenshots updated successfully!");
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
