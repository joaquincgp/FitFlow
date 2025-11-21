import { createContext, useState, useEffect, useMemo } from 'react';
import keycloakModule from '../keycloak';
import { API_URL } from '../config';
import { Box, CircularProgress, Typography } from '@mui/material';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [processingAuth, setProcessingAuth] = useState(false);

  const keycloak = keycloakModule;

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

  // Detectar si venimos de un redirect de Keycloak
  const isKeycloakRedirect = () => {
    const hash = window.location.hash;
    return hash.includes('code=') && hash.includes('state=');
  };

  useEffect(() => {
    let refreshInterval;
    let mounted = true;
    let authTimeout;

    const initKeycloak = async () => {
      const isRedirect = isKeycloakRedirect();
      
      // Si venimos de redirect, mostrar pantalla de carga
      if (isRedirect) {
        setProcessingAuth(true);
      }

      // Configurar listeners de Keycloak ANTES de init
      keycloak.onAuthSuccess = () => {
        console.log('Keycloak authentication successful');
        if (mounted && keycloak.token) {
          setToken(keycloak.token);
          fetchUserProfile(keycloak.token).then(() => {
            if (mounted) {
              setProcessingAuth(false);
              setInitialized(true);
              // Limpiar el hash de la URL después del redirect
              window.history.replaceState(null, '', window.location.pathname);
            }
          });
        }
      };

      keycloak.onAuthError = (error) => {
        console.error('Keycloak authentication error:', error);
        if (mounted) {
          setProcessingAuth(false);
          setUser(null);
          setToken(null);
          setInitialized(true);
        }
      };

      keycloak.onTokenExpired = () => {
        console.log('Keycloak token expired, refreshing...');
        keycloak.updateToken(30)
          .then((refreshed) => {
            if (refreshed && mounted && keycloak.token) {
              setToken(keycloak.token);
            }
          })
          .catch(() => {
            console.error('Failed to refresh token');
            if (mounted) {
              setUser(null);
              setToken(null);
            }
          });
      };

      // Prevenir inicialización múltiple
      if (keycloak.didInitialize && keycloak.authenticated !== undefined) {
        if (keycloak.authenticated && mounted && keycloak.token) {
          setToken(keycloak.token);
          await fetchUserProfile(keycloak.token);
          setInitialized(true);
        } else if (mounted) {
          setInitialized(true);
          setProcessingAuth(false);
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

        // Si venimos de redirect, esperar a que onAuthSuccess se dispare
        // Si no se dispara en 3 segundos, procesar manualmente
        if (isRedirect) {
          authTimeout = setTimeout(() => {
            if (mounted && authenticated && keycloak.token) {
              setToken(keycloak.token);
              fetchUserProfile(keycloak.token).then(() => {
                if (mounted) {
                  setProcessingAuth(false);
                  setInitialized(true);
                  window.history.replaceState(null, '', window.location.pathname);
                }
              });
            } else if (mounted) {
              setProcessingAuth(false);
              setInitialized(true);
            }
          }, 3000);
        } else if (authenticated && keycloak.token) {
          // Flujo normal (sin redirect)
          setToken(keycloak.token);
          await fetchUserProfile(keycloak.token);

          refreshInterval = setInterval(async () => {
            if (!mounted) return;
            try {
              const refreshed = await keycloak.updateToken(30);
              if (refreshed && keycloak.token) {
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
        // Solo marcar como inicializado si NO venimos de redirect
        // (si venimos de redirect, onAuthSuccess o el timeout lo harán)
        if (!isRedirect && mounted) {
          setInitialized(true);
          setProcessingAuth(false);
        }
      }
    };

    initKeycloak();

    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
      if (authTimeout) clearTimeout(authTimeout);
      // Limpiar listeners
      if (keycloak.onAuthSuccess) keycloak.onAuthSuccess = undefined;
      if (keycloak.onAuthError) keycloak.onAuthError = undefined;
      if (keycloak.onTokenExpired) keycloak.onTokenExpired = undefined;
    };
  }, []);

  const contextValue = useMemo(() => {
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
          // Si ya está autenticado, actualizar estado y salir
          if (kc.authenticated && kc.token) {
            setToken(kc.token);
            await fetchUserProfile(kc.token);
            return;
          }

          // Inicializar si no está inicializado
          if (!kc.didInitialize || kc.authenticated === undefined) {
            await kc.init({
              onLoad: 'check-sso',
              pkceMethod: 'S256',
              redirectUri: window.location.origin,
              silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
              checkLoginIframe: false
            });
          }
          
          if (typeof kc.login !== 'function') {
            console.error('keycloak.login is not a function');
            return;
          }
          
          // Si después de init ya está autenticado, no redirigir
          if (kc.authenticated && kc.token) {
            setToken(kc.token);
            await fetchUserProfile(kc.token);
            return;
          }
          
          // Redirigir a Keycloak para login
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

  // Pantalla de carga mientras procesa el redirect
  if (processingAuth) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Procesando autenticación...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Por favor espera mientras verificamos tu sesión
        </Typography>
      </Box>
    );
  }

  if (!initialized) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
