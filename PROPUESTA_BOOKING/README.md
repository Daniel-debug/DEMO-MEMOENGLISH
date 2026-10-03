# Propuesta de rediseño de la plataforma booking

Actualizado: 3 de octubre de 2026.

Prototipo navegable de la plataforma de reservas de English Club School. Está construido
solamente con **HTML, CSS y JavaScript**, usa datos simulados y no depende de WordPress,
MySQL, servicios externos ni paquetes de terceros.

## Ejecutar

**Con Apache de XAMPP.** Hay un VirtualHost dedicado en
`C:\xampp\apache\conf\extra\httpd-propuesta-booking.conf` que sirve esta carpeta en el
puerto 8091. Basta con que Apache esté arriba desde el panel de XAMPP:

- Propuesta: http://127.0.0.1:8091/

**No usar `php -S` para esta carpeta.** El servidor interno de PHP es de un solo hilo y
resetea las peticiones concurrentes. Comprobado el 3 de octubre de 2026: sirviendo con
`php -S`, la hoja de estilos cargaba con **0 reglas** y el service worker fallaba a
registrarse con «An unknown error occurred when fetching the script». Con Apache, la misma
hoja carga con **675 reglas**. Sirve para una página estática simple; no para una PWA.

## Publicar en GitHub Pages

La carpeta es completamente estática: **no necesita PHP, ni Node, ni base de datos.** Son
19 archivos. Se sube tal cual.

1. Crear el repositorio y subir el **contenido de esta carpeta en la raíz** del repo, no la
   carpeta dentro de otra.
2. En el repositorio: **Settings → Pages → Source: Deploy from a branch**, rama `main`,
   carpeta `/ (root)`.
3. Queda en `https://USUARIO.github.io/REPO/`.

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

El service worker cachea. Para forzar que todos los dispositivos tomen una versión nueva,
cambiar `CACHE_VERSION` en `service-worker.js` (`ecs-booking-v1` → `v2`...). Sin eso, el
HTML y los recursos igual se refrescan, pero en la carga siguiente y no en la inmediata.

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

No se agregaron módulos ajenos al producto original. Las acciones cambian datos en memoria
y se reinician al recargar la página.

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
transiciones, estados de proceso y maquetación adaptable. En móvil, el menú lateral sólo
muestra las opciones que no están repetidas en la barra inferior. Puede cerrarse con el
botón, tocando fuera o deslizándolo hacia la izquierda, y también abrirse con un gesto
desde el borde izquierdo. El checkout incluye una tarjeta animada, cambio entre tarjeta y
TeraWallet, estados visuales de procesamiento y un comprobante final detallado.
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
| `app.js` | Datos simulados, rutas, vistas e interacciones |
| `assets/` | Copias optimizadas de logotipos, fotografía principal y maestros |

## Relación con el sitio original

| Elemento | Ruta o dirección | Uso |
|---|---|---|
| Respaldo original de booking | `..\wordexpress_Segunda_parte\` | Fuente para analizar funciones y estructura |
| WordPress booking local | http://127.0.0.1:8086/ | Copia funcional con base y datos reales |
| Propuesta estática | http://127.0.0.1:8091/ | Diseño navegable con datos simulados |
| Referencia visual | `..\DEMO_REDISENO\` | Colores e imágenes; no modificar |

La propuesta no modifica el WordPress original ni su base de datos. Para convertirla en
producto real todavía habría que integrar cada pantalla con WordPress, Amelia,
WooCommerce, ClassPress, BP Better Messages y TeraWallet.
