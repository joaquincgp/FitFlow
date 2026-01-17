"""
Cliente HTTP con cifrado automático para requests salientes
"""
import json
import logging
from typing import Optional, Dict, Any
import httpx

from fitFlow.backend.app.core.vault import VaultClient, get_vault_client
from fitFlow.backend.app.core.vault_config import load_vault_config

logger = logging.getLogger(__name__)


class EncryptedHTTPClient:
    """
    Cliente HTTP que cifra automáticamente requests a APIs externas
    """
    
    def __init__(
        self,
        base_url: str,
        vault_client: Optional[VaultClient] = None,
        encrypt: bool = True
    ):
        self.base_url = base_url.rstrip('/')
        self._vault_client = vault_client  # Lazy initialization
        self.encrypt = encrypt
        self.config = load_vault_config()
        
        # Inicializar cliente HTTP
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        )
    
    @property
    def vault_client(self) -> VaultClient:
        """Lazy initialization del cliente Vault"""
        if self._vault_client is None:
            self._vault_client = get_vault_client()
        return self._vault_client
    
    async def _encrypt_body(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cifra el body del request"""
        if not self.encrypt or not self.config.encrypt_requests:
            return data
        
        try:
            encrypted = await self.vault_client.encrypt_json(data)
            return encrypted
        except Exception as e:
            logger.error(f"Error cifrando body: {e}")
            raise
    
    async def _decrypt_body(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Descifra el body del response"""
        if not self.encrypt or not self.config.encrypt_responses:
            return data
        
        # Verificar si está cifrado
        if not isinstance(data, dict) or "encrypted_data" not in data:
            return data
        
        try:
            decrypted = await self.vault_client.decrypt_json(data)
            return decrypted
        except Exception as e:
            logger.error(f"Error descifrando body: {e}")
            raise
    
    async def post(
        self,
        path: str,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
        encrypt: Optional[bool] = None,
        return_encryption_info: bool = False
    ) -> Dict[str, Any]:
        """
        POST request con cifrado automático
        
        Args:
            path: Path del endpoint
            data: Datos a enviar
            headers: Headers adicionales (incluyendo Authorization de Keycloak)
            encrypt: Override de cifrado (None usa el default)
            return_encryption_info: Si True, retorna info de cifrado en metadata
        """
        encrypt_request = encrypt if encrypt is not None else self.encrypt
        
        original_data = data.copy() if return_encryption_info else None
        encrypted_data = None
        
        logger.info(f"[HTTP Client] POST a {path}")
        logger.info(f"[HTTP Client] Encrypt request: {encrypt_request}")
        logger.info(f"[HTTP Client] Config encrypt_requests: {self.config.encrypt_requests}")
        logger.info(f"[HTTP Client] Data original: {data}")
        
        # Cifrar body si es necesario
        if encrypt_request:
            logger.info("[HTTP Client] Cifrando body del request...")
            data = await self._encrypt_body(data)
            encrypted_data = data.copy() if return_encryption_info else None
            logger.info(f"[HTTP Client] Body cifrado: {data}")
            headers = headers or {}
            headers["X-Encrypted"] = "true"
            headers["X-Encryption-Key"] = self.config.transit_key_name
            logger.info("[HTTP Client] Headers de cifrado agregados")
        else:
            logger.info("[HTTP Client] NO se cifrará el request (encrypt_request=False)")
        
        response = await self.client.post(
            path,
            json=data,
            headers=headers
        )
        response.raise_for_status()
        
        result = response.json()
        
        # Descifrar response si está cifrado
        if encrypt_request and response.headers.get("X-Encrypted") == "true":
            result = await self._decrypt_body(result)
        
        # Agregar metadata de cifrado si se solicita
        if return_encryption_info and encrypt_request:
            result["_encryption_metadata"] = {
                "encrypted": True,
                "original_data": original_data,
                "encrypted_data": encrypted_data,
                "vault_key": self.config.transit_key_name,
                "vault_addr": self.config.vault_addr
            }
        
        return result
    
    async def get(
        self,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """GET request"""
        response = await self.client.get(
            path,
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        result = response.json()
        
        # Descifrar response si está cifrado
        if response.headers.get("X-Encrypted") == "true":
            result = await self._decrypt_body(result)
        
        return result
    
    async def put(
        self,
        path: str,
        data: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
        encrypt: Optional[bool] = None
    ) -> Dict[str, Any]:
        """PUT request con cifrado automático"""
        encrypt_request = encrypt if encrypt is not None else self.encrypt
        
        if encrypt_request:
            data = await self._encrypt_body(data)
            headers = headers or {}
            headers["X-Encrypted"] = "true"
            headers["X-Encryption-Key"] = self.config.transit_key_name
        
        response = await self.client.put(
            path,
            json=data,
            headers=headers
        )
        response.raise_for_status()
        
        result = response.json()
        
        if encrypt_request and response.headers.get("X-Encrypted") == "true":
            result = await self._decrypt_body(result)
        
        return result
    
    async def delete(
        self,
        path: str,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """DELETE request"""
        response = await self.client.delete(path, headers=headers)
        response.raise_for_status()
        
        if response.content:
            result = response.json()
            if response.headers.get("X-Encrypted") == "true":
                result = await self._decrypt_body(result)
            return result
        return {}
    
    async def close(self):
        """Cierra el cliente"""
        await self.client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


def get_django_client() -> EncryptedHTTPClient:
    """
    Obtiene un cliente HTTP configurado para Django con cifrado
    """
    config = load_vault_config()
    if not config.django_api_base_url:
        raise ValueError("DJANGO_API_BASE_URL no está configurado")
    
    return EncryptedHTTPClient(
        base_url=config.django_api_base_url,
        encrypt=config.encrypt_requests
    )

