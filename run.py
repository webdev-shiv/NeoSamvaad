import os
import sys
import subprocess
import time
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def print_banner():
    print("=" * 60)
    print("  🚀 NeoSamvaad — Unified Dev Server Launcher")
    print("  • Backend:  http://localhost:8000  (FastAPI + Neo4j Graph-RAG)")
    print("  • Frontend: http://localhost:5173  (Vite + React UI)")
    print("  • Health:   http://localhost:8000/health")
    print("  Press Ctrl+C to stop both servers.")
    print("=" * 60)

def main():
    print_banner()

    # 1. Start Backend (Uvicorn)
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload",
    ]
    print("[1/2] Starting FastAPI Backend...")
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=ROOT_DIR,
        shell=(os.name == "nt")
    )

    # Brief delay for backend port binding
    time.sleep(1.5)

    # 2. Start Frontend (Vite)
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    print("[2/2] Starting React Frontend...")
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        shell=(os.name == "nt")
    )

    print("\n✅ Both servers are running! Ready for connections.\n")

    def shutdown(signum=None, frame=None):
        print("\n🛑 Shutting down servers...")
        try:
            frontend_proc.terminate()
            backend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    try:
        while True:
            # Check if any process terminated unexpectedly
            b_poll = backend_proc.poll()
            f_poll = frontend_proc.poll()
            if b_poll is not None:
                print(f"[Backend] Process exited with code {b_poll}")
                shutdown()
            if f_poll is not None:
                print(f"[Frontend] Process exited with code {f_poll}")
                shutdown()
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    main()
