from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    name: str = ""


class UserLogin(BaseModel):
    email: str
    password: str


class UserInDB(BaseModel):
    id: str
    email: str
    name: str = ""
    hashed_password: str
    created_at: datetime

    class Config:
        populate_by_name = True


class UserPublic(BaseModel):
    id: str
    email: str
    name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
