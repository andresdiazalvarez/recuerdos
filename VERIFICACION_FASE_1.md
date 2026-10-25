# Verificación de la primera fase

Fecha: 25/10/2026. Pruebas realizadas en navegador Chromium, con imágenes artificiales de prueba, sin fotografías personales. El almacenamiento de las pruebas del navegador no se incluye en el ZIP.

| Paso obligatorio | Resultado observado |
| --- | --- |
| 1. Inicio → MAPA | Inicio con MAPA, LUGAR y FECHA; abre globo real. |
| 2. Mundo → provincia española | Pulsaciones simples sucesivas sobre España y Cádiz; acercamiento animado del mismo mapa. |
| 3. Provincia → zona local | Una pulsación acerca hasta la zona de Vejer/Conil/Barbate. |
| 4. Dos pulsaciones vacías → fecha | Abre solamente el cuadro de fecha y nombre opcional. |
| 5. Punto fechado | Se guarda un punto amarillo con 25/10/2026 antes de elegir imágenes. |
| 6. Mantener fecha → selección múltiple | Pulsación de 900 ms y selección de dos imágenes; se comprueba que admite múltiples. Se cambia su orden. |
| 7. Guardar fondos → mapa → un toque | Regresa al mapa; el punto aparece disponible. |
| 8. Entrada en panorámica | Un toque abre el recorrido horizontal del punto elegido. |
| 9. Toque vacío → foto individual | Abre el selector individual desde el punto pulsado en la panorámica. |
| 10. Texto y fecha | Responder Sí, escribir texto y Enter coloca foto, fecha y texto. También se comprueba No + Enter: añade otra foto sin borrar la primera. |
| 11. Foto completa | Una pulsación en foto existente abre el original completo con ajuste sin recorte; no abre selector. |
| 12. Cierre conserva dirección | Se comparan los desplazamientos de los fondos antes y después del cierre: idénticos. |
| 13. Segundo punto y panorámica | Otro punto independiente, con la misma fecha y otro lugar; selección y guardado de dos fondos. |
| 14. Primera panorámica conservada | Se abre la primera y se recupera la foto en su dirección guardada. |
| 15. Cerrar y abrir | Se cierra la pestaña y se abre otra. LUGAR conserva zona, puntos y panorámicas; la primera conserva las dos fotos. |

Comprobaciones adicionales:

- Guardar esta zona conserva la vista y la muestra en LUGAR.
- LUGAR y FECHA no fusionan los dos lugares con fecha 25/10/2026.
- Las entradas de los listados viajan al punto y entran en su panorámica.
- Atrás desde una panorámica abierta desde LUGAR conserva exactamente centro y zoom del punto: se comparan los valores de la vista antes y después.
- Mantener una foto activa edición; arrastrarla cambia la posición sin mover los fondos.
- El diseño se revisa con 390 × 844 píxeles y en escritorio.
- Cinco pruebas automatizadas pasan: adición de panorámicas sin sustitución, conservación de fotos y relaciones, combinaciones lugar/fecha, dirección circular y fechas válidas, y persistencia IndexedDB con rollback al fallar una transacción.
- TypeScript y compilación de producción completados. Vite avisa del tamaño de la librería cartográfica, sin impedir la compilación.

Límite de la verificación: no se ha probado el selector de álbumes ni los gestos con un Android o iPhone físico. El usuario debe comprobarlos en su dispositivo. Los fondos normales forman un recorrido circular; no se ha desarrollado cosido 3D ni mapa sin conexión.

## Corrección 0.3.1: doble pulsación → marcador nuevo → carga guiada

Se incorpora la petición posterior del usuario: la doble pulsación en un espacio vacío inicia directamente la creación de un recuerdo completo. Muestra un marcador provisional, pide fecha y nombre opcional, y «Crear punto y continuar» guarda el punto y abre el paso de selección de fondos. No exige mantener de nuevo la fecha. El punto se conserva si se elige «Cargar más tarde» o se cancela la selección. La pulsación prolongada sigue disponible como alternativa para puntos existentes.

Se incorpora detección directa con Pointer Events para el doble toque en pantallas táctiles, sin depender de que el navegador genere dblclick. Los clics sintetizados después del toque no se cuentan dos veces; los arrastres y los gestos con varios dedos cancelan el toque pendiente.

Diez pruebas automatizadas pasan. Se verifica en navegador una doble pulsación sobre un punto vacío de Cádiz: no cambia el zoom antes del cuadro; se guarda un marcador nuevo y aparece automáticamente «Punto creado · Cargar panorámica»; su selector admite múltiples imágenes. Los puntos anteriores siguen disponibles. Sigue pendiente verificar los gestos en un teléfono físico.
Se completa también en navegador la continuación del marcador nuevo: elegir dos fondos desde el paso guiado, ordenar, guardar y abrir con una pulsación su propia panorámica. Los cuatro marcadores previos siguen disponibles.

## Mi ubicación · 0.3.2

Se añade el botón «Mi ubicación» en el mapa. Solicita una posición nueva al pulsarlo, centra el mapa, muestra un marcador azul diferente de los recuerdos y la precisión aproximada. La vista anterior queda disponible en Atrás. No crea registros de recuerdo ni realiza seguimiento continuo.

Quince pruebas automatizadas pasan, incluidas cinco específicas de geolocalización: consulta única y opciones de precisión/tiempo/caché, orden de coordenadas, bloqueo en HTTP inseguro y falta de soporte, permiso denegado/falta de señal/tiempo agotado, datos inválidos y zoom según precisión. Las coordenadas de estas pruebas son ficticias de demostración; no se consulta la posición real del usuario para ejecutarlas.

La ubicación GPS real y la concesión del permiso deben comprobarse en el móvil del usuario. No se ha aceptado ningún permiso de ubicación en su nombre.
