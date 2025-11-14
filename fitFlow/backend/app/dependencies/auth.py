from typing import Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

from fitFlow.backend.app.core.keycloak import decode_token


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    token_credentials: Any = Depends(bearer_scheme),
) -> Dict[str, Any]:
    if token_credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token requerido",
        )

    token = token_credentials.credentials
    claims = decode_token(token)
    return claims

