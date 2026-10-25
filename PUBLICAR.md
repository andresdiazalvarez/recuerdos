# Publicar o actualizar recuerdos

1. Descomprime `recuerdos.zip` en el ordenador.
2. Abre tu repositorio independiente `recuerdos` en GitHub.
3. En Código, elige Añadir archivo → Subir archivos.
4. Arrastra el contenido descomprimido: `docs`, `src`, `tests`, los archivos de configuración y los documentos. No subas el ZIP ni una carpeta exterior que los contenga.
5. Confirma los cambios en la rama principal (`main`). Los archivos con el mismo nombre se actualizarán.
6. En Configuración → Páginas conserva Implementar desde una rama, principal (`main`) y `/docs`, y guarda. La traducción del botón puede aparecer como «Ahorrar».
7. Espera a que termine la publicación y recarga la web del móvil. La dirección habitual es `https://andresdiazalvarez.github.io/recuerdos/`.

Es el mismo repositorio recuerdos, independiente de tus otras aplicaciones. La pantalla inicial de esta versión muestra solo MAPA, LUGAR y FECHA. No es necesario crear otra aplicación ni otra cuenta.

La publicación no incluye tus imágenes personales: se guardan localmente en el navegador del dispositivo. No borres sus datos para actualizar. La migración conserva los registros anteriores que existan en el mismo navegador y origen.

Después de modificar el código: ejecuta `pnpm build`, sustituye `docs/` con el contenido de `dist/` y conserva el archivo vacío `docs/.nojekyll`. Los listados y el visor se sirven estáticamente; no hay backend ni mapas sin conexión.
