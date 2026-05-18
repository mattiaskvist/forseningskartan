---
geometry: margin=3cm
title: "DH2642 Project AI Usage"
author:
  - Daniel Ruijs
  - Mattias Kvist
date: \today
---

This document describes how AI tools were used in the development of this project.

## Code generation

AI tools were used to generate code to speed up development. The generated code was always reviewed by us to ensure we understood it and that it followed the course code conventions. In most cases this meant refactoring the generated code to fit our style and to ensure it was maintainable. Examples of prompts used for code generation include:

- "rework the route delay leaderboard to use material ui table"

- "add a button to navigate from departure view details to the corresponding route delay details page (the page with trend chart) for the same route (route name+type)"

- "resolve merge conflicts in the PR into main and add missing translations" -> [Commit 73e41f80998823817c6291f0fcff7f6704b01be8](https://github.com/mattiaskvist/forseningskartan/pull/132/commits/73e41f80998823817c6291f0fcff7f6704b01be8)

- "add any missing translations that are missed in the new code this PR introduces" -> [Commit 2ef140cae865da62ca1e8c903d431349c1d64e7a](https://github.com/mattiaskvist/forseningskartan/commit/2ef140cae865da62ca1e8c903d431349c1d64e7a)

- "Attend the review comments on the PR into main from this branch" -> [Commit be88842d25f811baa72a673edb8bef8ca505c0df](https://github.com/mattiaskvist/forseningskartan/commit/be88842d25f811baa72a673edb8bef8ca505c0df)

- "i opened a PR into main and there are conflicts, please resolve them" -> [Commit 46862f1841b89284c175f416049debc16d738bd3](https://github.com/mattiaskvist/forseningskartan/pull/138/commits/46862f1841b89284c175f416049debc16d738bd3)

- "Review the frontend codebase with regards to simplicity, readability and comments, anti-patterns and strict model-view-presenter architecture." -> suggestions on MVP improvments

- "copilot has reviewed the pr. Read the comments, see if they make sense, and suggest improvments if needed" 

- "Attend the review comments on the PR into main from this branch" On branch f/custom-date-range

- "lets add some brief comments to the functions we changed and then give me copy-pastable commit commands"

- "now resolve the merge conflicts in the PR"

- "Please explain things like useMemo, dispatch, useEffect etc." 

- "help me write some comments in the code about useMemo and useCallback here. Explain what it does and the benefit" 

- "the location button does not work after the mobile feature. nothing happens when i click on it." -> [Commit 149c76f26e1d622eff30ccb6aa457eaf9d101dc9](https://github.com/mattiaskvist/forseningskartan/commit/149c76f26e1d622eff30ccb6aa457eaf9d101dc9)

- "Review the frontend codebase with regards to simplicity, readability and comments, anti-patterns and strict model-view-presenter architecture. document the found issues with suggested fix and motivation in a .md file that i can share with my teammate"

## Code review

For code review, we used GitHub's Copilot code review tool to assist in reviewing pull requests. This tool provides suggestions and highlights potential issues in the code, which helped us minimize mistakes. However, this was only used as a first pass in the review process, and we still manually reviewed all code to ensure it met our standards and that we understood it.