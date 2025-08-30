module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:tailwindcss/recommended',
    'prettier',
    'plugin:storybook/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react-refresh',
    'jsx-a11y',
    'simple-import-sort', // ADD THIS
    'tailwindcss', // ADD THIS
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'simple-import-sort/imports': 'error', // ADD THIS RULE
    'simple-import-sort/exports': 'error', // ADD THIS RULE
    'tailwindcss/no-custom-classname': 'off', // Keep this off as you have custom classes
  },
};
