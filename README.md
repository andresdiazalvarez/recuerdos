# Mapa de Recuerdos — Prototipo 1

Primera fase, independiente de fases posteriores. **No es todavía la aplicación completa**.

## Iniciar

Requiere Node.js 20.19+ o 22+.

```bash
npm install
npm run dev
```

Abrir la dirección que muestre Vite. Para probar en el móvil, conectar el móvil a la misma Wi-Fi que el ordenador y abrir `http://IP_DEL_ORDENADOR:5173` (puede ser necesario permitir la conexión en el cortafuegos).

También se puede usar pnpm (utilizado para verificar este prototipo): `pnpm install`, `pnpm dev` y `pnpm build`. El archivo `pnpm-lock.yaml` fija las versiones instaladas y `pnpm-workspace.yaml` permite únicamente el script de instalación de esbuild, necesario para Vite.

Para generar el proyecto web: `npm run build`.

## Alcance de la fase 1

- Inicio con Mapa, Lugares y Fechas.
- Mapa navegable con proyección de globo cuando el navegador/proveedor lo soportan.
- Acercamiento desde mundo hasta Cádiz y Los Caños de Meca.
- Dos lugares de ejemplo con marcadores, búsqueda por lugar y listado por fechas.
- Ficha de lugar y controles compactos (atrás, inicio, zoom y centrar Cádiz).
- Diseño responsive para pantallas móviles.

## No incluido todavía

Creación de lugares mediante `+`, base de datos, subida de imágenes, panorámicas, almacenamiento persistente, instalación PWA, modo sin conexión. Estos requisitos quedan para próximas fases y **no deben considerarse superados**.

## Decisiones y limitaciones

- Mapa: MapLibre GL JS y el estilo público de OpenFreeMap `https://tiles.openfreemap.org/styles/liberty`. Es servicio de terceros con condiciones y disponibilidad propias; se requiere conexión a internet.
- No se usa ninguna clave cartográfica ni se incorporan fotografías personales.
- Lugares y fechas son datos de prueba embebidos. No se conserva ninguna modificación del usuario.
- El nivel de detalle depende de las teselas que facilite el proveedor. La proyección esférica usa `setProjection({type:'globe'})`; si falla, se mantiene el mapa plano navegable.
- Los marcadores se recrean al montar el mapa, a partir de la fuente de datos, sin depender del nivel de zoom.
- En esta entrega las fechas solo se presentan como prueba de navegación; no representan fotografías reales.

## Estructura

- `src/main.tsx`: entrada React.
- `src/App.tsx`: navegación, datos de prueba y mapa.
- `src/style.css`: diseño para móvil.
- `index.html`: entrada de la aplicación.
- `package.json`: dependencias y scripts.

## Comprobaciones manuales propuestas

1. En móvil, abrir Mapa, hacer zoom y volver al mundo.
2. Pulsar marcador Los Caños de Meca, comprobar ficha, cerrar y volver atrás.
3. Buscar Faro de Trafalgar por Lugares, pulsar resultado y comprobar desplazamiento.
4. Abrir Fechas; comprobar que 9/4/2026 aparece en ambos lugares.
5. Girar el móvil y repetir la interacción.

No se ha podido confirmar desde este entorno el funcionamiento sobre un dispositivo Android físico ni la disponibilidad permanente del servidor de mapas.

## Verificación del prototipo (13/10/2026)

Dependencias instaladas con pnpm y compilación de producción completada. Comprobado en navegador: globo mundial, acercamiento a Cádiz, apertura de ambos marcadores, búsqueda de Trafalgar, navegación desde fechas y fecha compartida del 9 de abril de 2026. Se ha corregido el encuadre para que la ficha no tape el punto seleccionado, la posición de los controles y la recarga de React durante el desarrollo. Vite avisa del tamaño del paquete cartográfico; la compilación termina correctamente.
