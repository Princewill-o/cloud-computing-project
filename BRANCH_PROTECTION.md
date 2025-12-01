# Branch Protection Guide

This document explains the branch protection setup for the Cloud Computing Project.

## Branch Structure

- **`main`**: Development branch - where active development happens
- **`production`**: Protected branch - stable, tested code only

## Protection Measures

### 1. GitHub Branch Protection Rules

To set up branch protection on GitHub:

1. Go to your repository: https://github.com/Princewill-o/cloud-computing-project
2. Click **Settings** → **Branches**
3. Click **Add rule** or edit the existing rule for `production`
4. Configure the following settings:

#### Required Settings:
- ✅ **Require a pull request before merging**
  - Require approvals: **1** (or more)
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners (if you set up CODEOWNERS)

- ✅ **Require status checks to pass before merging**
  - Select: **CI/CD Pipeline** (from GitHub Actions)
  - Select: **Require branches to be up to date before merging**

- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings**
  - Even administrators cannot bypass

- ✅ **Restrict who can push to matching branches**
  - Only allow specific people/teams

#### Optional but Recommended:
- ✅ **Require linear history** (prevents merge commits)
- ✅ **Include administrators** (apply rules to admins too)
- ✅ **Allow force pushes**: ❌ Disabled
- ✅ **Allow deletions**: ❌ Disabled

### 2. Pre-commit Hooks (Local)

Pre-commit hooks run automatically before each commit to catch issues early.

**Setup:**
```bash
cd frontend
npm install
npx husky install
```

**What it checks:**
- ✅ Code linting (ESLint)
- ✅ TypeScript type checking
- ✅ Build verification

If any check fails, the commit is blocked.

### 3. GitHub Actions CI/CD

Automated checks run on every push and pull request:

**Checks performed:**
- ✅ Install dependencies
- ✅ Run linter
- ✅ Type checking
- ✅ Build verification

**Location:** `.github/workflows/ci.yml`

### 4. Pull Request Requirements

Before merging to `production`:

1. ✅ All CI checks must pass
2. ✅ At least 1 code review approval
3. ✅ No merge conflicts
4. ✅ All conversations resolved

## Workflow

### Development Workflow:
```
1. Create feature branch from `main`
   git checkout -b feature/new-feature

2. Make changes and commit
   git add .
   git commit -m "Add new feature"

3. Push to GitHub
   git push origin feature/new-feature

4. Create Pull Request to `main`
   - CI checks run automatically
   - Get code review
   - Merge when approved

5. After testing on `main`, create PR to `production`
   - All checks must pass
   - Requires approval
   - Merge to production
```

### Emergency Hotfix:
If you need to fix `production` directly:
1. Create hotfix branch from `production`
2. Make minimal fix
3. Create PR with explanation
4. Get approval
5. Merge

## Code Review Checklist

Before approving a PR to `production`:

- [ ] Code follows project style guidelines
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Tests pass (when available)
- [ ] No console errors in browser
- [ ] Responsive design works
- [ ] Dark mode works correctly
- [ ] No security vulnerabilities
- [ ] Documentation updated if needed

## Bypassing Protection (Not Recommended)

**Never bypass protection rules!** If you must:

1. Only for critical production fixes
2. Document why bypass was needed
3. Review and test thoroughly after
4. Update protection rules if needed

## Additional Security

Consider adding:
- **Dependabot** for dependency updates
- **CodeQL** for security scanning
- **Semantic versioning** for releases
- **Release tags** for production deployments

