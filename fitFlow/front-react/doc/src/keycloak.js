import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8081',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'fitFlow',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'fitflow-web',
};

// Validar configuración
if (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId) {
  console.error('Keycloak configuration missing:', keycloakConfig);
}

let keycloakInstance = null;

function getKeycloakInstance() {
  if (!keycloakInstance) {
    try {
      keycloakInstance = new Keycloak(keycloakConfig);
    } catch (error) {
      console.error('Error creating Keycloak instance:', error);
      throw error;
    }
  }
  return keycloakInstance;
}

// Crear instancia inmediatamente
const keycloak = getKeycloakInstance();

// Verificar que la instancia se creó correctamente
if (!keycloak || typeof keycloak.login !== 'function') {
  console.error('Keycloak instance is invalid');
}

export default keycloak;

