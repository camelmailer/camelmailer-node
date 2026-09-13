// @ts-check
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // compat/ is a separate published package, not part of this source tree:
  // three one-line re-export files with their own manifest. tsconfig and
  // vitest already scope themselves by include lists; eslint needs telling.
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'compat/**'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
