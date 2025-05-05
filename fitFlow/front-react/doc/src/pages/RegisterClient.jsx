import { Box, Container, Paper, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function RegisterClient() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", cedula: "", email: "",
    password: "", birth_date: "", sex: "", height_cm: "",
    weight_current_kg: "", weight_goal_kg: "", activity_level: ""
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let e = {};
    if (!/^\d{6,20}$/.test(form.cedula)) e.cedula = "Cédula inválida";
    ["first_name","last_name","email","password","birth_date","sex"].forEach(f=>{
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
          <Typography variant="h5" align="center">Registro de Cliente</Typography>
          {[
            {name:"cedula",label:"Cédula"},
            {name:"first_name",label:"Nombre"},
            {name:"last_name",label:"Apellido"},
            {name:"email",label:"Email"},
            {name:"password",label:"Contraseña", type:"password"},
            {name:"birth_date",label:"Fecha Nacimiento", type:"date"},
            {name:"sex",label:"Sexo"},
            {name:"height_cm",label:"Altura (cm)"},
            {name:"weight_current_kg",label:"Peso Actual (kg)"},
            {name:"weight_goal_kg",label:"Peso Meta (kg)"},
            {name:"activity_level",label:"Nivel de Actividad"}
          ].map(f=>(
            <TextField
              key={f.name} name={f.name} label={f.label} type={f.type||"text"}
              value={form[f.name]} onChange={handleChange}
              error={!!errors[f.name]} helperText={errors[f.name]} fullWidth sx={{ mb:2 }}
            />
          ))}
          <Button variant="contained" color="primary" fullWidth onClick={onSubmit}>
            Registrar
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
