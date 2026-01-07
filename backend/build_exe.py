import os
import subprocess
import sys

def build():
    # Detect directories
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dist = os.path.abspath(os.path.join(current_dir, "..", "frontend", "dist"))
    
    if not os.path.exists(frontend_dist):
        print(f"Error: Frontend build not found at {frontend_dist}")
        print("Please run 'npm run build' in the frontend directory first.")
        return

    # Install pyinstaller if needed
    try:
        import PyInstaller
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    # Build command
    # Windows separator is ;
    sep = ";" if os.name == 'nt' else ":"
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onedir",
        "--console", # Keep console valid so we can see server logs
        "--name", "ClassroomGacha",
        "--add-data", f"{frontend_dist}{sep}dist",
        "--add-data", f"{os.path.join(current_dir, 'static')}{sep}static",
        # Dependencies that might be missed
        "--hidden-import", "uvicorn.logging",
        "--hidden-import", "uvicorn.loops",
        "--hidden-import", "uvicorn.loops.auto",
        "--hidden-import", "uvicorn.protocols",
        "--hidden-import", "uvicorn.protocols.http", 
        "--hidden-import", "uvicorn.protocols.http.auto",
        "--hidden-import", "uvicorn.lifespan",
        "--hidden-import", "uvicorn.lifespan.on",
        "--hidden-import", "engineio.async_drivers.threading", # Sometimes needed
        "--clean",
        os.path.join(current_dir, "main.py")
    ]
    
    print("Running PyInstaller with command:")
    print(" ".join(cmd))
    
    subprocess.check_call(cmd, cwd=current_dir)
    
    print("\nBuild Complete!")
    print(f"Executable is located at: {os.path.join(current_dir, 'dist', 'ClassroomGacha', 'ClassroomGacha.exe')}")
    
    # Copy Excel file if exists
    excel_file = os.path.join(current_dir, "props_cards.xlsx")
    dist_dir = os.path.join(current_dir, "dist", "ClassroomGacha")
    if os.path.exists(excel_file) and os.path.exists(dist_dir):
        import shutil
        shutil.copy(excel_file, dist_dir)
        print("Copied props_cards.xlsx to output directory.")

if __name__ == "__main__":
    build()
