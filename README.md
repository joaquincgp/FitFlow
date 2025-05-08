# 🏋️‍♂️ Fit Flow 
Sistema web integral para la gestión de planes nutricionales y seguimiento de actividad física.

## Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Próximas Funcionalidades](#-próximas-funcionalidades)
3. [Características](#características)
4. [Créditos](#créditos)
5. [Licencia](#licencia)

## Descripción del Proyecto

Fit Flow es una plataforma web que permite a usuarios de distintos roles (Administradores, Nutricionistas y Clientes) gestionar de manera efectiva la nutrición y el bienestar. La aplicación ofrece:

- Registro y autenticación de usuarios por rol.
- Gestión completa de alimentos: creación, edición y eliminación de alimentos con información nutricional detallada.
- Creación de planes nutricionales personalizados por parte de nutricionistas.
- Registro diario de la ingesta de alimentos por parte de los clientes, permitiendo un seguimiento eficiente.
- Paneles dinámicos y dashboards para cada tipo de usuario.

El proyecto nació de la necesidad de proporcionar un sistema ligero, flexible y rápido para la gestión nutricional, especialmente adaptado a profesionales de la salud y a usuarios que buscan controlar su alimentación. Algunos desafíos superados:

- Implementación de roles y autenticación dinámica para distintos tipos de usuarios.
- Sincronización en tiempo real entre la gestión de alimentos y los planes nutricionales.
- Modularización y escalabilidad del código para futuras expansiones.


## 🔮 Próximas Funcionalidades

- Gráficas de progreso del cliente (IMC, calorías consumidas, etc.)
- Soporte para subida de imágenes de alimentos.
- Recordatorios automáticos y notificaciones por correo.
- Integración con apps de fitness externas (Google Fit, Apple Health).

## 🚀 Tecnologías Utilizadas

- **Backend**: FastAPI + SQLAlchemy (Python)
- **Base de Datos**: SQLite (desarrollo local) + compatibilidad para migración a otros motores SQL.
- **Frontend**: React + Material UI
- **Autenticación**: JWT (JSON Web Tokens)
- **Otros**: CORS Middleware, Context API (React)


---

## Instalación

### Requisitos:
- **Python 3.10+**
- **Node.js 16+**
- **pipenv o venv**
- **Git**

### Backend:
```bash
cd backend/app
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---
### Frontend:
```bash
cd front-react
npm install
npm run dev
```
El backend se ejecutará en http://localhost:8000 y el frontend en http://localhost:5173.

---

## Uso

### Cliente:
- Registrarse como paciente desde el navbar.
- Iniciar sesión: se guarda un JWT en localStorage. 
- Acceder a sus datos en el perfil una vez haya iniciado sesión.
- Acceder al dashboard con su seguimiento nutricional y de monitoreo físico.
- Registrar cada comida, seleccionando el alimento disponible y especificando la porción.

### Nutricionista:
- Registrarse como nutricionista desde el navbar.

- Iniciar sesión: se guarda un JWT en localStorage.

- Acceder a sus datos en el perfil una vez haya iniciado sesión.

### Administrador:
- Añadir alimentos usando un formulario dinámico que incluye un dropdown para seleccionar la unidad de porción (g, ml, unidad, taza, etc.).

---

## Características
- 🌐 Navegación protegida por roles (nutricionista / cliente / administrador).

- 🔐 Autenticación con JWT usando OAuth2PasswordBearer.

- 🎨 Diseño moderno con Material UI + animaciones Lottie.

- 📱 Registro con validación de datos.

- 💾 Sesión persistente con Context API y localStorage. 

--- 
## Créditos
Este proyecto fue desarrollado por Joaquín Chacón Groes-Petersen, utilizando tecnologías de código abierto y librerías modernas.

### Tecnologías usadas:
- FastAPI

- SQLAlchemy

- React

- Material UI

#### Inspirado por múltiples tutoriales sobre:

- Autenticación JWT.

- Gestión de usuarios con roles.

- Diseño moderno de interfaces.
- Diseño MVC.

---

## Licencia

Este proyecto está licenciado bajo la licencia [MIT](https://choosealicense.com/licenses/mit/). 