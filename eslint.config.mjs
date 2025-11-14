/**
 * pnpm add -D @eslint/js @typescript-eslint/parser eslint-config-prettier eslint-plugin-import eslint-plugin-prettier eslint-plugin-simple-import-sort globals typescript-eslint eslint prettier typescript
 */
import module from 'node:module';

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const builtinModules = module.builtinModules.filter(
  (mod) => mod !== 'constants',
);

export default defineConfig(
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  tseslint.configs.recommendedTypeChecked,
  prettierConfig, // Disable formatting rules in your ESLint configuration.
  eslintPluginPrettierRecommended, // The plugin loads and runs Prettier inside ESLint.
  {
    ignores: ['src/generated'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      parserOptions: {
        projectService: {
          // 为了支持 projectService，需要把文件加入在这里
          allowDefaultProject: [
            '*.js',
            '*.mjs',
            'jest.config.ts',
            'tsup.config.ts',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        console: 'readonly', // 允许 console
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-undef': 'warn',
      'no-unused-vars': 'off', // 使用 @typescript-eslint/no-unused-vars
      'prettier/prettier': 'warn', // prettier 不应该占用 error
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowEmpty: true, allowStaticOnly: true },
      ], // 允许建立空的类
      '@typescript-eslint/no-floating-promises': 'warn', // Promise 没有 then 或者 catch 警告
      '@typescript-eslint/no-unsafe-member-access': 'off', // 允许使用 unsafe
      '@typescript-eslint/no-unsafe-assignment': 'off', // 允许使用 unsafe
      '@typescript-eslint/no-unsafe-call': 'off', // 允许使用 unsafe
      '@typescript-eslint/no-unsafe-return': 'off', // 允许使用 unsafe
      '@typescript-eslint/no-unsafe-argument': 'off', // 允许使用 unsafe
      '@typescript-eslint/no-unused-vars': 'off', // 允许 unused
      '@typescript-eslint/consistent-type-definitions': 'off', // Interface 和 Type 不一样，不要自动转换
      '@typescript-eslint/no-misused-promises': 'off', // 在同步过程里使用异步也是允许的
      '@typescript-eslint/no-unnecessary-condition': 'warn', // 有时候检查是必须
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // 双竖杠挺好用的
      '@typescript-eslint/restrict-template-expressions': 'off', // 允许使用非 string
      '@typescript-eslint/no-unnecessary-condition': 'off', // 手工处理空与非空
      'dot-notation': 'off', // 属性并不是dot更好
      '@typescript-eslint/dot-notation': 'off', // 属性并不是dot更好
      '@typescript-eslint/require-await': 'off', // allow no await
      '@typescript-eslint/no-deprecated': 'warn', // allow deprecated
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      '@typescript-eslint/no-empty-function': 'off', // GoodBye this rule.
      '@typescript-eslint/no-misused-spread': 'warn', // Warn only.
      '@typescript-eslint/no-non-null-assertion': 'off', // Off
      '@typescript-eslint/ban-ts-comment': 'off', // Off
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports.
            ['^\\u0000'],
            // Node.js builtins
            ['^node:', `^(${builtinModules.join('|')})(/.*|$)`],
            // Framework
            [
              '^react\u0000?$',
              '^next(/.*)?\u0000?$',
              '^jotai\u0000?$',
              '^@mui/',
            ],
            // Packages
            ['^@?\\w'],
            // Internal modules
            [
              '^(@/)?(minimals|lib|store|components|hooks|utils|types|constants|enums|services|interceptors)(/.*|$)',
            ],
            // Vendors
            ['^(@/)?(vendors)(/.*|$)'],
            // Absolute imports and other imports such as Vue-style `@/foo`.
            // Anything not matched in another group.
            ['^'],
            // Relative imports.
            // Anything that starts with a dot.
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
  {
    extends: [tseslint.configs.disableTypeChecked],
    rules: js.configs.recommended.rules,
    files: ['**/*.js'],
  },
);
