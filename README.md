# Discerning Merger
GitHub Action to merge PRs based on author and file patterns.

```yaml
  token:
    description: "GitHub token used for authentication"
    required: true
  pull-request-number:
    description: "Pull request number to merge if checks pass"
    required: true
  allowed-authors:
    description: "Newline seperated list of authors that are allowed to merge files"
    required: true
  allowed-files:
    description: "Newline seperated list of files (glob format) that are allowed to be automerged.  Files in the pull request that are not matched prevent merging."
    required: true
```

## Usage:

```yaml
on:
  workflow_run:
    types: completed
...
jobs:
  identify-trigger:
    runs-on: ubuntu-latest
    steps:
    - id: identify-triggering-pr
      uses: actions/github-script@v5
      with:
        script: |
          const { owner, repo } = context.repo;
          const workflowRunId = context.payload.workflow_run.id;
          const workflowRun = await github.rest.actions.getWorkflowRun({
            owner,
            repo,
            run_id: workflowRunId,
          });
          const trigger = workflowRun.data.event;
          console.log(JSON.stringify(workflowRun.data));

          let pr = null;
          if (trigger === 'pull_request' || trigger === 'pull_request_target') {
            const prs = await github.rest.repos.listPullRequestsAssociatedWithCommit({
              owner,
              repo,
              commit_sha: workflowRun.data.head_sha,
            });
            pr = prs.data.find(pr => pr.head.sha === workflowRun.data.head_sha);
          }

          return { pr };
    - uses: peternied/discerning-merger@v1
      if: steps.identify-triggering-pr.outputs.result != null
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        pull-request-number: ${{ steps.identify-triggering-pr.outputs.result }}
        allowed-authors: |
          dependabot
          opensearch-trigger-bot
          peternied
        allowed-files: |
          .gitignore
          **/build.gradle
```

# Changelog

## v1
- Initial Release