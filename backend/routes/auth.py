import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Security, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import shutil
from pydantic import BaseModel
from bson import ObjectId

from database_mongo import get_db, log_activity

router = APIRouter()

# Load secrets from environment
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_pricepilot_access_key_2026")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "super_secret_pricepilot_refresh_key_2026")

security = HTTPBearer()

# --- PYDANTIC SCHEMAS ---

class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    company: str
    password: str
    password_confirm: str
    role: str = "Pricing Manager"

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: str
    company: str | None = ""
    phone: str | None = ""
    profile_image: str | None = ""

# --- SECURITY HELPERS ---

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload.update({
        "exp": datetime.utcnow() + timedelta(minutes=60),  # 60 minutes
        "type": "access"
    })
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def create_refresh_token(data: dict) -> str:
    payload = data.copy()
    payload.update({
        "exp": datetime.utcnow() + timedelta(days=7),  # 7 days
        "type": "refresh"
    })
    return jwt.encode(payload, JWT_REFRESH_SECRET, algorithm="HS256")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        db = get_db()
        user = db.users.find_one({"email": email.lower().strip()})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        user["_id"] = str(user["_id"])
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- ENDPOINTS ---

import re

@router.post("/register")
def register(req: RegisterRequest):
    db = get_db()
    email = req.email.lower().strip()
    
    # 1. Email format check
    if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
        raise HTTPException(status_code=400, detail="Invalid email format.")
        
    # 2. Unique email check
    if db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="User already registered.")
        
    # 3. Mobile number validation (allow digits, optional '+' at start, spaces/dashes, min length 7, max length 15)
    phone_clean = re.sub(r"[\s-]", "", req.phone)
    if not re.match(r"^\+?\d{7,15}$", phone_clean):
        raise HTTPException(status_code=400, detail="Invalid mobile number format. Must be 7-15 digits.")
        
    # 4. Strong password validation
    if len(req.password) < 8 or not any(c.isdigit() for c in req.password) or not any(c.isalpha() for c in req.password):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long and contain both letters and numbers.")
        
    # 5. Matching passwords check
    if req.password != req.password_confirm:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
        
    hashed = hash_password(req.password)
    new_user = {
        "name": req.name.strip(),
        "email": email,
        "phone": req.phone.strip(),
        "company": req.company.strip(),
        "password_hash": hashed,
        "role": req.role,
        "profile_image": "", # Empty default avatar image
        "created_date": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "active_dataset_hash": None
    }
    
    res = db.users.insert_one(new_user)
    log_activity(str(res.inserted_id), "Register", f"User registered: {email}")
    return {"status": "success", "message": "User registered successfully."}

@router.post("/login")
def login(req: LoginRequest):
    db = get_db()
    email = req.email.lower().strip()
    
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password.")
        
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
        
    user_id = str(user["_id"])
    
    # Generate tokens
    access_token = create_access_token({"email": email, "role": user["role"], "user_id": user_id})
    refresh_token = create_refresh_token({"email": email, "user_id": user_id})
    
    # Save session in database
    db.sessions.insert_one({
        "user_id": user_id,
        "refresh_token": refresh_token,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=7)
    })
    
    # Update last login
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    log_activity(user_id, "Login", "User logged in successfully")
    
    return {
        "status": "success",
        "token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "name": user["name"],
            "email": email,
            "role": user["role"],
            "company": user.get("company", ""),
            "phone": user.get("phone", ""),
            "profile_image": user.get("profile_image", ""),
            "active_dataset_hash": user.get("active_dataset_hash")
        }
    }

@router.post("/refresh")
def refresh_token(req: RefreshRequest):
    db = get_db()
    try:
        payload = jwt.decode(req.refresh_token, JWT_REFRESH_SECRET, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        user_id = payload.get("user_id")
        email = payload.get("email")
        
        # Verify session exists in DB
        session = db.sessions.find_one({"user_id": user_id, "refresh_token": req.refresh_token})
        if not session:
            raise HTTPException(status_code=401, detail="Session expired or logged out")
            
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        # Issue new access token
        new_access_token = create_access_token({"email": email, "role": user["role"], "user_id": user_id})
        
        return {
            "status": "success",
            "token": new_access_token
        }
    except jwt.ExpiredSignatureError:
        # Clean up session if expired
        db.sessions.delete_one({"refresh_token": req.refresh_token})
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
def logout(req: LogoutRequest):
    db = get_db()
    # Remove session from DB
    db.sessions.delete_one({"refresh_token": req.refresh_token})
    return {"status": "success", "message": "Logged out successfully"}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "status": "success",
        "user": {
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "company": current_user.get("company", ""),
            "phone": current_user.get("phone", ""),
            "profile_image": current_user.get("profile_image", "https://i.pravatar.cc/150?img=12")
        }
    }

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]
    
    # Verify current password
    if not verify_password(req.current_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
        
    # Update password
    new_hash = hash_password(req.new_password)
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": new_hash}}
    )
    
    # Invalidate all active sessions for this user
    db.sessions.delete_many({"user_id": user_id})
    
    log_activity(user_id, "Change Password", "User changed password; all sessions invalidated")
    
    return {"status": "success", "message": "Password updated successfully. Please log in again."}

@router.put("/profile")
def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]
    
    update_data = {
        "name": req.name,
        "company": req.company or "",
        "phone": req.phone or ""
    }
    
    if req.profile_image:
        update_data["profile_image"] = req.profile_image
        
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    log_activity(user_id, "Update Profile", "User updated profile information")
    
    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "name": req.name,
            "email": current_user["email"],
            "role": current_user["role"],
            "company": req.company or "",
            "phone": req.phone or "",
            "profile_image": req.profile_image or current_user.get("profile_image", ""),
            "active_dataset_hash": current_user.get("active_dataset_hash")
        }
    }

@router.post("/profile/upload-image")
def upload_profile_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    db = get_db()
    
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Only JPG, JPEG, PNG, or WEBP images are allowed.")
        
    profile_dir = "uploads/profile"
    os.makedirs(profile_dir, exist_ok=True)
    
    file_path = f"{profile_dir}/{user_id}.{ext}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image file: {str(e)}")
        
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"profile_image": f"/api/uploads/profile/{user_id}.{ext}"}}
    )
    
    updated_user = db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["_id"] = str(updated_user["_id"])
    
    return {
        "status": "success",
        "message": "Profile image uploaded successfully.",
        "profile_image": f"/api/uploads/profile/{user_id}.{ext}",
        "user": {
            "name": updated_user["name"],
            "email": updated_user["email"],
            "role": updated_user["role"],
            "company": updated_user.get("company", ""),
            "phone": updated_user.get("phone", ""),
            "profile_image": f"/api/uploads/profile/{user_id}.{ext}"
        }
    }

import secrets

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    db = get_db()
    email = req.email.lower().strip()
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="User with this email does not exist.")
    
    # Check rate limit (last sent timestamp)
    last_sent = user.get("otp_last_sent")
    if last_sent and (datetime.utcnow() - last_sent) < timedelta(seconds=60):
        raise HTTPException(status_code=400, detail="Please wait 60 seconds before requesting another OTP.")
    
    otp_code = f"{random.randint(100000, 999999)}"
    expires = datetime.utcnow() + timedelta(minutes=5)
    
    db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "otp_code": otp_code,
                "otp_expires": expires,
                "otp_verified_flag": False,
                "otp_last_sent": datetime.utcnow()
            }
        }
    )
    
    send_otp_email(email, otp_code)
    
    return {
        "status": "success",
        "message": "OTP generated successfully."
    }

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    db = get_db()
    email = req.email.lower().strip()
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
        
    otp_code = user.get("otp_code")
    otp_expires = user.get("otp_expires")
    otp_verified_flag = user.get("otp_verified_flag")
    
    if not otp_code or otp_code != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
        
    if not otp_expires or datetime.utcnow() > otp_expires:
        raise HTTPException(status_code=400, detail="OTP has expired.")
        
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"otp_verified_flag": True}}
    )
    
    return {
        "status": "success",
        "message": "OTP verified successfully. You can now reset your password."
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    db = get_db()
    email = req.email.lower().strip()
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
        
    otp_code = user.get("otp_code")
    otp_expires = user.get("otp_expires")
    otp_verified_flag = user.get("otp_verified_flag")
    
    if not otp_code or otp_code != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
        
    if not otp_expires or datetime.utcnow() > otp_expires:
        raise HTTPException(status_code=400, detail="OTP has expired.")
        
    if not otp_verified_flag:
        raise HTTPException(status_code=400, detail="Please verify the OTP code first.")
        
    new_hash = hash_password(req.new_password)
    db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password_hash": new_hash},
            "$unset": {
                "otp_code": "",
                "otp_expires": "",
                "otp_verified_flag": "",
                "otp_last_sent": ""
            }
        }
    )
    
    db.sessions.delete_many({"user_id": str(user["_id"])})
    log_activity(str(user["_id"]), "Reset Password", "User reset password via recovery OTP; all sessions invalidated")
    
    return {"status": "success", "message": "Password reset successfully. Please log in with your new password."}
