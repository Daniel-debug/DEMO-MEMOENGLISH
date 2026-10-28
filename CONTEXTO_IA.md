# Contexto para IA y nuevos colaboradores

Actualizado: 28 de octubre de 2026 · Versión del prototipo: **2.5.0-ui** · Rama: `feature/flujo-alumno-144-clases`.

Este archivo es el punto de entrada para retomar el trabajo sin el historial de la conversación. Explica qué hay, cómo está armado, qué decisiones se tomaron y qué falta. Leer después: `FLUJO_ALUMNO_UI.md` (recorrido del alumno) y `PRIMER_ACCESO_UI.md` (cuestionario inicial).

## 1. Qué es

Prototipo navegable (HTML, CSS y JavaScript sin dependencias) de la plataforma de reservas de **English Club School / MemoEnglish**. Todo es de demostración: no hay autenticación, pagos, correos ni agenda reales. Los datos de ejemplo viven en memoria y el avance del alumno se guarda en `localStorage`.

## 2. Repositorios y carpetas

| Carpeta local | Repositorio | Contenido |
|---|---|---|
| `C:\Users\el_da\Documents\git-vega` | `Daniel-debug/DEMO-MEMOENGLISH` | **Esta plataforma.** Aquí se trabaja. |
| `C:\Users\el_da\Documents\GIT - VEGA- 2` | `Daniel-debug/DEMO-LANDING-MEMOENGLISH` (`origin`) | Landing pública. También tiene el remoto `DEMO-MEMOENGLISH` (esta plataforma) solo para verla en SourceTree. **Al hacer push ahí, elegir `origin`.** |
| `C:\Users\el_da\Desktop\MemoEnglish` | — (no es git) | WordPress original (`wordexpress*`), respaldo SQL, `DEMO_REDISENO` (referencia visual, no modificar). |
| `C:\Users\el_da\Documents\git-vega-fuera-de-rama` | — | `HISTORIAS_DE_USUARIO.md`, que el usuario pidió **no** subir al repo (está en `.gitignore`). Los `.docx` de historias sí están en `documentos/`. |

`DEMO-TRUECRAFTINTERIORS` es otro proyecto y no debe tener remotos de MemoEnglish (se quitó uno agregado por error el 28 de octubre).

## 3. Publicación

| Sitio | URL | Publica desde |
|---|---|---|
| Plataforma | https://daniel-debug.github.io/DEMO-MEMOENGLISH/ | Rama `feature/flujo-alumno-144-clases` (última publicación documentada: 2.3.2-ui; 2.4.1 es local, sin publicar). `main` sigue en 1.0.7. |
| Landing | https://daniel-debug.github.io/DEMO-LANDING-MEMOENGLISH/ | Rama `main`. |

Conexión entre ambos: "Inicia sesión" y "Acceso de alumnos" de la landing abren la plataforma **en la misma pestaña**. La plataforma enlaza de vuelta con `LANDING_URL` (logo, "Volver al inicio", Método, Plataforma, Cursos, Precios, Maestros), y el botón Atrás del navegador regresa a la landing porque las redirecciones internas usan `location.replace`.

## 4. Arquitectura

Los scripts se cargan en este orden (`index.html`) y cada uno **sobrescribe** partes del anterior:

1. **`app.js`**: base heredada de `main`, con líneas largas compactadas. Contiene `MOCK` (maestros, horarios, conversaciones, productos), `state`, íconos, `layout()`, `route()`, encabezado, menú, Mis reservas, Mensajes, checkout (`checkout`, `paymentFields`, `wirePayment`, `processPayment`, `paymentSuccess`) y Mi cuenta.
2. **`happy-path.js`**: flujo del alumno. Acceso con Google/Facebook simulado, tablero, Paquetes (paquete → primera clase → revisión → checkout), Reservar (agenda semanal), Tienda, bienvenida del maestro en Mensajes y ajustes del pago.
3. **`journey.js`**: cuestionario inicial, bienvenida del tablero, preferencias en Mi cuenta y **persistencia** en `localStorage` (clave `ecs-student-journey-demo-v1`).

Patrón de extensión: reasignar funciones globales (`layout = function(view){...}`, `paymentSuccess = ...`, `enter = ...`) o rutas (`routes.tienda = ...`) guardando antes la original (`const baseLayout = layout`). Las declaraciones `function` de `app.js` son globales y reasignables.

4. **`student-ui.js`**: dashboard orientado a la siguiente acción, guía de funcionamiento de cinco pasos y acceso para repetirla desde Mi cuenta. Se carga después de journey.js.

### Estado principal

```text
learner.profile    respuestas del cuestionario
learner.package    { count, scheduled, perWeek, expires, welcomeRead[] }
learner.taken      clases tomadas (0 en la demo)
purchase           { step 0-2, count, teacher, date ISO, time, awaitingPayment }
state.bookings[]   { id, iso 'AAAA-MM-DD', date 'Vie 30 oct', time, teacher, service, status }
state.cart[]       [id, nombre, descripción, precio] — formato de app.js
```

`saveJourney()` guarda: perfil, respuestas, paso, taken, coins, package, purchase y bookings. Se ejecuta también en `pagehide`, así que `localStorage.clear()` seguido de recargar **no** reinicia la demo: hay que poner `learner.package=null; state.bookings=[]` en memoria y llamar a `saveJourney()`.

### Rutas del alumno

| Ruta | Qué hace |
|---|---|
| `#/login`, `#/registro` | Acceso de demostración. Con sesión activa, entrar sin ruta lleva al tablero. |
| `#/onboarding`, `#/onboarding-resumen` | Cuestionario de 3 o 5 preguntas y resumen. |
| `#/dashboard` | Programa de 144 clases, tomadas, por agendar, etapas y Memo coins. |
| `#/paquetes` | Paso 1: paquete (8/12/16). Paso 2: maestro con perfil y video, fecha y hora. Paso 3: revisión → `#/checkout`. |
| `#/checkout` | Checkout de `app.js` (tarjeta en campos agrupados o monedero) → comprobante. |
| `#/reservar` | Sin paquete vigente → `#/paquetes`. Con paquete → agenda semanal (**marcada "En construcción"**). |
| `#/reservas` | Mis reservas (`app.js`). |
| `#/tienda` | Clases compradas, reservadas y por agendar, vigencia y compra de más paquetes. |
| `#/mensajes` | Conversaciones; cada maestro con clases reservadas envía una bienvenida. |
| `#/perfil` | Mi cuenta y preferencias (desde el menú del avatar). |

Navegación inferior: Inicio, Reservar, Mis reservas (contador de próximas clases), Ayuda. Menú lateral: Inicio, Mis paquetes, Ayuda; sin Reservar, Mis reservas ni avatar. Mensajes (con contador de no leídos) y Mi cuenta están en el encabezado. **Mis clases** sigue existiendo (`#/clases`), pero está oculta del menú por petición del usuario.

## 5. Reglas implementadas (y supuestos por confirmar)

- Paquetes mensuales: 8, 12 y 16 clases = 2, 3 y 4 clases por semana. Vigencia: un mes desde la compra.
- **Precios de ejemplo** en `PACKAGE_PRICES` (`happy-path.js`): $80, $120 y $160 USD.
- Primera clase: la fecha arranca en **hoy**. Hoy solo se ofrecen horarios con al menos una hora de anticipación; si no queda ninguno, se propone mañana. Horarios: `MOCK.times` (09:00, 11:00, 16:00, 18:00, 20:00).
- Agenda semanal: se eligen hasta `perWeek` días (Lun a Sáb) con una hora por día. Las fechas se generan desde mañana hasta agotar las clases o la vigencia, saltando días que ya tienen reserva. "Quitar" una fecha agrega la siguiente.
- **Supuesto:** comprar otro paquete con uno vigente **suma** las clases y la vigencia pasa a un mes desde la nueva compra.
- Por agendar = `package.count − package.scheduled`. La primera clase cuenta como agendada.
- Bienvenida del maestro: una conversación `t-<id>` por maestro con reservas. Se marca leída al abrirla (`welcomeRead`). La conversación de ejemplo de Ashley sobre "la tarea" se quitó para un alumno nuevo.
- Perfiles de maestro: `TEACHER_PROFILES` (`happy-path.js`). Las descripciones y especialidades son de ejemplo; el campo `video` está vacío y acepta una ruta o URL.

## 6. Convenciones del proyecto

- **Versión en cada cambio**, en cuatro lugares: `APP_VERSION` (`app.js`), `CACHE_VERSION` y los `?v=` de `APP_SHELL` (`service-worker.js`), los `?v=` de `index.html` y el README. Sin esto, el service worker sirve archivos viejos.
- Redirecciones automáticas con `location.replace(...)`, nunca `location.hash =`, para no romper el botón Atrás.
- Estilos nuevos al **final** de `styles.css`. El archivo usa finales de línea CRLF.
- `app.js` y varias líneas de `happy-path.js` son muy largas: editarlas reemplazando una cadena exacta y comprobar con `node --check`.
- Textos de interfaz en español, con tono cercano y sin dar por hecho el género del alumno.
- Preferencia del usuario: al terminar cambios visibles, darle el enlace local de la pantalla (p. ej. http://localhost:8093/#/reservar).

## 7. Ejecutar y probar

- `.claude/launch.json` levanta `python -m http.server 8093`. Abrir http://localhost:8093/.
- El servidor de Python, como `php -S`, a veces corta conexiones (`ERR_CONNECTION_RESET`) y la hoja de estilos llega vacía (0 reglas). Si la página se ve sin estilos, recargar.
- Si se ve una versión vieja: Ctrl+Shift+R, o quitar el service worker y vaciar `caches` desde la consola.
- Verificado a 375 × 812, 375 × 667, 320 y 1440 px de ancho: sin desbordamiento horizontal.

## 8. Historial de esta rama

| Commit | Cambio |
|---|---|
| `9c59419` | Flujo del alumno: cuestionario, paquetes con perfil del maestro, revisión, checkout limpio, agenda semanal, bienvenida en Mensajes, Tienda, encabezado con Mensajes y Mi cuenta, menú del teléfono completo. |
| `e463fcd` | Aviso "En construcción" en Reservar y barra fija compacta en el teléfono. |
| `7dbad8c` | Capturas, `.claude/launch.json`, `.gitignore` y README. |
| `230099d` | Historias de usuario en `.docx` dentro de `documentos/`. |
| `00e9a8d` | Botón Atrás regresa a la landing (`location.replace`); con sesión activa se entra directo al tablero. Versión 2.3.2-ui. |

En la landing: `81cdd47`, que abre la plataforma en la misma pestaña.

## 9. Pendientes

### Errores conocidos

- [ ] **Cancelar** una reserva (`window.cancel` en `app.js`) no devuelve la clase al paquete: hay que descontar `learner.package.scheduled`.
- [x] Reagendar ya no borra reservas: `student-ui.js` muestra un aviso sobre 24 horas y módulo pendiente. La operación real sigue sin implementarse.
- [x] Mis reservas ordena las próximas clases por fecha y hora y separa el historial; el contador inferior incluye solo próximas clases.
- [ ] El monedero muestra siempre "$150 · Saldo suficiente", incluso con el paquete de $160.

### Producto y contenido (lo define el cliente)

- [ ] Precios definitivos de los paquetes.
- [ ] Alinear con la landing: allí los paquetes se llaman **Essential** (8 clases, 1 reagendado al mes), **Pro** (12, 2) e **Intensive** (16, 3). La plataforma aún no usa esos nombres ni limita los reagendados.
- [ ] Videos, currículums y especialidades reales de cada maestro; video de la metodología.
- [ ] Políticas de vigencia, cancelación, cambios y recuperación de clases.
- [ ] Confirmar la regla de acumulación de paquetes (sección 5).
- [ ] Memo coins: juegos, acumulación y canje (hoy solo se presenta el concepto).
- [ ] Disponibilidad real por maestro para la agenda semanal; después, quitar el aviso "En construcción".
- [ ] Decidir si vuelve **Mis clases** al menú y qué contendrá.
- [ ] Historias de usuario del flujo de 144 clases (las de `documentos/` describen la plataforma anterior).

### Integración (etapa posterior)

- [ ] Autenticación real, Stripe, agenda, Google Meet y correos.
- [ ] Integración con WordPress, Amelia, WooCommerce, ClassPress, BP Better Messages y TeraWallet.

### Repositorio

- [ ] Abrir el pull request `feature/flujo-alumno-144-clases` → `main` (el usuario pidió esperar).
- [ ] Al fusionar a `main`, revisar desde qué rama publica GitHub Pages.

## Actualización 2.4.1 — móvil e inicio

- Inicio sustituye el hero y las métricas repetidas por próxima clase o siguiente acción, saldo disponible, progreso 48/96/144, metodología y Memo coins.
- Guía opcional de cinco pasos en el primer acceso al dashboard de esta versión. Se recuerda en localStorage (`ecs-student-guide-v1`); puede repetirse desde Inicio o Mi cuenta. Se puede cerrar, omitir, volver o avanzar; usa dialog nativo para teclado y foco.
- Correcciones móviles de min-width, rejillas, compras, checkout, cuenta, mensajes, horarios y botones. Tarjetas de maestro compactas; los pasos de compra vuelven arriba.
- Los precios, pagos y datos continúan siendo de demostración. Reservar mantiene su aviso En construcción.

## Actualización 2.4.2 — acceso a cuenta

Avatar del encabezado dentro de un botón con texto Mi cuenta, borde, fondo e indicador desplegable. Estados hover, pulsado, foco y menú abierto. Escape cierra el menú y devuelve el foco al botón.

## Actualización 2.5.0 — navegación, ayuda y reservas

- Barra inferior permanente de cuatro destinos, más grande: Inicio, Reservar, Mis reservas y Ayuda. Mis reservas muestra el contador de próximas clases. Se conserva también en escritorio para mantener accesible la agenda después de quitarla del menú lateral.
- Menú lateral: Inicio, Mis paquetes y Ayuda; sin avatar, Reservar ni Mis reservas. Mi cuenta continúa en el encabezado.
- `#/ayuda`: guía, temas de orientación, preguntas frecuentes, chat de soporte de demostración y enlace a WhatsApp.
- `#/reservas`: tarjetas ordenadas por fecha, pestañas Próximas/Historial, Ir a clase con Google Meet y Reagendar. Sin Cancelar.
- Reagendar solo informa que se requieren al menos 24 horas y que el módulo está pendiente. No modifica reservas ni paquetes.
- Meet usa la URL asignada si es válida; en su ausencia abre https://meet.google.com/ y se indica que es demostración. No se inventaron salones.
