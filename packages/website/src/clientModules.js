import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  require('konamimojisplosion').initializeKonamimojisplosion();
}
