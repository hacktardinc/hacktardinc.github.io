---
title: Arkime
description: Arkime
icon: material/owl
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

# Quick Install


### Update and install dependencies

```bash
sudo apt update
sudo apt install -y wget curl iproute2 ethtool jq
```

## Install OpenSearch

Download the latest version of OpenSearch package:

```bash
wget https://artifacts.opensearch.org/releases/bundle/opensearch/2.13.0/opensearch-2.13.0-linux-x64.deb
```


Create OpenSearch admin credentials

```bash
# You should change this password, if it isn't strong enough install will fail. :(
# Minimum 10 character password and must contain at least one uppercase letter, one lowercase letter, one digit, and one special character
sudo OPENSEARCH_INITIAL_ADMIN_PASSWORD="PleaseChange_M3" apt install -y ./opensearch-2.13.0-linux-x64.deb
```


Start and enable OpenSearch

```bash
sudo systemctl daemon-reload
sudo systemctl enable opensearch.service
sudo systemctl start opensearch
```

Verify that OpenSearch is running

```bash
curl -k --user "admin:$OPENSEARCH_INITIAL_ADMIN_PASSWORD" https://localhost:9200/_cat/health
```


!!! example "Elasticsearch Installation Output"

    ```bash
    ➜  ~ export OPENSEARCH_INITIAL_ADMIN_PASSWORD="PleaseChange_M3"
    ➜  ~ sudo OPENSEARCH_INITIAL_ADMIN_PASSWORD="PleaseChange_M3" apt install -y ./opensearch-2.13.0-linux-x64.deb
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    Note, selecting 'opensearch' instead of './opensearch-2.13.0-linux-x64.deb'
    opensearch is already the newest version (2.13.0).
    0 upgraded, 0 newly installed, 0 to remove and 28 not upgraded.
    1 not fully installed or removed.
    After this operation, 0 B of additional disk space will be used.
    Setting up opensearch (2.13.0) ...
    Running OpenSearch Post-Installation Script
    chown: warning: '.' should be ':': ‘opensearch.opensearch’
    chown: warning: '.' should be ':': ‘opensearch.adm’
    chown: warning: '.' should be ':': ‘opensearch.opensearch’
    chown: warning: '.' should be ':': ‘opensearch.opensearch’
    ### NOT starting on installation, please execute the following statements to configure opensearch service to start automatically using systemd
    sudo systemctl daemon-reload
    sudo systemctl enable opensearch.service
    ### You can start opensearch service by executing
    sudo systemctl start opensearch.service
    ### Create opensearch demo certificates in /etc/opensearch/
    See demo certs creation log in /var/log/opensearch/install_demo_configuration.log
    ### Breaking change in packaging since 2.13.0
    In 2.13.0 and later releases of OpenSearch, we have changed the permissions associated with access to installed files
    If you are configuring tools that require read access to the OpenSearch configuration files, we recommend you add the user that runs these tools to the 'opensearch' group
    For more information, see https://github.com/opensearch-project/opensearch-build/pull/4043
    Processing triggers for libc-bin (2.39-0ubuntu8.6) ...
    ➜  ~ sudo systemctl daemon-reload
    ➜  ~ sudo systemctl enable opensearch.service
    Synchronizing state of opensearch.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
    Executing: /usr/lib/systemd/systemd-sysv-install enable opensearch
    Created symlink /etc/systemd/system/multi-user.target.wants/opensearch.service → /usr/lib/systemd/system/opensearch.service.
    ➜  ~ sudo systemctl start opensearch.service
    ➜  ~ sudo systemctl status opensearch.service
    ● opensearch.service - OpenSearch
        Loaded: loaded (/usr/lib/systemd/system/opensearch.service; enabled; preset: enabled)
        Active: active (running) since Sat 2025-12-06 11:37:52 UTC; 23s ago
          Docs: https://opensearch.org/
      Main PID: 2315 (java)
          Tasks: 77 (limit: 6957)
        Memory: 1.4G (peak: 1.4G)
            CPU: 48.250s
        CGroup: /system.slice/opensearch.service
                └─2315 /usr/share/opensearch/jdk/bin/java -Xshare:auto -Dopensearch.networkaddress.cache.ttl=60 -Dopensearch.networkaddress.cache.negative.ttl=10 -XX:+AlwaysPreTouch -Xss1m -Djava.awt.headless=tr>

    Dec 06 11:37:23 srv-001 systemd-entrypoint[2315]: WARNING: System::setSecurityManager has been called by org.opensearch.bootstrap.OpenSearch (file:/usr/share/opensearch/lib/opensearch-2.13.0.jar)
    Dec 06 11:37:23 srv-001 systemd-entrypoint[2315]: WARNING: Please consider reporting this to the maintainers of org.opensearch.bootstrap.OpenSearch
    Dec 06 11:37:23 srv-001 systemd-entrypoint[2315]: WARNING: System::setSecurityManager will be removed in a future release
    Dec 06 11:37:24 srv-001 systemd-entrypoint[2315]: Dec 06, 2025 11:37:24 AM sun.util.locale.provider.LocaleProviderAdapter <clinit>
    Dec 06 11:37:24 srv-001 systemd-entrypoint[2315]: WARNING: COMPAT locale provider will be removed in a future release
    Dec 06 11:37:25 srv-001 systemd-entrypoint[2315]: WARNING: A terminally deprecated method in java.lang.System has been called
    Dec 06 11:37:25 srv-001 systemd-entrypoint[2315]: WARNING: System::setSecurityManager has been called by org.opensearch.bootstrap.Security (file:/usr/share/opensearch/lib/opensearch-2.13.0.jar)
    Dec 06 11:37:25 srv-001 systemd-entrypoint[2315]: WARNING: Please consider reporting this to the maintainers of org.opensearch.bootstrap.Security
    Dec 06 11:37:25 srv-001 systemd-entrypoint[2315]: WARNING: System::setSecurityManager will be removed in a future release
    Dec 06 11:37:52 srv-001 systemd[1]: Started opensearch.service - OpenSearch.
    ➜  ~ curl -k --user "admin:$OPENSEARCH_INITIAL_ADMIN_PASSWORD" https://localhost:9200/_cat/health
    1765021121 11:38:41 opensearch green 1 1 true 4 4 0 0 0 0 - 100.0%
    ```




## Install Arkime Sensor

Update package lists

```bash
sudo apt update
```

Download and install Arkime

```bash
wget https://github.com/arkime/arkime/releases/download/v5.8.3/arkime_5.8.3-1.ubuntu2404_amd64.deb
sudo apt install -y ./arkime_5.8.3-1.ubuntu2404_amd64.deb
```


Configure Arkime

```bash
/opt/arkime/bin/Configure
#### Interface: the interface to monitor
#### Install Elasticsearch: no
#### OpenSearch/Elasticsearch URL: https://localhost:9200
#### OpenSearch/Elasticsearch User: admin
#### OpenSearch/Elasticsearch Password: PleaseChangeM3!
#### Password: A new password, not the ES password
#### Download GeoIP: yes
```


Initialize the database using cron expire, use the password from OpenSearch/Elasticsearch!!!

```bash
/opt/arkime/db/db.pl --esuser admin https://localhost:9200 init
```

Create the admin/interface user

```bash
/opt/arkime/bin/arkime_add_user.sh admin "Admin User" analyst --admin
```

Start the Arkime Sensor

```bash
systemctl enable --now arkimecapture
systemctl enable --now arkimeviewer
```

Verify that Arkime is running

```bash
tail /opt/arkime/logs/*.log
curl -u admin:analyst --digest http://localhost:8005/eshealth.json
```

Install & configure Arkime Cont3xt

```bash
/opt/arkime/bin/Configure --cont3xt
#### OpenSearch/Elasticsearch URL: https://localhost:9200
#### OpenSearch/Elasticsearch User: admin
#### OpenSearch/Elasticsearch Password: PleaseChangeM3!
#### Password: A new password, not the ES password
```

Start the Arkime Sensor

```bash
systemctl enable --now arkimecont3xt
```

```bash
tail /opt/arkime/logs/cont3xt.log
```


# Sample notes

!!! example "Elasticsearch installaion Output"




Arkime Sensor

```bash
➜  ~ wget https://github.com/arkime/arkime/releases/download/v5.8.3/arkime_5.8.3-1.ubuntu2404_amd64.deb
--2025-12-06 11:41:22--  https://github.com/arkime/arkime/releases/download/v5.8.3/arkime_5.8.3-1.ubuntu2404_amd64.deb
Resolving github.com (github.com)... 20.87.245.0
Connecting to github.com (github.com)|20.87.245.0|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/4927517/0c995fef-d903-4699-bf2d-5c5b11913a3a?sp=r&sv=2018-11-09&sr=b&spr=https&se=2025-12-06T12%3A28%3A56Z&rscd=attachment%3B+filename%3Darkime_5.8.3-1.ubuntu2404_amd64.deb&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2025-12-06T11%3A27%3A57Z&ske=2025-12-06T12%3A28%3A56Z&sks=b&skv=2018-11-09&sig=4Isj3ep9NWWfTRwlWeNG3Nb4C%2FMSAxxhiBJpL3YlKJw%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc2NTAyNDg4MywibmJmIjoxNzY1MDIxMjgzLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.c-HHZBA-JqBE31zSh2xqEdujvjipwEnw50JKMbSyYgY&response-content-disposition=attachment%3B%20filename%3Darkime_5.8.3-1.ubuntu2404_amd64.deb&response-content-type=application%2Foctet-stream [following]
--2025-12-06 11:41:23--  https://release-assets.githubusercontent.com/github-production-release-asset/4927517/0c995fef-d903-4699-bf2d-5c5b11913a3a?sp=r&sv=2018-11-09&sr=b&spr=https&se=2025-12-06T12%3A28%3A56Z&rscd=attachment%3B+filename%3Darkime_5.8.3-1.ubuntu2404_amd64.deb&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2025-12-06T11%3A27%3A57Z&ske=2025-12-06T12%3A28%3A56Z&sks=b&skv=2018-11-09&sig=4Isj3ep9NWWfTRwlWeNG3Nb4C%2FMSAxxhiBJpL3YlKJw%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc2NTAyNDg4MywibmJmIjoxNzY1MDIxMjgzLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.c-HHZBA-JqBE31zSh2xqEdujvjipwEnw50JKMbSyYgY&response-content-disposition=attachment%3B%20filename%3Darkime_5.8.3-1.ubuntu2404_amd64.deb&response-content-type=application%2Foctet-stream
Resolving release-assets.githubusercontent.com (release-assets.githubusercontent.com)... 185.199.111.133, 185.199.110.133, 185.199.109.133, ...
Connecting to release-assets.githubusercontent.com (release-assets.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 127576176 (122M) [application/octet-stream]
Saving to: ‘arkime_5.8.3-1.ubuntu2404_amd64.deb’

arkime_5.8.3-1.ubuntu2404_amd64.deb                  100%[===================================================================================================================>] 121.67M  1.12MB/s    in 1m 49s

2025-12-06 11:43:12 (1.12 MB/s) - ‘arkime_5.8.3-1.ubuntu2404_amd64.deb’ saved [127576176/127576176]
➜  ~ sudo apt update && sudo apt install -y wget iproute2 ethtool
Hit:1 http://ke.archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://ke.archive.ubuntu.com/ubuntu noble-updates InRelease
Hit:3 http://ke.archive.ubuntu.com/ubuntu noble-backports InRelease
Hit:4 http://security.ubuntu.com/ubuntu noble-security InRelease
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
28 packages can be upgraded. Run 'apt list --upgradable' to see them.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
wget is already the newest version (1.21.4-1ubuntu4.1).
iproute2 is already the newest version (6.1.0-1ubuntu6.2).
iproute2 set to manually installed.
ethtool is already the newest version (1:6.7-1build1).
ethtool set to manually installed.
0 upgraded, 0 newly installed, 0 to remove and 28 not upgraded.
➜  ~ sudo apt install -y ./arkime_5.8.3-1.ubuntu2404_amd64.deb
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Note, selecting 'arkime' instead of './arkime_5.8.3-1.ubuntu2404_amd64.deb'
The following additional packages will be installed:
  libauthen-sasl-perl libclone-perl libcommon-sense-perl libdata-dump-perl libencode-locale-perl libfile-listing-perl libfont-afm-perl libhtml-form-perl libhtml-format-perl libhtml-parser-perl
  libhtml-tagset-perl libhtml-tree-perl libhttp-cookies-perl libhttp-daemon-perl libhttp-date-perl libhttp-message-perl libhttp-negotiate-perl libio-html-perl libio-socket-ssl-perl libjson-perl
  libjson-xs-perl liblua5.4-0 liblwp-mediatypes-perl liblwp-protocol-https-perl libmailtools-perl libnet-http-perl libnet-smtp-ssl-perl libnet-ssleay-perl libpcre3 librdkafka1 libtimedate-perl
  libtry-tiny-perl libtypes-serialiser-perl liburi-perl libwww-perl libwww-robotrules-perl libyaml-dev libyara10 perl-openssl-defaults
Suggested packages:
  libdigest-hmac-perl libgssapi-perl libio-compress-brotli-perl libcrypt-ssleay-perl libsub-name-perl libbusiness-isbn-perl libregexp-ipv6-perl libauthen-ntlm-perl libyaml-doc debhelper
The following NEW packages will be installed:
  arkime libauthen-sasl-perl libclone-perl libcommon-sense-perl libdata-dump-perl libencode-locale-perl libfile-listing-perl libfont-afm-perl libhtml-form-perl libhtml-format-perl libhtml-parser-perl
  libhtml-tagset-perl libhtml-tree-perl libhttp-cookies-perl libhttp-daemon-perl libhttp-date-perl libhttp-message-perl libhttp-negotiate-perl libio-html-perl libio-socket-ssl-perl libjson-perl
  libjson-xs-perl liblua5.4-0 liblwp-mediatypes-perl liblwp-protocol-https-perl libmailtools-perl libnet-http-perl libnet-smtp-ssl-perl libnet-ssleay-perl libpcre3 librdkafka1 libtimedate-perl
  libtry-tiny-perl libtypes-serialiser-perl liburi-perl libwww-perl libwww-robotrules-perl libyaml-dev libyara10 perl-openssl-defaults
0 upgraded, 40 newly installed, 0 to remove and 28 not upgraded.
Need to get 3,192 kB/131 MB of archives.
After this operation, 435 MB of additional disk space will be used.
Get:1 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libencode-locale-perl all 1.05-3 [11.6 kB]
Get:2 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libtimedate-perl all 2.3300-2 [34.0 kB]
Get:3 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhttp-date-perl all 6.06-1 [10.2 kB]
Get:4 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libfile-listing-perl all 6.16-1 [11.3 kB]
Get:5 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhtml-tagset-perl all 3.20-6 [11.3 kB]
Get:6 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 liburi-perl all 5.27-1 [88.0 kB]
Get:7 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhtml-parser-perl amd64 3.81-1build3 [85.8 kB]
Get:8 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhtml-tree-perl all 5.07-3 [200 kB]
Get:9 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libclone-perl amd64 0.46-1build3 [10.7 kB]
Get:10 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libio-html-perl all 1.004-3 [15.9 kB]
Get:11 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 liblwp-mediatypes-perl all 6.04-2 [20.1 kB]
Get:12 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhttp-message-perl all 6.45-1ubuntu1 [78.2 kB]
Get:13 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhttp-cookies-perl all 6.11-1 [18.2 kB]
Get:14 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhttp-negotiate-perl all 6.01-2 [12.4 kB]
Get:15 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 perl-openssl-defaults amd64 7build3 [6,626 B]
Get:16 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libnet-ssleay-perl amd64 1.94-1build4 [316 kB]
Get:17 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libio-socket-ssl-perl all 2.085-1 [195 kB]
Get:18 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libnet-http-perl all 6.23-1 [22.3 kB]
Get:19 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 liblwp-protocol-https-perl all 6.13-1 [9,006 B]
Get:20 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libtry-tiny-perl all 0.31-2 [20.8 kB]
Get:21 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libwww-robotrules-perl all 6.02-1 [12.6 kB]
Get:22 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libwww-perl all 6.76-1 [138 kB]
Get:23 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libjson-perl all 4.10000-1 [81.9 kB]
Get:24 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libyaml-dev amd64 0.2.5-1build1 [62.2 kB]
Get:25 /home/analyst/arkime_5.8.3-1.ubuntu2404_amd64.deb arkime amd64 5.8.3-1 [128 MB]
Get:26 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 liblua5.4-0 amd64 5.4.6-3build2 [166 kB]
Get:27 http://ke.archive.ubuntu.com/ubuntu noble/universe amd64 libyara10 amd64 4.5.0-1build2 [203 kB]
Get:28 http://ke.archive.ubuntu.com/ubuntu noble/universe amd64 librdkafka1 amd64 2.3.0-1build2 [727 kB]
Get:29 http://ke.archive.ubuntu.com/ubuntu noble/universe amd64 libpcre3 amd64 2:8.39-15build1 [248 kB]
Get:30 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libcommon-sense-perl amd64 3.75-3build3 [20.4 kB]
Get:31 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libdata-dump-perl all 1.25-1 [25.9 kB]
Get:32 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libfont-afm-perl all 1.20-4 [13.0 kB]
Get:33 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhtml-form-perl all 6.11-1 [32.1 kB]
Get:34 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhtml-format-perl all 2.16-2 [36.9 kB]
Get:35 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libhttp-daemon-perl all 6.16-1 [22.4 kB]
Get:36 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libtypes-serialiser-perl all 1.01-1 [11.6 kB]
Get:37 http://ke.archive.ubuntu.com/ubuntu noble-updates/main amd64 libjson-xs-perl amd64 4.040-0ubuntu0.24.04.1 [83.7 kB]
Get:38 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libnet-smtp-ssl-perl all 1.04-2 [6,218 B]
Get:39 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libmailtools-perl all 2.21-2 [80.4 kB]
Get:40 http://ke.archive.ubuntu.com/ubuntu noble/main amd64 libauthen-sasl-perl all 2.1700-1 [42.9 kB]
Fetched 3,192 kB in 3s (1,132 kB/s)
Extracting templates from packages: 100%
Selecting previously unselected package libencode-locale-perl.
(Reading database ... 93662 files and directories currently installed.)
Preparing to unpack .../00-libencode-locale-perl_1.05-3_all.deb ...
Unpacking libencode-locale-perl (1.05-3) ...
Selecting previously unselected package libtimedate-perl.
Preparing to unpack .../01-libtimedate-perl_2.3300-2_all.deb ...
Unpacking libtimedate-perl (2.3300-2) ...
Selecting previously unselected package libhttp-date-perl.
Preparing to unpack .../02-libhttp-date-perl_6.06-1_all.deb ...
Unpacking libhttp-date-perl (6.06-1) ...
Selecting previously unselected package libfile-listing-perl.
Preparing to unpack .../03-libfile-listing-perl_6.16-1_all.deb ...
Unpacking libfile-listing-perl (6.16-1) ...
Selecting previously unselected package libhtml-tagset-perl.
Preparing to unpack .../04-libhtml-tagset-perl_3.20-6_all.deb ...
Unpacking libhtml-tagset-perl (3.20-6) ...
Selecting previously unselected package liburi-perl.
Preparing to unpack .../05-liburi-perl_5.27-1_all.deb ...
Unpacking liburi-perl (5.27-1) ...
Selecting previously unselected package libhtml-parser-perl:amd64.
Preparing to unpack .../06-libhtml-parser-perl_3.81-1build3_amd64.deb ...
Unpacking libhtml-parser-perl:amd64 (3.81-1build3) ...
Selecting previously unselected package libhtml-tree-perl.
Preparing to unpack .../07-libhtml-tree-perl_5.07-3_all.deb ...
Unpacking libhtml-tree-perl (5.07-3) ...
Selecting previously unselected package libclone-perl:amd64.
Preparing to unpack .../08-libclone-perl_0.46-1build3_amd64.deb ...
Unpacking libclone-perl:amd64 (0.46-1build3) ...
Selecting previously unselected package libio-html-perl.
Preparing to unpack .../09-libio-html-perl_1.004-3_all.deb ...
Unpacking libio-html-perl (1.004-3) ...
Selecting previously unselected package liblwp-mediatypes-perl.
Preparing to unpack .../10-liblwp-mediatypes-perl_6.04-2_all.deb ...
Unpacking liblwp-mediatypes-perl (6.04-2) ...
Selecting previously unselected package libhttp-message-perl.
Preparing to unpack .../11-libhttp-message-perl_6.45-1ubuntu1_all.deb ...
Unpacking libhttp-message-perl (6.45-1ubuntu1) ...
Selecting previously unselected package libhttp-cookies-perl.
Preparing to unpack .../12-libhttp-cookies-perl_6.11-1_all.deb ...
Unpacking libhttp-cookies-perl (6.11-1) ...
Selecting previously unselected package libhttp-negotiate-perl.
Preparing to unpack .../13-libhttp-negotiate-perl_6.01-2_all.deb ...
Unpacking libhttp-negotiate-perl (6.01-2) ...
Selecting previously unselected package perl-openssl-defaults:amd64.
Preparing to unpack .../14-perl-openssl-defaults_7build3_amd64.deb ...
Unpacking perl-openssl-defaults:amd64 (7build3) ...
Selecting previously unselected package libnet-ssleay-perl:amd64.
Preparing to unpack .../15-libnet-ssleay-perl_1.94-1build4_amd64.deb ...
Unpacking libnet-ssleay-perl:amd64 (1.94-1build4) ...
Selecting previously unselected package libio-socket-ssl-perl.
Preparing to unpack .../16-libio-socket-ssl-perl_2.085-1_all.deb ...
Unpacking libio-socket-ssl-perl (2.085-1) ...
Selecting previously unselected package libnet-http-perl.
Preparing to unpack .../17-libnet-http-perl_6.23-1_all.deb ...
Unpacking libnet-http-perl (6.23-1) ...
Selecting previously unselected package liblwp-protocol-https-perl.
Preparing to unpack .../18-liblwp-protocol-https-perl_6.13-1_all.deb ...
Unpacking liblwp-protocol-https-perl (6.13-1) ...
Selecting previously unselected package libtry-tiny-perl.
Preparing to unpack .../19-libtry-tiny-perl_0.31-2_all.deb ...
Unpacking libtry-tiny-perl (0.31-2) ...
Selecting previously unselected package libwww-robotrules-perl.
Preparing to unpack .../20-libwww-robotrules-perl_6.02-1_all.deb ...
Unpacking libwww-robotrules-perl (6.02-1) ...
Selecting previously unselected package libwww-perl.
Preparing to unpack .../21-libwww-perl_6.76-1_all.deb ...
Unpacking libwww-perl (6.76-1) ...
Selecting previously unselected package libjson-perl.
Preparing to unpack .../22-libjson-perl_4.10000-1_all.deb ...
Unpacking libjson-perl (4.10000-1) ...
Selecting previously unselected package libyaml-dev:amd64.
Preparing to unpack .../23-libyaml-dev_0.2.5-1build1_amd64.deb ...
Unpacking libyaml-dev:amd64 (0.2.5-1build1) ...
Selecting previously unselected package liblua5.4-0:amd64.
Preparing to unpack .../24-liblua5.4-0_5.4.6-3build2_amd64.deb ...
Unpacking liblua5.4-0:amd64 (5.4.6-3build2) ...
Selecting previously unselected package libyara10:amd64.
Preparing to unpack .../25-libyara10_4.5.0-1build2_amd64.deb ...
Unpacking libyara10:amd64 (4.5.0-1build2) ...
Selecting previously unselected package librdkafka1:amd64.
Preparing to unpack .../26-librdkafka1_2.3.0-1build2_amd64.deb ...
Unpacking librdkafka1:amd64 (2.3.0-1build2) ...
Selecting previously unselected package libpcre3:amd64.
Preparing to unpack .../27-libpcre3_2%3a8.39-15build1_amd64.deb ...
Unpacking libpcre3:amd64 (2:8.39-15build1) ...
Selecting previously unselected package arkime.
Preparing to unpack .../28-arkime_5.8.3-1.ubuntu2404_amd64.deb ...
Unpacking arkime (5.8.3-1) ...
Selecting previously unselected package libcommon-sense-perl:amd64.
Preparing to unpack .../29-libcommon-sense-perl_3.75-3build3_amd64.deb ...
Unpacking libcommon-sense-perl:amd64 (3.75-3build3) ...
Selecting previously unselected package libdata-dump-perl.
Preparing to unpack .../30-libdata-dump-perl_1.25-1_all.deb ...
Unpacking libdata-dump-perl (1.25-1) ...
Selecting previously unselected package libfont-afm-perl.
Preparing to unpack .../31-libfont-afm-perl_1.20-4_all.deb ...
Unpacking libfont-afm-perl (1.20-4) ...
Selecting previously unselected package libhtml-form-perl.
Preparing to unpack .../32-libhtml-form-perl_6.11-1_all.deb ...
Unpacking libhtml-form-perl (6.11-1) ...
Selecting previously unselected package libhtml-format-perl.
Preparing to unpack .../33-libhtml-format-perl_2.16-2_all.deb ...
Unpacking libhtml-format-perl (2.16-2) ...
Selecting previously unselected package libhttp-daemon-perl.
Preparing to unpack .../34-libhttp-daemon-perl_6.16-1_all.deb ...
Unpacking libhttp-daemon-perl (6.16-1) ...
Selecting previously unselected package libtypes-serialiser-perl.
Preparing to unpack .../35-libtypes-serialiser-perl_1.01-1_all.deb ...
Unpacking libtypes-serialiser-perl (1.01-1) ...
Selecting previously unselected package libjson-xs-perl.
Preparing to unpack .../36-libjson-xs-perl_4.040-0ubuntu0.24.04.1_amd64.deb ...
Unpacking libjson-xs-perl (4.040-0ubuntu0.24.04.1) ...
Selecting previously unselected package libnet-smtp-ssl-perl.
Preparing to unpack .../37-libnet-smtp-ssl-perl_1.04-2_all.deb ...
Unpacking libnet-smtp-ssl-perl (1.04-2) ...
Selecting previously unselected package libmailtools-perl.
Preparing to unpack .../38-libmailtools-perl_2.21-2_all.deb ...
Unpacking libmailtools-perl (2.21-2) ...
Selecting previously unselected package libauthen-sasl-perl.
Preparing to unpack .../39-libauthen-sasl-perl_2.1700-1_all.deb ...
Unpacking libauthen-sasl-perl (2.1700-1) ...
Setting up libfont-afm-perl (1.20-4) ...
Setting up libyaml-dev:amd64 (0.2.5-1build1) ...
Setting up libclone-perl:amd64 (0.46-1build3) ...
Setting up libhtml-tagset-perl (3.20-6) ...
Setting up libyara10:amd64 (4.5.0-1build2) ...
Setting up libauthen-sasl-perl (2.1700-1) ...
Setting up liblwp-mediatypes-perl (6.04-2) ...
Setting up libtry-tiny-perl (0.31-2) ...
Setting up perl-openssl-defaults:amd64 (7build3) ...
Setting up libcommon-sense-perl:amd64 (3.75-3build3) ...
Setting up libencode-locale-perl (1.05-3) ...
Setting up libpcre3:amd64 (2:8.39-15build1) ...
Setting up libdata-dump-perl (1.25-1) ...
Setting up libio-html-perl (1.004-3) ...
Setting up librdkafka1:amd64 (2.3.0-1build2) ...
Setting up libtimedate-perl (2.3300-2) ...
Setting up libtypes-serialiser-perl (1.01-1) ...
Setting up libjson-perl (4.10000-1) ...
Setting up liblua5.4-0:amd64 (5.4.6-3build2) ...
Setting up liburi-perl (5.27-1) ...
Setting up libnet-ssleay-perl:amd64 (1.94-1build4) ...
Setting up libjson-xs-perl (4.040-0ubuntu0.24.04.1) ...
Setting up libhttp-date-perl (6.06-1) ...
Setting up libfile-listing-perl (6.16-1) ...
Setting up libnet-http-perl (6.23-1) ...
Setting up libwww-robotrules-perl (6.02-1) ...
Setting up libhtml-parser-perl:amd64 (3.81-1build3) ...
Setting up libio-socket-ssl-perl (2.085-1) ...
Setting up libhttp-message-perl (6.45-1ubuntu1) ...
Setting up libhtml-form-perl (6.11-1) ...
Setting up libhttp-negotiate-perl (6.01-2) ...
Setting up libhttp-cookies-perl (6.11-1) ...
Setting up libhtml-tree-perl (5.07-3) ...
Setting up libhtml-format-perl (2.16-2) ...
Setting up libnet-smtp-ssl-perl (1.04-2) ...
Setting up libmailtools-perl (2.21-2) ...
Setting up libhttp-daemon-perl (6.16-1) ...
Setting up liblwp-protocol-https-perl (6.13-1) ...
Setting up libwww-perl (6.76-1) ...
Setting up arkime (5.8.3-1) ...
Arkime systemd files copied
Installing logrotate /etc/logrotate.d/arkime to delete files after 14 days
READ /opt/arkime/README.txt and RUN /opt/arkime/bin/Configure
Processing triggers for libc-bin (2.39-0ubuntu8.6) ...
Processing triggers for man-db (2.12.0-4build2) ...
Scanning processes...
Scanning linux images...

Running kernel seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
N: Download is performed unsandboxed as root as file '/home/analyst/arkime_5.8.3-1.ubuntu2404_amd64.deb' couldn't be accessed by user '_apt'. - pkgAcquire::Run (13: Permission denied)
```




```bash
➜  ~ sudo /opt/arkime/bin/Configure
Found interfaces: ens33;lo
Semicolon ';' seperated list of interfaces to monitor [eth1] ens33
Install Elasticsearch server locally for demo, must have at least 3G of memory, NOT recommended for production use (yes or no) [no] no
OpenSearch/Elasticsearch server URL [https://localhost:9200]
OpenSearch/Elasticsearch user [empty is no user] admin
OpenSearch/Elasticsearch password [empty is no password] PleaseChange_M3
Password to encrypt S2S and other things, don't use spaces [must create one] PleaseChange_M3
Arkime - Creating configuration files
Installing sample /opt/arkime/etc/config.ini
Arkime - Installing /etc/security/limits.d/99-arkime.conf to make core and memlock unlimited
Download GEO files? You'll need a MaxMind account https://arkime.com/faq#maxmind (yes or no) [yes] yes
Arkime - Downloading GEO files
2025-12-06 11:50:19 URL:https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv [22972/22972] -> "/tmp/tmp.9e7hTqbDQG" [1]
2025-12-06 11:50:23 URL:https://www.wireshark.org/download/automated/data/manuf [3017090/3017090] -> "/tmp/tmp.ZyNQHNWrqn" [1]

Arkime - Configured - Now continue with step 4 in /opt/arkime/README.txt

 4) The Configure script can install OpenSearch/Elasticsearch for you or you can install yourself
 5) Initialize/Upgrade OpenSearch/Elasticsearch Arkime configuration
  a) If this is the first install, or want to delete all data
      /opt/arkime/db/db.pl http://ESHOST:9200 init
  b) If this is an update to an Arkime package
      /opt/arkime/db/db.pl http://ESHOST:9200 upgrade
 6) Add an admin user if a new install or after an init
      /opt/arkime/bin/arkime_add_user.sh admin "Admin User" THEPASSWORD --admin
 7) Start everything
      systemctl start arkimecapture.service
      systemctl start arkimeviewer.service
 8) Look at log files for errors
      /opt/arkime/logs/viewer.log
      /opt/arkime/logs/capture.log
 9) Visit http://arkimeHOST:8005 with your favorite browser.
      user: admin
      password: THEPASSWORD from step #6

If you want IP -> Geo/ASN to work, you need to setup a maxmind account and the geoipupdate program.
See https://arkime.com/faq#maxmind

Any configuration changes can be made to /opt/arkime/etc/config.ini
See https://arkime.com/faq#arkime-is-not-working for issues

Additional information can be found at:
  * https://arkime.com/install
  * https://arkime.com/faq
  * https://arkime.com/settings
➜  ~ /opt/arkime/db/db.pl --esuser admin https://localhost:9200 init
Enter 6+ character OpenSearch/Elasticsearch password for admin:
It is STRONGLY recommended that you stop ALL Arkime captures and viewers before proceeding.  Use 'db.pl https://localhost:9200 backup' to backup db first.

There is 1 OpenSearch/Elasticsearch data node, if you expect more please fix first before proceeding.

This is a fresh Arkime install
Erasing
Creating
Finished
➜  ~ /opt/arkime/bin/arkime_add_user.sh admin "Admin User" analyst --admin
WARNING - Using authMode=digest since not set, add to config file to silence this warning.
Added
➜  ~ sudo systemctl enable --now arkimecapture
Created symlink /etc/systemd/system/multi-user.target.wants/arkimecapture.service → /etc/systemd/system/arkimecapture.service.
➜  ~ sudo systemctl enable --now arkimeviewer
Created symlink /etc/systemd/system/multi-user.target.wants/arkimeviewer.service → /etc/systemd/system/arkimeviewer.service.
➜  ~ sudo systemctl status arkimecapture
● arkimecapture.service - Arkime Capture
     Loaded: loaded (/etc/systemd/system/arkimecapture.service; enabled; preset: enabled)
     Active: active (running) since Sat 2025-12-06 11:53:26 UTC; 33min ago
   Main PID: 3700 (sh)
      Tasks: 7 (limit: 6957)
     Memory: 330.4M (peak: 330.9M)
        CPU: 9.163s
     CGroup: /system.slice/arkimecapture.service
             ├─3700 /bin/sh -c "/opt/arkime/bin/capture -c /opt/arkime/etc/config.ini  >> /opt/arkime/logs/capture.log 2>&1"
             └─3704 /opt/arkime/bin/capture -c /opt/arkime/etc/config.ini

Dec 06 11:53:26 srv-001 systemd[1]: Starting arkimecapture.service - Arkime Capture...
Dec 06 11:53:26 srv-001 systemd[1]: Started arkimecapture.service - Arkime Capture.
Dec 06 11:53:26 srv-001 (sh)[3700]: arkimecapture.service: Referenced but unset environment variable evaluates to an empty string: OPTIONS
➜  ~ sudo systemctl status arkimeviewer
● arkimeviewer.service - Arkime Viewer
     Loaded: loaded (/etc/systemd/system/arkimeviewer.service; enabled; preset: enabled)
     Active: active (running) since Sat 2025-12-06 11:53:33 UTC; 33min ago
   Main PID: 3772 (sh)
      Tasks: 12 (limit: 6957)
     Memory: 60.2M (peak: 81.7M)
        CPU: 6.735s
     CGroup: /system.slice/arkimeviewer.service
             ├─3772 /bin/sh -c "/opt/arkime/bin/node viewer.js -c /opt/arkime/etc/config.ini  >> /opt/arkime/logs/viewer.log 2>&1"
             └─3776 /opt/arkime/bin/node viewer.js -c /opt/arkime/etc/config.ini

Dec 06 11:53:33 srv-001 systemd[1]: Started arkimeviewer.service - Arkime Viewer.
Dec 06 11:53:33 srv-001 (sh)[3772]: arkimeviewer.service: Referenced but unset environment variable evaluates to an empty string: OPTIONS
➜  ~ tail /opt/arkime/logs/*.log
==> /opt/arkime/logs/capture.log <==
Dec  6 11:53:44 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 201 https://localhost:9200/arkime_dstats/_doc/srv-001-1364-5 802/163 0ms 12ms
Dec  6 11:53:45 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 200 https://localhost:9200/arkime_stats/_doc/srv-001?version_type=external&version=9 797/155 0ms 24ms
Dec  6 11:53:47 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 200 https://localhost:9200/arkime_stats/_doc/srv-001?version_type=external&version=10 798/156 0ms 23ms
Dec  6 11:53:49 http.c:406 arkime_http_curlm_check_multi_info(): 2/6 ASYNC 200 https://localhost:9200/arkime_stats/_doc/srv-001?version_type=external&version=11 798/157 0ms 28ms
Dec  6 11:53:49 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 201 https://localhost:9200/arkime_dstats/_doc/srv-001-1365-5 800/163 0ms 39ms
Dec  6 11:53:51 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 200 https://localhost:9200/arkime_stats/_doc/srv-001?version_type=external&version=12 798/157 0ms 30ms
Dec  6 11:53:53 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 200 https://localhost:9200/arkime_stats/_doc/srv-001?version_type=external&version=13 796/157 0ms 15ms
Dec  6 11:53:54 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 201 https://localhost:9200/arkime_dstats/_doc/srv-001-1366-5 798/163 0ms 28ms
Dec  6 11:53:55 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 200 https://localhost:9200/arkime_stats/_doc/srv-001?version_type=external&version=14 798/157 0ms 28ms
Dec  6 11:53:57 http.c:406 arkime_http_curlm_check_multi_info(): 1/6 ASYNC 200 https://localhost:9200/arkime_stats/_doc/srv-001?version_type=external&version=15 801/157 0ms 32ms

==> /opt/arkime/logs/viewer.log <==
WARNING - Using authMode=digest since not set, add to config file to silence this warning.
WARNING - No cronQueries=true found in /opt/arkime/etc/config.ini, one and only one node MUST have cronQueries=true set for cron/hunts to work
/opt/arkime/viewer/viewer.js listening on host :: port 8005 in development mode
➜  ~ curl -u admin:analyst --digest http://localhost:8005/eshealth.json | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   500  100   500    0     0  16683      0 --:--:-- --:--:-- --:--:-- 17241
{
  "cluster_name": "opensearch",
  "status": "yellow",
  "timed_out": false,
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "discovered_master": true,
  "discovered_cluster_manager": true,
  "active_primary_shards": 21,
  "active_shards": 21,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 1,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "number_of_in_flight_fetch": 0,
  "task_max_waiting_in_queue_millis": 0,
  "active_shards_percent_as_number": 95.45454545454545,
  "version": "2.13.0",
  "molochDbVersion": 82
}
```



Cont3xt Installation Output

```bash
➜  ~ sudo /opt/arkime/bin/Configure --cont3xt
OpenSearch/Elasticsearch server URL [https://localhost:9200]
OpenSearch/Elasticsearch user [empty is no user] admin
OpenSearch/Elasticsearch password [empty is no password] PleaseChange_M3
Password to encrypt users, keys, etc. Should be the same across tools [must create one]
Password to encrypt users, keys, etc. Should be the same across tools [must create one] PleaseChange_M3
Installing sample /opt/arkime/etc/cont3xt.ini
Enabling & Starting cont3xt systemd files
Created symlink /etc/systemd/system/multi-user.target.wants/arkimecont3xt.service → /etc/systemd/system/arkimecont3xt.service.
➜  ~ sudo systemctl enable --now arkimecont3xt
➜  ~ sudo systemctl start --now arkimecont3xt
➜  ~ sudo systemctl status --now arkimecont3xt
● arkimecont3xt.service - Arkime Cont3xt
     Loaded: loaded (/etc/systemd/system/arkimecont3xt.service; enabled; preset: enabled)
     Active: active (running) since Sat 2025-12-06 11:59:53 UTC; 1min 34s ago
   Main PID: 3890 (sh)
      Tasks: 12 (limit: 6957)
     Memory: 41.9M (peak: 76.4M)
        CPU: 1.850s
     CGroup: /system.slice/arkimecont3xt.service
             ├─3890 /bin/sh -c "/opt/arkime/bin/node cont3xt.js -c /opt/arkime/etc/cont3xt.ini  >> /opt/arkime/logs/cont3xt.log 2>&1"
             └─3894 /opt/arkime/bin/node cont3xt.js -c /opt/arkime/etc/cont3xt.ini

Dec 06 11:59:53 srv-001 systemd[1]: Started arkimecont3xt.service - Arkime Cont3xt.
Dec 06 11:59:53 srv-001 (sh)[3890]: arkimecont3xt.service: Referenced but unset environment variable evaluates to an empty string: OPTIONS
➜  ~ tail /opt/arkime/logs/cont3xt.log
WARNING - Using authMode=digest setting since userNameHeader set, add to config file to silence this warning.
/opt/arkime/cont3xt/cont3xt.js listening on host :: port 3218 in development mode
```