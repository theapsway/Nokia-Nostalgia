# Nokia Nostalgia Snake API (Backend)

This is the FastAPI backend for the Snake Game.

## Prerequisites

- [uv](https://github.com/astral-sh/uv) installed.

## Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Sync dependencies:
    ```bash
    uv sync
    ```

## Running the Server

To start the development server with hot-reloading:

```bash
uv run uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive documentation is available at `http://localhost:8000/docs`.

## Running Tests

To run the test suite:

```bash
uv run python -m pytest
```
