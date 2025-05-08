import {
  Container, Typography, Paper, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function MyPlans() {
  const { token, user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/nutrition-plans/my-plans", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setPlans);
  }, [token]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Mis Planes Nutricionales</Typography>
      {plans.map(plan => (
        <Paper key={plan.plan_id} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">{plan.name}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>{plan.description}</Typography>
          <List>
            {plan.meals.map((meal, i) => (
              <div key={i}>
                <ListItem>
                  <ListItemText
                    primary={`${meal.meal_type}: ${meal.food_name}`}
                    secondary={`Porción: ${meal.portion_size}`}
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Paper>
      ))}
    </Container>
  );
}