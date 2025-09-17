import asyncio
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import shutil
from agent.graph import agent
from agent.tools import set_project_root
import traceback
from datetime import datetime
import time

app = FastAPI()

# Create static directory if it doesn't exist
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

class ProjectRequest(BaseModel):
    prompt: str
    recursion_limit: Optional[int] = 100

class AgentStatus(BaseModel):
    stage: str  # 'planner' | 'architect' | 'coder' | 'complete' | 'error'
    message: str
    timestamp: str
    data: Optional[Dict] = None

class GeneratedFile(BaseModel):
    filepath: str
    content: str
    language: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def get():
    """Serve the main HTML page"""
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            request = json.loads(data)

            if request.get("type") == "generate":
                prompt = request.get("prompt", "")
                recursion_limit = request.get("recursion_limit", 100)

                # Generate unique project ID using timestamp
                project_id = str(int(time.time() * 1000))  # milliseconds for uniqueness

                # Send status updates
                await send_status(websocket, "planner", f"Planning project: {prompt[:50]}...", {
                    "project_id": project_id
                })

                try:
                    # Mock the agent stages for now - we'll integrate with real agent
                    await asyncio.sleep(1)  # Simulate planning
                    await send_status(websocket, "planner", "Creating project plan...", {
                        "project_id": project_id,
                        "plan": {
                            "name": "Generated Project",
                            "description": prompt,
                            "tech_stack": ["HTML", "CSS", "JavaScript"]
                        }
                    })

                    await asyncio.sleep(1)  # Simulate architect
                    await send_status(websocket, "architect", "Designing architecture...", {
                        "project_id": project_id,
                        "files": ["index.html", "style.css", "script.js"]
                    })

                    await asyncio.sleep(1)  # Simulate coding
                    await send_status(websocket, "coder", "Generating code...", {
                        "project_id": project_id
                    })

                    # Run the actual agent with project context
                    result = await run_agent_async(prompt, recursion_limit, project_id)

                    # Get generated files from the specific project directory
                    files = get_generated_files(project_id)

                    await send_status(websocket, "complete", "Project generated successfully!", {
                        "project_id": project_id,
                        "files": files
                    })

                except Exception as e:
                    error_msg = f"Error: {str(e)}"
                    # Log error safely
                    try:
                        print(f"Agent error: {str(e)}")
                    except:
                        print("Agent error occurred but could not print details")
                    await send_status(websocket, "error", error_msg, {
                        "project_id": project_id
                    })

    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def send_status(websocket: WebSocket, stage: str, message: str, data: Optional[Dict] = None):
    """Send status update to websocket client"""
    status = AgentStatus(
        stage=stage,
        message=message,
        timestamp=datetime.now().isoformat(),
        data=data
    )
    await websocket.send_text(json.dumps(status.model_dump()))

async def run_agent_async(prompt: str, recursion_limit: int, project_id: str) -> Dict:
    """Run the agent asynchronously with project context"""
    def run_with_project_context():
        # Set project root for this execution context
        set_project_root(project_id)

        # Run the agent with project ID in the initial state
        return agent.invoke(
            {"user_prompt": prompt, "project_id": project_id},
            {"recursion_limit": recursion_limit}
        )

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, run_with_project_context)

def get_generated_files(project_id: str = None) -> List[Dict]:
    """Get all files from generated_project directory or specific project directory"""
    files = []

    # Use specific project directory if project_id is provided, otherwise use default
    if project_id:
        gen_dir = Path(f"generated_project_{project_id}")
    else:
        gen_dir = Path("generated_project")

    if gen_dir.exists():
        for file_path in gen_dir.rglob("*"):
            if file_path.is_file():
                try:
                    content = file_path.read_text(encoding='utf-8')
                    relative_path = file_path.relative_to(gen_dir)

                    # Determine language from extension
                    ext = file_path.suffix.lower()
                    language_map = {
                        '.html': 'html',
                        '.css': 'css',
                        '.js': 'javascript',
                        '.py': 'python',
                        '.json': 'json',
                        '.md': 'markdown',
                        '.txt': 'text'
                    }
                    language = language_map.get(ext, 'text')

                    files.append({
                        "filepath": str(relative_path),
                        "content": content,
                        "language": language
                    })
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")

    return files

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project and its associated files"""
    try:
        # Construct project directory path
        gen_dir = Path(f"generated_project_{project_id}")

        # Check if directory exists
        if gen_dir.exists() and gen_dir.is_dir():
            # Remove the entire directory and its contents
            shutil.rmtree(gen_dir)
            return {"success": True, "message": f"Project {project_id} deleted successfully"}
        else:
            # Directory doesn't exist, but we'll still return success
            # since the goal (project not existing) is achieved
            return {"success": True, "message": f"Project {project_id} not found, but deletion completed"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)