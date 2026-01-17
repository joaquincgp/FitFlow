"""
Middleware de descifrado para FastAPI
Descifra requests entrantes de Django usando Vault Transit Engine
"""
import json
import logging
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.types import ASGIApp

from fitFlow.backend.app.core.vault import VaultClient, get_vault_client
from fitFlow.backend.app.core.vault_config import load_vault_config

logger = logging.getLogger(__name__)


class DecryptionMiddleware(BaseHTTPMiddleware):
    """
    Middleware que descifra payloads entrantes usando Vault Transit Engine
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        try:
            self.config = load_vault_config()
            self.vault_client = get_vault_client()
        except Exception as e:
            logger.warning(f"No se pudo inicializar Vault en middleware: {e}")
            self.config = None
            self.vault_client = None
    
    def _is_encrypted_request(self, request: Request) -> bool:
        """Determina si un request entrante está cifrado"""
        if self.config is None or not self.config.encrypt_responses:
            return False
        
        encrypted_header = request.headers.get("X-Encrypted")
        logger.info(f"Header X-Encrypted: {encrypted_header}")
        return encrypted_header == "true"
    
    async def _decrypt_request_body(self, body: bytes) -> bytes:
        """Descifra el body de un request"""
        if self.vault_client is None:
            logger.error("Vault client no está disponible")
            raise ValueError("Vault client no está disponible")
        
        try:
            body_str = body.decode('utf-8')
            logger.info(f"Body recibido (primeros 200 chars): {body_str[:200]}")
            
            encrypted_data = json.loads(body_str)
            
            if not isinstance(encrypted_data, dict) or "encrypted_data" not in encrypted_data:
                logger.warning("Request no tiene formato de cifrado válido")
                return body
            
            logger.info("Descifrando datos...")
            decrypted = await self.vault_client.decrypt_json(encrypted_data)
            logger.info(f"Datos descifrados: {decrypted}")
            
            decrypted_json = json.dumps(decrypted, ensure_ascii=False)
            return decrypted_json.encode('utf-8')
        except json.JSONDecodeError as e:
            logger.warning(f"Body no es JSON válido: {e}")
            return body
        except Exception as e:
            logger.error(f"Error descifrando request body: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Procesa el request y descifra si es necesario"""
        # Log básico para verificar que el middleware se ejecuta
        print(f"[MIDDLEWARE] Request recibido: {request.method} {request.url.path}")
        print(f"[MIDDLEWARE] Header X-Encrypted: {request.headers.get('X-Encrypted')}")
        
        logger.info(f"Request recibido: {request.method} {request.url.path}")
        logger.info(f"Headers: X-Encrypted={request.headers.get('X-Encrypted')}, Content-Type={request.headers.get('Content-Type')}")
        
        if self._is_encrypted_request(request):
            try:
                print("[MIDDLEWARE] Request marcado como cifrado, procediendo a descifrar...")
                logger.info("Request marcado como cifrado, procediendo a descifrar...")
                
                # Leer body
                body = await request.body()
                
                # Descifrar
                decrypted_body = await self._decrypt_request_body(body)
                
                # Crear un nuevo scope con el body descifrado
                async def receive():
                    return {
                        "type": "http.request",
                        "body": decrypted_body,
                        "more_body": False
                    }
                
                # Reemplazar el receive del request
                request._receive = receive
                
                # También necesitamos actualizar el _body para que FastAPI lo use
                request._body = decrypted_body
                
                print("[MIDDLEWARE] Request descifrado correctamente")
                logger.info("Request descifrado correctamente")
                
            except Exception as e:
                print(f"[MIDDLEWARE] Error: {e}")
                logger.error(f"Error procesando request cifrado: {e}")
                import traceback
                logger.error(traceback.format_exc())
                return JSONResponse(
                    status_code=400,
                    content={"detail": f"Error descifrando request: {str(e)}"}
                )
        else:
            print("[MIDDLEWARE] Request no está cifrado, pasando directamente")
            logger.info("Request no está cifrado, pasando directamente")
        
        response = await call_next(request)
        return response