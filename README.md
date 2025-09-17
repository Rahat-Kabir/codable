# Codable

Codable bundles a LangGraph/LangChain coding agent scaffold with an optional FastAPI web UI. The agent is prompt-driven: you submit a project request and it generates code—no live editing loop so far.

## What's Included

- Agent core: `agent/` holds prompts, typed state, tools, and the LangGraph wiring.
- CLI entry point: `main.py` is a thin starter you can extend to run the graph or script workflows.
- Web UI: `app.py` and `static/` serve a real-time dashboard with prompt input, stage updates, file previews, and downloads over WebSockets.

## Tech we use (and why)

- LangGraph + LangChain: keeps multi-step reasoning transparent while giving us LLM provider flexibility.
- FastAPI + WebSockets: lightweight async server that makes streaming status updates trivial.
- Vanilla JS + CSS + Prism.js: minimal front-end stack that stays easy to fork, yet provides syntax-highlighted previews.

## Requirements

- Python `>= 3.11`
- `OPENAI_API_KEY` and/or `GROQ_API_KEY`
- Optional: [uv](https://github.com/astral-sh/uv) for dependency management

## Install

Using uv (recommended):

```bash
uv sync
```

Using pip:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -U pip
pip install -e .
```

## Configure API keys

Copy the sample dotenv and add your keys:

```bash
cp dotenv .env
# edit .env -> GROQ_API_KEY
```

Or export them directly in your shell.

## Run

### CLI agent

```bash
python main.py
```

`main.py` currently prints a placeholder message. Swap in your LangGraph loop once the graph is defined in `agent/graph.py`.

### Web UI

```bash
python app.py
# or
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Then open `http://localhost:8000`, enter a build prompt, send it, watch the planning/architecting/coding stages, review the generated files, and download the project archive.

## Project layout

```
.
├─ agent/
│  ├─ graph.py
│  ├─ prompts.py
│  ├─ states.py
│  └─ tools.py
├─ app.py
├─ main.py
├─ static/
│  ├─ app.js
│  ├─ index.html
│  └─ styles.css
├─ dotenv
├─ pyproject.toml
└─ README.md
```

## Build notes

- Define typed state and tools (`agent/states.py`, `agent/tools.py`) before wiring the graph.
- `agent/graph.py` orchestrates tool calls and LLMs; adjust it as you enable new capabilities.
- The web UI talks to `app.py` via WebSockets; update both sides if your agent contract changes.
- Add tests or scripts as you expand agent logic, tool behaviors, or UI interactions.

## Next ideas

- Swap in Monaco editor for richer code viewing.
- Add a file tree or project history persistence.
- Support packaged deployments of generated projects.
