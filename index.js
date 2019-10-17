const core = require('@actions/core');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const inputs = {
      token: core.getInput('repo-token', {required: true}),
    }
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY
    core.info("Got Token");
    core.info(`${process.env.TEST_ENV}`);
    let fetch = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=lgtm`);
    let giphies = await(fetch.json())
    core.info(giphies);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
