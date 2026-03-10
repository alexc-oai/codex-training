import test from "node:test";
import assert from "node:assert/strict";

import { MISSION_TRACKS, ALL_MISSIONS } from "../src/content/missions.js";

test("mission tracks include technical and non-technical paths", () => {
  assert.ok(MISSION_TRACKS.technical);
  assert.ok(MISSION_TRACKS.nonTechnical);
});

test("each track has 4 missions with required fields", () => {
  for (const track of ["technical", "nonTechnical"]) {
    assert.equal(MISSION_TRACKS[track].length, 4);
    for (const mission of MISSION_TRACKS[track]) {
      assert.ok(mission.id);
      assert.ok(mission.title);
      assert.ok(mission.objective);
      assert.ok(mission.promptStarter);
      assert.ok(mission.learnOutcome);
      assert.ok(mission.capabilityTag);
      assert.ok(mission.demoUseCase);
      assert.ok(Array.isArray(mission.checklist));
      assert.ok(mission.checklist.length >= 2);
    }
  }
});

test("mission flow teaches ask, plan mode, scaffold, and handoff/share", () => {
  const technical = MISSION_TRACKS.technical;
  const nonTechnical = MISSION_TRACKS.nonTechnical;

  assert.match(technical[0].title, /ask/i);
  assert.match(nonTechnical[0].title, /ask/i);

  assert.match(technical[1].title, /plan mode/i);
  assert.match(nonTechnical[1].title, /plan mode/i);
  assert.match(technical[1].promptStarter, /use plan mode/i);
  assert.doesNotMatch(nonTechnical[1].promptStarter, /use plan mode/i);

  assert.match(technical[2].title, /scaffold/i);
  assert.match(nonTechnical[2].title, /web game/i);
  assert.match(nonTechnical[2].promptStarter, /single-file html/i);
  assert.match(
    nonTechnical[2].promptStarter,
    /signal snake|dead zone sweeper|plan match memory|tower tap rush/i
  );

  assert.match(technical[3].title, /handoff|share/i);
  assert.match(nonTechnical[3].title, /handoff|share/i);
  assert.match(nonTechnical[3].promptStarter, /html/i);
  assert.match(nonTechnical[3].promptStarter, /newspaper|magazine|economist|new york times/i);
});

test("non-technical mission prompts avoid explicit mode jargon while staying concrete", () => {
  const nonTechnical = MISSION_TRACKS.nonTechnical;

  assert.doesNotMatch(nonTechnical[0].promptStarter, /ask mode/i);
  assert.match(nonTechnical[0].promptStarter, /wow-factor|feasibility|judging/i);
  assert.doesNotMatch(nonTechnical[1].promptStarter, /use plan mode/i);
});

test("all mission IDs are unique across tracks", () => {
  const ids = ALL_MISSIONS.map((mission) => mission.id);
  const unique = new Set(ids);
  assert.equal(ids.length, unique.size);
});
