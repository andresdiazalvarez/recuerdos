# Publicar recuerdos en GitHub Pages

Este paquete es independiente de cualquier otra aplicación. Incluye el código del prototipo y una versión web ya compilada en `docs/`.

1. Crea un repositorio público vacío llamado `recuerdos`.
2. Descomprime `recuerdos.zip` en tu ordenador.
3. En el repositorio, selecciona **Add file → Upload files** y arrastra los archivos y carpetas descomprimidos. No subas el ZIP ni una carpeta exterior: `docs`, `src`, `package.json` y este documento deben quedar en la raíz del repositorio.
4. Guarda la subida con **Commit changes** en la rama `main`.
5. En **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, rama **main**, carpeta **/docs** y pulsa **Save**.
6. Cuando termine la publicación, abre `https://TU_USUARIO.github.io/recuerdos/`. La dirección definitiva aparece en Settings → Pages.

Desde el móvil, abre esa dirección y utiliza **Añadir a pantalla de inicio**. La web funciona sin tener el ordenador encendido; necesita internet para cargar el mapa. No incorpora todavía PWA ni modo sin conexión. Las panorámicas y los platos se guardan en el navegador del dispositivo, sin subirse a GitHub. Usa la copia de seguridad para conservarlos o transferirlos a otro dispositivo.

## Actualizar el repositorio que ya has publicado

Descomprime el nuevo `recuerdos.zip`. En el mismo repositorio `recuerdos`, entra en **Código → Añadir archivo → Subir archivos**. Arrastra los archivos y carpetas del ZIP y pulsa **Confirmar cambios**. GitHub actualizará los archivos con el mismo nombre y añadirá los nuevos. Conserva **Configuración → Páginas → Implementar desde una rama → principal (main) → /docs**.

Espera a que termine la publicación y vuelve a cargar la web en el móvil. No necesitas crear otro repositorio. El navegador puede traducir el botón Guardar como «Ahorrar».

Para actualizar la versión publicada después de modificar el código, ejecuta `pnpm install` y `pnpm build`, copia el contenido de `dist/` a `docs/` y sube los cambios. Conserva `docs/.nojekyll`.

Documentación oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
