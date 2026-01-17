# Guía de Pruebas - Comunicación Cifrada con Vault KMS

Esta guía contiene todos los comandos y pasos necesarios para probar la comunicación cifrada entre Django (ProyectoCoreMVC) y FitFlow usando HashiCorp Vault Transit Engine.

## 📋 Prerrequisitos

1. **Servicios en ejecución:**
   - Vault (con Transit Engine habilitado)
   - FitFlow backend
   - Django backend (ProyectoCoreMVC)
   - Keycloak (para autenticación)

2. **Token de Keycloak:**
   - Necesitas un token JWT válido de Keycloak para autenticarte

## 🔐 Obtener Token de Keycloak

### Opción 1: Desde el navegador (DevTools)
1. Inicia sesión en la aplicación
2. Abre DevTools (F12) → Application/Storage → Local Storage
3. Busca el token en `access_token` o `keycloak-token`

### Opción 2: Usando curl
```bash
curl -X POST http://localhost:8081/realms/fitFlow/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=proyectocoremvc-web" \
  -d "username=TU_USUARIO" \
  -d "password=TU_PASSWORD" \
  -d "grant_type=password" | jq -r '.access_token'
```

## 🧪 Pruebas de Comunicación

### 1. Verificar que los servicios están corriendo

#### FitFlow Backend
```bash
# Ver logs de FitFlow
docker logs -f fitflow-backend

# Verificar que el middleware está habilitado
# Deberías ver: "✅ Middleware de descifrado habilitado"
```

#### Django Backend
```bash
# Ver logs de Django
docker logs -f django-backend

# Verificar que Vault está disponible
# Deberías ver logs relacionados con Vault
```

### 2. Probar Endpoint de Integración (Django → FitFlow)

#### Comando completo:
```bash
curl -X POST http://localhost:9001/api/integrations/person/send/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "last_name": "García",
    "email": "maria@example.com",
    "age": 25,
    "document": "12345678"
  }' | jq
```

#### Ejemplo con token real:
```bash
# Reemplaza TU_TOKEN con tu token de Keycloak
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjOXF5aEtGM3VCYVk3bGpLWXN0LWw4dHotcVFoaEc1ejhFQ09qZUc4V2xNIn0..."

curl -X POST http://localhost:9001/api/integrations/person/send/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "last_name": "García",
    "email": "maria@example.com",
    "age": 25,
    "document": "12345678"
  }' | jq
```

#### Respuesta esperada:
```json
{
  "status": "success",
  "message": "Persona recibida correctamente",
  "person": {
    "first_name": "María",
    "last_name": "García",
    "email": "maria@example.com"
  }
}
```

### 3. Monitorear Logs Durante la Prueba

#### Terminal 1: Logs de FitFlow
```bash
docker logs -f fitflow-backend
```

**Logs esperados en FitFlow:**
```
[MIDDLEWARE] Request recibido: POST /integrations/person
[MIDDLEWARE] Header X-Encrypted: true
[MIDDLEWARE] Request marcado como cifrado, procediendo a descifrar...
[MIDDLEWARE] Request descifrado correctamente
INFO: 192.168.65.1:XXXXX - "POST /integrations/person HTTP/1.1" 200 OK
```

#### Terminal 2: Logs de Django
```bash
docker logs -f django-backend
```

**Logs esperados en Django:**
```
INFO: Datos a enviar (antes de cifrar): {'first_name': 'María', ...}
INFO: Enviando a FitFlow: http://host.docker.internal:8080/integrations/person
INFO: Cifrado habilitado: True
INFO: Respuesta recibida de FitFlow: {...}
```

### 4. Verificar el Flujo de Cifrado/Descifrado

#### Paso 1: Verificar que Django está cifrando
En los logs de Django, deberías ver:
- `INFO: Datos a enviar (antes de cifrar): {...}`
- `INFO: Cifrado habilitado: True`

#### Paso 2: Verificar que FitFlow está descifrando
En los logs de FitFlow, deberías ver:
- `[MIDDLEWARE] Header X-Encrypted: true`
- `[MIDDLEWARE] Request marcado como cifrado, procediendo a descifrar...`
- `[MIDDLEWARE] Request descifrado correctamente`

#### Paso 3: Verificar que el endpoint recibe datos descifrados
En los logs de FitFlow, deberías ver:
- `INFO: Body recibido (raw): {"first_name":"María",...}`
- `INFO: Recibidos datos de persona (parsed): {...}`
- **NO deberías ver** `"encrypted_data"` en los datos recibidos

### 5. Probar Endpoint de Test de Cifrado

#### Desde Django:
```bash
curl -X POST http://localhost:9001/api/integrations/test-encryption/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Prueba de cifrado"
  }' | jq
```

#### Desde FitFlow:
```bash
curl -X POST http://localhost:8080/integrations/test-encryption \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Prueba de cifrado"
  }' | jq
```

### 6. Probar Flujo Inverso (FitFlow → Django)

#### Enviar alimento desde FitFlow a Django:
```bash
curl -X POST http://localhost:8080/integrations/food/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manzana",
    "calories": 52,
    "protein": 0.3,
    "carbs": 14,
    "fat": 0.2
  }' | jq
```

## 🔍 Verificación de Errores Comunes

### Error: "Los datos aún están cifrados"
**Causa:** El middleware no está descifrando correctamente.

**Solución:**
1. Verifica que el middleware está habilitado en FitFlow
2. Verifica que el header `X-Encrypted: true` está siendo enviado
3. Revisa los logs del middleware para ver si está detectando el request cifrado

### Error: "Vault no está disponible"
**Causa:** Vault no está corriendo o no está accesible.

**Solución:**
```bash
# Verificar que Vault está corriendo
docker ps | grep vault

# Verificar conexión a Vault
curl http://localhost:8200/v1/sys/health
```

### Error: "Event loop is closed"
**Causa:** Problema con asyncio en Django.

**Solución:** Ya está resuelto con el helper `_run_async` en Django.

### Error: "NotImplementedError" en middleware
**Causa:** El método `dispatch` no está siendo reconocido.

**Solución:** Ya está resuelto con la corrección del middleware.

## 📊 Verificación del Estado de Vault

### Verificar que Transit Engine está habilitado:
```bash
curl -H "X-Vault-Token: root" \
  http://localhost:8200/v1/transit/keys/fitflow-key
```

### Verificar políticas de Vault:
```bash
curl -H "X-Vault-Token: root" \
  http://localhost:8200/v1/sys/policies/acl
```

## 🎯 Checklist de Verificación

- [ ] Vault está corriendo y accesible
- [ ] Transit Engine está habilitado con la clave `fitflow-key`
- [ ] FitFlow backend está corriendo
- [ ] Django backend está corriendo
- [ ] Middleware de descifrado está habilitado en FitFlow
- [ ] Cliente HTTP de Django tiene cifrado habilitado
- [ ] Token de Keycloak es válido
- [ ] Los logs muestran el flujo completo de cifrado/descifrado
- [ ] El endpoint responde con éxito (200 OK)
- [ ] Los datos recibidos están descifrados correctamente

## 📝 Notas Importantes

1. **Puertos:**
   - FitFlow: `http://localhost:8080` (desde host) o `http://host.docker.internal:8080` (desde Docker)
   - Django: `http://localhost:9001`
   - Vault: `http://localhost:8200`

2. **Headers requeridos:**
   - `Authorization: Bearer <token>` - Token de Keycloak
   - `Content-Type: application/json` - Tipo de contenido
   - `X-Encrypted: true` - Se agrega automáticamente por el cliente HTTP cuando el cifrado está habilitado

3. **Configuración:**
   - El cifrado se controla mediante variables de entorno en ambos servicios
   - Verifica `VAULT_ENCRYPT_RESPONSES=true` en FitFlow
   - Verifica `VAULT_ENCRYPT_REQUESTS_TO_FITFLOW=true` en Django

## 🚀 Script de Prueba Completo

```bash
#!/bin/bash

# Configuración
TOKEN="TU_TOKEN_AQUI"
DJANGO_URL="http://localhost:9001"
FITFLOW_URL="http://localhost:8080"

echo "🔐 Probando comunicación cifrada Django → FitFlow"
echo ""

# Prueba 1: Enviar persona desde Django a FitFlow
echo "📤 Enviando persona desde Django..."
curl -X POST ${DJANGO_URL}/api/integrations/person/send/ \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "last_name": "García",
    "email": "maria@example.com",
    "age": 25,
    "document": "12345678"
  }' | jq

echo ""
echo "✅ Prueba completada. Revisa los logs para verificar el flujo de cifrado/descifrado."
```

## 📚 Referencias

- [Documentación de Vault Transit Engine](https://www.vaultproject.io/docs/secrets/transit)
- [FastAPI Middleware](https://fastapi.tiangolo.com/advanced/middleware/)
- [Django REST Framework](https://www.django-rest-framework.org/)

---

**Última actualización:** $(date)
**Versión:** 1.0


