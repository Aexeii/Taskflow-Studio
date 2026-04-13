from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=2, max_length=255)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    display_name: str
    created_at: datetime


class TrackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    artist: str
    duration: float
    file_path: str
    original_filename: str
    created_at: datetime


class PlaylistCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class PlaylistResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    tracks: list[TrackResponse]


class PlaylistTrackRequest(BaseModel):
    track_id: int


class SyncStateRequest(BaseModel):
    payload: dict


class SyncStateResponse(BaseModel):
    payload: dict
    updated_at: datetime | None = None
