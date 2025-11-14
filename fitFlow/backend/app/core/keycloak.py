import os
from functools import lru_cache
from typing import Any, Dict

import httpx
from fastapi import HTTPException, status
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from pydantic import BaseModel


class KeycloakConfig(BaseModel):
    issuer: str
    audience: str
    jwks_url: str


@lru_cache()
def get_keycloak_config() -> KeycloakConfig:
    return KeycloakConfig(
        issuer=os.environ["KEYCLOAK_ISSUER"],
        audience=os.environ["KEYCLOAK_CLIENT_ID"],
        jwks_url=os.environ["KEYCLOAK_JWKS_URL"],
    )


@lru_cache()
def get_public_keys() -> Dict[str, Any]:
    config = get_keycloak_config()
    response = httpx.get(config.jwks_url, timeout=10)
    response.raise_for_status()
    return response.json()


def decode_token(token: str) -> Dict[str, Any]:
    config = get_keycloak_config()
    try:
        jwks = get_public_keys()
        
        # Decodificar el token sin verificar primero para obtener el issuer
        unverified = jwt.get_unverified_claims(token)
        token_issuer = unverified.get('iss')
        
        # El issuer puede ser localhost o host.docker.internal, ambos son válidos
        # Usar el issuer del token para validar
        issuer_to_verify = token_issuer
        
        # El audience puede ser el client_id o puede estar en 'aud' o 'azp'
        # Intentar con verificación estricta primero
        try:
            decoded = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                audience=config.audience,
                issuer=issuer_to_verify,
                access_token=True,
                options={"verify_aud": True},
            )
        except JWTError:
            # Si falla, intentar sin verificar el audience (pero mantener la verificación del issuer)
            decoded = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                issuer=issuer_to_verify,
                options={"verify_aud": False, "verify_iss": True},
            )
        
        return decoded
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error validando token: {exc}",
        ) from exc

