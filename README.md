# Aguja y Ojal · Sistema de turnos de prueba

Agenda de turnos para un taller de costura pequeño. La idea: que quien necesita ajustar un vestido para un evento pueda ver la **disponibilidad real** y reservar directo, sin esperar a que contesten el teléfono, y que la modista deje de coordinar todo por llamadas.

**Stack:** React 18 + Vite + Tailwind CSS 3. Los datos se guardan en `localStorage` del navegador (no hay backend).

## Vista previa

- **Vercel:** https://turnos-modista.vercel.app/
- Panel del taller: https://turnos-modista.vercel.app/admin (clave de ejemplo: `taller2026`)

## Qué incluye

| Ruta | Qué hay |
|---|---|
| `/` | **Reservar**: tipo de arreglo → día (con turnos libres) → hora → datos. Al confirmar: código de reserva (`TUR-4F7K`) y botón **Enviar resumen por WhatsApp** con el texto ya redactado. |
| `/mi-reserva` | Con código + email se puede **mover** o **cancelar** el turno, sin recargar la pantalla. |
| `/el-taller` | Página informativa, en este orden: qué ofrecemos, cómo llegar (enlace a Google Maps), horarios de atención y redes sociales. |
| `/admin` | **Panel del taller**: pide la clave antes de mostrar cualquier reserva. Agenda, indicadores, alta de reservas "por teléfono", mover y cancelar, y **bloqueo de horas** (franjas que el taller reserva sin clienta). |

Otras reglas y detalles:

- Cada franja admite un solo turno; nunca se solapan dos turnos (incluso si dos servicios se pisan parcialmente).
- Las horas bloqueadas desde el panel **no se ofrecen** en la disponibilidad.
- El formulario no se envía si falta un campo obligatorio o es inválido.
- Si el navegador bloquea `localStorage` (modo privado, cookies desactivadas) o no lo admite, aparece un aviso. La app sigue funcionando en memoria, pero las reservas se pierden al recargar.
- Mobile-first: botones de al menos 44 px, sin scroll horizontal, respeta las zonas seguras del celular y tiene modo oscuro automático.

## Cómo correrlo

Requiere Node 18 o superior.

```bash
git clone https://github.com/raidedejesus1/turnos-modista.git
cd turnos-modista
npm install
npm run dev       # desarrollo: http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/ localmente
npm test          # tests de la lógica de disponibilidad (sin dependencias extra)
```

Las rutas (`/admin`, `/mi-reserva`, …) son rutas reales de una SPA: el servidor tiene que devolver `index.html` para cualquier ruta. `npm run dev`, `npm run preview` y Vercel (con el `vercel.json` incluido) ya lo hacen.

## Estructura

```
src/
  config.js            ← CLAVE, servicios, horarios y datos del taller (todo editable acá)
  lib/availability.js  ← lógica de disponibilidad, reservas y bloqueos (funciones puras)
  lib/availability.test.js
  lib/whatsapp.js      ← texto y enlace del resumen por WhatsApp
  lib/store.js         ← localStorage, aviso de almacenamiento bloqueado y datos de ejemplo
  components/          ← Book, Mine, Info, Admin y piezas compartidas (Tailwind)
  App.jsx              ← rutas, estado y aviso de localStorage
```

## Cómo cambiar la clave del panel

La clave está en **un solo lugar**: `src/config.js`.

```js
export const CFG = {
  ADMIN_PASSWORD: 'taller2026', // ← cambiala acá
  ...
}
```

1. Abrí `src/config.js`.
2. Reemplazá `taller2026` por la clave nueva.
3. Guardá y volvé a desplegar (con Vercel conectado a GitHub, alcanza con hacer `git push` a `main`).

La clave de ejemplo es `taller2026`. **Cambiala antes de usarlo con clientas reales.**

> **Importante:** como no hay servidor, la clave viaja dentro del código de la página y funciona solo como barrera básica de uso: impide ver las reservas a quien entra por la pantalla, pero no es seguridad real. Para producción hace falta un backend con autenticación y base de datos (ver "Próximos pasos"). No guardes datos sensibles reales en esta versión.

## Qué es dato de ejemplo

Todo lo que se ve al abrir la app por primera vez es de ejemplo y está pensado para reemplazarse:

- **Reservas**: 9 turnos de prueba (por ejemplo, "Marta Gutiérrez · Dobladillo de pantalón de vestir") con teléfonos y emails ficticios (`@ejemplo.com`). Se generan relativos a la fecha de hoy, en los próximos días hábiles, sin solaparse. En el panel aparecen con la etiqueta "ejemplo".
- **Bloqueo de ejemplo**: tres franjas (17:00 a 18:00) de un día cercano, "Entrega de vestidos (ejemplo)".
- **Página "El taller"** (`INFO` en `src/config.js`): el nombre "Aguja y Ojal", la dirección (`Av. Ejemplo 1234, Buenos Aires`), las indicaciones para llegar, el enlace a Google Maps (una búsqueda por esa dirección de ejemplo), los horarios y los perfiles de Instagram, Facebook y Pinterest (`@agujayojal`) son inventados. Reemplazalos por los reales.
- **WhatsApp**: `INFO.whatsapp` está vacío a propósito. Con el campo vacío, el botón abre WhatsApp para que la clienta elija a quién enviar el resumen. Si cargás el número del taller (código de país, sin `+` ni espacios, por ejemplo `5491155550100`), el resumen se envía directo al taller.
- **Servicios y horarios** (`CFG`): propuestas para mostrar el flujo.
- **Clave del panel**: `taller2026`.

Para volver a los datos de ejemplo: en el panel, botón **"Restablecer datos de ejemplo"**. Para empezar de cero, borrá la clave `taller-modista:v1` del localStorage del navegador (DevTools → Application → Local Storage) y recargá.

## Cómo cambiar servicios, horarios y datos del taller

Todo está en `src/config.js`:

| Campo | Qué hace | Ejemplo actual |
|---|---|---|
| `CFG.ADMIN_PASSWORD` | Clave del panel | `taller2026` |
| `CFG.STEP` | Tamaño de cada franja, en minutos | `20` |
| `CFG.BLOCKS` | Bloques de atención, en minutos desde las 0:00 | `[[540,780],[840,1080]]` = 9:00–13:00 y 14:00–18:00 |
| `CFG.DAYS` | Días abiertos (0 = domingo … 6 = sábado) | `[1,2,3,4,5]` |
| `CFG.HORIZON` | Cuántos días hacia adelante se puede reservar | `30` |
| `CFG.SERVICES` | Tipos de arreglo: `id`, `name`, `sub`, `min`, `txt` | 20, 40 y 60 minutos |
| `INFO` | Página "El taller", WhatsApp, redes, dirección y horarios mostrados | datos de ejemplo |

Los horarios de `INFO.hours` son texto: mantenelos alineados con `CFG.BLOCKS` y `CFG.DAYS`. Si cambiás horarios o servicios con reservas ya cargadas, usá "Restablecer datos de ejemplo" para evitar turnos fuera del nuevo horario.

## Cómo funciona la regla de no solapamiento

- Cada reserva ocupa desde su hora de inicio hasta inicio + duración del servicio. Un arreglo de 40 min ocupa 2 franjas seguidas y uno de 60 min ocupa 3.
- Los bloqueos del taller ocupan franjas de 20 min igual que una reserva.
- Una hora se ofrece solo si **ningún** turno ni bloqueo del mismo día se pisa con ese intervalo, ni siquiera parcialmente.
- Un turno no puede cruzar el corte de mediodía (13:00–14:00) ni pasar de las 18:00.
- Para hoy no se ofrecen horas que ya pasaron.
- Toda la lógica pasa por `free()` en `src/lib/availability.js` y se valida de nuevo al confirmar, por si la franja se ocupó mientras se completaba el formulario.

## Publicar en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) e importá este repositorio de GitHub.
2. Vercel detecta Vite solo: build `npm run build`, salida `dist`. No hace falta configurar nada más (el `vercel.json` ya redirige todas las rutas a `index.html`).
3. Cada `git push` a `main` vuelve a desplegar. La vista previa de este proyecto está en https://turnos-modista.vercel.app/.

## Identidad visual

El taller no tiene marca, así que se propuso una:

- **Paleta**: terracota `#A94F2C` (acción principal), crema `#FAF3E8` (fondo), azul petróleo `#1F5F6B` (acento), tinta `#3B2A22` (texto). Definida como variables CSS en `src/index.css` y mapeada en `tailwind.config.js`; incluye modo oscuro automático.
- **Tipografía**: Lora (títulos), con carácter de libro y de oficio; Inter (texto), legible en pantallas chicas.
- **Sin fotos de stock**: el logo es un botón dibujado en SVG y los divisores imitan una puntada punteada.

## Limitaciones conocidas

- **Los datos viven en el navegador de cada dispositivo.** Las reservas hechas desde el celular de una clienta no aparecen en el panel de la modista. Es una limitación de usar solo `localStorage`.
- La clave del panel no es seguridad real (ver arriba).
- No envía emails ni recordatorios; el resumen por WhatsApp lo dispara la clienta.

## Próximos pasos

1. Backend con base de datos (por ejemplo Supabase) para compartir las reservas entre dispositivos.
2. Autenticación real para el panel.
3. Recordatorios por email o WhatsApp.
