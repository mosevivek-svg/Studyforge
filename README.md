# StudyForge — normal standalone website

This version does **not** require Claude.ai or a Claude sign-in.

## How it works

- Visitors open the website normally in Chrome, Safari, Firefox, etc.
- The frontend is `public/index.html`.
- The Node/Express backend exposes `/api/generate`.
- Your OpenAI API key stays on the server as `OPENAI_API_KEY`; visitors never enter it.
- The site generates notes, flashcards and quizzes through the OpenAI Responses API.

## Run locally

1. Install Node.js 18+.
2. Run `npm install`.
3. Set `OPENAI_API_KEY`.
   - Mac/Linux: `OPENAI_API_KEY=your_key npm start`
   - Windows PowerShell: `$env:OPENAI_API_KEY="your_key"; npm start`
4. Open `http://localhost:3000`.

Optional: set `AI_MODEL` to another model available to your API account.

## Deploy

Upload this folder to a Node-compatible host such as Render, Railway, or another service that supports Node.js.

- Build/install command: `npm install`
- Start command: `npm start`
- Environment variable: `OPENAI_API_KEY=your_key`

Do **not** put the API key into `index.html` or commit it to GitHub.

## Important

The website itself is independent of Claude. AI generation still requires an API provider and an API key on the server. The included configuration uses OpenAI instead of Anthropic/Claude.
