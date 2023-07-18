const core = require('@actions/core');
const github = require('@actions/github');

const NETLIFY_SITE_ID = '128d21c7-b2fe-45ad-b141-9878fcf5de3a'; // https://app.netlify.com/sites/typescript-eslint/overview
const NETLIFY_TOKEN = core.getInput('netlify_token', { required: true });
const MAX_TIMEOUT = core.getInput('max_timeout') || 300000; // 5 minutes
const RETRY_INTERVAL = core.getInput('retry_interval') || 5000; // 5 seconds

const COMMIT_SHA =
  github.context.eventName === 'pull_request'
    ? github.context.payload.pull_request.head.sha
    : github.context.sha;
const BRANCH =
  github.context.eventName === 'pull_request'
    ? github.context.payload.pull_request.head.ref
    : github.context.ref_name;

if (!COMMIT_SHA || !BRANCH) {
  core.setFailed(
    `Could not determine the full commit SHA and branch from the GitHub context: ${JSON.stringify(
      github.context,
      null,
      2,
    )}`,
  );
}

async function run() {
  const { NetlifyAPI } = await import('netlify'); // ESM only, cannot be used with `require`
  const client = new NetlifyAPI(NETLIFY_TOKEN);

  async function getReadyDeploymentForCommitRef() {
    console.log(
      `Checking if deployment for commit "${COMMIT_SHA}" on branch "${BRANCH}" has state "ready"...`,
    );
    const deployments = await client.listSiteDeploys({
      site_id: NETLIFY_SITE_ID,
      branch: BRANCH,
    });
    console.log(
      `Found ${deployments.length} deployments for this branch "${BRANCH}"`,
    );
    const deploymentForCommit = deployments.find(
      deployment => deployment.commit_ref === COMMIT_SHA,
    );
    if (!deploymentForCommit) {
      console.log(
        `No deployment found yet for commit "${COMMIT_SHA}" on branch "${BRANCH}"`,
      );
      return null;
    }
    if (deploymentForCommit.state !== 'ready') {
      console.log(
        `Resolve deployment for commit "${COMMIT_SHA}" on branch "${BRANCH}", but it is not ready yet. State: ${deploymentForCommit.state}`,
      );
      return null;
    }
    return deploymentForCommit;
  }

  async function waitUntilReadyDeployment() {
    const maxTimeout = new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(
          new Error(
            `Error: Timed out in ${MAX_TIMEOUT}ms, based on the configured MAX_TIMEOUT.`,
          ),
        );
      }, MAX_TIMEOUT);
    });

    const isReady = new Promise(async (resolve, reject) => {
      const checkReady = async () => {
        try {
          const readyDeployment = await getReadyDeploymentForCommitRef();
          if (readyDeployment) {
            return resolve({ readyDeployment });
          }
          console.log(
            `Deployment is not ready yet. Retrying in ${RETRY_INTERVAL}ms based on the configured RETRY_INTERVAL...`,
          );
          setTimeout(checkReady, RETRY_INTERVAL);
        } catch (err) {
          return reject(err);
        }
      };
      checkReady();
    });

    return Promise.race([isReady, maxTimeout]);
  }

  waitUntilReadyDeployment()
    .then(({ readyDeployment }) => {
      console.log(
        `Resolved "ready" deployment with ID: ${readyDeployment.id}, URL: ${readyDeployment.deploy_ssl_url}`,
      );
      core.setOutput('deploy_id', readyDeployment.id);
      core.setOutput('url', readyDeployment.deploy_ssl_url);
      process.exit(0);
    })
    .catch(error => {
      core.setFailed(error.message);
    });
}

run();
