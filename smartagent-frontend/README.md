# 🤖 SmartAgent

Plataforma web full-stack para la gestión y ejecución de agentes de inteligencia artificial especializados, potenciada por GPT-OSS 120B via Groq API.

`Deploy Frontend` `Deploy Backend` `CI/CD` `Tests` `.NET` `React` `Quality Gate: SonarCloud`

## 🌐 Demo en Vivo

| Plataforma | URL |
|---|---|
| 🖥️ Frontend | smart-agent-puce.vercel.app |
| ⚙️ Backend API | gallant-expression-production-e13d.up.railway.app |
| 📚 Swagger | `/swagger` |
| 📊 Calidad de código | [SonarCloud Dashboard](https://sonarcloud.io/dashboard?id=manueltrs_SmartAgent) |
| 💻 GitHub | github.com/manueltrs/SmartAgent |

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Arquitectura](#️-arquitectura)
- [Funcionalidades](#-funcionalidades)
- [Tipos de Agentes](#-tipos-de-agentes)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación Local](#-instalación-local)
- [Variables de Entorno](#-variables-de-entorno)
- [Pruebas](#-pruebas)
- [CI/CD con Jenkins](#-cicd-con-jenkins)
- [Calidad de Código con SonarQube](#-calidad-de-código-con-sonarqube)
- [Gestión de Proyecto con Jira](#-gestión-de-proyecto-con-jira)
- [Monitoreo con Grafana + Prometheus](#-monitoreo-con-grafana--prometheus)
- [Despliegue](#️-despliegue)
- [Autor](#-autor)

## 📖 Descripción

SmartAgent es una plataforma web completa que permite a los usuarios crear, gestionar y ejecutar agentes de inteligencia artificial especializados. Cada agente está optimizado para un dominio específico — desde resumir textos hasta generar código — utilizando el modelo GPT-OSS 120B a través de la API de Groq.

El sistema incluye autenticación segura con JWT, control de acceso basado en roles (Admin/User), procesamiento asíncrono de tareas en segundo plano y un dashboard completo con estadísticas en tiempo real.

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| C# / ASP.NET Core | .NET 8.0 | Framework principal |
| Entity Framework Core | 8.0.0 | ORM y migraciones |
| PostgreSQL | 17 | Base de datos en producción |
| JWT Bearer | 8.0.5 | Autenticación |
| BCrypt.Net | 4.1.0 | Hash de contraseñas |
| Npgsql | 8.0.0 | Driver PostgreSQL |
| Swashbuckle | 6.5.0 | Documentación Swagger |

### Frontend

| Tecnología | Uso |
|---|---|
| React + Vite | Framework y bundler |
| Axios | Cliente HTTP con interceptores JWT |
| React Router DOM | Navegación SPA |

### IA

| Tecnología | Uso |
|---|---|
| Groq API | Proveedor de inferencia |
| GPT-OSS 120B | Modelo de lenguaje (previamente Llama 3.3 70B, deprecado por Groq) |

### Infraestructura y Calidad

| Herramienta | Uso |
|---|---|
| Railway | Backend + PostgreSQL en producción |
| Vercel | Frontend en producción |
| Docker | Contenedorización del backend |
| GitHub | Control de versiones + CI/CD trigger |
| Jenkins | Pipeline de pruebas automatizadas (local, Windows service) |
| SonarCloud | Análisis estático de calidad de código, integrado al pipeline de CI |
| Jira | Tablero Kanban de gestión y seguimiento de tareas del proyecto |
| Prometheus (prometheus-net) | Instrumentación y exposición de métricas del backend en `/metrics` |
| Grafana Alloy | Agente de recolección, hace scraping de `/metrics` (corre local como servicio) |
| Grafana Cloud | Visualización de métricas — dashboard "SmartAgent Backend" |

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
│  (Railway)        │      │  GPT-OSS 120B         │
└──────────────────┘      └───────────────────────┘
```

## ✨ Funcionalidades

### 🔐 Autenticación y Seguridad
- Registro de usuarios con validación de email único
- Login con JWT de 2 horas de expiración
- Contraseñas protegidas con BCrypt
- Sistema de roles: Admin y User
- Protección de rutas tanto en frontend como en backend

### 🤖 Gestión de Agentes e Interfaz de Chat
- Interfaz principal unificada tipo chat: selección de agente, historial conversacional y ejecución de tareas en una sola pantalla
- Crear agentes personalizados con nombre, tipo y descripción sin salir del chat
- Listar agentes del usuario autenticado con indicador de estado (activo/inactivo)
- Ejecutar tareas con respuesta de IA en tiempo real, mostradas como burbujas de conversación
- Ver historial completo de tareas de todos los agentes en una vista dedicada (`/tasks`) con filtros por estado

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
- Estados de tarea: Pending → Running → Completed / Failed

## 🤖 Tipos de Agentes

| Tipo | Descripción | Capacidades |
|---|---|---|
| Asistente | Asistente general | Responde preguntas, da información |
| Resumidor | Síntesis de textos | Resume con conteo de palabras |
| Traductor | Traducción multilenguaje | Traduce entre cualquier par de idiomas |
| Analista | Análisis de datos | Identifica patrones, genera conclusiones |
| Programador | Desarrollo de software | Genera código con explicaciones |

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| POST | `/api/auth/login` | ❌ | Login, retorna JWT |
| POST | `/api/auth/register-admin` | 👑 Admin | Crear administrador |

### Agentes

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/agents` | ✅ User | Mis agentes |
| POST | `/api/agents` | ✅ User | Crear agente |
| POST | `/api/agents/{id}/execute` | ✅ User | Ejecutar tarea con IA |
| GET | `/api/agents/{id}/tasks` | ✅ User | Historial de tareas |
| GET | `/api/agents/all` | 👑 Admin | Todos los agentes |
| GET | `/api/agents/all-tasks` | 👑 Admin | Todas las tareas |
| PUT | `/api/agents/{id}/toggle` | 👑 Admin | Activar/desactivar |

### Usuarios

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/users` | 👑 Admin | Listar usuarios |
| GET | `/api/users/{id}` | ✅ User | Ver usuario |
| PUT | `/api/users/{id}` | ✅ User | Actualizar usuario |
| DELETE | `/api/users/{id}` | ✅ User | Eliminar usuario |

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
│   │       ├── Login.jsx                # Login + registro (UI futurista HUD)
│   │       ├── Dashboard.jsx            # Interfaz principal tipo chat: selector de agentes, stats y conversación
│   │       └── Tasks.jsx                # Historial completo de tareas de todos los agentes
│   ├── vercel.json                      # Config routing SPA
│   └── vite.config.js
│
├── SmartAgent.sln                       # Solución .NET (usada por SonarScanner)
│
└── SmartAgent.Tests/                    # Proyecto de pruebas xUnit
    ├── AuthControllerTests.cs           # Pruebas unitarias
    ├── AgentsControllerTests.cs         # Pruebas de integración
    ├── SecurityTests.cs                 # Pruebas de seguridad
    ├── LoadTests.cs                     # Pruebas de carga (NBomber)
    └── TestHelpers.cs                   # Utilidades de prueba
```

## 🚀 Instalación Local

### Prerequisitos
- .NET 8.0 SDK
- Node.js 18+
- SQL Server Express o PostgreSQL
- Groq API Key (gratis en console.groq.com)

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

## 🔐 Variables de Entorno

### Backend (appsettings.Development.json)

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

## 🧪 Pruebas

El proyecto cuenta con 12 pruebas automatizadas distribuidas en 4 categorías:

```bash
cd SmartAgent.Tests
dotnet test
```

**Pruebas Unitarias** (`AuthControllerTests.cs`) — 3 pruebas
- ✅ Registro exitoso con datos válidos
- ✅ Rechazo de email duplicado
- ✅ Login con credenciales inválidas retorna 401

**Pruebas de Integración** (`AgentsControllerTests.cs`) — 3 pruebas
- ✅ Crear agente retorna 200
- ✅ Lista vacía cuando no hay agentes
- ✅ Lista con agentes creados

**Pruebas de Seguridad** (`SecurityTests.cs`) — 4 pruebas
- ✅ Usuario no ve agentes de otros usuarios
- ✅ Login con password incorrecta retorna 401
- ✅ Registro con email duplicado retorna 400
- ✅ Agente inactivo no puede ejecutar tareas

**Pruebas de Carga** (`LoadTests.cs`) — 2 pruebas con NBomber
- ✅ 50 peticiones concurrentes de creación — 0 errores, latencia promedio 1.21ms
- ✅ 100 peticiones concurrentes de consulta — 0 errores, latencia promedio 1.93ms

## 🔄 CI/CD con Jenkins

El proyecto tiene un pipeline de CI/CD configurado con Jenkins (corriendo localmente como servicio de Windows) que ejecuta pruebas y análisis de calidad automáticamente cada 5 minutos o al detectar cambios en el repositorio.

### Configuración del Pipeline

- **Trigger:** Polling SCM cada 5 minutos (`H/5 * * * *`)
- **Source:** `https://github.com/manueltrs/SmartAgent.git`
- **Branch:** `master`
- **Pasos del build:**
  1. Compilar la solución completa (`dotnet build SmartAgent.sln`)
  2. Ejecutar pruebas (`dotnet test SmartAgent.Tests/SmartAgent.Tests.csproj`)
  3. Análisis estático de código con SonarCloud (`dotnet-sonarscanner`)

### Flujo de CI/CD completo

```
git push → GitHub → Jenkins (build + tests + SonarQube) → Railway (backend) → Vercel (frontend)
```

## 📊 Calidad de Código con SonarQube

El análisis estático corre en cada build de Jenkins vía **SonarCloud**, cubriendo el backend (C#) y el frontend (JS/TS/CSS).

- **Dashboard:** [sonarcloud.io/dashboard?id=manueltrs_SmartAgent](https://sonarcloud.io/dashboard?id=manueltrs_SmartAgent)
- **Project Key:** `manueltrs_SmartAgent`
- **Integración:** CI-based analysis desde Jenkins (Automatic Analysis de SonarCloud desactivado para evitar conflicto)
- **Reglas activas:** perfil "Sonar way" para C#, JS, CSS, JSON, Docker y HTML

## 📌 Gestión de Proyecto con Jira

El seguimiento de tareas del proyecto se gestiona en un tablero **Kanban** en Jira (proyecto `KAN`), con las columnas `To Do → In Progress → In Review → Done`.

Ejemplos de tareas registradas:
- Configurar SonarQube en CI
- Reactivar backend en Railway
- Configurar Grafana + Prometheus
- Documentar pipeline de Jenkins

## 📈 Monitoreo con Grafana + Prometheus

El backend expone métricas en tiempo real mediante `prometheus-net.AspNetCore`, recolectadas por **Grafana Alloy** (corriendo localmente) y enviadas a **Grafana Cloud** (Prometheus gestionado) para su visualización.

### Instrumentación

- **Paquete:** `prometheus-net.AspNetCore`
- **Middleware:** `app.UseHttpMetrics()` — mide automáticamente cada petición HTTP (duración, código de estado, endpoint)
- **Endpoint expuesto:** `app.MapMetrics()` → `/metrics`
- **URL pública:** `https://gallant-expression-production-e13d.up.railway.app/metrics`

### Recolección

- **Agente:** Grafana Alloy instalado como servicio de Windows, hace scraping periódico del endpoint `/metrics`
- **Destino:** Grafana Cloud Hosted Prometheus (`remote_write`)

### Dashboard

Dashboard **"SmartAgent Backend"** en Grafana Cloud con los siguientes paneles:

- **Requests por segundo** — `sum(rate(http_requests_received_total{job="prometheus.scrape.smartagent_backend"}[5m]))`
- **Latencia promedio** — `rate(http_request_duration_seconds_sum{...}[5m]) / rate(http_request_duration_seconds_count{...}[5m])`
- **Estado del servicio (up/down)** — `up{job="prometheus.scrape.smartagent_backend"}`
- **Requests por código de estado** — `sum by (code) (rate(http_requests_received_total{...}[5m]))`

## ☁️ Despliegue

### Backend en Railway

1. Crear nuevo proyecto en railway.app
2. Conectar repositorio GitHub
3. Configurar Root Directory: `SmartAgent/SmartAgent`
4. Agregar servicio PostgreSQL
5. Configurar variables de entorno
6. Railway detecta el Dockerfile automáticamente

### Frontend en Vercel

1. Importar repositorio en vercel.com
2. Configurar Root Directory: `smartagent-frontend`
3. Agregar variable `VITE_API_URL`
4. Deploy automático en cada push a master

## 🗄️ Base de Datos

### Esquema

```
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

## 👨‍💻 Autor

**Jose Manuel Torres Mendez**

- 📧 mjulianm29@gmail.com
- 📱 +57 3150012716
- 🐙 github.com/manueltrs
- 📍 Bogotá, Colombia

Estudiante de Ingeniería de Software — Universitaria de Colombia

## 📄 Licencia

Este proyecto es de uso educativo y personal.

---

⭐ Si te gustó el proyecto, dale una estrella en GitHub ⭐
