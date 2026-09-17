# AI Handbook — Agent Instructions

This repository is a learning handbook for a non-technical graduate student who is about to study urban planning in the UK.

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
- NotebookLM is for working around a selected body of sources;
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
- may use NotebookLM, Codex or Claude Code when useful;
- should not have to memorise information that is easy to look up;
- benefits from examples drawn from graduate study, policy reading, data, GIS and urban planning;
- may read the site on a phone.

Write in natural Traditional Chinese. Keep necessary English terms next to the Chinese term when that helps future searching.

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
- avoid decorative transitions.

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

- `Training` sits next to `Context` so learners can distinguish model change from task context;
- the end of the situation section contains four short “先判斷，再展開” prompts;
- there is no score or game layer; the learner makes a quick mental choice and then opens the reasoning;
- future additions should avoid duplicating these same checks unless a new scenario teaches a genuinely different judgment.
- PDF.js + Citation.js are used for one source-verification exercise; do not turn the handbook into a general PDF reader. Citation formatting is not evidence validation.

## Default decision rule

When uncertain between a clever feature and a simpler explanation, choose the simpler explanation.
