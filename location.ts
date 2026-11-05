export type LocationFix = { coords: [number, number]; accuracy: number };
type GeolocationPort = Pick<Geolocation, 'getCurrentPosition'>;

export function locationError(code: number) {
  if (code === 1) return 'No has permitido la ubicación. Permítela en el navegador y comprueba que la ubicación del móvil esté activada.';
  if (code === 3) return 'El móvil ha tardado demasiado en localizarte. Comprueba la señal de ubicación y vuelve a pulsar Mi ubicación.';
  return 'No se puede obtener tu ubicación. Comprueba que la ubicación del dispositivo esté activada e inténtalo de nuevo.';
}
export function requestLocation(geolocation: GeolocationPort | undefined, secureContext: boolean): Promise<LocationFix> {
  if (!secureContext) return Promise.reject(new Error('Para localizarte, abre la aplicación desde su dirección HTTPS de GitHub Pages.'));
  if (!geolocation) return Promise.reject(new Error('Este navegador no permite consultar la ubicación. Prueba con Chrome o Safari actualizados.'));
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(position => {
      const { latitude, longitude, accuracy } = position.coords;
      if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0) {
        reject(new Error('El dispositivo ha devuelto una ubicación no válida. Vuelve a intentarlo.')); return;
      }
      resolve({ coords: [longitude, latitude], accuracy });
    }, error => reject(new Error(locationError(error.code))), { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  });
}
export function locationZoom(accuracy: number) {
  if (accuracy <= 150) return 15;
  if (accuracy <= 2000) return 13;
  if (accuracy <= 20000) return 10;
  return 8;
}
export function accuracyText(accuracy: number) {
  return accuracy < 1000 ? `±${Math.max(1, Math.ceil(accuracy))} m` : `±${(accuracy / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })} km`;
}
