from fastapi import FastAPI

app = FastAPI(title="Forge API", version="0.0.1")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
