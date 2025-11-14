import { createContext, useState, useEffect, useMemo } from 'react';
import keycloakModule from '../keycloak';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Usar la instancia importada directamente
  const keycloak = keycloakModule;

  // Verificar que keycloak esté disponible
  if (!keycloak || typeof keycloak.init !== 'function') {
    console.error('Keycloak instance is not available or invalid:', keycloak);
    return <div>Error: Keycloak no está configurado correctamente</div>;
  }

  const fetchUserProfile = async (accessToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    let refreshInterval;
    let mounted = true;

    const initKeycloak = async () => {
      // Prevenir inicialización múltiple - verificar si ya está inicializado
      if (keycloak.authenticated !== undefined) {
        if (keycloak.authenticated && mounted) {
          setToken(keycloak.token);
          await fetchUserProfile(keycloak.token);
          setInitialized(true);
        } else if (mounted) {
          setInitialized(true);
        }
        return;
      }
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          redirectUri: window.location.origin,
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
          checkLoginIframe: false
        });

        if (authenticated) {
          setToken(keycloak.token);
          await fetchUserProfile(keycloak.token);

          refreshInterval = setInterval(async () => {
            try {
              const refreshed = await keycloak.updateToken(30);
              if (refreshed) {
                setToken(keycloak.token);
              }
            } catch (err) {
              console.error('Error actualizando token', err);
              keycloak.logout({ redirectUri: window.location.origin });
            }
          }, 20000);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error inicializando Keycloak', error);
        setUser(null);
        setToken(null);
      } finally {
        setInitialized(true);
      }
    };

    initKeycloak();

    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const contextValue = useMemo(() => {
    // Acceder directamente a la instancia importada en cada uso
    return {
      user,
      token,
      initialized,
      authenticated: Boolean(user),
      login: async (options = {}) => {
        const kc = keycloakModule;
        
        if (!kc) {
          console.error('Keycloak instance is undefined');
          return;
        }
        
        try {
          // Siempre inicializar primero si no está inicializado
          if (kc.didInitialize === false || kc.authenticated === undefined) {
            await kc.init({
              onLoad: 'check-sso',
              pkceMethod: 'S256',
              redirectUri: window.location.origin,
              silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
              checkLoginIframe: false
            });
          }
          
          // Verificar que login existe
          if (typeof kc.login !== 'function') {
            console.error('keycloak.login is not a function');
            return;
          }
          
          // Si ya está autenticado, no hacer login
          if (kc.authenticated) {
            if (kc.token) {
              setToken(kc.token);
              await fetchUserProfile(kc.token);
            }
            return;
          }
          
          // Llamar a login - esto redirigirá al navegador
          kc.login({
            redirectUri: window.location.origin,
            ...options
          });
        } catch (error) {
          console.error('Error in login function:', error);
        }
      },
      logout: (options = {}) => {
        const kc = keycloakModule;
        if (!kc || typeof kc.logout !== 'function') {
          console.error('Keycloak instance not available for logout');
          return;
        }
        try {
          kc.logout({ redirectUri: window.location.origin, ...options });
        } catch (error) {
          console.error('Error calling keycloak.logout:', error);
        }
      },
      keycloakInstance: keycloakModule
    };
  }, [user, token, initialized]);

  if (!initialized) {
    return <div>Cargando autenticación…</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
