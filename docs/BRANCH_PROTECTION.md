# Branch Protection Setup (GitHub)

## Goal

Prevent broken code from merging into `main` by requiring CI checks.

## Steps

1. Open GitHub repository.
2. Go to `Settings` -> `Branches`.
3. Under `Branch protection rules`, click `Add rule`.
4. Branch name pattern: `main`.
5. Enable:
   - `Require a pull request before merging`
   - `Require approvals` (recommended: `1`)
   - `Dismiss stale pull request approvals when new commits are pushed`
   - `Require status checks to pass before merging`
6. In required checks, select:
   - `CI / Backend Checks`
   - `CI / Frontend Checks`
   - `CI / Frontend E2E`
   - `CI / Docker Build Check`
7. Enable:
   - `Require branches to be up to date before merging`
   - `Do not allow bypassing the above settings` (if repo policy allows)
8. Click `Create` / `Save changes`.

## Result

Any PR to `main` must pass the full pipeline and review gates before merge.
