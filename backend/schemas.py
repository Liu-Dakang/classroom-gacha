from pydantic import BaseModel
from typing import Optional, List

class StudentBase(BaseModel):
    name: str
    dorm_number: Optional[str] = None
    stars: int = 0
    pick_count: int = 0
    immunity: int = 0
    is_cursed: bool = False

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int

    class Config:
        from_attributes = True

class ItemCardBase(BaseModel):
    name: str
    description: str | None = None
    function_desc: str | None = None
    image_path: str | None = None
    do_type: int = 1
    probability: float = 1.0

class ItemCard(ItemCardBase):
    id: int

    class Config:
        from_attributes = True

class StudentItemBase(BaseModel):
    student_id: int
    item_card_id: int

class StudentItem(StudentItemBase):
    id: int
    item_card: ItemCard

    class Config:
        from_attributes = True
