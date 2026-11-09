import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const port = 9222;
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1080",
    "http://localhost:3000",
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

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));

  let msgId = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data.result);
      callbacks.delete(data.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await new Promise((r) => setTimeout(r, 2000));

  const res = await send("Runtime.evaluate", {
    expression: `
      (() => {
        const ticketRoot = document.querySelector(".micro-story-root");
        const ticket = ticketRoot.querySelector(".rotate-\\\\[-3deg\\\\]") || ticketRoot.firstElementChild;
        const ticketRect = ticket.getBoundingClientRect();
        
        const allElements = document.querySelectorAll("body *");
        const overlapping = [];
        for (const el of allElements) {
          if (ticketRoot.contains(el)) continue;
          if (el.contains(ticketRoot)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          const intersects = !(
            rect.right < ticketRect.left ||
            rect.left > ticketRect.right ||
            rect.bottom < ticketRect.top ||
            rect.top > ticketRect.bottom
          );
          if (intersects) {
            overlapping.push({
              tag: el.tagName,
              className: el.className,
              rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
            });
          }
        }
        return { ticketRect, overlapping };
      })()
    `,
    returnByValue: true,
  });

  console.log("Ticket rect:", res?.result?.value?.ticketRect);
  console.log("Overlapping elements:", JSON.stringify(res?.result?.value?.overlapping, null, 2));

  ws.close();
  chromeProc.kill();
}

run().catch(console.error);

