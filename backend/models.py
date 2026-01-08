from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

    students = relationship("Student", back_populates="owner", cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    dorm_number = Column(String, nullable=True)
    stars = Column(Integer, default=0)
    pick_count = Column(Integer, default=0)
    immunity = Column(Integer, default=0)
    is_cursed = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id")) # Link to User (Class)

    owner = relationship("User", back_populates="students")
    items = relationship("StudentItem", back_populates="student", cascade="all, delete-orphan")

class ItemCard(Base):
    __tablename__ = "item_cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # RPG Name
    description = Column(String) # Original meaning / Description
    function_desc = Column(String) # Functional description
    image_path = Column(String) 
    do_type = Column(Integer, default=1) # 0: Negative, 1: Positive
    probability = Column(Float, default=1.0)

class StudentItem(Base):
    __tablename__ = "student_items"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    item_card_id = Column(Integer, ForeignKey("item_cards.id"))

    student = relationship("Student", back_populates="items")
    item_card = relationship("ItemCard")
