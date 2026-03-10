import {
  createInitialState,
  completeMission,
  calculateProgress,
  computeBadges,
  buildPrompt,
  createQuickWinPrompt,
  stylizeArtifact,
  createGameDesignPrompt,
  ARTIFACT_STYLES,
  getPromptCategoryForTrack,
  evaluatePromptLabReadiness,
  getHandoffPrimaryActionLabel
} from "./quest-core.js";
import { MISSION_TRACKS, ALL_MISSIONS } from "./content/missions.js";
import { PROMPT_CATEGORIES, PROMPT_LIBRARY } from "./content/prompt-library.js";

const STORAGE_KEY = "codex-quest-state-v3";

const TRACK_HINTS = {
  technical: "Technical path selected",
  nonTechnical: "Non-technical path selected"
};

const PROMPT_CATEGORY_LABELS = {
  technical: "Technical",
  nonTechnical: "Non-Technical",
  hackathon: "Mixed / Hackathon"
};

const PROMPT_SECTION_KEYS = {
  Goal: "goal",
  Context: "context",
  Constraints: "constraints",
  "Done-When": "doneWhen"
};

const DEFAULT_PROMPT_DRAFT = Object.freeze({
  goal: "",
  context: "",
  constraints: "",
  doneWhen: ""
});

const ARTIFACT_STYLE_IDS = new Set(ARTIFACT_STYLES.map((style) => style.id));

const FLOW_STEPS = [
  {
    id: "intro",
    label: "Ask",
    learn: "Learn: ask Codex for a strong first pass in plain language.",
    why: "Why it matters: a good first question creates confidence fast for mixed audiences.",
    feature: "Track selection + quick Ask prompt",
    task: "Select technical/non-technical track, then generate your 5-minute Ask prompt.",
    success: "Track selected and first Ask prompt ready.",
    readyHint: "Select a track, then generate your Ask prompt."
  },
  {
    id: "missions",
    label: "Plan + Scaffold",
    learn: "Learn: use Plan Mode, then turn the plan into a visible first version.",
    why: "Why it matters: planning builds trust and scaffolding creates the wow moment.",
    feature: "Mission prompts + proof of progress",
    task: "Complete all missions in your selected track.",
    success: "All missions in selected track complete.",
    readyHint: "Complete every mission in your selected track to continue to Prompt Lab."
  },
  {
    id: "prompts",
    label: "Prompt Makeover",
    learn: "Learn: turn a weak prompt into a strong one with clear success criteria.",
    why: "Why it matters: prompt quality is the easiest lever to improve Codex output.",
    feature: "Prompt builder + optional role-based examples",
    task: "Create one strong prompt, then continue to Handoff when it looks right.",
    success: "Prompt created and ready to share.",
    readyHint: "Create a prompt to continue to Handoff."
  },
  {
    id: "handoff",
    label: "Share + Next",
    learn: "Learn: package outcomes into a polished artifact for teammates or stakeholders.",
    why: "Why it matters: shareable outputs turn one user into broader team adoption.",
    feature: "Handoff prompt + style transform + 201 readiness preview",
    task: "Build handoff, optionally style it, then preview 201 skills.",
    success: "You are 101-ready with a visible result and explicit next actions.",
    readyHint: "Build and copy your handoff prompt."
  }
];

const FLOW_STEP_IDS = new Set(FLOW_STEPS.map((step) => step.id));

const ui = {
  flowStepLabel: document.querySelector("#flow-step-label"),
  flowStepProgress: document.querySelector("#flow-step-progress"),
  flowStepLearn: document.querySelector("#flow-step-learn"),
  flowStepWhy: document.querySelector("#flow-step-why"),
  flowStepFeature: document.querySelector("#flow-step-feature"),
  flowStepTask: document.querySelector("#flow-step-task"),
  flowStepSuccess: document.querySelector("#flow-step-success"),
  flowStepStatus: document.querySelector("#flow-step-status"),
  flowBackBtn: document.querySelector("#flow-back-btn"),
  flowActionBtn: document.querySelector("#flow-action-btn"),
  flowSteps: Array.from(document.querySelectorAll(".flow-step")),
  trackButtons: Array.from(document.querySelectorAll(".track-btn")),
  trackFocus: document.querySelector(".track-focus"),
  trackChoiceStatus: document.querySelector("#track-choice-status"),
  introAgenda: document.querySelector("#intro-agenda"),
  toggleAgendaBtn: document.querySelector("#toggle-agenda-btn"),
  trackHint: document.querySelector("#track-hint"),
  missionList: document.querySelector("#mission-list"),
  missionTitle: document.querySelector("#mission-title"),
  missionObjective: document.querySelector("#mission-objective"),
  missionCapability: document.querySelector("#mission-capability"),
  missionUseCase: document.querySelector("#mission-use-case"),
  missionTime: document.querySelector("#mission-time"),
  missionStatus: document.querySelector("#mission-status"),
  missionStarter: document.querySelector("#mission-starter"),
  copyMissionPromptBtn: document.querySelector("#copy-mission-prompt-btn"),
  missionRanCheckbox: document.querySelector("#mission-ran-checkbox"),
  missionEvidenceInput: document.querySelector("#mission-evidence-input"),
  missionCompleteBtn: document.querySelector("#mission-complete-btn"),
  missionFeedback: document.querySelector("#mission-feedback"),
  progressValue: document.querySelector("#progress-value"),
  progressFill: document.querySelector("#progress-fill"),
  progressCaption: document.querySelector("#progress-caption"),
  pointsValue: document.querySelector("#points-value"),
  badgeList: document.querySelector("#badge-list"),
  quickWinOutput: document.querySelector("#quick-win-output"),
  promptForm: document.querySelector("#prompt-form"),
  goalInput: document.querySelector("#goal-input"),
  contextInput: document.querySelector("#context-input"),
  constraintsInput: document.querySelector("#constraints-input"),
  doneWhenInput: document.querySelector("#done-when-input"),
  gamePromptBtn: document.querySelector("#game-prompt-btn"),
  usePromptBtn: document.querySelector("#use-prompt-btn"),
  generatedPrompt: document.querySelector("#generated-prompt"),
  promptFeedback: document.querySelector("#prompt-feedback"),
  libraryCategoryTabs: document.querySelector("#library-category-tabs"),
  promptLibraryList: document.querySelector("#prompt-library-list"),
  exportBtn: document.querySelector("#export-btn"),
  copyHandoffBtn: document.querySelector("#copy-handoff-btn"),
  exportFeedback: document.querySelector("#export-feedback"),
  handoffPromptOutput: document.querySelector("#handoff-prompt-output"),
  artifactTitle: document.querySelector("#artifact-title"),
  artifactBody: document.querySelector("#artifact-body"),
  artifactStyle: document.querySelector("#artifact-style"),
  styleArtifactBtn: document.querySelector("#style-artifact-btn"),
  styleFeedback: document.querySelector("#style-feedback"),
  stylePreview: document.querySelector("#style-preview"),
  facilitatorToggle: document.querySelector("#facilitator-toggle"),
  facilitatorBody: document.querySelector("#facilitator-body"),
  sessionCode: document.querySelector("#session-code"),
  facCompletion: document.querySelector("#fac-completion"),
  facPrompts: document.querySelector("#fac-prompts"),
  facTrack: document.querySelector("#fac-track"),
  facNext: document.querySelector("#fac-next"),
  readinessPill: document.querySelector("#readiness-pill"),
  readinessMessage: document.querySelector("#readiness-message"),
  toggle201PreviewBtn: document.querySelector("#toggle-201-preview-btn"),
  preview201: document.querySelector("#preview-201"),
  nextActions: document.querySelector("#next-actions"),
  reflectionNotes: document.querySelector("#reflection-notes")
};

const missionMap = new Map(ALL_MISSIONS.map((mission) => [mission.id, mission]));
const promptLibraryMap = new Map(PROMPT_LIBRARY.map((prompt) => [prompt.id, prompt]));

const state = loadState();
state.badges = computeBadges(state);

hydrateInputsFromState();
bindEvents();
render();

function loadState() {
  const base = {
    ...createInitialState(),
    selectedMissionByTrack: {
      technical: MISSION_TRACKS.technical[0].id,
      nonTechnical: MISSION_TRACKS.nonTechnical[0].id
    },
    generatedPrompt: "",
    quickWinPrompt: "",
    promptDraft: { ...DEFAULT_PROMPT_DRAFT },
    activePromptCategory: "technical",
    activeFlowStep: "intro",
    artifactStyle: "default",
    styledPreviewText: "",
    handoffPrompt: "",
    reflectionNotes: "",
    facilitatorEnabled: false,
    sessionCode: "QUEST-101",
    trackConfirmed: false,
    preview201Open: false
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return base;
    }

    const parsed = JSON.parse(raw);
    const resolvedPromptCategory = PROMPT_CATEGORIES.includes(parsed.activePromptCategory)
      ? parsed.activePromptCategory
      : base.activePromptCategory;
    const resolvedArtifactStyle = ARTIFACT_STYLE_IDS.has(parsed.artifactStyle)
      ? parsed.artifactStyle
      : base.artifactStyle;
    const resolvedFlowStep = FLOW_STEP_IDS.has(parsed.activeFlowStep)
      ? parsed.activeFlowStep
      : base.activeFlowStep;

    return {
      ...base,
      ...parsed,
      selectedMissionByTrack: {
        ...base.selectedMissionByTrack,
        ...(parsed.selectedMissionByTrack || {})
      },
      missionRunConfirmedById: parsed.missionRunConfirmedById || {},
      missionEvidenceById: parsed.missionEvidenceById || {},
      promptDraft: normalizePromptFields(parsed.promptDraft),
      activePromptCategory: resolvedPromptCategory,
      activeFlowStep: resolvedFlowStep,
      artifactStyle: resolvedArtifactStyle,
      styledPreviewText:
        typeof parsed.styledPreviewText === "string" ? parsed.styledPreviewText : "",
      handoffPrompt: typeof parsed.handoffPrompt === "string" ? parsed.handoffPrompt : "",
      trackConfirmed: Boolean(parsed.trackConfirmed),
      preview201Open: Boolean(parsed.preview201Open),
      promptLabActionTaken: Boolean(parsed.promptLabActionTaken),
      handoffCopied: Boolean(parsed.handoffCopied),
      visitedTracks:
        Array.isArray(parsed.visitedTracks) && parsed.visitedTracks.length
          ? parsed.visitedTracks
          : ["technical"]
    };
  } catch {
    return base;
  }
}

function normalizePromptFields(fields) {
  const source = fields || {};

  return {
    goal: typeof source.goal === "string" ? source.goal : "",
    context: typeof source.context === "string" ? source.context : "",
    constraints: typeof source.constraints === "string" ? source.constraints : "",
    doneWhen: typeof source.doneWhen === "string" ? source.doneWhen : ""
  };
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op for environments without localStorage access
  }
}

function bindEvents() {
  ui.flowBackBtn.addEventListener("click", () => moveFlowStep(-1));
  ui.flowActionBtn.addEventListener("click", () => {
    void runFlowPrimaryAction();
  });
  ui.toggleAgendaBtn.addEventListener("click", () => {
    const isExpanded = ui.toggleAgendaBtn.getAttribute("aria-expanded") === "true";
    ui.toggleAgendaBtn.setAttribute("aria-expanded", String(!isExpanded));
    ui.introAgenda.classList.toggle("is-hidden", isExpanded);
    ui.toggleAgendaBtn.textContent = isExpanded ? "See Full Agenda" : "Hide Full Agenda";
  });

  for (const button of ui.trackButtons) {
    button.addEventListener("click", () => switchTrack(button.dataset.track));
  }

  ui.missionList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-mission-id]");
    if (!card) {
      return;
    }

    const missionId = card.dataset.missionId;
    const trackMissions = getActiveMissions();
    const missionIndex = trackMissions.findIndex((mission) => mission.id === missionId);

    if (isMissionLocked(trackMissions, missionIndex)) {
      setMessage(ui.missionFeedback, "Finish the previous mission to unlock this one.", "danger");
      return;
    }

    state.selectedMissionByTrack[state.activeTrack] = missionId;
    setMessage(ui.missionFeedback, "");
    persist();
    render();
  });

  ui.copyMissionPromptBtn.addEventListener("click", async () => {
    const prompt = getSelectedMission().promptStarter;
    try {
      await navigator.clipboard.writeText(prompt);
      setMessage(
        ui.missionFeedback,
        "Mission prompt copied. Paste it into Codex and run it.",
        "success"
      );
    } catch {
      setMessage(
        ui.missionFeedback,
        "Copy failed in this browser. Select and copy from Prompt Starter manually.",
        "danger"
      );
    }
  });

  if (ui.missionRanCheckbox) {
    ui.missionRanCheckbox.addEventListener("change", () => {
      const missionId = getSelectedMission().id;
      state.missionRunConfirmedById[missionId] = ui.missionRanCheckbox.checked;
      persist();
      renderMissionDetail();
      renderFlow();
    });
  }

  ui.missionEvidenceInput.addEventListener("input", () => {
    const missionId = getSelectedMission().id;
    state.missionEvidenceById[missionId] = ui.missionEvidenceInput.value;
    persist();
    renderMissionDetail();
    renderFlow();
  });

  ui.missionCompleteBtn.addEventListener("click", () => {
    const completed = completeSelectedMission();
    if (completed && getFlowReadiness("missions").ready) {
      renderFlow();
    }
  });

  ui.promptForm.addEventListener("input", () => {
    state.promptDraft = readPromptFieldsFromForm();
    persist();
  });

  ui.promptForm.addEventListener("submit", (event) => {
    event.preventDefault();
    generatePrompt(readPromptFieldsFromForm(), "Prompt created.");
  });

  ui.gamePromptBtn.addEventListener("click", () => {
    const seed = [
      ui.goalInput.value.trim(),
      ui.contextInput.value.trim(),
      ui.artifactBody.value.trim()
    ]
      .filter(Boolean)
      .join("\n\n");
    const result = createGameDesignPrompt(seed);

    if (!result.ok) {
      setMessage(ui.promptFeedback, result.error, "danger");
      return;
    }

    state.generatedPrompt = result.prompt;
    state.promptDraft = normalizePromptFields(extractPromptFields(result.prompt));
    state.builtPrompts += 1;
    state.promptLabActionTaken = false;
    state.badges = computeBadges(state);
    state.activePromptCategory = "hackathon";
    syncPromptFieldsToForm(state.promptDraft);
    setMessage(
      ui.promptFeedback,
      "Game variant generated. Optional path for creative demo moments.",
      "success"
    );
    persist();
    render();
  });

  ui.usePromptBtn.addEventListener("click", () => {
    void runUsePromptAction();
  });

  ui.libraryCategoryTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-category]");
    if (!tab) {
      return;
    }

    const category = tab.dataset.category;
    if (!PROMPT_CATEGORIES.includes(category)) {
      return;
    }

    state.activePromptCategory = category;
    persist();
    renderPromptLibraryTabs();
    renderPromptLibraryCards();
  });

  ui.promptLibraryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-library-id]");
    if (!button) {
      return;
    }
    applyLibraryPrompt(button.dataset.libraryId);
  });

  ui.artifactStyle.addEventListener("change", () => {
    const nextStyle = ui.artifactStyle.value;
    state.artifactStyle = ARTIFACT_STYLE_IDS.has(nextStyle) ? nextStyle : "default";
    persist();
  });

  ui.styleArtifactBtn.addEventListener("click", () => {
    const title = ui.artifactTitle.value.trim() || "Codex Quest Handoff";
    const body =
      ui.artifactBody.value.trim() ||
      "No artifact body provided yet. Add notes first, then apply a style.";
    const styled = stylizeArtifact({
      style: state.artifactStyle,
      title,
      body
    });

    state.styledPreviewText = styled;
    ui.artifactBody.value = styled;
    setMessage(ui.styleFeedback, "Style applied. Preview and export when ready.", "success");

    if (state.artifactStyle === "gameLab") {
      const gamePrompt = createGameDesignPrompt(styled);
      if (gamePrompt.ok) {
        state.generatedPrompt = gamePrompt.prompt;
        state.promptDraft = normalizePromptFields(extractPromptFields(gamePrompt.prompt));
        state.builtPrompts += 1;
        state.badges = computeBadges(state);
        syncPromptFieldsToForm(state.promptDraft);
        setMessage(
          ui.promptFeedback,
          "Game Lab style applied and a game-build prompt is ready in Prompt Makeover.",
          "success"
        );
      }
    }

    persist();
    render();
  });

  ui.exportBtn.addEventListener("click", () => {
    runExportAction();
  });

  ui.copyHandoffBtn.addEventListener("click", () => {
    void runCopyHandoffAction();
  });

  ui.facilitatorToggle.addEventListener("change", () => {
    state.facilitatorEnabled = ui.facilitatorToggle.checked;
    persist();
    renderFacilitator();
  });

  ui.sessionCode.addEventListener("input", () => {
    state.sessionCode = ui.sessionCode.value;
    persist();
  });

  ui.reflectionNotes.addEventListener("input", () => {
    state.reflectionNotes = ui.reflectionNotes.value;
    persist();
  });

  ui.toggle201PreviewBtn.addEventListener("click", () => {
    state.preview201Open = !state.preview201Open;
    persist();
    renderReadiness();
  });
}

function setMessage(element, message, tone = "muted") {
  element.textContent = message;
  if (tone === "success") {
    element.style.color = "var(--success)";
    return;
  }
  if (tone === "danger") {
    element.style.color = "var(--danger)";
    return;
  }
  element.style.color = "var(--ink-soft)";
}

function runQuickWinAction() {
  if (!state.trackConfirmed) {
    renderFlowStatus(false, "Choose Technical or Non-Technical track first.");
    ui.trackFocus.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  const result = createQuickWinPrompt(state.activeTrack);
  if (!result.ok) {
    setMessage(ui.promptFeedback, result.error, "danger");
    return false;
  }

  state.quickWinPrompt = result.prompt;
  state.generatedPrompt = result.prompt;
  state.promptDraft = normalizePromptFields(extractPromptFields(result.prompt));
  state.promptLabActionTaken = false;
  state.builtPrompts += 1;
  state.badges = computeBadges(state);
  state.activePromptCategory = getPromptCategoryForTrack(state.activeTrack);
  syncPromptFieldsToForm(state.promptDraft);

  if (!ui.artifactBody.value.trim()) {
    ui.artifactBody.value = `Quick Win Prompt:\n\n${result.prompt}`;
  }

  setMessage(
    ui.promptFeedback,
    "Ask prompt generated from your selected track and loaded into Prompt Makeover.",
    "success"
  );
  persist();
  render();
  return true;
}

function completeSelectedMission() {
  const mission = getSelectedMission();
  const alreadyComplete = state.completedMissionIds.includes(mission.id);
  if (alreadyComplete) {
    setMessage(ui.missionFeedback, "Mission already complete. Continue to Prompt Lab.", "success");
    return getFlowReadiness("missions").ready;
  }

  if (!hasMissionEvidence(mission.id)) {
    setMessage(
      ui.missionFeedback,
      "Add one proof point from Codex before completing this mission.",
      "danger"
    );
    renderFlow();
    return false;
  }

  const nextState = completeMission(state, mission.id);
  state.completedMissionIds = nextState.completedMissionIds;
  state.points = nextState.points;
  state.badges = computeBadges(state);

  const nextMissionId = findNextMissionId(state.activeTrack);
  if (nextMissionId) {
    state.selectedMissionByTrack[state.activeTrack] = nextMissionId;
    setMessage(ui.missionFeedback, "Mission complete. Next mission loaded.", "success");
  } else {
    setMessage(
      ui.missionFeedback,
      "All missions complete. Continue to Prompt Lab when you're ready.",
      "success"
    );
  }

  persist();
  render();
  return true;
}

function runExportAction() {
  const artifactTitle = ui.artifactTitle.value.trim() || "Codex Quest Handoff";
  const artifactBody =
    ui.artifactBody.value.trim() || "Add your key outcomes before building the handoff prompt.";
  const activeTrackMissions = getActiveMissions();
  const completedOnTrack = activeTrackMissions.filter((mission) =>
    state.completedMissionIds.includes(mission.id)
  );

  const audienceLabel =
    state.activeTrack === "nonTechnical" ? "stakeholder-ready handoff" : "teammate-ready handoff";
  const nonTechnicalStyleDirection =
    state.artifactStyle === "nyt"
      ? "Style it like a New York Times-style feature."
      : state.artifactStyle === "economist"
        ? "Style it like an Economist-style briefing."
        : "Style it like a polished newspaper or magazine feature.";

  const handoffPrompt = buildPrompt({
    goal: `Create a ${audienceLabel} for "${artifactTitle}" from this Codex 101 session.`,
    context:
      `Track: ${state.activeTrack}\n` +
      `Completed missions on track: ${completedOnTrack.length}/${activeTrackMissions.length}\n` +
      `Session summary:\n${artifactBody}`,
    constraints:
      "Do not invent facts. Keep language clear for both technical and non-technical readers. Include unresolved risks, owners, and what is real versus mocked when relevant.",
    doneWhen:
      state.activeTrack === "nonTechnical"
        ? `Return a single self-contained HTML document with simple inline CSS. Include sections for: objective, recommendation, what was built, what is real versus mocked, owners, open questions, and what belongs in 101 now versus 201 later. ${nonTechnicalStyleDirection}`
        : "Return sections for: what was built, why it matters, validation done, open risks, owner handoff, and exact next steps for 201."
  });

  state.handoffPrompt = handoffPrompt.prompt;
  state.handoffCopied = false;
  ui.handoffPromptOutput.textContent = handoffPrompt.prompt;
  persist();
  render();

  setMessage(
    ui.exportFeedback,
    `Handoff prompt built. Paste this into Codex to generate your final ${audienceLabel}.`,
    "success"
  );
  return true;
}

async function runUsePromptAction() {
  const prompt = state.generatedPrompt.trim();
  if (!prompt) {
    setMessage(ui.promptFeedback, "Create a prompt first, then use it in Codex.", "danger");
    return false;
  }

  try {
    await navigator.clipboard.writeText(prompt);
    setMessage(ui.promptFeedback, "Prompt copied. Paste and run it in Codex now.", "success");
  } catch {
    setMessage(
      ui.promptFeedback,
      "Copy failed in this browser. Select and copy from Generated Prompt manually.",
      "danger"
    );
  }
  state.promptLabActionTaken = true;
  persist();
  renderFlow();
  return true;
}

async function runCopyHandoffAction() {
  const handoff = state.handoffPrompt.trim();
  if (!handoff) {
    setMessage(ui.exportFeedback, "Build a handoff prompt first, then copy it.", "danger");
    return false;
  }
  try {
    await navigator.clipboard.writeText(handoff);
    setMessage(ui.exportFeedback, "Handoff prompt copied. Paste it into Codex.", "success");
  } catch {
    setMessage(
      ui.exportFeedback,
      "Copy failed in this browser. Select the prompt below and copy manually.",
      "danger"
    );
  }
  state.handoffCopied = true;
  persist();
  renderFlow();
  return true;
}

async function runFlowPrimaryAction() {
  const step = state.activeFlowStep;

  if (step === "intro") {
    if (!state.trackConfirmed) {
      renderFlowStatus(false, "Choose Technical or Non-Technical track before continuing.");
      ui.trackFocus.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const ready = getFlowReadiness("intro").ready;
    if (!ready) {
      const generated = runQuickWinAction();
      if (!generated) {
        return;
      }
      return;
    }
    setFlowStep("missions");
    return;
  }

  if (step === "missions") {
    setFlowStep("prompts");
    return;
  }

  if (step === "prompts") {
    const readiness = evaluatePromptLabReadiness({
      generatedPrompt: state.generatedPrompt,
      promptLabActionTaken: state.promptLabActionTaken
    });

    if (!state.generatedPrompt.trim()) {
      const generated = generatePrompt(
        readPromptFieldsFromForm(),
        "Prompt created."
      );
      if (!generated) {
        renderFlowStatus(false, "Fill all 4 prompt fields before continuing.");
        return;
      }
      return;
    }

    if (!readiness.ready) {
      await runUsePromptAction();
      return;
    }

    setFlowStep("handoff");
    return;
  }

  const handoffLabel = getHandoffPrimaryActionLabel({
    handoffPrompt: state.handoffPrompt,
    handoffCopied: state.handoffCopied
  });

  if (handoffLabel === "Build Handoff Prompt") {
    runExportAction();
    return;
  }

  if (handoffLabel === "Copy Handoff Prompt") {
    await runCopyHandoffAction();
    return;
  }

  state.preview201Open = true;
  persist();
  renderReadiness();
  ui.preview201.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getFlowPrimaryActionConfig(stepId, stepReadiness) {
  if (stepId === "intro") {
    if (!state.trackConfirmed) {
      return {
        label: "Choose Track First",
        disabled: false
      };
    }
    if (!stepReadiness.ready) {
      return {
        label: "Generate Starter Prompt",
        disabled: false
      };
    }
    return {
      label: "Start Mission 1",
      disabled: false
    };
  }

  if (stepId === "missions") {
    if (stepReadiness.ready) {
      return {
        label: "Continue to Prompt Lab",
        disabled: false
      };
    }
    return {
      label: "Preview Prompt Lab",
      disabled: false
    };
  }

  if (stepId === "prompts") {
    const readiness = evaluatePromptLabReadiness({
      generatedPrompt: state.generatedPrompt,
      promptLabActionTaken: state.promptLabActionTaken
    });

    if (!state.generatedPrompt.trim()) {
      return {
        label: "Create Prompt",
        disabled: false
      };
    }

    if (!readiness.ready) {
      return {
        label: "Use Prompt in Codex",
        disabled: false
      };
    }

    return {
      label: "Continue to Handoff",
      disabled: false
    };
  }

  return {
    label: getHandoffPrimaryActionLabel({
      handoffPrompt: state.handoffPrompt,
      handoffCopied: state.handoffCopied
    }),
    disabled: false
  };
}

function moveFlowStep(direction) {
  const currentIndex = FLOW_STEPS.findIndex((step) => step.id === state.activeFlowStep);
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= FLOW_STEPS.length) {
    return;
  }
  setFlowStep(FLOW_STEPS[nextIndex].id);
}

function setFlowStep(stepId) {
  if (!FLOW_STEP_IDS.has(stepId)) {
    return;
  }

  if (stepId === "prompts" && state.activeFlowStep !== "prompts") {
    state.generatedPrompt = "";
    state.promptLabActionTaken = false;
  }

  state.activeFlowStep = stepId;
  persist();
  render();
}

function getFlowReadiness(stepId) {
  const step = FLOW_STEPS.find((entry) => entry.id === stepId);
  if (!step) {
    return { ready: false, hint: "Unknown step." };
  }

  if (stepId === "intro") {
    const ready = Boolean(
      state.trackConfirmed && state.quickWinPrompt && state.quickWinPrompt.trim()
    );
    return { ready, hint: step.readyHint };
  }

  if (stepId === "missions") {
    const trackMissions = getActiveMissions();
    const completedCount = trackMissions.filter((mission) =>
      state.completedMissionIds.includes(mission.id)
    ).length;
    const ready = trackMissions.every((mission) => state.completedMissionIds.includes(mission.id));
    return {
      ready,
      hint: ready
        ? step.readyHint
        : `Complete all missions in your track (${completedCount}/${trackMissions.length}).`
    };
  }

  if (stepId === "prompts") {
    const readiness = evaluatePromptLabReadiness({
      generatedPrompt: state.generatedPrompt,
      promptLabActionTaken: state.promptLabActionTaken
    });
    return { ready: readiness.ready, hint: readiness.reason };
  }

  if (stepId === "handoff") {
    if (!state.handoffPrompt.trim()) {
      return { ready: false, hint: "Build your handoff prompt to continue." };
    }
    if (!state.handoffCopied) {
      return { ready: false, hint: "Copy your handoff prompt to finish 101." };
    }
    return { ready: true, hint: step.readyHint };
  }

  return { ready: false, hint: step.readyHint };
}

function getMaxUnlockedFlowIndex() {
  let unlockedIndex = 0;

  for (let index = 0; index < FLOW_STEPS.length - 1; index += 1) {
    const readiness = getFlowReadiness(FLOW_STEPS[index].id);
    if (!readiness.ready) {
      break;
    }
    unlockedIndex = index + 1;
  }

  return unlockedIndex;
}

function renderFlowStatus(ready, text) {
  ui.flowStepStatus.textContent = ready ? `Ready: ${text}` : `Do this next: ${text}`;
  ui.flowStepStatus.classList.toggle("is-ready", ready);
  ui.flowStepStatus.classList.toggle("is-pending", !ready);
}

function getFlowStatusConfig(stepId, stepReadiness, actionLabel) {
  if (stepId === "intro") {
    if (!state.trackConfirmed) {
      return { ready: false, text: "Choose a track to enable your starter prompt." };
    }
    if (!stepReadiness.ready) {
      return { ready: false, text: `${actionLabel} to continue.` };
    }
    return { ready: true, text: "Starter prompt ready. Start Mission 1 when you are ready." };
  }

  if (stepId === "missions") {
    if (stepReadiness.ready) {
      return { ready: true, text: "All missions complete. Continue to Prompt Lab." };
    }
    return {
      ready: false,
      text: "Complete your remaining missions or preview Prompt Lab now."
    };
  }

  if (stepId === "prompts") {
    if (!state.generatedPrompt.trim()) {
      return { ready: false, text: `${actionLabel} to build your next prompt.` };
    }
    if (!stepReadiness.ready) {
      return { ready: false, text: `${actionLabel} once your prompt looks right.` };
    }
    return { ready: true, text: "Prompt ready. Continue to Handoff." };
  }

  if (!state.handoffPrompt.trim()) {
    return { ready: false, text: "Build Handoff Prompt to package this work." };
  }
  if (!state.handoffCopied) {
    return { ready: false, text: "Copy Handoff Prompt to finish 101." };
  }
  return { ready: true, text: "101 complete. Preview 201 Skills when you are ready." };
}

function switchTrack(track) {
  if (!MISSION_TRACKS[track]) {
    return;
  }

  state.activeTrack = track;
  state.activePromptCategory = getPromptCategoryForTrack(track);
  state.trackConfirmed = true;
  if (!state.visitedTracks.includes(track)) {
    state.visitedTracks = [...state.visitedTracks, track];
  }

  state.badges = computeBadges(state);
  setMessage(ui.missionFeedback, "");
  persist();
  render();
}

function readPromptFieldsFromForm() {
  const formData = new FormData(ui.promptForm);

  return normalizePromptFields({
    goal: formData.get("goal"),
    context: formData.get("context"),
    constraints: formData.get("constraints"),
    doneWhen: formData.get("doneWhen")
  });
}

function syncPromptFieldsToForm(fields) {
  ui.goalInput.value = fields.goal;
  ui.contextInput.value = fields.context;
  ui.constraintsInput.value = fields.constraints;
  ui.doneWhenInput.value = fields.doneWhen;
}

function extractPromptFields(promptText) {
  const fields = { ...DEFAULT_PROMPT_DRAFT };
  const sections = String(promptText || "").split(/\n{2,}/);

  for (const section of sections) {
    const [label, ...valueParts] = section.split(":");
    const key = PROMPT_SECTION_KEYS[label.trim()];
    if (!key) {
      continue;
    }
    fields[key] = valueParts.join(":").trim();
  }

  return fields;
}

function enrichPromptFields(fields) {
  const mission = getSelectedMission();
  const enriched = { ...fields };
  const autofilled = [];
  const trackLabel = state.activeTrack === "technical" ? "technical" : "non-technical";

  if (!enriched.goal.trim()) {
    enriched.goal = `Deliver the core objective for "${mission.title}" in this ${trackLabel} Codex 101 session.`;
    autofilled.push("Goal");
  }

  if (!enriched.context.trim()) {
    enriched.context =
      `Audience: hackathon participants.\n` +
      `Current mission objective: ${mission.objective}\n` +
      `Track: ${TRACK_HINTS[state.activeTrack]}`;
    autofilled.push("Context");
  }

  if (!enriched.constraints.trim()) {
    enriched.constraints =
      "Do not invent facts. Keep scope practical for a 30-minute session. Make output clear for mixed technical/non-technical audiences.";
    autofilled.push("Constraints");
  }

  if (!enriched.doneWhen.trim()) {
    enriched.doneWhen =
      "Return a concrete output, a quick validation checklist, and a clear next step for either Mission completion or 201 follow-up.";
    autofilled.push("Done-When");
  }

  return { enriched, autofilled };
}

function generatePrompt(fields, successMessage) {
  const normalizedFields = normalizePromptFields(fields);
  const { enriched, autofilled } = enrichPromptFields(normalizedFields);
  const result = buildPrompt(enriched);

  if (!result.ok) {
    setMessage(ui.promptFeedback, result.error, "danger");
    return false;
  }

  state.promptDraft = enriched;
  state.generatedPrompt = result.prompt;
  state.promptLabActionTaken = false;
  state.builtPrompts += 1;
  state.badges = computeBadges(state);
  syncPromptFieldsToForm(enriched);

  if (!ui.artifactBody.value.trim()) {
    ui.artifactBody.value = `Generated Prompt:\n\n${result.prompt}`;
  }

  const autoFillSuffix = autofilled.length
    ? ` Auto-filled: ${autofilled.join(", ")}.`
    : "";
  setMessage(ui.promptFeedback, `${successMessage}${autoFillSuffix}`, "success");
  persist();
  render();
  return true;
}

function applyLibraryPrompt(promptId) {
  const item = promptLibraryMap.get(promptId);
  if (!item) {
    return;
  }

  const normalizedFields = normalizePromptFields({
    goal: item.goal,
    context: item.context,
    constraints: item.constraints,
    doneWhen: item.doneWhen
  });

  state.promptDraft = normalizedFields;
  state.activePromptCategory = item.category;
  state.promptLabActionTaken = false;

  syncPromptFieldsToForm(normalizedFields);
  generatePrompt(normalizedFields, `Loaded "${item.title}" into Prompt Makeover.`);
}

function render() {
  renderFlow();
  renderTrackButtons();
  renderMissionList();
  renderMissionDetail();
  renderProgress();
  renderBadges();
  renderGeneratedPrompt();
  renderQuickWin();
  renderPromptLibraryTabs();
  renderPromptLibraryCards();
  renderStyleStudio();
  renderHandoffPrompt();
  renderFacilitator();
  renderReadiness();
}

function renderFlow() {
  const currentIndex = FLOW_STEPS.findIndex((step) => step.id === state.activeFlowStep);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStep = FLOW_STEPS[safeIndex];
  if (currentIndex < 0) {
    state.activeFlowStep = currentStep.id;
  }

  const activeIndex = FLOW_STEPS.findIndex((step) => step.id === currentStep.id);
  const stepReadiness = getFlowReadiness(currentStep.id);
  const isLastStep = activeIndex === FLOW_STEPS.length - 1;

  ui.flowStepLabel.textContent = currentStep.label;
  ui.flowStepProgress.textContent = `Step ${activeIndex + 1} of ${FLOW_STEPS.length}`;
  ui.flowStepLearn.textContent = `What you'll learn: ${currentStep.learn.replace(/^Learn:\s*/i, "")}`;
  ui.flowStepWhy.textContent = currentStep.why;
  ui.flowStepFeature.textContent = `You are here: ${currentStep.label}`;
  ui.flowStepTask.textContent = `Task now: ${currentStep.task}`;
  ui.flowStepSuccess.textContent = `Done when: ${currentStep.success}`;

  for (const section of ui.flowSteps) {
    section.classList.toggle("is-active", section.dataset.flowStep === currentStep.id);
  }

  const action = getFlowPrimaryActionConfig(currentStep.id, stepReadiness);
  const status = getFlowStatusConfig(currentStep.id, stepReadiness, action.label);
  ui.flowBackBtn.disabled = activeIndex === 0;
  ui.flowBackBtn.classList.toggle("is-hidden", activeIndex === 0);
  ui.flowActionBtn.disabled = action.disabled;
  ui.flowActionBtn.textContent = action.label;
  renderFlowStatus(status.ready, status.text);
  if (isLastStep) {
    ui.flowBackBtn.textContent = "Previous Step";
  }
}

function renderTrackButtons() {
  ui.trackHint.textContent = TRACK_HINTS[state.activeTrack];
  if (state.trackConfirmed) {
    ui.trackChoiceStatus.textContent = `${TRACK_HINTS[state.activeTrack]}. Generate your Ask prompt when you are ready.`;
    ui.trackChoiceStatus.style.color = "var(--success)";
  } else {
    ui.trackChoiceStatus.textContent = "Select a track to unlock your guided 101 flow.";
    ui.trackChoiceStatus.style.color = "var(--ink-soft)";
  }

  for (const button of ui.trackButtons) {
    const isActive = state.trackConfirmed && button.dataset.track === state.activeTrack;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  }
}

function renderMissionList() {
  const missions = getActiveMissions();
  ui.missionList.innerHTML = "";

  missions.forEach((mission, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "mission-card";
    card.dataset.missionId = mission.id;

    const isComplete = state.completedMissionIds.includes(mission.id);
    const isActive = getSelectedMission().id === mission.id;
    const locked = isMissionLocked(missions, index);

    card.classList.toggle("is-complete", isComplete);
    card.classList.toggle("is-active", isActive);
    card.classList.toggle("is-locked", locked);
    card.disabled = locked;
    card.innerHTML = `
      <div class="mission-head">
        <p class="mission-title">${mission.title}</p>
        <span class="pill">${mission.estMinutes} min</span>
      </div>
      <p class="meta">${mission.objective}</p>
      <p class="meta mission-tag">${mission.capabilityTag}</p>
    `;
    ui.missionList.append(card);
  });
}

function renderMissionDetail() {
  const mission = getSelectedMission();
  const isComplete = state.completedMissionIds.includes(mission.id);
  const evidence = state.missionEvidenceById[mission.id] || "";
  const hasEvidence = hasMissionEvidence(mission.id);
  const missionStepReady = getFlowReadiness("missions").ready;

  ui.missionTitle.textContent = mission.title;
  ui.missionObjective.textContent = mission.objective;
  ui.missionCapability.textContent = `Capability unlocked: ${mission.learnOutcome}`;
  ui.missionUseCase.textContent = `Demo use case: ${mission.demoUseCase}`;
  ui.missionTime.textContent = `${mission.estMinutes} min`;
  ui.missionStatus.textContent = isComplete ? "Completed" : "In progress";
  ui.missionStarter.textContent = mission.promptStarter;
  if (ui.missionRanCheckbox) {
    ui.missionRanCheckbox.checked = Boolean(state.missionRunConfirmedById[mission.id]);
  }
  ui.missionEvidenceInput.value = evidence;
  ui.missionCompleteBtn.textContent = "Complete Mission & Continue";
  ui.missionCompleteBtn.disabled = !hasEvidence || isComplete;

  if (state.activeFlowStep === "missions") {
    if (missionStepReady) {
      setMessage(
        ui.missionFeedback,
        "All track missions complete. Continue to Prompt Lab when you are ready.",
        "success"
      );
      return;
    }

    if (isComplete) {
      setMessage(
        ui.missionFeedback,
        "Mission complete. Continue with the next mission card.",
        "success"
      );
      return;
    }

    if (hasEvidence) {
      setMessage(
        ui.missionFeedback,
        "Great. Complete Mission & Continue to auto-load the next mission.",
        "success"
      );
      return;
    }

    setMessage(
      ui.missionFeedback,
      "Copy mission prompt, run it in Codex, then add one proof point before completing the mission.",
      "muted"
    );
    return;
  }

  if (!ui.missionFeedback.textContent.trim()) {
    setMessage(ui.missionFeedback, "");
  }
}

function renderProgress() {
  const activeTrackMissions = getActiveMissions();
  const completedForTrackList = activeTrackMissions.filter((mission) =>
    state.completedMissionIds.includes(mission.id)
  );
  const progress = calculateProgress(
    { completedMissionIds: completedForTrackList },
    activeTrackMissions.length
  );

  ui.progressValue.textContent = `${progress}%`;
  ui.progressFill.style.width = `${progress}%`;
  ui.progressFill.parentElement.setAttribute("aria-valuenow", String(progress));
  ui.progressCaption.textContent = `${completedForTrackList.length} / ${activeTrackMissions.length} missions complete`;
  ui.pointsValue.textContent = String(state.points);
}

function renderBadges() {
  if (!state.badges.length) {
    ui.badgeList.innerHTML = `<span class="meta">No badges yet. Complete Mission 1 to unlock your first.</span>`;
    return;
  }

  ui.badgeList.innerHTML = "";
  for (const badge of state.badges) {
    const badgeEl = document.createElement("span");
    badgeEl.className = "badge";
    badgeEl.textContent = badge.title;
    ui.badgeList.append(badgeEl);
  }
}

function renderGeneratedPrompt() {
  ui.generatedPrompt.textContent =
    state.generatedPrompt || "Your generated prompt will appear here.";
}

function renderQuickWin() {
  ui.quickWinOutput.textContent =
    state.quickWinPrompt ||
    "Generate Starter Prompt will auto-generate an Ask prompt here after you choose a track.";
}

function renderPromptLibraryTabs() {
  ui.libraryCategoryTabs.innerHTML = "";

  for (const category of PROMPT_CATEGORIES) {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "library-tab";
    tab.dataset.category = category;
    tab.textContent = PROMPT_CATEGORY_LABELS[category] || category;
    tab.classList.toggle("is-active", category === state.activePromptCategory);
    tab.setAttribute("aria-selected", String(category === state.activePromptCategory));
    ui.libraryCategoryTabs.append(tab);
  }
}

function renderPromptLibraryCards() {
  const prompts = PROMPT_LIBRARY.filter((item) => item.category === state.activePromptCategory);
  ui.promptLibraryList.innerHTML = "";

  if (!prompts.length) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "No prompts found for this category.";
    ui.promptLibraryList.append(empty);
    return;
  }

  for (const item of prompts) {
    const card = document.createElement("article");
    card.className = "prompt-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <button type="button" data-library-id="${item.id}">Use in Builder</button>
    `;
    ui.promptLibraryList.append(card);
  }
}

function renderStyleStudio() {
  renderArtifactStyleOptions();
  ui.stylePreview.textContent =
    state.styledPreviewText || "Styled preview will appear here.";
}

function renderHandoffPrompt() {
  ui.handoffPromptOutput.textContent =
    state.handoffPrompt || "Handoff prompt for Codex will appear here.";
  ui.copyHandoffBtn.disabled = !state.handoffPrompt.trim();
}

function renderArtifactStyleOptions() {
  ui.artifactStyle.innerHTML = "";

  for (const style of ARTIFACT_STYLES) {
    const option = document.createElement("option");
    option.value = style.id;
    option.textContent = style.label;
    option.selected = style.id === state.artifactStyle;
    ui.artifactStyle.append(option);
  }
}

function renderFacilitator() {
  ui.facilitatorToggle.checked = Boolean(state.facilitatorEnabled);
  ui.facilitatorBody.classList.toggle("is-hidden", !state.facilitatorEnabled);
  ui.sessionCode.value = state.sessionCode || "QUEST-101";

  const overallProgress = calculateProgress(state, ALL_MISSIONS.length);
  ui.facCompletion.textContent = `${overallProgress}%`;
  ui.facPrompts.textContent = String(state.builtPrompts);
  ui.facTrack.textContent = `${Math.min(state.visitedTracks.length, 2)} / 2`;
  ui.facNext.textContent = findNextMissionTitle();
}

function getActiveMissions() {
  return MISSION_TRACKS[state.activeTrack];
}

function getSelectedMission() {
  const selectedId = state.selectedMissionByTrack[state.activeTrack];
  return missionMap.get(selectedId) || getActiveMissions()[0];
}

function hasMissionEvidence(missionId) {
  const evidence = state.missionEvidenceById[missionId];
  return typeof evidence === "string" && evidence.trim().length > 0;
}

function isMissionLocked(missions, index) {
  if (index === 0) {
    return false;
  }

  const previousMission = missions[index - 1];
  return !state.completedMissionIds.includes(previousMission.id);
}

function findNextMissionId(track) {
  const missions = MISSION_TRACKS[track];
  const next = missions.find((mission) => !state.completedMissionIds.includes(mission.id));
  return next ? next.id : null;
}

function findNextMissionTitle() {
  const activeNext = findNextMissionId(state.activeTrack);
  if (activeNext) {
    return missionMap.get(activeNext).title;
  }

  const alternative = state.activeTrack === "technical" ? "nonTechnical" : "technical";
  const altNext = findNextMissionId(alternative);
  if (altNext) {
    return missionMap.get(altNext).title;
  }

  return "All missions complete";
}

function hydrateInputsFromState() {
  ui.reflectionNotes.value = state.reflectionNotes || "";
  syncPromptFieldsToForm(normalizePromptFields(state.promptDraft));
}

function renderReadiness() {
  const activeTrackMissions = getActiveMissions();
  const completedForTrackIds = activeTrackMissions
    .filter((mission) => state.completedMissionIds.includes(mission.id))
    .map((mission) => mission.id);
  const trackProgress = calculateProgress(
    { completedMissionIds: completedForTrackIds },
    activeTrackMissions.length
  );

  ui.reflectionNotes.value = state.reflectionNotes || "";
  ui.preview201.classList.toggle("is-hidden", !state.preview201Open);
  ui.toggle201PreviewBtn.textContent = state.preview201Open
    ? "Hide 201 Preview"
    : "Show What 201 Covers";
  ui.nextActions.innerHTML = "";

  if (state.handoffCopied) {
    ui.readinessPill.textContent = "You're 101-ready";
    ui.readinessMessage.textContent =
      "Excellent. You finished the 101 flow and have a polished handoff prompt ready to share.";
    ui.nextActions.innerHTML = `
      <li>Run your copied handoff prompt in Codex to produce the shareable brief.</li>
      <li>Start 201 with MCP setup, skills packaging, and automation patterns.</li>
      <li>Bring one production workflow to the next training for deeper hardening.</li>
    `;
    return;
  }

  if (state.handoffPrompt.trim()) {
    ui.readinessPill.textContent = "One step left";
    ui.readinessMessage.textContent =
      "Copy your handoff prompt to finish 101 and unlock the 201 preview sequence.";
    return;
  }

  if (trackProgress >= 100) {
    ui.readinessPill.textContent = "Strong momentum";
    ui.readinessMessage.textContent =
      "Track missions complete. Finish Prompt Lab and Handoff to leave with a usable artifact.";
    return;
  }

  if (trackProgress >= 50) {
    ui.readinessPill.textContent = "Strong momentum";
    ui.readinessMessage.textContent =
      "You are building good delegation habits. Finish remaining missions, then move into Prompt Lab.";
    return;
  }

  if (trackProgress > 0) {
    ui.readinessPill.textContent = "In progress";
    ui.readinessMessage.textContent =
      "Great start. Keep going until your selected track missions are complete, then move into Prompt Lab and Handoff.";
    return;
  }

  ui.readinessPill.textContent = "Warming up";
  ui.readinessMessage.textContent =
    "Complete Mission 1 to unlock your first Codex confidence milestone.";
}
