from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.deps import get_current_user
from backend.auth.utils import (
    create_access_token,
    generate_otp,
    get_password_hash,
    hash_otp,
    send_otp_email,
    verify_otp,
    verify_password,
)
from backend.db.session import get_db
from backend.models.otp_verification import OTPVerification
from backend.models.user import User
from backend.schemas.user import (
    AuthResponse,
    OTPResponse,
    ResendOTPRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyOTPRequest,
)
from backend.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=OTPResponse,
    status_code=status.HTTP_200_OK,
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    hashed_password = get_password_hash(user_in.password)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    existing = (
        db.query(OTPVerification)
        .filter(OTPVerification.email == user_in.email)
        .first()
    )
    if existing:
        existing.otp_hash = otp_hash
        existing.name = user_in.name
        existing.hashed_password = hashed_password
        existing.expires_at = expires_at
        existing.attempts = 0
        existing.last_sent_at = now
    else:
        record = OTPVerification(
            email=user_in.email,
            otp_hash=otp_hash,
            name=user_in.name,
            hashed_password=hashed_password,
            expires_at=expires_at,
            last_sent_at=now,
        )
        db.add(record)
    db.commit()

    sent, error_msg = send_otp_email(user_in.email, otp)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg or "Failed to send verification email.",
        )

    return OTPResponse(
        message="Verification code sent to your email.",
        email=user_in.email,
    )


@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp_endpoint(
    req: VerifyOTPRequest, db: Session = Depends(get_db)
):
    record = (
        db.query(OTPVerification)
        .filter(OTPVerification.email == req.email)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code found. Please register again.",
        )

    if datetime.now(timezone.utc) > record.expires_at:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please register again.",
        )

    if record.attempts >= settings.OTP_MAX_ATTEMPTS:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed attempts. Please register again.",
        )

    if not verify_otp(req.otp, record.otp_hash):
        record.attempts += 1
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code.",
        )

    if db.query(User).filter(User.email == req.email).first():
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=record.email,
        name=record.name,
        hashed_password=record.hashed_password,
    )
    db.add(user)
    db.delete(record)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/resend-otp", response_model=OTPResponse)
def resend_otp(req: ResendOTPRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    record = (
        db.query(OTPVerification)
        .filter(OTPVerification.email == req.email)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification found. Please register again.",
        )

    now = datetime.now(timezone.utc)
    elapsed = (now - record.last_sent_at).total_seconds()
    if elapsed < settings.OTP_RESEND_SECONDS:
        remaining = int(settings.OTP_RESEND_SECONDS - elapsed)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining} seconds before requesting a new code.",
        )

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    record.otp_hash = otp_hash
    record.expires_at = expires_at
    record.last_sent_at = now
    record.attempts = 0
    db.commit()

    sent, error_msg = send_otp_email(req.email, otp)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg or "Failed to send verification email.",
        )

    return OTPResponse(
        message="New verification code sent to your email.",
        email=req.email,
    )


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(
        login_in.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
