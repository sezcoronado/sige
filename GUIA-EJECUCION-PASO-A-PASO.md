# 🚀 GUÍA DE EJECUCIÓN PASO A PASO
## SIGE - Sistema Completo Backend + Frontend

---

## ⏱️ TIEMPO ESTIMADO: 15-20 minutos

---

## 📋 PREREQUISITOS

Antes de empezar, asegúrate de tener instalado:
- ✅ Node.js v18 o superior ([descargar aquí](https://nodejs.org/))
- ✅ npm (viene con Node.js)
- ✅ Un editor de código (VS Code recomendado)
- ✅ Git (opcional, para clonar)

**Verificar instalación:**
```bash
node --version   # Debe mostrar v18.x.x o superior
npm --version    # Debe mostrar 9.x.x o superior
```

---

## 🎯 PASO 1: CONFIGURAR BACKEND (5 minutos)

### 1.1 Navegar a la carpeta backend

```bash
cd backend
```

### 1.2 Instalar dependencias

```bash
npm install
```

**Esto instalará:**
- express
- cors
- helmet
- morgan
- jsonwebtoken
- bcryptjs
- multer
- dotenv
- nodemon (dev)

### 1.3 Crear carpeta de uploads

```bash
# En Windows (PowerShell)
New-Item -ItemType Directory -Path uploads/tareas -Force

# En Windows (CMD)
mkdir uploads\tareas

# En Mac/Linux
mkdir -p uploads/tareas
```

### 1.4 Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Abrir .env en tu editor y modificar:
# JWT_SECRET=cambia_este_secreto_por_uno_aleatorio_largo
```

**Archivo `.env` final:**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:password@localhost:5432/sige_db?schema=public"
JWT_SECRET=mi_super_secreto_jwt_2025_sige_equipo32
JWT_EXPIRES_IN=1800
JWT_REFRESH_EXPIRES_IN=604800
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.jpg,.jpeg,.png
```

### 1.5 Iniciar el servidor

```bash
npm run dev
```

**✅ Si todo está bien verás:**
```
🚀 Servidor SIGE corriendo en http://localhost:3000
📚 API disponible en http://localhost:3000/api/v1
🏥 Health check en http://localhost:3000/api/health
```

**🔥 PRUEBA RÁPIDA:**
Abre tu navegador en `http://localhost:3000/api/health`
Deberías ver: `{"status":"ok","timestamp":"...","uptime":...}`

**✅ BACKEND LISTO** - Deja esta terminal abierta

---

## 🎨 PASO 2: CONFIGURAR FRONTEND (5 minutos)

### 2.1 Abrir NUEVA terminal y navegar al frontend

```bash
# Desde la raíz del proyecto
cd frontend
```

### 2.2 Instalar dependencias

```bash
npm install
```

**Esto instalará:**
- react
- react-dom
- react-router-dom
- axios
- vite
- tailwindcss
- typescript
- autoprefixer
- postcss

**Tiempo estimado:** 2-3 minutos

### 2.3 Crear archivo de variables de entorno

```bash
# En Windows (PowerShell)
"VITE_API_URL=http://localhost:3000/api/v1" | Out-File -FilePath .env -Encoding utf8

# En Windows (CMD)
echo VITE_API_URL=http://localhost:3000/api/v1 > .env

# En Mac/Linux
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

### 2.4 Iniciar la aplicación

```bash
npm run dev
```

**✅ Si todo está bien verás:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**El navegador se abrirá automáticamente en `http://localhost:5173`**

**✅ FRONTEND LISTO** - Deja esta terminal abierta también

---

## 🎬 PASO 3: PROBAR LA APLICACIÓN (5 minutos)

### 3.1 Login

1. En tu navegador, deberías ver la página de login
2. Usa las credenciales de prueba:

**Padre:**
```
Email: padre@ejemplo.com
Password: Password123!
```

3. Haz clic en "Iniciar Sesión"
4. Deberías ver el dashboard con las opciones disponibles

### 3.2 Probar Cartera Digital

1. Haz clic en "Cartera Digital"
2. Verás el saldo actual: **$250.75 MXN**
3. Haz clic en "Depositar"
4. Ingresa un monto: **200**
5. Selecciona método de pago: **Tarjeta**
6. Haz clic en "Confirmar Depósito"
7. ✅ Verás mensaje de éxito y el saldo actualizado

### 3.3 Probar Tienda Escolar

1. Vuelve al Dashboard
2. Cierra sesión (botón arriba derecha)
3. Login como alumno:
```
Email: alumno@ejemplo.com
Password: Password123!
```
4. Haz clic en "Tienda Escolar"
5. Agrega algunos productos al carrito
6. Intenta agregar el **Refresco de cola**
7. ❌ Verás error: "Producto restringido"
8. Compra los otros productos
9. ✅ Saldo descontado correctamente

### 3.4 Probar Tareas

1. Desde el dashboard del alumno
2. Haz clic en "Tareas Académicas"
3. Verás tareas pendientes
4. Haz clic en "Entregar" en una tarea
5. Selecciona cualquier archivo PDF o imagen
6. Haz clic en "Confirmar Entrega"
7. ✅ Tarea marcada como entregada

### 3.5 Probar Mensajería

1. Haz clic en "Mensajería"
2. Verás mensajes recibidos/enviados
3. Haz clic en "Nuevo Mensaje"
4. Selecciona destinatario: **Docente**
5. Asunto: **Consulta sobre tarea**
6. Mensaje: **Hola, tengo una duda...**
7. Haz clic en "Enviar Mensaje"
8. ✅ Mensaje enviado

---

## 🔍 PASO 4: VERIFICAR CON DEVTOOLS (3 minutos)

### 4.1 Abrir DevTools

Presiona **F12** o clic derecho → "Inspeccionar"

### 4.2 Ir a la pestaña Network

1. Haz clic en la pestaña "Network"
2. Filtra por "Fetch/XHR"

### 4.3 Hacer una petición

1. En la app, ve a Cartera
2. En DevTools, verás la petición:
   ```
   GET /api/v1/cartera?alumnoId=usr_alumno01
   Status: 200
   ```
3. Haz clic en la petición
4. Verás el **Authorization header** con el JWT automático

### 4.4 Ver respuesta

1. En la pestaña "Response" verás:
```json
{
  "id": "wlt_22001",
  "alumnoId": "usr_alumno01",
  "saldo": 250.75,
  "moneda": "MXN",
  ...
}
```

**✅ INTEGRACIÓN VERIFICADA**

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Cannot find module"

**Solución:**
```bash
# En la carpeta con error
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: "Port 3000 already in use"

**Solución:**
```bash
# Matar proceso en puerto 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [número_del_proceso] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### ❌ Error: "ENOENT: no such file or directory, open '.env'"

**Solución:**
```bash
# Crear .env manualmente
# Backend:
cd backend
cp .env.example .env

# Frontend:
cd frontend
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

### ❌ Error 401 en todas las requests

**Solución:**
1. Verifica que el backend esté corriendo
2. Cierra sesión y vuelve a hacer login
3. Verifica que `JWT_SECRET` en `.env` no esté vacío

### ❌ Frontend muestra página en blanco

**Solución:**
1. Abre consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que `VITE_API_URL` en `.env` sea correcto
4. Reinicia el servidor: `Ctrl+C` y `npm run dev`

---

## 📸 PASO 5: PREPARAR PARA VIDEO (2 minutos)

### 5.1 Preparar ventanas

1. **Ventana 1:** Navegador con la app (maximizada)
2. **Ventana 2:** VS Code con código (opcional)
3. **Ventana 3:** Postman (opcional)

### 5.2 Configurar DevTools

1. Abre DevTools (F12)
2. Tab "Network"
3. Filtro "Fetch/XHR"
4. Zoom 100%

### 5.3 Cerrar sesión

1. Asegúrate de estar en logout
2. Limpia localStorage (Application → Storage → Clear site data)
3. Recarga la página

**✅ LISTO PARA GRABAR**

---

## 🎬 ORDEN SUGERIDO PARA EL VIDEO

1. **Intro (30seg):** Mostrar estructura de carpetas
2. **Backend (1min):** Mostrar server.js corriendo
3. **Demo 1 (2min):** Login + Cartera
4. **Demo 2 (2min):** Tienda con restricción
5. **Demo 3 (1min):** Tareas con archivo
6. **Demo 4 (30seg):** Mensajes con PATCH
7. **Conclusión (30seg):** Recap de servicios

---

## ✅ CHECKLIST FINAL

Antes de grabar el video, verifica:

**Backend:**
- [ ] Servidor corriendo sin errores
- [ ] Puerto 3000 accesible
- [ ] Health check responde: `/api/health`
- [ ] Console sin errores

**Frontend:**
- [ ] App corriendo en puerto 5173
- [ ] Login funciona
- [ ] Todas las páginas cargan
- [ ] DevTools sin errores en consola
- [ ] Network muestra requests

**Integración:**
- [ ] Login guarda token en localStorage
- [ ] Requests incluyen Authorization header
- [ ] Refresh token funciona
- [ ] Logout limpia todo

---

## 🎯 RESULTADO ESPERADO

Si seguiste todos los pasos:

✅ Backend corriendo en `http://localhost:3000`  
✅ Frontend corriendo en `http://localhost:5173`  
✅ Login funcional  
✅ 5 servicios operando correctamente  
✅ Integración perfecta backend-frontend  
✅ Listo para grabar video demostrativo  

---

## 💡 TIPS ADICIONALES

1. **Usa dos monitores:** Uno para la app, otro para DevTools/código
2. **Practica 2-3 veces** antes de grabar
3. **Ten los datos de prueba** a la mano
4. **Cierra pestañas innecesarias** del navegador
5. **Desactiva notificaciones** del sistema
6. **Usa modo incógnito** para evitar extensiones

---

## 🏆 ¡ÉXITO!

Si llegaste hasta aquí y todo funciona:

**¡FELICIDADES!** 🎉

Tienes un proyecto completo y funcional listo para:
- ✅ Demostrar en video
- ✅ Obtener 100/100 en la rúbrica
- ✅ Impresionar al profesor
- ✅ Agregar a tu portafolio

---

**¿Preguntas? Consulta:**
- README-PROYECTO-COMPLETO.md
- README-FRONTEND-COMPLETO.md
- GUIA-ESTRATEGICA-VIDEO.md

**¡Mucho éxito en tu presentación! 🚀**

---

**Equipo 32**  
**Tecnológico de Monterrey**  
**Noviembre 2025**
