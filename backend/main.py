from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import SessionLocal, engine
import pandas as pd
import io
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import random
import os
import sys
from sqlalchemy import text # Import text for raw sql

models.Base.metadata.create_all(bind=engine)

# Helper to ensure column exists (Migration hack for SQLite)
def check_db_schema():
    db = SessionLocal()
    try:
        # Check if immunity column exists by trying to select it
        try:
            db.execute(text("SELECT immunity FROM students LIMIT 1"))
        except Exception:
            print("adding immunity column...")
            db.execute(text("ALTER TABLE students ADD COLUMN immunity INTEGER DEFAULT 0"))
            db.commit()

        # Check is_cursed column
        try:
            db.execute(text("SELECT is_cursed FROM students LIMIT 1"))
        except Exception:
            print("adding is_cursed column...")
            db.execute(text("ALTER TABLE students ADD COLUMN is_cursed BOOLEAN DEFAULT 0"))
            db.execute(text("ALTER TABLE students ADD COLUMN is_cursed BOOLEAN DEFAULT 0"))
            db.commit()

        # Check item_cards columns
        try:
            db.execute(text("SELECT do_type FROM item_cards LIMIT 1"))
        except Exception:
            print("adding do_type and probability columns...")
            db.execute(text("ALTER TABLE item_cards ADD COLUMN do_type INTEGER DEFAULT 1"))
            db.execute(text("ALTER TABLE item_cards ADD COLUMN probability FLOAT DEFAULT 1.0"))
            db.commit()
    except Exception as e:
        print(f"Schema check error: {e}")
    finally:
        db.close()

check_db_schema()

app = FastAPI()

# --- Helpers ---
def get_frontend_path():
    if getattr(sys, 'frozen', False):
        return os.path.join(sys._MEIPASS, "static")
    return "static"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images
# Mount static files for images
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Students ---
@app.get("/students", response_model=List[schemas.Student])
def read_students(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return students

@app.put("/students/{student_id}/immunity")
def update_student_immunity(student_id: int, immunity: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.immunity = immunity
    db.commit()
    db.refresh(student)
    return student

@app.post("/advance_turn")
def advance_turn(db: Session = Depends(get_db)):
    # Decrement immunity for all students where immunity > 0
    db.execute(text("UPDATE students SET immunity = immunity - 1 WHERE immunity > 0"))
    db.commit()
    return {"message": "Turn advanced"}

@app.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_student.stars = student.stars
    db_student.pick_count = student.pick_count
    db_student.name = student.name
    db_student.dorm_number = student.dorm_number
    db_student.immunity = student.immunity
    db_student.is_cursed = student.is_cursed
    
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

@app.get("/items", response_model=List[schemas.ItemCard])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.ItemCard).offset(skip).limit(limit).all()
    return items

@app.post("/students/{student_id}/draw_item", response_model=schemas.ItemCard)
def draw_item_for_student(student_id: int, pool_type: str = "normal", db: Session = Depends(get_db)):
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get all item cards
    items = db.query(models.ItemCard).all()
    if not items:
        raise HTTPException(status_code=404, detail="No items available in card pool")

    # Filter by pool type
    # Filter by pool type and do_type
    filtered_items = []
    if pool_type == "negative":
        # Negative cards (do_type = 0)
        filtered_items = [i for i in items if i.do_type == 0]
        # Fallback to name-based if do_type not set or empty (migration safety)
        if not filtered_items:
             neg_names = ["群体沉默", "末日审判", "黑暗诅咒", "一夫当关"]
             filtered_items = [i for i in items if i.name in neg_names]
    else:
        # Normal pool (do_type = 1)
        filtered_items = [i for i in items if i.do_type == 1]
        # Fallback
        if not filtered_items:
             neg_names = ["群体沉默", "末日审判", "黑暗诅咒", "一夫当关"]
             filtered_items = [i for i in items if i.name not in neg_names]

    if not filtered_items:
         # Ultimate fallback
         filtered_items = items

    # Weighted Draw
    # Extract weights. Default to 1.0 if None
    weights = [getattr(i, 'probability', 1.0) or 1.0 for i in filtered_items]
    
    # Check if all weights are zero/valid? 
    if sum(weights) <= 0:
        weights = [1.0] * len(filtered_items)

    drawn_item = random.choices(filtered_items, weights=weights, k=1)[0]

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
    db = SessionLocal()
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

def ensure_special_cards_exist():
    """Ensure specific cards like Doomsday exist even if not in Excel"""
    db = SessionLocal()
    try:
        # Check Doomsday
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "末日审判").first():
            item = models.ItemCard(
                name="末日审判",
                description="全班所有学生星级 -1。",
                function_desc="Doomsday Judgment: All students lose 1 star.",
                image_path="" # No image specified, fontend will handle or empty
            )
            db.add(item)
            print("Added missing card: 末日审判")
        
        # Check Mass Silence
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "群体沉默").first():
            item = models.ItemCard(
                name="群体沉默",
                description="同宿舍所有学生星级 -1。",
                function_desc="Mass Silence: Dormmates lose 1 star.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 群体沉默")

        # Check Legion Glory
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "军团荣耀").first():
            item = models.ItemCard(
                name="军团荣耀",
                description="同宿舍所有学生星级 +1。",
                function_desc="Legion Glory: Dormmates gain 1 star.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 军团荣耀")

        # Check Shadow Raid
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "暗影突袭").first():
            item = models.ItemCard(
                name="暗影突袭",
                description="随机扣除一人1星。",
                function_desc="Shadow Raid: Randomly deduct 1 star from one person.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 暗影突袭")

        # Check Berserker Trial
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "狂战士试炼").first():
            item = models.ItemCard(
                name="狂战士试炼",
                description="随机挑选一名勇士，完成20个俯卧撑后得1星。",
                function_desc="Berserker Trial: Random person does 20 pushups for 1 star.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 狂战士试炼")

        # Check Mana Drain
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "法力汲取").first():
            item = models.ItemCard(
                name="法力汲取",
                description="随机汲取一人2星，若不足2星则反噬扣1星。",
                function_desc="Mana Drain: Steal 2 stars, or lose 1 if target has < 2.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 法力汲取")
            
            db.add(item)
            print("Added missing card: 法力汲取")

        # Check Stealth Cloak
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "潜行斗篷").first():
            item = models.ItemCard(
                name="潜行斗篷",
                description="接下来3次抽取，不在名单中。",
                function_desc="Stealth Cloak: Immune for next 3 draws.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 潜行斗篷")

        # Check Barrier Sanctuary
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "结界：庇护所").first():
            item = models.ItemCard(
                name="结界：庇护所",
                description="宿舍全员下一次抽取将不在名单中。",
                function_desc="Barrier Sanctuary: Dormmates immune for next 1 draw.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 结界：庇护所")
            
        # Check Universal Salvation
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "普渡众生").first():
            item = models.ItemCard(
                name="普渡众生",
                description="全班所有学生星级 +1。",
                function_desc="Universal Salvation: All students gain 1 star.",
                image_path="24.jpg"
            )
            db.add(item)
            print("Added missing card: 普渡众生")
        else:
            # Fix existing path if incorrect (migration fix)
            card = db.query(models.ItemCard).filter(models.ItemCard.name == "普渡众生").first()
            if card.image_path == "static/images/24.jpg":
                card.image_path = "24.jpg"
                db.add(card)
                print("Fixed image path for: 普渡众生")
        
        # Check Dark Curse
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "黑暗诅咒").first():
            item = models.ItemCard(
                name="黑暗诅咒",
                description="自身陷入可以负分状态，突破下限。",
                function_desc="Dark Curse: Allows negative stars.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 黑暗诅咒")

        # Check Purification
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "净化术").first():
            item = models.ItemCard(
                name="净化术",
                description="解除负分状态，分数重置为0分。",
                function_desc="Purification: Clears curse and resets negative stars to 0.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 净化术")

        # Check Abyssal Gaze
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "深渊凝视").first():
            item = models.ItemCard(
                name="深渊凝视",
                description="进行判定，具有30%概率加3星，70%概率清零。",
                function_desc="Abyssal Gaze: 30% chance +3 stars, 70% reset to 0.",
                image_path=""
            )
            db.add(item)
            print("Added missing card: 深渊凝视")

        # Check Royal PK
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "皇城PK").first():
            item = models.ItemCard(
                name="皇城PK",
                description="随机抽取一个人进行星星数量的比较，如果比对方多，则多增加一星",
                function_desc="Royal PK: Compare stars with random student. If higher, gain +1 star.",
                image_path="",
                do_type=1,
                probability=1.0
            )
            db.add(item)
            print("Added missing card: 皇城PK")

        # Check Chain Lightning
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "连锁闪电").first():
            item = models.ItemCard(
                name="连锁闪电",
                description="概率性扣自己2个星，如果没中，继承到下一个人，最多继承3次",
                function_desc="Chain Lightning: 50% chance -2 stars. On miss, jumps to next student (max 3 jumps).",
                image_path="12.jpg",
                do_type=0,
                probability=1.0
            )
            db.add(item)
            print("Added missing card: 连锁闪电")

        # Check One Man Guard (一夫当关)
        if not db.query(models.ItemCard).filter(models.ItemCard.name == "一夫当关").first():
             item = models.ItemCard(
                name="一夫当关",
                description="仅自身扣分，不会波及其他人。",
                function_desc="One Man Guard: Only user loses stars.",
                image_path="11.jpg",
                do_type=0,
                probability=1.0
            )
             db.add(item)
             print("Added missing card: 一夫当关")

        # Update images for special cards if empty (Migration Fix)
        special_card_images = {
            "末日审判": "25.jpg",
            "群体沉默": "23.jpg",
            "军团荣耀": "22.jpg",
            "暗影突袭": "21.jpg",
            "狂战士试炼": "20.jpg",
            "法力汲取": "19.jpg",
            "潜行斗篷": "18.jpg",
            "结界：庇护所": "17.jpg",
            "黑暗诅咒": "16.jpg",
            "净化术": "15.jpg",
            "深渊凝视": "14.jpg",
            "皇城PK": "13.jpg",
            "连锁闪电": "12.jpg",
            "一夫当关": "11.jpg",
            "普渡众生": "24.jpg"
        }
        
        for name, img in special_card_images.items():
            card = db.query(models.ItemCard).filter(models.ItemCard.name == name).first()
            if card and (not card.image_path or card.image_path == ""):
                card.image_path = img
                db.add(card)
                print(f"Updated image for: {name}")

        db.commit()
    except Exception as e:
        print(f"Error checking special cards: {e}")
    finally:
        db.close()

seed_items_from_excel()
ensure_special_cards_exist()

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
