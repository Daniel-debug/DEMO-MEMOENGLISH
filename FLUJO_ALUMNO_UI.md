# Flujo del alumno — interfaz de demostración

Rama: `feature/flujo-alumno-144-clases` · Versión 2.5.0-ui · Actualizado: 28 de octubre de 2026.

Alcance: solo interfaz. Sin autenticación, cargos, correos, disponibilidad real ni cuentas reales. Las preferencias, el paquete y las reservas se conservan en este navegador. Arquitectura, reglas y pendientes: `CONTEXTO_IA.md`. Cuestionario inicial: `PRIMER_ACCESO_UI.md`.

## Recorrido

1. **Entrada desde la landing.** "Inicia sesión" abre la plataforma en la misma pestaña. Con sesión activa, se entra directo al tablero. El botón Atrás regresa a la landing.
2. **Acceso.** Correo, o Google/Facebook simulados. Registro con teléfono.
3. **Cuestionario.** Meta, industria, ocupación, ritmo y nivel, con una pregunta por pantalla.
4. **Tablero.** 144 clases, tomadas, por agendar, tres etapas (Básico, Intermedio y Avanzado) y Memo coins.
5. **Paquete.** 8, 12 o 16 clases al mes (2, 3 o 4 por semana), con precio de ejemplo. La pantalla ocupa todo el ancho.
6. **Primera clase.**
   - Tarjetas de maestros; "Ver perfil" muestra a la derecha video (espacio reservado), descripción, especialidades, "Elegir a…" y la nota "Solo es para tu primera clase".
   - En el teléfono, el perfil aparece entre las tarjetas y la fecha y hora.
   - Fecha preseleccionada hoy, o mañana si ya no quedan horarios con una hora de anticipación.
7. **Revisión.** Tarjeta centrada con el paquete y su vigencia, la primera clase (con botón "Cambiar"), lo que incluye y el total. Hay que aceptar la vigencia de un mes.
8. **Checkout.** Pago con tarjeta en campos agrupados (número; vencimiento y CVC) o con monedero, y un aviso discreto de "Modo de prueba". Después: "Procesando pago" y el comprobante.
9. **Después del pago.** El paquete queda acreditado, la primera clase aparece en Mis reservas y el maestro envía una bienvenida en Mensajes.
10. **Reservar (agenda semanal, "En construcción").**
    1. Maestro, con el mismo panel de perfil.
    2. Días de la semana (hasta las clases por semana del paquete) y una hora por día.
    3. Vista previa de las fechas por semana; cada fecha se puede quitar.
    - Una barra fija muestra el total y el botón "Reservar N clases".
11. **Tienda.** Clases por agendar, compradas, reservadas y tomadas, vigencia restante y compra de más paquetes.

## Navegación

- Menú lateral y barra inferior: Inicio, Reservar, Mis reservas y Tienda. En el teléfono, el menú lateral muestra todas las opciones.
- Encabezado: ícono de Mensajes con contador de no leídos y avatar con menú (Mi cuenta, Mensajes y Cerrar sesión).
- Mis clases está oculta del menú por ahora.

## Contenido pendiente

- Precios aprobados (hoy: $80, $120 y $160 USD de ejemplo).
- Videos, currículums y especialidades reales de los maestros; video de la metodología.
- Políticas definitivas de vigencia, cancelación, cambios y recuperación de clases.
- Juegos, acumulación y canje de Memo coins (el tablero solo presenta el concepto).
- Disponibilidad real de los maestros para la agenda semanal.
- En una etapa posterior: autenticación, Stripe, agenda real, Meet y correos.

El mes de vigencia y la referencia de 9 meses a 4 clases por semana o 18 meses a 2 vienen de la reunión comercial.

## Verificación

- Sintaxis JavaScript comprobada con `node --check`.
- Recorridos probados en navegador a 1440, 800, 375 y 320 px: cuestionario, compra con tarjeta y con monedero, agenda semanal (límite de días, quitar fechas, cambio de maestro), bienvenida en Mensajes con contador, Tienda, menú del teléfono e ida y vuelta con la landing.
- Pendiente: revisión en dispositivos reales.

## Navegación y ayuda (2.5.0)

Barra inferior: Inicio, Reservar, Mis reservas con contador de próximas clases y Ayuda. Menú lateral: Inicio, Mis paquetes, Ayuda. Mi cuenta está solo en el encabezado. La ruta #/ayuda incluye guía, FAQ y soporte. Mis reservas separa próximas e historial; ofrece Ir a clase (Meet) y Reagendar (solo aviso de 24 horas y módulo pendiente, sin modificar datos). Ya no ofrece Cancelar.
