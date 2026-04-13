# Aero Music Backend

FastAPI backend for:

- user accounts
- database persistence
- personal music uploads
- playlist APIs
- sync state APIs

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment

Copy `.env.example` and set:

- `SECRET_KEY`
- `DATABASE_URL`
- `UPLOAD_DIR`
- `CORS_ORIGINS`

## Main Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /tracks`
- `POST /tracks/upload`
- `GET /playlists`
- `POST /playlists`
- `POST /playlists/{playlist_id}/tracks`
- `GET /sync/state`
- `PUT /sync/state`
