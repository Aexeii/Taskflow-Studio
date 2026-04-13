from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from mutagen import File as MutagenFile

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import Base, engine, get_db
from app.models import Playlist, PlaylistTrack, SyncState, Track, User
from app.schemas import (
    AuthResponse,
    LoginRequest,
    PlaylistCreateRequest,
    PlaylistResponse,
    PlaylistTrackRequest,
    RegisterRequest,
    SyncStateRequest,
    SyncStateResponse,
    TrackResponse,
    UserResponse,
)


APP_ENV = os.getenv("APP_ENV", "development")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aero Music API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _track_to_response(track: Track) -> TrackResponse:
    return TrackResponse.model_validate(track)


def _playlist_to_response(playlist: Playlist) -> PlaylistResponse:
    tracks = [_track_to_response(link.track) for link in playlist.track_links]
    return PlaylistResponse(
        id=playlist.id,
        name=playlist.name,
        created_at=playlist.created_at,
        tracks=tracks,
    )


@app.get("/health")
def health_check():
    return {"status": "ok", "environment": APP_ENV}


@app.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=request.email.lower(),
        password_hash=hash_password(request.password),
        display_name=request.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id), user=UserResponse.model_validate(user))


@app.post("/auth/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if user is None or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return AuthResponse(access_token=create_access_token(user.id), user=UserResponse.model_validate(user))


@app.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@app.get("/tracks", response_model=list[TrackResponse])
def list_tracks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tracks = (
        db.query(Track)
        .filter(Track.owner_id == current_user.id)
        .order_by(Track.created_at.desc())
        .all()
    )
    return [_track_to_response(track) for track in tracks]


@app.post("/tracks/upload", response_model=TrackResponse, status_code=status.HTTP_201_CREATED)
def upload_track(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    suffix = Path(file.filename or "track.bin").suffix.lower()
    if suffix not in {".mp3", ".wav"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .mp3 and .wav are supported")

    user_dir = UPLOAD_DIR / str(current_user.id)
    user_dir.mkdir(parents=True, exist_ok=True)
    destination = user_dir / (Path(file.filename or "track").name)

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    title = destination.stem
    artist = "Unknown Artist"
    duration = 0.0

    try:
        audio = MutagenFile(str(destination), easy=True)
        if audio is not None:
            duration = float(getattr(getattr(audio, "info", None), "length", 0.0) or 0.0)
            if audio.tags:
                title = str((audio.tags.get("title") or [title])[0])
                artist = str((audio.tags.get("artist") or [artist])[0])
    except Exception:
        pass

    track = Track(
        owner_id=current_user.id,
        title=title,
        artist=artist,
        duration=duration,
        file_path=str(destination),
        original_filename=file.filename or destination.name,
    )
    db.add(track)
    db.commit()
    db.refresh(track)
    return _track_to_response(track)


@app.get("/playlists", response_model=list[PlaylistResponse])
def list_playlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    playlists = (
        db.query(Playlist)
        .filter(Playlist.owner_id == current_user.id)
        .order_by(Playlist.created_at.desc())
        .all()
    )
    return [_playlist_to_response(playlist) for playlist in playlists]


@app.post("/playlists", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    request: PlaylistCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    playlist = Playlist(owner_id=current_user.id, name=request.name)
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    return _playlist_to_response(playlist)


@app.post("/playlists/{playlist_id}/tracks", response_model=PlaylistResponse)
def add_track_to_playlist(
    playlist_id: int,
    request: PlaylistTrackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.owner_id == current_user.id).first()
    if playlist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    track = db.query(Track).filter(Track.id == request.track_id, Track.owner_id == current_user.id).first()
    if track is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    existing = (
        db.query(PlaylistTrack)
        .filter(PlaylistTrack.playlist_id == playlist.id, PlaylistTrack.track_id == track.id)
        .first()
    )
    if existing is None:
        db.add(PlaylistTrack(playlist_id=playlist.id, track_id=track.id))
        db.commit()
        db.refresh(playlist)

    playlist = db.query(Playlist).filter(Playlist.id == playlist.id).first()
    return _playlist_to_response(playlist)


@app.get("/sync/state", response_model=SyncStateResponse)
def get_sync_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    state = db.query(SyncState).filter(SyncState.owner_id == current_user.id).first()
    if state is None:
        return SyncStateResponse(payload={}, updated_at=None)
    return SyncStateResponse(payload=json.loads(state.payload or "{}"), updated_at=state.updated_at)


@app.put("/sync/state", response_model=SyncStateResponse)
def update_sync_state(
    request: SyncStateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    state = db.query(SyncState).filter(SyncState.owner_id == current_user.id).first()
    if state is None:
        state = SyncState(owner_id=current_user.id, payload=json.dumps(request.payload))
        db.add(state)
    else:
        state.payload = json.dumps(request.payload)
    db.commit()
    db.refresh(state)
    return SyncStateResponse(payload=request.payload, updated_at=state.updated_at)
