# Primera experiencia del alumno · interfaz

Actualizado: 28 de octubre de 2026. Código en `journey.js`; contexto general y pendientes en `CONTEXTO_IA.md`.

Esta versión continúa siendo una demostración: no hay autenticación real ni servicios externos. Las preferencias, borrador, estado de bienvenida y sesión simulada se conservan en este navegador mediante localStorage. No se guardan contraseñas ni datos de tarjeta.

## Decisiones de experiencia

- Una pregunta por pantalla e ilustración específica para cada tema: meta, industria, ocupación, ritmo y nivel.
- Metas laborales: cinco preguntas. Viajes, niños, exámenes y pasatiempos: tres preguntas; se omiten industria y ocupación.
- Industria con buscador, teclado y opción Otra. Industria y ocupación siguen siendo opcionales.
- Resumen revisable antes de guardar. Las respuestas no hacen un diagnóstico ni asignan un nivel académico.
- Primera visita al tablero: bienvenida personal y tres pasos de orientación. Después: saludo de regreso.
- Mi cuenta (desde el menú del avatar, en el encabezado): consultar y actualizar preferencias, cancelar cambios sin modificar el perfil guardado y repetir la bienvenida cuando se desee.
- Actualizar preferencias conserva clases y reservas. Un nivel declarado avanzado no acredita clases tomadas.
- Animaciones breves al entrar, seleccionar y completar; movimiento reducido desactiva las animaciones.

## Progreso acumulado

- Básico: clases 1 a 48. Primer hito: 48 clases acumuladas.
- Intermedio: clases 49 a 96. Segundo hito: 96 clases acumuladas.
- Avanzado: clases 97 a 144. Programa completo: 144 clases acumuladas.

## Arte

Cinco ilustraciones originales generadas con ImageGen, optimizadas como WebP en assets/. Materiales de papel y arcilla, azul marino, amarillo y marfil; sin texto incrustado. El texto de cada pantalla es HTML accesible.

## Validación

Pruebas de estado: acceso inicial y recurrente, ramas del cuestionario, restauración local, cierre de sesión sin borrar preferencias y límites 0/48/49/96/97/143/144. Revisión de recorrido en navegador para el resumen, bienvenida y edición desde Mi cuenta.
