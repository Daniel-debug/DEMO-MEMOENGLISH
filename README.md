# Propuesta de rediseño de la plataforma booking

Actualizado: 28 de octubre de 2026.

Repositorio actual: `C:\Users\el_da\Documents\git-vega`. Versión del prototipo: **2.7.3-ui**.

**Para retomar el trabajo (personas o IA), empezar por `CONTEXTO_IA.md`**: arquitectura,
estado, reglas, convenciones y pendientes. El recorrido del alumno está en
`FLUJO_ALUMNO_UI.md` y el cuestionario inicial en `PRIMER_ACCESO_UI.md`. Los documentos
de historias de usuario (.docx) y las capturas de la plataforma están en `documentos/`.
Los datos de ejemplo viven en memoria; el avance del alumno se guarda en `localStorage`.

Prototipo navegable de la plataforma de reservas de English Club School. Está construido
solamente con **HTML, CSS y JavaScript**, usa datos simulados y no depende de WordPress,
MySQL, servicios externos ni paquetes de terceros.

## Ejecutar

**Rápido:** `.claude/launch.json` levanta `python -m http.server 8093` → http://localhost:8093/.
Igual que `php -S` (ver abajo), a veces corta conexiones y la hoja de estilos llega vacía;
si la página aparece sin estilos, recargar.

**Con Apache de XAMPP.** Hay un VirtualHost dedicado en
`C:\xampp\apache\conf\extra\httpd-propuesta-booking.conf` utilizado por la instalación local anterior en el puerto 8091. Al trabajar en este
repositorio hay que comprobar que su DocumentRoot apunte a la ruta actual.
Esta configuración depende de la laptop y no forma parte del repositorio:

- Propuesta: http://127.0.0.1:8091/

**No usar `php -S` para esta carpeta.** El servidor interno de PHP es de un solo hilo y
resetea las peticiones concurrentes. Comprobado el 3 de octubre de 2026: sirviendo con
`php -S`, la hoja de estilos cargaba con **0 reglas** y el service worker fallaba a
registrarse con «An unknown error occurred when fetching the script». Con Apache, la misma
hoja carga con **675 reglas**. Sirve para una página estática simple; no para una PWA.

## Publicar en GitHub Pages

La carpeta es completamente estática: **no necesita PHP, ni Node, ni base de datos.** Los archivos de la aplicación se publican tal cual; `documentos/` contiene material
de revisión, no recursos necesarios para ejecutar la interfaz.

1. Crear el repositorio y subir el **contenido de esta carpeta en la raíz** del repo, no la
   carpeta dentro de otra.
2. En el repositorio: **Settings → Pages → Source: Deploy from a branch**, rama `main`,
   carpeta `/ (root)`.
3. Queda en `https://USUARIO.github.io/REPO/`.

Hoy https://daniel-debug.github.io/DEMO-MEMOENGLISH/ publica desde la rama
`feature/flujo-alumno-144-clases` (verificado el 28 de octubre de 2026). La landing
(https://daniel-debug.github.io/DEMO-LANDING-MEMOENGLISH/) enlaza aquí en la misma pestaña.

### Por qué funciona en un subdirectorio

Todas las rutas del proyecto son **relativas** —`./`, `assets/...`— y el enrutado es por
hash (`#/login`), así que no hacen falta reglas de reescritura ni un `404.html`.
Comprobado: ni `index.html`, ni `styles.css`, ni `app.js`, ni el manifiesto, ni el service
worker contienen rutas absolutas que empiecen con `/`.

### El archivo `.nojekyll`

Está en la raíz y **hay que conservarlo**. GitHub Pages pasa todo por Jekyll, que ignora
archivos y carpetas que empiezan con guion bajo. Hoy el proyecto no tiene ninguno, pero el
archivo evita sorpresas si mañana se agrega uno.

### HTTPS

GitHub Pages lo da automáticamente, y es justo lo que la PWA necesita: **sin HTTPS el
service worker no se registra** y la aplicación no se puede instalar en un teléfono.
Servida por IP en la red local tampoco funcionaría; en `localhost` sí, por excepción.

### Al publicar una actualización

El número de versión debe subirse en **todos estos sitios** en cada cambio:

| Archivo | Constante | Para qué |
|---|---|---|
| `app.js` | `APP_VERSION` | Se muestra al pie del menú lateral |
| `service-worker.js` | `CACHE_VERSION` y los `?v=` de `APP_SHELL` | Nombra la caché; al cambiar, se descarta la anterior |
| `index.html` | `?v=` de `styles.css` y los scripts | Evita que el navegador use archivos viejos |
| `README.md` | Versión del prototipo | Referencia |

Llevan el mismo número a propósito (`2.7.3-ui` y `ecs-booking-2.7.3-ui`). Así, si el menú
lateral de un teléfono muestra una versión vieja, se sabe de inmediato que está sirviendo
una caché anterior y basta con una recarga forzada.



## Qué contiene

La navegación reproduce las áreas que ya existen en el respaldo de
`booking.englishclubschool.com`:

- acceso y registro de demostración;
- inicio del alumno;
- reserva de clase por servicio, maestro, fecha y horario;
- reservas existentes;
- clases de ClassPress;
- mensajes inspirados en BP Better Messages;
- tienda y carrito de WooCommerce;
- checkout con tarjeta o TeraWallet;
- cuenta unificada con perfil de solo lectura y resumen de TeraWallet;
- panel del maestro.

No se agregaron módulos ajenos al producto original. Las acciones cambian datos en memoria;
el perfil, el paquete y las reservas del alumno se guardan en `localStorage`.

En la rama `feature/flujo-alumno-144-clases` se agregó el flujo del alumno del programa de
144 clases (cuestionario, paquetes, agenda semanal, Tienda con clases compradas y
bienvenida del maestro). El menú quedó en Inicio, Reservar, Mis reservas y Tienda, con
Mensajes y Mi cuenta en el encabezado; Mis clases está oculta por ahora. Detalle en
`FLUJO_ALUMNO_UI.md`.

## Pagos

El checkout es una **simulación visual**. No usa Stripe real, no guarda tarjetas, no crea
pedidos y no transmite información. Se modeló a partir del flujo existente en el respaldo,
que contiene WooCommerce, WooCommerce Stripe y TeraWallet. En la copia local de WordPress,
Stripe está desactivado y no hay credenciales.

## Imágenes y estilo

Los colores, logotipos, fotografía principal y retratos de Ashley, Gonzalo, Jim y Memo se
copiaron desde `DEMO_REDISENO` a `PROPUESTA_BOOKING/assets/`. La carpeta
`DEMO_REDISENO` es una referencia de solo lectura y **no debe modificarse**.

El diseño incluye navegación lateral en escritorio, navegación inferior en móvil,
transiciones, estados de proceso y maquetación adaptable. En móvil, el menú lateral
muestra todas las opciones. Puede cerrarse con el botón, tocando fuera o deslizándolo
hacia la izquierda, y también abrirse con un gesto desde el borde izquierdo. El checkout
pide la tarjeta en campos agrupados (como Stripe Checkout), permite cambiar entre tarjeta
y TeraWallet, y muestra estados de procesamiento y un comprobante final detallado.
La reserva completa —servicio, maestro, fecha, horario, confirmación y paso a pago— usa el
mismo sistema visual del checkout: superficies claras, azul verdoso suave, amarillo para
la acción o selección actual y verde para pasos terminados. Cada avance vuelve al inicio
del contenido para evitar que una pantalla nueva aparezca fuera de la vista en móvil.
La sección **Mis reservas** incluye una cita de ejemplo marcada como **En vivo ahora**.
Presenta una acción principal para abrir Google Meet en una pestaña nueva y mantiene las
acciones existentes de reagendar y cancelar. La dirección de Meet es demostrativa y debe
reemplazarse por el enlace real de cada cita al integrar el prototipo.
El inicio móvil usa un encabezado compacto con la próxima clase y oculta la tarjeta grande
duplicada; el inicio de escritorio conserva el banner visual completo.
El checkout reconoce la cuenta iniciada y muestra nombre, correo y teléfono en una fila de
solo lectura, en lugar de volver a solicitar información personal antes de pagar.
Se comprobó a 320 px y 390 px sin desbordamiento horizontal ni imágenes rotas.

## Archivos

| Archivo | Función |
|---|---|
| `index.html` | Documento base y metadatos de la propuesta |
| `styles.css` | Sistema visual, componentes, animaciones y adaptación móvil |
| `app.js` | Datos simulados, rutas, vistas e interacciones (base) |
| `happy-path.js` | Flujo del alumno: paquetes, checkout, Reservar, Tienda y Mensajes |
| `journey.js` | Cuestionario inicial, bienvenida, preferencias y guardado en `localStorage` |
| `service-worker.js` | Caché de la PWA |
| `assets/` | Logotipos, fotografía principal, maestros e ilustraciones del cuestionario |
| `documentos/` | Historias de usuario (.docx) y capturas de la plataforma anterior |
| `CONTEXTO_IA.md` | Guía para retomar el trabajo: arquitectura, reglas y pendientes |

## Relación con el sitio original

| Elemento | Ruta o dirección | Uso |
|---|---|---|
| Respaldo original de booking | `C:\Users\el_da\Desktop\MemoEnglish\wordexpress_Segunda_parte\` | Fuente para analizar funciones y estructura |
| WordPress booking local | http://127.0.0.1:8086/ | Copia funcional con base y datos reales |
| Propuesta estática | http://127.0.0.1:8091/ | Diseño navegable con datos simulados |
| Referencia visual | `C:\Users\el_da\Desktop\MemoEnglish\DEMO_REDISENO\` | Colores e imágenes; no modificar |

La propuesta no modifica el WordPress original ni su base de datos. Para convertirla en
producto real todavía habría que integrar cada pantalla con WordPress, Amelia,
WooCommerce, ClassPress, BP Better Messages y TeraWallet.


## Inicio y móvil (2.7.3)

El dashboard y la guía de funcionamiento están en `student-ui.js`, que se carga después de `journey.js`. La guía puede repetirse desde Inicio o Mi cuenta. Detalle y validación: `MOVIL_Y_DASHBOARD_UI.md`. Pruebas: `node --test tests/student-ui.test.cjs`.

## Navegación y ayuda (2.7.3)

Barra inferior de mayor tamaño: Inicio, Reservar, Mis reservas con contador y Ayuda. Mis paquetes queda en el menú lateral. Ayuda reúne guía, preguntas frecuentes y soporte. Las reservas permiten abrir Meet; Reagendar solo informa de la anticipación de 24 horas y del módulo pendiente. No hay botón Cancelar.


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
