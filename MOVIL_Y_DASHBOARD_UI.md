# Inicio y experiencia móvil · 2.4.1

## Qué cambió

El dashboard prioriza la próxima clase o la siguiente acción. Después aparecen saldo disponible, clases reservadas y progreso acumulado: 48, 96 y 144 clases. Metodología, Memo coins y preferencias quedan como contenido secundario. La ilustración se conserva como acento pequeño en teléfono.

Se eliminó el bloque de video que medía 460 px en una pantalla útil de 360 px. Se corrigieron mínimos de rejillas y flex, tarjetas de maestro, campos de compra, resumen, checkout, cuenta, mensajes, agenda y botones. No se usó ocultar el desbordamiento de la página como arreglo.

La guía explica Inicio, Tienda, agenda, Mensajes y Mi cuenta. Se ofrece una vez, se puede cerrar o completar, y se vuelve a abrir desde Inicio o Mi cuenta. Guarda estado local en ecs-student-guide-v1. Usa dialog nativo, foco restaurado y movimiento reducido.

## Validación

- Pruebas funcionales: `node --test tests/student-ui.test.cjs`.
- Sintaxis de los cuatro scripts y service worker.
- Revisión de Inicio, Paquetes, Mis reservas, Mensajes, Tienda y Mi cuenta a 320, 375, 430, 768 y 1440 px. Se repitieron Inicio, Reservar, Mis reservas, Tienda, Mi cuenta y Mensajes con un paquete activo: sin elementos que excedan el ancho visible del contenido. El carrusel de conversaciones conserva su desplazamiento horizontal intencional.
- Compra simulada de 8 clases: selección de maestro y horario, revisión, checkout y comprobante. Inicio muestra la próxima reserva y siete clases disponibles.
- Guía completada en móvil, persistencia al navegar y acceso para repetir desde Mi cuenta.
- No se verificó en un teléfono físico; se usaron tamaños de navegador.

Los precios y pagos siguen siendo de ejemplo. La agenda mantiene el aviso En construcción. No se modificó ni publicó la landing.

## Navegación, reservas y Ayuda · 2.5.0

- Barra inferior de 88 px: Inicio, Reservar, Mis reservas y Ayuda. Contador de próximas clases; las clases anteriores y canceladas no se cuentan.
- Menú lateral con Inicio, Mis paquetes y Ayuda; el avatar se mantiene solo en el encabezado.
- Mis reservas muestra Próximas e Historial, ordena las fechas y ofrece Ir a clase (Meet en otra pestaña) y Reagendar (aviso de 24 horas y módulo pendiente). No ofrece Cancelar.
- Ayuda contiene guía, orientación por tema, preguntas frecuentes y accesos a soporte.
- Se revisaron Reservas, Ayuda, Inicio y Mis paquetes a 320, 375, 430, 768 y 1440 px: sin desbordamiento horizontal; contador 1 en la reserva de ejemplo.
- Se comprobó que el aviso de reagendado conserva la reserva y que los accesos a Meet abren una nueva pestaña. Se valida el dominio; sin salón asignado se abre la portada de Meet, identificada como demostración.
- Siete pruebas funcionales aprobadas. Capturas en documentos/capturas-2.5.0/. Cambios locales, sin publicar.
