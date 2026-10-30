
import hashlib
import secrets
import smtplib
from email.message import EmailMessage
import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import DuplicateKeyError

from database import users_collection


router = APIRouter(prefix="/auth", tags=["Authentication"])

password_hash = PasswordHash.recommended()
security = HTTPBearer()

JWT_SECRET = os.getenv("MEDI_AI_JWT_SECRET", "mediai_dev_secret_key_change_in_production_2026")

JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 2


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)



class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    new_password: str = Field(min_length=8, max_length=128)


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register", status_code=201)
def register(data: RegisterRequest):
    email = str(data.email).strip().lower()

    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email is already registered")

    user = {
        "name": data.name.strip(),
        "email": email,
        "password_hash": password_hash.hash(data.password),
        "created_at": datetime.now(timezone.utc),
    }

    try:
        result = users_collection.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email is already registered")

    return {
        "message": "Registration successful",
        "user_id": str(result.inserted_id),
    }


@router.post("/login")
def login(data: LoginRequest):
    email = str(data.email).strip().lower()
    user = users_collection.find_one({"email": email})

    if not user or not password_hash.verify(
        data.password, user["password_hash"]
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user["_id"]))

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        },
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = users_collection.find_one({"_id": object_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }
    
def send_reset_email(email: str, reset_link: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL")

    if not all([
        smtp_host,
        smtp_username,
        smtp_password,
        from_email,
    ]):
        raise RuntimeError(
            "Email settings are missing. Configure SMTP environment variables."
        )

    message = EmailMessage()
    message["Subject"] = "Reset your MediAI password"
    message["From"] = from_email
    message["To"] = email
    message.set_content(
        "We received a request to reset your MediAI password.\n\n"
        f"Open this link to choose a new password:\n{reset_link}\n\n"
        "This link expires in 15 minutes and can only be used once.\n"
        "If you did not request this, you can ignore this email."
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(message)


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    email = str(data.email).strip().lower()
    user = users_collection.find_one({"email": email})

    # Avoid revealing whether an email is registered.
    if not user:
        return {
            "message": (
                "If an account exists for that email, "
                "password-reset instructions will be sent."
            )
        }

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=15)

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_reset_token_hash": token_hash,
                "password_reset_expires_at": expires_at,
            }
        },
    )

    frontend_url = os.getenv(
        "FRONTEND_BASE_URL",
        "http://localhost:5173",
    ).rstrip("/")

    reset_link = (
        f"{frontend_url}/reset-password"
        f"?token={raw_token}"
    )

    try:
        send_reset_email(email, reset_link)
    except Exception:
        # Remove the token if email delivery fails.
        users_collection.update_one(
            {
                "_id": user["_id"],
                "password_reset_token_hash": token_hash,
            },
            {
                "$unset": {
                    "password_reset_token_hash": "",
                    "password_reset_expires_at": "",
                }
            },
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to send the reset email. "
                "Please try again later."
            ),
        )

    return {
        "message": (
            "If an account exists for that email, "
            "password-reset instructions will be sent."
        )
    }


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    token_hash = hashlib.sha256(
        data.token.encode("utf-8")
    ).hexdigest()

    now = datetime.now(timezone.utc)

    user = users_collection.find_one({
        "password_reset_token_hash": token_hash,
        "password_reset_expires_at": {"$gt": now},
    })

    if not user:
        raise HTTPException(
            status_code=400,
            detail="The reset link is invalid or has expired.",
        )

    result = users_collection.update_one(
        {
            "_id": user["_id"],
            "password_reset_token_hash": token_hash,
            "password_reset_expires_at": {"$gt": now},
        },
        {
            "$set": {
                "password_hash": password_hash.hash(
                    data.new_password
                )
            },
            "$unset": {
                "password_reset_token_hash": "",
                "password_reset_expires_at": "",
            },
        },
    )

    if result.modified_count != 1:
        raise HTTPException(
            status_code=400,
            detail="The reset link is invalid or has expired.",
        )

    return {
        "message": (
            "Password reset successfully. Please sign in "
            "with your new password."
        )
    }
    