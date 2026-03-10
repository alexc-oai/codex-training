# Codex Quest

Interactive onboarding site for Codex hackathon preparation.  
Built as a dependency-free web app with dual learning tracks.

## Quick Start

If you just want to run the app:

1. Get the repo onto your computer using the steps below.
2. Open a terminal in the project folder.
3. Run:

```bash
npm start
```

4. Open:

```text
http://127.0.0.1:4173
```

Notes:
- `npm install` is not required just to run the app.
- You do need Node.js installed on your machine.
- If `4173` is already in use, the app will not auto-pick a different port.

## Before You Start

You need:
- A copy of this repo
- Node.js installed

You also need:
- Git installed

## Clone The Repo

### Mac: Terminal Steps

1. Open `Terminal`
2. Move to the folder where you want the project to live. Example:

```bash
cd ~/Desktop
```

3. Clone the repo:

```bash
git clone https://github.com/alexc-oai/codex-training.git
```

4. Move into the project:

```bash
cd codex-training
```

5. Start the app:

```bash
npm start
```

6. Open:

```text
http://127.0.0.1:4173
```

### Windows: PowerShell Steps

1. Open `PowerShell`
2. Move to the folder where you want the project to live. Example:

```powershell
cd $HOME\Desktop
```

3. Clone the repo:

```powershell
git clone https://github.com/alexc-oai/codex-training.git
```

4. Move into the project:

```powershell
cd .\codex-training
```

5. Start the app:

```powershell
npm start
```

6. Open:

```text
http://127.0.0.1:4173
```

## If `git clone` Does Not Work

Common reasons:
- Git is not installed
- You are not signed into GitHub in your browser or Git credential helper
- Your GitHub account does not have access to the repo

Quick checks:
- Run `git --version` to confirm Git is installed
- Open the repo URL in your browser to confirm your account has access
- Then try `git clone` again

## What It Includes

- Technical and non-technical mission paths (4 missions each).
- Guided 4-step onboarding flow (Start -> Missions -> Prompt Lab -> Handoff).
- 5-minute first-win generator for instant Codex value.
- Mission progression with checklist gating.
- Prompt Builder (`Goal`, `Context`, `Constraints`, `Done-When`).
- Prompt library (technical, non-technical, hackathon) with one-click builder fill.
- Style Studio transforms briefs into NYT-style, Economist-style, or Game Lab outputs.
- One-click game prompt generation for mini interactive hackathon demos.
- Codex "can/cannot do" guidance for realistic expectations.
- Progress, XP scoring, and badge unlocks.
- Artifact export as Markdown.
- Facilitator mode with lightweight session metrics.
- Reflection and 201-readiness guidance.

## Run Locally

```bash
npm start
```

Open:

```text
http://127.0.0.1:4173
```

## Tests

Unit tests:

```bash
npm test
```

Browser flow tests:

```bash
npm install
npm run test:e2e
```
