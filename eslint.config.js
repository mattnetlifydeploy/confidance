import js from '@eslint/js'
import nextPlugin from 'eslint-config-next'

export default [
  {
    ignores: ['.next/**', '.netlify/**', 'node_modules/**', 'out/**'],
  },
  js.configs.recommended,
  ...nextPlugin,
]
