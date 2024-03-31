import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('konamimojisplosion').initializeKonamimojisplosion();
}
