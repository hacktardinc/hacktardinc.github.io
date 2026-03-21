---
title: Step by step
description: Step by Step
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


# Step by step

## Wazuh indexer

Wazuh indexer is a highly scalable full-text search engine and offers advanced security, alerting, index management, deep performance analysis, and several other features.

Install and configure the Wazuh indexer as a single-node or multi-node cluster following step-by-step instructions. 

??? warning "Note:"

    You need root user privileges to run all the commands described below.

### Certificate creation

Wazuh uses certificates to establish confidentiality and encrypt communications between its central components. Follow these steps to create certificates for the Wazuh central components.

#### Generating the SSL certificates

1. Download the `wazuh-certs-tool.sh` script and the `config.yml` configuration file. This creates the certificates that encrypt communications between the Wazuh central components.

    ```bash
    curl -sO https://packages.wazuh.com/4.14/wazuh-certs-tool.sh
    curl -sO https://packages.wazuh.com/4.14/config.yml
    ```

2. Edit `./config.yml` and replace the node names and IP values with the corresponding names and IP addresses. You need to do this for all Wazuh server, Wazuh indexer, and Wazuh dashboard nodes. Add as many node fields as needed.


    ```yaml hl_lines="4 5 15 16 27 28"
    nodes:
    # Wazuh indexer nodes
    indexer:
        - name: node-1
        ip: "<indexer-node-ip>"
        #- name: node-2
        #  ip: "<indexer-node-ip>"
        #- name: node-3
        #  ip: "<indexer-node-ip>"

    # Wazuh server nodes
    # If there is more than one Wazuh server
    # node, each one must have a node_type
    server:
        - name: wazuh-1
        ip: "<wazuh-manager-ip>"
        #  node_type: master
        #- name: wazuh-2
        #  ip: "<wazuh-manager-ip>"
        #  node_type: worker
        #- name: wazuh-3
        #  ip: "<wazuh-manager-ip>"
        #  node_type: worker

    # Wazuh dashboard nodes
    dashboard:
        - name: dashboard
        ip: "<dashboard-node-ip>"
    ```

    ??? note

        To learn more about how to create and configure the certificates, see the Certificates deployment section.

3. Run `./wazuh-certs-tool.sh` to create the certificates. For a multi-node cluster, these certificates need to be later deployed to all Wazuh instances in your cluster.

    ```bash
    bash ./wazuh-certs-tool.sh -A
    ```

4. Compress all the necessary files.

    ```bash
    tar -cvf ./wazuh-certificates.tar -C ./wazuh-certificates/ .
    # rm -rf ./wazuh-certificates
    ```

5. Copy the `wazuh-certificates.tar` file to all the nodes, including the Wazuh indexer, Wazuh server, and Wazuh dashboard nodes. This can be done by using the `scp` utility.

### Wazuh indexer nodes installation

Follow these steps to install and configure a single-node or multi-node Wazuh indexer.

#### Installing package dependencies

Run the following command to install the following packages if missing:

```bash
apt-get install debconf adduser procps -y
```

#### Adding the Wazuh repository

1. Install the following packages if missing.

    ```bash
    apt-get install gnupg apt-transport-https -y
    ```

2. Install the GPG key.

    ```bash
    curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg
    ```

3. Add the repository.

    ```bash
    echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee -a /etc/apt/sources.list.d/wazuh.list
    ```

4. Update the packages information.

    ```bash
    apt-get update
    ```

#### Installing the Wazuh indexer

Install the Wazuh indexer package.

```bash
apt-get -y install wazuh-indexer
```

#### Configuring the Wazuh indexer

Edit `/etc/wazuh-indexer/opensearch.yml` and replace the following values:


=== "Before"
    ```yaml title="opensearch.yml"
    network.host: "0.0.0.0" # network.host (1)!
    node.name: "node-1" # node.name (2)!
    cluster.initial_master_nodes:
    - "node-1" # node-1 (3)!
    #- "node-2"
    #- "node-3"
    cluster.name: "wazuh-cluster"
    #discovery.seed_hosts:
    #  - "node-1-ip"
    #  - "node-2-ip"
    #  - "node-3-ip"
    node.max_local_storage_nodes: "3"
    path.data: /var/lib/wazuh-indexer
    path.logs: /var/log/wazuh-indexer

    plugins.security.ssl.http.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.http.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.http.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.transport.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.transport.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.transport.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.http.enabled: true
    plugins.security.ssl.transport.enforce_hostname_verification: false
    plugins.security.ssl.transport.resolve_hostname: false

    plugins.security.authcz.admin_dn:
    - "CN=admin,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.check_snapshot_restore_write_privileges: true
    plugins.security.enable_snapshot_restore_privilege: true
    plugins.security.nodes_dn:
    - "CN=node-1,OU=Wazuh,O=Wazuh,L=California,C=US" # node-1 (5)!
    #- "CN=node-2,OU=Wazuh,O=Wazuh,L=California,C=US"
    #- "CN=node-3,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.restapi.roles_enabled:
    - "all_access"
    - "security_rest_api_access"

    plugins.security.system_indices.enabled: true
    plugins.security.system_indices.indices: [".plugins-ml-model", ".plugins-ml-task", ".opendistro-alerting-config", ".opendistro-alerting-alert*", ".opendistro-anomaly-results*", ".opendistro-anomaly-detector*", ".opendistro-anomaly-checkpoints", ".opendistro-anomaly-detection-state", ".opendistro-reports-*", ".opensearch-notifications-*", ".opensearch-notebooks", ".opensearch-observability", ".opendistro-asynchronous-search-response*", ".replication-metadata-store"]

    ### Option to allow Filebeat-oss 7.10.2 to work ###
    compatibility.override_main_response_version: true# 
    ```

    1.  `network.host`: Sets the address of this node for both HTTP and transport traffic. The node will bind to this address and use it as its publish address. Accepts an IP address or a hostname.
    Use the same node address set in `config.yml` to create the SSL certificates.
    2.  `node.name`: Name of the Wazuh indexer node as defined in the `config.yml` file. For example, `node-1`.
    3.  `cluster.initial_master_nodes`: List of the names of the master-eligible nodes. These names are defined in the `config.yml` file. Uncomment the `node-2` and `node-3` lines, change the names, or add more lines, according to your `config.yml` definitions.
        ```bash
        cluster.initial_master_nodes:
        - "node-1"
        - "node-2"
        - "node-3"
        ```  
    4.  `discovery.seed_hosts:` List of the addresses of the master-eligible nodes. Each element can be either an IP address or a hostname. You may leave this setting commented if you are configuring the Wazuh indexer as a single node. For multi-node configurations, uncomment this setting and set the IP addresses of each master-eligible node.
        ```bash
        discovery.seed_hosts:
        - "10.0.0.1"
        - "10.0.0.2"
        - "10.0.0.3"
        ```
    5.  `plugins.security.nodes_dn`: List of the Distinguished Names of the certificates of all the Wazuh indexer cluster nodes. Uncomment the lines for `node-2` and `node-3` and change the common names (CN) and values according to your settings and your `config.yml` definitions.
        ```bash
        plugins.security.nodes_dn:
        - "CN=node-1,OU=Wazuh,O=Wazuh,L=California,C=US"
        - "CN=node-2,OU=Wazuh,O=Wazuh,L=California,C=US"
        - "CN=node-3,OU=Wazuh,O=Wazuh,L=California,C=US"
        ```

=== "After"
    ```yaml title="opensearch.yml"
    network.host: "192.168.10.60"
    node.name: "node-1"
    cluster.initial_master_nodes:
    - "node-1"
    #- "node-2"
    #- "node-3"
    cluster.name: "wazuh-cluster"
    #discovery.seed_hosts:
    #  - "node-1-ip"
    #  - "node-2-ip"
    #  - "node-3-ip"
    node.max_local_storage_nodes: "3"
    path.data: /var/lib/wazuh-indexer
    path.logs: /var/log/wazuh-indexer

    plugins.security.ssl.http.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.http.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.http.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.transport.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.transport.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.transport.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.http.enabled: true
    plugins.security.ssl.transport.enforce_hostname_verification: false
    plugins.security.ssl.transport.resolve_hostname: false

    plugins.security.authcz.admin_dn:
    - "CN=admin,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.check_snapshot_restore_write_privileges: true
    plugins.security.enable_snapshot_restore_privilege: true
    plugins.security.nodes_dn:
    - "CN=node-1,OU=Wazuh,O=Wazuh,L=California,C=US"
    #- "CN=node-2,OU=Wazuh,O=Wazuh,L=California,C=US"
    #- "CN=node-3,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.restapi.roles_enabled:
    - "all_access"
    - "security_rest_api_access"

    plugins.security.system_indices.enabled: true
    plugins.security.system_indices.indices: [".plugins-ml-model", ".plugins-ml-task", ".opendistro-alerting-config", ".opendistro-alerting-alert*", ".opendistro-anomaly-results*", ".opendistro-anomaly-detector*", ".opendistro-anomaly-checkpoints", ".opendistro-anomaly-detection-state", ".opendistro-reports-*", ".opensearch-notifications-*", ".opensearch-notebooks", ".opensearch-observability", ".opendistro-asynchronous-search-response*", ".replication-metadata-store"]

    ### Option to allow Filebeat-oss 7.10.2 to work ###
    compatibility.override_main_response_version: true
    ```

??? note

    Firewalls can block communication between Wazuh components on different hosts. Refer to the [Required ports](https://documentation.wazuh.com/current/getting-started/architecture.html#default-ports) section and ensure the necessary ports are open.

#### Deploying certificates

??? note

    Make sure that a copy of `wazuh-certificates.tar`, created in the previous stage of the installation process, is placed in your working directory.


Run the following commands replacing `<INDEXER_NODE_NAME>` with the name of the Wazuh indexer node you are configuring as defined in `config.yml`. For example, `node-1`. This deploys the SSL certificates to encrypt communications between the Wazuh central components.
    
```bash
NODE_NAME=<INDEXER_NODE_NAME>
```


```bash
mkdir /etc/wazuh-indexer/certs
tar -xf ./wazuh-certificates.tar -C /etc/wazuh-indexer/certs/ ./$NODE_NAME.pem ./$NODE_NAME-key.pem ./admin.pem ./admin-key.pem ./root-ca.pem
mv -n /etc/wazuh-indexer/certs/$NODE_NAME.pem /etc/wazuh-indexer/certs/indexer.pem
mv -n /etc/wazuh-indexer/certs/$NODE_NAME-key.pem /etc/wazuh-indexer/certs/indexer-key.pem
chmod 500 /etc/wazuh-indexer/certs
chmod 400 /etc/wazuh-indexer/certs/*
chown -R wazuh-indexer:wazuh-indexer /etc/wazuh-indexer/certs
```

#### Starting the service

Enable and start the Wazuh indexer service.

```bash
systemctl daemon-reload
systemctl enable wazuh-indexer
systemctl start wazuh-indexer
```

### Cluster initialization

The final stage of installing the Wazuh indexer single-node or multi-node cluster consists of running the security admin script.

Run the Wazuh indexer `indexer-security-init.sh` script on any Wazuh indexer node to load the new certificates information and start the single-node or multi-node cluster.

```bash
/usr/share/wazuh-indexer/bin/indexer-security-init.sh
```

??? Info "Note"

    You only have to initialize the cluster once, there is no need to run this command on every node.

#### Testing the cluster installation

Run the following commands to confirm that the installation is successful. Replace `<WAZUH_INDEXER_IP_ADDRESS>` with the IP address of the Wazuh indexer and enter admin as the password when prompted:

```bash
curl -k -u admin https://<WAZUH_INDEXER_IP_ADDRESS>:9200
```


```json title="Expected Output:"
{
  "name" : "node-1",
  "cluster_name" : "wazuh-cluster",
  "cluster_uuid" : "NZUePMrLTsWBlUken1jQ3w",
  "version" : {
    "number" : "7.10.2",
    "build_type" : "deb",
    "build_hash" : "ac8f6e0114b657a116c4a41c3e12f8e0e181bbcd",
    "build_date" : "2025-11-08T12:00:46.843930578Z",
    "build_snapshot" : false,
    "lucene_version" : "9.12.2",
    "minimum_wire_compatibility_version" : "7.10.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "The OpenSearch Project: https://opensearch.org/"
}

```

Run the following command to check if the cluster is working correctly. Replace `<WAZUH_INDEXER_IP_ADDRESS>` with the IP address of the Wazuh indexer and enter admin as the password when prompted:


```bash
curl -k -u admin https://<WAZUH_INDEXER_IP_ADDRESS>:9200/_cat/nodes
```

The command produces output similar to the following:

```json title="Expected Output:"
192.168.10.60 43 61 2 0.06 0.25 0.89 dimr cluster_manager,data,ingest,remote_cluster_client * node-1
```


??? example "Wazuh Indexer Installation Log"

    ```bash
    analyst@siem:~$ mkdir Wazuh
    analyst@siem:~$ cd Wazuh/
    analyst@siem:~/Wazuh$ sudo su
    [sudo] password for analyst:
    root@siem:/home/analyst/Wazuh# curl -sO https://packages.wazuh.com/4.14/wazuh-certs-tool.sh
    root@siem:/home/analyst/Wazuh# curl -sO https://packages.wazuh.com/4.14/config.yml
    root@siem:/home/analyst/Wazuh# cat config.yml
    nodes:
    # Wazuh indexer nodes
    indexer:
        - name: node-1
        ip: "<indexer-node-ip>"
        #- name: node-2
        #  ip: "<indexer-node-ip>"
        #- name: node-3
        #  ip: "<indexer-node-ip>"

    # Wazuh server nodes
    # If there is more than one Wazuh server
    # node, each one must have a node_type
    server:
        - name: wazuh-1
        ip: "<wazuh-manager-ip>"
        #  node_type: master
        #- name: wazuh-2
        #  ip: "<wazuh-manager-ip>"
        #  node_type: worker
        #- name: wazuh-3
        #  ip: "<wazuh-manager-ip>"
        #  node_type: worker

    # Wazuh dashboard nodes
    dashboard:
        - name: dashboard
        ip: "<dashboard-node-ip>"root@siem:/home/analyst/Wazuh# nano config.yml
    root@siem:/home/analyst/Wazuh# cat config.yml
    nodes:
    # Wazuh indexer nodes
    indexer:
        - name: node-1
        ip: "192.168.10.60"
        #- name: node-2
        #  ip: "<indexer-node-ip>"
        #- name: node-3
        #  ip: "<indexer-node-ip>"

    # Wazuh server nodes
    # If there is more than one Wazuh server
    # node, each one must have a node_type
    server:
        - name: wazuh-1
        ip: "192.168.10.60"
        #  node_type: master
        #- name: wazuh-2
        #  ip: "<wazuh-manager-ip>"
        #  node_type: worker
        #- name: wazuh-3
        #  ip: "<wazuh-manager-ip>"
        #  node_type: worker

    # Wazuh dashboard nodes
    dashboard:
        - name: dashboard
        ip: "192.168.10.60"
    root@siem:/home/analyst/Wazuh# bash ./wazuh-certs-tool.sh -A
    23/11/2025 12:36:12 INFO: Verbose logging redirected to /home/analyst/Wazuh/wazuh-certificates-tool.log
    23/11/2025 12:36:12 INFO: Generating the root certificate.
    23/11/2025 12:36:13 INFO: Generating Admin certificates.
    23/11/2025 12:36:13 INFO: Admin certificates created.
    23/11/2025 12:36:13 INFO: Generating Wazuh indexer certificates.
    23/11/2025 12:36:13 INFO: Wazuh indexer certificates created.
    23/11/2025 12:36:13 INFO: Generating Filebeat certificates.
    23/11/2025 12:36:14 INFO: Wazuh Filebeat certificates created.
    23/11/2025 12:36:14 INFO: Generating Wazuh dashboard certificates.
    23/11/2025 12:36:14 INFO: Wazuh dashboard certificates created.
    root@siem:/home/analyst/Wazuh# tar -cvf ./wazuh-certificates.tar -C ./wazuh-certificates/ .
    ./
    ./node-1-key.pem
    ./wazuh-1.pem
    ./admin.pem
    ./wazuh-1-key.pem
    ./root-ca.pem
    ./root-ca.key
    ./admin-key.pem
    ./dashboard-key.pem
    ./dashboard.pem
    ./node-1.pem
    root@siem:/home/analyst/Wazuh# apt-get install debconf adduser procps -y
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    debconf is already the newest version (1.5.86ubuntu1).
    debconf set to manually installed.
    adduser is already the newest version (3.137ubuntu1).
    adduser set to manually installed.
    procps is already the newest version (2:4.0.4-4ubuntu3.2).
    procps set to manually installed.
    0 upgraded, 0 newly installed, 0 to remove and 1 not upgraded.
    root@siem:/home/analyst/Wazuh# apt-get install gnupg apt-transport-https -y
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    gnupg is already the newest version (2.4.4-2ubuntu17.3).
    gnupg set to manually installed.
    The following NEW packages will be installed:
    apt-transport-https
    0 upgraded, 1 newly installed, 0 to remove and 1 not upgraded.
    Need to get 3,970 B of archives.
    After this operation, 36.9 kB of additional disk space will be used.
    Get:1 http://ke.archive.ubuntu.com/ubuntu noble-updates/universe amd64 apt-transport-https all 2.8.3 [3,970 B]
    Fetched 3,970 B in 0s (9,756 B/s)
    Selecting previously unselected package apt-transport-https.
    (Reading database ... 88915 files and directories currently installed.)
    Preparing to unpack .../apt-transport-https_2.8.3_all.deb ...
    Unpacking apt-transport-https (2.8.3) ...
    Setting up apt-transport-https (2.8.3) ...
    Scanning processes...
    Scanning linux images...

    Running kernel seems to be up-to-date.

    No services need to be restarted.

    No containers need to be restarted.

    No user sessions are running outdated binaries.

    No VM guests are running outdated hypervisor (qemu) binaries on this host.
    root@siem:/home/analyst/Wazuh# curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg
    gpg: keyring '/usr/share/keyrings/wazuh.gpg' created
    gpg: directory '/root/.gnupg' created
    gpg: /root/.gnupg/trustdb.gpg: trustdb created
    gpg: key 96B3EE5F29111145: public key "Wazuh.com (Wazuh Signing Key) <support@wazuh.com>" imported
    gpg: Total number processed: 1
    gpg:               imported: 1
    root@siem:/home/analyst/Wazuh# echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee -a /etc/apt/sources.list.d/wazuh.list
    deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main
    root@siem:/home/analyst/Wazuh# apt-get update
    Hit:1 http://ke.archive.ubuntu.com/ubuntu noble InRelease
    Get:2 https://packages.wazuh.com/4.x/apt stable InRelease [17.3 kB]
    Get:3 https://packages.wazuh.com/4.x/apt stable/main amd64 Packages [49.4 kB]
    Get:4 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]
    Hit:5 http://ke.archive.ubuntu.com/ubuntu noble-updates InRelease
    Hit:6 http://ke.archive.ubuntu.com/ubuntu noble-backports InRelease
    Get:7 http://security.ubuntu.com/ubuntu noble-security/main amd64 Components [21.5 kB]
    Get:8 http://security.ubuntu.com/ubuntu noble-security/restricted amd64 Components [212 B]
    Get:9 http://security.ubuntu.com/ubuntu noble-security/universe amd64 Components [52.2 kB]
    Get:10 http://security.ubuntu.com/ubuntu noble-security/multiverse amd64 Components [212 B]
    Fetched 267 kB in 2s (127 kB/s)
    Reading package lists... Done
    root@siem:/home/analyst/Wazuh# apt-get -y install wazuh-indexer
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    The following NEW packages will be installed:
    wazuh-indexer
    0 upgraded, 1 newly installed, 0 to remove and 1 not upgraded.
    Need to get 856 MB of archives.
    After this operation, 1,082 MB of additional disk space will be used.
    Get:1 https://packages.wazuh.com/4.x/apt stable/main amd64 wazuh-indexer amd64 4.14.1-1 [856 MB]
    Fetched 856 MB in 4min 46s (2,998 kB/s)
    Selecting previously unselected package wazuh-indexer.
    (Reading database ... 88919 files and directories currently installed.)
    Preparing to unpack .../wazuh-indexer_4.14.1-1_amd64.deb ...
    Running Wazuh Indexer Pre-Installation Script
    Unpacking wazuh-indexer (4.14.1-1) ...
    Setting up wazuh-indexer (4.14.1-1) ...
    Running Wazuh Indexer Post-Installation Script
    ### NOT starting on installation, please execute the following statements to configure wazuh-indexer service to start automatically using systemd
    sudo systemctl daemon-reload
    sudo systemctl enable wazuh-indexer.service
    ### You can start wazuh-indexer service by executing
    sudo systemctl start wazuh-indexer.service
    Scanning processes...
    Scanning linux images...

    Running kernel seems to be up-to-date.

    No services need to be restarted.

    No containers need to be restarted.

    No user sessions are running outdated binaries.

    No VM guests are running outdated hypervisor (qemu) binaries on this host.
    root@siem:/home/analyst/Wazuh# cat /etc/wazuh-indexer/opensearch.yml
    network.host: "0.0.0.0"
    node.name: "node-1"
    cluster.initial_master_nodes:
    - "node-1"
    #- "node-2"
    #- "node-3"
    cluster.name: "wazuh-cluster"
    #discovery.seed_hosts:
    #  - "node-1-ip"
    #  - "node-2-ip"
    #  - "node-3-ip"
    node.max_local_storage_nodes: "3"
    path.data: /var/lib/wazuh-indexer
    path.logs: /var/log/wazuh-indexer

    plugins.security.ssl.http.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.http.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.http.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.transport.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.transport.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.transport.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.http.enabled: true
    plugins.security.ssl.transport.enforce_hostname_verification: false
    plugins.security.ssl.transport.resolve_hostname: false

    plugins.security.authcz.admin_dn:
    - "CN=admin,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.check_snapshot_restore_write_privileges: true
    plugins.security.enable_snapshot_restore_privilege: true
    plugins.security.nodes_dn:
    - "CN=node-1,OU=Wazuh,O=Wazuh,L=California,C=US"
    #- "CN=node-2,OU=Wazuh,O=Wazuh,L=California,C=US"
    #- "CN=node-3,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.restapi.roles_enabled:
    - "all_access"
    - "security_rest_api_access"

    plugins.security.system_indices.enabled: true
    plugins.security.system_indices.indices: [".plugins-ml-model", ".plugins-ml-task", ".opendistro-alerting-config", ".opendistro-alerting-alert*", ".opendistro-anomaly-results*", ".opendistro-anomaly-detector*", ".opendistro-anomaly-checkpoints", ".opendistro-anomaly-detection-state", ".opendistro-reports-*", ".opensearch-notifications-*", ".opensearch-notebooks", ".opensearch-observability", ".opendistro-asynchronous-search-response*", ".replication-metadata-store"]

    ### Option to allow Filebeat-oss 7.10.2 to work ###
    compatibility.override_main_response_version: trueroot@siem:/home/analyst/Wazuh#
    root@siem:/home/analyst/Wazuh# nano /etc/wazuh-indexer/opensearch.yml
    root@siem:/home/analyst/Wazuh# cat /etc/wazuh-indexer/opensearch.yml
    network.host: "192.168.10.60"
    node.name: "node-1"
    cluster.initial_master_nodes:
    - "node-1"
    #- "node-2"
    #- "node-3"
    cluster.name: "wazuh-cluster"
    #discovery.seed_hosts:
    #  - "node-1-ip"
    #  - "node-2-ip"
    #  - "node-3-ip"
    node.max_local_storage_nodes: "3"
    path.data: /var/lib/wazuh-indexer
    path.logs: /var/log/wazuh-indexer

    plugins.security.ssl.http.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.http.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.http.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.transport.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
    plugins.security.ssl.transport.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
    plugins.security.ssl.transport.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
    plugins.security.ssl.http.enabled: true
    plugins.security.ssl.transport.enforce_hostname_verification: false
    plugins.security.ssl.transport.resolve_hostname: false

    plugins.security.authcz.admin_dn:
    - "CN=admin,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.check_snapshot_restore_write_privileges: true
    plugins.security.enable_snapshot_restore_privilege: true
    plugins.security.nodes_dn:
    - "CN=node-1,OU=Wazuh,O=Wazuh,L=California,C=US"
    #- "CN=node-2,OU=Wazuh,O=Wazuh,L=California,C=US"
    #- "CN=node-3,OU=Wazuh,O=Wazuh,L=California,C=US"
    plugins.security.restapi.roles_enabled:
    - "all_access"
    - "security_rest_api_access"

    plugins.security.system_indices.enabled: true
    plugins.security.system_indices.indices: [".plugins-ml-model", ".plugins-ml-task", ".opendistro-alerting-config", ".opendistro-alerting-alert*", ".opendistro-anomaly-results*", ".opendistro-anomaly-detector*", ".opendistro-anomaly-checkpoints", ".opendistro-anomaly-detection-state", ".opendistro-reports-*", ".opensearch-notifications-*", ".opensearch-notebooks", ".opensearch-observability", ".opendistro-asynchronous-search-response*", ".replication-metadata-store"]

    ### Option to allow Filebeat-oss 7.10.2 to work ###
    compatibility.override_main_response_version: true
    root@siem:/home/analyst/Wazuh# mkdir /etc/wazuh-indexer/certs
    root@siem:/home/analyst/Wazuh# tar -xf ./wazuh-certificates.tar -C /etc/wazuh-indexer/certs/ ./node-1.pem ./node-1-key.pem ./admin.pem ./admin-key.pem ./root-ca.pem
    root@siem:/home/analyst/Wazuh# mv -n /etc/wazuh-indexer/certs/node-1.pem /etc/wazuh-indexer/certs/indexer.pem
    root@siem:/home/analyst/Wazuh# mv -n /etc/wazuh-indexer/certs/node-1-key.pem /etc/wazuh-indexer/certs/indexer-key.pem
    root@siem:/home/analyst/Wazuh# chmod 500 /etc/wazuh-indexer/certs
    root@siem:/home/analyst/Wazuh# chmod 400 /etc/wazuh-indexer/certs/*
    root@siem:/home/analyst/Wazuh# chown -R wazuh-indexer:wazuh-indexer /etc/wazuh-indexer/certs
    root@siem:/home/analyst/Wazuh# systemctl daemon-reload
    root@siem:/home/analyst/Wazuh# systemctl enable wazuh-indexer
    Synchronizing state of wazuh-indexer.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
    Executing: /usr/lib/systemd/systemd-sysv-install enable wazuh-indexer
    Created symlink /etc/systemd/system/multi-user.target.wants/wazuh-indexer.service → /usr/lib/systemd/system/wazuh-indexer.service.
    root@siem:/home/analyst/Wazuh# systemctl start wazuh-indexer
    root@siem:/home/analyst/Wazuh# systemctl status wazuh-indexer
    ● wazuh-indexer.service - wazuh-indexer
        Loaded: loaded (/usr/lib/systemd/system/wazuh-indexer.service; enabled; preset: enabled)
        Active: active (running) since Sun 2025-11-23 12:50:09 UTC; 13s ago
        Docs: https://documentation.wazuh.com
    Main PID: 9461 (java)
        Tasks: 64 (limit: 8167)
        Memory: 1.3G (peak: 1.3G)
            CPU: 44.245s
        CGroup: /system.slice/wazuh-indexer.service
                └─9461 /usr/share/wazuh-indexer/jdk/bin/java -Xshare:auto -Dopensearch.networkaddress.cache.ttl=60 -Dopensearch.networkaddress.cache.negative.ttl=10 -XX:+AlwaysPreTouch -Xss1m -Djava.awt.headless=true -Dfile.encoding=U>

    Nov 23 12:49:57 siem systemd-entrypoint[9461]: WARNING: System::setSecurityManager has been called by org.opensearch.bootstrap.OpenSearch (file:/usr/share/wazuh-indexer/lib/opensearch-2.19.3.jar)
    Nov 23 12:49:57 siem systemd-entrypoint[9461]: WARNING: Please consider reporting this to the maintainers of org.opensearch.bootstrap.OpenSearch
    Nov 23 12:49:57 siem systemd-entrypoint[9461]: WARNING: System::setSecurityManager will be removed in a future release
    Nov 23 12:49:57 siem systemd-entrypoint[9461]: Nov 23, 2025 12:49:57 PM sun.util.locale.provider.LocaleProviderAdapter <clinit>
    Nov 23 12:49:57 siem systemd-entrypoint[9461]: WARNING: COMPAT locale provider will be removed in a future release
    Nov 23 12:49:58 siem systemd-entrypoint[9461]: WARNING: A terminally deprecated method in java.lang.System has been called
    Nov 23 12:49:58 siem systemd-entrypoint[9461]: WARNING: System::setSecurityManager has been called by org.opensearch.bootstrap.Security (file:/usr/share/wazuh-indexer/lib/opensearch-2.19.3.jar)
    Nov 23 12:49:58 siem systemd-entrypoint[9461]: WARNING: Please consider reporting this to the maintainers of org.opensearch.bootstrap.Security
    Nov 23 12:49:58 siem systemd-entrypoint[9461]: WARNING: System::setSecurityManager will be removed in a future release
    Nov 23 12:50:09 siem systemd[1]: Started wazuh-indexer.service - wazuh-indexer.
    root@siem:/home/analyst/Wazuh# /usr/share/wazuh-indexer/bin/indexer-security-init.sh
    Security Admin v7
    Will connect to 192.168.10.60:9200 ... done
    Connected as "CN=admin,OU=Wazuh,O=Wazuh,L=California,C=US"
    OpenSearch Version: 2.19.3
    Contacting opensearch cluster 'opensearch' and wait for YELLOW clusterstate ...
    Clustername: wazuh-cluster
    Clusterstate: GREEN
    Number of nodes: 1
    Number of data nodes: 1
    .opendistro_security index does not exists, attempt to create it ... done (0-all replicas)
    Populate config from /etc/wazuh-indexer/opensearch-security/
    Will update '/config' with /etc/wazuh-indexer/opensearch-security/config.yml
    SUCC: Configuration for 'config' created or updated
    Will update '/roles' with /etc/wazuh-indexer/opensearch-security/roles.yml
    SUCC: Configuration for 'roles' created or updated
    Will update '/rolesmapping' with /etc/wazuh-indexer/opensearch-security/roles_mapping.yml
    SUCC: Configuration for 'rolesmapping' created or updated
    Will update '/internalusers' with /etc/wazuh-indexer/opensearch-security/internal_users.yml
    SUCC: Configuration for 'internalusers' created or updated
    Will update '/actiongroups' with /etc/wazuh-indexer/opensearch-security/action_groups.yml
    SUCC: Configuration for 'actiongroups' created or updated
    Will update '/tenants' with /etc/wazuh-indexer/opensearch-security/tenants.yml
    SUCC: Configuration for 'tenants' created or updated
    Will update '/nodesdn' with /etc/wazuh-indexer/opensearch-security/nodes_dn.yml
    SUCC: Configuration for 'nodesdn' created or updated
    Will update '/whitelist' with /etc/wazuh-indexer/opensearch-security/whitelist.yml
    SUCC: Configuration for 'whitelist' created or updated
    Will update '/audit' with /etc/wazuh-indexer/opensearch-security/audit.yml
    SUCC: Configuration for 'audit' created or updated
    Will update '/allowlist' with /etc/wazuh-indexer/opensearch-security/allowlist.yml
    SUCC: Configuration for 'allowlist' created or updated
    SUCC: Expected 10 config types for node {"updated_config_types":["allowlist","tenants","rolesmapping","nodesdn","audit","roles","whitelist","actiongroups","config","internalusers"],"updated_config_size":10,"message":null} is 10 (["allowlist","tenants","rolesmapping","nodesdn","audit","roles","whitelist","actiongroups","config","internalusers"]) due to: null
    Done with success
    root@siem:/home/analyst/Wazuh# /usr/share/wazuh-indexer/bin/indexer-security-init.sh
    ^C
    root@siem:/home/analyst/Wazuh# curl -k -u admin https://192.168.10.60:9200
    Enter host password for user 'admin':
    {
    "name" : "node-1",
    "cluster_name" : "wazuh-cluster",
    "cluster_uuid" : "AJMYWNXORy6QU0srk2lgRA",
    "version" : {
        "number" : "7.10.2",
        "build_type" : "deb",
        "build_hash" : "ac8f6e0114b657a116c4a41c3e12f8e0e181bbcd",
        "build_date" : "2025-11-08T12:00:46.843930578Z",
        "build_snapshot" : false,
        "lucene_version" : "9.12.2",
        "minimum_wire_compatibility_version" : "7.10.0",
        "minimum_index_compatibility_version" : "7.0.0"
    },
    "tagline" : "The OpenSearch Project: https://opensearch.org/"
    }
    root@siem:/home/analyst/Wazuh# curl -k -u admin https://192.168.10.60:9200/_cat/nodes
    Enter host password for user 'admin':
    192.168.10.60 43 61 2 0.06 0.25 0.89 dimr cluster_manager,data,ingest,remote_cluster_client * node-1
    root@siem:/home/analyst/Wazuh#
    ```

## Wazuh server

### Wazuh server node installation

Follow these steps to install a single-node or multi-node cluster Wazuh server.

#### Installing the Wazuh manager

Install the Wazuh manager package.

```bash
apt-get -y install wazuh-manager
```

#### Installing Filebeat

Install the Filebeat package.

```bash
apt-get -y install filebeat
```

#### Configuring Filebeat

1. Download the preconfigured Filebeat configuration file.

    ```bash
    curl -so /etc/filebeat/filebeat.yml https://packages.wazuh.com/4.14/tpl/wazuh/filebeat/filebeat.yml
    ```

2. Edit the `/etc/filebeat/filebeat.yml` configuration file and replace the following value:

    ```bash title="filebeat.yml"
    # Wazuh - Filebeat configuration file
    output.elasticsearch:
    hosts: ["127.0.0.1:9200"] # hosts (1)!
    protocol: https
    username: ${username}
    password: ${password}
    ssl.certificate_authorities:
        - /etc/filebeat/certs/root-ca.pem
    ssl.certificate: "/etc/filebeat/certs/filebeat.pem"
    ssl.key: "/etc/filebeat/certs/filebeat-key.pem"
    setup.template.json.enabled: true
    setup.template.json.path: '/etc/filebeat/wazuh-template.json'
    setup.template.json.name: 'wazuh'
    setup.ilm.overwrite: true
    setup.ilm.enabled: false

    filebeat.modules:
    - module: wazuh
        alerts:
        enabled: true
        archives:
        enabled: false

    logging.level: info
    logging.to_files: true
    logging.files:
    path: /var/log/filebeat
    name: filebeat
    keepfiles: 7
    permissions: 0644

    logging.metrics.enabled: false

    seccomp:
    default_action: allow
    syscalls:
    - action: allow
        names:
        - rseq
    ```


    1.  `hosts`: The list of Wazuh indexer nodes to connect to. You can use either IP addresses or hostnames. By default, the host is set to localhost `hosts: ["127.0.0.1:9200"]`. Replace your Wazuh indexer IP address accordingly.
    If you have more than one Wazuh indexer node, you can separate the addresses using commas. For example, `hosts: ["10.0.0.1:9200", "10.0.0.2:9200", "10.0.0.3:9200"]`

        
3. Create a Filebeat keystore to securely store authentication credentials.
    
    ```bash
    filebeat keystore create
    ```

4. Add the default username and password `admin`:`admin` to the secrets keystore.
    
    ```bash
    echo admin | filebeat keystore add username --stdin --force
    echo admin | filebeat keystore add password --stdin --force
    ```

5. Download the alerts template for the Wazuh indexer.
    
    ```bash
    curl -so /etc/filebeat/wazuh-template.json https://raw.githubusercontent.com/wazuh/wazuh/v4.14.1/extensions/elasticsearch/7.x/wazuh-template.json
    chmod go+r /etc/filebeat/wazuh-template.json
    ```

6. Install the Wazuh module for Filebeat.
    
    ```bash
    curl -s https://packages.wazuh.com/4.x/filebeat/wazuh-filebeat-0.4.tar.gz | tar -xvz -C /usr/share/filebeat/module
    ```

#### Deploying certificates

Replace `<SERVER_NODE_NAME>` with your Wazuh server node certificate name, the same one used in `config.yml` when creating the certificates. Then, move the certificates to their corresponding location.

```bash
NODE_NAME=<SERVER_NODE_NAME>
```


```bash
mkdir /etc/filebeat/certs
tar -xf ./wazuh-certificates.tar -C /etc/filebeat/certs/ ./$NODE_NAME.pem ./$NODE_NAME-key.pem ./root-ca.pem
mv -n /etc/filebeat/certs/$NODE_NAME.pem /etc/filebeat/certs/filebeat.pem
mv -n /etc/filebeat/certs/$NODE_NAME-key.pem /etc/filebeat/certs/filebeat-key.pem
chmod 500 /etc/filebeat/certs
chmod 400 /etc/filebeat/certs/*
chown -R root:root /etc/filebeat/certs
```

#### Configuring the Wazuh indexer connection

1. Save the Wazuh indexer username and password into the Wazuh manager keystore using the wazuh-keystore tool. Replace `<WAZUH_INDEXER_USERNAME>` and `<WAZUH_INDEXER_PASSWORD>` with the Wazuh indexer username and password:

    ```bash
    echo '<INDEXER_USERNAME>' | /var/ossec/bin/wazuh-keystore -f indexer -k username
    echo '<INDEXER_PASSWORD>' | /var/ossec/bin/wazuh-keystore -f indexer -k password
    ```

    ??? note

        The default step-by-step installation credentials are `admin:admin`

2. Edit `/var/ossec/etc/ossec.conf` to configure the indexer connection.
By default, the indexer settings have one host configured. It's set to `0.0.0.0` as highlighted below.

=== "Before"
    ```bash
    <indexer>
        <enabled>yes</enabled>
        <hosts>
        <host>https://0.0.0.0:9200</host> # hosts (1)!
        </hosts>
        <ssl>
        <certificate_authorities> # certificate_authorities (2)!
            <ca>/etc/filebeat/certs/root-ca.pem</ca>
        </certificate_authorities>
        <certificate>/etc/filebeat/certs/filebeat.pem</certificate>
        <key>/etc/filebeat/certs/filebeat-key.pem</key>
        </ssl>
    </indexer>
    ```

    1.  Replace 0.0.0.0 with your Wazuh indexer node IP address or hostname. You can find this value in the Filebeat config file /etc/filebeat/filebeat.yml.
    2.  Ensure the Filebeat certificate and key name match the certificate files in `/etc/filebeat/certs`.


=== "After"
    ```xml
    <indexer>
        <enabled>yes</enabled>
        <hosts>
        <host>https://192.168.10.60:9200</host>
        </hosts>
        <ssl>
        <certificate_authorities>
            <ca>/etc/filebeat/certs/root-ca.pem</ca>
        </certificate_authorities>
        <certificate>/etc/filebeat/certs/filebeat.pem</certificate>
        <key>/etc/filebeat/certs/filebeat-key.pem</key>
        </ssl>
    </indexer>
    ```

    ??? tip "For Wazuh indexer cluster:"

        If you are running a Wazuh indexer cluster infrastructure, add a `<host>` entry for each one of your nodes. For example, in a two-node configuration:

        ```xml
        <hosts>
        <host>https://10.0.0.1:9200</host>
        <host>https://10.0.0.2:9200</host>
        </hosts>
        ```

        The Wazuh server prioritizes reporting to the first Wazuh indexer node in the list. It switches to the next node in case it is not available.

#### Starting the Wazuh manager

1. Enable and start the Wazuh manager service.

    ```bash
    systemctl daemon-reload
    systemctl enable wazuh-manager
    systemctl start wazuh-manager
    ```

2. Run the following command to verify the Wazuh manager status.

    ```bash
    systemctl status wazuh-manager
    ```

#### Starting the Filebeat service

1. Enable and start the Filebeat service.

    ```bash
    systemctl daemon-reload
    systemctl enable filebeat
    systemctl start filebeat
    ```

2. Run the following command to verify that Filebeat is successfully installed.

    ```bash
    filebeat test output
    ```

    Expected Output

    ```json
    elasticsearch: https://192.168.10.40:9200...
    parse url... OK
    connection...
        parse host... OK
        dns lookup... OK
        addresses: 192.168.10.40
        dial up... OK
    TLS...
        security: server's certificate chain verification is enabled
        handshake... OK
        TLS version: TLSv1.3
        dial up... OK
    talk to server... OK
    version: 7.10.2
    ```

    Your Wazuh server node is now successfully installed. 


??? example "Wazuh Server Installation Log"

    ```bash
    root@siem:/home/analyst/Wazuh# apt-get -y install wazuh-manager filebeat
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    Suggested packages:
    expect
    The following NEW packages will be installed:
    filebeat wazuh-manager
    0 upgraded, 2 newly installed, 0 to remove and 1 not upgraded.
    Need to get 475 MB of archives.
    After this operation, 1,118 MB of additional disk space will be used.
    Get:1 https://packages.wazuh.com/4.x/apt stable/main amd64 filebeat amd64 7.10.2-2 [22.1 MB]
    Get:2 https://packages.wazuh.com/4.x/apt stable/main amd64 wazuh-manager amd64 4.14.1-1 [453 MB]
    Fetched 475 MB in 2min 39s (2,992 kB/s)
    Selecting previously unselected package filebeat.
    (Reading database ... 90105 files and directories currently installed.)
    Preparing to unpack .../filebeat_7.10.2-2_amd64.deb ...
    Unpacking filebeat (7.10.2-2) ...
    Selecting previously unselected package wazuh-manager.
    Preparing to unpack .../wazuh-manager_4.14.1-1_amd64.deb ...
    Unpacking wazuh-manager (4.14.1-1) ...
    Setting up wazuh-manager (4.14.1-1) ...
    Setting up filebeat (7.10.2-2) ...
    Scanning processes...
    Scanning linux images...

    Running kernel seems to be up-to-date.

    No services need to be restarted.

    No containers need to be restarted.

    No user sessions are running outdated binaries.

    No VM guests are running outdated hypervisor (qemu) binaries on this host.
    root@siem:/home/analyst/Wazuh# curl -so /etc/filebeat/filebeat.yml https://packages.wazuh.com/4.14/tpl/wazuh/filebeat/filebeat.yml
    root@siem:/home/analyst/Wazuh# cat /etc/filebeat/filebeat.yml
    # Wazuh - Filebeat configuration file
    output.elasticsearch:
    hosts: ["127.0.0.1:9200"]
    protocol: https
    username: ${username}
    password: ${password}
    ssl.certificate_authorities:
        - /etc/filebeat/certs/root-ca.pem
    ssl.certificate: "/etc/filebeat/certs/filebeat.pem"
    ssl.key: "/etc/filebeat/certs/filebeat-key.pem"
    setup.template.json.enabled: true
    setup.template.json.path: '/etc/filebeat/wazuh-template.json'
    setup.template.json.name: 'wazuh'
    setup.ilm.overwrite: true
    setup.ilm.enabled: false

    filebeat.modules:
    - module: wazuh
        alerts:
        enabled: true
        archives:
        enabled: false

    logging.level: info
    logging.to_files: true
    logging.files:
    path: /var/log/filebeat
    name: filebeat
    keepfiles: 7
    permissions: 0644

    logging.metrics.enabled: false

    seccomp:
    default_action: allow
    syscalls:
    - action: allow
        names:
        - rseq
    root@siem:/home/analyst/Wazuh# nano /etc/filebeat/filebeat.yml
    root@siem:/home/analyst/Wazuh# cat /etc/filebeat/filebeat.yml
    # Wazuh - Filebeat configuration file
    output.elasticsearch:
    hosts: ["192.168.10.60:9200"]
    protocol: https
    username: ${username}
    password: ${password}
    ssl.certificate_authorities:
        - /etc/filebeat/certs/root-ca.pem
    ssl.certificate: "/etc/filebeat/certs/filebeat.pem"
    ssl.key: "/etc/filebeat/certs/filebeat-key.pem"
    setup.template.json.enabled: true
    setup.template.json.path: '/etc/filebeat/wazuh-template.json'
    setup.template.json.name: 'wazuh'
    setup.ilm.overwrite: true
    setup.ilm.enabled: false

    filebeat.modules:
    - module: wazuh
        alerts:
        enabled: true
        archives:
        enabled: false

    logging.level: info
    logging.to_files: true
    logging.files:
    path: /var/log/filebeat
    name: filebeat
    keepfiles: 7
    permissions: 0644

    logging.metrics.enabled: false

    seccomp:
    default_action: allow
    syscalls:
    - action: allow
        names:
        - rseq
    root@siem:/home/analyst/Wazuh# filebeat keystore create
    Created filebeat keystore
    root@siem:/home/analyst/Wazuh# echo admin | filebeat keystore add username --stdin --force
    Successfully updated the keystore
    root@siem:/home/analyst/Wazuh# echo admin | filebeat keystore add password --stdin --force
    Successfully updated the keystore
    root@siem:/home/analyst/Wazuh# curl -so /etc/filebeat/wazuh-template.json https://raw.githubusercontent.com/wazuh/wazuh/v4.14.1/extensions/elasticsearch/7.x/wazuh-template.json
    root@siem:/home/analyst/Wazuh# chmod go+r /etc/filebeat/wazuh-template.json
    root@siem:/home/analyst/Wazuh# curl -s https://packages.wazuh.com/4.x/filebeat/wazuh-filebeat-0.4.tar.gz | tar -xvz -C /usr/share/filebeat/module
    wazuh/
    wazuh/alerts/
    wazuh/alerts/ingest/
    wazuh/alerts/ingest/pipeline.json
    wazuh/alerts/manifest.yml
    wazuh/alerts/config/
    wazuh/alerts/config/alerts.yml
    wazuh/_meta/
    wazuh/_meta/docs.asciidoc
    wazuh/_meta/config.yml
    wazuh/_meta/fields.yml
    wazuh/module.yml
    wazuh/archives/
    wazuh/archives/ingest/
    wazuh/archives/ingest/pipeline.json
    wazuh/archives/manifest.yml
    wazuh/archives/config/
    wazuh/archives/config/archives.yml
    root@siem:/home/analyst/Wazuh# mkdir /etc/filebeat/certs
    root@siem:/home/analyst/Wazuh# tar -xf ./wazuh-certificates.tar -C /etc/filebeat/certs/ ./node-1.pem ./node-1-key.pem ./root-ca.pem
    root@siem:/home/analyst/Wazuh# mv -n /etc/filebeat/certs/node-1.pem /etc/filebeat/certs/filebeat.pem
    root@siem:/home/analyst/Wazuh# mv -n /etc/filebeat/certs/node-1-key.pem /etc/filebeat/certs/filebeat-key.pem
    root@siem:/home/analyst/Wazuh# chmod 500 /etc/filebeat/certs
    root@siem:/home/analyst/Wazuh# chmod 400 /etc/filebeat/certs/*
    root@siem:/home/analyst/Wazuh# chown -R root:root /etc/filebeat/certs
    root@siem:/home/analyst/Wazuh# echo 'admin' | /var/ossec/bin/wazuh-keystore -f indexer -k username
    root@siem:/home/analyst/Wazuh# echo '7Dx4HzhnUYe8s5EoBBHQ' | /var/ossec/bin/wazuh-keystore -f indexer -k password
    root@siem:/home/analyst/Wazuh# cat /var/ossec/etc/ossec.conf
    <!--
    Wazuh - Manager - Default configuration for ubuntu 24.04
    More info at: https://documentation.wazuh.com
    Mailing list: https://groups.google.com/forum/#!forum/wazuh
    -->

    <ossec_config>
    <global>
        <jsonout_output>yes</jsonout_output>
        <alerts_log>yes</alerts_log>
        <logall>no</logall>
        <logall_json>no</logall_json>
        <email_notification>no</email_notification>
        <smtp_server>smtp.example.wazuh.com</smtp_server>
        <email_from>wazuh@example.wazuh.com</email_from>
        <email_to>recipient@example.wazuh.com</email_to>
        <email_maxperhour>12</email_maxperhour>
        <email_log_source>alerts.log</email_log_source>
        <agents_disconnection_time>15m</agents_disconnection_time>
        <agents_disconnection_alert_time>0</agents_disconnection_alert_time>
        <update_check>yes</update_check>
    </global>

    <alerts>
        <log_alert_level>3</log_alert_level>
        <email_alert_level>12</email_alert_level>
    </alerts>

    <!-- Choose between "plain", "json", or "plain,json" for the format of internal logs -->
    <logging>
        <log_format>plain</log_format>
    </logging>

    <remote>
        <connection>secure</connection>
        <port>1514</port>
        <protocol>tcp</protocol>
        <queue_size>131072</queue_size>
    </remote>

    <!-- Policy monitoring -->
    <rootcheck>
        <disabled>no</disabled>
        <check_files>yes</check_files>
        <check_trojans>yes</check_trojans>
        <check_dev>yes</check_dev>
        <check_sys>yes</check_sys>
        <check_pids>yes</check_pids>
        <check_ports>yes</check_ports>
        <check_if>yes</check_if>

        <!-- Frequency that rootcheck is executed - every 12 hours -->
        <frequency>43200</frequency>

        <rootkit_files>etc/rootcheck/rootkit_files.txt</rootkit_files>
        <rootkit_trojans>etc/rootcheck/rootkit_trojans.txt</rootkit_trojans>

        <skip_nfs>yes</skip_nfs>

        <ignore>/var/lib/containerd</ignore>
        <ignore>/var/lib/docker/overlay2</ignore>
    </rootcheck>

    <wodle name="cis-cat">
        <disabled>yes</disabled>
        <timeout>1800</timeout>
        <interval>1d</interval>
        <scan-on-start>yes</scan-on-start>

        <java_path>wodles/java</java_path>
        <ciscat_path>wodles/ciscat</ciscat_path>
    </wodle>

    <!-- Osquery integration -->
    <wodle name="osquery">
        <disabled>yes</disabled>
        <run_daemon>yes</run_daemon>
        <log_path>/var/log/osquery/osqueryd.results.log</log_path>
        <config_path>/etc/osquery/osquery.conf</config_path>
        <add_labels>yes</add_labels>
    </wodle>

    <!-- System inventory -->
    <wodle name="syscollector">
        <disabled>no</disabled>
        <interval>1h</interval>
        <scan_on_start>yes</scan_on_start>
        <hardware>yes</hardware>
        <os>yes</os>
        <network>yes</network>
        <packages>yes</packages>
        <ports all="yes">yes</ports>
        <processes>yes</processes>
        <users>yes</users>
        <groups>yes</groups>
        <services>yes</services>
        <browser_extensions>yes</browser_extensions>

        <!-- Database synchronization settings -->
        <synchronization>
        <max_eps>10</max_eps>
        </synchronization>
    </wodle>

    <sca>
        <enabled>yes</enabled>
        <scan_on_start>yes</scan_on_start>
        <interval>12h</interval>
        <skip_nfs>yes</skip_nfs>
    </sca>

    <vulnerability-detection>
        <enabled>yes</enabled>
        <index-status>yes</index-status>
        <feed-update-interval>60m</feed-update-interval>
    </vulnerability-detection>

    <indexer>
        <enabled>yes</enabled>
        <hosts>
        <host>https://0.0.0.0:9200</host>
        </hosts>
        <ssl>
        <certificate_authorities>
            <ca>/etc/filebeat/certs/root-ca.pem</ca>
        </certificate_authorities>
        <certificate>/etc/filebeat/certs/filebeat.pem</certificate>
        <key>/etc/filebeat/certs/filebeat-key.pem</key>
        </ssl>
    </indexer>

    <!-- File integrity monitoring -->
    <syscheck>
        <disabled>no</disabled>

        <!-- Frequency that syscheck is executed default every 12 hours -->
        <frequency>43200</frequency>

        <scan_on_start>yes</scan_on_start>

        <!-- Generate alert when new file detected -->
        <alert_new_files>yes</alert_new_files>

        <!-- Don't ignore files that change more than 'frequency' times -->
        <auto_ignore frequency="10" timeframe="3600">no</auto_ignore>

        <!-- Directories to check  (perform all possible verifications) -->
        <directories>/etc,/usr/bin,/usr/sbin</directories>
        <directories>/bin,/sbin,/boot</directories>

        <!-- Files/directories to ignore -->
        <ignore>/etc/mtab</ignore>
        <ignore>/etc/hosts.deny</ignore>
        <ignore>/etc/mail/statistics</ignore>
        <ignore>/etc/random-seed</ignore>
        <ignore>/etc/random.seed</ignore>
        <ignore>/etc/adjtime</ignore>
        <ignore>/etc/httpd/logs</ignore>
        <ignore>/etc/utmpx</ignore>
        <ignore>/etc/wtmpx</ignore>
        <ignore>/etc/cups/certs</ignore>
        <ignore>/etc/dumpdates</ignore>
        <ignore>/etc/svc/volatile</ignore>

        <!-- File types to ignore -->
        <ignore type="sregex">.log$|.swp$</ignore>

        <!-- Check the file, but never compute the diff -->
        <nodiff>/etc/ssl/private.key</nodiff>

        <skip_nfs>yes</skip_nfs>
        <skip_dev>yes</skip_dev>
        <skip_proc>yes</skip_proc>
        <skip_sys>yes</skip_sys>

        <!-- Nice value for Syscheck process -->
        <process_priority>10</process_priority>

        <!-- Maximum output throughput -->
        <max_eps>50</max_eps>

        <!-- Database synchronization settings -->
        <synchronization>
        <enabled>yes</enabled>
        <interval>5m</interval>
        <max_eps>10</max_eps>
        </synchronization>
    </syscheck>

    <!-- Active response -->
    <global>
        <white_list>127.0.0.1</white_list>
        <white_list>^localhost.localdomain$</white_list>
        <white_list>127.0.0.53</white_list>
    </global>

    <command>
        <name>disable-account</name>
        <executable>disable-account</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>restart-wazuh</name>
        <executable>restart-wazuh</executable>
    </command>

    <command>
        <name>firewall-drop</name>
        <executable>firewall-drop</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>host-deny</name>
        <executable>host-deny</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>route-null</name>
        <executable>route-null</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>win_route-null</name>
        <executable>route-null.exe</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>netsh</name>
        <executable>netsh.exe</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <!--
    <active-response>
        active-response options here
    </active-response>
    -->

    <!-- Log analysis -->
    <localfile>
        <log_format>command</log_format>
        <command>df -P</command>
        <frequency>360</frequency>
    </localfile>

    <localfile>
        <log_format>full_command</log_format>
        <command>netstat -tulpn | sed 's/\([[:alnum:]]\+\)\ \+[[:digit:]]\+\ \+[[:digit:]]\+\ \+\(.*\):\([[:digit:]]*\)\ \+\([0-9\.\:\*]\+\).\+\ \([[:digit:]]*\/[[:alnum:]\-]*\).*/\1 \2 == \3 == \4 \5/' | sort -k 4 -g | sed 's/ == \(.*\) ==/:\1/' | sed 1,2d</command>
        <alias>netstat listening ports</alias>
        <frequency>360</frequency>
    </localfile>

    <localfile>
        <log_format>full_command</log_format>
        <command>last -n 20</command>
        <frequency>360</frequency>
    </localfile>

    <ruleset>
        <!-- Default ruleset -->
        <decoder_dir>ruleset/decoders</decoder_dir>
        <rule_dir>ruleset/rules</rule_dir>
        <rule_exclude>0215-policy_rules.xml</rule_exclude>
        <list>etc/lists/audit-keys</list>
        <list>etc/lists/amazon/aws-eventnames</list>
        <list>etc/lists/security-eventchannel</list>
        <list>etc/lists/malicious-ioc/malware-hashes</list>
        <list>etc/lists/malicious-ioc/malicious-ip</list>
        <list>etc/lists/malicious-ioc/malicious-domains</list>

        <!-- User-defined ruleset -->
        <decoder_dir>etc/decoders</decoder_dir>
        <rule_dir>etc/rules</rule_dir>
    </ruleset>

    <rule_test>
        <enabled>yes</enabled>
        <threads>1</threads>
        <max_sessions>64</max_sessions>
        <session_timeout>15m</session_timeout>
    </rule_test>

    <!-- Configuration for wazuh-authd -->
    <auth>
        <disabled>no</disabled>
        <port>1515</port>
        <use_source_ip>no</use_source_ip>
        <purge>yes</purge>
        <use_password>no</use_password>
        <ciphers>HIGH:!ADH:!EXP:!MD5:!RC4:!3DES:!CAMELLIA:@STRENGTH</ciphers>
        <!-- <ssl_agent_ca></ssl_agent_ca> -->
        <ssl_verify_host>no</ssl_verify_host>
        <ssl_manager_cert>etc/sslmanager.cert</ssl_manager_cert>
        <ssl_manager_key>etc/sslmanager.key</ssl_manager_key>
        <ssl_auto_negotiate>no</ssl_auto_negotiate>
    </auth>

    <cluster>
        <name>wazuh</name>
        <node_name>node01</node_name>
        <node_type>master</node_type>
        <key></key>
        <port>1516</port>
        <bind_addr>0.0.0.0</bind_addr>
        <nodes>
            <node>NODE_IP</node>
        </nodes>
        <hidden>no</hidden>
        <disabled>yes</disabled>
    </cluster>

    </ossec_config>

    <ossec_config>
    <localfile>
        <log_format>journald</log_format>
        <location>journald</location>
    </localfile>

    <localfile>
        <log_format>syslog</log_format>
        <location>/var/ossec/logs/active-responses.log</location>
    </localfile>

    <localfile>
        <log_format>syslog</log_format>
        <location>/var/log/dpkg.log</location>
    </localfile>

    </ossec_config>
    root@siem:/home/analyst/Wazuh# nano /var/ossec/etc/ossec.conf
    root@siem:/home/analyst/Wazuh# cat /var/ossec/etc/ossec.conf
    <!--
    Wazuh - Manager - Default configuration for ubuntu 24.04
    More info at: https://documentation.wazuh.com
    Mailing list: https://groups.google.com/forum/#!forum/wazuh
    -->

    <ossec_config>
    <global>
        <jsonout_output>yes</jsonout_output>
        <alerts_log>yes</alerts_log>
        <logall>no</logall>
        <logall_json>no</logall_json>
        <email_notification>no</email_notification>
        <smtp_server>smtp.example.wazuh.com</smtp_server>
        <email_from>wazuh@example.wazuh.com</email_from>
        <email_to>recipient@example.wazuh.com</email_to>
        <email_maxperhour>12</email_maxperhour>
        <email_log_source>alerts.log</email_log_source>
        <agents_disconnection_time>15m</agents_disconnection_time>
        <agents_disconnection_alert_time>0</agents_disconnection_alert_time>
        <update_check>yes</update_check>
    </global>

    <alerts>
        <log_alert_level>3</log_alert_level>
        <email_alert_level>12</email_alert_level>
    </alerts>

    <!-- Choose between "plain", "json", or "plain,json" for the format of internal logs -->
    <logging>
        <log_format>plain</log_format>
    </logging>

    <remote>
        <connection>secure</connection>
        <port>1514</port>
        <protocol>tcp</protocol>
        <queue_size>131072</queue_size>
    </remote>

    <!-- Policy monitoring -->
    <rootcheck>
        <disabled>no</disabled>
        <check_files>yes</check_files>
        <check_trojans>yes</check_trojans>
        <check_dev>yes</check_dev>
        <check_sys>yes</check_sys>
        <check_pids>yes</check_pids>
        <check_ports>yes</check_ports>
        <check_if>yes</check_if>

        <!-- Frequency that rootcheck is executed - every 12 hours -->
        <frequency>43200</frequency>

        <rootkit_files>etc/rootcheck/rootkit_files.txt</rootkit_files>
        <rootkit_trojans>etc/rootcheck/rootkit_trojans.txt</rootkit_trojans>

        <skip_nfs>yes</skip_nfs>

        <ignore>/var/lib/containerd</ignore>
        <ignore>/var/lib/docker/overlay2</ignore>
    </rootcheck>

    <wodle name="cis-cat">
        <disabled>yes</disabled>
        <timeout>1800</timeout>
        <interval>1d</interval>
        <scan-on-start>yes</scan-on-start>

        <java_path>wodles/java</java_path>
        <ciscat_path>wodles/ciscat</ciscat_path>
    </wodle>

    <!-- Osquery integration -->
    <wodle name="osquery">
        <disabled>yes</disabled>
        <run_daemon>yes</run_daemon>
        <log_path>/var/log/osquery/osqueryd.results.log</log_path>
        <config_path>/etc/osquery/osquery.conf</config_path>
        <add_labels>yes</add_labels>
    </wodle>

    <!-- System inventory -->
    <wodle name="syscollector">
        <disabled>no</disabled>
        <interval>1h</interval>
        <scan_on_start>yes</scan_on_start>
        <hardware>yes</hardware>
        <os>yes</os>
        <network>yes</network>
        <packages>yes</packages>
        <ports all="yes">yes</ports>
        <processes>yes</processes>
        <users>yes</users>
        <groups>yes</groups>
        <services>yes</services>
        <browser_extensions>yes</browser_extensions>

        <!-- Database synchronization settings -->
        <synchronization>
        <max_eps>10</max_eps>
        </synchronization>
    </wodle>

    <sca>
        <enabled>yes</enabled>
        <scan_on_start>yes</scan_on_start>
        <interval>12h</interval>
        <skip_nfs>yes</skip_nfs>
    </sca>

    <vulnerability-detection>
        <enabled>yes</enabled>
        <index-status>yes</index-status>
        <feed-update-interval>60m</feed-update-interval>
    </vulnerability-detection>

    <indexer>
        <enabled>yes</enabled>
        <hosts>
        <host>https://192.168.10.60:9200</host>
        </hosts>
        <ssl>
        <certificate_authorities>
            <ca>/etc/filebeat/certs/root-ca.pem</ca>
        </certificate_authorities>
        <certificate>/etc/filebeat/certs/filebeat.pem</certificate>
        <key>/etc/filebeat/certs/filebeat-key.pem</key>
        </ssl>
    </indexer>

    <!-- File integrity monitoring -->
    <syscheck>
        <disabled>no</disabled>

        <!-- Frequency that syscheck is executed default every 12 hours -->
        <frequency>43200</frequency>

        <scan_on_start>yes</scan_on_start>

        <!-- Generate alert when new file detected -->
        <alert_new_files>yes</alert_new_files>

        <!-- Don't ignore files that change more than 'frequency' times -->
        <auto_ignore frequency="10" timeframe="3600">no</auto_ignore>

        <!-- Directories to check  (perform all possible verifications) -->
        <directories>/etc,/usr/bin,/usr/sbin</directories>
        <directories>/bin,/sbin,/boot</directories>

        <!-- Files/directories to ignore -->
        <ignore>/etc/mtab</ignore>
        <ignore>/etc/hosts.deny</ignore>
        <ignore>/etc/mail/statistics</ignore>
        <ignore>/etc/random-seed</ignore>
        <ignore>/etc/random.seed</ignore>
        <ignore>/etc/adjtime</ignore>
        <ignore>/etc/httpd/logs</ignore>
        <ignore>/etc/utmpx</ignore>
        <ignore>/etc/wtmpx</ignore>
        <ignore>/etc/cups/certs</ignore>
        <ignore>/etc/dumpdates</ignore>
        <ignore>/etc/svc/volatile</ignore>

        <!-- File types to ignore -->
        <ignore type="sregex">.log$|.swp$</ignore>

        <!-- Check the file, but never compute the diff -->
        <nodiff>/etc/ssl/private.key</nodiff>

        <skip_nfs>yes</skip_nfs>
        <skip_dev>yes</skip_dev>
        <skip_proc>yes</skip_proc>
        <skip_sys>yes</skip_sys>

        <!-- Nice value for Syscheck process -->
        <process_priority>10</process_priority>

        <!-- Maximum output throughput -->
        <max_eps>50</max_eps>

        <!-- Database synchronization settings -->
        <synchronization>
        <enabled>yes</enabled>
        <interval>5m</interval>
        <max_eps>10</max_eps>
        </synchronization>
    </syscheck>

    <!-- Active response -->
    <global>
        <white_list>127.0.0.1</white_list>
        <white_list>^localhost.localdomain$</white_list>
        <white_list>127.0.0.53</white_list>
    </global>

    <command>
        <name>disable-account</name>
        <executable>disable-account</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>restart-wazuh</name>
        <executable>restart-wazuh</executable>
    </command>

    <command>
        <name>firewall-drop</name>
        <executable>firewall-drop</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>host-deny</name>
        <executable>host-deny</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>route-null</name>
        <executable>route-null</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>win_route-null</name>
        <executable>route-null.exe</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <command>
        <name>netsh</name>
        <executable>netsh.exe</executable>
        <timeout_allowed>yes</timeout_allowed>
    </command>

    <!--
    <active-response>
        active-response options here
    </active-response>
    -->

    <!-- Log analysis -->
    <localfile>
        <log_format>command</log_format>
        <command>df -P</command>
        <frequency>360</frequency>
    </localfile>

    <localfile>
        <log_format>full_command</log_format>
        <command>netstat -tulpn | sed 's/\([[:alnum:]]\+\)\ \+[[:digit:]]\+\ \+[[:digit:]]\+\ \+\(.*\):\([[:digit:]]*\)\ \+\([0-9\.\:\*]\+\).\+\ \([[:digit:]]*\/[[:alnum:]\-]*\).*/\1 \2 == \3 == \4 \5/' | sort -k 4 -g | sed 's/ == \(.*\) ==/:\1/' | sed 1,2d</command>
        <alias>netstat listening ports</alias>
        <frequency>360</frequency>
    </localfile>

    <localfile>
        <log_format>full_command</log_format>
        <command>last -n 20</command>
        <frequency>360</frequency>
    </localfile>

    <ruleset>
        <!-- Default ruleset -->
        <decoder_dir>ruleset/decoders</decoder_dir>
        <rule_dir>ruleset/rules</rule_dir>
        <rule_exclude>0215-policy_rules.xml</rule_exclude>
        <list>etc/lists/audit-keys</list>
        <list>etc/lists/amazon/aws-eventnames</list>
        <list>etc/lists/security-eventchannel</list>
        <list>etc/lists/malicious-ioc/malware-hashes</list>
        <list>etc/lists/malicious-ioc/malicious-ip</list>
        <list>etc/lists/malicious-ioc/malicious-domains</list>

        <!-- User-defined ruleset -->
        <decoder_dir>etc/decoders</decoder_dir>
        <rule_dir>etc/rules</rule_dir>
    </ruleset>

    <rule_test>
        <enabled>yes</enabled>
        <threads>1</threads>
        <max_sessions>64</max_sessions>
        <session_timeout>15m</session_timeout>
    </rule_test>

    <!-- Configuration for wazuh-authd -->
    <auth>
        <disabled>no</disabled>
        <port>1515</port>
        <use_source_ip>no</use_source_ip>
        <purge>yes</purge>
        <use_password>no</use_password>
        <ciphers>HIGH:!ADH:!EXP:!MD5:!RC4:!3DES:!CAMELLIA:@STRENGTH</ciphers>
        <!-- <ssl_agent_ca></ssl_agent_ca> -->
        <ssl_verify_host>no</ssl_verify_host>
        <ssl_manager_cert>etc/sslmanager.cert</ssl_manager_cert>
        <ssl_manager_key>etc/sslmanager.key</ssl_manager_key>
        <ssl_auto_negotiate>no</ssl_auto_negotiate>
    </auth>

    <cluster>
        <name>wazuh</name>
        <node_name>node01</node_name>
        <node_type>master</node_type>
        <key></key>
        <port>1516</port>
        <bind_addr>0.0.0.0</bind_addr>
        <nodes>
            <node>NODE_IP</node>
        </nodes>
        <hidden>no</hidden>
        <disabled>yes</disabled>
    </cluster>

    </ossec_config>

    <ossec_config>
    <localfile>
        <log_format>journald</log_format>
        <location>journald</location>
    </localfile>

    <localfile>
        <log_format>syslog</log_format>
        <location>/var/ossec/logs/active-responses.log</location>
    </localfile>

    <localfile>
        <log_format>syslog</log_format>
        <location>/var/log/dpkg.log</location>
    </localfile>

    </ossec_config>
    root@siem:/home/analyst/Wazuh# systemctl daemon-reload
    root@siem:/home/analyst/Wazuh# systemctl enable wazuh-manager
    Created symlink /etc/systemd/system/multi-user.target.wants/wazuh-manager.service → /usr/lib/systemd/system/wazuh-manager.service.
    root@siem:/home/analyst/Wazuh# systemctl start wazuh-manager
    root@siem:/home/analyst/Wazuh# systemctl status wazuh-manager
    ● wazuh-manager.service - Wazuh manager
        Loaded: loaded (/usr/lib/systemd/system/wazuh-manager.service; enabled; preset: enabled)
        Active: active (running) since Sun 2025-11-23 13:28:21 UTC; 9s ago
        Process: 72257 ExecStart=/usr/bin/env /var/ossec/bin/wazuh-control start (code=exited, status=0/SUCCESS)
        Tasks: 238 (limit: 8167)
        Memory: 1.8G (peak: 1.8G)
            CPU: 39.550s
        CGroup: /system.slice/wazuh-manager.service
                ├─72355 /var/ossec/framework/python/bin/python3 /var/ossec/api/scripts/wazuh_apid.py
                ├─72394 /var/ossec/bin/wazuh-authd
                ├─72406 /var/ossec/framework/python/bin/python3 /var/ossec/api/scripts/wazuh_apid.py
                ├─72407 /var/ossec/framework/python/bin/python3 /var/ossec/api/scripts/wazuh_apid.py
                ├─72410 /var/ossec/framework/python/bin/python3 /var/ossec/api/scripts/wazuh_apid.py
                ├─72413 /var/ossec/framework/python/bin/python3 /var/ossec/api/scripts/wazuh_apid.py
                ├─72426 /var/ossec/bin/wazuh-db
                ├─72472 /var/ossec/bin/wazuh-execd
                ├─72492 /var/ossec/bin/wazuh-analysisd
                ├─72511 /var/ossec/bin/wazuh-syscheckd
                ├─72585 /var/ossec/bin/wazuh-remoted
                ├─72627 /var/ossec/bin/wazuh-logcollector
                ├─72643 /var/ossec/bin/wazuh-monitord
                └─72661 /var/ossec/bin/wazuh-modulesd

    Nov 23 13:28:17 siem env[72257]: Started wazuh-syscheckd...
    Nov 23 13:28:18 siem env[72257]: Started wazuh-remoted...
    Nov 23 13:28:18 siem env[72257]: Started wazuh-logcollector...
    Nov 23 13:28:19 siem env[72257]: Started wazuh-monitord...
    Nov 23 13:28:19 siem env[72659]: 2025/11/23 13:28:19 wazuh-modulesd:router: INFO: Loaded router module.
    Nov 23 13:28:19 siem env[72659]: 2025/11/23 13:28:19 wazuh-modulesd:content_manager: INFO: Loaded content_manager module.
    Nov 23 13:28:19 siem env[72659]: 2025/11/23 13:28:19 wazuh-modulesd:inventory-harvester: INFO: Loaded Inventory harvester module.
    Nov 23 13:28:19 siem env[72257]: Started wazuh-modulesd...
    Nov 23 13:28:21 siem env[72257]: Completed.
    Nov 23 13:28:21 siem systemd[1]: Started wazuh-manager.service - Wazuh manager.
    root@siem:/home/analyst/Wazuh# systemctl daemon-reload
    root@siem:/home/analyst/Wazuh# systemctl enable filebeat
    Synchronizing state of filebeat.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
    Executing: /usr/lib/systemd/systemd-sysv-install enable filebeat
    Created symlink /etc/systemd/system/multi-user.target.wants/filebeat.service → /usr/lib/systemd/system/filebeat.service.
    root@siem:/home/analyst/Wazuh# systemctl start filebeat
    root@siem:/home/analyst/Wazuh# systemctl status filebeat
    ● filebeat.service - Filebeat sends log files to Logstash or directly to Elasticsearch.
        Loaded: loaded (/usr/lib/systemd/system/filebeat.service; enabled; preset: enabled)
        Active: active (running) since Sun 2025-11-23 13:28:51 UTC; 8s ago
        Docs: https://www.elastic.co/products/beats/filebeat
    Main PID: 75064 (filebeat)
        Tasks: 9 (limit: 8167)
        Memory: 12.5M (peak: 13.1M)
            CPU: 142ms
        CGroup: /system.slice/filebeat.service
                └─75064 /usr/share/filebeat/bin/filebeat --environment systemd -c /etc/filebeat/filebeat.yml --path.home /usr/share/filebeat --path.config /etc/filebeat --path.data /var/lib/filebeat --path.logs /var/log/filebeat

    Nov 23 13:28:51 siem systemd[1]: Started filebeat.service - Filebeat sends log files to Logstash or directly to Elasticsearch..
    root@siem:/home/analyst/Wazuh# filebeat test output
    elasticsearch: https://192.168.10.60:9200...
    parse url... OK
    connection...
        parse host... OK
        dns lookup... OK
        addresses: 192.168.10.60
        dial up... OK
    TLS...
        security: server's certificate chain verification is enabled
        handshake... OK
        TLS version: TLSv1.3
        dial up... OK
    talk to server... OK
    version: 7.10.2
    root@siem:/home/analyst/Wazuh#
    ```


## Wazuh dashboard

The Wazuh dashboard is a web interface for mining and visualizing the Wazuh server alerts and archived events.

Install and configure the Wazuh dashboard following step-by-step instructions.

### Wazuh dashboard installation

Follow these steps to install the Wazuh dashboard.

#### Installing package dependencies

1. Install the following packages if missing.

```bash
apt-get install debhelper tar curl libcap2-bin #debhelper version 9 or later
```

#### Installing the Wazuh dashboard

Install the Wazuh dashboard package.

```bash
apt-get -y install wazuh-dashboard
```

#### Configuring the Wazuh dashboard

Edit the `/etc/wazuh-dashboard/opensearch_dashboards.yml` file and replace the following values:

```yaml
server.host: 0.0.0.0 # server.host (1)!
server.port: 443
opensearch.hosts: https://localhost:9200 # opensearch.hosts (2)!
opensearch.ssl.verificationMode: certificate
```

1.  `server.host`: This setting specifies the host of the Wazuh dashboard server. To allow remote users to connect, set the value to the IP address or DNS name of the Wazuh dashboard server. The value `0.0.0.0` will accept all the available IP addresses of the host.
2.  `opensearch.hosts`: The URLs of the Wazuh indexer instances to use for all your queries. The Wazuh dashboard can be configured to connect to multiple Wazuh indexer nodes in the same cluster. The addresses of the nodes can be separated by commas. For example, `["https://10.0.0.2:9200", "https://10.0.0.3:9200","https://10.0.0.4:9200"]

#### Deploying certificates

Replace `<DASHBOARD_NODE_NAME>` with your Wazuh dashboard node name, the same one used in `config.yml` to create the certificates, and move the certificates to their corresponding location.

```bash
NODE_NAME=<DASHBOARD_NODE_NAME>
```

```bash
mkdir /etc/wazuh-dashboard/certs
tar -xf ./wazuh-certificates.tar -C /etc/wazuh-dashboard/certs/ ./$NODE_NAME.pem ./$NODE_NAME-key.pem ./root-ca.pem
mv -n /etc/wazuh-dashboard/certs/$NODE_NAME.pem /etc/wazuh-dashboard/certs/dashboard.pem
mv -n /etc/wazuh-dashboard/certs/$NODE_NAME-key.pem /etc/wazuh-dashboard/certs/dashboard-key.pem
chmod 500 /etc/wazuh-dashboard/certs
chmod 400 /etc/wazuh-dashboard/certs/*
chown -R wazuh-dashboard:wazuh-dashboard /etc/wazuh-dashboard/certs
```

#### Starting the Wazuh dashboard service

Enable and start the Wazuh dashboard service.

```bash
systemctl daemon-reload
systemctl enable wazuh-dashboard
systemctl start wazuh-dashboard
```

Edit the /usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml file and replace `<WAZUH_SERVER_IP_ADDRESS>` with the IP address or hostname of the Wazuh server master node.

=== "Before"
    ```yaml
    hosts:
    - default:
        url: https://<WAZUH_SERVER_IP_ADDRESS>
        port: 55000
        username: wazuh-wui
        password: wazuh-wui
        run_as: false
    ```
=== "After"
    ```yaml
    hosts:
    - default:
        url: https://192.168.10.60
        port: 55000
        username: wazuh-wui
        password: wazuh-wui
        run_as: false
    ```


Access the Wazuh web interface with your `admin` user credentials. This is the default administrator account for the Wazuh indexer and it allows you to access the Wazuh dashboard.

- **URL**: `https://<WAZUH_DASHBOARD_IP_ADDRESS>`
- **Username**: `admin`
- **Password**: `admin`

![image](https://gist.github.com/user-attachments/assets/3995e214-41c9-40db-af85-b3abf67d0ff8)

??? info

    When you access the Wazuh dashboard for the first time, the browser shows a warning message stating that the certificate was not issued by a trusted authority. An exception can be added in the advanced options of the web browser. For increased security, the `root-ca.pem` file previously generated can be imported to the certificate manager of the browser. Alternatively, you can configure a certificate from a trusted authority.


??? example "Wazuh Dashboard Installation Log"

    ```bash
    root@siem:/home/analyst/Wazuh# apt-get install debhelper tar curl libcap2-bin
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    tar is already the newest version (1.35+dfsg-3build1).
    tar set to manually installed.
    curl is already the newest version (8.5.0-2ubuntu10.6).
    curl set to manually installed.
    libcap2-bin is already the newest version (1:2.66-5ubuntu2.2).
    libcap2-bin set to manually installed.
    The following additional packages will be installed:
    autoconf automake autopoint autotools-dev binutils binutils-common binutils-x86-64-linux-gnu build-essential bzip2 cpp cpp-13 cpp-13-x86-64-linux-gnu cpp-x86-64-linux-gnu debugedit dh-autoreconf dh-strip-nondeterminism dpkg-dev
    dwz fakeroot g++ g++-13 g++-13-x86-64-linux-gnu g++-x86-64-linux-gnu gcc gcc-13 gcc-13-base gcc-13-x86-64-linux-gnu gcc-x86-64-linux-gnu gettext intltool-debian libalgorithm-diff-perl libalgorithm-diff-xs-perl
    libalgorithm-merge-perl libarchive-cpio-perl libarchive-zip-perl libasan8 libatomic1 libbinutils libcc1-0 libctf-nobfd0 libctf0 libdebhelper-perl libdpkg-perl libfakeroot libfile-fcntllock-perl libfile-stripnondeterminism-perl
    libgcc-13-dev libgomp1 libgprofng0 libhwasan0 libisl23 libitm1 liblsan0 libltdl-dev libltdl7 libmail-sendmail-perl libmpc3 libquadmath0 libsframe1 libstdc++-13-dev libsub-override-perl libsys-hostname-long-perl libtool libtsan2
    libubsan1 lto-disabled-list m4 make po-debconf
    Suggested packages:
    autoconf-archive gnu-standards autoconf-doc binutils-doc gprofng-gui bzip2-doc cpp-doc gcc-13-locales cpp-13-doc dh-make debian-keyring g++-multilib g++-13-multilib gcc-13-doc gcc-multilib flex bison gdb gcc-doc gcc-13-multilib
    gdb-x86-64-linux-gnu gettext-doc libasprintf-dev libgettextpo-dev bzr libtool-doc libstdc++-13-doc gfortran | fortran95-compiler gcj-jdk m4-doc make-doc libmail-box-perl
    The following NEW packages will be installed:
    autoconf automake autopoint autotools-dev binutils binutils-common binutils-x86-64-linux-gnu build-essential bzip2 cpp cpp-13 cpp-13-x86-64-linux-gnu cpp-x86-64-linux-gnu debhelper debugedit dh-autoreconf dh-strip-nondeterminism
    dpkg-dev dwz fakeroot g++ g++-13 g++-13-x86-64-linux-gnu g++-x86-64-linux-gnu gcc gcc-13 gcc-13-base gcc-13-x86-64-linux-gnu gcc-x86-64-linux-gnu gettext intltool-debian libalgorithm-diff-perl libalgorithm-diff-xs-perl
    libalgorithm-merge-perl libarchive-cpio-perl libarchive-zip-perl libasan8 libatomic1 libbinutils libcc1-0 libctf-nobfd0 libctf0 libdebhelper-perl libdpkg-perl libfakeroot libfile-fcntllock-perl libfile-stripnondeterminism-perl
    libgcc-13-dev libgomp1 libgprofng0 libhwasan0 libisl23 libitm1 liblsan0 libltdl-dev libltdl7 libmail-sendmail-perl libmpc3 libquadmath0 libsframe1 libstdc++-13-dev libsub-override-perl libsys-hostname-long-perl libtool libtsan2
    libubsan1 lto-disabled-list m4 make po-debconf
    0 upgraded, 70 newly installed, 0 to remove and 1 not upgraded.
    Need to get 71.3 MB of archives.
    After this operation, 242 MB of additional disk space will be used.
    Do you want to continue? [Y/n] Y
    Get:1 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 m4 amd64 1.4.19-4build1 [244 kB]
    Get:2 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 autoconf all 2.71-3 [339 kB]
    Get:3 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 autotools-dev all 20220109.1 [44.9 kB]
    Get:4 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 automake all 1:1.16.5-1.3ubuntu1 [558 kB]
    Get:5 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 autopoint all 0.21-14ubuntu2 [422 kB]
    Get:6 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 binutils-common amd64 2.42-4ubuntu2.6 [240 kB]
    Get:7 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libsframe1 amd64 2.42-4ubuntu2.6 [15.6 kB]
    Get:8 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libbinutils amd64 2.42-4ubuntu2.6 [577 kB]
    Get:9 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libctf-nobfd0 amd64 2.42-4ubuntu2.6 [97.9 kB]
    Get:10 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libctf0 amd64 2.42-4ubuntu2.6 [94.5 kB]
    Get:11 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgprofng0 amd64 2.42-4ubuntu2.6 [849 kB]
    Get:12 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 binutils-x86-64-linux-gnu amd64 2.42-4ubuntu2.6 [2,463 kB]
    Get:13 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 binutils amd64 2.42-4ubuntu2.6 [18.1 kB]
    Get:14 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 gcc-13-base amd64 13.3.0-6ubuntu2~24.04 [51.5 kB]
    Get:15 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libisl23 amd64 0.26-3build1.1 [680 kB]
    Get:16 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libmpc3 amd64 1.3.1-1build1.1 [54.6 kB]
    Get:17 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 cpp-13-x86-64-linux-gnu amd64 13.3.0-6ubuntu2~24.04 [10.7 MB]
    Get:18 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 cpp-13 amd64 13.3.0-6ubuntu2~24.04 [1,038 B]
    Get:19 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 cpp-x86-64-linux-gnu amd64 4:13.2.0-7ubuntu1 [5,326 B]
    Get:20 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 cpp amd64 4:13.2.0-7ubuntu1 [22.4 kB]
    Get:21 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libcc1-0 amd64 14.2.0-4ubuntu2~24.04 [48.0 kB]
    Get:22 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgomp1 amd64 14.2.0-4ubuntu2~24.04 [148 kB]
    Get:23 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libitm1 amd64 14.2.0-4ubuntu2~24.04 [29.7 kB]
    Get:24 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libatomic1 amd64 14.2.0-4ubuntu2~24.04 [10.5 kB]
    Get:25 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libasan8 amd64 14.2.0-4ubuntu2~24.04 [3,031 kB]
    Get:26 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 liblsan0 amd64 14.2.0-4ubuntu2~24.04 [1,322 kB]
    Get:27 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libtsan2 amd64 14.2.0-4ubuntu2~24.04 [2,772 kB]
    Get:28 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libubsan1 amd64 14.2.0-4ubuntu2~24.04 [1,184 kB]
    Get:29 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libhwasan0 amd64 14.2.0-4ubuntu2~24.04 [1,641 kB]
    Get:30 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libquadmath0 amd64 14.2.0-4ubuntu2~24.04 [153 kB]
    Get:31 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgcc-13-dev amd64 13.3.0-6ubuntu2~24.04 [2,681 kB]
    Get:32 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 gcc-13-x86-64-linux-gnu amd64 13.3.0-6ubuntu2~24.04 [21.1 MB]
    Get:33 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 gcc-13 amd64 13.3.0-6ubuntu2~24.04 [494 kB]
    Get:34 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 gcc-x86-64-linux-gnu amd64 4:13.2.0-7ubuntu1 [1,212 B]
    Get:35 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 gcc amd64 4:13.2.0-7ubuntu1 [5,018 B]
    Get:36 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libstdc++-13-dev amd64 13.3.0-6ubuntu2~24.04 [2,420 kB]
    Get:37 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 g++-13-x86-64-linux-gnu amd64 13.3.0-6ubuntu2~24.04 [12.2 MB]
    Get:38 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 g++-13 amd64 13.3.0-6ubuntu2~24.04 [16.1 kB]
    Get:39 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 g++-x86-64-linux-gnu amd64 4:13.2.0-7ubuntu1 [964 B]
    Get:40 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 g++ amd64 4:13.2.0-7ubuntu1 [1,100 B]
    Get:41 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 make amd64 4.3-4.1build2 [180 kB]
    Get:42 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libdpkg-perl all 1.22.6ubuntu6.5 [269 kB]
    Get:43 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 bzip2 amd64 1.0.8-5.1build0.1 [34.5 kB]
    Get:44 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 lto-disabled-list all 47 [12.4 kB]
    Get:45 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 dpkg-dev all 1.22.6ubuntu6.5 [1,074 kB]
    Get:46 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 build-essential amd64 12.10ubuntu1 [4,928 B]
    Get:47 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libdebhelper-perl all 13.14.1ubuntu5 [89.8 kB]
    Get:48 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libtool all 2.4.7-7build1 [166 kB]
    Get:49 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 dh-autoreconf all 20 [16.1 kB]
    Get:50 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libarchive-zip-perl all 1.68-1 [90.2 kB]
    Get:51 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libsub-override-perl all 0.10-1 [10.0 kB]
    Get:52 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libfile-stripnondeterminism-perl all 1.13.1-1 [18.1 kB]
    Get:53 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 dh-strip-nondeterminism all 1.13.1-1 [5,362 B]
    Get:54 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 debugedit amd64 1:5.0-5build2 [46.1 kB]
    Get:55 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 dwz amd64 0.15-1build6 [115 kB]
    Get:56 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 gettext amd64 0.21-14ubuntu2 [864 kB]
    Get:57 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 intltool-debian all 0.35.0+20060710.6 [23.2 kB]
    Get:58 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 po-debconf all 1.0.21+nmu1 [233 kB]
    Get:59 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 debhelper all 13.14.1ubuntu5 [869 kB]
    Get:60 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libfakeroot amd64 1.33-1 [32.4 kB]
    Get:61 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 fakeroot amd64 1.33-1 [67.2 kB]
    Get:62 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libalgorithm-diff-perl all 1.201-1 [41.8 kB]
    Get:63 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libalgorithm-diff-xs-perl amd64 0.04-8build3 [11.2 kB]
    Get:64 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libalgorithm-merge-perl all 0.08-5 [11.4 kB]
    Get:65 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libarchive-cpio-perl all 0.10-3 [10.3 kB]
    Get:66 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libfile-fcntllock-perl amd64 0.22-4ubuntu5 [30.7 kB]
    Get:67 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libltdl7 amd64 2.4.7-7build1 [40.3 kB]
    Get:68 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libltdl-dev amd64 2.4.7-7build1 [168 kB]
    Get:69 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libsys-hostname-long-perl all 1.5-3 [10.6 kB]
    Get:70 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libmail-sendmail-perl all 0.80-3 [21.7 kB]
    Fetched 71.3 MB in 1min 6s (1,086 kB/s)
    Extracting templates from packages: 100%
    Selecting previously unselected package m4.
    (Reading database ... 114599 files and directories currently installed.)
    Preparing to unpack .../00-m4_1.4.19-4build1_amd64.deb ...
    Unpacking m4 (1.4.19-4build1) ...
    Selecting previously unselected package autoconf.
    Preparing to unpack .../01-autoconf_2.71-3_all.deb ...
    Unpacking autoconf (2.71-3) ...
    Selecting previously unselected package autotools-dev.
    Preparing to unpack .../02-autotools-dev_20220109.1_all.deb ...
    Unpacking autotools-dev (20220109.1) ...
    Selecting previously unselected package automake.
    Preparing to unpack .../03-automake_1%3a1.16.5-1.3ubuntu1_all.deb ...
    Unpacking automake (1:1.16.5-1.3ubuntu1) ...
    Selecting previously unselected package autopoint.
    Preparing to unpack .../04-autopoint_0.21-14ubuntu2_all.deb ...
    Unpacking autopoint (0.21-14ubuntu2) ...
    Selecting previously unselected package binutils-common:amd64.
    Preparing to unpack .../05-binutils-common_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking binutils-common:amd64 (2.42-4ubuntu2.6) ...
    Selecting previously unselected package libsframe1:amd64.
    Preparing to unpack .../06-libsframe1_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking libsframe1:amd64 (2.42-4ubuntu2.6) ...
    Selecting previously unselected package libbinutils:amd64.
    Preparing to unpack .../07-libbinutils_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking libbinutils:amd64 (2.42-4ubuntu2.6) ...
    Selecting previously unselected package libctf-nobfd0:amd64.
    Preparing to unpack .../08-libctf-nobfd0_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking libctf-nobfd0:amd64 (2.42-4ubuntu2.6) ...
    Selecting previously unselected package libctf0:amd64.
    Preparing to unpack .../09-libctf0_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking libctf0:amd64 (2.42-4ubuntu2.6) ...
    Selecting previously unselected package libgprofng0:amd64.
    Preparing to unpack .../10-libgprofng0_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking libgprofng0:amd64 (2.42-4ubuntu2.6) ...
    Selecting previously unselected package binutils-x86-64-linux-gnu.
    Preparing to unpack .../11-binutils-x86-64-linux-gnu_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking binutils-x86-64-linux-gnu (2.42-4ubuntu2.6) ...
    Selecting previously unselected package binutils.
    Preparing to unpack .../12-binutils_2.42-4ubuntu2.6_amd64.deb ...
    Unpacking binutils (2.42-4ubuntu2.6) ...
    Selecting previously unselected package gcc-13-base:amd64.
    Preparing to unpack .../13-gcc-13-base_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking gcc-13-base:amd64 (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package libisl23:amd64.
    Preparing to unpack .../14-libisl23_0.26-3build1.1_amd64.deb ...
    Unpacking libisl23:amd64 (0.26-3build1.1) ...
    Selecting previously unselected package libmpc3:amd64.
    Preparing to unpack .../15-libmpc3_1.3.1-1build1.1_amd64.deb ...
    Unpacking libmpc3:amd64 (1.3.1-1build1.1) ...
    Selecting previously unselected package cpp-13-x86-64-linux-gnu.
    Preparing to unpack .../16-cpp-13-x86-64-linux-gnu_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking cpp-13-x86-64-linux-gnu (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package cpp-13.
    Preparing to unpack .../17-cpp-13_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking cpp-13 (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package cpp-x86-64-linux-gnu.
    Preparing to unpack .../18-cpp-x86-64-linux-gnu_4%3a13.2.0-7ubuntu1_amd64.deb ...
    Unpacking cpp-x86-64-linux-gnu (4:13.2.0-7ubuntu1) ...
    Selecting previously unselected package cpp.
    Preparing to unpack .../19-cpp_4%3a13.2.0-7ubuntu1_amd64.deb ...
    Unpacking cpp (4:13.2.0-7ubuntu1) ...
    Selecting previously unselected package libcc1-0:amd64.
    Preparing to unpack .../20-libcc1-0_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libcc1-0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libgomp1:amd64.
    Preparing to unpack .../21-libgomp1_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libgomp1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libitm1:amd64.
    Preparing to unpack .../22-libitm1_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libitm1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libatomic1:amd64.
    Preparing to unpack .../23-libatomic1_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libatomic1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libasan8:amd64.
    Preparing to unpack .../24-libasan8_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libasan8:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package liblsan0:amd64.
    Preparing to unpack .../25-liblsan0_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking liblsan0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libtsan2:amd64.
    Preparing to unpack .../26-libtsan2_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libtsan2:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libubsan1:amd64.
    Preparing to unpack .../27-libubsan1_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libubsan1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libhwasan0:amd64.
    Preparing to unpack .../28-libhwasan0_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libhwasan0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libquadmath0:amd64.
    Preparing to unpack .../29-libquadmath0_14.2.0-4ubuntu2~24.04_amd64.deb ...
    Unpacking libquadmath0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Selecting previously unselected package libgcc-13-dev:amd64.
    Preparing to unpack .../30-libgcc-13-dev_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking libgcc-13-dev:amd64 (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package gcc-13-x86-64-linux-gnu.
    Preparing to unpack .../31-gcc-13-x86-64-linux-gnu_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking gcc-13-x86-64-linux-gnu (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package gcc-13.
    Preparing to unpack .../32-gcc-13_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking gcc-13 (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package gcc-x86-64-linux-gnu.
    Preparing to unpack .../33-gcc-x86-64-linux-gnu_4%3a13.2.0-7ubuntu1_amd64.deb ...
    Unpacking gcc-x86-64-linux-gnu (4:13.2.0-7ubuntu1) ...
    Selecting previously unselected package gcc.
    Preparing to unpack .../34-gcc_4%3a13.2.0-7ubuntu1_amd64.deb ...
    Unpacking gcc (4:13.2.0-7ubuntu1) ...
    Selecting previously unselected package libstdc++-13-dev:amd64.
    Preparing to unpack .../35-libstdc++-13-dev_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking libstdc++-13-dev:amd64 (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package g++-13-x86-64-linux-gnu.
    Preparing to unpack .../36-g++-13-x86-64-linux-gnu_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking g++-13-x86-64-linux-gnu (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package g++-13.
    Preparing to unpack .../37-g++-13_13.3.0-6ubuntu2~24.04_amd64.deb ...
    Unpacking g++-13 (13.3.0-6ubuntu2~24.04) ...
    Selecting previously unselected package g++-x86-64-linux-gnu.
    Preparing to unpack .../38-g++-x86-64-linux-gnu_4%3a13.2.0-7ubuntu1_amd64.deb ...
    Unpacking g++-x86-64-linux-gnu (4:13.2.0-7ubuntu1) ...
    Selecting previously unselected package g++.
    Preparing to unpack .../39-g++_4%3a13.2.0-7ubuntu1_amd64.deb ...
    Unpacking g++ (4:13.2.0-7ubuntu1) ...
    Selecting previously unselected package make.
    Preparing to unpack .../40-make_4.3-4.1build2_amd64.deb ...
    Unpacking make (4.3-4.1build2) ...
    Selecting previously unselected package libdpkg-perl.
    Preparing to unpack .../41-libdpkg-perl_1.22.6ubuntu6.5_all.deb ...
    Unpacking libdpkg-perl (1.22.6ubuntu6.5) ...
    Selecting previously unselected package bzip2.
    Preparing to unpack .../42-bzip2_1.0.8-5.1build0.1_amd64.deb ...
    Unpacking bzip2 (1.0.8-5.1build0.1) ...
    Selecting previously unselected package lto-disabled-list.
    Preparing to unpack .../43-lto-disabled-list_47_all.deb ...
    Unpacking lto-disabled-list (47) ...
    Selecting previously unselected package dpkg-dev.
    Preparing to unpack .../44-dpkg-dev_1.22.6ubuntu6.5_all.deb ...
    Unpacking dpkg-dev (1.22.6ubuntu6.5) ...
    Selecting previously unselected package build-essential.
    Preparing to unpack .../45-build-essential_12.10ubuntu1_amd64.deb ...
    Unpacking build-essential (12.10ubuntu1) ...
    Selecting previously unselected package libdebhelper-perl.
    Preparing to unpack .../46-libdebhelper-perl_13.14.1ubuntu5_all.deb ...
    Unpacking libdebhelper-perl (13.14.1ubuntu5) ...
    Selecting previously unselected package libtool.
    Preparing to unpack .../47-libtool_2.4.7-7build1_all.deb ...
    Unpacking libtool (2.4.7-7build1) ...
    Selecting previously unselected package dh-autoreconf.
    Preparing to unpack .../48-dh-autoreconf_20_all.deb ...
    Unpacking dh-autoreconf (20) ...
    Selecting previously unselected package libarchive-zip-perl.
    Preparing to unpack .../49-libarchive-zip-perl_1.68-1_all.deb ...
    Unpacking libarchive-zip-perl (1.68-1) ...
    Selecting previously unselected package libsub-override-perl.
    Preparing to unpack .../50-libsub-override-perl_0.10-1_all.deb ...
    Unpacking libsub-override-perl (0.10-1) ...
    Selecting previously unselected package libfile-stripnondeterminism-perl.
    Preparing to unpack .../51-libfile-stripnondeterminism-perl_1.13.1-1_all.deb ...
    Unpacking libfile-stripnondeterminism-perl (1.13.1-1) ...
    Selecting previously unselected package dh-strip-nondeterminism.
    Preparing to unpack .../52-dh-strip-nondeterminism_1.13.1-1_all.deb ...
    Unpacking dh-strip-nondeterminism (1.13.1-1) ...
    Selecting previously unselected package debugedit.
    Preparing to unpack .../53-debugedit_1%3a5.0-5build2_amd64.deb ...
    Unpacking debugedit (1:5.0-5build2) ...
    Selecting previously unselected package dwz.
    Preparing to unpack .../54-dwz_0.15-1build6_amd64.deb ...
    Unpacking dwz (0.15-1build6) ...
    Selecting previously unselected package gettext.
    Preparing to unpack .../55-gettext_0.21-14ubuntu2_amd64.deb ...
    Unpacking gettext (0.21-14ubuntu2) ...
    Selecting previously unselected package intltool-debian.
    Preparing to unpack .../56-intltool-debian_0.35.0+20060710.6_all.deb ...
    Unpacking intltool-debian (0.35.0+20060710.6) ...
    Selecting previously unselected package po-debconf.
    Preparing to unpack .../57-po-debconf_1.0.21+nmu1_all.deb ...
    Unpacking po-debconf (1.0.21+nmu1) ...
    Selecting previously unselected package debhelper.
    Preparing to unpack .../58-debhelper_13.14.1ubuntu5_all.deb ...
    Unpacking debhelper (13.14.1ubuntu5) ...
    Selecting previously unselected package libfakeroot:amd64.
    Preparing to unpack .../59-libfakeroot_1.33-1_amd64.deb ...
    Unpacking libfakeroot:amd64 (1.33-1) ...
    Selecting previously unselected package fakeroot.
    Preparing to unpack .../60-fakeroot_1.33-1_amd64.deb ...
    Unpacking fakeroot (1.33-1) ...
    Selecting previously unselected package libalgorithm-diff-perl.
    Preparing to unpack .../61-libalgorithm-diff-perl_1.201-1_all.deb ...
    Unpacking libalgorithm-diff-perl (1.201-1) ...
    Selecting previously unselected package libalgorithm-diff-xs-perl:amd64.
    Preparing to unpack .../62-libalgorithm-diff-xs-perl_0.04-8build3_amd64.deb ...
    Unpacking libalgorithm-diff-xs-perl:amd64 (0.04-8build3) ...
    Selecting previously unselected package libalgorithm-merge-perl.
    Preparing to unpack .../63-libalgorithm-merge-perl_0.08-5_all.deb ...
    Unpacking libalgorithm-merge-perl (0.08-5) ...
    Selecting previously unselected package libarchive-cpio-perl.
    Preparing to unpack .../64-libarchive-cpio-perl_0.10-3_all.deb ...
    Unpacking libarchive-cpio-perl (0.10-3) ...
    Selecting previously unselected package libfile-fcntllock-perl.
    Preparing to unpack .../65-libfile-fcntllock-perl_0.22-4ubuntu5_amd64.deb ...
    Unpacking libfile-fcntllock-perl (0.22-4ubuntu5) ...
    Selecting previously unselected package libltdl7:amd64.
    Preparing to unpack .../66-libltdl7_2.4.7-7build1_amd64.deb ...
    Unpacking libltdl7:amd64 (2.4.7-7build1) ...
    Selecting previously unselected package libltdl-dev:amd64.
    Preparing to unpack .../67-libltdl-dev_2.4.7-7build1_amd64.deb ...
    Unpacking libltdl-dev:amd64 (2.4.7-7build1) ...
    Selecting previously unselected package libsys-hostname-long-perl.
    Preparing to unpack .../68-libsys-hostname-long-perl_1.5-3_all.deb ...
    Unpacking libsys-hostname-long-perl (1.5-3) ...
    Selecting previously unselected package libmail-sendmail-perl.
    Preparing to unpack .../69-libmail-sendmail-perl_0.80-3_all.deb ...
    Unpacking libmail-sendmail-perl (0.80-3) ...
    Setting up lto-disabled-list (47) ...
    Setting up libfile-fcntllock-perl (0.22-4ubuntu5) ...
    Setting up libalgorithm-diff-perl (1.201-1) ...
    Setting up libarchive-zip-perl (1.68-1) ...
    Setting up libdebhelper-perl (13.14.1ubuntu5) ...
    Setting up binutils-common:amd64 (2.42-4ubuntu2.6) ...
    Setting up libctf-nobfd0:amd64 (2.42-4ubuntu2.6) ...
    Setting up m4 (1.4.19-4build1) ...
    Setting up libgomp1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up bzip2 (1.0.8-5.1build0.1) ...
    Setting up libsframe1:amd64 (2.42-4ubuntu2.6) ...
    Setting up libfakeroot:amd64 (1.33-1) ...
    Setting up fakeroot (1.33-1) ...
    update-alternatives: using /usr/bin/fakeroot-sysv to provide /usr/bin/fakeroot (fakeroot) in auto mode
    Setting up autotools-dev (20220109.1) ...
    Setting up gcc-13-base:amd64 (13.3.0-6ubuntu2~24.04) ...
    Setting up make (4.3-4.1build2) ...
    Setting up libquadmath0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up libmpc3:amd64 (1.3.1-1build1.1) ...
    Setting up libatomic1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up autopoint (0.21-14ubuntu2) ...
    Setting up libltdl7:amd64 (2.4.7-7build1) ...
    Setting up libdpkg-perl (1.22.6ubuntu6.5) ...
    Setting up autoconf (2.71-3) ...
    Setting up libubsan1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up dwz (0.15-1build6) ...
    Setting up libhwasan0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up libarchive-cpio-perl (0.10-3) ...
    Setting up libasan8:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up debugedit (1:5.0-5build2) ...
    Setting up libsub-override-perl (0.10-1) ...
    Setting up libtsan2:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up libbinutils:amd64 (2.42-4ubuntu2.6) ...
    Setting up libisl23:amd64 (0.26-3build1.1) ...
    Setting up libsys-hostname-long-perl (1.5-3) ...
    Setting up libalgorithm-diff-xs-perl:amd64 (0.04-8build3) ...
    Setting up libcc1-0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up liblsan0:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up libitm1:amd64 (14.2.0-4ubuntu2~24.04) ...
    Setting up libalgorithm-merge-perl (0.08-5) ...
    Setting up libctf0:amd64 (2.42-4ubuntu2.6) ...
    Setting up automake (1:1.16.5-1.3ubuntu1) ...
    update-alternatives: using /usr/bin/automake-1.16 to provide /usr/bin/automake (automake) in auto mode
    Setting up libfile-stripnondeterminism-perl (1.13.1-1) ...
    Setting up gettext (0.21-14ubuntu2) ...
    Setting up cpp-13-x86-64-linux-gnu (13.3.0-6ubuntu2~24.04) ...
    Setting up intltool-debian (0.35.0+20060710.6) ...
    Setting up libmail-sendmail-perl (0.80-3) ...
    Setting up libltdl-dev:amd64 (2.4.7-7build1) ...
    Setting up libgprofng0:amd64 (2.42-4ubuntu2.6) ...
    Setting up dh-strip-nondeterminism (1.13.1-1) ...
    Setting up libgcc-13-dev:amd64 (13.3.0-6ubuntu2~24.04) ...
    Setting up libstdc++-13-dev:amd64 (13.3.0-6ubuntu2~24.04) ...
    Setting up binutils-x86-64-linux-gnu (2.42-4ubuntu2.6) ...
    Setting up cpp-x86-64-linux-gnu (4:13.2.0-7ubuntu1) ...
    Setting up cpp-13 (13.3.0-6ubuntu2~24.04) ...
    Setting up gcc-13-x86-64-linux-gnu (13.3.0-6ubuntu2~24.04) ...
    Setting up po-debconf (1.0.21+nmu1) ...
    Setting up binutils (2.42-4ubuntu2.6) ...
    Setting up dpkg-dev (1.22.6ubuntu6.5) ...
    Setting up gcc-13 (13.3.0-6ubuntu2~24.04) ...
    Setting up cpp (4:13.2.0-7ubuntu1) ...
    Setting up g++-13-x86-64-linux-gnu (13.3.0-6ubuntu2~24.04) ...
    Setting up gcc-x86-64-linux-gnu (4:13.2.0-7ubuntu1) ...
    Setting up libtool (2.4.7-7build1) ...
    Setting up gcc (4:13.2.0-7ubuntu1) ...
    Setting up dh-autoreconf (20) ...
    Setting up g++-x86-64-linux-gnu (4:13.2.0-7ubuntu1) ...
    Setting up g++-13 (13.3.0-6ubuntu2~24.04) ...
    Setting up debhelper (13.14.1ubuntu5) ...
    Setting up g++ (4:13.2.0-7ubuntu1) ...
    update-alternatives: using /usr/bin/g++ to provide /usr/bin/c++ (c++) in auto mode
    Setting up build-essential (12.10ubuntu1) ...
    Processing triggers for libc-bin (2.39-0ubuntu8.6) ...
    Processing triggers for man-db (2.12.0-4build2) ...
    Processing triggers for install-info (7.1-3build2) ...
    Scanning processes...
    Scanning linux images...

    Running kernel seems to be up-to-date.

    No services need to be restarted.

    No containers need to be restarted.

    No user sessions are running outdated binaries.

    No VM guests are running outdated hypervisor (qemu) binaries on this host.
    root@siem:/home/analyst/Wazuh# apt-get -y install wazuh-dashboard
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    The following NEW packages will be installed:
    wazuh-dashboard
    0 upgraded, 1 newly installed, 0 to remove and 1 not upgraded.
    Need to get 193 MB of archives.
    After this operation, 1,036 MB of additional disk space will be used.
    Get:1 https://packages.wazuh.com/4.x/apt stable/main amd64 wazuh-dashboard amd64 4.14.1-1 [193 MB]
    Fetched 193 MB in 1min 5s (2,981 kB/s)
    Selecting previously unselected package wazuh-dashboard.
    (Reading database ... 117973 files and directories currently installed.)
    Preparing to unpack .../wazuh-dashboard_4.14.1-1_amd64.deb ...
    Creating wazuh-dashboard group... OK
    Creating wazuh-dashboard user... OK
    Unpacking wazuh-dashboard (4.14.1-1) ...
    Setting up wazuh-dashboard (4.14.1-1) ...
    Scanning processes...
    Scanning linux images...

    Running kernel seems to be up-to-date.

    No services need to be restarted.

    No containers need to be restarted.

    No user sessions are running outdated binaries.

    No VM guests are running outdated hypervisor (qemu) binaries on this host.
    root@siem:/home/analyst/Wazuh# cat /etc/wazuh-dashboard/opensearch_dashboards.yml
    server.host: 0.0.0.0
    server.port: 443
    opensearch.hosts: https://localhost:9200
    opensearch.ssl.verificationMode: certificate
    #opensearch.username:
    #opensearch.password:
    opensearch.requestHeadersAllowlist: ["securitytenant","Authorization"]
    opensearch_security.multitenancy.enabled: false
    opensearch_security.readonly_mode.roles: ["kibana_read_only"]
    server.ssl.enabled: true
    server.ssl.key: "/etc/wazuh-dashboard/certs/dashboard-key.pem"
    server.ssl.certificate: "/etc/wazuh-dashboard/certs/dashboard.pem"
    opensearch.ssl.certificateAuthorities: ["/etc/wazuh-dashboard/certs/root-ca.pem"]
    uiSettings.overrides.defaultRoute: /app/wz-home
    # Session expiration settings
    opensearch_security.cookie.ttl: 900000
    opensearch_security.session.ttl: 900000
    opensearch_security.session.keepalive: true
    root@siem:/home/analyst/Wazuh# nano /etc/wazuh-dashboard/opensearch_dashboards.yml
    root@siem:/home/analyst/Wazuh# cat /etc/wazuh-dashboard/opensearch_dashboards.yml
    server.host: 192.168.10.60
    server.port: 443
    opensearch.hosts: https://192.168.10.60:9200
    opensearch.ssl.verificationMode: certificate
    #opensearch.username:
    #opensearch.password:
    opensearch.requestHeadersAllowlist: ["securitytenant","Authorization"]
    opensearch_security.multitenancy.enabled: false
    opensearch_security.readonly_mode.roles: ["kibana_read_only"]
    server.ssl.enabled: true
    server.ssl.key: "/etc/wazuh-dashboard/certs/dashboard-key.pem"
    server.ssl.certificate: "/etc/wazuh-dashboard/certs/dashboard.pem"
    opensearch.ssl.certificateAuthorities: ["/etc/wazuh-dashboard/certs/root-ca.pem"]
    uiSettings.overrides.defaultRoute: /app/wz-home
    # Session expiration settings
    opensearch_security.cookie.ttl: 900000
    opensearch_security.session.ttl: 900000
    opensearch_security.session.keepalive: true
    root@siem:/home/analyst/Wazuh# mkdir /etc/wazuh-dashboard/certs
    root@siem:/home/analyst/Wazuh# tar -xf ./wazuh-certificates.tar -C /etc/wazuh-dashboard/certs/ ./node-1.pem ./node-1-key.pem ./root-ca.pem
    root@siem:/home/analyst/Wazuh# mv -n /etc/wazuh-dashboard/certs/node-1.pem /etc/wazuh-dashboard/certs/dashboard.pem
    root@siem:/home/analyst/Wazuh# mv -n /etc/wazuh-dashboard/certs/node-1-key.pem /etc/wazuh-dashboard/certs/dashboard-key.pem
    root@siem:/home/analyst/Wazuh# chmod 500 /etc/wazuh-dashboard/certs
    root@siem:/home/analyst/Wazuh# chmod 400 /etc/wazuh-dashboard/certs/*
    root@siem:/home/analyst/Wazuh# chown -R wazuh-dashboard:wazuh-dashboard /etc/wazuh-dashboard/certs
    root@siem:/home/analyst/Wazuh# systemctl daemon-reload
    root@siem:/home/analyst/Wazuh# systemctl enable wazuh-dashboard
    Created symlink /etc/systemd/system/multi-user.target.wants/wazuh-dashboard.service → /etc/systemd/system/wazuh-dashboard.service.
    root@siem:/home/analyst/Wazuh# systemctl start wazuh-dashboard
    root@siem:/home/analyst/Wazuh# cat /usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml
    ---
    #
    # App configuration file
    # Copyright (C) 2015-2024 Wazuh, Inc.
    #
    # This program is free software; you can redistribute it and/or modify
    # it under the terms of the GNU General Public License as published by
    # the Free Software Foundation; either version 2 of the License, or
    # (at your option) any later version.
    #
    # Find more information about this on the LICENSE file.
    #
    # =========================== App configuration file ===========================
    #
    # Please check the documentation for more information about configuration options:
    # https://documentation.wazuh.com/4.14/user-manual/wazuh-dashboard/settings.html
    #
    # Also, you can check our repository:
    # https://github.com/wazuh/wazuh-dashboard-plugins
    #
    # ---------------------------------- General -----------------------------------
    #
    # Basic app settings related to alerts index pattern, hide the manager alerts in
    # the dashboards, logs level and more.
    #
    # Define the index name prefix of sample alerts. It must match the template used
    # by the index pattern to avoid unknown fields in dashboards.
    # alerts.sample.prefix: wazuh-alerts-4.x-
    #
    # Enable or disable the ability to edit the configuration from UI or API
    # endpoints. When disabled, this can only be edited from the configuration file,
    # the related API endpoints are disabled, and the UI is inaccessible. Allowed
    # values: true, false.
    # configuration.ui_api_editable: true
    #
    # Define the index prefix of predefined jobs.
    # cron.prefix: wazuh
    #
    # Specifies the Wazuh registration server, used for the agent enrollment.
    # enrollment.dns: ''
    #
    # Hide the alerts of the manager in every dashboard. Allowed values: true, false.
    # hideManagerAlerts: false
    #
    # Disable certain index pattern names from being available in index pattern
    # selector.
    # ip.ignore: []
    #
    # Define if the user is allowed to change the selected index pattern directly from
    # the top menu bar. Allowed values: true, false.
    # ip.selector: true
    #
    # Default index pattern to use on the app. If there's no valid index pattern, the
    # app will automatically create one with the name indicated in this option.
    # pattern: wazuh-alerts-*
    #
    # Maximum rows that will be included in csv reports. If the number of rows exceeds
    # this value, the report will be truncated. Setting a high value can cause
    # instability of the report generating process.
    # reports.csv.maxRows: 10000
    #
    # Maximum time, in milliseconds, the app will wait for an API response when making
    # requests to it. It will be ignored if the value is set under 1500 milliseconds.
    # Minimum value: 1500.
    # timeout: 20000
    #
    # Define if the check updates service is disabled. Allowed values: true, false.
    # wazuh.updates.disabled: false
    #
    # -------------------------------- Health check --------------------------------
    #
    # Checks will be executed by the app's Healthcheck.
    #
    # Enable or disable the API health check when opening the app. Allowed values:
    # true, false.
    # checks.api: true
    #
    # Enable or disable the known fields health check when opening the app. Allowed
    # values: true, false.
    # checks.fields: true
    #
    # Change the default value of the plugin platform max buckets configuration.
    # Allowed values: true, false.
    # checks.maxBuckets: true
    #
    # Change the default value of the plugin platform metaField configuration. Allowed
    # values: true, false.
    # checks.metaFields: true
    #
    # Enable or disable the index pattern health check when opening the app. Allowed
    # values: true, false.
    # checks.pattern: true
    #
    # Enable or disable the setup health check when opening the app. Allowed values:
    # true, false.
    # checks.setup: true
    #
    # Enable or disable the template health check when opening the app. Allowed
    # values: true, false.
    # checks.template: true
    #
    # Change the default value of the plugin platform timeFilter configuration.
    # Allowed values: true, false.
    # checks.timeFilter: true
    #
    # ------------------------------ Task:Monitoring -------------------------------
    #
    # Options related to the agent status monitoring job and its storage in indexes.
    #
    # Define the interval in which a new wazuh-monitoring index will be created.
    # Allowed values: h (Hourly), d (Daily), w (Weekly), m (Monthly).
    # wazuh.monitoring.creation: w
    #
    # Enable or disable the wazuh-monitoring index creation and/or visualization.
    # Allowed values: true, false.
    # wazuh.monitoring.enabled: true
    #
    # Frequency, in seconds, of API requests to get the state of the agents and create
    # a new document in the wazuh-monitoring index with this data. Minimum value: 60.
    # wazuh.monitoring.frequency: 900
    #
    # Default index pattern to use for Wazuh monitoring.
    # wazuh.monitoring.pattern: wazuh-monitoring-*
    #
    # Define the number of replicas to use for the wazuh-monitoring-* indices. Minimum
    # value: 0.
    # wazuh.monitoring.replicas: 0
    #
    # Define the number of shards to use for the wazuh-monitoring-* indices. Minimum
    # value: 1.
    # wazuh.monitoring.shards: 1
    #
    # ------------------------------ Task:Statistics -------------------------------
    #
    # Options related to the daemons manager monitoring job and their storage in
    # indexes.
    #
    # Enter the ID of the hosts you want to save data from, leave this empty to run
    # the task on every host.
    # cron.statistics.apis: []
    #
    # Define the interval in which a new index will be created. Allowed values: h
    # (Hourly), d (Daily), w (Weekly), m (Monthly).
    # cron.statistics.index.creation: w
    #
    # Define the name of the index in which the documents will be saved.
    # cron.statistics.index.name: statistics
    #
    # Define the number of replicas to use for the statistics indices. Minimum value:
    # 0.
    # cron.statistics.index.replicas: 0
    #
    # Define the number of shards to use for the statistics indices. Minimum value: 1.
    # cron.statistics.index.shards: 1
    #
    # Define the frequency of task execution using cron schedule expressions.
    # cron.statistics.interval: 0 */5 * * * *
    #
    # Enable or disable the statistics tasks. Allowed values: true, false.
    # cron.statistics.status: true
    #
    # ------------------------------ Custom branding -------------------------------
    #
    # If you want to use custom branding elements such as logos, you can do so by
    # editing the settings below.
    #
    # Enable or disable the customization. Allowed values: true, false.
    # customization.enabled: true
    #
    # This logo is used as loading indicator while the user is logging into Wazuh API.
    # Supported extensions: .jpeg, .jpg, .png, .svg. Recommended dimensions:
    # 300x70px. Maximum file size: 1 MB.
    # customization.logo.app: ''
    #
    # This logo is displayed during the Healthcheck routine of the app. Supported
    # extensions: .jpeg, .jpg, .png, .svg. Recommended dimensions: 300x70px. Maximum
    # file size: 1 MB.
    # customization.logo.healthcheck: ''
    #
    # This logo is used in the PDF reports generated by the app. It's placed at the
    # top left corner of every page of the PDF. Supported extensions: .jpeg, .jpg,
    # .png. Recommended dimensions: 190x40px. Maximum file size: 1 MB.
    # customization.logo.reports: ''
    #
    # Set the footer of the reports. Maximum amount of lines: 2. Maximum lines length
    # is 50 characters.
    # customization.reports.footer: ''
    #
    # Set the header of the reports. Maximum amount of lines: 3. Maximum lines length
    # is 40 characters.
    # customization.reports.header: ''
    #
    # ------------------------------ API connections -------------------------------
    #
    # Options related to the API connections.
    #
    # Configure the API connections.
    # The following configuration is the default structure to define a host.
    #
    # hosts:
    #   # Host ID / name,
    #   - env-1:
    #       # Host URL
    #       url: https://env-1.example
    #       # Host / API port
    #       port: 55000
    #       # Host / API username
    #       username: wazuh-wui
    #       # Host / API password
    #       password: wazuh-wui
    #       # Use RBAC or not. If set to true, the username must be "wazuh-wui".
    #       run_as: true
    #   - env-2:
    #       url: https://env-2.example
    #       port: 55000
    #       username: wazuh-wui
    #       password: wazuh-wui
    #       run_as: true

    hosts:
    - default:
        url: https://localhost
        port: 55000
        username: wazuh-wui
        password: wazuh-wui
        run_as: false

    root@siem:/home/analyst/Wazuh# nano /usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml
    root@siem:/home/analyst/Wazuh# tail /usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml
    #       run_as: true

    hosts:
    - default:
        url: https://192.168.10.60
        port: 55000
        username: wazuh-wui
        password: wazuh-wui
        run_as: false

    root@siem:/home/analyst/Wazuh#
    ```