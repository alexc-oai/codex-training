import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const BASE_URL = "http://127.0.0.1:4173";
const RUN_E2E = process.env.RUN_E2E === "1";

let browser;
let server;
let playwright;

async function waitForServer(url, attempts = 30) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // ignore and retry
    }
    await delay(300);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

async function launchApp() {
  const context = await browser.newContext({ viewport: { width: 1500, height: 920 } });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  return { context, page };
}

async function completeMissionLoop(page) {
  for (let i = 0; i < 4; i += 1) {
    await page.getByRole("button", { name: /Copy Mission Prompt/i }).click();
    const completeButton = page.getByRole("button", { name: /Complete Mission & Continue/i });
    const evidenceInput = page.getByLabel(/Evidence/i);
    if (await evidenceInput.isVisible()) {
      await evidenceInput.fill(`Observed outcome ${i + 1}`);
    }
    await page.waitForFunction(() => !document.querySelector("#mission-complete-btn")?.disabled);

    await completeButton.click();
    await delay(80);
  }
}

if (RUN_E2E) {
  test.before(async () => {
    ({ chromium: playwright } = await import("playwright"));
    server = spawn("node", ["server.mjs"], {
      cwd: process.cwd(),
      stdio: "ignore"
    });
    await waitForServer(BASE_URL);
    browser = await playwright.launch({ headless: true });
  });

  test.after(async () => {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill();
    }
  });
}

test(
  "technical path enforces guided order and exposes 201 preview on final CTA",
  { skip: !RUN_E2E },
  async () => {
    const { context, page } = await launchApp();

    await page.getByRole("button", { name: /^Technical Track$/ }).click();
    await page.getByRole("button", { name: /Generate Starter Prompt/i }).click();
    await page.getByRole("button", { name: /Start Mission 1/i }).click();

    await completeMissionLoop(page);
    await page.getByRole("button", { name: /Continue to Prompt Lab/i }).click();

    await page.locator("#flow-action-btn").click(); // Create Prompt
    await page.locator("#use-prompt-btn").click();
    await page.getByRole("button", { name: /Continue to Handoff/i }).click();

    await page.getByRole("button", { name: /Build Handoff Prompt/i }).click();
    await page.getByRole("button", { name: /Copy Handoff Prompt/i }).click();
    await page.getByRole("button", { name: /Preview 201 Skills/i }).click();

    const preview = page.locator("#preview-201");
    await assert.doesNotReject(() => preview.waitFor({ state: "visible" }));
    await context.close();
  }
);

test(
  "guided flow status stays aligned with the visible CTA copy",
  { skip: !RUN_E2E },
  async () => {
    const { context, page } = await launchApp();

    await page.getByRole("button", { name: /^Technical Track$/ }).click();

    assert.equal(await page.locator("#flow-action-btn").innerText(), "Generate Starter Prompt");
    assert.match(await page.locator("#flow-step-status").innerText(), /generate starter prompt/i);
    assert.doesNotMatch(
      await page.locator("#flow-step-status").innerText(),
      /continue guide/i
    );

    await page.getByRole("button", { name: /Generate Starter Prompt/i }).click();
    await page.getByRole("button", { name: /Start Mission 1/i }).click();
    await completeMissionLoop(page);

    assert.equal(await page.locator("#flow-action-btn").innerText(), "Continue to Prompt Lab");
    assert.match(await page.locator("#flow-step-status").innerText(), /continue to prompt lab/i);
    assert.doesNotMatch(
      await page.locator("#flow-step-status").innerText(),
      /continue guide/i
    );

    await context.close();
  }
);

test(
  "missions require evidence and show prompt lab as an early preview",
  { skip: !RUN_E2E },
  async () => {
    const { context, page } = await launchApp();

    await page.getByRole("button", { name: /^Technical Track$/ }).click();
    await page.getByRole("button", { name: /Generate Starter Prompt/i }).click();
    await page.getByRole("button", { name: /Start Mission 1/i }).click();

    assert.equal(await page.locator("#flow-action-btn").innerText(), "Preview Prompt Lab");
    assert.equal(await page.locator("#mission-ran-checkbox").count(), 1);

    const completeButton = page.getByRole("button", { name: /Complete Mission & Continue/i });
    assert.equal(await completeButton.isDisabled(), true);

    await page.getByLabel(/Evidence/i).fill("Summarized the repo modules.");
    assert.equal(await completeButton.isDisabled(), false);

    await page.getByRole("button", { name: /Preview Prompt Lab/i }).click();
    await assert.doesNotReject(() =>
      page.locator(".prompt-primary").getByRole("heading", { name: /^Prompt Makeover$/ }).waitFor({
        state: "visible"
      })
    );

    await context.close();
  }
);

test(
  "prompt lab treats a created prompt as ready to continue",
  { skip: !RUN_E2E },
  async () => {
    const { context, page } = await launchApp();

    await page.getByRole("button", { name: /^Non-Technical Track$/ }).click();
    await page.getByRole("button", { name: /Generate Starter Prompt/i }).click();
    await page.getByRole("button", { name: /Start Mission 1/i }).click();

    await completeMissionLoop(page);
    await page.getByRole("button", { name: /Continue to Prompt Lab/i }).click();

    await page.locator("#flow-action-btn").click(); // Create Prompt
    assert.equal(await page.locator("#flow-action-btn").innerText(), "Continue to Handoff");

    await context.close();
  }
);

test(
  "applying a library prompt does not switch the active track",
  { skip: !RUN_E2E },
  async () => {
    const { context, page } = await launchApp();

    await page.getByRole("button", { name: /^Technical Track$/ }).click();
    await page.getByRole("button", { name: /Generate Starter Prompt/i }).click();
    await page.getByRole("button", { name: /Start Mission 1/i }).click();

    await completeMissionLoop(page);
    await page.getByRole("button", { name: /Continue to Prompt Lab/i }).click();

    await page.getByRole("button", { name: /Non-Technical/i }).click();
    await page.getByRole("button", { name: /Use in Builder/i }).first().click();

    assert.equal(
      await page.locator("#track-technical").getAttribute("aria-selected"),
      "true"
    );
    assert.equal(
      await page.locator("#track-nonTechnical").getAttribute("aria-selected"),
      "false"
    );

    await context.close();
  }
);

test(
  "non-technical path can continue from prompt lab after a prompt is created",
  { skip: !RUN_E2E },
  async () => {
    const { context, page } = await launchApp();

    await page.getByRole("button", { name: /^Non-Technical Track$/ }).click();
    await page.getByRole("button", { name: /Generate Starter Prompt/i }).click();
    await page.getByRole("button", { name: /Start Mission 1/i }).click();

    await completeMissionLoop(page);
    await page.getByRole("button", { name: /Continue to Prompt Lab/i }).click();

    assert.equal(await page.locator("#flow-action-btn").innerText(), "Create Prompt");

    await page.locator("#flow-action-btn").click(); // Create Prompt
    await page.getByRole("button", { name: /Continue to Handoff/i }).click();

    assert.equal(await page.locator("#flow-step-label").innerText(), "Share + Next");
    await context.close();
  }
);
