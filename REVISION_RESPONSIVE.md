# Revisión responsive · 3.0.11-ui

30 de octubre de 2026 · English Club School

## Correcciones

- Primera clase del módulo de compra: maestro, fecha y hora ahora miden 52 px de alto, con texto de 16 px y controles ajustados al ancho disponible. Se elimina la diferencia de altura entre fecha y hora.
- Selector de hora con flecha independiente, espacio suficiente para el texto y soporte de apariencia nativa del campo de fecha; en pantallas pequeñas se apilan los campos.
- Ayuda explícita: Hora de Ciudad de México; horarios no disponibles desactivados.
- Disponibilidad calculada con America/Mexico_City, aunque el navegador use otra zona. Se conserva la anticipación mínima de una hora.
- Antes de pasar a revisión se vuelve a validar maestro, fecha y horario; una selección inválida no reinicia la compra ni borra los datos.

## Verificación ejecutada

Microsoft Edge/Chromium automatizado con Playwright y zona horaria America/Mexico_City.

- 66 combinaciones de pantallas y anchos 320, 360, 390, 768, 1024 y 1440 px: acceso, registro, cuestionario, inicio, paquetes, reservas, agenda, grabaciones, mensajes, cuenta y ayuda. Sin desbordamiento horizontal, controles fuera de pantalla, imágenes rotas ni errores de JavaScript detectados.
- Otras 20 combinaciones: panel del maestro, bienvenida, resumen del cuestionario y reinicio de demostración a 320, 390, 768, 1024 y 1440 px.
- Compra completa a 320, 390 y 1440 px: paquete de 12 → maestro/fecha/hora → revisión → consentimiento → checkout (tarjeta/monedero) → pago simulado → comprobante. Se verifica una reserva y acreditación de 12 clases, sin envío de pagos reales.
- Primer acceso completo y agenda a 320 y 1440 px: cuestionario → resumen → bienvenida → inicio; elegir horario → revisión → confirmar reserva; aviso de reagendado sin alterar la reserva e historial vacío.
- Sidebar: orden de rutas, selección accesible, apertura/cierre móvil, acceso al pie en pantalla corta y reducción de movimiento.
- Grabaciones: navegación, filtros, pendientes, desplazamiento largo y horizontal del móvil, reproducción real de la muestra, descarga, práctica, teclado y cambio de ancho sin recrear el video.
- Chat: contactos profesor/asistente, respuestas locales, borradores/historial, filtros, vista móvil, espacio de teclado simulado y limpieza al salir.
- Adjuntos: fotos/documentos, selección/eliminación, envío local sin texto, descarga real, recuperación de IndexedDB al recargar y límites.
- Dashboard: principal y siguientes reservas, colores claros, progreso conservado y ausencia de recortes.
- Las 13 pruebas unitarias existentes/de agenda pasan.
- Revisión de sintaxis y `git diff --check` sin errores.

## Reproducir

Servidor: `node tests/dev-server.cjs` (127.0.0.1:8093).

Pruebas principales: `tests/check-responsive-system.cjs`, `tests/check-responsive-extra.cjs`, `tests/check-student-journey.cjs`. Pruebas por módulo en `tests/check-*.cjs`, con Playwright y Edge instalados. Resultados de la matriz principal: `tests/responsive-results.json`.

## Alcance y pendientes

La inspección verifica el prototipo local y sus flujos simulados. No certifica disponibilidad, pagos, envío de mensajes o permisos reales de backend. No se ejecutaron pruebas físicas en iPhone/Safari, Android ni lectores de pantalla; el selector nativo de esos dispositivos debe comprobarse al publicar. La simulación de un viewport pequeño para el chat no equivale a abrir un teclado físico de iOS.
