---
title: Cortex
description: Cortex is an open-source analysis and response engine designed for SOCs, CSIRTs, and security researchers to automate threat intelligence gathering and incident response.
icon: lucide/server
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---


# Cortex

## 1. Downloading the Package

Start by downloading the installation package, its SHA256 checksum file, and its signature file using Wget:


```bash
wget -O /tmp/cortex_4.0.0-1_all.deb https://cortex.download.strangebee.com/4.0/deb/cortex_4.0.0-1_all.deb
wget -O /tmp/cortex_4.0.0-1_all.deb.sha256 https://cortex.download.strangebee.com/4.0/sha256/cortex_4.0.0-1_all.deb.sha256
wget -O /tmp/cortex_4.0.0-1_all.deb.asc https://cortex.download.strangebee.com/4.0/asc/cortex_4.0.0-1_all.deb.asc
```

## 2. Verifying File Integrity

Before installing, confirm the package hasn't been corrupted or tampered with.

### SHA256 Checksum

Generate the checksum of your downloaded file and compare it against the official value:

```bash
sha256sum /tmp/cortex_4.0.0-1_all.deb
cat /tmp/cortex_4.0.0-1_all.deb.sha256
```

Both outputs should match exactly. 

!!! warning

    If they don't, do not proceed with installation — reach out to the [StrangeBee Security Team](security@strangebee.com) instead.

### GPG Signature

Download and import StrangeBee's public key, then use it to verify the package signature:

```bash
wget -O /tmp/strangebee.gpg https://keys.download.strangebee.com/latest/gpg/strangebee.gpg
gpg --import /tmp/strangebee.gpg
gpg --verify /tmp/cortex_4.0.0-1_all.deb.asc /tmp/cortex_4.0.0-1_all.deb
```

A successful verification will display:

```bash
gpg: Good signature from "TheHive Project (TheHive release key) <support@thehive-project.org>"
```

Make sure the key fingerprint matches: `0CD5 AC59 DE5C 5A8E 0EE1 3849 3D99 BB18 562C BC1C`

## 3. Installing the Package

You can install using either `apt-get` (recommended, as it handles dependencies automatically) or `dpkg`:


```bash
sudo apt-get install /tmp/cortex_4.0.0-1_all.deb
# or
sudo dpkg -i /tmp/cortex_4.0.0-1_all.deb
```


## 4. Configuration

The following settings are required to start Cortex successfully:

- [Secret key](https://docs.strangebee.com/cortex/installation-and-configuration/secret/) configuration
- [Database configuration](https://docs.strangebee.com/cortex/installation-and-configuration/database/)
- [Authentication](https://docs.strangebee.com/cortex/installation-and-configuration/authentication/)
- [Analyzers & Responders configuration](https://docs.strangebee.com/cortex/installation-and-configuration/analyzers-responders/)


??? "Secret key configuration"

    Setup a secret key for this instance:

    ```bash
    cat > /etc/cortex/secret.conf << _EOF_
    play.http.secret.key="$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)"
    _EOF_
    ```

    Then, in the file `/etc/cortex/application.conf`, replace the line including `play.http.secret.key=` by:

    ```baash
    [..]
    include "/etc/cortex/secret.conf"
    [..]
    ```


??? "Database configuration"

    ```bash
    ## ElasticSearch
    search {
    # Name of the index
    index = cortex
    # ElasticSearch instance address.
    # For cluster, join address:port with ',': "http://ip1:9200,ip2:9200,ip3:9200"
    uri = "http://localhost:9200"

    ## Advanced configuration
    # Scroll keepalive.
    #keepalive = 1m
    # Scroll page size.
    #pagesize = 50
    # Number of shards
    #nbshards = 5
    # Number of replicas
    #nbreplicas = 1
    # Arbitrary settings
    #settings {
    #  # Maximum number of nested fields
    #  mapping.nested_fields.limit = 100
    #}

    ## Authentication configuration
    #user = ""
    #password = ""

    ## SSL configuration
    #keyStore {
    #  path = "/path/to/keystore"
    #  type = "JKS" # or PKCS12
    #  password = "keystore-password"
    #}
    #trustStore {
    #  path = "/path/to/trustStore"
    #  type = "JKS" # or PKCS12
    #  password = "trustStore-password"
    #}
    }
    ```

??? "Analyzers & Responders"


    ```bash
    ## ANALYZERS
    #
    analyzer {
    # analyzer location
    # url can be point to:
    # - directory where analyzers are installed
    # - json file containing the list of analyzer descriptions
    urls = [
        "https://catalogs.download.strangebee.com/latest/json/analyzers.json"
        #"/absolute/path/of/analyzers"
    ]

    # Sane defaults. Do not change unless you know what you are doing.
    fork-join-executor {
        # Min number of threads available for analysis.
        parallelism-min = 2
        # Parallelism (threads) ... ceil(available processors * factor).
        parallelism-factor = 2.0
        # Max number of threads available for analysis.
        parallelism-max = 4
    }
    }

    # RESPONDERS
    #
    responder {
    # responder location (same format as analyzer.urls)
    urls = [
        "https://catalogs.download.strangebee.com/latest/json/responders.json"
        #"/absolute/path/of/responders"
    ]

    # Sane defaults. Do not change unless you know what you are doing.
    fork-join-executor {
        # Min number of threads available for analysis.
        parallelism-min = 2
        # Parallelism (threads) ... ceil(available processors * factor).
        parallelism-factor = 2.0
        # Max number of threads available for analysis.
        parallelism-max = 4
    }
    }
    ```


Once done, save the configuration file and start the service:

```bash
sudo systemctl start cortex
```

!!! note

    The service may take a moment to come online. Once it's running, open your browser and navigate to http://YOUR_SERVER_ADDRESS:9001/


## 5. First-Time Setup

Cortex relies on ElasticSearch to store users, organizations, and analyzer configurations. On your first visit to the web UI, click Update Database to initialize it.

![image](https://gist.github.com/user-attachments/assets/b7728a14-ca9e-4cec-af6c-43078079a6ef)

![image](https://gist.github.com/user-attachments/assets/2dcc95e9-392c-4624-a498-7482c1c699a0)

You are then invited to create the first user. This is a Cortex global administration user or `superAdmin`. This user account will be able to create Cortex organizations and users.

![image](https://gist.github.com/user-attachments/assets/1a8e86da-6b7c-4bc0-a568-1ea0ad10d3a5)

You'll then be prompted to create a superAdmin account — the global administrator responsible for managing organizations and users within Cortex. 

![image](https://gist.github.com/user-attachments/assets/1d81cabe-00c1-4215-bf79-5a08e9090f6b)

After creating this account, log in and you'll find that a default cortex organization has already been set up with your account included.

![image](https://gist.github.com/user-attachments/assets/e771909a-b0c0-49fa-b6dd-ec52a1a89af3)


## 6. Create an organization

The default `cortex` organization is reserved exclusively for global administration — it can only house users with the `superAdmin` role and is used to manage organizations and their users. It cannot be used to enable, disable, or configure analyzers.

To work with analyzers, you must create your own organization. Click the **Add Organization** button to get started.

![image](https://gist.github.com/user-attachments/assets/b98ef3ef-ddf3-45f1-830e-bccf1ff0210c)


![image](https://gist.github.com/user-attachments/assets/bef1d1e0-404c-415c-94bb-551a094b077b)


## 7. Create a organization Administrator

Once your organization is set up, create an administrator account for it by assigning a user the `orgAdmin` role.

![image](https://gist.github.com/user-attachments/assets/6942ee6a-bd6c-445c-80c1-476aba3f70e8)

![image](https://gist.github.com/user-attachments/assets/63809964-3e31-499a-8499-20901c0efda1)

Set a password for this new user, then log out of the `superAdmin` account and log back in using the newly created `orgAdmin` credentials.

![image](https://gist.github.com/user-attachments/assets/2beed374-a98e-4a05-b40f-e0b3bc149b49)

![image](https://gist.github.com/user-attachments/assets/994ba692-a3d1-432d-8d6d-cde552c12b48)

### Cortex User Roles

Cortex defines four distinct roles, each with a specific scope of access and permissions:

- **`read`** — The most limited role. Users can view all jobs and their results, but cannot submit new jobs. This role is not available in the default `cortex` organization.
- **`analyze`** — Inherits all `read` permissions and additionally allows users to submit jobs using any analyzer configured for their organization. Also not available in the default `cortex` organization.
- **`orgAdmin`** — Inherits all `analyze` permissions. Users with this role can manage their organization's users (add users, assign roles), and configure analyzers. Not available in the default `cortex` organization.
- **`superAdmin`** — An administrative-only role that is incompatible with all the roles above. Restricted exclusively to the default `cortex` organization, this role is used solely to manage organizations and their users. The first user created during installation is automatically assigned this role.

| Action                      | `read` | `analyze` | `orgAdmin` | `superAdmin` |
| --------------------------- | ------ | --------- | ---------- | ------------ |
| Read reports                | ✓      | ✓         | ✓          |              |
| Run jobs                    |        | ✓         | ✓          |              |
| Enable/Disable analyzers    |        |           | ✓          |              |
| Configure analyzers         |        |           | ✓          |              |
| Create/Delete org analysts  |        |           | ✓          | ✓            |
| Create/Delete org admins    |        |           | ✓          | ✓            |
| Create/Delete organizations |        |           |            | ✓            |
| Create Cortex admin users   |        |           |            | ✓            |

## 8. Enable and configure Analyzers

With your organization and admin account in place, you can now enable the analyzers your team needs. Head to the **Organization** > **Configuration** and **Organization** > **Analyzers** tabs to manage them — including adding API keys and setting rate limits — all from within the Web UI.

![image](https://gist.github.com/user-attachments/assets/89f820d0-2bc2-485e-9fc8-2e07b70eac06)

![image](https://gist.github.com/user-attachments/assets/98ba756c-11df-4c4f-b817-be431d704cd6)

![image](https://gist.github.com/user-attachments/assets/0056302d-7a5b-4bfd-a48e-be9f0bfee114)

## 9. Create an account for TheHive integration

If you plan to connect TheHive to Cortex, create a dedicated user account within your organization and assign it the `read, analyze` role. Generate an API key for this account — you will need to add it to your TheHive configuration.


![image](https://gist.github.com/user-attachments/assets/78538776-58a1-42e7-b2ff-3f5045340070)

![image](https://gist.github.com/user-attachments/assets/8a6e39fe-5b4b-4765-a5cc-b7cb12c205a1)

![image](https://gist.github.com/user-attachments/assets/b3169543-a972-440f-985e-a34d8f8d3280)

