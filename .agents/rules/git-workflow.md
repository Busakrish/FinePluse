# STRICT MANUAL GIT WORKFLOW — ABSOLUTE RULE

We are a 4-member hackathon team working on the same project using GitHub.
All Git synchronization MUST be completely manual.

## ABSOLUTE CONSTRAINTS:
Antigravity must NEVER automatically:
- git fetch
- git pull
- git merge
- git rebase
- git reset
- git checkout another branch
- Switch branches automatically
- Stash/pop changes automatically
- Merge or rebase remote changes automatically
- Update local branches from remote
- Synchronize another member's work into the current working directory
- Modify project files because a remote repository changed

## WORKFLOW:
1. Local Development: Work strictly with the current local state of the project.
2. Commit: Run git add and git commit ONLY when explicitly asked by the user.
3. Push: Run git push ONLY when the user explicitly requests to push.
4. Sync / Fetch / Pull: Run git fetch or git pull ONLY when explicitly commanded by the user with the exact command.
5. Before ANY explicitly requested Git operation, always check:
   - git status
   - git branch --show-current
   - NEVER discard uncommitted work.
   - NEVER overwrite local changes without explicit confirmation.
