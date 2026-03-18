# 🤖 SmartAgent

> Plataforma web full-stack para la gestión y ejecución de **agentes de inteligencia artificial** especializados, potenciada por Llama 3.3 70B via Groq API.

[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://smart-agent-puce.vercel.app)
[![Deploy Backend](https://img.shields.io/badge/Backend-Railway-purple?logo=railway)](https://gallant-expression-production-e13d.up.railway.app/swagger)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-red?logo=jenkins)](http://localhost:8080)
[![Tests](https://img.shields.io/badge/Tests-12%20passing-brightgreen?logo=xunit)]()
[![.NET](https://img.shields.io/badge/.NET-8.0-blue?logo=dotnet)](https://dotnet.microsoft.com)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)](https://vitejs.dev)

---

## 🌐 Demo en Vivo

| Plataforma | URL |
|------------|-----|
| 🖥️ Frontend | [smart-agent-puce.vercel.app](https://smart-agent-puce.vercel.app) |
| ⚙️ Backend API | [gallant-expression-production-e13d.up.railway.app](https://gallant-expression-production-e13d.up.railway.app) |
| 📚 Swagger | [/swagger](https://gallant-expression-production-e13d.up.railway.app/swagger) |
| 💻 GitHub | [github.com/manueltrs/SmartAgent](https://github.com/manueltrs/SmartAgent) |

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Funcionalidades](#-funcionalidades)
- [Tipos de Agentes](#-tipos-de-agentes)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación Local](#-instalación-local)
- [Variables de Entorno](#-variables-de-entorno)
- [Pruebas](#-pruebas)
- [CI/CD con Jenkins](#-cicd-con-jenkins)
- [Despliegue](#-despliegue)
- [Autor](#-autor)

---

## 📖 Descripción

SmartAgent es una plataforma web completa que permite a los usuarios crear, gestionar y ejecutar agentes de inteligencia artificial especializados. Cada agente está optimizado para un dominio específico — desde resumir textos hasta generar código — utilizando el modelo **Llama 3.3 70B** a través de la API de Groq.

El sistema incluye autenticación segura con JWT, control de acceso basado en roles (Admin/User), procesamiento asíncrono de tareas en segundo plano y un dashboard completo con estadísticas en tiempo real.

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| C# / ASP.NET Core | .NET 8.0 | Framework principal |
| Entity Framework Core | 8.0.0 | ORM y migraciones |
| PostgreSQL | 17 | Base de datos en producción |
| JWT Bearer | 8.0.5 | Autenticación |
| BCrypt.Net | 4.1.0 | Hash de contraseñas |
| Npgsql | 8.0.0 | Driver PostgreSQL |
| Swashbuckle | 6.5.0 | Documentación Swagger |

### Frontend
| Tecnología | Uso |
|------------|-----|
| React + Vite | Framework y bundler |
| Axios | Cliente HTTP con interceptores JWT |
| React Router DOM | Navegación SPA |

### IA
| Tecnología | Uso |
|------------|-----|
| Groq API | Proveedor de inferencia |
| Llama 3.3 70B | Modelo de lenguaje |

### Infraestructura
| Herramienta | Uso |
|-------------|-----|
| Railway | Backend + PostgreSQL en producción |
| Vercel | Frontend en producción |
| Docker | Contenedorización del backend |
| GitHub | Control de versiones + CI/CD trigger |
| Jenkins | Pipeline de pruebas automatizadas |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Vercel)                          │
│         React + Vite · React Router · Axios            │
│      https://smart-agent-puce.vercel.app               │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS + JWT
                      ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Railway)                          │
│         ASP.NET Core 8 · Entity Framework               │
│    AuthController · AgentsController · UsersController  │
│         TaskExecutionService (Background)               │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐      ┌───────────────────────┐
│  PostgreSQL       │      │    Groq API           │
│  (Railway)        │      │  Llama 3.3 70B        │
└──────────────────┘      └───────────────────────┘
```

---

## ✨ Funcionalidades

### 🔐 Autenticación y Seguridad
- Registro de usuarios con validación de email único
- Login con JWT de 2 horas de expiración
- Contraseñas protegidas con BCrypt
- Sistema de roles: **Admin** y **User**
- Protección de rutas tanto en frontend como en backend

### 🤖 Gestión de Agentes
- Crear agentes personalizados con nombre, tipo y descripción
- Listar agentes del usuario autenticado
- Ejecutar tareas con respuesta de IA en tiempo real
- Ver historial completo de tareas con estados

### 👑 Panel de Administración
- Ver todos los agentes de todos los usuarios
- Ver todas las tareas del sistema
- Activar/desactivar agentes
- Crear nuevos administradores

### 📊 Dashboard
- Estadísticas en tiempo real: agentes activos, tareas completadas, fallidas
- Badge de rol en navegación (👑 Admin / 👤 User)
- Historial de tareas recientes

### ⚙️ Background Service
- Procesamiento asíncrono de tareas cada 15 segundos
- Estados de tarea: `Pending` → `Running` → `Completed` / `Failed`

---

## 🤖 Tipos de Agentes

| Tipo | Descripción | Capacidades |
|------|-------------|-------------|
| **Asistente** | Asistente general | Responde preguntas, da información |
| **Resumidor** | Síntesis de textos | Resume con conteo de palabras |
| **Traductor** | Traducción multilenguaje | Traduce entre cualquier par de idiomas |
| **Analista** | Análisis de datos | Identifica patrones, genera conclusiones |
| **Programador** | Desarrollo de software | Genera código con explicaciones |

---

## 📡 API Endpoints

### Autenticación
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | ❌ | Login, retorna JWT |
| `POST` | `/api/auth/register-admin` | 👑 Admin | Crear administrador |

### Agentes
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/agents` | ✅ User | Mis agentes |
| `POST` | `/api/agents` | ✅ User | Crear agente |
| `POST` | `/api/agents/{id}/execute` | ✅ User | Ejecutar tarea con IA |
| `GET` | `/api/agents/{id}/tasks` | ✅ User | Historial de tareas |
| `GET` | `/api/agents/all` | 👑 Admin | Todos los agentes |
| `GET` | `/api/agents/all-tasks` | 👑 Admin | Todas las tareas |
| `PUT` | `/api/agents/{id}/toggle` | 👑 Admin | Activar/desactivar |

### Usuarios
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/users` | 👑 Admin | Listar usuarios |
| `GET` | `/api/users/{id}` | ✅ User | Ver usuario |
| `PUT` | `/api/users/{id}` | ✅ User | Actualizar usuario |
| `DELETE` | `/api/users/{id}` | ✅ User | Eliminar usuario |

---

## 📁 Estructura del Proyecto

```
SmartAgent/
├── SmartAgent/                          # Backend ASP.NET Core
│   ├── Controllers/
│   │   ├── AuthController.cs            # Registro, login, roles
│   │   ├── AgentsController.cs          # CRUD agentes + ejecución IA
│   │   └── UsersController.cs           # Gestión de usuarios
│   ├── Data/
│   │   └── ApplicationDbContext.cs      # Contexto EF Core
│   ├── Models/
│   │   ├── User.cs                      # Modelo usuario
│   │   ├── Agent.cs                     # Modelo agente
│   │   ├── TaskItem.cs                  # Modelo tarea
│   │   └── LoginDto.cs                  # DTO autenticación
│   ├── Services/
│   │   └── TaskExecutionService.cs      # Background service
│   ├── Migrations/                      # Migraciones EF Core
│   ├── Dockerfile                       # Contenedorización
│   ├── Program.cs                       # Configuración app
│   └── appsettings.json                 # Config (sin secrets)
│
├── smartagent-frontend/                 # Frontend React + Vite
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js                   # Axios + interceptor JWT
│   │   └── pages/
│   │       ├── Login.jsx                # Login + registro
│   │       ├── Dashboard.jsx            # Panel principal
│   │       ├── Agents.jsx               # Gestión de agentes
│   │       ├── Execute.jsx              # Ejecución de tareas
│   │       └── Tasks.jsx                # Historial de tareas
│   ├── vercel.json                      # Config routing SPA
│   └── vite.config.js
│
└── SmartAgent.Tests/                    # Proyecto de pruebas xUnit
    ├── AuthControllerTests.cs           # Pruebas unitarias
    ├── AgentsControllerTests.cs         # Pruebas de integración
    ├── SecurityTests.cs                 # Pruebas de seguridad
    ├── LoadTests.cs                     # Pruebas de carga (NBomber)
    └── TestHelpers.cs                   # Utilidades de prueba
```

---

## 🚀 Instalación Local

### Prerequisitos
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [SQL Server Express](https://www.microsoft.com/sql-server) o PostgreSQL
- Groq API Key (gratis en [console.groq.com](https://console.groq.com))

### Backend

```bash
# Clonar repositorio
git clone https://github.com/manueltrs/SmartAgent.git
cd SmartAgent/SmartAgent

# Crear archivo de configuración local
cp appsettings.json appsettings.Development.json
# Editar appsettings.Development.json con tus credenciales

# Aplicar migraciones
dotnet ef database update

# Ejecutar
dotnet run
```

El backend estará disponible en `http://localhost:5292/swagger`

### Frontend

```bash
cd smartagent-frontend

# Instalar dependencias
npm install

# Crear variable de entorno
echo "VITE_API_URL=http://localhost:5292/api" > .env

# Ejecutar
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 🔐 Variables de Entorno

### Backend (`appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=SmartAgentDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "tu_clave_secreta_minimo_32_caracteres",
    "Issuer": "SmartAgent",
    "Audience": "SmartAgentUsers"
  },
  "Groq": {
    "ApiKey": "tu_groq_api_key"
  }
}
```

### Railway (Producción)
```
ConnectionStrings__DefaultConnection = postgresql://...
Jwt__Key = tu_clave_secreta
Jwt__Issuer = SmartAgent
Jwt__Audience = SmartAgentUsers
Groq__ApiKey = tu_groq_api_key
ASPNETCORE_URLS = http://+:8080
PORT = 8080
```

### Frontend (Vercel)
```
VITE_API_URL = https://gallant-expression-production-e13d.up.railway.app/api
```

---

## 🧪 Pruebas

El proyecto cuenta con **12 pruebas automatizadas** distribuidas en 4 categorías:

```bash
cd SmartAgent.Tests
dotnet test
```

### Pruebas Unitarias (`AuthControllerTests.cs`) — 3 pruebas
- ✅ Registro exitoso con datos válidos
- ✅ Rechazo de email duplicado
- ✅ Login con credenciales inválidas retorna 401

### Pruebas de Integración (`AgentsControllerTests.cs`) — 3 pruebas
- ✅ Crear agente retorna 200
- ✅ Lista vacía cuando no hay agentes
- ✅ Lista con agentes creados

### Pruebas de Seguridad (`SecurityTests.cs`) — 4 pruebas
- ✅ Usuario no ve agentes de otros usuarios
- ✅ Login con password incorrecta retorna 401
- ✅ Registro con email duplicado retorna 400
- ✅ Agente inactivo no puede ejecutar tareas

### Pruebas de Carga (`LoadTests.cs`) — 2 pruebas con NBomber
- ✅ 50 peticiones concurrentes de creación — 0 errores, latencia promedio 1.21ms
- ✅ 100 peticiones concurrentes de consulta — 0 errores, latencia promedio 1.93ms

---

## 🔄 CI/CD con Jenkins

El proyecto tiene un pipeline de CI/CD configurado con Jenkins que ejecuta todas las pruebas automáticamente cada 5 minutos o al detectar cambios en el repositorio.

### Configuración del Pipeline
- **Trigger:** Polling SCM cada 5 minutos (`H/5 * * * *`)
- **Source:** `https://github.com/manueltrs/SmartAgent.git`
- **Branch:** `master`
- **Comando:** `cd SmartAgent.Tests && dotnet test --logger "trx;LogFileName=test-results.trx"`

### Flujo de CI/CD completo
```
git push → GitHub → Jenkins (pruebas) → Railway (backend) → Vercel (frontend)
```

---

## ☁️ Despliegue

### Backend en Railway
1. Crear nuevo proyecto en [railway.app](https://railway.app)
2. Conectar repositorio GitHub
3. Configurar **Root Directory:** `SmartAgent/SmartAgent`
4. Agregar servicio PostgreSQL
5. Configurar variables de entorno
6. Railway detecta el `Dockerfile` automáticamente

### Frontend en Vercel
1. Importar repositorio en [vercel.com](https://vercel.com)
2. Configurar **Root Directory:** `smartagent-frontend`
3. Agregar variable `VITE_API_URL`
4. Deploy automático en cada push a `master`

---

## 🗄️ Base de Datos

### Esquema

```sql
Users
├── Id (UUID, PK)
├── Name (VARCHAR)
├── Email (VARCHAR, UNIQUE)
├── PasswordHash (VARCHAR)
├── Role (VARCHAR) -- 'User' | 'Admin'
└── CreatedAt (TIMESTAMP)

Agents
├── Id (UUID, PK)
├── UserId (UUID, FK → Users)
├── Name (VARCHAR 100)
├── Type (VARCHAR) -- Asistente|Resumidor|Traductor|Analista|Programador
├── Description (VARCHAR 500)
├── IsActive (BOOLEAN)
└── CreatedAt (TIMESTAMP)

Tasks
├── Id (UUID, PK)
├── AgentId (UUID, FK → Agents)
├── TaskName (VARCHAR)
├── Parameters (TEXT)
├── Status (VARCHAR) -- Pending|Running|Completed|Failed
├── Result (TEXT, nullable)
└── CreatedAt (TIMESTAMP)
```

---

## 👨‍💻 Autor

**Jose Manuel Torres Mendez**
- 📧 mjulianm29@gmail.com
- 📱 +57 3150012716
- 🐙 [github.com/manueltrs](https://github.com/manueltrs)
- 📍 Bogotá, Colombia

Estudiante de Ingeniería de Software — Universitaria de Colombia

---

## 📄 Licencia

Este proyecto es de uso educativo y personal.

---

<div align="center">
  <strong>⭐ Si te gustó el proyecto, dale una estrella en GitHub ⭐</strong>
</div>
