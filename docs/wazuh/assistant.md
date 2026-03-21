---
title: Wazuh installation assistant
description: Wazuh installation assistant
icon: lucide/cog
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---


## Requirements

### Hardware

Following this quickstart implies deploying the Wazuh server, the Wazuh indexer, and the Wazuh dashboard on the same host. This is usually enough for monitoring up to 100 endpoints and for 90 days of queryable/indexed alert data. The table below shows the recommended hardware for a quickstart deployment:

| **Agents** | **CPU** | **RAM** | **Storage (90 days)** |
| ---------- | ------- | ------- | --------------------- |
| **1–25**   | 4 vCPU  | 8 GiB   | 50 GB                 |
| **25–50**  | 8 vCPU  | 8 GiB   | 100 GB                |
| **50–100** | 8 vCPU  | 8 GiB   | 200 GB                |


### Operating system

The Wazuh central components require a 64-bit Intel, AMD, or ARM Linux processor (x86_64/AMD64 or AARCH64/ARM64 architecture) to run. Wazuh recommends any of the following operating system versions:

- Amazon Linux 2, Amazon Linux 2023
- CentOS Stream 10
- Red Hat Enterprise Linux 7, 8, 9, 10
- Ubuntu 16.04, 18.04, 20.04, 22.04, 24.04


## Installation

[Documentation](https://documentation.wazuh.com/current/quickstart.html)

Download and run the Wazuh installation assistant.

```bash
curl -sO https://packages.wazuh.com/4.14/wazuh-install.sh && sudo bash ./wazuh-install.sh -a
```

Once the assistant finishes the installation, the output shows the access credentials and a message that confirms that the installation was successful.

```bash hl_lines="4 5"
23/11/2025 11:51:51 INFO: Wazuh dashboard web application initialized.
23/11/2025 11:51:51 INFO: --- Summary ---
23/11/2025 11:51:51 INFO: You can access the web interface https://<wazuh-dashboard-ip>:443
    User: admin
    Password: ItUH27LJ+tk2b5.5P35Q*Hh3XUl99j63
23/11/2025 11:51:51 INFO: Installation finished.

```

??? example "Sample installation log"

    ```bash
    root@siem:/home/analyst/Wazuh# curl -sO https://packages.wazuh.com/4.14/wazuh-install.sh && sudo bash ./wazuh-install.sh -a
    23/11/2025 11:37:52 INFO: Starting Wazuh installation assistant. Wazuh version: 4.14.1
    23/11/2025 11:37:52 INFO: Verbose logging redirected to /var/log/wazuh-install.log
    23/11/2025 11:38:04 INFO: Verifying that your system meets the recommended minimum hardware requirements.
    23/11/2025 11:38:04 INFO: Wazuh web interface port will be 443.
    23/11/2025 11:38:10 INFO: --- Dependencies ----
    23/11/2025 11:38:10 INFO: Installing apt-transport-https.
    23/11/2025 11:38:14 INFO: Installing debhelper.
    23/11/2025 11:39:14 INFO: Wazuh repository added.
    23/11/2025 11:39:14 INFO: --- Configuration files ---
    23/11/2025 11:39:14 INFO: Generating configuration files.
    23/11/2025 11:39:15 INFO: Generating the root certificate.
    23/11/2025 11:39:15 INFO: Generating Admin certificates.
    23/11/2025 11:39:15 INFO: Generating Wazuh indexer certificates.
    23/11/2025 11:39:16 INFO: Generating Filebeat certificates.
    23/11/2025 11:39:17 INFO: Generating Wazuh dashboard certificates.
    23/11/2025 11:39:17 INFO: Created wazuh-install-files.tar. It contains the Wazuh cluster key, certificates, and passwords necessary for installation.
    23/11/2025 11:39:17 INFO: --- Wazuh indexer ---
    23/11/2025 11:39:17 INFO: Starting Wazuh indexer installation.
    23/11/2025 11:44:20 INFO: Wazuh indexer installation finished.
    23/11/2025 11:44:20 INFO: Wazuh indexer post-install configuration finished.
    23/11/2025 11:44:20 INFO: Starting service wazuh-indexer.
    23/11/2025 11:44:38 INFO: wazuh-indexer service started.
    23/11/2025 11:44:38 INFO: Initializing Wazuh indexer cluster security settings.
    23/11/2025 11:44:42 INFO: Wazuh indexer cluster security configuration initialized.
    23/11/2025 11:44:42 INFO: Wazuh indexer cluster initialized.
    23/11/2025 11:44:42 INFO: --- Wazuh server ---
    23/11/2025 11:44:42 INFO: Starting the Wazuh manager installation.
    23/11/2025 11:48:29 INFO: Wazuh manager installation finished.
    23/11/2025 11:48:29 INFO: Wazuh manager vulnerability detection configuration finished.
    23/11/2025 11:48:29 INFO: Starting service wazuh-manager.
    23/11/2025 11:48:45 INFO: wazuh-manager service started.
    23/11/2025 11:48:45 INFO: Starting Filebeat installation.
    23/11/2025 11:49:06 INFO: Filebeat installation finished.
    23/11/2025 11:49:07 INFO: Filebeat post-install configuration finished.
    23/11/2025 11:49:07 INFO: Starting service filebeat.
    23/11/2025 11:49:08 INFO: filebeat service started.
    23/11/2025 11:49:08 INFO: --- Wazuh dashboard ---
    23/11/2025 11:49:08 INFO: Starting Wazuh dashboard installation.
    23/11/2025 11:51:01 INFO: Wazuh dashboard installation finished.
    23/11/2025 11:51:01 INFO: Wazuh dashboard post-install configuration finished.
    23/11/2025 11:51:01 INFO: Starting service wazuh-dashboard.
    23/11/2025 11:51:02 INFO: wazuh-dashboard service started.
    23/11/2025 11:51:03 INFO: Updating the internal users.
    23/11/2025 11:51:06 INFO: A backup of the internal users has been saved in the /etc/wazuh-indexer/internalusers-backup folder.
    23/11/2025 11:51:17 INFO: The filebeat.yml file has been updated to use the Filebeat Keystore username and password.
    23/11/2025 11:51:50 INFO: Initializing Wazuh dashboard web application.
    23/11/2025 11:51:51 INFO: Wazuh dashboard web application initialized.
    23/11/2025 11:51:51 INFO: --- Summary ---
    23/11/2025 11:51:51 INFO: You can access the web interface https://<wazuh-dashboard-ip>:443
        User: admin
        Password: ItUH27LJ+tk2b5.5P35Q*Hh3XUl99j63
    23/11/2025 11:51:51 INFO: Installation finished.
    root@siem:/home/analyst/Wazuh#
    ```


??? tip

    Verbose logging redirected to `/var/log/wazuh-install.log`

Access the Wazuh web interface with https://<WAZUH_DASHBOARD_IP_ADDRESS> and your credentials:

- `Username`: admin
- `Password`: < ADMIN_PASSWORD >

![image](https://gist.github.com/user-attachments/assets/6fd9b6ba-15fc-4c36-a613-18a62c1e7d4c)

![image](https://gist.github.com/user-attachments/assets/ff5733b9-8fce-4dd5-95fc-59ef3b9c7c78)

??? info 

    You can find the passwords for all the Wazuh indexer and Wazuh API users in the `wazuh-passwords.txt file inside `wazuh-install-files.tar`. To print them, run the following command:


    ```bash
    sudo tar -O -xvf wazuh-install-files.tar wazuh-install-files/wazuh-passwords.txt
    ```
    ??? example "Sample Output"

        ```bash
        root@siem:/home/analyst/Wazuh# sudo tar -O -xvf wazuh-install-files.tar wazuh-install-files/wazuh-passwords.txt
        wazuh-install-files/wazuh-passwords.txt
        # Admin user for the web user interface and Wazuh indexer. Use this user to log in to Wazuh dashboard
        indexer_username: 'admin'
        indexer_password: 'ItUH27LJ+tk2b5.5P35Q*Hh3XUl99j63'

        # Anomaly detection user for the web user interface
        indexer_username: 'anomalyadmin'
        indexer_password: '8pW49SUHT*b9*Trap4bBwG902BUyVKb0'

        # Wazuh dashboard user for establishing the connection with Wazuh indexer
        indexer_username: 'kibanaserver'
        indexer_password: 'NFm0S6EMsk1*H16IVvTerX5iMlqEfFtQ'

        # Regular Dashboard user, only has read permissions to all indices and all permissions on the .kibana index
        indexer_username: 'kibanaro'
        indexer_password: 'lg0zDBT3*tctsK6UynvyInj5*?6x0gwe'

        # Filebeat user for CRUD operations on Wazuh indices
        indexer_username: 'logstash'
        indexer_password: '?.HWM1JuKT?iROubcIbh9aADVEMBg.3D'

        # User with READ access to all indices
        indexer_username: 'readall'
        indexer_password: 'ntcQgU4PV4kHwE5I+lCdEmhzJzy+0r?6'

        # User with permissions to perform snapshot and restore operations
        indexer_username: 'snapshotrestore'
        indexer_password: 'PMUTampqE+B0ab?rFssgVvZbOGVj5I58'

        # Password for wazuh API user
        api_username: 'wazuh'
        api_password: 'vwBC4f?CPQ0Hv*g9*iiR6FUu+Xay*nWA'

        # Password for wazuh-wui API user
        api_username: 'wazuh-wui'
        api_password: 'MT3jVX8kok.UY2LMqF6*X3HHy*ICMaws'
        ```

## Disable Wazuh Updates.

It is recommended to disable the Wazuh package repositories after installation to prevent accidental upgrades that could break the environment.

Execute the following command to disable the Wazuh repository:

```bash
sed -i "s/^deb /#deb /" /etc/apt/sources.list.d/wazuh.list
apt update
```

## Uninstall

If you want to uninstall the Wazuh central components, run the Wazuh installation assistant using the option -u or –-uninstall.

```bash
sudo bash ./wazuh-install.sh -u
```

??? example "Sample output"

    ```bash
    root@siem:/home/analyst/Wazuh# bash ./wazuh-install.sh -u
    23/11/2025 12:06:12 INFO: Starting Wazuh installation assistant. Wazuh version: 4.14.1
    23/11/2025 12:06:12 INFO: Verbose logging redirected to /var/log/wazuh-install.log
    23/11/2025 12:06:14 INFO: Removing Wazuh manager.
    23/11/2025 12:06:21 INFO: Wazuh manager removed.
    23/11/2025 12:06:21 INFO: Removing Wazuh indexer.
    23/11/2025 12:06:25 INFO: Wazuh indexer removed.
    23/11/2025 12:06:25 INFO: Removing Filebeat.
    23/11/2025 12:06:28 INFO: Filebeat removed.
    23/11/2025 12:06:28 INFO: Removing Wazuh dashboard.
    23/11/2025 12:06:36 INFO: Wazuh dashboard removed.
    ```