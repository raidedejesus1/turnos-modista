import { INFO } from '../config.js'
import { fd, hm, svc } from './availability.js'

// Texto ya redactado con el resumen de la reserva.
export function waText(b, moved = false) {
  const s = svc(b.sv)
  return [
    `Hola, soy ${b.name}.`,
    moved ? `Moví mi turno de prueba en ${INFO.name}:` : `Reservé un turno de prueba en ${INFO.name}:`,
    `• Arreglo: ${s.name} (${s.min} min)`,
    `• Día: ${fd(b.date)}`,
    `• Hora: ${hm(b.start)} a ${hm(b.start + s.min)}`,
    `• Código de reserva: ${b.code}`,
    '',
    'Si necesito moverlo o cancelarlo, uso “Mi reserva” con este código y mi email. ¡Gracias!',
  ].join('\n')
}

export const waUrl = (text) => `https://wa.me/${INFO.whatsapp}?text=${encodeURIComponent(text)}`
