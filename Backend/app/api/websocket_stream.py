from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

router = APIRouter()

@router.websocket("/ws/stream")
async def stream_strategy(websocket: WebSocket):
    await websocket.accept()
    try:
        for i in range(1, 101):
            update = {
                "step": i,
                "status": "running",
                "message": f"Simulated trade step {i}",
                "timestamp": int(asyncio.get_event_loop().time() * 1000)
            }
            await websocket.send_text(json.dumps(update))
            await asyncio.sleep(0.1)

        await websocket.send_text(json.dumps({
            "status": "completed",
            "message": "Live simulation completed"
        }))

    except WebSocketDisconnect:
        print("Client disconnected from WebSocket")
