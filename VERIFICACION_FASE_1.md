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

### Verificación 0.3.3

- 18 pruebas automáticas correctas: incluye idioma de etiquetas sin alterar referencias de carreteras, resultados geográficos, país en español, encuadre, coordenadas inválidas y pruebas anteriores de persistencia y gestos.
- Consulta HTTPS real a Photon con «Los Caños de Meca»: devuelve el núcleo y su playa con coordenadas.
- Compilación TypeScript/Vite correcta. Paquete docs y recuerdos.zip regenerados.
- No se pudo completar la comprobación visual de esta versión: el navegador de pruebas falló al inicializar (timeout del servicio). Pendiente confirmar visualmente desde el móvil los nombres y la selección de un resultado. No se solicitó GPS ni se alteraron recuerdos reales.

### Verificación 0.3.4

20 pruebas correctas y TypeScript sin errores. Consulta real a Photon a través de las mismas funciones de la aplicación con «praga, chequia»: primer resultado «Praga (Praha), Chequia», longitud 14.4212535 y latitud 50.0874654; encuadre de la capital. Se comprueban República Checa, países en español, orden de ciudades y exclusión de otros países. El navegador de pruebas sigue fallando por timeout de inicialización, por lo que no se afirma una verificación visual.

### Verificación 0.3.5

22 pruebas correctas y TypeScript sin errores. Consultas reales: Varsovia, Polonia devuelve Warszawa en Polonia; Calle de Alcalá, Madrid con país ES y capa street devuelve la calle en Madrid. Pruebas de campos, país fijo, calle opcional, omisión de calle fuera de España y validación de país/ciudad. La comprobación visual del formulario queda pendiente por el fallo de inicialización del navegador de pruebas documentado anteriormente.

### Verificación 0.3.6

25 pruebas correctas y TypeScript sin errores. Nuevas pruebas: inversión sin modificar el original, fotos asociadas a sus fondos, conservación de otras panorámicas, dos inversiones restauran el orden y las posiciones, persistencia al recargar y fondo único. La verificación visual sigue pendiente por el fallo del navegador de pruebas documentado anteriormente.

### Verificación 0.3.7

TypeScript y compilación de producción correctos. Cambio de presentación: factor 1.5 sobre el tamaño guardado de cada foto y máximo de altura de 150 a 225 px. Se conserva el anclaje central y se amplía el margen de representación circular. Sin cambios de almacenamiento. Verificación visual pendiente debido al fallo previo del navegador de pruebas.


### Verificación 0.4.1

TypeScript, compilación de producción y 25 pruebas correctos. No quedan referencias a trenes en src. Los archivos JS y CSS compilados tienen los mismos nombres/hash que en 0.3.7 (index-DierNB1t.js e index-Be8WoPds.css), confirmando la restauración del comportamiento previo a los trenes con ampliación del 50 %. Las fotos se siguen leyendo de la misma colección sin filtros de grupos ni borrado de almacenamiento. La comprobación visual en móvil sigue pendiente.

### Verificación 0.4.2

TypeScript, compilación y 25 pruebas existentes correctos. Los nuevos gestos usan captura de puntero, umbral de 9 px para arrastre, posición actual en referencia para evitar guardar coordenadas atrasadas, separación entre toque sencillo/doble y pulsación larga y cancelación de temporizadores. Posición y tamaño se guardan en la colección de fotos existente. Pendiente comprobar los nuevos gestos en móvil: las pruebas existentes no verifican esta interacción visual.

### Verificación 0.4.3

TypeScript y 27 pruebas correctos. Nuevas comprobaciones de lectura con tipo MIME ausente/incorrecto, contenido vacío, origen que no entrega bytes y HEIC etiquetado como JPG. No se ha reproducido el fallo concreto de decodificación: solo se dispone de una captura del error, no de la foto original. No se afirma que esta actualización resuelva todas sus causas posibles.

### Verificación 0.4.4

TypeScript y compilación correctos. Cambio de presentación y ubicación de controles: sin datos del punto ni ayuda en la panorámica, botones de igual tamaño con etiquetas accesibles y espacio seguro inferior/derecho. Pendiente comprobación visual en móvil.

### Verificación 0.4.5

TypeScript y compilación correctos. Suite existente y nuevas pruebas de secuencia doble/triple, cancelación de gesto y restauración exacta de tamaños: 30 pruebas correctas. Prueba adicional dirigida para reducción de fotos antiguas también correcta (31 pruebas en total). Las comprobaciones no sustituyen la prueba visual en móvil, pendiente.

### Verificación 0.4.6

TypeScript y 33 pruebas correctos. Nuevas comprobaciones: platos con tildes, fechas y lugares, varias fotos con el mismo plato, panorámica/foto exacta, fotos antiguas sin clasificación, edición de categoría y persistencia tras recarga. Compilación de producción correcta. Pendiente comprobación visual de formulario, listado y navegación en móvil.
