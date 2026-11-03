/** Paleta y tipografía del taller (propuesta propia: no hay marca previa). Los colores viven como variables CSS en src/index.css para soportar modo oscuro. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surf: 'var(--surf)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        mute: 'var(--mute)',
        terra: 'var(--terra)',
        onterra: 'var(--onterra)',
        teal: 'var(--teal)',
        line: 'var(--line)',
        err: 'var(--err)',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
