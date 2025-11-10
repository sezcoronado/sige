# 🎓 Sistema Integral de Gestión Escolar (SIGE)
## Proyecto de Integración Backend-Frontend

**Equipo 32 - Maestría en Inteligencia Artificial Aplicada**

---

## 📋 Descripción del Proyecto

Sistema completo de gestión escolar para instituciones de nivel preescolar y primaria, implementando **5 servicios principales** que demuestran la integración profesional entre backend (API REST) y frontend (React + TypeScript).

---

## 🎯 Servicios Implementados

### 1️⃣ **Autenticación y Gestión de Sesiones**
- Login con JWT
- Refresh de tokens automático
- Cierre de sesión seguro
- **Endpoints:** POST `/auth/login`, POST `/auth/logout`, POST `/auth/refresh`

### 2️⃣ **Cartera Digital del Alumno**
- Consulta de saldo
- Depósitos por padres
- Historial de movimientos
- **Endpoints:** GET `/cartera`, POST `/cartera/depositar`, GET `/cartera/historial`

### 3️⃣ **Transacciones en Tienda Escolar**
- Catálogo de productos
- Validación de restricciones alimentarias
- Procesamiento de compras con validación de saldo
- **Endpoints:** GET `/transacciones/productos`, GET `/transacciones/restricciones`, POST `/transacciones`

### 4️⃣ **Tareas Académicas (con archivos)**
- Listar tareas pendientes
- Subida de archivos (multipart/form-data)
- Calificación por docentes
- **Endpoints:** GET `/tareas`, POST `/tareas/:id/entregar`, POST `/tareas/:id/calificar`

### 5️⃣ **Mensajería Interna**
- Envío de mensajes entre roles
- Marcar como leído (PATCH)
- Historial de conversaciones
- **Endpoints:** GET `/mensajes`, POST `/mensajes`, PATCH `/mensajes/:id`

---

## 🛠️ Stack Tecnológico

### Backend
```
- Node.js v18+
- Express.js 4.18
- JWT (jsonwebtoken)
- Multer (subida de archivos)
- Bcryptjs (hashing de contraseñas)
- Helmet (seguridad HTTP)
- Morgan (logging)
- CORS
```

### Frontend
```
- React 18+
- TypeScript 5+
- Vite (build tool)
- Axios (HTTP client)
- Tailwind CSS 3+
- React Router v6
- React Hook Form
```

---

## 📁 Estructura del Proyecto

```
sige-proyecto/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Definición de rutas
│   │   ├── middlewares/     # Auth, errores, etc.
│   │   └── utils/           # Utilidades (JWT, errores)
│   ├── uploads/             # Archivos subidos
│   ├── server.js            # Servidor principal
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.config.ts      # Configuración Axios
│   │   │   └── services/            # Servicios API
│   │   ├── components/              # Componentes React
│   │   ├── pages/                   # Páginas
│   │   ├── context/                 # Context API
│   │   └── utils/                   # Utilidades
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## ⚙️ Instalación y Configuración

### Prerequisitos
- Node.js v18 o superior
- npm o yarn
- Git

### 1. Clonar el repositorio (si aplica)
```bash
git clone <url-repositorio>
cd sige-proyecto
```

### 2. Configurar Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Variables de entorno importantes:**
```env
PORT=3000
JWT_SECRET=tu_super_secreto_cambiar_en_produccion
JWT_EXPIRES_IN=1800
FRONTEND_URL=http://localhost:5173
```

**Crear carpeta de uploads:**
```bash
mkdir -p uploads/tareas
```

### 3. Configurar Frontend

```bash
# Navegar a la carpeta del frontend
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

---

## 🚀 Ejecución del Proyecto

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend corriendo en: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend corriendo en: `http://localhost:5173`

---

## 👤 Usuarios de Prueba

### Padres de Familia
```
Email: padre@ejemplo.com
Password: Password123!
```

### Docente
```
Email: docente@escuela.edu.mx
Password: Password123!
```

### Alumno
```
Email: alumno@ejemplo.com
Password: Password123!
```

---

## 🧪 Testing de Endpoints

### Con cURL

**1. Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "padre@ejemplo.com",
    "password": "Password123!"
  }'
```

**2. Consultar Cartera:**
```bash
curl -X GET "http://localhost:3000/api/v1/cartera?alumnoId=usr_alumno01" \
  -H "Authorization: Bearer <TOKEN>"
```

**3. Crear Transacción:**
```bash
curl -X POST http://localhost:3000/api/v1/transacciones \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "alumnoId": "usr_alumno01",
    "items": [
      {
        "productoId": "prd_001",
        "cantidad": 1
      }
    ]
  }'
```

### Con Postman/Thunder Client
1. Importar colección desde `docs/postman_collection.json` (si existe)
2. Configurar variable de entorno `baseUrl` = `http://localhost:3000/api/v1`
3. En la carpeta Auth, ejecutar Login
4. Copiar el token y agregarlo a las demás peticiones

---

## 🎬 Casos de Uso para el Video

### Caso 1: Login y Dashboard
1. **Usuario**: Padre de familia
2. **Flujo**: 
   - Login → Token JWT guardado
   - Redirección al dashboard
   - Mostrar información personalizada

### Caso 2: Cartera Digital + Transacción
1. **Usuario**: Padre
2. **Flujo**:
   - Consultar saldo actual
   - Realizar depósito
   - Ver actualización en tiempo real
   - Alumno realiza compra
   - Validar restricciones
   - Descontar saldo

### Caso 3: Tareas Académicas
1. **Usuario**: Alumno
2. **Flujo**:
   - Ver tareas pendientes
   - Subir archivo
   - Confirmar entrega
   - Docente califica
   - Ver calificación

### Caso 4: Mensajería
1. **Usuario**: Padre → Docente
2. **Flujo**:
   - Enviar mensaje
   - Docente recibe notificación
   - Marcar como leído
   - Responder

---

## ✅ Cumplimiento de Rúbrica

### 1. Integración Técnica (40%)
- ✅ Conexión sólida backend-frontend con Axios
- ✅ Interceptors para JWT automático
- ✅ Manejo de refresh tokens
- ✅ 5 servicios completamente integrados
- ✅ Transferencia de datos JSON y FormData

### 2. Funcionalidad (25%)
- ✅ 5 casos de uso completos
- ✅ Manejo robusto de errores
- ✅ Validaciones en frontend y backend
- ✅ UI intuitiva y responsiva

### 3. Diseño y UX (20%)
- ✅ Interfaz con Tailwind CSS
- ✅ Loading states
- ✅ Mensajes de error claros
- ✅ Feedback visual inmediato

### 4. Presentación (15%)
- ✅ Video demostrativo < 7 min
- ✅ Explicación de arquitectura
- ✅ Decisiones de diseño documentadas

---

## 🔒 Seguridad Implementada

- ✅ JWT con expiración de 30 minutos
- ✅ Refresh tokens
- ✅ CORS configurado
- ✅ Helmet para headers HTTP seguros
- ✅ Validación de entrada en ambos lados
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Hashing de contraseñas (bcrypt)

---

## 📊 Características Destacadas

### Manejo de Errores
- Errores HTTP estandarizados
- Mensajes descriptivos
- Códigos de estado apropiados (400, 401, 402, 403, 404)
- Logging en desarrollo

### Validaciones
- Frontend: React Hook Form + Zod
- Backend: Validación manual con mensajes detallados
- Restricciones de negocio (saldo, productos prohibidos)

### Performance
- Paginación en listados
- Filtros y búsquedas
- Caché de usuarios en localStorage
- Interceptors de Axios optimizados

---

## 📝 Próximos Pasos

### Para el Video Demostrativo:
1. ✅ Seleccionar 2-3 casos de uso más impactantes
2. ✅ Grabar flujos completos (7 min máx)
3. ✅ Explicar arquitectura y decisiones
4. ✅ Mostrar código relevante
5. ✅ Demostrar manejo de errores

### Para Producción (opcional):
- [ ] Conectar a base de datos real (PostgreSQL + Prisma)
- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Agregar tests unitarios y de integración
- [ ] Deploy en Vercel (frontend) + Railway/Render (backend)
- [ ] Implementar CI/CD con GitHub Actions

---

## 👥 Equipo de Desarrollo

- **Ides Ivette Merlos Araujo** - A01796949
- **Carlos Isaac Ávila Gutiérrez** - A01796035
- **Sebastián Ezequiel Coronado Rivera** - A01212824
- **Fernando Omar Salazar Ortíz** - A01796214

**Profesor:** Dr. Alberto Aguilar González  
**Materia:** Análisis, Diseño y Construcción de Software  
**Institución:** Tecnológico de Monterrey

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

---

## 📞 Soporte

Para dudas o problemas:
- Email: equipo32@tec.mx
- Issues: GitHub (si aplica)

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0
