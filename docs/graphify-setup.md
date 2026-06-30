# Graphify Setup Guide

Knowledge graph for Containo — maps the entire codebase into a queryable graph.

## Prerequisites

- Python 3.10+
- An LLM API key (pick one):
  - **Gemini** (recommended, free): https://aistudio.google.com/apikey
  - DeepSeek, OpenAI, Claude, or Kimi

## One-Time Setup

```bash
# 1. Install graphify
python3 -m pip install graphifyy

# 2. Set API key
export GEMINI_API_KEY="your-key-here"

# 3. Build initial knowledge graph
python3 -m graphify extract . --backend gemini

# 4. Generate report + HTML visualization
python3 -m graphify cluster-only .

# 5. Install auto-update git hook
python3 -m graphify hook install
```

## What You Get

| Output | Description |
|---|---|
| `graphify-out/graph.html` | Interactive graph — open in browser |
| `graphify-out/GRAPH_REPORT.md` | Full audit report with god nodes, communities, surprises |
| `graphify-out/graph.json` | Raw graph data (GraphRAG-ready) |

## Auto-Update

The git hook rebuilds the graph on every commit:

```
git commit → git hook fires → graphify updates graph.json + GRAPH_REPORT.md
```

- Code-only changes: free (AST extraction, no LLM)
- Doc/image changes: uses LLM (Gemini, ~$0.08 per run)

## Useful Commands

```bash
# Query the graph
python3 -m graphify query "How does Container connect to WebSocket?"
python3 -m graphify query "What calls useNotify?" --dfs

# Find path between two concepts
python3 -m graphify path "Container" "WebSocketProvider"

# Explain a node
python3 -m graphify explain "ContainerStats"

# Update after code changes (manual, if hook isn't enough)
python3 -m graphify update .

# Rebuild everything from scratch
python3 -m graphify extract . --backend gemini

# Watch mode (auto-rebuild on file changes)
python3 -m graphify --watch .

# Export Obsidian vault (browsable linked notes)
python3 -m graphify export obsidian
```

## Other Backends

If you don't have Gemini, use any of these:

```bash
# DeepSeek
export DEEPSEEK_API_KEY="..." && python3 -m graphify extract . --backend deepseek

# OpenAI
export OPENAI_API_KEY="..." && python3 -m graphify extract . --backend openai

# Local OpenAI-compatible (e.g. Ollama, OpenRouter proxy)
export OPENAI_API_KEY="..." OPENAI_BASE_URL="http://localhost:11434/v1"
python3 -m graphify extract . --backend openai
```

## Fresh Machine Setup

When cloning on a new machine:

```bash
git clone git@github.com:Ijon6k/Containo.git && cd Containo
python3 -m pip install graphifyy
export GEMINI_API_KEY="..."
python3 -m graphify extract . --backend gemini
python3 -m graphify cluster-only .
python3 -m graphify hook install
```

Context files (`context/`) and agent skills (`.agents/`) are committed — no setup needed.

## Troubleshooting

| Issue | Fix |
|---|---|
| `No LLM API key found` | Set `GEMINI_API_KEY` or another backend key |
| Semantic extraction slow | Use Gemini (fastest free tier) or `--backend deepseek` |
| Out of memory | Run on fewer files: `graphify extract app/ --backend gemini` |
| Graph stale | Run `graphify update .` or check git hook: `graphify hook status` |
