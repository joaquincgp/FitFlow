import {
  Container, Typography, Paper, Grid, TextField, Button,
  MenuItem, FormControl, InputLabel, Select, FormHelperText
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function FoodLog() {
  const { token } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [entries, setEntries] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch("http://localhost:8000/foods", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setFoods);
  }, [token]);

  const addEntry = () => {
    setEntries([...entries, { food_id: "", meal_type: "", portion_size: "" }]);
  };

  const handleEntryChange = (i, e) => {
    const updated = [...entries];
    updated[i][e.target.name] = e.target.value;
    setEntries(updated);
    setErrors({ ...errors, [`${e.target.name}_${i}`]: null });
  };

  const validate = () => {
    let e = {};
    entries.forEach((entry, i) => {
      if (!entry.food_id) e[`food_id_${i}`] = "Seleccione un alimento";
      if (!entry.meal_type) e[`meal_type_${i}`] = "Seleccione el tipo de comida";
      if (!entry.portion_size || isNaN(entry.portion_size) || Number(entry.portion_size) <= 0) {
        e[`portion_size_${i}`] = "Porción inválida";
      }
    });
    return e;
  };

  const handleSubmit = async () => {
  const e = validate();
  if (Object.keys(e).length) return setErrors(e);

  const res = await fetch("http://localhost:8000/food-logs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(entries)
  });
  if (res.ok) {
    alert("Registro guardado correctamente");
    setEntries([]);
  } else {
    alert("Error al guardar");
  }
};


  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Registro Diario de Alimentos</Typography>
      <Paper sx={{ p: 3 }}>
        {entries.map((entry, i) => (
          <Grid container spacing={2} key={i} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={!!errors[`meal_type_${i}`]}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="meal_type"
                  value={entry.meal_type}
                  onChange={(e) => handleEntryChange(i, e)}
                  label="Tipo"
                >
                  {["Desayuno", "Almuerzo", "Cena", "Snack"].map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors[`meal_type_${i}`]}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={5}>
              <FormControl fullWidth error={!!errors[`food_id_${i}`]}>
                <InputLabel>Alimento</InputLabel>
                <Select
                  name="food_id"
                  value={entry.food_id}
                  onChange={(e) => handleEntryChange(i, e)}
                  label="Alimento"
                >
                  {foods.map(f => (
                    <MenuItem key={f.food_id} value={f.food_id}>{f.name}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors[`food_id_${i}`]}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="portion_size"
                label="Cantidad de porciones"
                type="number"
                value={entry.portion_size}
                onChange={(e) => handleEntryChange(i, e)}
                fullWidth
                error={!!errors[`portion_size_${i}`]}
                helperText={errors[`portion_size_${i}`]}
              />
            </Grid>
          </Grid>
        ))}

        <Button variant="outlined" onClick={addEntry} sx={{ mt: 2 }}>
          Añadir Registro
        </Button>

        {entries.length > 0 && (
          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2, ml: 2 }}>
            Guardar Todo
          </Button>
        )}
      </Paper>
    </Container>
  );
}
