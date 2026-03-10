const technical = [
  {
    id: "tech-launch",
    title: "Mission 1: Ask the Repo",
    objective: "Use Codex in Ask mode to understand an unfamiliar repo before making any changes.",
    learnOutcome: "You can get oriented quickly and identify a safe first move without touching code.",
    capabilityTag: "Ask mode + repo orientation",
    demoUseCase: "Explain app structure and surface one visible improvement worth planning",
    estMinutes: 5,
    promptStarter:
      "Use Ask mode first. Read this repository, explain the app structure in plain English, identify where the UI and calculations are wired together, and recommend the safest visible improvement to plan next.",
    checklist: [
      "Open a repo in Codex App, IDE, or CLI.",
      "Run one read-only Ask mode prompt.",
      "Capture one concrete recommendation with file pointers."
    ]
  },
  {
    id: "tech-agent-loop",
    title: "Mission 2: Plan Mode - Smallest Safe Change",
    objective: "Use Plan Mode to turn repo understanding into a concrete, low-risk implementation plan.",
    learnOutcome: "You can use Plan Mode to de-risk a change before coding.",
    capabilityTag: "Plan Mode + scoped implementation planning",
    demoUseCase: "Convert a visible improvement into a short build plan with verification steps",
    estMinutes: 8,
    promptStarter:
      "Use Plan Mode.\n\nGoal: Turn the chosen improvement into the smallest safe change.\nContext: Review the files you identified in Ask mode.\nConstraints: Do not modify files yet. Keep the plan beginner-friendly and preserve existing behavior.\nDone-When: Return a step-by-step plan with files to touch, risks, and exact verification commands.",
    checklist: [
      "Switch from Ask mode into Plan Mode.",
      "Reference files with clear context pointers.",
      "Capture a plan with risks and verification steps."
    ]
  },
  {
    id: "tech-sdlc",
    title: "Mission 3: Scaffold the First Version",
    objective: "Turn the plan into the smallest visible first version instead of a full finished feature.",
    learnOutcome: "You can get from plan to first implementation quickly without overbuilding.",
    capabilityTag: "Scaffold + explain",
    demoUseCase: "Small visible change with clear file diff and run instructions",
    estMinutes: 12,
    promptStarter:
      "Implement only the first useful slice of the planned change. Keep the patch small, beginner-friendly, and visible on screen. Then explain what changed, what still remains mocked or unfinished, and how to run or inspect the result.",
    checklist: [
      "Delegate one bounded scaffold task.",
      "Capture exact commands to run or inspect the result.",
      "Document what is implemented versus what is still next."
    ]
  },
  {
    id: "tech-handoff",
    title: "Mission 4: Developer Handoff + Guardrails",
    objective: "Package the result for another engineer and capture one reusable rule for future Codex runs.",
    learnOutcome: "You can turn a one-off Codex session into something the next engineer can trust and reuse.",
    capabilityTag: "Developer handoff + AGENTS.md guardrails",
    demoUseCase: "Shareable implementation brief with verification and one persistent repo rule",
    estMinutes: 5,
    promptStarter:
      "Create a developer handoff note with what changed, why it matters, how to verify, remaining risks, and next steps. Include one draft AGENTS.md rule that would help Codex avoid repeat mistakes next time.",
    checklist: [
      "Create a teammate-ready handoff summary.",
      "List next actions and verification steps.",
      "Draft one AGENTS.md guardrail rule.",
      "Export artifact."
    ]
  }
];

const nonTechnical = [
  {
    id: "nontech-launch",
    title: "Mission 1: Ask for Strong Concepts",
    objective: "Use Codex to turn a rough hackathon problem into a short list of strong concepts.",
    learnOutcome: "You can use plain language to get to a strong first concept quickly.",
    capabilityTag: "Idea shaping + concept selection",
    demoUseCase: "Generate several candidate concepts and pick the strongest one to plan",
    estMinutes: 5,
    promptStarter:
      "I am pasting a rough hackathon problem, judging criteria, and team constraints. Generate 4 concepts, score each on demo wow-factor, feasibility in 72 hours, and clarity for a mixed technical and non-technical audience. Pick the strongest concept, explain why it wins, and give me a one-sentence pitch plus the first thing we should plan next.",
    checklist: [
      "Paste a rough problem or brief.",
      "Run one plain-language concept prompt.",
      "Capture the strongest concept and why it won."
    ]
  },
  {
    id: "nontech-agent-loop",
    title: "Mission 2: Plan Mode - Prototype Build Brief",
    objective: "Use Plan Mode to convert the chosen concept into a build brief rather than a full PRD.",
    learnOutcome: "You can use Plan Mode to create a practical MVP brief that a mixed team can act on immediately.",
    capabilityTag: "Plan Mode + prototype build brief",
    demoUseCase: "Turn one concept into a 72-hour MVP brief for a tiny web app or mini game",
    estMinutes: 8,
    promptStarter:
      "Take the chosen concept and turn it into a prototype build brief.\n\nReturn:\n1. One-sentence pitch\n2. Target user\n3. Main pain point\n4. Core interaction\n5. 72-hour MVP scope\n6. Mock or sample data needed\n7. What should happen in the first 10 seconds of the demo\n8. Technical workstream\n9. Non-technical workstream\n10. 90-second judge demo script\n\nConstraints:\n- keep it demoable locally\n- no paid APIs\n- no internal systems\n- keep it beginner-friendly\n- recommend the smallest possible first version",
    checklist: [
      "Switch from Ask mode into Plan Mode.",
      "Generate a prototype build brief instead of a long PRD.",
      "Capture the smallest possible first version."
    ]
  },
  {
    id: "nontech-sdlc",
    title: "Mission 3: Scaffold a Tiny Web Game",
    objective: "Use the build brief to create a small, playable web game instead of a finished product.",
    learnOutcome: "You can turn a plain-English plan into a visible, playable artifact fast.",
    capabilityTag: "Scaffold + one-screen web game",
    demoUseCase: "Single-file HTML web game with one quick interaction loop",
    estMinutes: 12,
    promptStarter:
      "Using the plan above, create a single-file HTML web game in this folder.\n\nChoose one fast game concept and build only the first playable slice:\n- Signal Snake: a snake-style game where you collect signal boosts and avoid dead zones\n- Dead Zone Sweeper: a minesweeper-style grid where you reveal safe coverage tiles\n- Plan Match Memory: a memory game matching customer needs to the right phone plan\n- Tower Tap Rush: a quick reaction game where you rebalance overloaded towers before outages\n\nBuild:\n- one polished first screen\n- one interaction loop that works within 10 seconds\n- mock data only\n- beginner-friendly code\n\nConstraints:\n- no backend\n- no paid APIs\n- keep everything in one HTML file if possible\n- make it easy to demo locally\n\nReturn:\n- what you built\n- how to run it\n- what is real versus mocked\n- the fastest next 3 improvements",
    checklist: [
      "Generate a tiny first playable version from the plan.",
      "Keep the game visible and demoable.",
      "Capture what is real versus mocked."
    ]
  },
  {
    id: "nontech-handoff",
    title: "Mission 4: Stakeholder Handoff + Style",
    objective: "Turn the prototype output into a brief that is ready for judges, leadership, or the rest of the team.",
    learnOutcome: "You can package a Codex result into a polished story, not just a raw output.",
    capabilityTag: "Stakeholder handoff + styled brief",
    demoUseCase: "Judge-ready or leader-ready brief with 101 now / 201 later split",
    estMinutes: 5,
    promptStarter:
      "Turn this output into a stakeholder-ready handoff as a single self-contained HTML page that looks like a newspaper or magazine feature. Include objective, owners, milestones, open questions, recommendation, what was built, and what is real versus mocked. Also add two sections: what we can do now in 101, and what should be deferred to 201/301. Style it in an Economist-style or New York Times-style voice with simple inline CSS.",
    checklist: [
      "Create a concise stakeholder-ready HTML brief.",
      "List owners and due dates.",
      "Separate 101 outcomes from 201/301 advanced asks.",
      "Apply a style transform."
    ]
  }
];

export const MISSION_TRACKS = {
  technical,
  nonTechnical
};

export const ALL_MISSIONS = [...technical, ...nonTechnical];
