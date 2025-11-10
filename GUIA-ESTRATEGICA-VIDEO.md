# 📹 GUÍA ESTRATÉGICA: Implementación y Video Demostrativo
## Sistema SIGE - Integración Backend-Frontend

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
│  MINUTO 1:30 - 3:30  │  DEMO CASO 1: Roles y Datos  │
├─────────────────────────────────────────────────────┤
│  🎭 Roles: Docente, Padres 1, Padres 2              │
│  ────────────────────────────────────────────────── │
│  1. **Login como Docente:**                         │
│     - Ir a Tareas y mostrar el filtro de alumnos.   │
│     - Seleccionar "Todos" y mostrar la gráfica y    │
│       la lista completa de tareas de todos.         │
│  2. **Login como Padres 1 (Emma):**                 │
│     - Ir a Cartera y mostrar saldo de Emma.         │
│     - Ir a Tareas y mostrar la gráfica y tareas de Emma.│
│  3. **Login como Padres 2 (Mateo):**                │
│     - Ir a Cartera y mostrar saldo de Mateo (diferente).│
│     - Ir a Tareas y mostrar la gráfica y tareas de Mateo.│
│  ────────────────────────────────────────────────── │
│  💬 Explicar mientras se muestra:                   │
│  • Cómo el RBAC (Control de Roles) personaliza la UI.│
│  • Cómo el backend asocia padres a hijos para       │
│    mostrar datos correctos (seguridad).             │
│  • La potencia de las gráficas para resúmenes.      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MINUTO 3:30 - 5:30  │  DEMO CASO 2: Transacción  │
├─────────────────────────────────────────────────────┤
│  🎭 Rol: Alumno                                     │
│  ────────────────────────────────────────────────── │
│  1. **Login como Alumno (Emma):**                   │
│     - Ir a Tienda y ver catálogo.                   │
│     - Agregar 2 productos al carrito.               │
│     - **Intentar agregar REFRESCO (restringido):**  │
│       → ⚠️ Mostrar error 402: "Producto restringido".│
│  2. **Finalizar compra:**                           │
│     - Pagar sólo productos permitidos.              │
│     - Mostrar POST /transacciones en Network.       │
│     - ✅ Compra exitosa.                            │
│  3. **Verificar Saldo:**                            │
│     - Ir a Cartera y mostrar saldo actualizado.     │
│  ────────────────────────────────────────────────── │
│  💬 Explicar mientras se muestra:                   │
│  • Validación de restricciones en backend           │
│  • Manejo de error 402 en frontend                  │
│  • Actualización de saldo y stock en backend.       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MINUTO 5:30 - 6:30  │  DEMO CASO 3: Tareas         │
├─────────────────────────────────────────────────────┤
│  🎭 Roles: Alumno y Docente                         │
│  ────────────────────────────────────────────────── │
│  1. **Alumno (Emma):**                              │
│     - Ir a Tareas, seleccionar una pendiente.       │
│     - Subir archivo PDF (mostrar request multipart).│
│     - ✅ Tarea entregada, gráfica y lista se actualizan.│
│  2. **Docente:**                                    │
│     - Login, ir a Tareas.                           │
│     - Filtrar por Emma, ver su tarea como "entregada". │
│     - Calificar la tarea (ej. 90/100).              │
│     - ✅ Mostrar la llamada al backend para calificar.│
│  3. **Alumno (Emma) de nuevo:**                     │
│     - Recargar Tareas y mostrar la calificación y   │
│       el estado "calificada".                       │
│  ────────────────────────────────────────────────   │
│  💬 Destacar:                                       │
│  • Manejo de archivos (FormData)                    │
│  • Flujo completo de entrega y calificación.        │
│  • Reactividad de la UI.                            │
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
