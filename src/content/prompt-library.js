export const PROMPT_CATEGORIES = ["technical", "nonTechnical", "hackathon"];

export const PROMPT_LIBRARY = [
  {
    id: "tech-ask-repo",
    category: "technical",
    title: "Ask the Repo",
    description: "Understand an unfamiliar repo before making changes.",
    goal: "Use Ask mode to explain this repo in plain English and identify the safest visible improvement to plan next.",
    context:
      "Assume I am seeing this codebase for the first time and need to orient quickly.",
    constraints:
      "Do not modify files yet. Keep the answer concrete and scoped.",
    doneWhen:
      "Return a module map, the key file path to inspect next, and one visible improvement worth planning."
  },
  {
    id: "tech-plan-safe-change",
    category: "technical",
    title: "Plan Mode Change Brief",
    description: "Use Plan Mode to de-risk a small implementation task.",
    goal:
      "Use Plan Mode to turn this repo task into the smallest safe implementation plan.",
    context:
      "I already know the change I want. I need a beginner-friendly build plan with clear file paths and checks.",
    constraints:
      "Do not modify files yet. Preserve existing behavior and keep the plan short.",
    doneWhen:
      "Return files to touch, ordered steps, risks, and exact verification commands."
  },
  {
    id: "tech-scaffold-slice",
    category: "technical",
    title: "Scaffold the First Slice",
    description: "Generate the smallest visible first version of a change.",
    goal:
      "Implement only the first useful slice of this planned change and explain what remains unfinished.",
    context:
      "I want something real on screen quickly, not a full finished feature.",
    constraints:
      "Keep the patch small, visible, beginner-friendly, and easy to review.",
    doneWhen:
      "Return files changed, what was implemented, how to run it, and the fastest next 3 improvements."
  },
  {
    id: "tech-dev-handoff",
    category: "technical",
    title: "Developer Handoff + Guardrails",
    description: "Turn a Codex session into something a teammate can pick up safely.",
    goal:
      "Create a developer handoff note for this Codex task and add one AGENTS.md guardrail for future runs.",
    context:
      "Another engineer may need to continue this work tomorrow with minimal extra context.",
    constraints:
      "Do not invent results. Keep the note concise and actionable.",
    doneWhen:
      "Return what changed, why it matters, how to verify it, open risks, next steps, and one reusable guardrail."
  },
  {
    id: "nontech-concept-picker",
    category: "nonTechnical",
    title: "Concept Picker",
    description: "Turn a rough problem into three candidate concepts.",
    goal:
      "Generate 4 hackathon concepts from this rough problem and choose the strongest one to prototype.",
    context:
      "Assume I can provide a rough challenge, judging criteria, and team constraints. Audience includes mixed technical and non-technical teammates who need a clear first direction.",
    constraints:
      "Keep language plain, avoid jargon, and prioritize demo wow-factor, feasibility in 72 hours, and clarity for a mixed audience.",
    doneWhen:
      "Return 4 concepts, the strongest concept, a one-sentence pitch, and the first thing we should plan next."
  },
  {
    id: "nontech-build-brief",
    category: "nonTechnical",
    title: "Prototype Build Brief",
    description: "Create a build brief instead of a long PRD.",
    goal: "Turn this concept into a prototype build brief for a mixed team.",
    context:
      "The team needs a practical MVP brief that is buildable in 72 hours.",
    constraints:
      "Do not write a long PRD. Keep it concrete, actionable, and demo-oriented.",
    doneWhen:
      "Return pitch, user, pain point, MVP scope, mock data, first-screen moment, work split, and a short judge demo script."
  },
  {
    id: "nontech-telecom-mini-mvp",
    category: "nonTechnical",
    title: "Tiny Telecom Web Game",
    description: "Turn a concept into a one-screen HTML web game that demos fast.",
    goal:
      "Scaffold a single-file HTML web game for this idea that feels impressive within the first 10 seconds.",
    context:
      "Choose a fast concept such as Signal Snake, Dead Zone Sweeper, Plan Match Memory, or Tower Tap Rush. Keep it telecom-friendly and easy to explain.",
    constraints:
      "No backend, no paid APIs, mock data only, and keep the code beginner-friendly.",
    doneWhen:
      "Return the HTML build prompt, what is real versus mocked, and the fastest next 3 improvements."
  },
  {
    id: "nontech-stakeholder-handoff",
    category: "nonTechnical",
    title: "Stakeholder Handoff Brief",
    description: "Package work into something a manager, judge, or partner can use.",
    goal:
      "Turn this Codex output into a stakeholder-ready HTML brief and separate 101-now work from 201/301-later work.",
    context:
      "Audience includes mixed technical and non-technical stakeholders who need the story, not just the raw output. The result should look like a polished newspaper or magazine page.",
    constraints:
      "Do not invent facts. Keep it crisp, recommendation-oriented, and deliver it as a single self-contained HTML file with simple inline CSS.",
    doneWhen:
      "Return a styled HTML artifact with objective, recommendation, owners, milestones, open questions, a clear now-versus-later split, and an Economist-style or New York Times-style presentation."
  },
  {
    id: "hackathon-judge-prototype",
    category: "hackathon",
    title: "Judge-Ready Prototype Prompt",
    description: "Go from plain-English brief to a tiny demoable app.",
    goal:
      "Take this hackathon brief and scaffold a tiny local prototype that feels impressive in the first 10 seconds.",
    context:
      "Audience is a mixed hackathon team that needs a fast, visible first version.",
    constraints:
      "No paid APIs. No internal systems. Prefer a one-screen prototype with mock data.",
    doneWhen:
      "Return a build prompt, what is real versus mocked, and the fastest next 3 upgrades."
  },
  {
    id: "hackathon-ui-from-brief",
    category: "hackathon",
    title: "UI From Brief",
    description: "Turn an idea brief into a visible first screen.",
    goal:
      "Create a polished first-screen UI from this brief and explain how a non-technical reviewer should give feedback.",
    context:
      "The team wants something they can see, react to, and refine immediately.",
    constraints:
      "Keep styling readable, the structure clean, and the scope small.",
    doneWhen:
      "Return the build prompt, what parts are approximate, and the fastest next 3 UI improvements."
  },
  {
    id: "hackathon-nyt-prompt",
    category: "hackathon",
    title: "NYT-Style Hackathon Brief Prompt",
    description: "Create a high-impact narrative artifact for leadership.",
    goal:
      "Transform this hackathon brief into an NYT-style feature with a headline, lead, pull quote, and why-it-matters section.",
    context:
      "Used for demo storytelling: make technical work legible and exciting for broad stakeholders.",
    constraints:
      "Preserve factual accuracy and keep length under one page.",
    doneWhen:
      "Output is presentation-ready and includes one clear call-to-action for next training steps."
  },
  {
    id: "hackathon-economist-prompt",
    category: "hackathon",
    title: "Economist-Style Strategy Prompt",
    description: "Turn notes into a crisp thesis-driven strategy brief.",
    goal:
      "Rewrite this project update as an Economist-style briefing with thesis, signals, implications, and recommendation.",
    context:
      "Audience is senior stakeholders deciding where to invest limited hackathon time.",
    constraints:
      "Keep tone analytical and concise; avoid unsupported claims.",
    doneWhen:
      "Output includes a clear thesis, evidence bullets, and a practical recommendation."
  },
  {
    id: "hackathon-game-prototype",
    category: "hackathon",
    title: "Signal Sprint Mini Game",
    description: "Turn a wireless or hackathon use case into a playable mini-game concept.",
    goal:
      "Design a browser-based mini game based on this wireless or hackathon use case and provide the first HTML MVP prompt.",
    context:
      "Audience is mixed technical and non-technical. Game should teach a wireless or phone-service use case while staying fun.",
    constraints:
      "Controls must be simple, game loop under 3 minutes, and scope realistic for a 72-hour sprint.",
    doneWhen:
      "Output includes rules, scoring logic, win condition, and a concrete Codex prompt to generate an HTML MVP."
  }
];
