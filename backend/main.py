from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
import pandas as pd
import io
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import random
import os
import sys

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

def get_frontend_path():
    # Check for PyInstaller path
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, "dist")
    
    # Check for local dev path (relative to this file)
    dev_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
    if os.path.exists(dev_path):
        return dev_path
        
    # Check ../frontend/dist
    dev_path_2 = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
    if os.path.exists(dev_path_2):
        return dev_path_2
        
    return None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Students ---
@app.get("/students", response_model=List[schemas.Student])
def read_students(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return students

@app.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_student.stars = student.stars
    db_student.pick_count = student.pick_count
    db_student.name = student.name
    db_student.dorm_number = student.dorm_number
    
    db.commit()
    db.refresh(db_student)
    return db_student

@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return {"message": "Student deleted successfully"}

@app.post("/import_excel")
async def import_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xls', '.xlsx')):
         raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")

    contents = await file.read()
    
    try:
        df = pd.read_excel(io.BytesIO(contents), header=None)
        
        start_row = 0
        if not df.empty:
            first_cell = str(df.iloc[0, 0])
            if "Name" in first_cell or "姓名" in first_cell:
                start_row = 1
        
        db.query(models.Student).delete()
        # Also clear all student items as students are gone
        db.query(models.StudentItem).delete()
        
        count = 0
        for index, row in df.iloc[start_row:].iterrows():
            if len(row) < 1:
                continue
            name = str(row[0]).strip()
            dorm = str(row[1]).strip() if len(row) > 1 else None
            
            if not name or name == 'nan':
                continue

            student = models.Student(name=name, dorm_number=dorm, stars=0, pick_count=0)
            db.add(student)
            count += 1
        
        db.commit()
        return {"message": "Import successful", "count": count}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

# --- Items ---

@app.post("/students/{student_id}/draw_item", response_model=schemas.ItemCard)
def draw_item_for_student(student_id: int, db: Session = Depends(get_db)):
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get all item cards
    # If using weights, we'd implement that here. For now, random uniform.
    items = db.query(models.ItemCard).all()
    if not items:
        # Fallback if DB not seeded
        raise HTTPException(status_code=404, detail="No items available in card pool")

    drawn_item = random.choice(items)

    # Add to student inventory
    student_item = models.StudentItem(student_id=student_id, item_card_id=drawn_item.id)
    db.add(student_item)
    db.commit()

    return drawn_item

@app.get("/students/{student_id}/items", response_model=List[schemas.StudentItem])
def get_student_items(student_id: int, db: Session = Depends(get_db)):
    return db.query(models.StudentItem).filter(models.StudentItem.student_id == student_id).all()

@app.delete("/student_items/{item_id}")
def use_student_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.StudentItem).filter(models.StudentItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Item used successfully"}

# --- Initialization Script Endpoint (Optional, or run on startup) ---
# We'll just run a function on startup to seed if empty
def seed_items_from_excel():
    db = database.SessionLocal()
    try:
        # Check if items exist
        if db.query(models.ItemCard).count() > 0:
            return

        excel_path = "props_cards.xlsx"
        if not os.path.exists(excel_path):
            print("Items Excel not found, skipping seed")
            return

        df = pd.read_excel(excel_path)
        # Columns: 序号, 原义, RPG/魔法命名, 功能描述, 卡片图片
        
        for _, row in df.iterrows():
            name = str(row['RPG/魔法命名'])
            desc = str(row['原义'])
            func_desc = str(row['功能描述'])
            img_file = str(row['卡片图片'])
            
            # Fix extension png -> jpg
            if img_file.endswith('.png'):
                img_file = img_file.replace('.png', '.jpg')
            
            # Check if file really exists? Just store the path relative to static/images
            # We assume frontend will prepend valid URL
            
            item = models.ItemCard(
                name=name,
                description=desc,
                function_desc=func_desc,
                image_path=img_file
            )
            db.add(item)
        db.commit()
        print("Seeded Item Cards")
    except Exception as e:
        print(f"Failed to seed items: {e}")
    finally:
        db.close()

seed_items_from_excel()

# --- Frontend Static Serving ---
frontend_path = get_frontend_path()

if frontend_path:
    # Mount assets if they exist (Vite structure)
    assets_path = os.path.join(frontend_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Note: This catch-all must be last
        target_file = os.path.join(frontend_path, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
            
        return FileResponse(os.path.join(frontend_path, "index.html"))

if __name__ == "__main__":
    import uvicorn
    # When running as exe, we usually want to open the browser automatically?
    # Or just start the server. Start server for now.
    uvicorn.run(app, host="127.0.0.1", port=8000)
