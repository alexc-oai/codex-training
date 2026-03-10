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

Optional:
- GitHub Desktop, if you prefer clicking instead of using terminal commands
- Git, if you want to clone from Terminal or PowerShell

## Clone The Repo

### Recommended: GitHub Desktop (Mac or Windows)

This is the easiest path for people who do not normally code.

1. Install GitHub Desktop.
2. Sign in to GitHub with the account that has access to this repo.
3. In GitHub Desktop, choose `File` -> `Clone repository`.
4. Select the `URL` tab.
5. Paste this repo URL:

```text
https://github.com/alexc-oai/codex-training.git
```

6. Choose where you want the folder to live on your computer.
7. Click `Clone`.
8. In GitHub Desktop, click `Repository` -> `Open in Terminal`.
9. Run:

```bash
npm start
```

10. Open `http://127.0.0.1:4173`

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
- You are not signed into GitHub
- Your GitHub account does not have access to the repo

Simplest fix:
- Use GitHub Desktop instead of Terminal/PowerShell

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
