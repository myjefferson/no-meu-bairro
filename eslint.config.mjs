import angular from 'angular-eslint';

export default [
  { ignores: ['dist/**', 'node_modules/**', '.angular/**', 'coverage/**', 'src/environments/environment.ts'] },
  ...angular.configs.tsRecommended.map(config => ({ ...config, files: ['**/*.ts'] })),
  ...angular.configs.templateRecommended.map(config => ({ ...config, files: ['**/*.html'] })),
];
