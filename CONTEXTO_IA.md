# Contexto para IA y nuevos colaboradores

Actualizado: 28 de octubre de 2026 · Versión del prototipo: **2.7.3-ui** · Rama: `feature/flujo-alumno-144-clases`.

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

## Actualización 2.5.1 — barra tipo BBVA

Barra inferior flotante con margen a los lados y abajo, esquinas redondeadas, iconos azul de marca y opción activa circular azul con símbolo blanco. Se retiró el fondo amarillo de la opción activa. Se conservan los cuatro destinos y el contador de próximas clases.

## Actualización 2.5.2 — referencia móvil aportada

Barra ajustada a la captura del usuario: altura 72 px, círculo activo 38 px, iconos de trazo fino 23 px y etiquetas compactas. Azul de navegación, cuatro destinos y contador de próximas clases.

## Actualización 2.5.3 — colores de marca e iconos distintos

La referencia de BBVA solo define forma y proporciones. Mantener azul ECS, amarillo ECS y neutros originales: círculo activo amarillo con icono oscuro. Reservar usa calendario con +; Mis reservas usa una lista de confirmaciones, sin forma de calendario.


## Cambios locales 2.7.3-ui · navegación, bienvenida y reservas

- La navegación inferior queda exclusivamente para móvil (hasta 1000 px). En escritorio, Inicio, Reservar, Mis reservas, Mis paquetes y Ayuda aparecen en el menú lateral. Amarillo activo móvil más suave: #f1dc88.
- Se recupera la bienvenida antes del primer dashboard. De momento es una presentación animada con controles de reproducción; el video oficial sigue pendiente. Configurar WELCOME_VIDEO_URL en student-ui.js cuando exista. Se puede repetir desde Mi cuenta y Ayuda. Estado local independiente ecs-welcome-film-v1.
- STUDENT_TOUR_ENABLED=false desactiva el tour de la aplicación y sus accesos visibles; se conserva su código para retomarlo después.
- Reservar ahora permite elegir maestro, fechas y horarios individuales, añadir varias clases y revisar antes de confirmar. No genera recurrencias automáticas. Muestra saldo, vencimiento y ritmo semanal del paquete; evita duplicar fechas y exceder créditos o vigencia. La confirmación sigue siendo simulada en localStorage.
- Verificación: 10 pruebas node:test aprobadas, sintaxis JS correcta, confirmación de dos clases en navegador manteniendo una reserva previa y ajuste sin desbordamiento a 320, 375, 430, 768 y 1440 px. Capturas en documentos/capturas-2.7.3/.


## Cambios locales 2.7.3-ui
- Reservar: horario seleccionado con amarillo y marca, aria-pressed y segundo toque para quitar. La selección permanece en borrador hasta confirmar.
- Debajo del horario: solo esta clase, esta y la semana siguiente o todos los mismos días dentro de la vigencia. weeklyBookingChoices valida créditos, fechas ocupadas, límite semanal y vencimiento; cambiar de opción retira únicamente las fechas generadas por esa opción.
- Mis paquetes: saldo, botones y tarjetas adaptados a móvil; animaciones finitas y respuesta al tocar, con prefers-reduced-motion.
- Verificados selección/deselección y modos de repetición en navegador; Mis paquetes sin desbordamiento a 320/375/430/768/1440 px. 12 pruebas aprobadas. Se utilizó una compra exclusivamente simulada para probar el paquete activo.


### Ajuste 2.7.3-ui: Mis paquetes y compra móvil
Los paquetes aparecen antes del saldo/estadísticas. Las tarjetas conservan tres columnas donde caben y una composición compacta en teléfonos estrechos. La revisión móvil se centró en el flujo posterior a seleccionar paquete: campos de primera clase, perfil de maestro, botones Anterior/Continuar y resumen final. Botones apilados hasta 700 px, sin desbordamiento en 320/375/430/768/1440 px; 12 pruebas aprobadas. No se confirmó una compra en esta revisión.


## Dashboard y paleta · 2.7.3-ui
Dashboard: cabecera ilustrada personalizada, entrada escalonada, ruta de etapas con meta acumulada, tarjeta de impulso contextual según reservas/paquete. No se inventan rachas ni logros; sigue usando el avance real de la demo. Animaciones finitas y prefers-reduced-motion. Sin desbordamiento a 320/375/430/768/1440 px.
Paleta de acciones unificada en variables CSS: amarillo #fcda00 con texto oscuro, azul #23374c con texto blanco, secundario blanco con borde neutro y selección suave #f1dc88. Se eliminan gradientes naranja en pagos/reservas y verde en acceso a clase. Verde/rojo siguen reservados para mensajes de estado. Marcas de login social conservadas.


## Cursos pregrabados · 2.8.0-ui
Nuevo módulo `#/cursos` en el sidebar izquierdo. Ver `CURSOS_PREGRABADOS.md` para alcance, video de prueba, persistencia demo y contrato de backend. Script `courses.js` cargado después de `student-ui.js`.


### Experiencia de cursos · 2.8.1-ui
Cabecera con resumen de avance, filtros rápidos, tarjetas animadas, estados de carga, modo de video ampliado en escritorio, velocidad de reproducción y temario en panel modal móvil. Vocabulario y práctica en pestañas accesibles por teclado; confirmación animada al completar y respuesta visual en ejercicios. Animaciones respetan prefers-reduced-motion. Implementado con CSS y controles nativos, sin dependencias externas adicionales.


### Corrección de alcance · 2.8.2-ui
Mis grabaciones (`#/cursos`) pertenece al programa existente de 144 clases pagadas. Reemplaza el catálogo independiente anterior: reproductor y lista compacta, sin banners ni material ficticio. No hay grabaciones reales conectadas todavía. Ver `CURSOS_PREGRABADOS.md` para el contrato de integración y permisos.


### Material por clase y muestra · 2.8.3-ui
Clase 1 incluye una muestra técnica CC0 de MDN (5 segundos, flores sin audio, identificada como prueba), guía TXT descargable y 3 preguntas de saludos/presentaciones. La muestra solo se añade cuando el servicio no devuelve clase 1; no sustituye una grabación existente ni cuenta como grabación real. Cada clase muestra pestañas compactas Material didáctico/Practicar debajo del reproductor, con estado pendiente si no hay contenido. El contrato admite resources [{title,url,type}], vocabulary [[inglés,español]], practice [{prompt,options,answer: índice}]. El adaptador de reservas admite recordingResources, recordingVocabulary y recordingPractice. La práctica de muestra no modifica el progreso académico, créditos ni calificaciones del alumno.


### Acabado corporativo · 2.8.4-ui
Se retiró el selector externo de velocidad: se usan los controles nativos del video. Superficies con relieves, sombras y gradientes discretos; selección de clase, pestañas, descargas y respuestas con transiciones cortas. Biblioteca fija al desplazarse en escritorio. Sin banners ni mayor altura de contenido; las animaciones respetan reducir movimiento.


### Aula de estudio · 2.9.0-ui
Patrón de navegación tipo curso: video amplio, contenido a la derecha por secciones Básico/Intermedio/Avanzado desplegables y recursos debajo. Móvil: pestañas Contenido/Material didáctico/Practicar, video fijo al desplazarse y navegación inferior global oculta solo dentro del aula para no obstruirla; el menú superior sigue disponible. Reorganizar al cambiar ancho no recrea el video. Se conservan colores ECS y controles nativos.


### Desplazamiento móvil y pendientes · 2.9.1-ui
El video vuelve a desplazarse naturalmente; solo se anclan las pestañas bajo el encabezado. Se elimina el doble sticky y el cálculo de altura con ResizeObserver. Lista larga sin scroll anidado ni anclaje automático al expandir pendientes; cambio de pestaña desde una posición profunda vuelve al comienzo de su contenido. Pendientes invitan a reservar y explican que la grabación se publica después de tomar la clase; si la clase ya está reservada o tomada se muestra el mensaje correspondiente en lugar de pedir reservar otra vez.


### Navegación de grabaciones · 2.9.2-ui
Ver pendientes se activa al abrir el aula. Mis grabaciones aparece inmediatamente debajo de Mis reservas en el menú lateral.


### Mensajería · 3.0.0-ui
Nuevo `messaging.js` después de `courses.js`: chat alumno–profesor y asistente ECS, sin grupos ni contactos de alumnos. Bot local de orientación, filtros, borradores/historial local, contadores y vista móvil adaptable al teclado. Envío real a profesores pendiente de backend. Ver `MENSAJERIA.md`.


### Conversación de prueba con Memo · 3.0.1-ui
Por petición explícita del usuario, Memo aparece como contacto de muestra incluso sin reserva. Se añade una única invitación de ejemplo a practicar en su casa, rotulada Mensaje de prueba. No crea una reserva ni envía mensajes reales. Ruta directa: `#/mensajes/t-memo`.


### Mensaje de prueba · 3.0.2-ui
Texto de la muestra de Memo actualizado a la frase exacta solicitada por el usuario. Al abrir el chat se actualiza también la muestra ya guardada en este navegador.


### Mensaje de prueba · 3.0.3-ui
Muestra de Memo reemplazada por el nuevo texto exacto proporcionado por el usuario; también actualiza la copia local al abrir el chat.


### Adjuntos · 3.0.4-ui
Botón de clip para documentos y fotos (hasta 5 por mensaje, 10 MB cada uno), vista previa, eliminación antes de enviar, pegado de imágenes y descarga desde el mensaje. Los archivos enviados se guardan como blobs en IndexedDB y su metadato en el historial local; se recuperan al recargar. Los archivos seleccionados sin enviar se conservan en memoria por conversación. Bot no analiza contenido de archivos y lo indica. Todavía no hay subida ni envío externo al profesor.


### Dashboard · 3.0.5-ui
La tarjeta de próxima clase usa azul petróleo más definido, texto claro y acción amarilla. Entradas escalonadas de tarjetas/etapas, revelado de progreso y microinteracciones de iconos y botones, sin añadir contenido ni alterar avance. Animaciones respetan reducir movimiento; hover solo para dispositivos compatibles.


### Sidebar corporativo · 3.0.6-ui
Navegación agrupada en Mi aprendizaje y Servicios, iconos en superficies discretas, selección con acento amarillo y aria-current, colores azul petróleo y tipografía afinada. Instalación y cierre de sesión con tratamiento sobrio. Logo, orden de rutas y ancho de escritorio conservados. Menú móvil desplazable y animaciones breves compatibles con reducir movimiento.


### Próxima clase · 3.0.7-ui
Se recupera el fondo claro de la tarjeta, con un tinte azul ligeramente más definido, texto oscuro, borde suave y elevación Material discreta. Se retiran el fondo petróleo y sus adornos; las animaciones del dashboard se conservan.


### Material y legibilidad · 3.0.8-ui
Tarjeta de próxima clase clara con elevación suave, fecha y acción en cápsulas. Superficies y balances Material con radios consistentes y sombras sin bordes de relieve duros. Sidebar con textos más grandes/contrastados y seminegrita, selección tonal clara con texto oscuro e icono amarillo; etiquetas de sección más legibles. Se conserva estructura y orden.


### Siguientes reservas · 3.0.9-ui
La tarjeta principal conserva la reserva más cercana y añade a su derecha las siguientes dos reservas válidas ordenadas por fecha, sin repetir la principal ni incluir canceladas/completadas/pasadas. Móvil: resumen debajo de la principal. Si no hay más reservas se invita a agendar, sin inventar clases.


### Agenda visual · 3.0.10-ui
Panel de siguientes clases con fondo propio y divisor de 2 px, tarjetas numeradas 01/02 y mayor jerarquía de fechas. En móvil la clase principal incluye acción de ancho completo y las siguientes se presentan como filas independientes debajo de una separación marcada. Sin cambios de datos ni navegación.


### Revisión responsive · 3.0.11-ui
Campos de primera clase uniformes (52 px, fuente 16 px), selector de hora sin recortes y disponibilidad validada con hora de Ciudad de México antes de revisión. Matriz responsive de 86 pantallas/anchos y pruebas de compra completa, primer acceso, agenda, chat, adjuntos y grabaciones. Alcance, pruebas y límites en `REVISION_RESPONSIVE.md`.
