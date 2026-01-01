"""
Authentication schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    access_token: str
    refresh_token: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: Optional[Dict] = None


class TokenData(BaseModel):
    email: Optional[str] = None