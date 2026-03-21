---
title: Virtual machine (VM)
description: Virtual machine (VM)
icon: lucide/cog
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

Wazuh provides a [pre-built virtual machine image](https://documentation.wazuh.com/current/deployment-options/virtual-machine/virtual-machine.html) in Open Virtual Appliance (OVA) format. It includes the Amazon Linux 2023 operating system and the Wazuh central components.

- Wazuh manager 4.14.1
- Filebeat-OSS 7.10.2
- Wazuh indexer 4.14.1
- Wazuh dashboard 4.14.1

You can import the Wazuh virtual machine image to VirtualBox or other OVA-compatible virtualization systems. This VM runs only on 64-bit systems with x86_64/AMD64 architecture. It does not provide high availability or scalability out of the box.


|OS|Architecture|VM Format|Version|Package|
|---|---|---|---|---|
|Amazon Linux 2023|64-bit x86_64/AMD64 architecture|OVA|4.14.1|[wazuh-4.14.1.ova](https://packages.wazuh.com/4.x/vm/wazuh-4.14.1.ova) ([sha512](https://packages.wazuh.com/4.x/checksums/wazuh/4.14.1/wazuh-4.14.1.ova.sha512))|

### Hardware requirements

The following requirements have to be in place before the Wazuh VM can be imported into a host operating system:

- The host operating system must be 64-bit with x86_64/AMD64 architecture.
- Enable hardware virtualization in the host firmware.
- Install a virtualization platform, such as VirtualBox, on the host system.

The Wazuh VM is configured with these specifications by default:


|Component|CPU (cores)|RAM (GB)|Storage (GB)|
|---|---|---|---|
|Wazuh v4.14.1 OVA|4|8|50|

### Import and access the virtual machine

1. Import the [wazuh-4.14.1.ova](https://packages.wazuh.com/4.x/vm/wazuh-4.14.1.ova) file to your virtualization platform.

    ![image](https://gist.github.com/user-attachments/assets/338c6ce3-94e3-4f13-90e5-ff3bfc8c03bf)

    ![image](https://gist.github.com/user-attachments/assets/16e0fe49-361a-492e-abb5-d3cad257e6f8)

    ![image](https://gist.github.com/user-attachments/assets/34cbba53-e99a-4c67-8fb9-de916d6eff4a)

    ![image](https://gist.github.com/user-attachments/assets/5a8c4241-dd86-477a-a381-09815d579e53)

2. If you use VirtualBox, set the Graphics Controller to `VMSVGA`. Other controllers can freeze the VM window.
    1. Select the imported VM
    2. Click **Settings** > **Display**
    3. Switch from **Basic** to **Expert** mode at the top-left of the settings window.
    4. From the **Graphic controller** dropdown, select the `VMSVGA` option.
    ![image](https://gist.github.com/user-attachments/assets/d81bad97-a937-41b7-be00-f87f87ca16c8)
3. If you use VirtualBox, the VM might experience time skew when VirtualBox synchronizes the guest machine time. Follow the steps below to avoid this:
    1. Select the imported Wazuh VM
    2. Click on Settings > System.
    3. Switch from Basic to Expert mode at the top-left of the settings window.
    4. Click on the Motherboard sub-tab.
    5. Enable the `Hardware Clock in UTC Time` option under Features.
    ![image](https://gist.github.com/user-attachments/assets/e8a87664-8536-4442-8845-ac387eb243ea)
    ??? note
        By default, the network interface type is set to Bridged Adapter. The VM attempts to obtain an IP address from the network DHCP server. Alternatively, you can set a static IP address by configuring the network files in Amazon Linux.
4. Start the VM.
5. Log in using these credentials. You can use the virtualization platform or access it via SSH.

        user: wazuh-user
        password: wazuh

    ![image](https://gist.github.com/user-attachments/assets/d5ceadce-d4c9-4df4-85cd-514c8a34face)

    ![image](https://gist.github.com/user-attachments/assets/45a9043d-0cbb-44c4-96ee-c8533832c4ed)
    
    The SSH `root` user login is disabled. The `wazuh-user` has sudo privileges. To switch to root, execute the following command:

    ```bash
    sudo -i
    ```

#### Access the Wazuh dashboard

After starting the VM, access the Wazuh dashboard in a web browser using these credentials:


```bash
URL: https://<WAZUH_SERVER_IP>
user: admin
password: admin
```

![image](https://gist.github.com/user-attachments/assets/ff5733b9-8fce-4dd5-95fc-59ef3b9c7c78)

It might take a few seconds to minutes for the Wazuh dashboard to complete initialization. 

#### Configuration files

All components in this virtual image are configured to work out of the box. However, all components can be fully customized. These are the configuration file locations:

- Wazuh manager: `/var/ossec/etc/ossec.conf`
- Wazuh indexer: `/etc/wazuh-indexer/opensearch.yml`
- Filebeat-OSS: `/etc/filebeat/filebeat.yml`
Wazuh dashboard:
    - `/etc/wazuh-dashboard/opensearch_dashboards.yml`
    - `/usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml`

## Securing your Wazuh installation

It is recommended to change the default credentials to protect your infrastructure from possible attacks.

Follow the instructions to change the default passwords for both the Wazuh API and the Wazuh indexer users.

Use the Wazuh passwords tool to change all the internal users' passwords.

```bash
/usr/share/wazuh-indexer/plugins/opensearch-security/tools/wazuh-passwords-tool.sh --api --change-all --admin-user wazuh --admin-password wazuh
```

??? example "Sample Output"

    ```bash
    INFO: The password for user admin is yWOzmNA.?Aoc+rQfDBcF71KZp?1xd7IO
    INFO: The password for user kibanaserver is nUa+66zY.eDF*2rRl5GKdgLxvgYQA+wo
    INFO: The password for user kibanaro is 0jHq.4i*VAgclnqFiXvZ5gtQq1D5LCcL
    INFO: The password for user logstash is hWW6U45rPoCT?oR.r.Baw2qaWz2iH8Ml
    INFO: The password for user readall is PNt5K+FpKDMO2TlxJ6Opb2D0mYl*I7FQ
    INFO: The password for user snapshotrestore is +GGz2noZZr2qVUK7xbtqjUup049tvLq.
    WARNING: Wazuh indexer passwords changed. Remember to update the password in the Wazuh dashboard and Filebeat nodes if necessary, and restart the services.
    INFO: The password for Wazuh API user wazuh is JYWz5Zdb3Yq+uOzOPyUU4oat0n60VmWI
    INFO: The password for Wazuh API user wazuh-wui is +fLddaCiZePxh24*?jC0nyNmgMGCKE+2
    INFO: Updated wazuh-wui user password in wazuh dashboard. Remember to restart the service.
    ```

## Disable Wazuh Updates.

It is recommended to disable the Wazuh package repositories after installation to prevent accidental upgrades that could break the environment.

Execute the following command to disable the Wazuh repository:

```bash
sed -i "s/^deb /#deb /" /etc/apt/sources.list.d/wazuh.list
apt update
```