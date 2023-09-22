# Discerning Merger
GitHub Action to merge PRs based on author and file patterns.

```yaml
inputs:
  github-token:
    description: 'GitHub token used for authentication'
    required: true
  allowed-authors:
    description: 'Comma seperated list of authors that are allowed to merge files'
    required: true
  allowed-files:
    description: 'Comma seperated list of files (glob format) that are allowed to be automerged.  Files in the pull request that are not matched prevent merging.'
    required: true
```

## Usage:

```yaml
on:
  check_suite:
    types:
      - completed
...
jobs:
  auto-merge:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repo
      uses: actions/checkout@v4

    - name: Auto merge
      uses: peternied/discerning-merger@v1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        allowed-authors: "dependabot, opensearch-trigger-bot, peternied"
        allowed-files: ".gitignore, **/build.gradle"
```

# Changelog

## v1
- Initial Release