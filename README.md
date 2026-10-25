# Mapa de Recuerdos · primera fase según especificación

La especificación vigente es `ESPECIFICACION_APP_MAPA_DE_RECUERDOS.md`. Sustituye los recorridos de las versiones anteriores. La pantalla inicial tiene únicamente MAPA, LUGAR y FECHA.

## Uso

- MAPA abre un único mapa mundial real, con proyección de globo cuando está disponible. Una pulsación vacía acerca y centra suavemente. Sigue pulsando para llegar a una provincia, municipio y zona cercana.
- Dos pulsaciones rápidas en una zona vacía marcan un punto provisional y abren el cuadro de fecha; el nombre del lugar es opcional. «Crear punto y continuar» guarda el marcador y abre inmediatamente el paso «Cargar panorámica», donde se seleccionan sus fondos. No hace falta mantener después el marcador para continuar. «Cargar más tarde» conserva el punto sin panorámica.
- Como alternativa, mantén pulsado un punto ya guardado o su fecha y suelta para abrir el selector de fotos. Selecciona uno o varios fondos, ordénalos y guarda. Se crea un registro independiente y se vuelve al mapa.
- Una pulsación normal sobre el punto con panorámica entra directamente. Si no tiene, indica que está pendiente.
- Arrastra horizontalmente con el dedo o ratón para girar dentro de una secuencia circular. El último fondo enlaza con el primero. No es una galería vertical ni reconstrucción 3D.
- Toca un espacio vacío de la panorámica para elegir una fotografía individual. Responde Sí o No a «¿Quieres añadir un texto?», conserva o modifica la fecha y confirma con Enter o Guardar. Se coloca donde tocaste, con fecha y texto debajo.
- Una pulsación en una foto existente la abre completa, sin recortarla. La X regresa a la misma dirección. Mantenerla pulsada activa la edición. Cierra el panel para mover la foto arrastrando; Editar vuelve a mostrar fecha, texto y eliminación con confirmación.
- Opcionalmente, al colocar la foto se puede añadir una segunda imagen para una composición horizontal doble.
- Atrás conserva el historial de centro, zoom y pantalla. Foto completa → misma panorámica; panorámica → mapa anterior; mapa local → encuadre previo; mundo → inicio. Inicio vuelve al menú.
- Guardar esta zona conserva el centro, el zoom y el nombre de una vista del mapa. La zona aparece en LUGAR; no genera una captura de mapa.
- LUGAR y FECHA contienen cada combinación real de lugar y fecha, sin fusionar visitas. Ambos admiten búsqueda por lugar y fecha. Seleccionar un punto viaja hasta él y entra en su panorámica si existe. Las zonas sin fecha se muestran aparte en LUGAR.
- Para otro conjunto de fondos en un punto ya utilizado, mantén de nuevo su fecha. Se añade otra panorámica; un selector dentro de la vista permite recuperar las anteriores.

## Gestos

Se distinguen 420 ms para el doble toque y 650 ms para mantener pulsado. El selector nativo se abre al soltar el toque prolongado para conservar la autorización de selección del navegador. Los arrastres cancelan el toque simple. Los puntos y fotos se pueden activar también con Enter; mantener Espacio o Enter permite la acción prolongada. Las flechas del teclado giran la panorámica; Enter en su espacio vacío añade una foto.

## Datos y rendimiento

IndexedDB conserva zonas, puntos, panorámicas y fotos como registros con identificadores propios. Las imágenes tienen original, versión media (hasta 1920 px) y miniatura (hasta 320 px), guardadas como Blob. Se guardan las imágenes y sus relaciones en una misma transacción: un fallo no confirma ni sustituye los recuerdos anteriores.

Solo se crean botones para puntos visibles; las vistas lejanas agrupan los puntos. El visor carga los fondos visibles y vecinos, y libera sus URL de memoria al retirarlos. El original de una foto se utiliza únicamente para verla completa; los listados y fotos colocadas usan miniaturas. Los originales no se envían a terceros. El proveedor cartográfico sí recibe las solicitudes habituales de teselas.

Referencia del tamaño: las miniaturas del prototipo anterior eran de 48 px. La nueva foto individual usa una anchura relativa de 0,16 del visor: 62,4 px en una pantalla de referencia de 390 px, un 30 % más. Las composiciones dobles duplican la anchura. Posición, dirección y tamaño se conservan en unidades relativas, no en píxeles absolutos.

Si había datos de la versión anterior en `recuerdos-personales`, se convierten una vez al nuevo esquema, sin borrar su almacén original. Sus fotos de platos se conservan como fotografías colocadas con su texto; no se mantiene la navegación anterior de Platos.

## Límites reales

Los datos están en ese navegador y dispositivo. No hay servidor, cuentas, nube, sincronización ni mapa sin conexión. El mapa necesita internet y un navegador compatible con WebGL. Se aceptan JPG, PNG y WebP de hasta 25 MB por foto; HEIC debe convertirse. La continuidad es un recorrido circular de fondos normales, sin cosido perfecto. La información de país/provincia/municipio se conserva si está disponible en las etiquetas cartográficas del punto; las coordenadas, centro y zoom siempre se guardan automáticamente.

La compatibilidad del selector con álbumes del teléfono y con la selección múltiple debe comprobarse también en un Android/iPhone físico. Las pruebas de escritorio o de tamaño móvil no sustituyen esa comprobación.

## Desarrollo

```text
pnpm install
pnpm dev
pnpm test
pnpm build
```

Node.js 22.18+ (verificado con Node.js 24). Los comandos equivalentes con npm también están disponibles mediante `npm run`. `pnpm-lock.yaml` fija las dependencias. `fake-indexeddb` se usa solo para pruebas, nunca en la aplicación real.

- `src/App.tsx`: recorrido, historial, formularios y listados.
- `src/WorldMap.tsx`: mapa, agrupación, zoom, distinción del doble toque y puntos fechados.
- `src/mapTaps.ts`: distingue un toque de dos, también mediante eventos táctiles directos; cancela al arrastrar o pellizcar.
- `src/usePress.ts`: pulsación simple frente a prolongada; cancela tras arrastrar.
- `src/PanoramaView.tsx`: giro circular, colocación relativa y movimiento de fotos.
- `src/model.ts`: entidades, validación y adición sin sustitución.
- `src/storage.ts`: persistencia, migración y procesado de imágenes.
- `src/PhotoImage.tsx`: carga de variantes y liberación de memoria.
- `tests/mapTaps.test.mjs`: espera del toque simple, doble toque sin zoom previo, tolerancia del dedo y cancelación de gestos.
- `tests/phase1.test.mjs`: combinaciones lugar/fecha, independencia, dirección circular y persistencia atómica.

Consulta `PUBLICAR.md` para actualizar GitHub Pages. El ZIP no incluye fotos personales ni datos de las pruebas del navegador. `docs/` contiene la aplicación compilada.

## Mi ubicación · versión 0.3.2

En MAPA, pulsa «Mi ubicación», debajo de «Guardar esta zona». La primera consulta pide el permiso del navegador. El botón centra el mapa y muestra un punto azul «Estás aquí», distinto de los recuerdos, y la precisión aproximada del dispositivo. Si la señal es poco precisa se usa un encuadre más amplio.

La consulta se realiza solo al pulsar: no hay seguimiento continuo ni se guarda la ubicación como recuerdo. Vuelve a pulsar para actualizarla. Atrás recupera el encuadre anterior. Al salir del mapa se retira la indicación y se descartan las respuestas tardías, para que no te lleven a otra pantalla ni muestren una posición antigua.

Para usarlo desde el móvil, abre la dirección HTTPS de GitHub Pages; una dirección de red local con HTTP puede impedir la geolocalización. Si deniegas el permiso, no hay señal o se agota el tiempo, aparece una explicación y puedes intentarlo de nuevo. No se crea ni modifica ninguna panorámica al localizarte.

Referencia técnica: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
