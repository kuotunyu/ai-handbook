# AI Handbook — Agent Instructions

This repository is a learning handbook for graduate students without a technical background.

## Primary objective

Help the learner build a small number of durable AI mental models with the lowest possible cognitive load.

The site is not a technology showcase. Do not add features just because they are technically interesting.

When deciding whether to add something, prefer this order:

1. remove or shorten unnecessary content;
2. clarify an existing explanation;
3. add a small progressive-disclosure interaction;
4. add a new feature only when it teaches something that cannot be taught as clearly with the existing UI.

## What the learner should retain

Prioritise durable concepts over product trivia:

- choose tools by task, not by brand;
- conversational AI is for thinking, explaining and discussing;
- Gemini Notebook (renamed from NotebookLM on 2026-07-16) is for working around a selected body of sources;
- an Agent can operate on files/tools and therefore needs scope, reversibility and verification;
- Prompt means the instruction/question given to the AI;
- Context means information available for the current task;
- Context is not Training;
- Training changes the model itself; providing background/files normally does not;
- AI output is not evidence; important claims, numbers and citations must be checked against original sources;
- the human remains responsible for methodology, interpretation and final submission.

## Audience

Assume the learner:

- is not a software engineer;
- is comfortable using Gemini but may not know technical AI vocabulary;
- may use Gemini Notebook, Codex or Claude Code when useful;
- should not have to memorise information that is easy to look up;
- benefits from examples drawn from graduate study, policy reading, data, GIS and urban planning;
- may read the site on a phone.

Write in natural Traditional Chinese. Keep necessary English terms next to the Chinese term when that helps future searching.

Keep text dark enough to read comfortably: the learner found light grey and light accent text painful. Grey text tokens stay at 6.5:1 or more on the paper and white backgrounds, accent colours used for text at 5.2:1 or more; `npm run check:static` enforces this. Do not introduce new light text colours outside the tokens.

Use half-width brackets `[]` and parentheses `()` everywhere on the site, including inside Chinese sentences, button labels, chart labels, diagram code and text rendered into media. Never use full-width `［］` or `（）`. `npm run check:static` fails if they appear in `index.html`, `app.js` or `diagrams.js`.

## Bilingual edition

- `index.html`, `app.js` and `diagrams.js` are the source. `en.html` and `app.en.js` are generated from them plus a translation catalogue maintained outside this repository; do not hand-edit the generated files, because the next generation overwrites them.
- `diagrams.en.js`, `diagrams/en/`, `materials/en/` and `media/en/` are the English counterparts. Every video and poster in `index.html` has an English render with the same file name under `media/en/`; keep them paired when media changes.
- The English edition uses English punctuation. `npm run check:static` fails on Chinese characters or punctuation left in `en.html` or `app.en.js`.
- Line breaks differ by language. English uses `text-wrap-style: pretty` for paragraphs and `balance` for headings and short labels. Chinese keeps full lines, as Chinese typesetting expects; `keepPhrasesTogether()` in `app.js` keeps each block's last two words with the closing punctuation and keeps product names such as Claude Code on one line. Do not add pretty or balance to Chinese text: it leaves ragged line ends and still splits words.

## Learning design rules

- One screen/interaction should teach one main idea.
- Prefer examples and comparison over formal definitions.
- If adding an interaction, ask whether some explanatory prose can be removed.
- Do not turn the handbook into a quiz product. No scores, badges, streaks, confetti or gamification.
- Active recall is useful only when it tests a high-value mental model.
- Use progressive disclosure for details that are useful but not required on first read.
- Avoid making every technical term clickable; that creates visual noise.
- Do not duplicate the same tool-selection guidance in multiple chapters unless repetition is serving a deliberate learning purpose.
- Do not introduce jargon earlier than it is needed.
- Avoid model benchmarks, context-window numbers, subscription minutiae and UI instructions that are likely to age quickly unless the section explicitly needs current product information.

## Technical constraints

Keep the existing architecture unless there is a strong user-facing reason to change it:

- vanilla HTML/CSS/JS;
- no framework migration;
- no backend, account system or database;
- preserve direct `file://` usability where practical;
- production dependencies should remain minimal;
- do not add a library when the same interaction is simple to implement accessibly with native HTML/CSS/JS;
- preserve keyboard usability, semantic HTML and reduced-motion behaviour;
- preserve the existing visual language and do not introduce decorative complexity.

The existing design direction is documented in the opening comment of `index.html`. Respect it.

## Media and animation

Animation is justified only when motion materially improves understanding.

Good candidates include processes that are difficult to understand from static prose, for example:

- Context vs Training;
- retrieval feeding Context;
- an Agent loop of inspect → act → check → revise.

For educational animation:

- keep it short;
- it must still make sense without audio;
- do not autoplay;
- text explanations must remain sufficient without the video;
- keep simultaneous on-screen text low;
- avoid decorative transitions;
- run `npm run check:assets` before shipping new media; optimise an unexpectedly large asset instead of raising a budget just to make CI pass.

## Agent behaviour while modifying the repository

Before editing:

1. read the relevant existing sections and nearby interactions;
2. identify whether the requested change duplicates something already present;
3. state internally what single learning outcome the change serves;
4. prefer the smallest reversible change.

While editing:

- preserve original/raw learning materials and media;
- do not overwrite user data or sample source files unnecessarily;
- do not silently change the meaning of instructional content;
- do not invent product capabilities or academic policies;
- when information is time-sensitive, use current official sources before updating factual product claims.

After editing:

- check desktop and mobile layout;
- check keyboard navigation and visible focus;
- check for console errors;
- check local links, media paths and section anchors;
- verify the page still communicates its core idea if JavaScript or media fails;
- explain what was changed and which learning outcome it serves.

## Current learning pattern to preserve

The first front-end learning pass intentionally uses native disclosure rather than a quiz framework:

- `Training` lives in the extended vocabulary, right after LLM (the site owner moved it out of the core cards on 2026-09-17; do not move it back). Context ≠ Training is still taught by its definition, the chapter 02 check and the chapter 03 inline note;
- the end of the situation section contains four short “先判斷，再展開” prompts;
- there is no score or game layer; the learner makes a quick mental choice and then opens the reasoning;
- future additions should avoid duplicating these same checks unless a new scenario teaches a genuinely different judgment.
- PDF.js is used at runtime for one source-verification exercise; do not turn the handbook into a general PDF reader. Citation.js formats the known bibliography at authoring/build time only, so the browser does not download its large bundle. Citation formatting is not evidence validation.
- Keep chapter roles distinct: chapter 02 chooses a starting work mode; chapter 03 first shows the three layers of an AI tool (interface, harness, model), then explains generation/search/calculation/operation and verification; chapter 04 teaches task handoff. Do not reintroduce full prompt examples into chapter 02 or a second task-to-tool routing table into chapter 03.
- Keep the seven Gemini Notebook prompt examples in chapter 09. The first, 用 Deep Research 建立來源庫, was added by the site owner on 2026-09-18; its text is theirs, and its `where` note tells the learner to paste it into the Add sources search box with Web and Deep Research, not into the chat. An opened card shows the prompt in a dark box headed 提示詞 with its reset and copy buttons, and the `where` note above it under 怎麼用, so the learner can tell the prompt from the instructions at a glance; keep that structure for new cards. The others include 整理課堂錄音, 製作語音導覽 and 製作資訊圖表或簡報. The learner already uploads PDFs and recordings but does not know what to write when customising Gemini Notebook outputs; these three examples are the direct answer, so do not trim them as duplicates.
- Chapter 06 has the forms table (`#ai-forms`): ChatGPT, Claude and Gemini across AI model, web, desktop, IDE and CLI. The site owner chose all five columns and no Cursor row on 2026-09-18; keep both decisions. The web and desktop cells are highlighted because those are the two forms the learner uses. Each of the twelve interface cells has a drawn illustration from `media/forms/` (English in `media/forms/en/`); they are illustrations, not screenshots, and carry no logos. Keep them paired when a cell changes. The desktop column means the Agent app (Codex, Claude Code, Antigravity), not the companies' desktop chat apps, and the pictures must keep the difference visible: web shows an uploaded copy and a text answer; desktop shows the folder on the computer, a newly created file and a permission prompt.
- Model names in chapter 03 and the forms table age within months. When editing either, check each company's current models against official sources and update the names and the checked date together.
- Agent guidance should teach scope, permissions, reversibility and verification once. Product-specific UI steps may be brief references, not parallel long walkthroughs.

## Default decision rule

When uncertain between a clever feature and a simpler explanation, choose the simpler explanation.
