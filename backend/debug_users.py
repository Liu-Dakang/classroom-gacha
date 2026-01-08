from database import SessionLocal
import models

def list_users():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"ID: {u.id}, User: {u.username}, IsAdmin: {u.is_admin}, Hash: {u.hashed_password[:10]}...")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
