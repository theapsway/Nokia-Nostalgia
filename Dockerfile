# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 2: Backend Runtime
FROM python:3.12-slim-bookworm

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project

# Copy backend source code
COPY backend/src ./src
COPY backend/tests ./tests
COPY backend/tests_integration ./tests_integration

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port
EXPOSE 8000

# Run the application
# Run the application (use shell form to expand PORT variable)
CMD sh -c "uv run uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"
