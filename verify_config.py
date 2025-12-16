import os

# Set env var before import to simulate Render environment
os.environ["DATABASE_URL"] = "postgres://user:pass@localhost/db"

from backend.src.config import DATABASE_URL

print(f"Original: postgres://user:pass@localhost/db")
print(f"Final:    {DATABASE_URL}")

if DATABASE_URL.startswith("postgresql+asyncpg://"):
    print("SUCCESS: URL patched correctly")
else:
    print("FAILURE: URL not patched")
