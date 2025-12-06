from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, spectate

app = FastAPI(
    title="Nokia Nostalgia Snake API",
    description="Backend for the Snake Game",
    version="1.0.0"
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

@app.get("/")
async def root():
    return {"message": "Welcome to Nokia Nostalgia Snake API"}
