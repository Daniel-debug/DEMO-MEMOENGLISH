# Flujo del alumno — interfaz de demostración

Rama: feature/flujo-alumno-144-clases.

Alcance: interfaz únicamente. Sin autenticación, cargos, correos, disponibilidad real ni cuentas reales. Las preferencias y la sesión de demostración se conservan en este navegador. Véase PRIMER_ACCESO_UI.md para el flujo actualizado.

## Recorrido

1. Iniciar sesión o crear cuenta; Google/Facebook son accesos de demostración. Registro con teléfono.
2. Completar objetivo, industria, ocupación, plazo y nivel.
3. Consultar tablero: 144 clases totales, tomadas, por agendar, tres niveles y Memo coins.
4. Elegir paquete de 8, 12 o 16 clases.
5. Consultar perfiles y elegir maestro, fecha futura y horario de ejemplo.
6. Revisar resumen y aceptar vigencia antes de simular compra.
7. Ver confirmación, reserva y tablero actualizado.

## Contenido pendiente

- Precios aprobados de paquetes.
- Video de metodología y videos, currículums y especialidades de profesores.
- Políticas definitivas de expiración, cancelación, cambios y recuperación de clases.
- Juegos, acumulación y canje de Memo coins (el tablero solo presenta el concepto).
- En una etapa posterior: autenticación, Stripe, agenda real, Meet y correos.

Se muestra un mes de vigencia como propuesta de la reunión. Las alertas y reactivación de alumnos siguen pendientes de definición. El programa presenta 9 meses a 4 clases/semana o 18 meses a 2, como referencia comercial de la reunión.

## Verificación

Comprobación de sintaxis JavaScript y prueba de estados: encuesta inicial, tablero de 144 clases, bloqueo de pago sin reserva, compra simulada y confirmación. Pendiente revisión visual en navegador y dispositivos reales.
