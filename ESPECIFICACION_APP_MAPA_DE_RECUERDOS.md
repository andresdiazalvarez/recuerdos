# INSTRUCCIONES EXACTAS PARA CODEX

## APP «MAPA DE RECUERDOS»

Lee este documento entero antes de modificar o escribir código.

No construyas una aplicación genérica de mapas con marcadores. La aplicación debe reproducir exactamente este recorrido: **mapa mundial → provincia → zona local → punto fechado → panorámica → fotografías colocadas dentro de la panorámica**.

Antes de programar, explica brevemente cómo has entendido el flujo. Después desarrolla únicamente la primera fase indicada al final. No cambies los gestos ni sustituyas funciones por otras sin autorización.

## 1. IDEA CENTRAL

La aplicación sirve para recorrer el mundo y guardar recuerdos fotográficos en el lugar donde ocurrieron.

Debe comenzar mostrando el planeta. El usuario se acerca sucesivamente hasta una provincia, un pueblo o una zona concreta. En cualquier zona cercana puede crear un **punto de recuerdo con fecha**. A ese punto se le carga una panorámica. Dentro de esa panorámica se colocan fotografías individuales con fecha y texto opcional.

La aplicación tiene tres elementos diferentes. No confundirlos:

1. **Mapa:** cartografía real por la que el usuario se desplaza y hace zoom.
2. **Panorámica:** escenario visual asociado a un punto exacto del mapa; se recorre girando horizontalmente.
3. **Fotografías del recuerdo:** imágenes independientes colocadas encima de la panorámica; al pulsarlas se abren completas.

Una panorámica no es un marcador normal ni una simple galería. Es el escenario al que se entra desde un punto del mapa.

## 2. REGLA FUNDAMENTAL: NUNCA SUSTITUIR DATOS

- Cada punto del mapa es independiente.
- Cada punto puede tener su propia fecha y su propia panorámica.
- Un lugar puede contener varios puntos y varias fechas.
- Una misma fecha puede aparecer en varios lugares.
- Crear una panorámica nueva jamás puede borrar ni reemplazar otra panorámica.
- Añadir una fotografía no puede sustituir una fotografía anterior.
- Todos los lugares, panorámicas y fotografías deben conservarse al cerrar y volver a abrir la aplicación.

Si existe una panorámica anterior, se añade otra como un registro nuevo. Nunca se reutiliza un único campo global `currentPanorama` para guardar todas.

## 3. PANTALLA INICIAL

La primera pantalla debe ser limpia y mostrar solamente tres botones grandes:

### MAPA

Abre el mapa mundial.

### LUGAR

Abre un listado de todos los lugares guardados. Cada fila muestra el nombre y sus fechas. Al pulsar una entrada, la aplicación abre el mapa, viaja automáticamente hasta sus coordenadas y muestra el punto. Si la entrada elegida ya tiene panorámica, entra en ella.

### FECHA

Abre un listado cronológico de todas las fechas guardadas. Cada fila muestra la fecha y el lugar. Al pulsar una fecha, la aplicación viaja al punto exacto y, si tiene panorámica, entra en ella.

Puede haber un mismo lugar con varias fechas y una misma fecha en varios lugares. Los listados deben representar cada combinación real sin fusionarlas incorrectamente.

## 4. UN ÚNICO MAPA MUNDIAL CONTINUO

Debe existir un único mapa cartográfico mundial con zoom real, usando MapLibre o una solución equivalente compatible con una PWA móvil.

No crear una imagen diferente para España, Galicia, Cádiz o cada pueblo. Las vistas mundial, provincial y local son niveles de zoom del mismo mapa.

El usuario nunca escribe coordenadas. La aplicación guarda automáticamente latitud, longitud, nivel de zoom, centro de la vista y, cuando sea posible, país, provincia y municipio.

### Botón «GUARDAR ESTA ZONA»

Debe existir un botón pequeño para guardar la vista actual como zona navegable.

Ejemplo: el usuario llega a Galicia, se acerca a su pueblo, pulsa `Guardar esta zona`, escribe un nombre y la app conserva el centro y el zoom actuales. La zona queda disponible en LUGAR.

El botón no genera una fotografía: guarda la posición y ampliación del mapa real.

## 5. RECORRIDO Y GESTOS DEL MAPA

El recorrido visual es: Mundo → País → Provincia → Municipio → Zona cercana → Punto fechado con panorámica.

No cambiar bruscamente entre los niveles cartográficos. Utilizar una animación de acercamiento.

### Una pulsación sobre una zona vacía

- Acerca y centra el mapa.
- Desde una provincia entra en un mapa más cercano de la zona seleccionada.
- En vista local sigue acercándose hasta el punto concreto.

### Doble pulsación sobre una zona vacía

- No debe limitarse a hacer zoom.
- Abre el formulario para crear un **punto de recuerdo** en esas coordenadas.
- Primero solicita una fecha.
- Puede solicitar después un nombre breve.
- Al guardar, aparece un punto pequeño con la fecha.

### Una pulsación sobre un punto que ya tiene panorámica

- Entra directamente en esa panorámica.

### Una pulsación sobre un punto sin panorámica

- Selecciona el punto y muestra que está pendiente de cargar la panorámica.

### Pulsación prolongada sobre el punto o su fecha

- Abre el selector de fotografías del teléfono.
- Permite elegir las imágenes que formarán la panorámica.
- Al terminar, el punto queda marcado como panorámica disponible.

Esta diferencia entre pulsación única, doble y prolongada es obligatoria.

## 6. CREAR EL PUNTO FECHADO

Al realizar una doble pulsación en una zona vacía:

1. Conservar las coordenadas exactas.
2. Abrir un cuadro pequeño para introducir la fecha.
3. Permitir un nombre de lugar opcional.
4. Crear el punto aunque todavía no tenga panorámica.
5. Mostrar la fecha junto al punto.
6. Informar: `Mantén pulsado para cargar la panorámica`.

No abrir la galería con la doble pulsación. Primero se crea la fecha. La galería se abre manteniendo pulsado el punto creado.

## 7. CREAR LA PANORÁMICA

La panorámica se carga desde un punto fechado mediante una pulsación prolongada.

Flujo exacto:

1. Mantener pulsado el punto o la etiqueta de fecha.
2. Abrir el selector de fotografías.
3. Permitir seleccionar varias imágenes.
4. Mostrar una pantalla sencilla para ordenarlas de izquierda a derecha.
5. Crear un recorrido horizontal continuo con ellas.
6. Guardar la panorámica dentro de ese punto concreto.
7. Regresar al mapa.
8. Una pulsación normal sobre ese punto entra en la panorámica.

Dentro de la panorámica:

- Arrastrar horizontalmente para girar.
- En móvil, movimiento táctil fluido.
- En ordenador, arrastre con ratón.
- El usuario debe sentir que está dentro del lugar y gira sobre sí mismo.
- No mostrar las imágenes como mosaico o galería vertical.
- Las transiciones entre fondos deben ser continuas.

En la primera fase puede usarse una secuencia circular de fotografías normales. No hace falta reconstrucción 3D ni cosido perfecto.

Cada panorámica debe tener identificador propio y estar vinculada a su punto. La aplicación puede tener muchas panorámicas simultáneamente.

## 8. COLOCAR FOTOS DENTRO DE LA PANORÁMICA

Al pulsar un espacio vacío de la panorámica:

1. Abrir el selector de fotografías.
2. Seleccionar una fotografía individual.
3. Preguntar: `¿Quieres añadir un texto?`
4. Si responde sí, mostrar el campo de texto.
5. Si responde no, continuar sin texto.
6. Confirmar con Enter o con `Guardar`.
7. Colocar la foto exactamente en la zona pulsada.
8. Añadir automáticamente la fecha del punto o permitir modificarla.
9. Mostrar debajo la fecha y el texto, si existe.

### Tamaño

- Las fotos colocadas deben ser un 30 % mayores que en el prototipo inicial.
- Deben verse claramente sin ocultar toda la panorámica.
- Una composición doble debe ser horizontal y más ancha que una foto normal.

### Interacciones de una foto colocada

- Pulsación única: abrirla completa utilizando toda la pantalla y sin recortarla.
- `X` pequeña: cerrar y regresar a la misma dirección de la panorámica.
- Pulsación prolongada: activar edición.
- En edición: moverla arrastrando, cambiar fecha, cambiar texto o eliminarla.

Pulsar una foto existente nunca debe abrir el selector para cargar otra: debe abrir esa foto a pantalla completa.

## 9. BOTONES Y NAVEGACIÓN

Los controles flotantes deben ser pequeños para no tapar el mapa o la panorámica, pero con zona táctil suficiente.

Incluir Atrás, Inicio, zoom `+` y `−`, Guardar esta zona y Editar solo cuando haya un elemento seleccionado.

### Atrás

1. Foto ampliada → misma panorámica y misma dirección.
2. Panorámica → punto exacto del mapa desde el que se entró.
3. Mapa local → vista provincial anterior.
4. Vista provincial → país o mundo.
5. Mapa mundial → pantalla inicial.

No reiniciar siempre el mapa mundial. Mantener una pila de navegación con centro, zoom y pantalla anteriores.

## 10. DATOS QUE DEBEN GUARDARSE

### Zona

- id, nombre, centro, zoom, país, provincia y municipio.

### Punto de recuerdo

- id, zona, coordenadas, fecha, nombre opcional e id de panorámica opcional.

### Panorámica

- id propio, id del punto, lista ordenada de fondos y dirección inicial.

### Foto colocada

- id propio, id de panorámica, imagen original, miniatura, fecha, texto opcional, fondo o dirección donde aparece, posición relativa y tamaño.

No guardar posiciones en píxeles absolutos. Usar porcentajes o coordenadas relativas para que no cambien entre móviles.

## 11. RENDIMIENTO

- El mapa carga por teselas, no como una imagen mundial gigante.
- Mostrar solo los puntos del área visible.
- Agrupar puntos en vistas lejanas.
- Generar miniatura, tamaño medio y original.
- Usar miniaturas en listados y tarjetas.
- Cargar el original únicamente al abrir la foto completa.
- Descargar solo los fondos cercanos a la dirección visible.
- Liberar de memoria imágenes no visibles.
- Con conexión lenta, mostrar carga sin perder datos o posiciones.

La primera versión funciona conectada a internet. No implementar mapas sin conexión todavía.

## 12. PRIMERA FASE QUE DEBES CONSTRUIR

Construye un prototipo móvil funcional con datos guardados localmente. Debe incluir:

1. Pantalla inicial con MAPA, LUGAR y FECHA.
2. Mapa mundial real y navegable.
3. Acercamiento mundo → España → provincia → zona local.
4. Botón `Guardar esta zona`.
5. Doble pulsación vacía para crear punto y pedir fecha.
6. Pulsación prolongada sobre punto para seleccionar varias imágenes y crear panorámica.
7. Pulsación única sobre punto para entrar.
8. Giro horizontal dentro de la panorámica.
9. Pulsación vacía para cargar una foto individual.
10. Texto opcional.
11. Fecha y texto debajo de la foto.
12. Foto colocada un 30 % más grande que en el prototipo inicial.
13. Pulsación sobre foto para abrirla completa.
14. Atrás conservando posición anterior.
15. Listados LUGAR y FECHA que lleven al punto correcto.
16. Al menos dos puntos y dos panorámicas sin sustitución.
17. Persistencia tras cerrar y abrir la app.

En esta fase usar IndexedDB y almacenamiento local de imágenes. No construir servidor, cuentas ni nube. La prioridad es demostrar el flujo correctamente.

## 13. PRUEBA OBLIGATORIA

Antes de entregar, comprobar:

1. Abrir la app y pulsar MAPA.
2. Ir del mundo a una provincia española.
3. Entrar con una pulsación en una zona local.
4. Dar dos pulsaciones en un punto vacío e introducir fecha.
5. Comprobar que aparece el punto fechado.
6. Mantenerlo pulsado y seleccionar varias imágenes.
7. Salir y pulsar una vez el punto.
8. Comprobar que entra en su panorámica.
9. Pulsar un espacio vacío y cargar una foto individual.
10. Añadir texto y comprobar fecha y texto debajo.
11. Pulsar la foto y comprobar pantalla completa.
12. Volver y comprobar que conserva la dirección panorámica.
13. Crear un segundo punto y panorámica.
14. Comprobar que la primera sigue existiendo.
15. Cerrar, abrir y comprobar que todo sigue guardado.

Si algún paso falla, la primera fase no está terminada.

## 14. NO HACER

- No convertir la app en una lista de álbumes.
- No mostrar panorámicas como mosaicos verticales.
- No sustituir el mapa por una imagen fija.
- No usar la doble pulsación únicamente para zoom.
- No abrir la galería antes de crear la fecha.
- No eliminar una panorámica al crear otra.
- No colocar todas las fotos en un escenario global.
- No guardar una sola panorámica compartida por todos los puntos.
- No añadir tienda, pagos, comentarios, usuarios múltiples o reconocimiento automático.
- No construir backend en la primera fase.

## 15. RESPUESTA INICIAL OBLIGATORIA DE CODEX

Antes de escribir código, responde con:

1. Cómo entiendes el recorrido completo.
2. Una tabla de pulsación única, doble y prolongada en mapa, punto y panorámica.
3. La estructura que impedirá sustituir panorámicas.
4. Las pantallas de la primera fase.
5. Limitaciones técnicas reales.

Después, si se ha indicado que empieces, construye únicamente la primera fase y ejecuta la prueba obligatoria.
