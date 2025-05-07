import {
  Container, Typography, TextField, Button, Paper, MenuItem, IconButton,
  Grid, Select, InputLabel, FormControl
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function CreateNutritionalPlan() {
  const { token, user } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    nutritionist_id: user ? user.user_id : "",  // ✅ ← Añadido
    name: "",
    description: "",
    meals: []
  });

  useEffect(() => {
    fetch("http://localhost:8000/foods", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setFoods);

    fetch("http://localhost:8000/auth/clients", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setClients);
  }, [token]);

  const addMeal = () => {
    setForm({ ...form, meals: [...form.meals, { food_id: "", meal_type: "", portion_size: "" }] });
  };

  const handleMealChange = (i, e) => {
    const updated = [...form.meals];
    updated[i][e.target.name] = e.target.value;
    setForm({ ...form, meals: updated });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:8000/nutrition-plans", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      alert("Plan creado correctamente");
      setForm({ user_id: "", nutritionist_id: user.user_id, name: "", description: "", meals: [] }); // reset
    } else {
      alert("Error al crear plan");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Crear Plan Nutricional</Typography>
      <Paper sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Cliente</InputLabel>
          <Select name="user_id" value={form.user_id} onChange={handleChange} label="Cliente">
            {clients.map(c => (
              <MenuItem key={c.user_id} value={c.user_id}>{c.first_name} {c.last_name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField name="name" label="Nombre del Plan" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField name="description" label="Descripción" value={form.description} onChange={handleChange} fullWidth sx={{ mb: 2 }} />

        <Typography variant="h6" gutterBottom>Comidas</Typography>
        {form.meals.map((meal, i) => (
          <Grid container spacing={2} key={i} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select name="meal_type" value={meal.meal_type} onChange={(e) => handleMealChange(i, e)} label="Tipo">
                  {["Desayuno", "Almuerzo", "Cena", "Snack"].map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>Alimento</InputLabel>
                <Select name="food_id" value={meal.food_id} onChange={(e) => handleMealChange(i, e)} label="Alimento">
                  {foods.map(f => (
                    <MenuItem key={f.food_id} value={f.food_id}>{f.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="portion_size"
                label="Porciones"
                type="number"
                value={meal.portion_size}
                onChange={(e) => handleMealChange(i, e)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton onClick={() => {
                setForm({ ...form, meals: form.meals.filter((_, idx) => idx !== i) });
              }}>
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button onClick={addMeal} startIcon={<Add />} sx={{ mt: 2 }}>Añadir Comida</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2, ml: 2 }}>
          Crear Plan
        </Button>
      </Paper>
    </Container>
  );
}
