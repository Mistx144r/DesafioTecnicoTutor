/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        tutor: {
          // Verdes escuros
          'dark':        '#0D2B1A', // fundo escuro principal
          'dark-card':   '#1A3D2B', // fundo cards escuros

          // Verdes primários
          'primary':     '#1B5E2F', // verde escuro botões/texto
          'secondary':   '#2E7D32', // verde médio

          // Verdes vibrantes
          'accent':      '#6DC93A', // verde limão principal
          'accent-light':'#A8E063', // verde limão claro
          'accent-soft': '#C8F0A0', // verde limão suave

          // Backgrounds claros
          'bg-light':    '#F0FAE8', // fundo verde bem claro
          'bg-soft':     '#E8F5E0', // fundo verde suave

          // Neutros
          'white':       '#FFFFFF',
          'black':       '#000000',
          'gray':        '#9E9E9E', // textos secundários
        }
      }
    }
  },
  plugins: [],
}

