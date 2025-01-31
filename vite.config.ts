import { defineConfig } from 'vite'
import { extname, relative, resolve } from 'path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import pages from 'vite-plugin-pages'
import tsconfigPaths from 'vite-tsconfig-paths'
import macrosPlugin from "vite-plugin-babel-macros"


const packageName = 'my-library'
const packageSrc = `packages/${packageName}/src`

const libInputs = Object.fromEntries(
  // https://rollupjs.org/configuration-options/#input
  glob.sync(packageSrc + '/**/*.{ts,tsx}').map(file => [
    // 1. The name of the entry point
    // lib/nested/foo.js becomes nested/foo
    relative(
      packageSrc,
      file.slice(0, file.length - extname(file).length)
    ),
    // 2. The absolute path to the entry file
    // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
    fileURLToPath(new URL(file, import.meta.url))
  ])
)

console.log(libInputs)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    pages(),
    tsconfigPaths(),
    macrosPlugin(),
    dts({ include: [packageSrc] })
  ],
  build: {
    outDir: `dist/${packageName}`,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, packageSrc),
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      input: libInputs,
      output: {
        assetFileNames: `assets/[name][extname]`,
        entryFileNames: `[name].js`,
      }
    }
  }
})