import {
  Container, Typography, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Divider, Alert
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function FoodLog() {
  const { token } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [planStatus, setPlanStatus] = useState(null);
  const [entries, setEntries] = useState([]);
  const [errors, setErrors] = useState({});
  const [isPlanFulfilled, setIsPlanFulfilled] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/nutrition-plans/my-plans", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setPlans);
  }, [token]);

  const handlePlanSelect = async (e) => {
    const id = e.target.value;
    setSelectedPlan(id);

    const res = await fetch(`http://localhost:8000/nutrition-plans/${id}/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const status = await res.json();
    setPlanStatus(status);

    const total = status.detail.length;
    const fulfilled = status.detail.filter(d => d.fulfilled).length;
    setIsPlanFulfilled(fulfilled === total);

    const mappedEntries = status.detail
      .filter(d => !d.fulfilled)
      .map(m => ({
        food_id: m.food_id,
        meal_type: m.meal_type,  // ya es string en backend
        portion_size: ""
      }));
    setEntries(mappedEntries);
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
      if (!entry.portion_size || isNaN(entry.portion_size) || Number(entry.portion_size) <= 0) {
        e[`portion_size_${i}`] = "Porción inválida";
      }
    });
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);

    const today = new Date().toISOString().split("T")[0];

    const entriesWithDate = entries.map(e => ({
      food_id: e.food_id,
      meal_type: String(e.meal_type), 
      portion_size: parseFloat(e.portion_size),
      date: today
    }));

    console.log("Voy a enviar:", entriesWithDate);

    const res = await fetch("http://localhost:8000/food-logs", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(entriesWithDate)
    });
    if (res.ok) {
      alert("Registro guardado correctamente");
      setEntries([]);
      setPlanStatus(null);
      setSelectedPlan("");
    } else {
      alert("Error al guardar");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Registro Diario de Alimentos</Typography>
      <Paper sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Seleccionar Plan</InputLabel>
          <Select
            value={selectedPlan}
            onChange={handlePlanSelect}
            label="Seleccionar Plan"
          >
            {plans.map(p => (
              <MenuItem key={p.plan_id} value={p.plan_id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {planStatus && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>Progreso de Hoy: {planStatus.status}</Typography>
            {planStatus.detail.map((d, i) => (
              <div key={i}>
                <Typography variant="body2">
                  <strong>{d.meal_type}:</strong> {d.food_name} — Planificado: {d.planned_portion} — Consumido: {d.consumed_portion}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </div>
            ))}
          </>
        )}

        {isPlanFulfilled && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ¡Este plan ya ha sido cumplido en su totalidad hoy! 🎉
          </Alert>
        )}

        {entries.map((entry, i) => (
          <Grid container spacing={2} key={i} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={5}>
              <TextField
                value={planStatus?.detail.find(d => d.food_id === entry.food_id && d.meal_type === entry.meal_type)?.food_name || ""}
                label="Alimento"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                value={entry.meal_type}
                label="Tipo"
                fullWidth
                disabled
              />
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

        {!isPlanFulfilled && entries.length > 0 && (
          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
            Guardar Registro
          </Button>
        )}
      </Paper>
    </Container>
  );
}
