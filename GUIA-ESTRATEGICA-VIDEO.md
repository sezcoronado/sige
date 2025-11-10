# 📹 GUÍA ESTRATÉGICA: Implementación y Video Demostrativo
## Sistema SIGE - Integración Backend-Frontend

---

## 🎯 FASE 1: IMPLEMENTACIÓN (Duración: 4-5 días)

### ✅ DÍA 1-2: BACKEND FUNCIONAL

#### Prioridad ALTA - Implementar primero:

**1. Setup del proyecto**
```bash
cd backend
npm install
mkdir -p uploads/tareas
cp .env.example .env
# Editar .env con JWT_SECRET real
```

**2. Probar endpoints críticos (usar Postman/Thunder Client)**

Orden sugerido:
```
✅ POST /auth/login              → Verificar que devuelve token
✅ GET /cartera                  → Con token, verificar respuesta
✅ POST /cartera/depositar       → Validar actualización de saldo
✅ GET /transacciones/productos  → Ver catálogo
✅ POST /transacciones           → IMPORTANTE: validar restricciones
✅ GET /tareas                   → Ver tareas mock
✅ POST /tareas/:id/entregar     → SUBIR ARCHIVO (multipart)
✅ GET /mensajes                 → Ver mensajes
✅ POST /mensajes                → Enviar mensaje
✅ PATCH /mensajes/:id           → Marcar leído
```

**3. Verificar manejo de errores**
- Intentar login con credenciales incorrectas → 401
- Comprar sin saldo → 402
- Comprar producto restringido → 402
- Acceder sin token → 401

---

### ✅ DÍA 3-4: FRONTEND FUNCIONAL

#### A. Componentes básicos primero:

**1. Autenticación:**
```tsx
// LoginPage.tsx
- Formulario de login
- Validación de campos
- Loading state durante request
- Manejo de errores (mostrar mensaje)
- Redirección al dashboard
```

**2. Dashboard (según rol):**
```tsx
// DashboardPage.tsx
- Mostrar nombre del usuario
- Botones de navegación a cada servicio
- Indicador de saldo (si es padre/alumno)
```

**3. Cartera Digital:**
```tsx
// CarteraPage.tsx
- Mostrar saldo actual (GET /cartera)
- Formulario de depósito
- Validación de monto > 0
- Loading durante proceso
- Mensaje de éxito/error
- Refrescar saldo automáticamente
```

**4. Tienda Escolar:**
```tsx
// TiendaPage.tsx
- Listar productos (GET /productos)
- Cards con imagen, nombre, precio
- Botón "Agregar al carrito"
- Carrito flotante (badge con cantidad)
- Botón "Finalizar compra"
- Al comprar: POST /transacciones
  → Mostrar loading
  → Si falla (402): mostrar mensaje de restricción
  → Si éxito: limpiar carrito, actualizar saldo
```

**5. Tareas:**
```tsx
// TareasPage.tsx
- Listar tareas (GET /tareas)
- Filtrar por estado
- Card por tarea con:
  → Título, materia, fecha entrega
  → Botón "Entregar" (si pendiente)
- Modal de entrega:
  → Input type="file"
  → Textarea opcional (comentario)
  → POST /tareas/:id/entregar con FormData
```

**6. Mensajes:**
```tsx
// MensajesPage.tsx
- Tabs: Recibidos | Enviados
- Lista de mensajes
- Badge "No leído" si aplica
- Al hacer clic: mostrar detalle
- Botón "Marcar como leído" (PATCH)
- Botón "Nuevo mensaje"
- Modal con form: destinatario, asunto, contenido
```

#### B. Elementos UI críticos:

```tsx
// LoadingSpinner.tsx - Usar durante requests
// ErrorMessage.tsx   - Mostrar errores de API
// SuccessMessage.tsx - Feedback positivo
// Button.tsx         - Botón reutilizable con loading state
```

---

### ✅ DÍA 5: INTEGRACIÓN Y PULIDO

#### Checklist final antes del video:

**Backend:**
- [ ] Servidor corre sin errores
- [ ] Todos los endpoints responden correctamente
- [ ] Manejo de errores funciona (401, 402, 404, etc.)
- [ ] Archivos se suben correctamente a /uploads
- [ ] Console.log limpio (sin logs innecesarios)

**Frontend:**
- [ ] Login funcional
- [ ] Navegación entre páginas
- [ ] Loading states en todas las requests
- [ ] Mensajes de error claros y amigables
- [ ] Cartera actualiza saldo en tiempo real
- [ ] Transacción valida restricciones
- [ ] Subida de archivos funciona
- [ ] PATCH de mensajes funciona
- [ ] UI responsiva (se ve bien en pantalla completa)
- [ ] Sin errores en consola del navegador

**Integración:**
- [ ] Axios interceptor funciona (agrega token automáticamente)
- [ ] Refresh token funciona si token expira
- [ ] Logout limpia localStorage y redirige a login

---

## 🎬 FASE 2: VIDEO DEMOSTRATIVO (Duración: 1 día)

### Estructura del Video (7 minutos máximo)

```
┌─────────────────────────────────────────────────────┐
│  MINUTO 0:00 - 0:30  │  Introducción               │
├─────────────────────────────────────────────────────┤
│  • Título del proyecto: SIGE                        │
│  • Integrantes del equipo                           │
│  • Objetivo: Demostrar integración backend-frontend │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MINUTO 0:30 - 1:30  │  Arquitectura Técnica       │
├─────────────────────────────────────────────────────┤
│  • Mostrar diagrama simple de arquitectura:        │
│    [Frontend React] ↔ [API REST] ↔ [Backend Node]  │
│  • Stack: Node.js, Express, JWT                     │
│  • Frontend: React, TypeScript, Axios, Tailwind     │
│  • Mencionar 5 servicios implementados              │
│  • Mostrar estructura de carpetas brevemente       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MINUTO 1:30 - 3:00  │  DEMO CASO 1: Cartera      │
├─────────────────────────────────────────────────────┤
│  🎭 Rol: Padre de familia                           │
│  ────────────────────────────────────────────────   │
│  1. Login (mostrar token en DevTools)              │
│  2. Dashboard → Navegar a Cartera                   │
│  3. Consultar saldo actual (GET /cartera)           │
│     → Mostrar request en Network tab                │
│  4. Depositar $200 MXN                              │
│     → Mostrar loading state                         │
│     → Mostrar POST /cartera/depositar en Network    │
│     → Saldo actualizado instantáneamente            │
│  5. Ver historial de movimientos                    │
│  ────────────────────────────────────────────────   │
│  💬 Explicar mientras se muestra:                   │
│  • Axios interceptor agrega token automáticamente   │
│  • Validación de monto > 0 en ambos lados           │
│  • Manejo de estados (loading, success, error)      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MINUTO 3:00 - 5:00  │  DEMO CASO 2: Transacción  │
├─────────────────────────────────────────────────────┤
│  🎭 Rol: Alumno                                     │
│  ────────────────────────────────────────────────   │
│  1. Ver catálogo de productos                       │
│  2. Agregar 2 productos al carrito                  │
│     • Sándwich de jamón: $35                        │
│     • Jugo de naranja: $25                          │
│  3. Intentar agregar REFRESCO (restringido)         │
│     → ⚠️ ERROR 402: "Producto restringido"          │
│     → Mostrar mensaje de error en UI                │
│  4. Proceder a pagar solo productos permitidos      │
│     → Mostrar POST /transacciones en Network        │
│     → Validación de saldo suficiente                │
│     → ✅ Compra exitosa                             │
│     → Saldo descontado ($200 - $60 = $140)          │
│  ────────────────────────────────────────────────   │
│  💬 Explicar mientras se muestra:                   │
│  • Validación de restricciones en backend           │
│  • Manejo de error 402 en frontend                  │
│  • Actualización automática de saldo                │
│  • Reglas de negocio implementadas correctamente    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MINUTO 5:00 - 6:30  │  DEMO CASOS 3 y 4          │
├─────────────────────────────────────────────────────┤
│  🎭 CASO 3: Tareas Académicas                       │
│  ────────────────────────────────────────────────   │
│  1. Ver lista de tareas pendientes                  │
│  2. Seleccionar una tarea                           │
│  3. Subir archivo PDF (multipart/form-data)         │
│     → Mostrar request en Network (Content-Type)     │
│     → ✅ Tarea entregada                            │
│  ────────────────────────────────────────────────   │
│  🎭 CASO 4: Mensajería (RÁPIDO)                     │
│  ────────────────────────────────────────────────   │
│  1. Padre envía mensaje a docente                   │
│     → POST /mensajes                                │
│  2. Ver mensaje en "Recibidos" (otro rol)           │
│  3. Marcar como leído                               │
│     → PATCH /mensajes/:id                           │
│     → Actualización inmediata en UI                 │
│  ────────────────────────────────────────────────   │
│  💬 Destacar:                                       │
│  • Manejo de archivos (FormData)                    │
│  • Uso del verbo PATCH                              │
│  • Actualización de estado sin recargar página      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MINUTO 6:30 - 7:00  │  Conclusión                 │
├─────────────────────────────────────────────────────┤
│  • Resumen de lo demostrado:                        │
│    → 5 servicios funcionales                        │
│    → Integración sólida backend-frontend            │
│    → Manejo robusto de errores                      │
│    → Validaciones en ambos lados                    │
│    → UX intuitiva con feedback visual               │
│  • Decisiones técnicas clave:                       │
│    → JWT con refresh automático                     │
│    → Axios interceptors                             │
│    → Validaciones de negocio (restricciones, saldo) │
│  • Mensaje de cierre                                │
└─────────────────────────────────────────────────────┘
```

---

## 🎥 TIPS PARA GRABAR EL VIDEO

### Preparación Técnica:

**1. Configuración de pantalla:**
```
- Resolución: 1920x1080 (Full HD)
- Cerrar aplicaciones innecesarias
- Abrir solo:
  → VS Code (código backend/frontend)
  → Terminal (servidor corriendo)
  → Navegador (Chrome con DevTools)
  → Postman (opcional, para mostrar endpoints)
```

**2. Navegador (Chrome):**
```
- Abrir DevTools (F12)
- Tab "Network" visible
- Filtrar por "Fetch/XHR"
- Zoom al 100%
- Desactivar extensiones que interfieran
```

**3. Audio:**
```
- Micrófono limpio (sin ruido de fondo)
- Hablar claramente y pausadamente
- Hacer script previo (pero no leerlo textualmente)
```

---

### Durante la Grabación:

**✅ Hacer:**
- Explicar QUÉ estás haciendo y POR QUÉ
- Mostrar código relevante (brevemente)
- Señalar requests en Network tab
- Destacar códigos de estado HTTP (200, 201, 402, etc.)
- Mostrar mensajes de error/éxito en UI
- Pausar brevemente entre acciones para que se vea claramente

**❌ Evitar:**
- Silencios largos
- Errores en la demo (practicar antes)
- Explicaciones muy técnicas (mantener balance)
- Cambiar entre muchas ventanas rápidamente
- Olvidar mostrar el resultado final de cada acción

---

### Checklist PRE-GRABACIÓN:

**Backend:**
- [ ] Servidor corriendo sin errores
- [ ] Console.log limpios
- [ ] Datos mock preparados
- [ ] Carpeta uploads/ creada

**Frontend:**
- [ ] App corriendo en localhost:5173
- [ ] Sin errores en consola
- [ ] Datos de prueba listos
- [ ] UI se ve bien (colores, espaciado)

**Navegador:**
- [ ] DevTools abierto en Network
- [ ] Pestaña de aplicación limpia
- [ ] Sin extensiones molestas
- [ ] Zoom al 100%

**Archivos de prueba:**
- [ ] PDF para subir (tarea)
- [ ] Imagen alternativa si falla PDF

---

## 📊 PUNTOS CLAVE A DEMOSTRAR (Rúbrica)

### 🎯 Integración Técnica (40%)
```
✅ Conexión backend-frontend con Axios
✅ Interceptors para JWT automático
✅ Transferencia de datos (JSON y FormData)
✅ APIs implementadas correctamente
✅ Manejo de requests/responses efectivo
```

### 🎯 Funcionalidad (25%)
```
✅ Al menos 2 casos de uso completos (tenemos 4)
✅ Manejo de errores (mostrar 402, 401, etc.)
✅ Validaciones (monto, restricciones, archivos)
✅ Aplicación intuitiva y fácil de usar
```

### 🎯 Diseño y UX (20%)
```
✅ Interfaz atractiva con Tailwind
✅ Centrado en el usuario
✅ Elementos visuales (loading, success, error)
✅ Feedback inmediato en interacciones
```

### 🎯 Presentación (15%)
```
✅ Video claro, conciso, bien estructurado
✅ Explicación de decisiones de diseño
✅ Arquitectura y flujo de trabajo
✅ Comprensión profunda de integración
```

---

## 🚀 PLAN DE ACCIÓN INMEDIATO

### HOY (Día 1):
1. ✅ Instalar dependencias backend
2. ✅ Probar login endpoint
3. ✅ Probar endpoints de cartera
4. ✅ Probar endpoints de transacciones

### MAÑANA (Día 2):
1. ✅ Probar tareas con Postman (incluir archivo)
2. ✅ Probar mensajes (GET, POST, PATCH)
3. ✅ Verificar todos los errores (401, 402, 404)
4. ✅ Iniciar frontend - Setup React

### DÍA 3-4:
1. ✅ Implementar componentes de UI
2. ✅ Conectar servicios con Axios
3. ✅ Probar integración completa

### DÍA 5:
1. ✅ Pulir UI y UX
2. ✅ Testing end-to-end
3. ✅ Practicar demo del video
4. ✅ **GRABAR VIDEO**

---

## 💡 CONSEJOS FINALES

**Para el Código:**
- No sobre-ingenierizar - funcional > perfecto
- Comentar código complejo
- Usar nombres descriptivos de variables
- Mantener consistencia en estilo

**Para el Video:**
- Practica la demo 2-3 veces antes de grabar
- Ten un "plan B" si algo falla
- Mantén la calma si hay errores menores
- 7 minutos pasan rápido - prioriza lo importante

**Para la Evaluación:**
- Cumple con TODOS los puntos de la rúbrica
- Demuestra entendimiento profundo
- Explica decisiones técnicas
- Muestra profesionalismo

---

## ✅ RESULTADO ESPERADO

Con esta guía deberías obtener:
- ✅ **Integración Técnica:** 40/40 puntos
- ✅ **Funcionalidad:** 25/25 puntos
- ✅ **Diseño y UX:** 20/20 puntos
- ✅ **Presentación:** 15/15 puntos

### **CALIFICACIÓN PROYECTADA: 100/100** 🏆

---

**¡Éxito en tu proyecto!** 🚀
