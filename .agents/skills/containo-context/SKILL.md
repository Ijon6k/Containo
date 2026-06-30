---
name: containo-context
description: "Context-first architecture for Containo project. Use this skill for ANY question about the Containo codebase, architecture, Docker management features, API routes, WebSocket communication, or data flow. Also use when starting work on Containo, setting up the project, or any question that mentions Containo. This skill provides semantic context (architecture, flows, modules) while graphify handles structural queries (imports, call chains, dependencies). Always read from context/ folder first before reading source files. On first load, check if graphify is set up."
---

# Containo Context System

You are working on **Containo** — a Docker management dashboard (Next.js + TypeScript + Dockerode + WebSocket).

## 🛡️ AVAILABILITY CHECK — Mandatory First Step

**Before doing anything else**, check if the knowledge graph exists:

```bash
if [ ! -f graphify-out/graph.json ]; then
    echo "⚠️ GRAPHIFY NOT SET UP — graphify-out/graph.json missing"
fi
```

**If graphify is missing (fresh clone / deleted):**
1. Tell the user: "Graphify knowledge graph not found. Want me to set it up? It takes 2 commands."
2. If user says yes, run setup: install `graphifyy`, set API key, run `extract` + `cluster-only`
3. Context files can still be used — they are committed to git

**If graphify exists**, proceed to staleness check:

## 🛡️ STALENESS CHECK

**Before using ANY context file**, verify it's not stale:

```bash
# Compare context commit hash vs current HEAD (portable: works on Linux & macOS)
CONTEXT_HASH=$(grep 'Last built from commit' context/INDEX.md | sed 's/.*`\([a-f0-9]*\)`.*/\1/')
CURRENT_HASH=$(git rev-parse --short=7 HEAD)
if [ "${CONTEXT_HASH:0:7}" != "$CURRENT_HASH" ]; then
    echo "⚠️ CONTEXT IS STALE! Context=$CONTEXT_HASH, HEAD=$CURRENT_HASH"
    echo "Context may be outdated. Verify against source files."
fi
```

**If context is stale:**
1. ⚠️ Tell the user: "Context is N commits behind. I'll verify against source code."
2. Use context as a **starting point** but VERIFY against source files
3. After answering, OFFER to update context files
4. NEVER present stale context as absolute truth — it may be outdated

**If context is fresh (same commit):**
- Trust context files fully — they are accurate

## ⚡ FAST PATH — Read Context First

**Before reading ANY source file**, check if the answer is in `context/`:

1. Run staleness check above FIRST
2. Read `context/INDEX.md` — find which context file covers the topic
3. Read the relevant context file(s) — they contain pre-analyzed architecture, flows, modules
4. If context is stale, verify against source. If fresh, trust it.
5. Only if context files don't cover it → read source files directly

## Context File Map

| Topic | File |
|---|---|
| Project overview, tech stack, how to query | `context/INDEX.md` |
| Server structure, project layout, design decisions | `context/architecture.md` |
| Container monitoring pipeline, WS broadcast, data flow | `context/data-flow.md` |
| Module-by-module breakdown (lib, hooks, components) | `context/modules.md` |
| REST API endpoints (auth, containers, volumes, etc.) | `context/api-routes.md` |
| WebSocket events, rooms, payloads, idle detection | `context/websocket.md` |
| JWT auth flow, secret management, sessions | `context/auth.md` |
| TypeScript interfaces (Container, Volume, etc.) | `context/types.md` |

## Two-Layer Query System

```
🔍 Semantic/Architecture questions → read context/*.md
   "How does container monitoring work?"
   "What's the auth flow?"
   "How is the project structured?"

🔗 Structural/Dependency questions → graphify query
   "What imports ContainerStats?"
   "Trace the call chain from docker.listContainers to useContainers"
   "Show shortest path from Dockerode to WebSocket"
```

## Auto-Update Rules (MANDATORY)

### After EVERY code change session:

Before ending the session, check: did you make significant changes?

**Significant changes requiring context update:**
- New files (components, hooks, API routes, services)
- Deleted or renamed files
- Changed architecture (new patterns, new dependencies)
- New API endpoints or changed routes
- Changed data flow or WebSocket events
- Added/removed npm dependencies

**When significant changes happened:**
1. ✅ Update affected context file(s) with the new information
2. ✅ Run `git rev-parse --short HEAD` and update the commit hash in `context/INDEX.md`
3. ✅ Tell the user: "Context updated to commit [hash]."

**Minor changes** (bug fixes, style tweaks, variable renames) do NOT require updates.

### Update INDEX.md commit hash:

```
Last built from commit: `NEW_HASH`
```

### GPT hook reminder:

The git hook auto-updates graphify. Context files need MANUAL updates.
YOU are responsible for keeping context accurate. Do NOT leave stale context.

## Context File Format

Context files use Obsidian-compatible markdown:
- `[[wikilinks]]` for cross-references between context files
- Code blocks with language tags
- ASCII diagrams for data flow
- Tables for structured information
- Keep files modular — each file covers one topic deeply

## Relationship with Graphify

- `graphify-out/graph.json` is the structural graph (imports, calls, references, communities)
- Use `python3 -m graphify query "question"` for structural queries
- Context files complement the graph with semantic meaning
- Git hook auto-updates the graph on every commit
- Context files are updated manually when architecture changes

## Example Workflow

```
User: "How does container monitoring work?"

1. Read context/INDEX.md → data-flow topic → file is context/data-flow.md
2. Read context/data-flow.md → find "Container Monitoring Pipeline" section
3. Answer from context — no source files needed
4. If user asks follow-up: "What calls docker.listContainers?"
   → graphify query "what calls docker.listContainers" → structural answer
```
