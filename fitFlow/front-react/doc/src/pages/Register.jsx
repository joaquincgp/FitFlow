import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Container,
  InputLabel,
  Select,
  FormControl,
  FormHelperText,
  Grid,
} from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useEffect} from 'react';
import { useLocation } from 'react-router-dom';

const countries = [
  { name: 'Ecuador', code: 'ec', prefix: '+593' },
  { name: 'Colombia', code: 'co', prefix: '+57' },
  { name: 'Perú', code: 'pe', prefix: '+51' },
  { name: 'México', code: 'mx', prefix: '+52' },
  { name: 'Estados Unidos', code: 'us', prefix: '+1' },
];

const genders = ['Masculino', 'Femenino', 'Otro'];

const specialties = [
  'Medicina Familiar', 'Medicina Interna', 'Pediatría', 'Ginecología y Obstetricia',
  'Cardiología', 'Dermatología', 'Neurología', 'Psiquiatría', 'Anestesiología',
  'Radiología', 'Oncología', 'Endocrinología', 'Gastroenterología', 'Nefrología',
  'Neumología', 'Urología', 'Reumatología', 'Hematología', 'Cirugía General',
  'Cirugía Ortopédica', 'Cirugía Plástica', 'Oftalmología', 'Otorrinolaringología',
  'Medicina Intensiva', 'Medicina Preventiva'
];

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromURL = queryParams.get('role') || 'paciente';

  const [form, setForm] = useState({
    role: roleFromURL,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    country: 'Ecuador',
    city: '',
    sexual_gender: '',
    specialty: '',
    location: '',
  });

  useEffect(() => {
  setForm({
    role: roleFromURL,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    country: 'Ecuador',
    city: '',
    sexual_gender: '',
    specialty: '',
    location: '',
  });
}, [location.search]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'Nombre requerido';
    if (!form.last_name.trim()) newErrors.last_name = 'Apellido requerido';
    if (!form.email.trim()) newErrors.email = 'Correo requerido';
    if (!form.password.trim()) newErrors.password = 'Contraseña requerida';
    if (!form.phone_number.trim()) newErrors.phone_number = 'Teléfono obligatorio';

    if (form.role === 'paciente') {
      if (!form.city.trim()) newErrors.city = 'Ciudad requerida';
      if (!form.sexual_gender.trim()) newErrors.sexual_gender = 'Selecciona un género';
    }

    if (form.role === 'medico') {
      if (!form.specialty.trim()) newErrors.specialty = 'Especialidad requerida';
      if (!form.location.trim()) newErrors.location = 'Ubicación requerida';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handlePhoneChange = (value) => {
    setForm({ ...form, phone_number: value });
    setErrors({ ...errors, phone_number: null });
  };

  const registerUser = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let url = '';
    let payload = {};

    if (form.role === 'medico') {
      url = 'http://localhost:8000/doctors/';
      payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        specialty: form.specialty,
        location: form.location
      };
    } else {
      url = 'http://localhost:8000/auth/register';
      payload = { ...form };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
  alert('Registro exitoso');
  // Reiniciar formulario con valores por defecto
  setForm({
    role: form.role, // mantener el rol actual
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    country: 'Ecuador',
    city: '',
    sexual_gender: '',
    specialty: '',
    location: '',
  });
} else {
      const err = await res.json();
      alert(`Error: ${err.detail || 'Registro inválido'}`);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff, #f1f7f6)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h4" color="primary" fontWeight={700} align="center" gutterBottom>
            Registro {form.role === 'medico' ? 'Médico' : 'Paciente'}
          </Typography>

          <TextField name="first_name" label="Nombre" fullWidth value={form.first_name} onChange={handleChange} error={!!errors.first_name} helperText={errors.first_name} sx={{ my: 1.5 }} />
          <TextField name="last_name" label="Apellido" fullWidth value={form.last_name} onChange={handleChange} error={!!errors.last_name} helperText={errors.last_name} sx={{ my: 1.5 }} />
          <TextField name="email" label="Correo electrónico" fullWidth value={form.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} sx={{ my: 1.5 }} />
          <TextField name="password" type="password" label="Contraseña" fullWidth value={form.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} sx={{ my: 1.5 }} />

          <FormControl fullWidth sx={{ my: 1.5 }}>
            <InputLabel>País</InputLabel>
            <Select name="country" value={form.country} onChange={handleChange} label="País">
              {countries.map((c) => (
                <MenuItem key={c.name} value={c.name}>
                  {c.name} ({c.prefix})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ my: 1.5 }}>
            <PhoneInput
              country={countries.find(c => c.name === form.country)?.code || 'ec'}
              value={form.phone_number}
              onChange={handlePhoneChange}
              inputStyle={{ width: '100%' }}
              specialLabel="Teléfono"
              placeholder="Número de teléfono"
            />
            {!!errors.phone_number && <FormHelperText error>{errors.phone_number}</FormHelperText>}
          </FormControl>

          {form.role === 'paciente' && (
            <>
              <TextField name="city" label="Ciudad" fullWidth value={form.city} onChange={handleChange} error={!!errors.city} helperText={errors.city} sx={{ my: 1.5 }} />
              <FormControl fullWidth sx={{ my: 1.5 }}>
                <InputLabel>Género</InputLabel>
                <Select name="sexual_gender" value={form.sexual_gender} onChange={handleChange} label="Género">
                  {genders.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
                {!!errors.sexual_gender && <FormHelperText error>{errors.sexual_gender}</FormHelperText>}
              </FormControl>
            </>
          )}

          {form.role === 'medico' && (
            <>
              <FormControl fullWidth sx={{ my: 1.5 }}>
                <InputLabel>Especialidad</InputLabel>
                <Select name="specialty" value={form.specialty} onChange={handleChange} label="Especialidad">
                  {specialties.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
                {!!errors.specialty && <FormHelperText error>{errors.specialty}</FormHelperText>}
              </FormControl>
              <TextField name="location" label="Dirección / Clínica" fullWidth value={form.location} onChange={handleChange} error={!!errors.location} helperText={errors.location} sx={{ my: 1.5 }} />
            </>
          )}

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              borderRadius: '10px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            }}
            onClick={registerUser}
          >
            Registrarse
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
