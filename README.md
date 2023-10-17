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
    - id: find-triggering-pr
      uses: peternied/find-triggering-pr@v1
      with:
        token: ${{ secrets.GITHUB_TOKEN }}

    - uses: peternied/discerning-merger@v2
      if: steps.find-triggering-pr.outputs.pr-number != null
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        pull-request-number: ${{ steps.find-triggering-pr.outputs.pr-number }}
        allowed-authors: |
          dependabot
          peternied
        allowed-files: |
          .gitignore
          **/build.gradle
```

# Changelog

## v2
- Checks that are 'neutral' are treated as 'success' for determining if a pull request can be merged.

## v1
- Initial Release