"""
WebSocket router — real-time project build progress stream.
"""

import asyncio
import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])

# In-memory connection manager (use Redis pub/sub for multi-worker production)
class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}

    async def connect(self, project_id: str, websocket: WebSocket):
        await websocket.accept()
        if project_id not in self.connections:
            self.connections[project_id] = []
        self.connections[project_id].append(websocket)

    def disconnect(self, project_id: str, websocket: WebSocket):
        if project_id in self.connections:
            self.connections[project_id].remove(websocket)

    async def broadcast(self, project_id: str, data: dict[str, Any]):
        if project_id not in self.connections:
            return
        dead = []
        for ws in self.connections[project_id]:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.connections[project_id].remove(ws)


manager = ConnectionManager()


async def emit_progress(project_id: str, agent: str, status: str, message: str):
    """Utility for agents to emit progress events."""
    await manager.broadcast(project_id, {
        "type": "progress",
        "agent": agent,
        "status": status,  # "running" | "done" | "error"
        "message": message,
    })


@router.websocket("/ws/build/{project_id}")
async def websocket_build(websocket: WebSocket, project_id: str):
    await manager.connect(project_id, websocket)
    try:
        # Keep alive — client can send pings
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(project_id, websocket)
