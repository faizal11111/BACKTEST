from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api import ohlcv, strategy, metrics, websocket_stream

app = FastAPI(title="Backtesting Strategy API", version="1.0")

# CORS settings
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backtesting API is running"}

# Include API routers
app.include_router(ohlcv.router, prefix="/api/ohlcv", tags=["ohlcv"])
app.include_router(strategy.router, prefix="/api/strategy", tags=["Strategy"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(websocket_stream.router, prefix="/api/ws", tags=["websocket"])
app.mount("/static", StaticFiles(directory="app/static"), name="static")
# ✅ FIXED static path

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("/static/favicon.ico")


