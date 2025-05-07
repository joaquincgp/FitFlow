import { Box, Container, Paper, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useState } from 'react';

export default function RegisterClient() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", cedula: "", email: "",
    password: "", birth_date: "", sex: "", height_cm: "",
    weight_current_kg: "", weight_goal_kg: "", activity_level: "", goal: ""
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let e = {};
    if (!/^\d{6,20}$/.test(form.cedula)) e.cedula = "Cédula inválida";
    ["first_name","last_name","email","password","birth_date","sex","activity_level","goal"].forEach(f=>{
      if (!form[f]?.trim()) e[f]="Requerido";
    });
    return e;
  };

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
    setErrors({...errors, [e.target.name]: null});
  };

  const onSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    const res = await fetch("http://localhost:8000/register/client", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(form)
    });
    alert(res.ok ? "Cliente registrado!" : "Error al registrar");
  };



  return (
    <Box sx={{ bgcolor:"white", minHeight:"100vh", py:4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p:4 }}>
          <Typography variant="h5" align="center" gutterBottom>Registro de Cliente</Typography>

          {/* Campos de texto */}
          {[
            {name:"cedula",label:"Cédula"},
            {name:"first_name",label:"Nombre"},
            {name:"last_name",label:"Apellido"},
            {name:"email",label:"Email"},
            {name:"password",label:"Contraseña", type:"password"},
            {name:"birth_date",label:"Fecha Nacimiento", type:"date"},
            {name:"height_cm",label:"Altura (cm)"},
            {name:"weight_current_kg",label:"Peso Actual (kg)"},
            {name:"weight_goal_kg",label:"Peso Meta (kg)"}
          ].map(f=>(
            <TextField
              key={f.name} name={f.name} label={f.label} type={f.type||"text"}
              value={form[f.name]} onChange={handleChange}
              error={!!errors[f.name]} helperText={errors[f.name]} fullWidth sx={{ mb:2 }}
            />
          ))}

          {/* Select de Sexo */}
          <FormControl fullWidth sx={{ mb:2 }} error={!!errors.sex}>
            <InputLabel>Sexo</InputLabel>
            <Select name="sex" value={form.sex} onChange={handleChange} label="Sexo">
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
            </Select>
            <FormHelperText>{errors.sex}</FormHelperText>
          </FormControl>

          {/* Select de Nivel de Actividad */}
          <FormControl fullWidth sx={{ mb:2 }} error={!!errors.activity_level}>
            <InputLabel>Nivel de Actividad</InputLabel>
            <Select name="activity_level" value={form.activity_level} onChange={handleChange} label="Nivel de Actividad">
              <MenuItem value="Sedentario">Sedentario</MenuItem>
              <MenuItem value="Ligero">Ligero</MenuItem>
              <MenuItem value="Moderado">Moderado</MenuItem>
              <MenuItem value="Intenso">Intenso</MenuItem>
              <MenuItem value="Extremo">Extremo</MenuItem>
            </Select>
            <FormHelperText>{errors.activity_level}</FormHelperText>
          </FormControl>

          {/* Select de Meta */}
          <FormControl fullWidth sx={{ mb:2 }} error={!!errors.goal}>
            <InputLabel>Meta</InputLabel>
            <Select name="goal" value={form.goal} onChange={handleChange} label="Meta">
              <MenuItem value="Bajar_Peso">Bajar Peso</MenuItem>
              <MenuItem value="Mantener_Peso">Mantener Peso</MenuItem>
              <MenuItem value="Subir_Peso">Subir Peso</MenuItem>
            </Select>
            <FormHelperText>{errors.goal}</FormHelperText>
          </FormControl>

          <Button variant="contained" color="primary" fullWidth onClick={onSubmit}>
            Registrar
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
