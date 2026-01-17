"""
Configuración y utilidades para HashiCorp Vault Transit Engine
"""
import os
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class VaultConfig(BaseModel):
    """Configuración de Vault"""
    addr: str = Field(..., description="URL de Vault")
    role_id: Optional[str] = Field(None, description="AppRole Role ID")
    secret_id: Optional[str] = Field(None, description="AppRole Secret ID")
    token: Optional[str] = Field(None, description="Token de autenticación (para desarrollo)")
    transit_key_name: str = Field(default="fitflow-django-key", description="Nombre de la clave en Transit")
    transit_mount_path: str = Field(default="transit", description="Mount path del Transit Engine")
    request_timeout: int = Field(default=5, description="Timeout en segundos para requests a Vault")
    max_retries: int = Field(default=3, description="Máximo número de reintentos")
    cache_ttl: int = Field(default=3600, description="TTL del caché de tokens en segundos")
    
    # Configuración de cifrado
    encrypt_requests: bool = Field(default=True, description="Cifrar requests salientes")
    encrypt_responses: bool = Field(default=True, description="Cifrar responses entrantes")
    django_api_base_url: Optional[str] = Field(None, description="URL base de la API Django")
    
    @field_validator('addr')
    @classmethod
    def validate_addr(cls, v: str) -> str:
        if not v:
            raise ValueError("VAULT_ADDR no puede estar vacío")
        if not v.startswith(('http://', 'https://')):
            raise ValueError("VAULT_ADDR debe comenzar con http:// o https://")
        return v.rstrip('/')
    
    @field_validator('transit_key_name')
    @classmethod
    def validate_key_name(cls, v: str) -> str:
        if not v:
            raise ValueError("Nombre de clave no puede estar vacío")
        return v
    
    def has_auth(self) -> bool:
        """Verifica si hay método de autenticación configurado"""
        return bool(self.token or (self.role_id and self.secret_id))
    
    @property
    def vault_addr(self) -> str:
        """Alias para addr (compatibilidad)"""
        return self.addr
    
    class Config:
        env_prefix = "VAULT_"
        case_sensitive = False


def load_vault_config() -> VaultConfig:
    """
    Carga la configuración de Vault desde variables de entorno
    
    Variables de entorno esperadas:
    - VAULT_ADDR: URL de Vault (requerido)
    - VAULT_ROLE_ID: Role ID para AppRole (opcional)
    - VAULT_SECRET_ID: Secret ID para AppRole (opcional)
    - VAULT_TOKEN: Token de autenticación (opcional, para desarrollo)
    - VAULT_TRANSIT_KEY_NAME: Nombre de la clave (default: fitflow-django-key)
    - VAULT_TRANSIT_MOUNT_PATH: Mount path (default: transit)
    - VAULT_REQUEST_TIMEOUT: Timeout en segundos (default: 5)
    - VAULT_MAX_RETRIES: Máximo de reintentos (default: 3)
    - VAULT_CACHE_TTL: TTL del caché (default: 3600)
    - ENCRYPT_REQUESTS_TO_DJANGO: Cifrar requests (default: true)
    - ENCRYPT_RESPONSES_FROM_DJANGO: Cifrar responses (default: true)
    - DJANGO_API_BASE_URL: URL base de Django (opcional)
    """
    config = VaultConfig(
        addr=os.getenv("VAULT_ADDR", "http://localhost:8200"),
        role_id=os.getenv("VAULT_ROLE_ID"),
        secret_id=os.getenv("VAULT_SECRET_ID"),
        token=os.getenv("VAULT_TOKEN"),
        transit_key_name=os.getenv("VAULT_TRANSIT_KEY_NAME", "fitflow-django-key"),
        transit_mount_path=os.getenv("VAULT_TRANSIT_MOUNT_PATH", "transit"),
        request_timeout=int(os.getenv("VAULT_REQUEST_TIMEOUT", "5")),
        max_retries=int(os.getenv("VAULT_MAX_RETRIES", "3")),
        cache_ttl=int(os.getenv("VAULT_CACHE_TTL", "3600")),
        encrypt_requests=os.getenv("ENCRYPT_REQUESTS_TO_DJANGO", "true").lower() == "true",
        encrypt_responses=os.getenv("ENCRYPT_RESPONSES_FROM_DJANGO", "true").lower() == "true",
        django_api_base_url=os.getenv("DJANGO_API_BASE_URL"),
    )
    
    # Solo validar autenticación si se intenta usar
    # En desarrollo, puede no estar configurado inicialmente
    return config

