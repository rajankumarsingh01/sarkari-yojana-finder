from fastapi import Header, HTTPException
from app.config import settings

# FastAPI dependency: runs before the route handler, like Express middleware.
# Header(...) means this header is required on the request.
async def verify_internal_key(x_internal_key: str = Header(...)):
    if x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Invalid internal API key")