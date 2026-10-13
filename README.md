# Mapa de Recuerdos — versión 0.2

Aplicación personal de mapa, panorámicas y platos, preparada para el repositorio independiente `recuerdos` y GitHub Pages.

## Iniciar y comprobar

Node.js 20.19+ para ejecutar y compilar (las pruebas requieren Node.js 22.18+).

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

También se puede ejecutar con npm: `npm install`, `npm run dev` y `npm run build`. La instalación verificada utiliza pnpm, su archivo de versiones `pnpm-lock.yaml` y la autorización exclusiva del script de esbuild en `pnpm-workspace.yaml`.

## Cómo guardar un recuerdo

1. Abre Mapa y acércate al lugar. Pulsa «Añadir panorámica» y toca el punto exacto del mapa. En los lugares existentes también puedes pulsar «Añadir panorámica aquí».
2. Introduce primero la fecha del recuerdo y debajo el nombre del lugar o restaurante.
3. Selecciona una imagen panorámica JPG, PNG o WebP de hasta 25 MB y guárdala. Para añadir desde Panorámicas, introduce también latitud y longitud, o vuelve al mapa para seleccionar el punto.
4. Recorre la panorámica deslizando la imagen y utiliza + o − para ampliar o reducir. Es un visor de fotos panorámicas horizontales, no un visor esférico de fotos 360°.
5. Pulsa «Añadir plato», toca el punto en la panorámica, introduce nombre del plato, etiquetas opcionales y su foto, y pulsa «Guardar plato». Puedes colocar varios platos en la misma panorámica.

## Buscar y volver

- Panorámicas y Fechas muestran una lista ordenada de más reciente a más antigua con fecha y lugar; cada visita es un recuerdo independiente, incluso si coinciden lugar y día.
- Los filtros se pueden combinar: texto, lugar, fecha exacta o intervalo de fechas.
- Platos aparece debajo de Panorámicas en el inicio. Busca por nombre (p. ej. «atún») o etiqueta («pescado», «arroz», «postre»), y acota por fecha o lugar. Se puede buscar sin tildes y sin distinguir mayúsculas.
- Abrir un resultado de Platos abre su panorámica, desplaza la imagen al punto guardado, destaca la foto y muestra la ficha del plato.
- «Ver lugar en el mapa» lleva al marcador de ese recuerdo. La ficha del mapa muestra enlaces a las panorámicas guardadas con el mismo nombre de lugar.
- Los dos lugares de demostración originales se conservan. Sus fechas de ejemplo no cuentan como visitas personales con imágenes.

## Dónde se guardan las fotos

Las fotos, fechas, coordenadas y puntos se guardan en IndexedDB en el navegador de ese dispositivo. No se envían a GitHub ni se publican con la aplicación, y no se sincronizan automáticamente con otros dispositivos. Borrar los datos del navegador, utilizar otro navegador o cambiar de dominio puede impedir acceder a estos recuerdos. El almacenamiento puede fallar por falta de espacio: la aplicación no confirma el guardado si la transacción falla.

Descarga una copia desde Panorámicas, Fechas o Platos. El archivo JSON contiene imágenes, ubicaciones y platos. Restáuralo en otro dispositivo desde el mismo apartado. La restauración añade los recuerdos que falten y conserva los existentes para evitar sobrescribir cambios. Guarda tus copias en un lugar seguro.

## Publicación

Consulta `PUBLICAR.md`. La carpeta `docs/` contiene la web compilada para GitHub Pages. El ZIP no incluye fotos personales, datos de pruebas guardados en el navegador, `node_modules` ni credenciales. Necesitas conexión para cargar las teselas del mapa. No se ha añadido instalación PWA ni mapa sin conexión.

## Estructura

- `src/main.tsx`: entrada React.
- `src/App.tsx`: navegación y mapa MapLibre con estilo público OpenFreeMap.
- `src/Memories.tsx`: formularios, filtros, panorámica, puntos de platos y copia de seguridad.
- `src/memoryStore.ts`: almacenamiento, lectura de imágenes y validación de copias.
- `src/style.css`: diseño adaptable a móvil.
- `tests/memories.test.mjs`: filtros combinados, intervalos, búsqueda sin tildes y validación de copias.

## Verificación

Compilación y pruebas automatizadas. Pruebas en navegador con imágenes artificiales: crear una panorámica desde Los Caños de Meca, marcar un punto y añadir un plato, recargar y recuperar ambos, buscar por nombre sin tilde y por etiqueta, combinar lugar y fechas, abrir el punto desde un resultado, ampliar la imagen, descargar una copia y restaurar un segundo recuerdo sin perder el primero. Se ha comprobado también la pantalla de 390 × 844 píxeles. No se ha comprobado con un Android o iPhone físico. Vite avisa del tamaño de la librería cartográfica, pero la compilación termina correctamente.
