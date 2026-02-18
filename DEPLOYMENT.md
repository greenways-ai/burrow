# Deployment Guide

This document explains how to deploy the Burrow application using GitHub Actions with dot-secrets for environment management.

## Overview

The project uses GitHub Actions for continuous integration and deployment:

1. **CI Workflow** - Runs on every PR and push to main/develop
2. **Staging Deployment** - Auto-deploys when pushing to `develop` branch
3. **Production Deployment** - Deploys when pushing to `main` or creating a tag
4. **Database Migrations** - Manual workflow for running Supabase migrations

## Environment Management with dot-secrets

Environment variables and secrets are managed through the `dot-secrets` GitHub repository, included as a submodule at `.secrets/`.

### Directory Structure

```
.secrets/burrow/
├── prod/               # Production environment
├── staging/            # Staging environment
└── local-sample/       # Local development templates
```

### Required GitHub Secrets

The following secrets must be configured in GitHub Actions:

| Secret | Description |
|--------|-------------|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |

All other configuration (Supabase URLs, API keys, etc.) is loaded from the dot-secrets submodule.

## Initial Setup

### 1. Configure Netlify

1. Site should already be created: `burrow-greenways-ai`
2. Site ID: `1e59d9a3-471f-47bb-b144-11f29177b527`

3. Add to GitHub Secrets:
   - Go to Settings > Secrets and variables > Actions
   - Add `NETLIFY_AUTH_TOKEN` (generate at https://app.netlify.com/user/applications/personal)

### 2. Configure dot-secrets

1. Update the environment files in dot-secrets:
   ```bash
   cd .secrets
   # Edit burrow/prod/.env, burrow/prod/supabase.env, etc.
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Update burrow environment variables"
   git push
   ```

3. Update submodule reference in main repo:
   ```bash
   cd ..
   git add .secrets
   git commit -m "Update dot-secrets submodule"
   git push
   ```

### 3. Configure Supabase

1. Supabase project should already be created
2. Run initial migrations:
   ```bash
   supabase login
   supabase link --project-ref puyrhntsyytzlldsgxit
   supabase migration up
   ```

## Workflows

### CI Workflow (`ci.yml`)

Runs automatically on:
- Push to `main` or `develop`
- Pull requests to `main`

**Jobs:**
1. **Lint and Build** - Runs ESLint and builds the application
2. **Supabase Checks** - Validates Supabase configuration

### Deploy to Production (`deploy-production.yml`)

Triggered by:
- Push to `main` branch
- Tag push (`v*`)
- Manual dispatch with confirmation

**Jobs:**
1. **Deploy Supabase** - Pushes database migrations
2. **Deploy Netlify** - Builds and deploys to Netlify production

### Deploy to Staging (`deploy-staging.yml`)

Triggered by:
- Push to `develop` branch
- Manual dispatch

### Database Migration (`migrate.yml`)

Manual workflow for:
- Running migrations up/down
- Resetting database

## Local Development with dot-secrets

```bash
# Clone with submodules
git clone --recursive git@github.com:greenways-ai/burrow.git

# Or if already cloned
git submodule update --init --recursive

# Copy local environment
cp .secrets/burrow/local-sample/.env .env.local

# Edit with your values
vim .env.local

# Start development
npm run dev
```

## Updating dot-secrets

To update environment variables:

1. Navigate to the submodule:
   ```bash
   cd .secrets
   ```

2. Edit the appropriate environment file:
   ```bash
   vim burrow/prod/.env
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Update burrow prod env"
   git push
   ```

4. Update the submodule reference in main repo:
   ```bash
   cd ..
   git add .secrets
   git commit -m "Update dot-secrets submodule"
   git push
   ```

This will trigger the deployment workflow with updated environment variables.
