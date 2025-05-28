import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Cliente' && token) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/dashboard/nutrition-metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h3>No has iniciado sesión.</h3>
      </div>
    );
  }

  // Si no es cliente, mostrar perfil simple
  if (user.role !== 'Cliente') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <div style={{
          padding: '2rem',
          maxWidth: '500px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>Perfil</h2>
          <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Cédula:</strong> {user.cedula}</p>
          <p><strong>Rol:</strong> {user.role}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <div>Cargando métricas...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ margin: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        No se pudieron cargar las métricas. Asegúrate de tener un perfil de cliente configurado.
      </div>
    );
  }

  const { basic_metrics, today_consumption, caloric_compliance, weekly_adherence, week_daily_consumption } = metrics;

  // Colores para gráficos
  const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE'];

  // Datos para gráfico de macronutrientes
  const macroData = [
    {
      name: 'Proteínas',
      value: today_consumption.total_protein * 4,
      target: basic_metrics.macronutrient_targets.protein_kcal,
      grams: today_consumption.total_protein
    },
    {
      name: 'Carbohidratos',
      value: today_consumption.total_carbs * 4,
      target: basic_metrics.macronutrient_targets.carbs_kcal,
      grams: today_consumption.total_carbs
    },
    {
      name: 'Grasas',
      value: today_consumption.total_fat * 9,
      target: basic_metrics.macronutrient_targets.fat_kcal,
      grams: today_consumption.total_fat
    }
  ];

  // Datos para gráfico de comidas
  const mealData = Object.entries(today_consumption.by_meal).map(([meal, calories]) => ({
    name: meal,
    calories: Math.round(calories)
  }));

  const getComplianceColor = (percentage) => {
    if (percentage >= 90 && percentage <= 110) return '#4caf50';
    if (percentage < 90) return '#ff9800';
    return '#f44336';
  };

  const getComplianceStatus = (status) => {
    switch (status) {
      case 'optimal': return '🎯 Óptimo';
      case 'low': return '⚠️ Bajo';
      case 'high': return '🔺 Alto';
      default: return '❓ Desconocido';
    }
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  };

  const progressBarStyle = (percentage, color) => ({
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '0.5rem'
  });

  const progressFillStyle = (percentage, color) => ({
    height: '100%',
    width: `${Math.min(percentage, 100)}%`,
    backgroundColor: color,
    transition: 'width 0.3s ease'
  });

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>
        🏃‍♂️ Dashboard Nutricional - {basic_metrics.user_info.name}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Información Personal */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#1976d2' }}>👤 Información Personal</h3>
          <p><strong>Edad:</strong> {basic_metrics.user_info.age} años</p>
          <p><strong>Altura:</strong> {basic_metrics.user_info.height_cm} cm</p>
          <p><strong>Peso Actual:</strong> {basic_metrics.user_info.weight_current} kg</p>
          <p><strong>Peso Objetivo:</strong> {basic_metrics.user_info.weight_goal} kg</p>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#1976d2',
            color: 'white',
            borderRadius: '16px',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            {basic_metrics.user_info.goal.replace('_', ' ')}
          </div>
        </div>

        {/* Métricas Corporales */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#388e3c' }}>📊 Métricas Corporales</h3>
          <p><strong>IMC:</strong> {basic_metrics.calculated_metrics.bmi}
            <span style={{
              marginLeft: '0.5rem',
              padding: '0.2rem 0.5rem',
              backgroundColor: '#e8f5e8',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {basic_metrics.calculated_metrics.bmi_category}
            </span>
          </p>
          <p><strong>Metabolismo Basal:</strong> {basic_metrics.calculated_metrics.metabolismo_basal} kcal</p>
          <p><strong>GET:</strong> {basic_metrics.calculated_metrics.get} kcal</p>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1976d2',
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px'
          }}>
            🔥 RCDE: {basic_metrics.calculated_metrics.rcde} kcal/día
          </p>
        </div>

        {/* Cumplimiento Calórico Hoy */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#f57c00' }}>🔥 Calorías Hoy</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
              {getComplianceStatus(caloric_compliance.status)}
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {caloric_compliance.consumed_calories}
            </span>
            <span style={{ marginLeft: '0.5rem' }}>
              / {caloric_compliance.target_calories} kcal
            </span>
          </div>

          <div style={progressBarStyle()}>
            <div style={progressFillStyle(
              caloric_compliance.percentage,
              getComplianceColor(caloric_compliance.percentage)
            )}></div>
          </div>

          <p style={{
            marginTop: '0.5rem',
            color: getComplianceColor(caloric_compliance.percentage),
            fontWeight: 'bold'
          }}>
            {caloric_compliance.percentage}% del objetivo
          </p>
          <p>
            <strong>Diferencia:</strong> {caloric_compliance.difference > 0 ? '+' : ''}{caloric_compliance.difference} kcal
          </p>
        </div>

        {/* Progreso hacia Objetivo */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#7b1fa2' }}>🎯 Progreso</h3>
          <p><strong>Faltan:</strong> {Math.abs(basic_metrics.calculated_metrics.weight_change_needed)} kg</p>
          <p><strong>Tiempo estimado:</strong> {basic_metrics.calculated_metrics.weeks_to_goal} semanas</p>
          <p><strong>Ejercicio recomendado:</strong> {basic_metrics.calculated_metrics.recommended_exercise_calories} kcal/día</p>

          <div style={{ marginTop: '1rem' }}>
            <p><strong>Adherencia semanal:</strong> {weekly_adherence.adherence_percentage}%</p>
            <div style={progressBarStyle()}>
              <div style={progressFillStyle(weekly_adherence.adherence_percentage, '#2196f3')}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos en fila completa */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>

        {/* Gráfico de Evolución Semanal */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#1976d2' }}>📈 Consumo Calórico - Últimos 7 Días</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={week_daily_consumption}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day_name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value} kcal`,
                  name === 'calories' ? 'Consumido' : 'Objetivo'
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="calories" stroke="#8884d8" strokeWidth={2} name="Consumido" />
              <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeDasharray="5 5" name="Objetivo" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de Macronutrientes */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#388e3c' }}>🥗 Macronutrientes Hoy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${Math.round(value)} kcal`}
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Math.round(value)} kcal`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>

        {/* Distribución por Comidas */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#f57c00' }}>🍽️ Distribución por Comidas - Hoy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mealData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} kcal`, 'Calorías']} />
              <Bar dataKey="calories" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Objetivos de Macronutrientes */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1rem', color: '#7b1fa2' }}>🎯 Objetivos Diarios de Macronutrientes</h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span><strong>Proteínas</strong></span>
              <span>
                {Math.round(today_consumption.total_protein)}g / {Math.round(basic_metrics.macronutrient_targets.protein_g)}g
                ({Math.round((today_consumption.total_protein / basic_metrics.macronutrient_targets.protein_g) * 100)}%)
              </span>
            </div>
            <div style={progressBarStyle()}>
              <div style={progressFillStyle(
                (today_consumption.total_protein / basic_metrics.macronutrient_targets.protein_g) * 100,
                '#f44336'
              )}></div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span><strong>Carbohidratos</strong></span>
              <span>
                {Math.round(today_consumption.total_carbs)}g / {Math.round(basic_metrics.macronutrient_targets.carbs_g)}g
                ({Math.round((today_consumption.total_carbs / basic_metrics.macronutrient_targets.carbs_g) * 100)}%)
              </span>
            </div>
            <div style={progressBarStyle()}>
              <div style={progressFillStyle(
                (today_consumption.total_carbs / basic_metrics.macronutrient_targets.carbs_g) * 100,
                '#ff9800'
              )}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span><strong>Grasas</strong></span>
              <span>
                {Math.round(today_consumption.total_fat)}g / {Math.round(basic_metrics.macronutrient_targets.fat_g)}g
                ({Math.round((today_consumption.total_fat / basic_metrics.macronutrient_targets.fat_g) * 100)}%)
              </span>
            </div>
            <div style={progressBarStyle()}>
              <div style={progressFillStyle(
                (today_consumption.total_fat / basic_metrics.macronutrient_targets.fat_g) * 100,
                '#4caf50'
              )}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}