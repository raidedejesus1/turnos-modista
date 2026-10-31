# Aguja y Ojal · Sistema de turnos de prueba

Agenda de turnos para un taller de costura pequeño. La idea: que quien necesita ajustar un vestido para un evento pueda ver la **disponibilidad real** y reservar directo, sin esperar a que contesten el teléfono, y que la modista deje de coordinar todo por llamadas.

Es una sola página (`index.html`), sin dependencias ni paso de compilación. Los datos se guardan en `localStorage` del navegador.

> **Nota sobre el stack.** El pedido original menciona React, Tailwind y Lovable. Esta primera versión está escrita en HTML, CSS y JavaScript puros para que cargue muy rápido en celular con 4G. Si más adelante se migra a React + Tailwind (por ejemplo en Lovable), la lógica de disponibilidad (`free`, `add`, `mv`) se puede reutilizar tal cual.

## Qué incluye

- **Reservar**: elegir tipo de arreglo, día (con la cantidad de turnos libres), hora y completar los datos. Se entrega un código de reserva tipo `TUR-4F7K`.
- **Mi reserva**: con el código y el email se puede **mover** o **cancelar** el turno, sin recargar la pantalla.
- **Panel del taller**: pide una clave antes de mostrar cualquier reserva. Agenda por día, indicadores (hoy, próximos 7 días, futuros), alta manual de reservas “por teléfono”, mover y cancelar.
- **Reglas de turnos**: una franja admite un solo turno; nunca se solapan dos turnos.
- **Persistencia**: los datos siguen ahí al recargar o al cerrar y volver a abrir la pestaña.

## Cómo correrlo

No necesita instalación.

**Opción 1: abrir el archivo.** Descargá o cloná el repositorio y abrí `index.html` en el navegador (doble clic).

```bash
git clone https://github.com/raidedejesus1/turnos-modista.git
cd turnos-modista
```

**Opción 2: servidor local** (recomendado para probar como en producción):

```bash
python3 -m http.server 8000
# luego abrí http://localhost:8000
```

**Publicarlo**: sirve en cualquier hosting estático (GitHub Pages, Netlify, Vercel, etc.) subiendo `index.html`. Las fuentes (Lora e Inter) se cargan desde Google Fonts; si no hay conexión se usan Georgia y la fuente del sistema.

**Vista previa**: https://claude.ai/artifact/DkQXFEk5JRikDNLEmfEACR (privada hasta que se comparta desde el botón Share).

## Cómo cambiar la clave del panel

La clave está definida en **un solo lugar**, al principio del bloque `<script>` de `index.html`:

```js
const CFG={ADMIN_PASSWORD:'taller2026', ...};
```

1. Abrí `index.html` en un editor de texto.
2. Buscá `ADMIN_PASSWORD`.
3. Reemplazá `taller2026` por la clave nueva, entre comillas simples.
4. Guardá y volvé a publicar el archivo.

La clave de ejemplo es `taller2026`. **Cambiala antes de usarlo con clientas reales.**

> **Importante:** como no hay servidor, la clave vive en el código de la página y funciona solo como barrera básica de uso: impide ver las reservas a quien entra por la pantalla, pero no es seguridad real. Para producción hace falta un backend con autenticación y base de datos (ver “Próximos pasos”). No guardes datos sensibles reales en esta versión.

## Qué es dato de ejemplo

Todo lo que se ve la primera vez que se abre la página es de ejemplo:

- **Reservas**: 9 turnos de prueba (por ejemplo, “Marta Gutiérrez · Dobladillo de pantalón de vestir”) con teléfonos y emails ficticios (`@ejemplo.com`). Se generan **relativas a la fecha de hoy**, en los próximos días hábiles, y sin solaparse. En el panel aparecen con la etiqueta “ejemplo”.
- **Servicios, horarios y nombre del taller** (“Aguja y Ojal”): son propuestas para mostrar el flujo; reemplazalos por los reales.
- **Clave del panel** `taller2026`.

Para volver a los datos de ejemplo: en el panel, botón **“Restablecer datos de ejemplo”**. Para empezar de cero a mano, borrá la clave `taller-modista:v1` del localStorage del navegador (DevTools → Application → Local Storage) y recargá: se vuelven a generar los ejemplos.

## Cómo cambiar servicios y horarios

Todo está en el objeto `CFG`, al principio del script:

| Campo | Qué hace | Ejemplo actual |
|---|---|---|
| `ADMIN_PASSWORD` | Clave del panel | `taller2026` |
| `STEP` | Tamaño de cada franja, en minutos | `20` |
| `BLOCKS` | Bloques de atención en minutos desde las 0:00 | `[[540,780],[840,1080]]` = 9:00–13:00 y 14:00–18:00 |
| `DAYS` | Días abiertos (0 = domingo … 6 = sábado) | `[1,2,3,4,5]` = lunes a viernes |
| `HORIZON` | Cuántos días hacia adelante se puede reservar | `30` |
| `SERVICES` | Tipos de arreglo: `id`, `name`, `sub`, `min`, `txt` | Arreglo simple 20 min, Ajuste de prenda completa 40 min, Confección a medida (primera prueba) 60 min |

Si cambiás los servicios o la duración, conviene usar un múltiplo de `STEP`. Si cambiás horarios o datos ya reservados, usá “Restablecer datos de ejemplo” para evitar turnos fuera del nuevo horario.

## Cómo funciona la regla de no solapamiento

- Cada reserva ocupa desde su hora de inicio hasta inicio + duración del servicio.
- Un arreglo de 40 min ocupa 2 franjas seguidas y uno de 60 min ocupa 3.
- Una hora se ofrece solo si **ninguna** reserva del mismo día se pisa con ese intervalo, ni siquiera parcialmente.
- Un turno no puede cruzar el corte de mediodía (13:00–14:00) ni pasar de las 18:00.
- Para hoy no se ofrecen horas que ya pasaron.
- Toda la lógica pasa por una única función, `free()`. Se vuelve a validar al confirmar, por si la franja se ocupó mientras se completaba el formulario.

## Identidad visual

El taller no tiene marca, así que se propuso una:

- **Paleta**: terracota `#A94F2C` (acción principal), crema `#FAF3E8` (fondo), azul petróleo `#1F5F6B` (acento), tinta `#3B2A22` (texto). Cálida y de taller, nada de aspecto corporativo. Incluye modo oscuro automático.
- **Tipografía**: Lora (títulos), con carácter de libro y de oficio; Inter (texto), legible en pantallas chicas.
- **Sin fotos de stock**: el logo es un botón dibujado en SVG y los divisores imitan una puntada punteada.

## Celular y rendimiento

- Diseñado primero para celular: botones de al menos 44 px, sin scroll horizontal, respeta las zonas seguras de la pantalla.
- Un solo archivo de unos 20 KB, sin librerías ni imágenes, con las fuentes cargadas con `display=swap`.

## Limitaciones conocidas

- **Los datos viven en el navegador de cada dispositivo.** Las reservas hechas desde el celular de una clienta no aparecen en el panel de la modista. Es una limitación de usar solo `localStorage`.
- La clave del panel no es seguridad real (ver arriba).
- No envía emails ni recordatorios.

## Próximos pasos

1. Backend con base de datos (por ejemplo Supabase) para compartir las reservas entre dispositivos.
2. Autenticación real para el panel.
3. Recordatorios por email o WhatsApp.
4. Migrar a React + Tailwind reutilizando la lógica de disponibilidad.
