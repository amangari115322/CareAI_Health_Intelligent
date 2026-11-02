"""
Auth router — signup, login, JWT token.
"""

import uuid
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select

from database import get_session
from db_models import UserRow
from models.user import UserCreate, UserLogin, UserInDB, UserPublic, Token
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    async with get_session() as session:
        result = await session.execute(
            select(UserRow).where(UserRow.id == user_id)
        )
        row = result.scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=401, detail="User not found")

    return UserPublic(id=row.id, email=row.email, name=row.name or "")


@router.post("/signup", response_model=Token)
async def signup(body: UserCreate):
    async with get_session() as session:
        # Check for existing email
        result = await session.execute(
            select(UserRow).where(UserRow.email == body.email)
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = str(uuid.uuid4())
        user_row = UserRow(
            id=user_id,
            email=body.email,
            name=body.name,
            hashed_password=hash_password(body.password),
            created_at=datetime.utcnow(),
        )
        session.add(user_row)
        # commit happens automatically in get_session().__aexit__

    token = create_access_token({"sub": user_id})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    async with get_session() as session:
        result = await session.execute(
            select(UserRow).where(UserRow.email == form.username)
        )
        row = result.scalar_one_or_none()

    if not row or not verify_password(form.password, row.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": row.id})
    return Token(access_token=token)


@router.get("/me", response_model=UserPublic)
async def me(current_user: UserPublic = Depends(get_current_user)):
    return current_user
