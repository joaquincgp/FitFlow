# .doc – Plataforma de Gestión Médica en Ecuador

## Descripción del Proyecto

.doc es una plataforma web full-stack desarrollada con **FastAPI** en el backend y **React + Material UI** en el frontend, pensada para facilitar la búsqueda, registro y gestión de servicios médicos en Ecuador. 

Está diseñada tanto para:
- **Pacientes** que desean encontrar profesionales médicos por especialidad y ubicación.
- **Médicos** que buscan registrar su perfil profesional.

Este proyecto nace de la necesidad de conectar fácilmente pacientes con doctores de manera **confiable**, **visual** y **funcional**, integrando elementos modernos como:
- JWT.
- Navegación protegida por roles.
- Diseño responsive.
- Sesiones persistentes.

## Tabla de Contenidos

1. [Instalación](#instalación)
2. [Uso](#uso)
3. [Características](#características)
4. [Créditos](#créditos)
5. [Licencia](#licencia)

---

## Instalación

### Requisitos:
- **Python 3.10+**
- **Node.js 16+**
- **pipenv o venv**

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

### Pacientes:
- Registrarse como paciente desde el navbar.
 
- Iniciar sesión: se guarda un JWT en localStorage.

- Acceder al panel de médicos.

- Visualizar médicos disponibles, especialidades y ubicación.

### Médicos:
- Registrarse como médico desde el navbar.

- Iniciar sesión con credenciales temporales (password: medico123).

- Acceder y editar perfil médico.

### Gestión de Usuarios:
- Alternar vistas entre pacientes y médicos.

### Funcionalidades:

- Ver.

- Editar.

- Eliminar.

- Verificar usuarios.

- Sistema de verificación de contraseña para actualizaciones sensibles.

---

## Características
- 🌐 Navegación protegida por roles (paciente / médico).

- 🔐 Autenticación con JWT usando OAuth2PasswordBearer.

- 🏥 Visualización estilo marketplace para médicos.

- 🎨 Diseño moderno con Material UI + animaciones Lottie.

- 📱 Registro con validación y teléfonos con prefijo país.

- 🇪🇨 Soporte de especialidades médicas en Ecuador.

- 📋 Verificación previa de contraseña para editar datos.

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

---

## Licencia

Este proyecto está licenciado bajo la licencia [MIT](https://choosealicense.com/licenses/mit/). 