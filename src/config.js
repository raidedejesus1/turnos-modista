// Configuración central. Todo lo que ves acá es DATO DE EJEMPLO: reemplazalo por los datos reales del taller.
export const CFG = {
  ADMIN_PASSWORD: 'taller2026', // clave del panel (/admin). Cambiala antes de usarlo con clientas reales.
  STEP: 20, // minutos de cada franja
  BLOCKS: [[540, 780], [840, 1080]], // bloques de atención en minutos desde las 0:00: 9:00-13:00 y 14:00-18:00
  DAYS: [1, 2, 3, 4, 5], // días abiertos (0 = domingo ... 6 = sábado): lunes a viernes
  HORIZON: 30, // cuántos días hacia adelante se puede reservar
  SERVICES: [
    { id: 's', name: 'Arreglo simple', sub: 'Bastilla, botones', min: 20, txt: 'Para ese dobladillo que quedó largo o el botón que se soltó.' },
    { id: 'a', name: 'Ajuste de prenda completa', sub: 'Vestidos, sacos, polleras', min: 40, txt: 'Probamos la prenda puesta y la dejamos justo a tu medida.' },
    { id: 'm', name: 'Confección a medida', sub: 'Primera prueba', min: 60, txt: 'Tomamos medidas, charlamos la idea y vemos telas.' },
  ],
}

// Página informativa del negocio (datos de ejemplo). Mantené los horarios alineados con CFG.
export const INFO = {
  name: 'Aguja y Ojal',
  // Número del taller con código de país, sin + ni espacios (ej. '5491155550100').
  // Vacío: el botón de WhatsApp deja elegir a quién enviar el resumen.
  whatsapp: '',
  offers: [
    { title: 'Arreglos simples', text: 'Bastillas, botones, cierres y pequeños desperfectos, muchas veces en el día.' },
    { title: 'Ajuste de prenda completa', text: 'Vestidos, sacos, pantalones y polleras probados puestos y ajustados a tu cuerpo.' },
    { title: 'Confección a medida', text: 'Desde la primera prueba: medidas, telas y modelo pensados para tu evento.' },
  ],
  address: 'Av. Ejemplo 1234, Buenos Aires',
  directions: 'A dos cuadras de la estación, entre la panadería y la mercería. Timbre 2, planta baja.',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Ejemplo+1234%2C+Buenos+Aires',
  hours: [
    ['Lunes a viernes', '9:00 a 13:00 y 14:00 a 18:00'],
    ['Sábados y domingos', 'Cerrado'],
  ],
  hoursNote: 'Los turnos de prueba se dan cada 20 minutos y solo con reserva.',
  social: [
    { label: 'Instagram', handle: '@agujayojal', url: 'https://www.instagram.com/agujayojal' },
    { label: 'Facebook', handle: 'Aguja y Ojal', url: 'https://www.facebook.com/agujayojal' },
    { label: 'Pinterest', handle: 'agujayojal', url: 'https://www.pinterest.com/agujayojal' },
  ],
}
