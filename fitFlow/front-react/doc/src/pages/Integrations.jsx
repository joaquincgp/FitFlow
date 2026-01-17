import { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Grid
} from '@mui/material';
import { Shield, Send, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Integrations() {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contract_name: '',
    client_name: '',
    start_date: '',
    end_date: ''
  });
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLastResponse(null);
    setError(null);

    try {
      // Verificar token
      if (!token) {
        setError('Token requerido. Por favor inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      // Validaciones básicas
      if (!formData.contract_name || !formData.client_name || !formData.start_date || !formData.end_date) {
        setError('Por favor completa todos los campos obligatorios');
        setLoading(false);
        return;
      }

      // Validar que la fecha de fin sea posterior a la de inicio
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio');
        setLoading(false);
        return;
      }

      console.log('Enviando contrato a Django:', formData);

      // PASO 1: Cifrar los datos con Vault antes de enviar
      console.log('[ENCRYPT] Cifrando datos del contrato...');
      const encryptResponse = await axios.post(
        `${API_URL}/integrations/encrypt`,
        { data: formData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      const encryptedData = encryptResponse.data.encrypted_data;
      console.log('[ENCRYPT] Datos cifrados:', encryptedData.substring(0, 100) + '...');

      // PASO 2: Enviar datos cifrados al backend
      console.log('[SEND] Enviando datos cifrados al backend...');
      const response = await axios.post(
        `${API_URL}/integrations/contract/send`,
        { encrypted_data: encryptedData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      console.log('[RESPONSE] Respuesta recibida:', response.data);
      
      // PASO 3: Verificar si la respuesta viene cifrada
      let finalData;
      if (response.data.encrypted_data) {
        console.log('[DECRYPT] Respuesta cifrada detectada, descifrando...');
        const decryptResponse = await axios.post(
          `${API_URL}/integrations/decrypt`,
          { encrypted_data: response.data.encrypted_data },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true
          }
        );
        finalData = decryptResponse.data.data;
        console.log('[DECRYPT] Datos descifrados:', finalData);
      } else {
        finalData = response.data;
      }
      
      setLastResponse(finalData);

      // Limpiar formulario
      setFormData({
        contract_name: '',
        client_name: '',
        start_date: '',
        end_date: ''
      });

    } catch (error) {
      console.error('Error enviando contrato:', error);
      setError(error.response?.data?.detail || error.message || 'No se pudo enviar el contrato a Django');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Shield size={40} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Integraciones con ProyectoCoreMVC
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
          Envía contratos desde FitFlow hacia ProyectoCoreMVC con cifrado Vault KMS
        </Typography>
        <Chip
          icon={<Lock size={16} />}
          label="Cifrado con Vault KMS activado"
          sx={{ bgcolor: 'rgba(103, 58, 183, 0.9)', color: 'white' }}
        />
      </Paper>

      {/* Información del flujo */}
      <Alert severity="info" icon={<AlertCircle size={20} />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Flujo de Cifrado
        </Typography>
        <Typography variant="body2">
          Formulario → FitFlow cifra con Vault → Envío cifrado → 
          Django descifra con Vault → Guarda en BD
        </Typography>
      </Alert>

      {/* Formulario */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Send size={24} color="#1976d2" />
          <Typography variant="h5" component="h2" fontWeight="600">
            Enviar Contrato a Django
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* Nombre del contrato */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Contrato"
                name="contract_name"
                value={formData.contract_name}
                onChange={handleChange}
                placeholder="Ej: Contrato Desarrollo Web 2026"
                required
                variant="outlined"
              />
            </Grid>

            {/* Cliente */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Cliente"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Ej: Empresa XYZ S.A."
                required
                variant="outlined"
              />
            </Grid>

            {/* Fechas */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Inicio"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Fin"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Botón de envío */}
          <Box sx={{ mt: 4 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? null : <Lock size={20} />}
              sx={{
                py: 1.5,
                background: loading ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: loading ? undefined : 'linear-gradient(135deg, #5568d3 0%, #653a8e 100%)'
                }
              }}
            >
              {loading ? 'Cifrando y enviando...' : '🔐 Cifrar y Enviar Contrato a Django'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Error
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {/* Respuesta exitosa */}
      {lastResponse && (
        <Alert
          severity="success"
          icon={<CheckCircle size={24} />}
          onClose={() => setLastResponse(null)}
          sx={{ mt: 3 }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            ✅ Contrato enviado exitosamente
          </Typography>
          
          {/* Información de cifrado */}
          {lastResponse.encryption && (
            <Card variant="outlined" sx={{ mt: 2, mb: 2, bgcolor: '#f3e5f5', borderColor: '#9c27b0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Lock size={20} color="#9c27b0" />
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    🔐 Información de Cifrado Vault KMS
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Estado
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      ✅ Cifrado activo
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Clave Vault
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {lastResponse.encryption.vault_key_used}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Servidor Vault
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {lastResponse.encryption.vault_address}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Datos Originales (muestra)
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: 'white', mt: 0.5 }}>
                      <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                        {JSON.stringify(lastResponse.encryption.original_data_sample, null, 2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Texto Cifrado (ciphertext - primeros 100 caracteres)
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: '#fff3e0', mt: 0.5, border: '1px solid #ff9800' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.7rem', 
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          color: '#e65100'
                        }}
                      >
                        {lastResponse.encryption.encrypted_ciphertext}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Respuesta completa de Django */}
          <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Respuesta de Django (datos descifrados)
              </Typography>
              <Typography component="pre" variant="body2" sx={{ overflow: 'auto', fontSize: '0.8rem', mt: 1 }}>
                {JSON.stringify(lastResponse.django_response || lastResponse, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        </Alert>
      )}
    </Container>
  );
}
