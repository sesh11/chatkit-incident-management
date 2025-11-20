"""
FastAPI application for ChatKit Incident Management Server.
"""
import os
import json
from typing import Dict, Any
from dotenv import load_dotenv, find_dotenv
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from chatkit_server import IncidentChatKitServer
from auth import extract_user_context, AuthenticationError
from models import UserContext, Role

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
if not find_dotenv():
    raise FileNotFoundError("Could not find .env file")

# Initialize FastAPI app
app = FastAPI(
    title="ChatKit Incident Management API",
    description="Enterprise incident management with role-based access control",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChatKit server
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

chatkit_server = IncidentChatKitServer(api_key=OPENAI_API_KEY)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "ChatKit Incident Management API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "chat": "/api/chat",
            "health": "/health",
            "permissions": "/api/permissions/{role}"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "chatkit_server": "initialized",
        "openai_configured": bool(OPENAI_API_KEY)
    }


@app.get("/api/permissions/{role}")
async def get_permissions(role: str):
    """
    Get permissions for a specific role.

    Args:
        role: User role (IT, OPS, FINANCE, CSM)

    Returns:
        List of permissions and available tools
    """
    try:
        role_enum = Role(role.upper())
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role: {role}. Must be one of: IT, OPS, FINANCE, CSM"
        )

    from models import PERMISSIONS
    from tools import get_tools_for_role

    return {
        "role": role_enum.value,
        "permissions": PERMISSIONS[role_enum],
        "available_tools": get_tools_for_role(role_enum)
    }


@app.post("/api/chat")
async def chat_endpoint(
    request: Request,
    user_context: UserContext = Depends(extract_user_context)
):
    """
    Main ChatKit endpoint for processing messages.

    This endpoint:
    1. Extracts user identity from headers (X-User-Role, X-User-Id)
    2. Receives ChatKit request body
    3. Processes through ChatKit server with identity propagation
    4. Returns streaming or JSON response

    Headers required:
        - X-User-Role: User role (IT, OPS, FINANCE, CSM)
        - X-User-Id: User identifier

    Returns:
        StreamingResponse (SSE) or JSONResponse
    """
    try:
        # Get request body
        body = await request.body()

        # Prepare context with user identity
        request_context = {
            "user_context": user_context,
            "headers": dict(request.headers)
        }

        # Process through ChatKit server
        result = await chatkit_server.process(body, request_context)

        # Check if result is streaming or JSON
        if hasattr(result, '__aiter__'):
            # Streaming response (SSE)
            async def event_generator():
                """Generate SSE events."""
                async for event in result:
                    # Format as SSE
                    if isinstance(event, dict):
                        event_data = json.dumps(event)
                    else:
                        event_data = str(event)
                    yield f"data: {event_data}\n\n"

            return StreamingResponse(
                event_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                    "Connection": "keep-alive"
                }
            )
        else:
            # JSON response
            return JSONResponse(
                content=result if isinstance(result, dict) else {"result": str(result)}
            )

    except AuthenticationError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )


@app.post("/api/simple-chat")
async def simple_chat_endpoint(
    request: Request,
    user_context: UserContext = Depends(extract_user_context)
):
    """
    Simplified chat endpoint for testing without full ChatKit protocol.

    Body:
        {
            "message": "user message here"
        }

    Returns:
        {
            "response": "assistant response",
            "tool_calls": [...],
            "context": {...}
        }
    """
    try:
        body = await request.json()
        message = body.get("message", "")

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Process directly through agent
        from agent import IncidentManagementAgent

        agent = IncidentManagementAgent(OPENAI_API_KEY)
        result = await agent.process_message(message, user_context)

        return {
            "response": result.get("message"),
            "tool_calls": result.get("tool_calls", []),
            "context": result.get("context"),
            "user": {
                "role": user_context.role.value,
                "display_name": user_context.display_name,
                "user_id": user_context.user_id
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )


@app.get("/api/incidents")
async def list_incidents(
    user_context: UserContext = Depends(extract_user_context)
):
    """
    List all incidents (filtered by role).

    Returns:
        List of incidents with role-appropriate data
    """
    from store import incident_store

    incidents = incident_store.list_incidents(role=user_context.role)

    return {
        "incidents": incidents,
        "user": {
            "role": user_context.role.value,
            "display_name": user_context.display_name
        },
        "count": len(incidents)
    }


@app.get("/api/incidents/{incident_id}")
async def get_incident(
    incident_id: str,
    user_context: UserContext = Depends(extract_user_context)
):
    """
    Get incident details (filtered by role).

    Args:
        incident_id: Incident ID

    Returns:
        Incident details appropriate for user's role
    """
    from store import incident_store

    incident = incident_store.get_incident_for_role(incident_id, user_context.role)

    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    return {
        "incident": incident,
        "user": {
            "role": user_context.role.value,
            "display_name": user_context.display_name
        }
    }


if __name__ == "__main__":
    import uvicorn

    # Get host and port from environment
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║  ChatKit Incident Management Server                         ║
╠══════════════════════════════════════════════════════════════╣
║  Status: Starting...                                         ║
║  URL: http://{host}:{port}                            ║
║                                                              ║
║  Endpoints:                                                  ║
║    • POST /api/chat          - ChatKit endpoint             ║
║    • POST /api/simple-chat   - Simple testing endpoint      ║
║    • GET  /api/incidents     - List incidents               ║
║    • GET  /health            - Health check                 ║
║                                                              ║
║  Authentication:                                             ║
║    Headers: X-User-Role (IT|OPS|FINANCE|CSM)                ║
║             X-User-Id (any identifier)                      ║
╚══════════════════════════════════════════════════════════════╝
    """)

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
