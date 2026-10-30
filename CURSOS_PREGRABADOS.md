# Grabaciones del programa · 2.8.2-ui

El módulo `#/cursos` se llama **Mis grabaciones** en el sidebar. Sustituye el catálogo de cursos independientes por las grabaciones del programa existente de 144 clases, en etapas Básico (1–48), Intermedio (49–96) y Avanzado (97–144).

Interfaz compacta: reproductor y lista en escritorio; reproductor seguido de lista en móvil. Búsqueda por número, título o maestro, filtro por etapa, opción de ver pendientes, velocidad y reanudación local por clase. No hay banners, tarjetas de catálogo, ejercicios inventados ni video técnico de flores. Ver una grabación no modifica `learner.taken`, créditos, compras o reservas.

No existen grabaciones reales vinculadas en los datos actuales. Se muestra el estado pendiente, sin simular que existen videos del alumno ni inventar permisos de compra. Los 144 lugares representan el programa, no 144 videos publicados ni pagados de una vez.

El adaptador `window.ecsRecordingService.list()` debe devolver las grabaciones autorizadas con `{number: 1..144, title, teacher, date, url, captions, duration}`. Debe configurarse antes de courses.js. El adaptador local reconoce reservas con `programNumber`, `recordingUrl` y opcionales `recordingCaptions`, `recordingDuration`. La producción necesita autenticación y permisos del lado servidor, asociación de grabación con alumno/clase pagada y videos privados. No se deduce acceso por haber comprado un paquete ni se publican URLs de otras cuentas. La persistencia actual del segundo reproducido es local; sincronizarla en backend queda pendiente.

Servidor estable: `node tests/dev-server.cjs`, puerto 8093. Las pruebas del módulo están en `tests/check-courses.cjs` y usan Playwright/Edge con datos aislados de prueba.


### Material por clase y muestra · 2.8.3-ui
Clase 1 incluye una muestra técnica CC0 de MDN (5 segundos, flores sin audio, identificada como prueba), guía TXT descargable y 3 preguntas de saludos/presentaciones. La muestra solo se añade cuando el servicio no devuelve clase 1; no sustituye una grabación existente ni cuenta como grabación real. Cada clase muestra pestañas compactas Material didáctico/Practicar debajo del reproductor, con estado pendiente si no hay contenido. El contrato admite resources [{title,url,type}], vocabulary [[inglés,español]], practice [{prompt,options,answer: índice}]. El adaptador de reservas admite recordingResources, recordingVocabulary y recordingPractice. La práctica de muestra no modifica el progreso académico, créditos ni calificaciones del alumno.


### Acabado corporativo · 2.8.4-ui
Se retiró el selector externo de velocidad: se usan los controles nativos del video. Superficies con relieves, sombras y gradientes discretos; selección de clase, pestañas, descargas y respuestas con transiciones cortas. Biblioteca fija al desplazarse en escritorio. Sin banners ni mayor altura de contenido; las animaciones respetan reducir movimiento.


### Aula de estudio · 2.9.0-ui
Patrón de navegación tipo curso: video amplio, contenido a la derecha por secciones Básico/Intermedio/Avanzado desplegables y recursos debajo. Móvil: pestañas Contenido/Material didáctico/Practicar, video fijo al desplazarse y navegación inferior global oculta solo dentro del aula para no obstruirla; el menú superior sigue disponible. Reorganizar al cambiar ancho no recrea el video. Se conservan colores ECS y controles nativos.


### Desplazamiento móvil y pendientes · 2.9.1-ui
El video vuelve a desplazarse naturalmente; solo se anclan las pestañas bajo el encabezado. Se elimina el doble sticky y el cálculo de altura con ResizeObserver. Lista larga sin scroll anidado ni anclaje automático al expandir pendientes; cambio de pestaña desde una posición profunda vuelve al comienzo de su contenido. Pendientes invitan a reservar y explican que la grabación se publica después de tomar la clase; si la clase ya está reservada o tomada se muestra el mensaje correspondiente en lugar de pedir reservar otra vez.
