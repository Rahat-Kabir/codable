# Codable

An AI-powered coding assistant scaffold built with LangGraph and LangChain. This repository is a minimal starting point for building task‑oriented developer agents that reason over code, call tools, and assist in day‑to‑day coding.

## Features

- LangGraph agent scaffolding (`agent/graph.py`) for multi‑step reasoning and tool orchestration
- Prompt and state modules (`agent/prompts.py`, `agent/states.py`) ready for extension
- Tooling surface (`agent/tools.py`) to plug in code search, file edits, and other capabilities
- Pluggable LLM providers via LangChain (OpenAI, Groq)
- `.env` support via `python-dotenv` for API keys
- Simple entry point in `main.py`

## Quick Start

### Prerequisites

- Python `>= 3.11`
- One or more LLM provider keys: `OPENAI_API_KEY` and/or `GROQ_API_KEY`
- Optional: [uv](https://github.com/astral-sh/uv) for fast Python env management

### Setup

1) Create a virtual environment and install deps

Using uv (recommended):

```bash
uv sync
```

Or using pip:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -U pip
pip install -e .
```

2) Configure environment variables

You can copy the provided `dotenv` file and fill in your keys:

```bash
cp dotenv .env
# Edit .env and set OPENAI_API_KEY / GROQ_API_KEY
```

Alternatively, export them directly in your shell:

```bash
export OPENAI_API_KEY=...   # or GROQ_API_KEY=...
```

### Run

```bash
python main.py
```

The default entry point currently prints a hello message. Extend the agent modules to wire up the LangGraph workflow and interactive CLI.

## Configuration

- Provider selection: This starter includes dependencies for `langchain-openai` and `langchain-groq`. Choose one or both by setting the corresponding API key(s). In your agent wiring, construct the LLM based on which key is present.
- Environment: Values are read from `.env` if present (`python-dotenv`).

## Project Structure

```
.
├─ agent/
│  ├─ graph.py      # Build your LangGraph here
│  ├─ prompts.py    # System/user prompts, templates
│  ├─ states.py     # Typed state for your graph nodes
│  └─ tools.py      # Tool implementations surfaced to the agent
├─ main.py          # CLI/entry point
├─ pyproject.toml   # Project metadata & dependencies
├─ uv.lock          # uv lockfile (if using uv)
└─ README.md
```

## Development Notes

- Start by defining your agent state and tools in `agent/states.py` and `agent/tools.py`.
- Build your graph in `agent/graph.py` using LangGraph nodes and edges that call tools and LLMs.
- Add prompt templates in `agent/prompts.py` and wire them into your graph nodes.
- Update `main.py` to run the graph and expose a CLI loop or server endpoint.

## Roadmap / TODO

- Implement the LangGraph in `agent/graph.py`
- Add real tools (file read/write, search, run, etc.)
- Support provider selection (OpenAI/Groq) via env
- Add tests and example sessions
- Optional: interactive REPL and/or API server

---

Project name: Codable. Note: `pyproject.toml` currently sets the package name to `coder-buddy`. I can rename it to `codable` (and adjust imports if needed) on request.
