"""
WebSocket endpoints for real-time notifications
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.websocket_service import connection_manager, notification_service
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter()


@router.websocket("/notifications/{user_id}")
async def websocket_notifications(
    websocket: WebSocket,
    user_id: str,
    token: Optional[str] = None
):
    """WebSocket endpoint for real-time notifications"""
    
    # Authenticate user (token can be passed as query parameter)
    if token:
        try:
            # Verify token (simplified - in production, use proper dependency injection)
            auth_service = AuthService(None)  # We'll handle DB separately
            payload = auth_service.verify_token(token)
            
            if not payload or payload.get("sub") != user_id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
                
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    
    try:
        # Accept connection
        await connection_manager.connect(websocket, user_id, {
            "user_agent": websocket.headers.get("user-agent", ""),
            "origin": websocket.headers.get("origin", "")
        })
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                await handle_websocket_message(websocket, user_id, message)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                # Invalid JSON, send error
                await connection_manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
            except Exception as e:
                # Log error and continue
                print(f"WebSocket error for user {user_id}: {str(e)}")
                
    except WebSocketDisconnect:
        pass
    finally:
        # Clean up connection
        connection_manager.disconnect(websocket)


async def handle_websocket_message(websocket: WebSocket, user_id: str, message: dict):
    """Handle incoming WebSocket messages from client"""
    
    message_type = message.get("type")
    
    if message_type == "ping":
        # Respond to ping with pong
        await connection_manager.send_personal_message({
            "type": "pong",
            "timestamp": message.get("timestamp")
        }, websocket)
        
    elif message_type == "subscribe":
        # Subscribe to specific notification types
        notification_types = message.get("notification_types", [])
        # Store subscription preferences (implement as needed)
        await connection_manager.send_personal_message({
            "type": "subscription_updated",
            "subscribed_to": notification_types
        }, websocket)
        
    elif message_type == "mark_read":
        # Mark notifications as read
        notification_ids = message.get("notification_ids", [])
        # Implement notification read status update
        await connection_manager.send_personal_message({
            "type": "notifications_marked_read",
            "count": len(notification_ids)
        }, websocket)
        
    elif message_type == "get_status":
        # Send current status
        await connection_manager.send_personal_message({
            "type": "status",
            "connected_users": len(connection_manager.get_connected_users()),
            "user_connections": connection_manager.get_user_connection_count(user_id)
        }, websocket)
        
    else:
        # Unknown message type
        await connection_manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, websocket)


@router.post("/notifications/send")
async def send_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    data: dict = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send custom notification to user (admin only)"""
    
    # Check if current user is admin (implement admin check)
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    await notification_service.send_custom_notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        data=data or {}
    )
    
    return {"message": "Notification sent successfully"}


@router.post("/notifications/broadcast")
async def broadcast_notification(
    notification_type: str,
    title: str,
    message: str,
    data: dict = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Broadcast notification to all connected users (admin only)"""
    
    # Check if current user is admin
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    notification = {
        "type": notification_type,
        "title": title,
        "message": message,
        "data": data or {},
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await connection_manager.broadcast_to_all(notification)
    
    return {"message": "Notification broadcasted successfully"}


@router.get("/notifications/stats")
async def get_notification_stats(
    current_user: User = Depends(get_current_user)
):
    """Get WebSocket connection statistics"""
    
    return {
        "connected_users": len(connection_manager.get_connected_users()),
        "total_connections": sum(
            len(connections) 
            for connections in connection_manager.active_connections.values()
        ),
        "user_connections": connection_manager.get_user_connection_count(str(current_user.user_id)),
        "is_connected": connection_manager.is_user_connected(str(current_user.user_id))
    }