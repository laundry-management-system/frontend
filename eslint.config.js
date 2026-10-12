import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const LAYERS = ['presentation', 'application', 'data', 'domain']

// Cùng feature với file đang import
const sameFeature = (type) => ({
  element: { type, captured: { feature: '{{ from.element.captured.feature }}' } },
})
const allowTo = (...targets) => ({ allow: { to: targets } })

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'page', pattern: 'src/pages/*', capture: ['page'] },
        // Layer khớp trước; file còn lại trong features/<f>/ (index.ts) là public API
        ...LAYERS.map((layer) => ({
          type: `feature-${layer}`,
          pattern: `src/features/*/${layer}`,
          capture: ['feature'],
        })),
        { type: 'feature-public', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'shared', pattern: 'src/shared' },
      ],
    },
    rules: {
      // app → pages → features → shared; trong feature: presentation → application → data → domain
      'boundaries/dependencies': [
        2,
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              ...allowTo({
                element: { types: { anyOf: ['app', 'page', 'feature-public', 'shared'] } },
              }),
            },
            {
              from: { element: { type: 'page' } },
              ...allowTo(
                {
                  element: { type: 'page', captured: { page: '{{ from.element.captured.page }}' } },
                },
                { element: { types: { anyOf: ['feature-public', 'shared'] } } },
              ),
            },
            {
              from: { element: { type: 'feature-public' } },
              ...allowTo(...LAYERS.map((l) => sameFeature(`feature-${l}`))),
            },
            {
              from: { element: { type: 'feature-presentation' } },
              ...allowTo(
                sameFeature('feature-presentation'),
                sameFeature('feature-application'),
                sameFeature('feature-domain'),
                { element: { types: { anyOf: ['feature-public', 'shared'] } } },
              ),
            },
            {
              from: { element: { type: 'feature-application' } },
              ...allowTo(
                sameFeature('feature-application'),
                sameFeature('feature-data'),
                sameFeature('feature-domain'),
                { element: { types: { anyOf: ['feature-public', 'shared'] } } },
              ),
            },
            {
              from: { element: { type: 'feature-data' } },
              ...allowTo(sameFeature('feature-data'), sameFeature('feature-domain'), {
                element: { type: 'shared' },
              }),
            },
            {
              from: { element: { type: 'feature-domain' } },
              ...allowTo(sameFeature('feature-domain')),
            },
            { from: { element: { type: 'shared' } }, ...allowTo({ element: { type: 'shared' } }) },
          ],
        },
      ],
    },
  },
  // routes.tsx chỉ khai báo router, không phải module component
  {
    files: ['src/app/router/routes.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  // domain là TS thuần
  {
    files: ['src/features/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['react', 'react-*', 'axios', '@tanstack/*', '@mantine/*', 'zustand'] },
      ],
    },
  },
])
