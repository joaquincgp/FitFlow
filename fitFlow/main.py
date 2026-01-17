import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fitFlow.backend.app.api.auth import router as auth_router
from fitFlow.backend.app.api.register import router as register_router
from fitFlow.backend.app.database.session import engine, Base
from fitFlow.backend.app.api.foods import router as foods_router
from fitFlow.backend.app.api.food_logs import router as food_logs_router
from fitFlow.backend.app.api.nutrition_plans import router as nutrition_plans_router
from fitFlow.backend.app.api import dashboard
from fitFlow.backend.app.api import optimizador_planes
from fitFlow.backend.app.api.nutrition_optimizer_enhanced import router as enhanced_router

# Importar router de integraciones con manejo de errores
try:
    from fitFlow.backend.app.api.integrations import router as integrations_router
    INTEGRATIONS_ROUTER_AVAILABLE = True
    print("✅ Router de integraciones importado correctamente")
except Exception as e:
    print(f"⚠️  No se pudo cargar router de integraciones: {e}")
    import traceback
    traceback.print_exc()
    print("   Los endpoints de integración no estarán disponibles")
    INTEGRATIONS_ROUTER_AVAILABLE = False
    integrations_router = None

# Middleware de descifrado (opcional, solo si se necesita descifrar requests entrantes)
try:
    from fitFlow.backend.app.middleware.decryption import DecryptionMiddleware
    from fitFlow.backend.app.core.vault_config import load_vault_config
    ENABLE_DECRYPTION_MIDDLEWARE = True
except ImportError:
    ENABLE_DECRYPTION_MIDDLEWARE = False


app = FastAPI(title="Fit Flow API")

# Crear tablas
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth_router)
app.include_router(register_router)
app.include_router(foods_router)
app.include_router(food_logs_router)
app.include_router(nutrition_plans_router)
app.include_router(dashboard.router)

app.include_router(optimizador_planes.router)

app.include_router(enhanced_router)

# Incluir router de integraciones si está disponible
if INTEGRATIONS_ROUTER_AVAILABLE and integrations_router:
    try:
        app.include_router(integrations_router)
        print("✅ Router de integraciones incluido en la aplicación")
        print(f"   Prefix: {integrations_router.prefix}")
        print(f"   Rutas: {[r.path for r in integrations_router.routes]}")
    except Exception as e:
        print(f"⚠️  Error al incluir router de integraciones: {e}")
        import traceback
        traceback.print_exc()
else:
    print("⚠️  Router de integraciones no disponible")

# Middleware de descifrado (para descifrar requests entrantes de Django)
# IMPORTANTE: Este middleware debe ir ANTES del CORS para procesar el body correctamente
if ENABLE_DECRYPTION_MIDDLEWARE:
    try:
        config = load_vault_config()
        if config.encrypt_responses:
            app.add_middleware(DecryptionMiddleware)
            print("✅ Middleware de descifrado habilitado")
        else:
            print("⚠️  Middleware de descifrado disponible pero deshabilitado (encrypt_responses=False)")
    except Exception as e:
        print(f"⚠️  No se pudo habilitar middleware de descifrado: {e}")
        import traceback
        traceback.print_exc()
        print("   El cifrado seguirá funcionando para requests salientes")

# CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=[
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://localhost:9090",
      "http://127.0.0.1:9090",
      "https://fitflow-qnm4.onrender.com"
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
