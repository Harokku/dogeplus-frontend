import {defineConfig} from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig(({ mode }) => ({
    plugins: [solid()],
    base: mode === 'static' ? '/app/' : '/',
}))
