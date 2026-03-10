# Codex Quest UX Fixes

## Summary

This file turns the usability review into a prioritized fix list for the training experience.
Priority is based on first-run clarity, perceived intuitiveness, and impact on user confidence.

## Priority Guide

- `P0`: Fix before the next serious training run. These issues make the product feel confusing, rigid, or less credible on first use.
- `P1`: Fix soon after `P0`. These changes materially improve flow quality and reduce cognitive load.
- `P2`: Polish and refinement. Useful, but not the first work to do.

## P0

- [ ] Align guided-flow CTA labels, status text, and actual behavior at every step.
  Why: the app sometimes tells users one thing while the button says or does something else.
  Primary files: `src/app.js`, `index.html`

- [ ] Reduce hard gating so users can preview later steps before they are fully ready.
  Why: the current flow feels controlled and procedural instead of naturally guided.
  Primary files: `src/app.js`

- [ ] Replace `Mark Ran in Codex` as the main proof of mission completion.
  Why: self-attestation is easy to game and does not feel like real progress.
  Suggested replacement: require one pasted result, command, or takeaway before completion.
  Primary files: `src/app.js`, `index.html`

- [ ] Simplify the first-run Prompt Lab experience to one dominant action path.
  Why: Prompt Builder, Handoff Challenge, Style Studio, Game Variant, and Prompt Library all compete for attention in the same step.
  Primary files: `index.html`, `src/app.js`

- [ ] Stop silently switching the active track when users apply a library prompt.
  Why: it changes context without user intent and makes the app feel unpredictable.
  Primary files: `src/app.js`

## P1

- [ ] Hide or collapse optional features until the user completes the 101 core flow.
  Candidates: Style Studio, Game Variant, badges, Facilitator Mode, prompt library extras.
  Why: these are useful, but they should not compete with the main learning path on first run.
  Primary files: `index.html`, `src/app.js`

- [ ] Rewrite control-heavy copy to focus on user outcomes instead of app control language.
  Why: phrases like `Continue Guide`, `unlock`, and `Do this next` make the product feel more like a checklist than a guided learning tool.
  Primary files: `index.html`, `src/app.js`

- [ ] Make missions feel more capability-driven and less checkbox-driven.
  Why: users should feel like they are building skills, not just satisfying gating requirements.
  Primary files: `src/app.js`, `src/content/missions.js`

- [ ] Rework the final handoff flow so it feels like a finish line instead of another gate sequence.
  Current pattern: build handoff, copy handoff, then preview 201.
  Why: the final step should feel conclusive and rewarding.
  Primary files: `src/app.js`, `index.html`

- [ ] Improve progress framing so readiness feels earned through outcomes, not just step completion.
  Why: current progress is structurally clear, but emotionally flat.
  Primary files: `src/app.js`, `styles.css`

## P2

- [ ] Add more hackathon energy to the visual design without losing readability.
  Why: the UI is calm and clean, but it currently reads more like internal enablement software than a hackathon warm-up.
  Primary files: `styles.css`, `index.html`

- [ ] Preserve and regression-test the current mobile layout while simplifying the core flow.
  Why: mobile is currently in decent shape and should not get worse as desktop UX changes land.
  Primary files: `styles.css`

- [ ] Revisit badge and reward language after the core flow is improved.
  Why: lightweight motivation can help, but only after the main experience feels intuitive.
  Primary files: `src/quest-core.js`, `src/app.js`

## Suggested Execution Order

1. Fix CTA and status alignment.
2. Reduce gating and remove self-attestation.
3. Simplify Prompt Lab and prevent silent track switching.
4. Hide optional features from the core 101 path.
5. Improve copy, handoff finish, and visual tone.
