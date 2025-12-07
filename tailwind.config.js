/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'ta-bg': '#050B11',
                'ta-card': '#0E1621',
                'ta-text': '#EAF6FF',
                'ta-blue': '#00B4FF',
                'ta-green': '#00FF88',
                'ta-gray': '#9CA3AF'
            },
            boxShadow: {
                'neon-blue': '0 0 10px rgba(0, 180, 255, 0.5)',
                'neon-green': '0 0 10px rgba(0, 255, 136, 0.5)',
            }
        },
    },
    plugins: [],
}
