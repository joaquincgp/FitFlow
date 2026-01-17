"""
Endpoints de integración con Django
Recibe personas de Django y envía alimentos a Django
"""
import json
import logging
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from starlette.requests import Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.dependencies.auth import get_current_user
from fitFlow.backend.app.schemas.food import FoodCreate, FoodOut
from fitFlow.backend.app.models.food import Food

# Importaciones de Vault con manejo de errores
try:
    from fitFlow.backend.app.core.http_client import get_django_client
    from fitFlow.backend.app.core.vault import get_vault_client
    VAULT_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Vault no disponible: {e}")
    VAULT_AVAILABLE = False
    get_django_client = None
    get_vault_client = None

router = APIRouter(prefix="/integrations", tags=["Integrations"])


class EncryptRequest(BaseModel):
    """Schema para solicitar cifrado de datos"""
    data: Dict[str, Any]


class DecryptRequest(BaseModel):
    """Schema para solicitar descifrado de datos"""
    encrypted_data: str


class PersonCreate(BaseModel):
    """Schema para recibir persona de Django"""
    first_name: str
    last_name: str
    email: str
    age: int
    document: str
    phone: Optional[str] = None

@router.post("/person")
async def receive_person(
    request: Request,  # Cambiar a Request directamente
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Recibe una persona cifrada de Django
    
    El middleware de descifrado ya descifró el body antes de llegar aquí.
    Este endpoint recibe los datos descifrados.
    """
    try:
        # Leer el body (ya debería estar descifrado por el middleware)
        body = await request.body()
        body_str = body.decode('utf-8')
        
        logger.info(f"Body recibido (raw): {body_str[:200]}")
        
        # Parsear JSON
        try:
            person_data = json.loads(body_str)
        except json.JSONDecodeError as e:
            logger.error(f"Error parseando JSON: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error parseando JSON: {str(e)}"
            )
        
        logger.info(f"Recibidos datos de persona (parsed): {person_data}")
        logger.info(f"Tipo de datos: {type(person_data)}")
        
        # Verificar si los datos están cifrados (no deberían estar)
        if isinstance(person_data, dict) and "encrypted_data" in person_data:
            logger.error("Los datos aún están cifrados! El middleware no funcionó correctamente.")
            logger.error(f"Datos recibidos: {person_data}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los datos recibidos están cifrados. El middleware de descifrado no funcionó."
            )
        
        # Validar datos recibidos
        try:
            person = PersonCreate(**person_data)
        except Exception as validation_error:
            logger.error(f"Error de validación: {validation_error}")
            logger.error(f"Datos recibidos: {person_data}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error de validación: {str(validation_error)}. Datos recibidos: {person_data}"
            )
        
        logger.info(f"Persona recibida de Django: {person.first_name} {person.last_name}")
        
        return {
            "status": "success",
            "message": "Persona recibida correctamente",
            "person": {
                "first_name": person.first_name,
                "last_name": person.last_name,
                "email": person.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando persona: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error procesando persona: {str(e)}"
        )


@router.post("/food")
async def receive_food(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Recibe un alimento cifrado de Django (ProyectoCoreMVC)
    
    El middleware de descifrado ya descifró el body antes de llegar aquí.
    Este endpoint recibe los datos descifrados y los guarda en la BD.
    """
    try:
        # Leer el body (ya descifrado por el middleware)
        body = await request.body()
        body_str = body.decode('utf-8')
        
        logger.info(f"Body de alimento recibido: {body_str[:200]}")
        
        # Parsear JSON
        try:
            food_data = json.loads(body_str)
        except json.JSONDecodeError as e:
            logger.error(f"Error parseando JSON de alimento: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error parseando JSON: {str(e)}"
            )
        
        logger.info(f"Datos de alimento recibidos: {food_data}")
        
        # Verificar si los datos están cifrados (no deberían estar)
        if isinstance(food_data, dict) and "encrypted_data" in food_data:
            logger.error("Los datos del alimento aún están cifrados!")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los datos están cifrados. El middleware de descifrado no funcionó."
            )
        
        # Validar campos requeridos
        required_fields = ['name', 'calories', 'protein', 'carbs', 'fat']
        for field in required_fields:
            if field not in food_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Campo requerido faltante: {field}"
                )
        
        # Crear el alimento en la base de datos usando los nombres correctos del modelo
        new_food = Food(
            name=food_data['name'],
            description=f"Importado desde ProyectoCoreMVC",
            calories_per_portion=float(food_data['calories']),
            protein_per_portion=float(food_data['protein']),
            carbs_per_portion=float(food_data['carbs']),
            fat_per_portion=float(food_data['fat']),
            portion_unit="100g"  # Valor por defecto
        )
        
        db.add(new_food)
        db.commit()
        db.refresh(new_food)
        
        logger.info(f"Alimento guardado exitosamente: {new_food.food_id} - {new_food.name}")
        
        return {
            "status": "success",
            "message": "Alimento recibido y guardado correctamente",
            "food": {
                "id": new_food.food_id,
                "name": new_food.name,
                "calories": new_food.calories_per_portion,
                "protein": new_food.protein_per_portion,
                "carbs": new_food.carbs_per_portion,
                "fat": new_food.fat_per_portion,
                "portion_unit": new_food.portion_unit
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando alimento: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando alimento: {str(e)}"
        )


@router.post("/food/send")
async def send_food_to_django(
    food_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envía un alimento a Django (cifrado automáticamente)
    
    Este endpoint:
    1. Obtiene el alimento de la BD
    2. Lo cifra usando Vault
    3. Lo envía a Django
    4. Descifra la respuesta
    """
    if not VAULT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vault no está disponible"
        )
    
    try:
        # Obtener alimento de la BD
        food = db.query(Food).filter(Food.food_id == food_id).first()
        if not food:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alimento no encontrado"
            )
        
        # Preparar datos del alimento
        food_data = {
            "food_id": food.food_id,
            "name": food.name,
            "description": food.description,
            "calories_per_portion": food.calories_per_portion,
            "protein_per_portion": food.protein_per_portion,
            "fat_per_portion": food.fat_per_portion,
            "carbs_per_portion": food.carbs_per_portion,
            "portion_unit": food.portion_unit
        }
        
        # Enviar a Django usando cliente cifrado
        async with get_django_client() as client:
            # El cliente cifra automáticamente el request
            response = await client.post(
                "/api/integrations/food",
                data=food_data,
                headers={
                    # Aquí iría el token de Keycloak si Django lo requiere
                    # "Authorization": f"Bearer {keycloak_token}"
                }
            )
            
            return {
                "status": "success",
                "message": "Alimento enviado a Django correctamente",
                "food": food_data,
                "django_response": response
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enviando alimento a Django: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error enviando alimento: {str(e)}"
        )


@router.post("/test-encryption")
async def test_encryption(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint de prueba para verificar que el cifrado funciona
    """
    if not VAULT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vault no está disponible. Verifica la configuración."
        )
    
    try:
        vault_client = get_vault_client()
        
        # Cifrar datos
        encrypted = await vault_client.encrypt_json(data)
        
        # Descifrar datos
        decrypted = await vault_client.decrypt_json(encrypted)
        
        return {
            "original": data,
            "encrypted": encrypted,
            "decrypted": decrypted,
            "match": data == decrypted
        }
    except Exception as e:
        logger.error(f"Error en test de cifrado: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en test: {str(e)}"
        )


@router.post("/encrypt")
async def encrypt_data(
    encrypt_request: EncryptRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Cifra datos usando Vault KMS para comunicación frontend ↔ backend
    El frontend envía datos planos y recibe cifrados
    """
    if not VAULT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vault no está disponible"
        )
    
    try:
        vault_client = get_vault_client()
        encrypted_payload = await vault_client.encrypt_json(encrypt_request.data)
        
        return {
            "encrypted_data": encrypted_payload.get("encrypted_data"),
            "vault_key": vault_client.config.transit_key_name
        }
    except Exception as e:
        logger.error(f"Error cifrando datos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cifrar: {str(e)}"
        )


@router.post("/decrypt")
async def decrypt_data(
    decrypt_request: DecryptRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Descifra datos usando Vault KMS para comunicación frontend ↔ backend
    El frontend envía datos cifrados y recibe planos
    """
    if not VAULT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vault no está disponible"
        )
    
    try:
        vault_client = get_vault_client()
        decrypted_data = await vault_client.decrypt_json({
            "encrypted_data": decrypt_request.encrypted_data
        })
        
        return {
            "data": decrypted_data
        }
    except Exception as e:
        logger.error(f"Error descifrando datos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al descifrar: {str(e)}"
        )


@router.post("/contract/send")
async def send_contract_to_django(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Envía un contrato a Django (ProyectoCoreMVC) con cifrado Vault
    
    Este endpoint ahora acepta:
    1. Datos cifrados del frontend (modo seguro)
    2. Datos planos del frontend (modo legacy)
    
    Flujo cifrado completo:
    - Frontend cifra con /encrypt → Envía cifrado aquí → Backend descifra
    - Backend cifra de nuevo → Envía a Django → Django descifra
    
    Body esperado (cifrado):
    {
        "encrypted_data": "vault:v1:..."
    }
    
    O (plano - legacy):
    {
        "contract_name": "Contrato XYZ",
        "client_name": "Cliente ABC",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31"
    }
    """
    if not VAULT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vault no está disponible"
        )
    
    try:
        # Leer el body del request
        body = await request.body()
        body_str = body.decode('utf-8')
        
        print("=" * 80)
        print(f"[CONTRACT SEND] Body recibido: {body_str[:200]}...")
        print("=" * 80)
        
        # Parsear JSON
        print("[CONTRACT SEND] Parseando JSON...")
        try:
            request_data = json.loads(body_str)
            print(f"[CONTRACT SEND] JSON parseado: {list(request_data.keys())}")
        except json.JSONDecodeError as e:
            print(f"[CONTRACT SEND] ERROR parseando JSON: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error parseando JSON: {str(e)}"
            )
        
        # Verificar si los datos vienen cifrados del frontend
        vault_client = get_vault_client()
        
        if "encrypted_data" in request_data:
            print("[CONTRACT SEND] Datos CIFRADOS recibidos del frontend")
            print(f"[CONTRACT SEND] Ciphertext del frontend: {request_data['encrypted_data'][:100]}...")
            
            # Descifrar datos del frontend
            contract_data = await vault_client.decrypt_json(request_data)
            print(f"[CONTRACT SEND] Datos descifrados: {contract_data}")
            frontend_encrypted = True
        else:
            print("[CONTRACT SEND] Datos PLANOS recibidos del frontend (modo legacy)")
            contract_data = request_data
            frontend_encrypted = False
        
        # Validar campos requeridos
        print("[CONTRACT SEND] Validando campos requeridos...")
        required_fields = ['contract_name', 'client_name', 'start_date', 'end_date']
        for field in required_fields:
            if field not in contract_data:
                print(f"[CONTRACT SEND] ERROR: Campo faltante: {field}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Campo requerido faltante: {field}"
                )
        
        print("[CONTRACT SEND] Todos los campos validados OK")
        print("=" * 80)
        
        # CIFRAR DATOS PARA ENVIAR A DJANGO
        print("[CONTRACT SEND] Cifrando datos para Django...")
        encrypted_payload = await vault_client.encrypt_json(contract_data)
        print(f"[CONTRACT SEND] Datos cifrados para Django exitosamente")
        print(f"[CONTRACT SEND] Ciphertext Django: {encrypted_payload.get('encrypted_data', '')[:100]}...")
        
        # ENVIAR A DJANGO DIRECTAMENTE CON HTTPX
        print("[CONTRACT SEND] Enviando datos cifrados a Django...")
        import httpx
        
        async with httpx.AsyncClient() as http_client:
            django_response = await http_client.post(
                "http://host.docker.internal:9001/api/integrations/contract/",
                json=encrypted_payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Encrypted": "true"
                },
                timeout=30.0
            )
            print(f"[CONTRACT SEND] Respuesta de Django: {django_response.status_code}")
            django_data = django_response.json()
            print(f"[CONTRACT SEND] Django respondió: {django_data}")
        
        # CIFRAR RESPUESTA PARA EL FRONTEND
        print("[CONTRACT SEND] Preparando respuesta...")
        response_plain = {
            "status": "success",
            "message": "Contrato enviado a Django correctamente (CIFRADO CON VAULT)",
            "contract": contract_data,
            "django_response": django_data,
            "encryption": {
                "frontend_to_backend_encrypted": frontend_encrypted,
                "backend_to_django_encrypted": True,
                "vault_key_used": vault_client.config.transit_key_name,
                "vault_address": vault_client.config.vault_addr,
                "encrypted_ciphertext_to_django": encrypted_payload.get("encrypted_data", "N/A")[:100] + "..."
            }
        }
        
        # Si el frontend envió cifrado, respondemos cifrado también
        if frontend_encrypted:
            print("[CONTRACT SEND] Cifrando respuesta para el frontend...")
            encrypted_response = await vault_client.encrypt_json(response_plain)
            print("[CONTRACT SEND] Respuesta cifrada lista")
            return {
                "encrypted_data": encrypted_response.get("encrypted_data")
            }
        else:
            print("[CONTRACT SEND] Enviando respuesta plana (modo legacy)")
            return response_plain

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enviando contrato a Django: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error enviando contrato: {str(e)}"
        )
