import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['out/**', 'node_modules/**', 'dist/**', 'release/**', 'build/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node-side JS (icon generator, config files) — not browser JS
    files: ['scripts/**/*.js', '*.config.{js,mjs,cjs}', '.husky/**'],
    languageOptions: {
      globals: { ...globals.node }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts', 'vitest.config.ts', 'playwright.config.ts'],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off'
    }
  }
)
