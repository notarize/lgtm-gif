const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const inputs = {
      token: core.getInput('repo-token', {required: true}),
      giphyApiKey: process.env.GIPHY_API_KEY,
      githubRepository: process.env.GITHUB_REPOSITORY,
      githubIssueNumber: process.env.GITHUB_ISSUE_NUMBER,
  	  githubCommentBody: process.env.GITHUB_COMMENT_BODY ? process.env.GITHUB_COMMENT_BODY : '',
  	  githubCommentID: process.env.GITHUB_COMMENT_ID,
  	  githubPullRequestNumber: process.env.GITHUB_PULL_REQUEST_NUMBER,
      githubReviewBody: process.env.GITHUB_REVIEW_BODY ? process.env.GITHUB_REVIEW_BODY : '',
  	  githubReviewID: process.env.GITHUB_REVIEW_ID
    };

    const matchComment = input.githubCommentBody.match(/lgtm/);
    const matchReview = input.githubReviewBody.match(/lgtm/);
    if (!matchComment && !matchReview) {
      core.info('no matching comment or review');
      return;
    }

    slugs = input.githubRepository.split('/')
	  if (slugs.length != 2) {
      core.setFailed(`invalid githubRepository: ${input.githubRepository}`);
      return;
    }
    const owner = slugs[0];
    const repo = slugs[1];

    const client = new github.GitHub(inputs.token);
    const lgtmComment = await generateLgtmComment(input.giphyApiKey);
    if (matchComment) {
      if (input.githubIssueNumber == "" && input.githubPullRequestNumber == "") {
        core.setFailed("no issue number and pull request number");
        return;
      }
      var number;
      if (input.githubIssueNumber != "") {
        number = parseInt(input.githubIssueNumber);
        if (!number) {
          core.setFailed('unable to convert string to int in issue number');
          return;
        }
      } else if (input.githubPullRequestNumber != "") {
        number = parseInt(input.githubPullRequestNumber);
        if (!number) {
          core.setFailed('unable to convert string to int in pull request number');
          return;
        }
      }
      const request = {
      	owner: owner,
      	repo: repo,
      	number: number,
      	body: lgtmComment
      };
      const response = await client.issues.createComment(request);
      core.info(`response: ${response.status}`);
      if (response.status !== 200) {
        core.error('Updating the pull request has failed');
      }
      return;
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()

async function generateLgtmComment(giphyApiKey) {
  const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=lgtm`);
  const json = await(response.json());
  const giphies = json['data'];
  const randomIndex = parseInt(Math.random() * giphies.length);
  const gif = giphies[randomIndex];
  const id = gif['id'];
  const mediaUrl = `https://media.giphy.com/media/${id}/giphy.gif`;
  return `![](${mediaUrl})`;
}
