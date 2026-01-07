from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    dorm_number = Column(String, nullable=True)
    stars = Column(Integer, default=0)
    pick_count = Column(Integer, default=0)

    items = relationship("StudentItem", back_populates="student", cascade="all, delete-orphan")

class ItemCard(Base):
    __tablename__ = "item_cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # RPG Name
    description = Column(String) # Original meaning / Description
    function_desc = Column(String) # Functional description
    image_path = Column(String) 

class StudentItem(Base):
    __tablename__ = "student_items"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    item_card_id = Column(Integer, ForeignKey("item_cards.id"))

    student = relationship("Student", back_populates="items")
    item_card = relationship("ItemCard")
