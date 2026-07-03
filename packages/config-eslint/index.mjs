import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

/**
 * Shared ESLint flat config for the whole monorepo.
 * Standard rule sets only — readable over clever:
 *   1. eslint recommended (plain JS mistakes)
 *   2. typescript-eslint recommended (TS mistakes, no type-checking pass)
 *   3. react-hooks rules, scoped to the React surfaces (web, @zelvem/ui)
 */
export const zelvemConfig = tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/.next/',
      '**/.astro/',
      '**/.turbo/',
      '**/coverage/',
      '**/*.d.ts',
      // Design reference material (hi-fi prototypes + their runtime), not app code.
      'docs/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      // Underscore prefix opts out — for params kept to honor a documented signature.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Import order convention (CLAUDE.md — Code Standards): three groups
      // separated by blank lines. Autofixable with `eslint --fix`.
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side-effect imports (e.g. './globals.css') stay on top.
            ['^\\u0000'],
            // 1. Node built-ins and external packages.
            ['^node:', '^(?!@zelvem/)@?\\w'],
            // 2. Internal monorepo packages.
            ['^@zelvem/'],
            // 3. Relative imports.
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/@zelvem/ui/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)
