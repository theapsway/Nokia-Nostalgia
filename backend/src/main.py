from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, spectate

from contextlib import asynccontextmanager
from .db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Nokia Nostalgia Snake API",
    description="Backend for the Snake Game",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(spectate.router, prefix="/api")

# Serve frontend static files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount static files - check if directory exists to avoid errors in dev if not built
static_dir = os.path.join(os.path.dirname(__file__), "../static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_app(full_path: str):
    # API routes are already handled above because they are included first
    # If the path is a file in static_dir, serve it? 
    # Actually, for SPA, we usually serve index.html for everything that isn't an API route or a static asset.
    # But we mounted /assets explicitly.
    
    # Check if a specific file exists in static dir (e.g. favicon.ico, manifest.json)
    if os.path.exists(static_dir):
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
             return FileResponse(file_path)

    # Fallback to index.html
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"message": "Frontend not found. Please build the frontend."}
