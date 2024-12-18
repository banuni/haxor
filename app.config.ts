
import { defineConfig } from '@tanstack/start/config'
import tailwindcss from '@tailwindcss/vite';


const tailwind = tailwindcss()
export default defineConfig({
    vite: {
        plugins: [tailwind], //this works!
    },
})
