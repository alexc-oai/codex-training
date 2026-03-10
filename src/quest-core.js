const BADGES = [
  { id: "first-delegate", title: "First Delegate" },
  { id: "double-down", title: "Double Down" },
  { id: "prompt-pro", title: "Prompt Pro" },
  { id: "cross-functional", title: "Cross-Functional" }
];

export const ARTIFACT_STYLES = [
  { id: "default", label: "Default Export" },
  { id: "nyt", label: "NYT-Style Feature" },
  { id: "economist", label: "Economist-Style Brief" },
  { id: "gameLab", label: "Game Lab Concept" }
];

export function createInitialState() {
  return {
    activeTrack: "technical",
    completedMissionIds: [],
    points: 0,
    builtPrompts: 0,
    visitedTracks: ["technical"],
    badges: [],
    missionRunConfirmedById: {},
    missionEvidenceById: {},
    promptLabActionTaken: false,
    handoffCopied: false
  };
}

export function completeMission(state, missionId) {
  if (!missionId || state.completedMissionIds.includes(missionId)) {
    return { ...state };
  }

  return {
    ...state,
    completedMissionIds: [...state.completedMissionIds, missionId],
    points: state.points + 25
  };
}

export function calculateProgress(state, totalMissions) {
  if (!totalMissions || totalMissions <= 0) {
    return 0;
  }

  return Math.round((state.completedMissionIds.length / totalMissions) * 100);
}

export function computeBadges(metrics) {
  const badges = [];
  const completedCount = metrics.completedMissionIds.length;
  const hasCrossTrack =
    metrics.visitedTracks.includes("technical") &&
    metrics.visitedTracks.includes("nonTechnical");

  if (completedCount >= 1) {
    badges.push(BADGES[0]);
  }
  if (completedCount >= 2) {
    badges.push(BADGES[1]);
  }
  if (metrics.builtPrompts >= 1) {
    badges.push(BADGES[2]);
  }
  if (hasCrossTrack) {
    badges.push(BADGES[3]);
  }

  return badges;
}

export function buildPrompt(fields) {
  const required = [
    ["goal", "Goal"],
    ["context", "Context"],
    ["constraints", "Constraints"],
    ["doneWhen", "Done-When"]
  ];

  for (const [key, label] of required) {
    if (!fields[key] || !fields[key].trim()) {
      return {
        ok: false,
        error: `${label} is required before generating a prompt.`
      };
    }
  }

  return {
    ok: true,
    prompt: [
      `Goal: ${fields.goal.trim()}`,
      `Context: ${fields.context.trim()}`,
      `Constraints: ${fields.constraints.trim()}`,
      `Done-When: ${fields.doneWhen.trim()}`
    ].join("\n\n")
  };
}

export function serializeExport(payload) {
  const badgeTitles = (payload.badges || []).map((badge) => badge.title).join(", ");

  return [
    "# Codex Quest Artifact Export",
    "",
    `Track: ${payload.activeTrack}`,
    `Completed Missions: ${payload.completedMissionIds.length}`,
    `Points: ${payload.points}`,
    `Badges: ${badgeTitles || "None"}`,
    "",
    `## ${payload.artifactTitle}`,
    "",
    payload.artifactBody
  ].join("\n");
}

export function createQuickWinPrompt(track) {
  const scenarios = {
    technical: {
      goal:
        "In 5 minutes, use Ask mode to inspect this repo and identify the safest visible improvement to plan next.",
      context:
        "Assume I am new to this codebase. Focus on app structure, where the UI and calculations are wired together, and one practical win that can be scoped safely.",
      constraints:
        "Do not modify files yet. No large refactors. No new dependencies. Keep the recommendation scoped to one file or one tiny function path.",
      doneWhen:
        "Return: (1) plain-English repo explanation, (2) safest visible improvement, (3) why it matters, and (4) whether I should enter Plan Mode next."
    },
    nonTechnical: {
      goal:
        "In 5 minutes, turn this hackathon problem into 4 concepts and choose the strongest one to prototype.",
      context:
        "Assume I can provide a rough challenge, judging criteria, and team constraints. Audience is a mixed technical and non-technical team preparing for a hackathon and looking for a high-wow but feasible first build.",
      constraints:
        "Keep language plain. Avoid technical jargon where possible. Prioritize demo wow-factor, feasibility in 72 hours, and clarity for a mixed audience.",
      doneWhen:
        "Return: (1) 4 concepts, (2) the strongest concept, (3) a one-sentence pitch, and (4) the first thing we should plan next."
    }
  };

  const config = scenarios[track] || scenarios.nonTechnical;
  return buildPrompt(config);
}

export function getPromptCategoryForTrack(track) {
  if (track === "nonTechnical") {
    return "nonTechnical";
  }
  return "technical";
}

export function evaluatePromptLabReadiness(payload) {
  const generatedPrompt = typeof payload?.generatedPrompt === "string" ? payload.generatedPrompt : "";

  if (!generatedPrompt.trim()) {
    return {
      ready: false,
      reason: "Create a prompt before continuing."
    };
  }

  return {
    ready: true,
    reason: "Prompt created."
  };
}

export function getHandoffPrimaryActionLabel(payload) {
  const handoffPrompt = typeof payload?.handoffPrompt === "string" ? payload.handoffPrompt : "";
  const handoffCopied = Boolean(payload?.handoffCopied);

  if (!handoffPrompt.trim()) {
    return "Build Handoff Prompt";
  }

  if (!handoffCopied) {
    return "Copy Handoff Prompt";
  }

  return "Preview 201 Skills";
}

function normalizeText(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function extractSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractBullets(text, max = 3) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length >= max) {
    return lines.slice(0, max);
  }

  const sentences = extractSentences(text);
  if (sentences.length >= max) {
    return sentences.slice(0, max);
  }

  return [...lines, ...sentences].slice(0, max);
}

export function stylizeArtifact(payload) {
  const style = payload?.style || "default";
  const title = normalizeText(payload?.title, "Codex Quest Handoff");
  const body = normalizeText(
    payload?.body,
    "No summary text provided. Add your notes and run Style Studio again."
  );

  if (style === "default") {
    return body;
  }

  const dateLabel = new Date().toISOString().slice(0, 10);
  const sentences = extractSentences(body);
  const bullets = extractBullets(body, 3);
  const lead = sentences[0] || body;
  const supportLine = sentences[1] || lead;
  const closingLine = sentences[2] || supportLine;

  if (style === "nyt") {
    return [
      "# The Codex Times",
      "",
      `## ${title}`,
      `*By Codex Desk | ${dateLabel}*`,
      "",
      "### Lead",
      lead,
      "",
      `> "${supportLine}"`,
      "",
      "### Why this matters",
      ...bullets.map((point) => `- ${point}`),
      "",
      "### What happens next",
      closingLine
    ].join("\n");
  }

  if (style === "economist") {
    return [
      `# Briefing | ${title}`,
      "",
      `*Dateline: ${dateLabel}*`,
      "",
      "## Thesis",
      lead,
      "",
      "## Signals",
      ...bullets.map((point, index) => `${index + 1}. ${point}`),
      "",
      "## Recommendation",
      closingLine
    ].join("\n");
  }

  if (style === "gameLab") {
    return [
      `# Game Concept: ${title}`,
      "",
      "## Premise",
      lead,
      "",
      "## Core Loop",
      "1. Read scenario and choose a move.",
      "2. Receive instant score feedback tied to business impact.",
      "3. Iterate strategy under time constraints.",
      "",
      "## Win Condition",
      supportLine,
      "",
      "## MVP Scope (72 hours)",
      ...bullets.map((point) => `- ${point}`),
      "",
      "## Demo Moment",
      closingLine
    ].join("\n");
  }

  return body;
}

export function createGameDesignPrompt(seedText) {
  const seed = normalizeText(
    seedText,
    "Build a hackathon mini game about improving signal coverage or helping customers choose the right phone plan."
  );

  return buildPrompt({
    goal:
      "Design a browser-based mini game concept that can be scaffolded quickly and demoed during the hackathon.",
    context:
      `Seed idea: ${seed}\nAudience includes technical and non-technical participants judging creativity and practicality.`,
    constraints:
      "Keep controls simple, game length under 3 minutes, and implementation realistic for a small team in 72 hours. Prefer a one-screen web prototype with mock data or lightweight state.",
    doneWhen:
      "Return: game title, rules, core loop, scoring logic, MVP build brief, and one polished prompt to generate the first HTML prototype."
  });
}
