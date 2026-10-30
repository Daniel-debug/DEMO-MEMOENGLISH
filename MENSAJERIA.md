# Mensajería · 3.0.0-ui

Ruta `#/mensajes`, acceso desde el icono del encabezado y Ayuda. Script `messaging.js` después de `courses.js`. Los alumnos conversan con sus profesores y con el asistente de English Club; no hay contactos de alumnos ni grupos.

Profesores: se muestran únicamente maestros asociados por nombre a reservas no canceladas de la cuenta demo. Se reutiliza la bienvenida existente (`syncTeacherWelcome`) y sus contadores. No se inventan estados en línea, confirmaciones de entrega o respuestas del profesor. La interfaz advierte que el envío real está pendiente. Los mensajes se guardan localmente.

Asistente: respuestas automáticas locales basadas en reglas, sin API de IA, con orientación sobre reservas, paquetes/vigencia, 144 clases, grabaciones, cambios de horario y soporte administrativo. Usa el estado demo del paquete y reserva próxima. Ofrece enlaces internos y WhatsApp oficial ya usado en Ayuda. No agenda, cancela, cambia ni paga nada, ni simula tickets enviados. Se identifica como asistente de demostración.

Experiencia: bandeja con búsqueda y filtros, historial y borradores por conversación, mensajes no leídos en encabezado, respuestas rápidas, hora de Ciudad de México, Enter para enviar y Shift+Enter para salto de línea. Móvil: bandeja/conversación con Volver, altura adaptable a visualViewport para el teclado, compositor visible y scroll interno del historial; navegación inferior oculta solamente dentro del chat. Animaciones reducidas según preferencia.

Persistencia: `ecs-messages-demo-andrea-v1` en localStorage; tolera falta de almacenamiento sin bloquear el chat. No es un sistema de autenticación ni sincronización entre dispositivos. No se envía información fuera del navegador. El enlace WhatsApp solo se abre al pulsarlo.

Pendiente de backend: autenticación, autorización alumno–profesor, IDs de cuenta y conversaciones, envío/recepción real, estado de entrega, WebSocket/polling y notificaciones, sincronización y borradores por cuenta. Sustituir la asociación demo por nombre por asignaciones autorizadas de servidor. Para un bot real, integrar un servicio con conocimiento de la escuela, fuentes verificables y derivación administrativa; no exponer secretos en frontend.

Verificación: `tests/check-messaging.cjs` con Playwright/Edge comprueba contactos permitidos, respuestas contextuales, escape de texto, historial/borradores, filtros, navegación móvil, tamaño reducido del viewport, persistencia y limpieza al salir.


### Conversación de prueba con Memo · 3.0.1-ui
Por petición explícita del usuario, Memo aparece como contacto de muestra incluso sin reserva. Se añade una única invitación de ejemplo a practicar en su casa, rotulada Mensaje de prueba. No crea una reserva ni envía mensajes reales. Ruta directa: `#/mensajes/t-memo`.


### Mensaje de prueba · 3.0.2-ui
Texto de la muestra de Memo actualizado a la frase exacta solicitada por el usuario. Al abrir el chat se actualiza también la muestra ya guardada en este navegador.


### Mensaje de prueba · 3.0.3-ui
Muestra de Memo reemplazada por el nuevo texto exacto proporcionado por el usuario; también actualiza la copia local al abrir el chat.


### Adjuntos · 3.0.4-ui
Botón de clip para documentos y fotos (hasta 5 por mensaje, 10 MB cada uno), vista previa, eliminación antes de enviar, pegado de imágenes y descarga desde el mensaje. Los archivos enviados se guardan como blobs en IndexedDB y su metadato en el historial local; se recuperan al recargar. Los archivos seleccionados sin enviar se conservan en memoria por conversación. Bot no analiza contenido de archivos y lo indica. Todavía no hay subida ni envío externo al profesor.
