import { Box, Container, Paper, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { useState } from 'react';

export default function RegisterNutritionist() {

  const especialidades = [
    "Nutrición Clínica",
    "Nutrición Deportiva",
    "Nutrición Pediátrica",
    "Nutrición Geriátrica",
    "Nutrición Renal",
    "Nutrición Oncológica",
    "Nutrición Materno Infantil",
    "Educación Nutricional",
    "Nutrición Pública",
    "Nutrición y Alimentación Colectiva"
  ];

  const sexos = ["Masculino", "Femenino"];

  const [form, setForm] = useState({
    first_name: "", last_name: "", cedula: "", email: "",
    password: "", birth_date: "", sex: "", certification_number: "",
    specialty: ""
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let e = {};
    ["first_name", "last_name", "cedula", "email", "password", "birth_date", "sex", "certification_number", "specialty"].forEach(f => {
      if (!form[f]?.trim()) e[f] = "Requerido";
    });
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const onSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    const res = await fetch("http://localhost:8000/register/nutritionist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    alert(res.ok ? "Nutricionista registrado!" : "Error al registrar");
  };

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" align="center">Registro de Nutricionista</Typography>

          <TextField name="cedula" label="Cédula" value={form.cedula} onChange={handleChange} error={!!errors.cedula} helperText={errors.cedula} fullWidth sx={{ mb: 2 }} />
          <TextField name="first_name" label="Nombre" value={form.first_name} onChange={handleChange} error={!!errors.first_name} helperText={errors.first_name} fullWidth sx={{ mb: 2 }} />
          <TextField name="last_name" label="Apellido" value={form.last_name} onChange={handleChange} error={!!errors.last_name} helperText={errors.last_name} fullWidth sx={{ mb: 2 }} />
          <TextField name="email" label="Email" value={form.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} fullWidth sx={{ mb: 2 }} />
          <TextField name="password" label="Contraseña" type="password" value={form.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} fullWidth sx={{ mb: 2 }} />
          <TextField name="birth_date" label="Fecha Nacimiento" type="date" InputLabelProps={{ shrink: true }} value={form.birth_date} onChange={handleChange} error={!!errors.birth_date} helperText={errors.birth_date} fullWidth sx={{ mb: 2 }} />

          {/* Dropdown de Sexo */}
          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.sex}>
            <InputLabel>Sexo</InputLabel>
            <Select name="sex" value={form.sex} onChange={handleChange} label="Sexo">
              {sexos.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.sex}</FormHelperText>
          </FormControl>

          <TextField name="certification_number" label="Número de Certificación" value={form.certification_number} onChange={handleChange} error={!!errors.certification_number} helperText={errors.certification_number} fullWidth sx={{ mb: 2 }} />

          {/* Dropdown de Especialidad */}
          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.specialty}>
            <InputLabel>Especialidad</InputLabel>
            <Select name="specialty" value={form.specialty} onChange={handleChange} label="Especialidad">
              {especialidades.map((e) => (
                <MenuItem key={e} value={e}>{e}</MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.specialty}</FormHelperText>
          </FormControl>

          <Button variant="contained" color="primary" fullWidth onClick={onSubmit}>
            Registrar
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
