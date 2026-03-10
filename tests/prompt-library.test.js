import test from "node:test";
import assert from "node:assert/strict";

import { PROMPT_LIBRARY, PROMPT_CATEGORIES } from "../src/content/prompt-library.js";

test("prompt library exposes all expected categories", () => {
  assert.deepEqual(PROMPT_CATEGORIES, [
    "technical",
    "nonTechnical",
    "hackathon"
  ]);
});

test("prompt library items include required fields", () => {
  assert.ok(PROMPT_LIBRARY.length >= 6);
  for (const prompt of PROMPT_LIBRARY) {
    assert.ok(prompt.id);
    assert.ok(prompt.title);
    assert.ok(prompt.category);
    assert.ok(prompt.goal);
    assert.ok(prompt.context);
    assert.ok(prompt.constraints);
    assert.ok(prompt.doneWhen);
  }
});

test("prompt library IDs are unique", () => {
  const ids = PROMPT_LIBRARY.map((item) => item.id);
  const unique = new Set(ids);
  assert.equal(ids.length, unique.size);
});

test("non-technical prompt library aligns with the 15-minute game and html handoff flow", () => {
  const conceptPicker = PROMPT_LIBRARY.find((item) => item.id === "nontech-concept-picker");
  const buildBrief = PROMPT_LIBRARY.find((item) => item.id === "nontech-build-brief");
  const webGame = PROMPT_LIBRARY.find((item) => item.id === "nontech-telecom-mini-mvp");
  const handoff = PROMPT_LIBRARY.find((item) => item.id === "nontech-stakeholder-handoff");

  assert.ok(conceptPicker);
  assert.ok(buildBrief);
  assert.ok(webGame);
  assert.ok(handoff);

  assert.doesNotMatch(conceptPicker.goal, /ask mode/i);
  assert.match(conceptPicker.doneWhen, /strongest concept|one-sentence pitch/i);

  assert.doesNotMatch(buildBrief.goal, /use plan mode/i);

  assert.match(webGame.goal, /single-file html|html/i);
  assert.match(
    webGame.context,
    /signal snake|dead zone sweeper|plan match memory|tower tap rush/i
  );

  assert.match(handoff.goal, /html/i);
  assert.match(handoff.doneWhen, /newspaper|magazine|economist|new york times/i);
});
