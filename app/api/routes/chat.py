from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import Dict, List
import json
from datetime import datetime, timezone
from bson import ObjectId

from app.db.mongodb import get_collection
from app.db.serializer import serialize_doc

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps appointment_id -> list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, appointment_id: str):
        await websocket.accept()
        if appointment_id not in self.active_connections:
            self.active_connections[appointment_id] = []
        self.active_connections[appointment_id].append(websocket)

    def disconnect(self, websocket: WebSocket, appointment_id: str):
        if appointment_id in self.active_connections:
            if websocket in self.active_connections[appointment_id]:
                self.active_connections[appointment_id].remove(websocket)
            if not self.active_connections[appointment_id]:
                del self.active_connections[appointment_id]

    async def broadcast_to_appointment(self, appointment_id: str, message: dict):
        if appointment_id in self.active_connections:
            # Create a copy of the list to avoid SetChangedDuringIteration errors
            connections = self.active_connections[appointment_id][:]
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/{appointment_id}")
async def websocket_endpoint(websocket: WebSocket, appointment_id: str, token: str = None):
    # Depending on client, token can be clinic JWT or portal token. For simplicity, we assume token is validated before.
    # In a prod env we must secure WebSockets. Here we check if the appointment exists.
    appointments = get_collection("appointments")
    try:
        appt = await appointments.find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        await websocket.close(code=1008)
        return

    if not appt:
        await websocket.close(code=1008)
        return

    # To check if it's patient or clinic, we rely on the client sending "sender_type" in the JSON payload
    await manager.connect(websocket, appointment_id)
    chat_logs = get_collection("chatLogs")
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                sender = msg_data.get("sender", "unknown")
                sender_type = msg_data.get("sender_type", "patient") # 'patient' or 'clinic'
                text = msg_data.get("text", "")
                
                if not text:
                    continue

                new_msg = {
                    "appointment_id": appointment_id,
                    "sender": sender,
                    "sender_type": sender_type,
                    "text": text,
                    "timestamp": datetime.now(timezone.utc)
                }
                
                res = await chat_logs.insert_one(new_msg.copy())
                new_msg["_id"] = str(res.inserted_id)
                new_msg["timestamp"] = new_msg["timestamp"].isoformat()
                
                await manager.broadcast_to_appointment(appointment_id, new_msg)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, appointment_id)

@router.get("/{appointment_id}/history")
async def get_chat_history(appointment_id: str):
    chat_logs = get_collection("chatLogs")
    cursor = chat_logs.find({"appointment_id": appointment_id}).sort("timestamp", 1)
    docs = await cursor.to_list(1000)
    
    # format timestamp as string for JSON response
    res = []
    for doc in docs:
        d = serialize_doc(doc)
        if isinstance(d.get("timestamp"), datetime):
            d["timestamp"] = d["timestamp"].isoformat()
        res.append(d)
        
    return {"messages": res}
