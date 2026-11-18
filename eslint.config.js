import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const LAYERS = ['presentation', 'application', 'data', 'domain']
const SIDES = ['admin', 'client']

// Cùng feature (và cùng khu) với file đang import
const sameFeature = (type) => ({
  element: { type, captured: { feature: '{{ from.element.captured.feature }}' } },
})
const allowTo = (...targets) => ({ allow: { to: targets } })
const types = (...anyOf) => ({ element: { types: { anyOf } } })

// admin và client không import lẫn nhau; chỉ dùng chung shared/common
const sidePolicies = (side) => {
  const f = (layer) => `${side}-feature-${layer}`
  const own = [`${side}-feature-public`, `${side}-shared`, 'common']
  return [
    {
      from: { element: { type: `${side}-app` } },
      ...allowTo(types(`${side}-app`, `${side}-page`, ...own)),
    },
    {
      from: { element: { type: `${side}-page` } },
      ...allowTo(
        {
          element: { type: `${side}-page`, captured: { page: '{{ from.element.captured.page }}' } },
        },
        types(...own),
      ),
    },
    {
      from: { element: { type: `${side}-feature-public` } },
      ...allowTo(...LAYERS.map((l) => sameFeature(f(l)))),
    },
    {
      from: { element: { type: f('presentation') } },
      ...allowTo(
        sameFeature(f('presentation')),
        sameFeature(f('application')),
        sameFeature(f('domain')),
        types(...own),
      ),
    },
    {
      from: { element: { type: f('application') } },
      ...allowTo(
        sameFeature(f('application')),
        sameFeature(f('data')),
        sameFeature(f('domain')),
        types(...own),
      ),
    },
    {
      from: { element: { type: f('data') } },
      ...allowTo(
        sameFeature(f('data')),
        sameFeature(f('domain')),
        types(`${side}-shared`, 'common'),
      ),
    },
    { from: { element: { type: f('domain') } }, ...allowTo(sameFeature(f('domain'))) },
    {
      from: { element: { type: `${side}-shared` } },
      ...allowTo(types(`${side}-shared`, 'common')),
    },
  ]
}

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
      'boundaries/elements': SIDES.flatMap((side) => [
        { type: `${side}-app`, pattern: `src/app/${side}` },
        { type: `${side}-page`, pattern: `src/pages/${side}/*`, capture: ['page'] },
        // Layer khớp trước; file còn lại trong features/<khu>/<f>/ (index.ts) là public API
        ...LAYERS.map((layer) => ({
          type: `${side}-feature-${layer}`,
          pattern: `src/features/${side}/*/${layer}`,
          capture: ['feature'],
        })),
        { type: `${side}-feature-public`, pattern: `src/features/${side}/*`, capture: ['feature'] },
        { type: `${side}-shared`, pattern: `src/shared/${side}` },
      ]).concat([
        { type: 'common', pattern: 'src/shared/common' },
        // App gốc (App, providers, theme, router gốc): nơi duy nhất ghép hai khu
        { type: 'app', pattern: 'src/app' },
      ]),
    },
    rules: {
      // app → pages → features → shared; trong feature: presentation → application → data → domain
      // app → pages → features → shared; trong feature: presentation → application → data → domain
      'boundaries/dependencies': [
        2,
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              ...allowTo(types('app', 'admin-app', 'client-app', 'common')),
            },
            ...SIDES.flatMap(sidePolicies),
            { from: { element: { type: 'common' } }, ...allowTo(types('common')) },
          ],
        },
      ],
    },
  },
  // routes.tsx / modules.tsx chỉ khai báo router và menu, không phải module component
  {
    files: [
      'src/app/routes.tsx',
      'src/app/*/router/routes.tsx',
      'src/app/admin/router/modules.tsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  // domain là TS thuần
  {
    files: ['src/features/*/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['react', 'react-*', 'axios', '@tanstack/*', '@mantine/*', 'zustand'] },
      ],
    },
  },
])
