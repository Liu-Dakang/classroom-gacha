from database import SessionLocal
import models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def seed_admin_user():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if admin:
            db.delete(admin)
            db.commit()
            print("Deleted old admin")
        
        hashed_pwd = pwd_context.hash("admin")
        admin_user = models.User(username="admin", hashed_password=hashed_pwd, is_admin=True)
        db.add(admin_user)
        db.commit()
        print("Seeded Admin User (admin/admin)")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Admin seed error: {type(e).__name__}: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin_user()
