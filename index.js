const minimatch = require("minimatch");
const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");

async function run() {
  try {
    const pullRequestNumber = core.getInput("pull-request-number", {
      required: true,
    });
    const allowedAuthors = core
      .getInput("allowed-authors", { required: true })
      .split("\n")
      .map((author) => author.trim())
      .filter(Boolean);
    const allowedFilesPatterns = core
      .getInput("allowed-files", { required: true })
      .split("\n")
      .map((author) => author.trim())
      .filter(Boolean);

    const octokit = new Octokit();

    const { context } = github;
    const { repository } = context.payload;

    const { data: pull_request }  = await octokit.pulls.get({
      pull_number: pullRequestNumber
    });

    const { data: files } = await octokit.pulls.listFiles({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: pull_request.number,
    });

    const fileNames = files.map((f) => f.filename);
    const allFilesAreAllowed = fileNames.every((fileName) =>
      allowedFilesPatterns.some((pattern) => minimatch(fileName, pattern))
    );

    if (!allFilesAreAllowed) {
      const nonMatchingFiles = fileNames.filter(
        (fileName) =>
          !allowedFilesPatterns.some((pattern) => minimatch(fileName, pattern))
      );
      core.info(
        `Some files were not allowed '${nonMatchingFiles.join(
          ", "
        )}'. Skipping...`
      );
      return;
    }

    const { data: checks } = await octokit.checks.listForRef({
      owner: repository.owner.login,
      repo: repository.name,
      ref: pull_request.head.sha,
    });

    const allChecksPass = checks.check_runs.every(
      (check) => check.status === "completed" && check.conclusion === "success"
    );

    if (!allChecksPass) {
      core.info("Not all checks have passed. Skipping...");
      return;
    }

    if (!allowedAuthors.includes(pull_request.user.login)) {
      core.info(
        `Author '${pull_request.user.login}' not in allowed list. Skipping...`
      );
      await octokit.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pull_request.number,
        body: `This pull request could have been automatically merged by adding the author '${pull_request.user.login}' to discerning-merger list of allowed-authors.`,
      });
      return;
    }

    await octokit.pulls.merge({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: pull_request.number,
    });

    await octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: pull_request.number,
      body: "Automatically merged by the bot.",
    });

    core.info("PR merged successfully!");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
