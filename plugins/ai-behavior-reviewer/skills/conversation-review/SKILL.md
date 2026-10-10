---
name: conversation-review
description: Review a user-provided AI conversation, identify corrections, drift, unresolved work, and improve a draft prompt with traceable evidence.
---

Use this skill only when the user explicitly asks to review a conversation, build a conversation mainline, detect where an AI misunderstood or failed to follow instructions, or improve a prompt before sending it.

The user must provide the conversation text or a local export. Do not claim to see the Codex composer, hidden session state, browser text, or messages not included in the material. Do not monitor the user in the background.

For a conversation review:

1. Separate messages by speaker and preserve message ids or create stable sequential ids.
2. Build a mainline: user goal, topic changes, branches, corrections, decisions, action items, evidence, and unresolved items.
3. For each suspected correction, report the exact quote, the assistant message it targets, and whether the earlier user message had already stated the correct meaning. Use `没说`, `没照做`, or `拿不准`.
4. Distinguish evidence from interpretation. Never invent tool calls, files, citations, costs, or completion evidence.
5. Offer prompt advice as method suggestions: clarify target, context, constraints, deliverable, order of operations, and verification. Do not score or diagnose the user.

Output a compact JSON object when the user asks for machine-readable output. Otherwise use a readable report with:

- 主线图数据：topics, cards, branches, decisions, action items, drift, unresolved
- 逐条证据：message id and exact quote
- 提示词建议：advice and reason

Privacy: keep material local unless the user explicitly asks to send it to a named model or service. If an external model is used, state what text is being sent and why before making the request.
