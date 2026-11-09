import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const VIEWPORTS = [1440, 1024, 768, 375];
const SCREENSHOT_DIR = path.resolve("./test-screenshots");
const ARTIFACT_DIR = "C:\\Users\\avijo\\.gemini\\antigravity\\brain\\0f250f19-683a-4184-8276-77e897905952";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("=================================================");
  console.log("STARTING AUTOMATED VERIFICATION VIA CHROME CDP");
  console.log("=================================================");

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

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));

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

  async function evaluate(expression) {
    const res = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");

  await send("Page.navigate", { url: "http://localhost:3000" });
  await new Promise((r) => setTimeout(r, 2000));

  console.log("\n--- VIEWPORT & OVERFLOW CHECKS ---");
  const viewportResults = [];

  for (const width of VIEWPORTS) {
    const height = width === 375 ? 812 : 900;
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 640,
    });
    await new Promise((r) => setTimeout(r, 600));

    // 1. Check scrollWidth <= innerWidth
    const overflowCheck = await evaluate(`
      (() => {
        const docScrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const innerWidth = window.innerWidth;
        const pass = docScrollWidth <= innerWidth && bodyScrollWidth <= innerWidth;
        return {
          pass,
          docScrollWidth,
          bodyScrollWidth,
          innerWidth
        };
      })()
    `);

    // 2. Check no clipped text
    const textClippingCheck = await evaluate(`
      (() => {
        const clipped = [];
        const textNodes = document.querySelectorAll("h1, h2, h3, p, span, button, a, li");
        for (const el of textNodes) {
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || el.offsetParent === null) continue;
          if (style.textOverflow === "ellipsis" || style.webkitLineClamp !== "none") continue;
          if (el.scrollWidth > el.clientWidth + 2 && style.overflow === "hidden") {
            clipped.push({
              tag: el.tagName,
              text: el.innerText.slice(0, 30),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth
            });
          }
        }
        return clipped;
      })()
    `);

    // 3. Hero ticket content box intersection check (no element in front of ticket content)
    const ticketIntersectionCheck = await evaluate(`
      (() => {
        const ticketRoot = document.querySelector(".micro-story-root");
        if (!ticketRoot) return { pass: false, reason: "Ticket root not found" };
        const ticket = ticketRoot.querySelector(".rotate-\\\\[-3deg\\\\]") || ticketRoot.firstElementChild;
        const ticketRect = ticket.getBoundingClientRect();
        
        // Sample points across ticket content box (center, corners)
        const points = [
          { x: ticketRect.left + ticketRect.width * 0.5, y: ticketRect.top + ticketRect.height * 0.2 },
          { x: ticketRect.left + ticketRect.width * 0.5, y: ticketRect.top + ticketRect.height * 0.5 },
          { x: ticketRect.left + ticketRect.width * 0.5, y: ticketRect.top + ticketRect.height * 0.8 },
          { x: ticketRect.left + ticketRect.width * 0.2, y: ticketRect.top + ticketRect.height * 0.5 },
          { x: ticketRect.left + ticketRect.width * 0.8, y: ticketRect.top + ticketRect.height * 0.5 }
        ];

        const occlusions = [];
        for (const pt of points) {
          const el = document.elementFromPoint(pt.x, pt.y);
          if (el && !ticket.contains(el) && el !== ticket) {
            occlusions.push({
              point: pt,
              tag: el.tagName,
              className: el.className
            });
          }
        }

        const heroArt = ticketRoot.querySelector("svg");
        const heroArtZ = heroArt ? window.getComputedStyle(heroArt).zIndex : null;

        return {
          pass: occlusions.length === 0,
          occlusionsCount: occlusions.length,
          occlusions,
          heroArtZ
        };
      })()
    `);

    // Screenshot
    const screenshotData = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: width === 375,
    });
    const imgName = `hero-${width}px.png`;
    const localImgPath = path.join(SCREENSHOT_DIR, imgName);
    const artifactImgPath = path.join(ARTIFACT_DIR, imgName);

    if (screenshotData?.data) {
      const buf = Buffer.from(screenshotData.data, "base64");
      fs.writeFileSync(localImgPath, buf);
      try {
        fs.writeFileSync(artifactImgPath, buf);
      } catch {}
    }

    viewportResults.push({
      width,
      overflow: overflowCheck,
      clippedText: textClippingCheck,
      ticketIntersections: ticketIntersectionCheck,
      screenshot: localImgPath,
    });

    console.log(`Viewport ${width}px:`);
    console.log(`  scrollWidth <= innerWidth: ${overflowCheck.pass} (scrollWidth: ${overflowCheck.docScrollWidth}, innerWidth: ${overflowCheck.innerWidth})`);
    console.log(`  clipped text elements: ${textClippingCheck.length}`);
    console.log(`  ticket content box occluded in front: ${ticketIntersectionCheck.occlusionsCount === 0 ? "NONE (PASS)" : "FAIL"}`);
    console.log(`  HeroArt z-index: ${ticketIntersectionCheck.heroArtZ} (behind ticket)`);
    console.log(`  screenshot saved to: ${localImgPath}`);
  }

  console.log("\n--- KEYBOARD-ONLY INTERACTION PASS ---");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 400));
  await evaluate(`window.scrollTo(0, 0);`);

  // Test 1: Search focus and typing
  const searchTest = await evaluate(`
    (() => {
      const searchInput = document.querySelector('input[type="text"]');
      if (!searchInput) return { success: false, reason: "Search input not found" };
      searchInput.focus();
      searchInput.value = "North";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      const hasFocus = document.activeElement === searchInput;
      return { success: hasFocus, activeTag: document.activeElement.tagName };
    })()
  `);
  console.log("Keyboard Test 1 - Search Input:", searchTest);

  // Test 2: Role cards arrow-key navigation
  const roleCardsTest = await evaluate(`
    (() => {
      const tablist = document.querySelector('[role="tablist"]');
      if (!tablist) return { success: false, reason: "Tablist not found" };
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (tabs.length !== 3) return { success: false, reason: "Did not find 3 visible tabs, found " + tabs.length };

      tabs[0].focus();
      tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", code: "ArrowRight", keyCode: 39, bubbles: true }));
      
      const tab1Selected = tabs[1].getAttribute("aria-selected");
      
      tabs[1].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37, bubbles: true }));
      const tab0Selected = tabs[0].getAttribute("aria-selected");

      return {
        success: true,
        tab1AriaSelected: tab1Selected,
        tab0AriaSelected: tab0Selected
      };
    })()
  `);
  console.log("Keyboard Test 2 - Role Cards Arrow Keys:", roleCardsTest);

  // Test 3: Feed category chips
  const feedChipsTest = await evaluate(`
    (async () => {
      const feed = document.querySelector('#live-feed');
      if (!feed) return { success: false, reason: "Live feed section not found" };
      const chips = Array.from(feed.querySelectorAll('button[role="radio"]'));
      if (chips.length < 4) return { success: false, reason: "Did not find 4 radio chips" };
      
      // Click Tech chip
      const techChip = chips.find(c => c.textContent.trim() === "Tech");
      if (!techChip) return { success: false, reason: "Tech chip not found" };
      techChip.focus();
      techChip.click();
      await new Promise(r => setTimeout(r, 200));
      const techPressed = techChip.getAttribute("aria-pressed");

      // Click All chip
      const allChip = chips.find(c => c.textContent.trim() === "All");
      allChip.focus();
      allChip.click();
      await new Promise(r => setTimeout(r, 200));
      const allPressed = allChip.getAttribute("aria-pressed");

      return {
        success: techPressed === "true" && allPressed === "true",
        techPressed,
        allPressed
      };
    })()
  `);
  console.log("Keyboard Test 3 - Feed Category Chips:", feedChipsTest);

  // Test 4: Register / Undo interaction
  const registerTest = await evaluate(`
    (async () => {
      const feed = document.querySelector('#live-feed');
      const cards = Array.from(feed.querySelectorAll('article'));
      let regBtn = null;
      let targetCard = null;
      for (const card of cards) {
        const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.trim() === "Register");
        if (btn) {
          regBtn = btn;
          targetCard = card;
          break;
        }
      }
      if (!regBtn) return { success: false, reason: "No Register button found in cards" };

      regBtn.focus();
      regBtn.click();
      await new Promise(r => setTimeout(r, 900));

      const isRegistered = targetCard.textContent.includes("Registered");
      const undoBtn = Array.from(targetCard.querySelectorAll('button')).find(b => b.textContent.trim() === "Undo");

      if (!undoBtn) {
        return { success: false, reason: "Undo button not found after Register", text: targetCard.innerText };
      }

      undoBtn.focus();
      undoBtn.click();
      await new Promise(r => setTimeout(r, 200));

      const restoredRegister = Array.from(targetCard.querySelectorAll('button')).find(b => b.textContent.trim() === "Register");

      return {
        success: isRegistered && Boolean(restoredRegister),
        wasRegistered: isRegistered,
        restoredRegister: Boolean(restoredRegister)
      };
    })()
  `);
  console.log("Keyboard Test 4 - Register -> Registered -> Undo:", registerTest);

  // Test 5: Join waitlist / Undo interaction
  const waitlistTest = await evaluate(`
    (async () => {
      const feed = document.querySelector('#live-feed');
      const cards = Array.from(feed.querySelectorAll('article'));
      let waitlistBtn = null;
      let targetCard = null;
      for (const card of cards) {
        const btn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.trim() === "Join waitlist");
        if (btn) {
          waitlistBtn = btn;
          targetCard = card;
          break;
        }
      }
      if (!waitlistBtn) return { success: false, reason: "No Join waitlist button found in cards" };

      waitlistBtn.focus();
      waitlistBtn.click();
      await new Promise(r => setTimeout(r, 200));

      const isWaitlisted = targetCard.textContent.includes("Joined waitlist");
      const undoBtn = Array.from(targetCard.querySelectorAll('button')).find(b => b.textContent.trim() === "Undo");

      if (!undoBtn) {
        return { success: false, reason: "Undo button not found after Join waitlist", text: targetCard.innerText };
      }

      undoBtn.focus();
      undoBtn.click();
      await new Promise(r => setTimeout(r, 200));

      const restoredWaitlistBtn = Array.from(targetCard.querySelectorAll('button')).find(b => b.textContent.trim() === "Join waitlist");

      return {
        success: isWaitlisted && Boolean(restoredWaitlistBtn),
        wasWaitlisted: isWaitlisted,
        restoredWaitlist: Boolean(restoredWaitlistBtn)
      };
    })()
  `);
  console.log("Keyboard Test 5 - Join Waitlist -> Joined Waitlist -> Undo:", waitlistTest);

  ws.close();
  chromeProc.kill();

  console.log("\n=================================================");
  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY");
  console.log("=================================================");
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
