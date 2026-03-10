import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  completeMission,
  calculateProgress,
  computeBadges,
  buildPrompt,
  serializeExport,
  createQuickWinPrompt,
  stylizeArtifact,
  createGameDesignPrompt,
  getPromptCategoryForTrack,
  evaluatePromptLabReadiness,
  getHandoffPrimaryActionLabel
} from "../src/quest-core.js";

test("createInitialState returns predictable defaults", () => {
  const state = createInitialState();

  assert.equal(state.activeTrack, "technical");
  assert.deepEqual(state.completedMissionIds, []);
  assert.equal(state.points, 0);
  assert.equal(state.builtPrompts, 0);
  assert.deepEqual(state.visitedTracks, ["technical"]);
  assert.deepEqual(state.missionRunConfirmedById, {});
  assert.deepEqual(state.missionEvidenceById, {});
  assert.equal(state.promptLabActionTaken, false);
  assert.equal(state.handoffCopied, false);
});

test("completeMission marks mission complete and increments points once", () => {
  const start = createInitialState();
  const once = completeMission(start, "m1");
  const twice = completeMission(once, "m1");

  assert.deepEqual(once.completedMissionIds, ["m1"]);
  assert.equal(once.points, 25);
  assert.deepEqual(twice.completedMissionIds, ["m1"]);
  assert.equal(twice.points, 25);
});

test("calculateProgress returns whole percentage based on completed missions", () => {
  const state = { completedMissionIds: ["a", "b"] };

  assert.equal(calculateProgress(state, 4), 50);
  assert.equal(calculateProgress(state, 3), 67);
  assert.equal(calculateProgress(state, 0), 0);
});

test("computeBadges awards badges based on milestones", () => {
  const badges = computeBadges({
    completedMissionIds: ["m1", "m2"],
    builtPrompts: 1,
    visitedTracks: ["technical", "nonTechnical"]
  });

  assert.deepEqual(
    badges.map((badge) => badge.id),
    ["first-delegate", "double-down", "prompt-pro", "cross-functional"]
  );
});

test("buildPrompt validates required fields", () => {
  const invalid = buildPrompt({
    goal: "Ship onboarding",
    context: "",
    constraints: "No network calls",
    doneWhen: "All missions complete"
  });

  assert.equal(invalid.ok, false);
  assert.match(invalid.error, /Context/);
});

test("buildPrompt returns composed prompt text when valid", () => {
  const result = buildPrompt({
    goal: "Create a mission flow",
    context: "This app is for mixed technical and non-technical users.",
    constraints: "Keep each mission under 10 minutes.",
    doneWhen: "User can complete one mission end-to-end and export output."
  });

  assert.equal(result.ok, true);
  assert.match(result.prompt, /Goal:/);
  assert.match(result.prompt, /Context:/);
  assert.match(result.prompt, /Constraints:/);
  assert.match(result.prompt, /Done-When:/);
});

test("serializeExport includes user state and generated artifact", () => {
  const text = serializeExport({
    activeTrack: "technical",
    completedMissionIds: ["m1", "m2"],
    points: 50,
    badges: [{ id: "first-delegate", title: "First Delegate" }],
    artifactTitle: "Hackathon Plan",
    artifactBody: "Top 3 ideas with owners"
  });

  assert.match(text, /Codex Quest Artifact Export/);
  assert.match(text, /Track: technical/);
  assert.match(text, /First Delegate/);
  assert.match(text, /Top 3 ideas with owners/);
});

test("createQuickWinPrompt generates a complete 5-minute prompt for technical track", () => {
  const quickWin = createQuickWinPrompt("technical");

  assert.equal(quickWin.ok, true);
  assert.match(quickWin.prompt, /Goal:/);
  assert.match(quickWin.prompt, /Done-When:/);
  assert.match(quickWin.prompt, /5 minutes/i);
  assert.match(quickWin.prompt, /ask mode/i);
});

test("createQuickWinPrompt defaults to non-technical scenario when track is unknown", () => {
  const quickWin = createQuickWinPrompt("unknown-track");

  assert.equal(quickWin.ok, true);
  assert.match(quickWin.prompt, /3 concepts|strongest concept/i);
});

test("stylizeArtifact creates a NYT-style transformation", () => {
  const result = stylizeArtifact({
    style: "nyt",
    title: "Hackathon Brief",
    body:
      "Teams should focus on customer experience. We need a fast demo and clear success metrics. Include owners for each workstream."
  });

  assert.match(result, /The Codex Times/);
  assert.match(result, /By Codex Desk/);
  assert.match(result, /Why this matters/);
});

test("stylizeArtifact creates an Economist-style transformation", () => {
  const result = stylizeArtifact({
    style: "economist",
    title: "Hackathon Brief",
    body:
      "Teams should focus on customer experience. We need a fast demo and clear success metrics. Include owners for each workstream."
  });

  assert.match(result, /Briefing \| Hackathon Brief/);
  assert.match(result, /Thesis/);
  assert.match(result, /Recommendation/);
});

test("stylizeArtifact creates a game-lab concept transformation", () => {
  const result = stylizeArtifact({
    style: "gameLab",
    title: "Hackathon Brief",
    body:
      "Teams should focus on customer experience. We need a fast demo and clear success metrics. Include owners for each workstream."
  });

  assert.match(result, /Game Concept: Hackathon Brief/);
  assert.match(result, /Core Loop/);
  assert.match(result, /Win Condition/);
});

test("createGameDesignPrompt returns a complete game-building prompt", () => {
  const result = createGameDesignPrompt(
    "Build a hackathon game about reducing customer wait times."
  );

  assert.equal(result.ok, true);
  assert.match(result.prompt, /browser-based mini game/i);
  assert.match(result.prompt, /Done-When:/);
});

test("evaluatePromptLabReadiness requires prompt generation and explicit prompt-use action", () => {
  const initial = evaluatePromptLabReadiness({
    generatedPrompt: "",
    promptLabActionTaken: false
  });
  assert.equal(initial.ready, false);
  assert.match(initial.reason, /create a prompt/i);

  const generatedOnly = evaluatePromptLabReadiness({
    generatedPrompt: "Goal: test",
    promptLabActionTaken: false
  });
  assert.equal(generatedOnly.ready, true);
  assert.match(generatedOnly.reason, /prompt created/i);

  const ready = evaluatePromptLabReadiness({
    generatedPrompt: "Goal: test",
    promptLabActionTaken: true
  });
  assert.equal(ready.ready, true);
});

test("getPromptCategoryForTrack follows selected track", () => {
  assert.equal(getPromptCategoryForTrack("technical"), "technical");
  assert.equal(getPromptCategoryForTrack("nonTechnical"), "nonTechnical");
  assert.equal(getPromptCategoryForTrack("unknown"), "technical");
});

test("getHandoffPrimaryActionLabel follows build -> copy -> preview progression", () => {
  assert.equal(
    getHandoffPrimaryActionLabel({ handoffPrompt: "", handoffCopied: false }),
    "Build Handoff Prompt"
  );
  assert.equal(
    getHandoffPrimaryActionLabel({ handoffPrompt: "Goal: ...", handoffCopied: false }),
    "Copy Handoff Prompt"
  );
  assert.equal(
    getHandoffPrimaryActionLabel({ handoffPrompt: "Goal: ...", handoffCopied: true }),
    "Preview 201 Skills"
  );
});
