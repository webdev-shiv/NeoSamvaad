import os
import sys
import subprocess
import time
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def print_banner():
    print("=" * 64)
    print("  🚀 NeoSamvaad — Context-Aware Support Engine")
    print("  " + "-" * 60)
    print("  🌐 Frontend URL:  http://localhost:5173")
    print("  🔌 Backend API:   http://localhost:8000")
    print("  🩺 Health Status: http://localhost:8000/health")
    print("  ☁️  Vercel Cloud:  https://frontend-five-gamma-lpn1jh8m7z.vercel.app")
    print("  " + "-" * 60)
    print("  Press Ctrl+C to stop both servers.")
    print("=" * 64)

def main():
    print_banner()

    # Prepare environment with backend on PYTHONPATH
    env = os.environ.copy()
    existing_pythonpath = env.get("PYTHONPATH", "")
    sep = ";" if os.name == "nt" else ":"
    env["PYTHONPATH"] = f"{BACKEND_DIR}{sep}{existing_pythonpath}" if existing_pythonpath else BACKEND_DIR

    # 1. Start Backend (Uvicorn with --app-dir)
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--app-dir",
        BACKEND_DIR,
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload",
    ]
    print("[1/2] Starting FastAPI Backend on http://localhost:8000...")
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=ROOT_DIR,
        env=env,
        shell=(os.name == "nt"),
    )

    # Allow backend port binding
    time.sleep(2)

    # 2. Start Frontend (Vite)
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    print("[2/2] Starting React Frontend on http://localhost:5173...")
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        shell=(os.name == "nt"),
    )

    print("\n✅ Both servers are LIVE and ready!")
    print("👉 Open your browser at: http://localhost:5173\n")

    def shutdown(signum=None, frame=None):
        print("\n🛑 Stopping servers...")
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
