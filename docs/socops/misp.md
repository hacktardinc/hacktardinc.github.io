---
title: MISP
description: Malware Information Sharing Platform & Threat Intelligence — Complete Tutorial (Part 1)
icon: lucide/server
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---



??? "Sample Config Files"

    ===  "docker-compose.yaml"


        ```yaml
        services:
        redis: Watch   d Detach
            image: ${REGISTRY_MIRROR_URL:-}valkey/valkey:7.2
            container_name: misp-redis
            restart: unless-stopped
            command: |
            sh -c '
                if [ "$${ENABLE_REDIS_EMPTY_PASSWORD:-false}" = "true" ]; then
                exec valkey-server
                else
                exec valkey-server --requirepass "$${REDIS_PASSWORD:-redispassword}"
                fi
            '
            environment:
            - "ENABLE_REDIS_EMPTY_PASSWORD=${ENABLE_REDIS_EMPTY_PASSWORD:-false}"
            - "REDIS_PASSWORD=${REDIS_PASSWORD:-redispassword}"
            healthcheck:
            test: |
                sh -c '
                if [ "$${ENABLE_REDIS_EMPTY_PASSWORD:-false}" = "true" ]; then
                    valkey-cli -p $${REDIS_PORT:-6379} ping | grep -q PONG || exit 1
                else
                    valkey-cli -a "$${REDIS_PASSWORD:-redispassword}" -p $${REDIS_PORT:-6379} ping | grep -q PONG || exit 1
                fi
                '
            interval: 2s
            timeout: 1s
            retries: 3
            start_period: 5s
            start_interval: 5s
            volumes:
            - cache_data:/data:Z

        db:
            # We use MariaDB because it supports ARM and has the expected collations
            image: ${REGISTRY_MIRROR_URL:-}mariadb:10.11
            container_name: misp-db
            restart: unless-stopped
            environment:
            - "MYSQL_USER=${MYSQL_USER:-misp}"
            - "MYSQL_PASSWORD=${MYSQL_PASSWORD:-example}"
            - "MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-password}"
            - "MYSQL_DATABASE=${MYSQL_DATABASE:-misp}"
            command: "\
            --innodb-buffer-pool-size=${INNODB_BUFFER_POOL_SIZE:-2048M} \
            --innodb-change-buffering=${INNODB_CHANGE_BUFFERING:-none} \
            --innodb-io-capacity=${INNODB_IO_CAPACITY:-1000} \
            --innodb-io-capacity-max=${INNODB_IO_CAPACITY_MAX:-2000} \
            --innodb-log-file-size=${INNODB_LOG_FILE_SIZE:-600M} \
            --innodb-read-io-threads=${INNODB_READ_IO_THREADS:-16} \
            --innodb-stats-persistent=${INNODB_STATS_PERSISTENT:-ON} \
            --innodb-write-io-threads=${INNODB_WRITE_IO_THREADS:-4}"
            volumes:
            - mysql_data:/var/lib/mysql:Z
            cap_add:
            - SYS_NICE # CAP_SYS_NICE Prevent runaway mysql log
            healthcheck:
            test: mysqladmin --user=$$MYSQL_USER --password=$$MYSQL_PASSWORD status
            interval: 2s
            timeout: 1s
            retries: 3
            start_period: 30s
            start_interval: 5s

        misp-core:
            image: ${REGISTRY_MIRROR_URL:-}ghcr.io/misp/misp-docker/misp-core:${CORE_RUNNING_TAG:-latest}
            restart: always
            cap_add:
            - AUDIT_WRITE
            build:
            context: core/.
            args:
                - CORE_TAG=${CORE_TAG:?Missing or outdated .env file, see README.md for instructions}
                - CORE_COMMIT=${CORE_COMMIT}
                - CORE_FLAVOR=${CORE_FLAVOR:-standard}
                - PHP_VER=${PHP_VER:?Missing or outdated .env file, see README.md for instructions}
                - PYPI_REDIS_VERSION=${PYPI_REDIS_VERSION}
                - PYPI_LIEF_VERSION=${PYPI_LIEF_VERSION}
                - PYPI_PYDEEP2_VERSION=${PYPI_PYDEEP2_VERSION}
                - PYPI_PYTHON_MAGIC_VERSION=${PYPI_PYTHON_MAGIC_VERSION}
                - PYPI_MISP_LIB_STIX2_VERSION=${PYPI_MISP_LIB_STIX2_VERSION}
                - PYPI_MAEC_VERSION=${PYPI_MAEC_VERSION}
                - PYPI_MIXBOX_VERSION=${PYPI_MIXBOX_VERSION}
                - PYPI_CYBOX_VERSION=${PYPI_CYBOX_VERSION}
                - PYPI_PYMISP_VERSION=${PYPI_PYMISP_VERSION}
                - PYPI_MISP_STIX_VERSION=${PYPI_MISP_STIX_VERSION}
                - PYPI_TAXII2_CLIENT=${PYPI_TAXII2_CLIENT}
                - PYPI_SETUPTOOLS_VERSION=${PYPI_SETUPTOOLS_VERSION}
                - PYPI_SUPERVISOR_VERSION=${PYPI_SUPERVISOR_VERSION}
            depends_on:
            redis:
                condition: service_healthy
            db:
                condition: service_healthy
            misp-modules:
                condition: service_healthy
            healthcheck:
            test: curl -ks ${BASE_URL:-https://localhost}/users/heartbeat > /dev/null || exit 1
            interval: 2s
            timeout: 1s
            retries: 3
            start_period: 30s
            start_interval: 30s
            ports:
            - "${CORE_HTTP_PORT:-80}:80"
            - "${CORE_HTTPS_PORT:-443}:443"
            volumes:
            - "./configs/:/var/www/MISP/app/Config/:Z"
            - "./logs/:/var/www/MISP/app/tmp/logs/:Z"
            - "./files/:/var/www/MISP/app/files/:Z"
            - "./ssl/:/etc/nginx/certs/:Z"
            - "./gnupg/:/var/www/MISP/.gnupg/:Z"
            # customize by replacing ${CUSTOM_PATH} with a path containing 'files/customize_misp.sh'
            # - "${CUSTOM_PATH}/:/custom/:Z"
            # mount custom ca root certificates
            # - "./rootca.pem:/usr/local/share/ca-certificates/rootca.crt:Z"
            environment:
            - "BASE_URL=${BASE_URL}"
            - "CRON_USER_ID=${CRON_USER_ID}"
            - "CRON_PULLALL=${CRON_PULLALL}"
            - "CRON_PUSHALL=${CRON_PUSHALL}"
            - "DISABLE_IPV6=${DISABLE_IPV6}"
            - "DISABLE_SSL_REDIRECT=${DISABLE_SSL_REDIRECT}"
            - "ENABLE_DB_SETTINGS=${ENABLE_DB_SETTINGS}"
            - "ENABLE_BACKGROUND_UPDATES=${ENABLE_BACKGROUND_UPDATES}"
            - "ENCRYPTION_KEY=${ENCRYPTION_KEY}"
            - "DISABLE_CA_REFRESH=${DISABLE_CA_REFRESH}"
            - "DISABLE_PRINTING_PLAINTEXT_CREDENTIALS=${DISABLE_PRINTING_PLAINTEXT_CREDENTIALS}"
            # standard settings
            - "ADMIN_EMAIL=${ADMIN_EMAIL}"
            - "MISP_CONTACT=${MISP_CONTACT}"
            - "MISP_EMAIL=${MISP_EMAIL}"
            - "ADMIN_PASSWORD=${ADMIN_PASSWORD}"
            - "ADMIN_KEY=${ADMIN_KEY}"
            - "ADMIN_ORG=${ADMIN_ORG}"
            - "ADMIN_ORG_UUID=${ADMIN_ORG_UUID}"
            - "GPG_PASSPHRASE=${GPG_PASSPHRASE}"
            - "ATTACHMENTS_DIR=${ATTACHMENTS_DIR}"
            # OIDC authentication settings
            - "OIDC_ENABLE=${OIDC_ENABLE}"
            - "OIDC_PROVIDER_URL=${OIDC_PROVIDER_URL}"
            - "OIDC_ISSUER=${OIDC_ISSUER}"
            - "OIDC_CLIENT_ID=${OIDC_CLIENT_ID}"
            - "OIDC_CLIENT_SECRET=${OIDC_CLIENT_SECRET}"
            - "OIDC_CODE_CHALLENGE_METHOD=${OIDC_CODE_CHALLENGE_METHOD}"
            - "OIDC_ROLES_PROPERTY=${OIDC_ROLES_PROPERTY}"
            - "OIDC_ROLES_MAPPING=${OIDC_ROLES_MAPPING}"
            - "OIDC_DEFAULT_ORG=${OIDC_DEFAULT_ORG}"
            - "OIDC_MIXEDAUTH=${OIDC_MIXEDAUTH}"
            - "OIDC_AUTH_METHOD=${OIDC_AUTH_METHOD}"
            - "OIDC_REDIRECT_URI=${OIDC_REDIRECT_URI}"
            - "OIDC_SCOPES=${OIDC_SCOPES}"
            - "OIDC_LOGOUT_URL=${OIDC_LOGOUT_URL}"
            - "OIDC_DISABLE_REQUEST_OBJECT=${OIDC_DISABLE_REQUEST_OBJECT}"
            - "OIDC_SKIP_PROXY=${OIDC_SKIP_PROXY}"
            # APACHESECUREAUTH authentication settings
            - "APACHESECUREAUTH_LDAP_OLD_VAR_DETECT=${LDAP_ENABLE}"
            - "APACHESECUREAUTH_LDAP_ENABLE=${APACHESECUREAUTH_LDAP_ENABLE:-${LDAP_ENABLE}}"
            - "APACHESECUREAUTH_LDAP_APACHE_ENV=${APACHESECUREAUTH_LDAP_APACHE_ENV:-${LDAP_APACHE_ENV}}"
            - "APACHESECUREAUTH_LDAP_SERVER=${APACHESECUREAUTH_LDAP_SERVER:-${LDAP_SERVER}}"
            - "APACHESECUREAUTH_LDAP_STARTTLS=${APACHESECUREAUTH_LDAP_STARTTLS:-${LDAP_STARTTLS}}"
            - "APACHESECUREAUTH_LDAP_READER_USER=${APACHESECUREAUTH_LDAP_READER_USER:-${LDAP_READER_USER}}"
            - "APACHESECUREAUTH_LDAP_READER_PASSWORD=${APACHESECUREAUTH_LDAP_READER_PASSWORD:-${LDAP_READER_PASSWORD}}"
            - "APACHESECUREAUTH_LDAP_DN=${APACHESECUREAUTH_LDAP_DN:-${LDAP_DN}}"
            - "APACHESECUREAUTH_LDAP_SEARCH_FILTER=${APACHESECUREAUTH_LDAP_SEARCH_FILTER:-${LDAP_SEARCH_FILTER}}"
            - "APACHESECUREAUTH_LDAP_SEARCH_ATTRIBUTE=${APACHESECUREAUTH_LDAP_SEARCH_ATTRIBUTE:-${LDAP_SEARCH_ATTRIBUTE}}"
            - "APACHESECUREAUTH_LDAP_FILTER=${APACHESECUREAUTH_LDAP_FILTER:-${LDAP_FILTER}}"
            - "APACHESECUREAUTH_LDAP_DEFAULT_ROLE_ID=${APACHESECUREAUTH_LDAP_DEFAULT_ROLE_ID:-${LDAP_DEFAULT_ROLE_ID}}"
            - "APACHESECUREAUTH_LDAP_DEFAULT_ORG=${APACHESECUREAUTH_LDAP_DEFAULT_ORG:-${LDAP_DEFAULT_ORG}}"
            - "APACHESECUREAUTH_LDAP_EMAIL_FIELD=${APACHESECUREAUTH_LDAP_EMAIL_FIELD:-${LDAP_EMAIL_FIELD}}"
            - "APACHESECUREAUTH_LDAP_OPT_PROTOCOL_VERSION=${APACHESECUREAUTH_LDAP_OPT_PROTOCOL_VERSION:-${LDAP_OPT_PROTOCOL_VERSION}}"
            - "APACHESECUREAUTH_LDAP_OPT_NETWORK_TIMEOUT=${APACHESECUREAUTH_LDAP_OPT_NETWORK_TIMEOUT:-${LDAP_OPT_NETWORK_TIMEOUT}}"
            - "APACHESECUREAUTH_LDAP_OPT_REFERRALS=${APACHESECUREAUTH_LDAP_OPT_REFERRALS:-${LDAP_OPT_REFERRALS}}"
            # LdapAuth MISP authentication settings
            - "LDAPAUTH_ENABLE=${LDAPAUTH_ENABLE}"
            - "LDAPAUTH_LDAPSERVER=${LDAPAUTH_LDAPSERVER}"
            - "LDAPAUTH_LDAPDN=${LDAPAUTH_LDAPDN}"
            - "LDAPAUTH_LDAPREADERUSER=${LDAPAUTH_LDAPREADERUSER}"
            - "LDAPAUTH_LDAPREADERPASSWORD=${LDAPAUTH_LDAPREADERPASSWORD}"
            - "LDAPAUTH_LDAPSEARCHFILTER=${LDAPAUTH_LDAPSEARCHFILTER}"
            - "LDAPAUTH_LDAPSEARCHATTRIBUTE=${LDAPAUTH_LDAPSEARCHATTRIBUTE}"
            - "LDAPAUTH_LDAPEMAILFIELD=${LDAPAUTH_LDAPEMAILFIELD}"
            - "LDAPAUTH_LDAPNETWORKTIMEOUT=${LDAPAUTH_LDAPNETWORKTIMEOUT}"
            - "LDAPAUTH_LDAPPROTOCOL=${LDAPAUTH_LDAPPROTOCOL}"
            - "LDAPAUTH_LDAPALLOWREFERRALS=${LDAPAUTH_LDAPALLOWREFERRALS}"
            - "LDAPAUTH_STARTTLS=${LDAPAUTH_STARTTLS}"
            - "LDAPAUTH_MIXEDAUTH=${LDAPAUTH_MIXEDAUTH}"
            - "LDAPAUTH_LDAPDEFAULTORGID=${LDAPAUTH_LDAPDEFAULTORGID}"
            - "LDAPAUTH_LDAPDEFAULTROLEID=${LDAPAUTH_LDAPDEFAULTROLEID}"
            - "LDAPAUTH_UPDATEUSER=${LDAPAUTH_UPDATEUSER}"
            - "LDAPAUTH_DEBUG=${LDAPAUTH_DEBUG}"
            - "LDAPAUTH_LDAPTLSREQUIRECERT=${LDAPAUTH_LDAPTLSREQUIRECERT}"
            - "LDAPAUTH_LDAPTLSCUSTOMCACERT=${LDAPAUTH_LDAPTLSCUSTOMCACERT}"
            - "LDAPAUTH_LDAPTLSCRLCHECK=${LDAPAUTH_LDAPTLSCRLCHECK}"
            - "LDAPAUTH_LDAPTLSPROTOCOLMIN=${LDAPAUTH_LDAPTLSPROTOCOLMIN}"
            # AAD authentication settings
            - "AAD_ENABLE=${AAD_ENABLE}"
            - "AAD_CLIENT_ID=${AAD_CLIENT_ID}"
            - "AAD_TENANT_ID=${AAD_TENANT_ID}"
            - "AAD_CLIENT_SECRET=${AAD_CLIENT_SECRET}"
            - "AAD_REDIRECT_URI=${AAD_REDIRECT_URI}"
            - "AAD_PROVIDER=${AAD_PROVIDER}"
            - "AAD_PROVIDER_USER=${AAD_PROVIDER_USER}"
            - "AAD_MISP_USER=${AAD_MISP_USER}"
            - "AAD_MISP_ORGADMIN=${AAD_MISP_ORGADMIN}"
            - "AAD_MISP_SITEADMIN=${AAD_MISP_SITEADMIN}"
            - "AAD_CHECK_GROUPS=${AAD_CHECK_GROUPS}"
            # nginx settings
            - "NGINX_X_FORWARDED_FOR=${NGINX_X_FORWARDED_FOR}"
            - "NGINX_SET_REAL_IP_FROM=${NGINX_SET_REAL_IP_FROM}"
            - "NGINX_CLIENT_MAX_BODY_SIZE=${NGINX_CLIENT_MAX_BODY_SIZE:-50M}"
            # proxy settings
            - "PROXY_ENABLE=${PROXY_ENABLE}"
            - "PROXY_HOST=${PROXY_HOST}"
            - "PROXY_PORT=${PROXY_PORT}"
            - "PROXY_METHOD=${PROXY_METHOD}"
            - "PROXY_USER=${PROXY_USER}"
            - "PROXY_PASSWORD=${PROXY_PASSWORD}"
            # s3 settings
            - "S3_BUCKET=${S3_BUCKET}"
            - "S3_ENDPOINT=${S3_ENDPOINT}"
            - "S3_ACCESS_KEY=${S3_ACCESS_KEY}"
            - "S3_SECRET_KEY=${S3_SECRET_KEY}"
            # stunnel settings
            - "STUNNEL=${STUNNEL}"
            - "STUNNEL_CONFIG=${STUNNEL_CONFIG}"
            # supervisor settings
            - "SUPERVISOR_HOST=${SUPERVISOR_HOST}"
            - "SUPERVISOR_USERNAME=${SUPERVISOR_USERNAME}"
            - "SUPERVISOR_PASSWORD=${SUPERVISOR_PASSWORD}"
            # sync server settings (see https://www.misp-project.org/openapi/#tag/Servers for more options)
            - "SYNCSERVERS=${SYNCSERVERS}"
            - |
                SYNCSERVERS_1_DATA=
                {
                "remote_org_uuid": "${SYNCSERVERS_1_UUID}",
                "name": "${SYNCSERVERS_1_NAME}",
                "authkey": "${SYNCSERVERS_1_KEY}",
                "url": "${SYNCSERVERS_1_URL}",
                "pull_rules": "${SYNCSERVERS_1_PULL_RULES}",
                "pull": true
                }
            # mysql settings
            - "MYSQL_HOST=${MYSQL_HOST:-db}"
            - "MYSQL_PORT=${MYSQL_PORT:-3306}"
            - "MYSQL_USER=${MYSQL_USER:-misp}"
            - "MYSQL_PASSWORD=${MYSQL_PASSWORD:-example}"
            - "MYSQL_DATABASE=${MYSQL_DATABASE:-misp}"
            # mysql TLS settings
            - "MYSQL_TLS=${MYSQL_TLS:-false}"
            - "MYSQL_TLS_CA=${MYSQL_TLS_CA}"
            - "MYSQL_TLS_CERT=${MYSQL_TLS_CERT}"
            - "MYSQL_TLS_KEY=${MYSQL_TLS_KEY}"
            # redis settings
            - "REDIS_HOST=${REDIS_HOST:-redis}"
            - "REDIS_PORT=${REDIS_PORT:-6379}"
            - "REDIS_PASSWORD=${REDIS_PASSWORD:-redispassword}"
            - "ENABLE_REDIS_EMPTY_PASSWORD=${ENABLE_REDIS_EMPTY_PASSWORD:-false}"
            # debug setting
            - "DEBUG=${DEBUG}"
            # SMTP setting
            - "SMTP_FQDN=${SMTP_FQDN}"
            - "SMTP_PORT=${SMTP_PORT:-25}"
            # NGINX settings
            - "FASTCGI_READ_TIMEOUT=${FASTCGI_READ_TIMEOUT:-300s}"
            - "FASTCGI_SEND_TIMEOUT=${FASTCGI_SEND_TIMEOUT:-300s}"
            - "FASTCGI_CONNECT_TIMEOUT=${FASTCGI_CONNECT_TIMEOUT:-300s}"
            - "FASTCGI_STATUS_LISTEN=${FASTCGI_STATUS_LISTEN}"
            # PHP settings
            - "PHP_MEMORY_LIMIT=${PHP_MEMORY_LIMIT:-2048M}"
            - "PHP_MAX_EXECUTION_TIME=${PHP_MAX_EXECUTION_TIME:-300}"
            - "PHP_UPLOAD_MAX_FILESIZE=${PHP_UPLOAD_MAX_FILESIZE:-50M}"
            - "PHP_POST_MAX_SIZE=${PHP_POST_MAX_SIZE:-50M}"
            - "PHP_MAX_INPUT_TIME=${PHP_MAX_INPUT_TIME:-300}"
            - "PHP_MAX_FILE_UPLOADS=${PHP_MAX_FILE_UPLOADS:-50}"
            # PHP FPM pool setup
            - "PHP_FCGI_CHILDREN=${PHP_FCGI_CHILDREN:-5}"
            - "PHP_FCGI_START_SERVERS=${PHP_FCGI_START_SERVERS:-2}"
            - "PHP_FCGI_SPARE_SERVERS=${PHP_FCGI_SPARE_SERVERS:-1}"
            - "PHP_FCGI_MAX_REQUESTS=${PHP_FCGI_MAX_REQUESTS:-0}"
            # additional PHP settings
            - "PHP_SESSION_TIMEOUT=${PHP_SESSION_TIMEOUT:-60}"
            - "PHP_SESSION_COOKIE_TIMEOUT=${PHP_SESSION_COOKIE_TIMEOUT:-10080}"
            - "PHP_SESSION_DEFAULTS=${PHP_SESSION_DEFAULTS:-php}"
            - "PHP_SESSION_AUTO_REGENERATE=${PHP_SESSION_AUTO_REGENERATE:-false}"
            - "PHP_SESSION_CHECK_AGENT=${PHP_SESSION_CHECK_AGENT:-false}"
            - "PHP_SESSION_COOKIE_SECURE=${PHP_SESSION_COOKIE_SECURE:-true}"
            - "PHP_SESSION_COOKIE_DOMAIN=${PHP_SESSION_COOKIE_DOMAIN}"
            - "PHP_SESSION_COOKIE_SAMESITE=${PHP_SESSION_COOKIE_SAMESITE:-Lax}"
            - "PHP_TIMEZONE=${PHP_TIMEZONE:-UTC}"
            # security settings
            - "HSTS_MAX_AGE=${HSTS_MAX_AGE}"
            - "X_FRAME_OPTIONS=${X_FRAME_OPTIONS}"
            - "CONTENT_SECURITY_POLICY=${CONTENT_SECURITY_POLICY}"
            # compose profiles
            - "COMPOSE_PROFILES=${COMPOSE_PROFILES}"

        misp-modules:
            image: ${REGISTRY_MIRROR_URL:-}ghcr.io/misp/misp-docker/misp-modules:${MODULES_RUNNING_TAG:-latest}
            container_name: misp-modules
            restart: unless-stopped
            build:
            context: modules/.
            args:
                - MODULES_TAG=${MODULES_TAG:?Missing or outdated .env file, see README.md for instructions}
                - MODULES_COMMIT=${MODULES_COMMIT}
                - MODULES_FLAVOR=${MODULES_FLAVOR:-standard}
            healthcheck:
            test: "/bin/bash -c '</dev/tcp/localhost/6666'"
            interval: 2s
            timeout: 1s
            retries: 3
            start_period: 5s
            start_interval: 5s
            volumes:
            # custom MISP modules are loaded at startup time
            - "./custom/action_mod/:/custom/action_mod/:Z"
            - "./custom/expansion/:/custom/expansion/:Z"
            - "./custom/export_mod/:/custom/export_mod/:Z"
            - "./custom/import_mod/:/custom/import_mod/:Z"


        volumes:
        mysql_data:
        cache_data:
        ```

    ===  ".env"

        ```env
        ##
        # Build-time variables
        ##

        CORE_TAG=v2.5.32
        CORE_FLAVOR=standard
        MODULES_TAG=v3.0.5
        MODULES_FLAVOR=standard
        GUARD_TAG=v1.2
        PHP_VER=20240924

        # PYPI_* vars take precedence over MISP's
        PYPI_REDIS_VERSION="==5.0.*"
        PYPI_LIEF_VERSION=">=0.13.1"
        PYPI_PYDEEP2_VERSION="==0.5.*"
        PYPI_PYTHON_MAGIC_VERSION="==0.4.*"
        PYPI_MISP_LIB_STIX2_VERSION="==3.0.*"
        PYPI_MAEC_VERSION="==4.1.*"
        PYPI_MIXBOX_VERSION="==1.0.*"
        PYPI_CYBOX_VERSION="==2.1.*"
        PYPI_PYMISP_VERSION="==2.5.9"
        PYPI_MISP_STIX_VERSION="==2.4.194"
        PYPI_TAXII2_CLIENT="==2.3.0"
        PYPI_SETUPTOOLS_VERSION="==80.3.1"
        PYPI_SUPERVISOR_VERSION="==4.2.5"

        # CORE_COMMIT takes precedence over CORE_TAG
        CORE_COMMIT=0bba3f5
        # MODULES_COMMIT takes precedence over MODULES_TAG
        MODULES_COMMIT=de69ae3
        # GUARD_COMMIT takes precedence over GUARD_TAG
        # GUARD_COMMIT=370b043

        ##
        # Run-time variables
        ##

        CORE_RUNNING_TAG=latest
        MODULES_RUNNING_TAG=latest
        GUARD_RUNNING_TAG=latest

        # optional: use a registry mirror for docker images (include trailing slash, e.g., internal.mirror.com/)
        # REGISTRY_MIRROR_URL=

        # Email/username for user #1, defaults to MISP's default (admin@admin.test)
        ADMIN_EMAIL=stevegeche@gmail.com
        # name of org #1, default to MISP's default (ORGNAME)
        ADMIN_ORG=ACME Corp
        # uuid of org #1, defaults to an automatically generated one
        ADMIN_ORG_UUID=
        # defaults to an automatically generated one
        # ADMIN_KEY=1097f7c1031a576c0fcd5ada1c108e142ab12152e2e26a0f3efc677e054d21fe
        # defaults to MISP's default (admin)
        ADMIN_PASSWORD=analyst
        # Prevent MISP Initialization from writing ADMIN_KEY and ADMIN_PASSWORD in plaintext
        # Recommend uncommenting / setting to true in production or kubernetes environments where output is logged.
        DISABLE_PRINTING_PLAINTEXT_CREDENTIALS=true
        # defaults to 'passphrase'
        GPG_PASSPHRASE=5Y3lcXbLWGDFd8IJzWfHGMj
        # defaults to 1 (the admin user)
        CRON_USER_ID=
        # defaults to 'https://localhost'
        # note: if you are exposing MISP on a non-standard port (i.e., the port is part of the URL you would use to access it, e.g., https://192.168.0.1:4433) you need to include the port in the BASE_URL variable
        BASE_URL=https://192.168.10.215:9443
        # defaults to 80 and 443, don't forget to update the base url if not the defaults one
        CORE_HTTP_PORT=9080
        CORE_HTTPS_PORT=9443
        # store settings in db except those that must stay in config.php. true/false, defaults to false
        ENABLE_DB_SETTINGS=true
        # encryption key. defaults to empty string
        # ENCRYPTION_KEY=8c72b990ca03f375fd1a8b8bc72cc68857132c5faf11fbfae2ae53794e84211a
        # enable background updates. defaults to false
        ENABLE_BACKGROUND_UPDATES=false
        # use a different attachments_dir. defaults to /var/www/MISP/app/files
        ATTACHMENTS_DIR=

        # By default, a daily synchronization is performed, but you can modify this by changing the push and pull frequency (in seconds).
        CRON_PULLALL="86400"
        CRON_PUSHALL="86400"

        # defines the FQDN of the mail sub-system (defaults to 'mail')
        # SMTP_FQDN=
        # override the port of the mail sub-system (defaults to 25)
        # SMTP_PORT=



        # optional comma separated list of IDs of syncservers (e.g. SYNCSERVERS=1)
        # For this to work ADMIN_KEY must be set, or AUTOGEN_ADMIN_KEY must be true (default)
        # SYNCSERVERS=
        # note: if you have more than one syncserver, you need to update docker-compose.yml
        # SYNCSERVERS_1_URL=
        # SYNCSERVERS_1_NAME=
        # SYNCSERVERS_1_UUID=
        # SYNCSERVERS_1_KEY=
        # pull rules are JSON encoded (and escaped) dictionaries
        # Example: only pull events where the analysis is complete
        #       SYNCSERVERS_1_PULL_RULES='{\"tags\":{\"OR\":[],\"NOT\":[]},\"orgs\":{\"OR\":[],\"NOT\":[]},\"url_params\":\"{\\\"searchanalysis\\\": \\\"2\\\"}\"}'
        # SYNCSERVERS_1_PULL_RULES=

        # optional, specify host and credentials for externally running supervisord
        # SUPERVISOR_HOST=
        # SUPERVISOR_USERNAME=
        # SUPERVISOR_PASSWORD=

        # optional and used to set mysql db and credentials
        MYSQL_HOST=db
        MYSQL_PORT=3306
        MYSQL_USER=misp
        MYSQL_PASSWORD=Y1Hc9t50Fsr5PT7oCMJUsAW
        MYSQL_ROOT_PASSWORD=6539Svxz2v5bMQhu6Keb5qv
        MYSQL_DATABASE=misp

        # optional and used to set mysql db TLS configuration
        # MYSQL_TLS=true
        # MYSQL_TLS_CA=/custom/files/tls/mysql_ca.pem
        # MYSQL_TLS_CERT=/custom/files/tls/mysql_pubcert.cert
        # MYSQL_TLS_KEY=/custom/files/tls/mysql_privkey.key

        # optional and used to set redis
        REDIS_HOST=redis
        REDIS_PORT=6379
        # remember to escape special character '$', e.g., 'test1%<$1323>' becomes 'test1%<$$1323>'
        REDIS_PASSWORD=WdMYNZL40HxpsLXmHBDIR7U
        # Enable passwordless Redis connection (defaults to false for security)
        ENABLE_REDIS_EMPTY_PASSWORD=false

        # These variables allows overriding some MISP email values.
        # They all default to ADMIN_EMAIL.

        # MISP.email, used for notifications. Also used
        # for GnuPG.email and GPG autogeneration.
        MISP_EMAIL=stevegeche@gmail.com

        # MISP.contact, the e-mail address that
        # MISP should include as a contact address
        # for the instance's support team.
        MISP_CONTACT=stevegeche@gmail.com

        # Enable GPG autogeneration (default true)
        AUTOCONF_GPG=true

        # Enable admin (user #1) API key autogeneration
        # if ADMIN_KEY is not set above (default true)
        AUTOGEN_ADMIN_KEY=true

        # Disable IPv6 completely
        DISABLE_IPV6=true

        # Disable SSL redirect
        DISABLE_SSL_REDIRECT=true

        # Disable CA refresh
        DISABLE_CA_REFRESH=true

        # Enable OIDC authentication, according to https://github.com/MISP/MISP/blob/2.5/app/Plugin/OidcAuth/README.md
        # OIDC_ENABLE=true
        # OIDC_PROVIDER_URL=
        # OIDC_ISSUER=
        # OIDC_CLIENT_ID=
        # OIDC_CLIENT_SECRET=
        # OIDC_CODE_CHALLENGE_METHOD=S256
        # OIDC_ROLES_PROPERTY="roles"
        # OIDC_ROLES_MAPPING="{\"admin\": 1}"
        # OIDC_DEFAULT_ORG=
        # OIDC_MIXEDAUTH=true
        # OIDC_AUTH_METHOD="client_secret_post"
        # OIDC_REDIRECT_URI=
        # OIDC_SCOPES="[\"profile\", \"email\"]"
        # OIDC_LOGOUT_URL=
        # OIDC_DISABLE_REQUEST_OBJECT=false
        # OIDC_SKIP_PROXY=true

        # Enable LDAP (using the ApacheSecureAuth component) authentication, according to https://github.com/MISP/MISP/issues/6189
        # NOTE: Once you enable LDAP authentication with the ApacheSecureAuth component,
        #       users should not be able to control the HTTP header configured in LDAP_APACHE_ENV
        #       (e.g. REMOTE_USER), this means you must not allow direct access to MISP.
        # NOTE 2: You need to escape special characters twice, e.g., "pass\word" becomes "pass\\\\word".
        # APACHESECUREAUTH_LDAP_ENABLE=true
        # APACHESECUREAUTH_LDAP_APACHE_ENV="REMOTE_USER"
        # APACHESECUREAUTH_LDAP_SERVER="ldap://your_domain_controller"
        # APACHESECUREAUTH_LDAP_STARTTLS=true
        # APACHESECUREAUTH_LDAP_READER_USER="CN=service_account_name,OU=Users,DC=domain,DC=net"
        # APACHESECUREAUTH_LDAP_READER_PASSWORD="password"
        # APACHESECUREAUTH_LDAP_DN="OU=Users,DC=domain,DC=net"
        # APACHESECUREAUTH_LDAP_SEARCH_FILTER=""
        # APACHESECUREAUTH_LDAP_SEARCH_ATTRIBUTE="uid"
        # APACHESECUREAUTH_LDAP_FILTER="[\"mail\", \"uid\", \"cn\" ]"
        # APACHESECUREAUTH_LDAP_DEFAULT_ROLE_ID="3"
        # APACHESECUREAUTH_LDAP_DEFAULT_ORG="1"
        # APACHESECUREAUTH_LDAP_EMAIL_FIELD="[\"mail\"]"
        # APACHESECUREAUTH_LDAP_OPT_PROTOCOL_VERSION="3"
        # APACHESECUREAUTH_LDAP_OPT_NETWORK_TIMEOUT="-1"
        # APACHESECUREAUTH_LDAP_OPT_REFERRALS=false

        # Enable LDAP (using the MISP plugin native) authentication, according to https://github.com/MISP/MISP/tree/2.5/app/Plugin/LdapAuth
        # NOTE 2: You need to escape special characters twice, e.g., "pass\word" becomes "pass\\\\word".
        # LDAPAUTH_ENABLE=true
        # LDAPAUTH_LDAPSERVER="ldap://your_domain_controller"
        # LDAPAUTH_LDAPDN="OU=Users,DC=domain,DC=net"
        # LDAPAUTH_LDAPREADERUSER="CN=service_account_name,OU=Users,DC=domain,DC=net"
        # LDAPAUTH_LDAPREADERPASSWORD="password"
        # LDAPAUTH_LDAPSEARCHFILTER=""
        # LDAPAUTH_LDAPSEARCHATTRIBUTE="mail"
        # LDAPAUTH_LDAPEMAILFIELD="mail"
        # LDAPAUTH_LDAPNETWORKTIMEOUT="-1"
        # LDAPAUTH_LDAPPROTOCOL="3"
        # LDAPAUTH_LDAPALLOWREFERRALS=true
        # LDAPAUTH_STARTTLS=false
        # LDAPAUTH_MIXEDAUTH=true
        # LDAPAUTH_LDAPDEFAULTORGID="1"
        # LDAPAUTH_LDAPDEFAULTROLEID="3"
        # LDAPAUTH_UPDATEUSER=true
        # LDAPAUTH_DEBUG=false
        # LDAPAUTH_LDAPTLSREQUIRECERT="LDAP_OPT_X_TLS_ALLOW"
        # LDAPAUTH_LDAPTLSCUSTOMCACERT=false
        # LDAPAUTH_LDAPTLSCRLCHECK="LDAP_OPT_X_TLS_CRL_PEER"
        # LDAPAUTH_LDAPTLSPROTOCOLMIN="LDAP_OPT_X_TLS_PROTOCOL_TLS1_2"

        # Enable Azure AD (Entra) authentication, according to https://github.com/MISP/MISP/blob/2.4/app/Plugin/AadAuth/README.md
        # AAD_ENABLE=true
        # AAD_CLIENT_ID=
        # AAD_TENANT_ID=
        # AAD_CLIENT_SECRET=
        # AAD_REDIRECT_URI="https://misp.mydomain.com/users/login"
        # AAD_PROVIDER="https://login.microsoftonline.com/"
        # AAD_PROVIDER_USER="https://graph.microsoft.com/"
        # AAD_MISP_USER="Misp Users"
        # AAD_MISP_ORGADMIN="Misp Org Admins"
        # AAD_MISP_SITEADMIN="Misp Site Admins"
        # AAD_CHECK_GROUPS=false

        # Enable the use of a Proxy server (MISP-Guard or external)
        # PROXY_ENABLE=true
        # PROXY_HOST=
        # PROXY_PORT=
        # PROXY_METHOD=
        # PROXY_USER=
        # PROXY_PASSWORD=

        # Set up S3 based attachment storage
        # S3_BUCKET=
        # S3_ENDPOINT=
        # S3_ACCESS_KEY=
        # S3_SECRET_KEY=

        # stunnel configuration for arbitrary proxying of local plaintext connections to tls endpoints
        # STUNNEL=false
        # STUNNEL_CONFIG=/custom/stunnel/stunnel.conf

        ## MISP-Guard
        # Configure rules in ./guard/config.json.
        # Requires restart of misp-guard container after changes.

        # Toggle to enable MISP-Guard container (optional)
        # COMPOSE_PROFILES=misp-guard
        # If you enable MISP-Guard, you must also configure MISP to use it as a proxy:
        # PROXY_PORT must match GUARD_PORT

        # MISP-Guard runtime flags (optional)
        GUARD_PORT=8888
        # mitmdump misp-guard runtime arguments (space separated, no quotes)
        GUARD_ARGS=--ssl-insecure -v

        # Enable debugging
        # ALWAYS SET THIS TO 0 IN PRODUCTION
        # 0 - Debug off (default)
        # 1 - Debug on
        # 2 - Debug on + SQL dump
        DEBUG=1

        # FastCGI configuration on nginx
        # FASTCGI_READ_TIMEOUT=300s
        # FASTCGI_SEND_TIMEOUT=300s
        # FASTCGI_CONNECT_TIMEOUT=300s
        # Where to listen to PHP-FPM status. Can be a port or a ip:port. If not set the status page will not be shown.
        # Do not expose this page in public networks.
        # FASTCGI_STATUS_LISTEN=""

        # PHP FPM configuration

        ## Basic PHP settings
        # Maximum memory a PHP script can use.
        # PHP_MEMORY_LIMIT=2048M
        # Maximum execution time for a PHP script in seconds.
        # PHP_MAX_EXECUTION_TIME=300
        # Maximum file upload size for PHP scripts.
        # PHP_UPLOAD_MAX_FILESIZE=50M
        # Maximum size for POST data sent to PHP.
        # PHP_POST_MAX_SIZE=50M
        # Maximum time PHP spends parsing input data in seconds.
        # PHP_MAX_INPUT_TIME=300
        # Maximum number of file to upload per request.
        # PHP_MAX_FILE_UPLOADS=50

        ## PHP FPM pool setup
        # Maximum number of php-fpm processes, limits the number of simultaneous requests.
        # PHP_FCGI_CHILDREN=5
        # Number of processes created on startup.
        # PHP_FCGI_START_SERVERS=2
        # The desired number of idle server processes.
        # PHP_FCGI_SPARE_SERVERS=1
        # The number of requests each process should execute before respawning. "0" means endless request processing.
        # PHP_FCGI_MAX_REQUESTS=0

        ## Additional PHP settings
        # Timeout (in minutes) for user session inactivity before it expires.
        # PHP_SESSION_TIMEOUT=60
        # Session cookie validity period in minutes.
        # PHP_SESSION_COOKIE_TIMEOUT=10080
        # Default PHP configurations.
        # PHP_SESSION_DEFAULTS=php
        # Automatically regenerate session ID on each request.
        # PHP_SESSION_AUTO_REGENERATE=false
        # Check user agent on each request for security.
        # PHP_SESSION_CHECK_AGENT=false
        # Only send session cookies over HTTPS.
        # PHP_SESSION_COOKIE_SECURE=true
        # Domain for session cookie validity (leave empty for current domain).
        # PHP_SESSION_COOKIE_DOMAIN=
        # SameSite policy for cookies ("Lax" allows top-level navigation).
        # PHP_SESSION_COOKIE_SAMESITE=Lax

        # MariaSQL/MySQL (InnoDB) configuration
        INNODB_BUFFER_POOL_SIZE=2048M
        INNODB_CHANGE_BUFFERING=none
        INNODB_IO_CAPACITY=1000
        INNODB_IO_CAPACITY_MAX=2000
        INNODB_LOG_FILE_SIZE=600M
        INNODB_READ_IO_THREADS=16
        INNODB_STATS_PERSISTENT=ON
        INNODB_WRITE_IO_THREADS=4

        # Whether to enable processing of the X-Forwarded-For header (default to false)
        # NGINX_X_FORWARDED_FOR=true
        # Comma separated list of trusted IP addresses
        # NGINX_SET_REAL_IP_FROM=127.0.0.1

        # Security Settings
        # Maximum time (in seconds) for HSTS (HTTP Strict Transport Security), ensures HTTPS is used.
        # HSTS_MAX_AGE=

        # X-Frame-Options policy configuration: controls whether the site can be embedded in frames or iframes.
        # Options: DENY, SAMEORIGIN, ALLOW-FROM <URL> Default: SAMEORIGIN
        # X_FRAME_OPTIONS=

        # NGINX maximum allowed size of the client request body.
        # NGINX_CLIENT_MAX_BODY_SIZE=50M

        # Content-Security-Policy (CSP) configuration: defines allowed resources and prevents attacks like XSS.
        # Example: "frame-src 'self' https://*.example.com; frame-ancestors 'self' https://*.example.com; object-src 'none'; report-uri https://example.com/cspReport"
        # CONTENT_SECURITY_POLICY=
        ```


![image](https://gist.github.com/user-attachments/assets/2d378e45-c7f3-4024-bd2d-92791fde68a5)

![image](https://gist.github.com/user-attachments/assets/ebf019fc-09f8-48d4-b673-91b3456a5a43)



> **Author's Note:** This is Part 1 of a two-part tutorial. It covers MISP's purpose, architecture, core terminology, data model, and hands-on usage. Part 2 will focus on advanced features, automation, and integration with Cortex and The Hive.

---

## Table of Contents

1. [What is MISP?](#1-what-is-misp)
2. [Why MISP? — The Problem It Solves](#2-why-misp--the-problem-it-solves)
3. [MISP Architecture Overview](#3-misp-architecture-overview)
4. [Core Concepts & Terminology](#4-core-concepts--terminology)
   - 4.1 [Events](#41-events)
   - 4.2 [Attributes](#42-attributes)
   - 4.3 [Objects](#43-objects)
   - 4.4 [Tags & Taxonomies](#44-tags--taxonomies)
   - 4.5 [Galaxies & Clusters](#45-galaxies--clusters)
   - 4.6 [Feeds](#46-feeds)
   - 4.7 [Sharing Groups & Distribution Levels](#47-sharing-groups--distribution-levels)
   - 4.8 [Sightings](#48-sightings)
   - 4.9 [Correlations](#49-correlations)
   - 4.10 [Proposals](#410-proposals)
   - 4.11 [Indicators of Compromise (IoCs)](#411-indicators-of-compromise-iocs)
   - 4.12 [Warninglists](#412-warninglists)
   - 4.13 [Noticelist](#413-noticelist)
5. [MISP Data Model Deep Dive](#5-misp-data-model-deep-dive)
6. [Installing MISP](#6-installing-misp)
7. [MISP User Interface Walkthrough](#7-misp-user-interface-walkthrough)
8. [Working with Events](#8-working-with-events)
9. [Working with Attributes & Objects](#9-working-with-attributes--objects)
10. [Taxonomies In Depth](#10-taxonomies-in-depth)
11. [Galaxies In Depth](#11-galaxies-in-depth)
12. [MISP Feeds — Consuming Threat Intelligence](#12-misp-feeds--consuming-threat-intelligence)
13. [Sharing & Synchronisation](#13-sharing--synchronisation)
14. [MISP REST API Basics](#14-misp-rest-api-basics)
15. [PyMISP — Python Library](#15-pymisp--python-library)
16. [Export Formats & STIX](#16-export-formats--stix)
17. [Best Practices](#17-best-practices)
18. [What's Coming in Part 2](#18-whats-coming-in-part-2)

---

## 1. What is MISP?

**MISP (Malware Information Sharing Platform & Threat Sharing)** is a free and open-source threat intelligence platform designed to improve the sharing of structured threat information among trusted communities. It was originally developed by the **Computer Incident Response Center Luxembourg (CIRCL)** in 2012 and has since grown into one of the most widely adopted threat intelligence platforms in the world, used by national CERTs, financial institutions, defence organisations, and private enterprises.

MISP serves as both a **platform** and a **standard**:

- As a **platform**, it provides a web interface, database, REST API, and automation capabilities to store, manage, correlate, and share threat intelligence.
- As a **standard**, it defines structured data formats (the MISP core format) and ontologies (taxonomies, galaxies) that allow different organisations to speak the same "threat intelligence language."

MISP integrates natively with **The Hive** (incident management) and **Cortex** (threat analysis & enrichment), forming a powerful open-source SOC triad that covers the full threat intelligence lifecycle.

---

## 2. Why MISP? — The Problem It Solves

Before platforms like MISP existed, threat intelligence sharing typically happened via:

- **Email chains** with attached PDFs or spreadsheets
- **Informal community Slack/mailing lists** with unstructured data
- **Proprietary SIEM or TIP (Threat Intelligence Platform) formats** incompatible across tools
- **Manual copy-paste** of IoCs into internal tools

This created several problems:

| Problem | Impact |
|---|---|
| Unstructured data | Hard to automate ingestion or correlation |
| No provenance/attribution | Can't assess reliability of intel |
| Siloed communities | Same threats discovered and mitigated independently by many orgs |
| No standard vocabulary | "APT29" might be called "Cozy Bear", "The Dukes", or "Office Monkeys" in different feeds |
| Slow sharing | By the time intel is formatted and emailed, the threat may be stale |

MISP solves all of the above by providing:

- A **structured data model** (events, attributes, objects)
- **Automated correlation** across thousands of indicators
- **Community sharing** via synchronised MISP instances
- **Standard vocabularies** (taxonomies & galaxies)
- **Machine-readable exports** (STIX, OpenIOC, CSV, JSON, Snort rules, YARA, etc.)
- **REST API** for integration with SIEMs, SOARs, and other security tools

---

## 3. MISP Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          MISP Instance                          │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │   Web UI     │   │  REST API    │   │  Background      │   │
│  │  (CakePHP)   │   │  (JSON/XML)  │   │  Workers (Redis) │   │
│  └──────────────┘   └──────────────┘   └──────────────────┘   │
│           │                 │                    │              │
│  ┌────────▼─────────────────▼────────────────────▼──────────┐  │
│  │                    MySQL / MariaDB                        │  │
│  │              (Events, Attributes, Users...)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │  Taxonomies  │   │   Galaxies   │   │    Warninglists  │   │
│  │  (JSON files)│   │  (JSON files)│   │   (JSON files)   │   │
│  └──────────────┘   └──────────────┘   └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │  Sync           │  Feeds           │  Integrations
          ▼                 ▼                  ▼
   Other MISP         External feeds      The Hive / Cortex
   Instances          (OSINT, ISACs)      SIEMs / SOARs
```

**Key components:**

- **Web Frontend:** Built on CakePHP, provides a full browser-based UI for analysts.
- **MySQL/MariaDB:** Stores all structured data — events, attributes, users, organisations, etc.
- **Redis:** Used for background job queueing (synchronisation, feed pulls, exports).
- **Background Workers:** PHP workers that process jobs from Redis queues.
- **Taxonomies/Galaxies/Warninglists:** Stored as JSON files on the filesystem and loaded into the database.
- **REST API:** Fully featured JSON API that mirrors everything available in the UI.

---

## 4. Core Concepts & Terminology

Understanding MISP's terminology is foundational. Let's go through each concept carefully.

---

### 4.1 Events

An **Event** is the fundamental unit of information in MISP. Think of it as a **container** or **report** that groups related threat intelligence together. An event might represent:

- A specific malware campaign
- A phishing wave targeting your sector
- A vulnerability exploitation attempt
- A full APT intrusion report

**Event fields:**

| Field | Description |
|---|---|
| `uuid` | Universally unique identifier (ensures global uniqueness across federated instances) |
| `info` | Short title/description of the event |
| `date` | Date the event occurred (not created — when the threat activity happened) |
| `threat_level_id` | Risk level: 1=High, 2=Medium, 3=Low, 4=Undefined |
| `analysis` | Maturity: 0=Initial, 1=Ongoing, 2=Completed |
| `distribution` | Who can see this event (see Sharing section) |
| `organisation` | The org that created the event |
| `orgc` | The original creating org (important in sync scenarios) |
| `published` | Whether the event is published (unpublished events are drafts) |
| `timestamp` | Last modification time |
| `Attribute` | Array of all attributes in the event |
| `Object` | Array of MISP objects |
| `Galaxy` | Galaxies attached to the event |
| `Tag` | Tags attached to the event |

**Important workflow:** Events start as **drafts** (unpublished). They are only shared with other MISP instances after they are **Published**. This allows analysts to build an event incrementally before releasing it to the community.

---

### 4.2 Attributes

An **Attribute** is an **atomic piece of threat intelligence** — a single observable or indicator stored within an event. Examples:

- An IP address: `192.168.1.100`
- A domain name: `evil-c2.example.com`
- A file hash: `d41d8cd98f00b204e9800998ecf8427e`
- A URL: `https://malicious.site/payload.exe`
- An email address used in a phishing campaign

**Attribute fields:**

| Field | Description |
|---|---|
| `type` | The type of data (ip-dst, domain, md5, sha256, url, email-src, etc.) |
| `category` | The semantic category (Network activity, Payload delivery, External analysis, etc.) |
| `value` | The actual indicator value |
| `to_ids` | Boolean — should this attribute be exported as an active detection rule (IDS/Snort/YARA)? |
| `comment` | Analyst notes |
| `uuid` | Unique ID |
| `timestamp` | When the attribute was created/modified |
| `distribution` | Can be more restrictive than the event's distribution |
| `correlation_enabled` | Whether MISP should auto-correlate this value |

**The `to_ids` flag** is critically important. It marks whether an attribute is **actionable as an indicator**. For example, a domain that is a known-good site accidentally added to an event should have `to_ids=false`. Only attributes with `to_ids=true` are included in IDS rule exports.

**Attribute types** — MISP supports over 100 attribute types, grouped by category:

| Category | Example Types |
|---|---|
| Network activity | ip-src, ip-dst, domain, hostname, url, uri, AS |
| Payload delivery | md5, sha1, sha256, filename, malware-sample, mime-type |
| External analysis | link, comment, text, other |
| Antivirus detection | link, text (AV vendor detection names) |
| Attribution | threat-actor, campaign-name |
| Financial fraud | btc, iban, bic, cc-number |
| Internal reference | comment, text, other |
| Person | first-name, last-name, passport-number |
| Targeting data | targeted-sector, targeted-country |

---

### 4.3 Objects

**Objects** allow you to group **related attributes** together into a **structured, reusable template**. While individual attributes are atomic, objects represent **composite observables**.

For example, a **`file` object** groups together:
- `filename`
- `md5`
- `sha1`
- `sha256`
- `size-in-bytes`
- `ssdeep`
- `tlsh`

A **`domain-ip` object** groups:
- `domain`
- `ip`
- `first-seen`
- `last-seen`

A **`email` object** groups:
- `from`
- `to`
- `subject`
- `message-id`
- `screenshot`

**Why objects over raw attributes?**

Objects preserve **semantic relationships**. Without objects, if you add a `filename` attribute and an `md5` attribute to an event, MISP doesn't know they refer to the same file. An object explicitly binds them together. MISP ships with over 250 object templates (file, process, network-connection, malware-sample, course-of-action, etc.) and you can create custom templates.

**Object References:** Objects can reference other objects via **Object References**, allowing you to build a **graph of observables**. For example:

```
[network-connection object] ──initiates──> [url object] ──downloads──> [file object]
```

---

### 4.4 Tags & Taxonomies

**Tags** are simple labels applied to events or attributes. They provide **additional context, classification, or workflow state** to data.

Tags can be:
- **Free-form:** e.g., `tlp:red`, `phishing`, `apt29`
- **Taxonomy-based:** Structured tags from a controlled vocabulary (see below)

**Taxonomies** are **structured, machine-readable controlled vocabularies** used to tag events and attributes in a standardised way. Instead of every organisation inventing their own tags, taxonomies ensure that `tlp:red` means the same thing everywhere.

MISP comes with a large library of pre-built taxonomies. Some of the most important:

#### Traffic Light Protocol (TLP)

The most universally used taxonomy in threat intelligence sharing:

| Tag | Meaning |
|---|---|
| `tlp:white` (now `tlp:clear`) | No restrictions on distribution |
| `tlp:green` | Limited to the community, not for public posting |
| `tlp:amber` | Limited to the organisation and direct partners only |
| `tlp:amber+strict` | Only within your own organisation |
| `tlp:red` | Not for sharing — recipient use only |

#### PAP (Permissible Actions Protocol)

Defines **what you can do** with intelligence (as opposed to TLP which defines who can see it):

| Tag | Meaning |
|---|---|
| `pap:white` | No restrictions on use |
| `pap:green` | Can be used for detection and hunting |
| `pap:amber` | Passive use only (no active scanning/blocking) |
| `pap:red` | No active use |

#### Other Common Taxonomies

| Taxonomy | Purpose |
|---|---|
| `misp` | MISP workflow tags (e.g., `misp:confidence-level="fairly-confident"`) |
| `admiralty-scale` | NATO intelligence reliability & credibility rating |
| `kill-chain` | Lockheed Martin Cyber Kill Chain phases |
| `veris` | Verizon DBIR VERIS framework categorisation |
| `malware_classification` | Classify malware type (ransomware, RAT, dropper...) |
| `phishing` | Phishing-specific categorisation |
| `ransomware` | Ransomware-specific categorisation |
| `sector` | Targeted industry sector |
| `nis` | EU NIS Directive categorisation |
| `circl` | CIRCL-specific internal taxonomy |

**Taxonomy structure (JSON example):**

```json
{
  "namespace": "tlp",
  "description": "Traffic Light Protocol",
  "version": 9,
  "predicates": [
    { "value": "clear", "expanded": "TLP:CLEAR" },
    { "value": "green", "expanded": "TLP:GREEN" },
    { "value": "amber", "expanded": "TLP:AMBER" },
    { "value": "red", "expanded": "TLP:RED" }
  ]
}
```

Tags following the taxonomy format look like: `namespace:predicate="value"` — e.g., `admiralty-scale:source-reliability="a"`.

---

### 4.5 Galaxies & Clusters

**Galaxies** are MISP's most powerful knowledge structuring mechanism. They represent **complex, structured knowledge bases** — essentially curated encyclopaedias of threat intelligence concepts.

While taxonomies classify *what you know about* an event (its TLP, its kill chain phase), galaxies describe *who or what* is involved (which threat actor, which malware family, which attack technique).

**A Galaxy** is a named knowledge domain. Each galaxy has many **Clusters**, and each cluster represents a specific **entity** within that domain.

#### Key Built-in Galaxies

| Galaxy | Description |
|---|---|
| **MITRE ATT&CK** | The entire ATT&CK framework — Tactics, Techniques, Sub-techniques, Mitigations |
| **Threat Actors** | Named APT groups and cybercriminal actors (APT28, Lazarus Group, FIN7...) |
| **Malware** | Known malware families (Emotet, TrickBot, Cobalt Strike...) |
| **Tools** | Offensive security tools (Mimikatz, BloodHound, Metasploit...) |
| **Ransomware** | Ransomware families and groups (LockBit, REvil, BlackCat...) |
| **Sector** | Industry sectors (Finance, Energy, Healthcare...) |
| **Country** | Nation-state actors and target countries |
| **MITRE ATLAS** | ATT&CK for ML/AI systems |
| **MITRE D3FEND** | Defensive techniques mapped to ATT&CK |
| **Sigma Rules** | Sigma detection rules as galaxy clusters |
| **Backdoor** | Known backdoor malware |
| **Exploit-Kit** | Known exploit kits |
| **Malpedia** | Links to Malpedia malware database |

#### Galaxy Cluster Detail

A **Cluster** within a galaxy is a rich, structured entry. For example, the **Threat Actors galaxy cluster for APT28** includes:

```json
{
  "value": "APT28",
  "description": "A Russia-nexus threat actor known for targeted espionage operations...",
  "uuid": "5b4ee3ea-eee3-4c8e-8323-85ae32658754",
  "meta": {
    "synonyms": ["Fancy Bear", "Sofacy", "STRONTIUM", "Pawn Storm", "Sednit"],
    "country": ["RU"],
    "refs": ["https://attack.mitre.org/groups/G0007/"],
    "cfr-target-category": ["Government", "Military"]
  }
}
```

This means when you tag an event with the APT28 cluster, you're linking it to a **rich, cross-referenced, community-maintained profile** of that threat actor — including all their known synonyms, country attribution, references, and techniques.

#### Attaching Galaxies to Events

When creating an event, you can attach galaxy clusters at the **event level** (attributing the whole event to a threat actor or malware family) or at the **attribute/object level** (e.g., this specific file hash belongs to TrickBot).

To attach: Event → Edit → Galaxy tab → Search for cluster → Add.

#### MITRE ATT&CK Galaxy — Special Importance

The MITRE ATT&CK galaxy is arguably the most important. It maps every technique and sub-technique from the ATT&CK framework:

```
Tactic:          Execution
Technique:       T1059 - Command and Scripting Interpreter
Sub-technique:   T1059.001 - PowerShell
```

Tagging events/attributes with ATT&CK techniques allows you to:
- Build **ATT&CK Navigator heat maps** showing your adversary's TTP coverage
- Automatically generate **detection rule recommendations**
- Feed into **threat intelligence reports** with standardised technique references
- Drive **purple team exercises** based on observed techniques

---

### 4.6 Feeds

**Feeds** are external sources of MISP-formatted (or convertible) threat intelligence that your MISP instance can **automatically pull and ingest** on a schedule.

Feeds can be:
- **MISP Feeds:** JSON data in MISP event format hosted on a web server
- **Freetext Feeds:** Unstructured text (one IoC per line) that MISP parses using its freetext import engine
- **CSV Feeds:** Comma-separated values with configurable column mapping

**Default feeds included in MISP:**

| Feed | Source | Content |
|---|---|---|
| CIRCL OSINT Feed | CIRCL | General OSINT events |
| Botvrij.eu | Botvrij | Malicious domains, IPs |
| ESET | ESET | Malware IoCs |
| Abuse.ch URLhaus | Abuse.ch | Malicious URLs |
| Abuse.ch MalwareBazaar | Abuse.ch | Malware hashes |
| Abuse.ch ThreatFox | Abuse.ch | IoCs with context |
| Emerging Threats | ET | Network-level signatures |
| PhishTank | PhishTank | Phishing URLs |
| COVID-19 MISP | CIRCL | COVID-19 related threats |

**Feed configuration options:**

- **Caching:** Feeds can be cached locally for fast correlation without importing all events
- **Delta merging:** Only pull new/changed events since the last pull
- **Rules:** Filter which events/attributes to import based on tags or other criteria
- **Lookup only:** Use the feed for correlation without importing data into your event database

---

### 4.7 Sharing Groups & Distribution Levels

One of MISP's core features is **granular, trust-aware sharing**. Every event and attribute has a **distribution level**:

| Level | Name | Who sees it |
|---|---|---|
| 0 | Your organisation only | Private — only members of your org |
| 1 | This community only | All users on your local MISP instance |
| 2 | Connected communities | Your instance + directly connected instances |
| 3 | All communities | Propagates to all interconnected MISP instances |
| 4 | Sharing Group | Only the organisations defined in the Sharing Group |

**Sharing Groups** (level 4) provide the most fine-grained control. You can define a custom list of organisations that can receive specific events, regardless of the sync topology. For example, you might create a "Financial Sector ISAC" sharing group containing 15 specific banks.

**Sync flow:** When MISP instances are synchronised (using a pull or push mechanism), events propagate based on their distribution level. A level-3 event will propagate far and wide; a level-0 event stays local.

---

### 4.8 Sightings

**Sightings** allow organisations to **report that they have observed** a specific attribute in their environment — confirming that an indicator is still active and relevant.

Types of sightings:
- **Sighting (0):** "I saw this IoC in my environment" — confirms it's active
- **False Positive (1):** "This IoC is a false positive in my environment"
- **Expiration (2):** "This IoC has expired / is no longer relevant"

Sightings are crucial for **indicator lifecycle management**. An IP address flagged as malicious 2 years ago may now host legitimate infrastructure. Sightings (and their absence) help the community know which indicators are still hot.

MISP can also accept **passive DNS sightings** and **SIEM-generated sightings** via the API, allowing automated confirmation of indicators from your security tooling.

---

### 4.9 Correlations

MISP automatically **correlates attributes** across all events in the database. When you add an attribute (e.g., an IP address), MISP searches all existing events for the same value and creates **correlation links**.

If the same IP appears in 5 different events created by 3 different organisations, you immediately know:
- This IP is widely observed (high confidence)
- You can see all the contexts in which it appeared
- Pivot investigation across those events

**Correlation graph:** MISP provides a visual correlation graph showing how events and attributes are interconnected — an invaluable tool for threat hunting and attribution.

**Correlation settings:**
- Correlations can be disabled per-attribute (for common values like `127.0.0.1` that would create meaningless noise)
- Excluded values/types can be globally configured (e.g., never correlate on `text` or `comment` attributes)
- **Over-correlating values** (like a common user agent) can be added to the exclusion list

---

### 4.10 Proposals

**Proposals** are MISP's mechanism for suggesting changes to events **you don't own**.

If Organisation A creates an event and Organisation B (who received it via sync) notices an error or wants to add context, B can create a **Proposal** suggesting:
- A new attribute value
- A correction to an existing attribute
- A deletion of an incorrect attribute

Organisation A then **accepts or rejects** the proposal. This maintains the integrity of the original source while enabling collaborative improvement of intelligence. Accepted proposals update the original event; rejected proposals are discarded.

---

### 4.11 Indicators of Compromise (IoCs)

An **Indicator of Compromise (IoC)** is any piece of forensic evidence that suggests a system may have been compromised. In MISP, IoCs are primarily represented as **attributes with `to_ids=true`**.

IoC types in MISP include:

- **Network-based:** IP addresses, domains, URLs, JA3/JA3S hashes, DNS records
- **Host-based:** File hashes (MD5, SHA1, SHA256, SHA512, SSDEEP, TLSH), filenames, registry keys, mutex names, process names, pipe names
- **Email-based:** Sender addresses, subject lines, header values, attachment hashes
- **Behavioural:** YARA rules, Sigma rules, Snort/Suricata rules

The `to_ids` flag determines whether the attribute will be exported as an **active detection rule**. MISP can export `to_ids=true` attributes as:
- Snort/Suricata rules
- YARA rules
- CSV lists for SIEM ingestion
- STIX indicators

---

### 4.12 Warninglists

**Warninglists** are lists of **well-known, commonly used values** that should not be considered malicious — essentially allowlists that prevent false positives.

Examples:
- Common RFC-1918 private IP ranges (`10.0.0.0/8`, `192.168.0.0/16`)
- Public DNS resolvers (`8.8.8.8`, `1.1.1.1`)
- CDN IP ranges (Cloudflare, Akamai, Fastly)
- Popular domains (google.com, microsoft.com, amazon.com)
- Top Alexa/Tranco domains
- Common hashes (empty file hash, null hash)
- Known legitimate user agents

When an attribute matches a warninglist entry, MISP displays a **warning indicator** next to the attribute. This doesn't block the attribute — it just alerts analysts that this value might not be meaningful as an IoC.

Warninglists are maintained in the `misp-warninglists` GitHub repository and can be updated from within MISP.

---

### 4.13 Noticelist

**Noticelists** inform MISP users about **legal or policy considerations** that apply to specific attribute types. For example:

- GDPR notice for personal data (email addresses, names, phone numbers) — reminds analysts that sharing PII across borders may have legal implications
- Notices about specific country-level data protection regulations

Noticelists appear as informational banners when analysts work with sensitive attribute types.

---

## 5. MISP Data Model Deep Dive

Let's look at how all these concepts fit together in a real-world scenario.

```
EVENT: "Emotet Campaign Targeting European Finance Sector - Q4 2024"
├── Tags
│   ├── tlp:amber
│   ├── kill-chain:delivery
│   └── sector:finance
│
├── Galaxies
│   ├── Threat Actor: Mealybug (Emotet operators)
│   ├── Malware: Emotet
│   └── ATT&CK: T1566.001 (Spearphishing Attachment)
│
├── Attributes
│   ├── [email-subject] "Invoice_November_2024.doc" [to_ids=false]
│   ├── [email-src] "invoices@fake-accountingfirm.eu" [to_ids=true]
│   ├── [ip-dst] "185.220.101.45" [to_ids=true]
│   ├── [domain] "update-service.top" [to_ids=true]
│   └── [url] "http://update-service.top/ld/get.php" [to_ids=true]
│
├── Objects
│   ├── [file object]
│   │   ├── filename: Invoice_November_2024.doc
│   │   ├── md5: 5f4dcc3b5aa765d61d8327deb882cf99
│   │   ├── sha256: 6b86b273ff34fce19d6b804eff5a3f57...
│   │   └── size-in-bytes: 204800
│   │
│   └── [network-connection object]
│       ├── ip-dst: 185.220.101.45
│       ├── dst-port: 443
│       └── protocol: tcp
│
└── Correlations (auto-generated by MISP)
    ├── → Event #4521 (same IP seen in banking trojan campaign)
    └── → Event #4478 (same domain seen 3 weeks prior)
```

---

## 6. Installing MISP

### Option A: Automated Script (Recommended for Production)

MISP provides an official automated installer for Ubuntu and Debian:

```bash
# Download and run the official installer
wget -O /tmp/misp-install.sh https://raw.githubusercontent.com/MISP/MISP/2.4/INSTALL/INSTALL.sh
bash /tmp/misp-install.sh
```

The installer handles:
- Apache/Nginx web server configuration
- MySQL/MariaDB setup
- PHP dependencies
- Redis installation
- Python dependencies and PyMISP
- MISP configuration files
- Initial database schema and seed data

### Option B: Docker (Development/Testing)

```bash
# Clone the Docker repository
git clone https://github.com/MISP/misp-docker.git
cd misp-docker

# Copy and edit environment variables
cp template.env .env
# Edit .env with your settings (admin email, password, base URL)

# Launch with Docker Compose
docker-compose up -d

# MISP will be available at https://localhost
```

### Option C: MISP Virtual Machine

CIRCL provides pre-built VM images for VMware and VirtualBox:
- Download from: [https://vm.misp-project.org/](https://vm.misp-project.org/)
- Credentials: `admin@admin.test` / `admin`
- Suitable for evaluation and training

### Post-Installation Checklist

```
[ ] Change default admin password
[ ] Set correct base URL in Administration → Server Settings → MISP
[ ] Configure outbound email (SMTP settings)
[ ] Enable and update taxonomies (Administration → Taxonomies → Update)
[ ] Enable and update galaxies (Administration → Galaxies → Update)
[ ] Update warninglists (Administration → Warninglists → Update)
[ ] Configure background workers (Administration → Jobs)
[ ] Set up at least one feed (Sync Actions → Feeds)
[ ] Create your organisation profile
[ ] Create initial user accounts
```

---

## 7. MISP User Interface Walkthrough

### Top Navigation Bar

| Menu | Contains |
|---|---|
| **Home** | Dashboard with recent events, statistics |
| **Event Actions** | List/search events, add event, import |
| **Sync Actions** | Feeds, servers (sync partners) |
| **Global Actions** | API access, export, import |
| **Administration** | Server settings, users, orgs, roles, taxonomies, galaxies |
| **Audit** | Access logs, change logs |

### Dashboard

The dashboard displays:
- Recent events (published/unpublished)
- Quick statistics (total events, attributes, users, orgs)
- Trending tags
- Recent sightings

### Event List View

The event list (`/events/index`) shows all events you have access to, with columns for:
- Event ID (local), UUID (global)
- Organisation
- Clusters (galaxy tags)
- Tags
- Attributes count
- Date
- Threat level
- Analysis state
- Distribution
- Published state

You can **filter** by: date range, organisation, tags, threat level, publishing state, and free text search.

---

## 8. Working with Events

### Creating an Event

1. Go to **Event Actions → Add Event**
2. Fill in:
   - **Date:** When the threat activity occurred
   - **Threat Level:** High / Medium / Low / Undefined
   - **Analysis:** Initial / Ongoing / Completed
   - **Event Info:** A clear, descriptive title
   - **Distribution:** Start with "Your organisation only" while building
3. Click **Add**

You are now in the event edit view.

### Publishing an Event

Once your event is complete:
1. Add all attributes, objects, tags, and galaxies
2. Click **Publish** button (or use the `Publish` checkbox in the event edit form)
3. Optionally send an **email alert** to users

**Warning:** Publishing is irreversible in terms of sync — once a level-3 event is published, it will propagate to connected instances. You can still edit it after publishing, and updates will sync.

### Free Text Import

MISP has a powerful **freetext import** feature that parses unstructured text and extracts IoCs automatically:

1. In the event, click **Populate from** → **Free-text import**
2. Paste a block of text (e.g., a threat report, email header, paste dump)
3. MISP will identify and extract: IPs, domains, URLs, hashes, emails, CVEs
4. Review, categorise, and set `to_ids` flags on extracted attributes
5. Click **Submit**

### Bulk Import via CSV

```
# Event Actions → Import from... → CSV Import
# CSV format: category,type,value,comment,to_ids
Network activity,ip-dst,185.220.101.45,C2 server,1
Payload delivery,sha256,6b86b273ff34fce...,Emotet loader,1
Payload delivery,url,http://evil.site/payload.exe,Download URL,1
```

---

## 9. Working with Attributes & Objects

### Adding an Attribute Manually

1. In event view, click **Add Attribute**
2. Select **Category** (e.g., "Network activity")
3. Select **Type** (e.g., "ip-dst") — the type dropdown filters based on category
4. Enter **Value**
5. Set **to_ids** (checkbox) — is this an active indicator?
6. Add a **Comment** for context
7. Set **Distribution** (defaults to event's distribution)
8. Click **Add**

### Adding an Object

1. In event view, click **Add Object**
2. Browse or search the object template library
3. Select a template (e.g., "file")
4. Fill in the relevant fields — some fields are required, others optional
5. Add **relationships** to other objects if applicable (e.g., this file `drops` another file object)
6. Click **Save**

### MISP Object Templates

You can view all available templates at `/objectTemplates/index`. Each template defines:
- Required vs optional attributes
- Attribute types allowed per field
- Semantic meaning of relationships

Custom templates can be created and imported from JSON files.

---

## 10. Taxonomies In Depth

### Enabling Taxonomies

1. Go to **Administration → Taxonomies**
2. Find the taxonomy you want (e.g., `tlp`)
3. Click **Enable**

Once enabled, taxonomy tags become available when tagging events and attributes.

### Using the Taxonomy Tagger

When editing an event or attribute:
1. Click the **Tag** field
2. Start typing a taxonomy namespace (e.g., "tlp")
3. MISP autocompletes and shows valid taxonomy tags
4. Click to add

### Creating Custom Taxonomies

Taxonomies are JSON files following the MISP taxonomy schema. To add a custom one:

```json
{
  "namespace": "my-org",
  "description": "Internal classification taxonomy for My Organisation",
  "version": 1,
  "exclusive": false,
  "predicates": [
    {
      "value": "incident-type",
      "expanded": "Incident Type",
      "description": "Classification of internal incident type"
    }
  ],
  "values": [
    {
      "predicate": "incident-type",
      "entry": [
        { "value": "phishing", "expanded": "Phishing Attack" },
        { "value": "ransomware", "expanded": "Ransomware Incident" },
        { "value": "insider-threat", "expanded": "Insider Threat" }
      ]
    }
  ]
}
```

Place the JSON in `/var/www/MISP/app/files/taxonomies/my-org/machinetag.json` and click **Update** in the UI.

---

## 11. Galaxies In Depth

### Attaching Galaxy Clusters to Events

1. In event view, click the **Galaxy** tab
2. Search for a cluster by name (e.g., "APT28", "Emotet", "T1059")
3. Click **Add**

MISP displays galaxy clusters visually in the event view with their full metadata.

### ATT&CK Navigator Integration

MISP can export an event's ATT&CK technique coverage to a **MITRE ATT&CK Navigator** layer file:

1. Open an event
2. **Download** → **ATT&CK Navigator Layer**
3. Import into [https://mitre-attack.github.io/attack-navigator/](https://mitre-attack.github.io/attack-navigator/)

This generates a heatmap of all techniques observed in that event.

### Updating Galaxies

Galaxies are maintained by the community and updated regularly. To update:

1. **Administration → Galaxies → Update all**

Or via CLI:

```bash
cd /var/www/MISP
sudo -u www-data git -C /var/www/MISP/app/files/misp-galaxy pull
sudo -u www-data php /var/www/MISP/app/Console/cake Admin updateGalaxies
```

### Custom Galaxies

Like taxonomies, galaxies are JSON files. You can create custom galaxy clusters for internal threat actors, custom malware families, or any other structured knowledge:

```json
{
  "name": "Internal Threat Actors",
  "type": "internal-threat-actor",
  "description": "Tracked internal threat actors for SOC use",
  "uuid": "your-uuid-here",
  "version": 1,
  "values": [
    {
      "value": "TA-2024-001",
      "description": "Unknown actor targeting our HR systems",
      "uuid": "cluster-uuid-here",
      "meta": {
        "first-seen": "2024-01-15",
        "status": "active"
      }
    }
  ]
}
```

---

## 12. MISP Feeds — Consuming Threat Intelligence

### Enabling Feeds

1. **Sync Actions → Feeds**
2. MISP ships with a list of pre-configured feeds (disabled by default)
3. Click the **Toggle** button to enable feeds
4. Click **Fetch now** to trigger an immediate pull
5. Configure **scheduled fetching** via cron or the background worker

### Feed Caching vs Full Import

**Caching** downloads feed data locally for fast correlation lookups, **without** importing events into your event database. This keeps your event list clean while still benefiting from correlation against large feeds.

```
Enable caching: Feed settings → Cache feed = Yes
```

**Full import** imports feed events as actual MISP events — useful for smaller, high-quality feeds where you want the full context available to analysts.

### Adding a Custom Feed

1. **Sync Actions → Feeds → Add Feed**
2. Configure:
   - **Name:** Descriptive name
   - **Provider:** Source organisation
   - **URL:** Feed endpoint URL
   - **Input Source:** Network (URL) or Local (filesystem path)
   - **Source Format:** MISP, Freetext, or CSV
   - **Distribution:** What distribution level to apply to imported events
   - **Caching:** Enable/disable
   - **Rules:** Filter which events to import (by tags or org)

---

## 13. Sharing & Synchronisation

### Setting Up a Sync Connection

To sync with another MISP instance:

**On the remote instance:**
1. Create a **Sync User** account (role: Sync user)
2. Note the API key for that user

**On your instance:**
1. **Sync Actions → List Servers → Add Server**
2. Fill in:
   - **Base URL:** `https://remote-misp.example.com`
   - **Organisation:** The remote org (must exist in your system)
   - **Authkey:** API key of the sync user on the remote instance
   - **Push:** Enable to push your events to them
   - **Pull:** Enable to pull their events to you
3. **Test Connection** before saving

### Push vs Pull

| Mode | Description |
|---|---|
| **Push** | Your instance pushes new/updated events to the remote instance |
| **Pull** | Your instance polls the remote instance for new/updated events |
| **Both** | Bidirectional sync |

Push is faster (real-time propagation) but requires the remote instance to trust yours. Pull is more conservative and works even if you can't accept incoming connections.

### Synchronisation Rules

You can set rules on sync connections to filter what is shared:
- **Push rules:** Filter which events to push based on tags
- **Pull rules:** Filter which events to pull based on tags

Example: Only pull events tagged with `tlp:white` or `tlp:green`.

---

## 14. MISP REST API Basics

MISP has a comprehensive REST API that allows **full programmatic control** over all MISP features. Authentication uses an **API key** (also called an authkey).

### Getting Your API Key

1. Go to your user profile (top right → My Profile)
2. Note your **Authkey** (or regenerate it)

### API Authentication

All API requests require the header:
```
Authorization: <your-api-key>
```

Or alternatively:
```
Authorization: Bearer <your-api-key>
```

With content type:
```
Content-Type: application/json
Accept: application/json
```

### Common API Endpoints

#### Search Events

```bash
curl -s -H "Authorization: YOUR_API_KEY" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -X POST https://your-misp.example.com/events/restSearch \
     -d '{
       "returnFormat": "json",
       "limit": 10,
       "tags": ["tlp:amber"],
       "dateFrom": "2024-01-01"
     }'
```

#### Add an Event

```bash
curl -s -H "Authorization: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -X POST https://your-misp.example.com/events \
     -d '{
       "Event": {
         "info": "Test Event via API",
         "date": "2024-11-15",
         "threat_level_id": "2",
         "analysis": "0",
         "distribution": "0"
       }
     }'
```

#### Add an Attribute

```bash
curl -s -H "Authorization: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -X POST https://your-misp.example.com/attributes \
     -d '{
       "Attribute": {
         "event_id": "123",
         "type": "ip-dst",
         "category": "Network activity",
         "value": "185.220.101.45",
         "to_ids": true,
         "comment": "C2 server"
       }
     }'
```

#### Search Attributes (IoC Lookup)

```bash
curl -s -H "Authorization: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -X POST https://your-misp.example.com/attributes/restSearch \
     -d '{
       "returnFormat": "json",
       "type": "ip-dst",
       "value": "185.220.101.45"
     }'
```

#### Publish an Event

```bash
curl -s -H "Authorization: YOUR_API_KEY" \
     -X POST https://your-misp.example.com/events/publish/123
```

### REST API Response Format

All responses follow the format:
```json
{
  "response": {
    "Event": { ... }
  }
}
```

For search responses:
```json
{
  "response": [
    { "Event": { ... } },
    { "Event": { ... } }
  ]
}
```

### API via the MISP UI

MISP provides an interactive **REST Client** built into the UI:
- **Global Actions → REST Client**
- Allows you to construct and test API queries without leaving the browser
- Shows the exact request and response JSON

---

## 15. PyMISP — Python Library

**PyMISP** is the official Python library for interacting with MISP's API. It abstracts the REST calls into clean Python objects.

### Installation

```bash
pip install pymisp
```

### Basic Usage

```python
from pymisp import PyMISP, MISPEvent, MISPAttribute

# Initialise the connection
misp = PyMISP(
    url='https://your-misp.example.com',
    key='YOUR_API_KEY',
    ssl=True  # Set False if using self-signed certs (not recommended in production)
)

# ─── Search for events ───────────────────────────────────────────
events = misp.search(
    controller='events',
    tags=['tlp:amber'],
    date_from='2024-01-01',
    limit=10
)
for event in events:
    print(f"ID: {event['Event']['id']} | {event['Event']['info']}")

# ─── Create a new event ──────────────────────────────────────────
event = MISPEvent()
event.info = 'Emotet campaign - Python created'
event.date = '2024-11-15'
event.threat_level_id = 2  # Medium
event.analysis = 0          # Initial
event.distribution = 0      # Your org only

created = misp.add_event(event)
event_id = created['Event']['id']
print(f"Created event ID: {event_id}")

# ─── Add an attribute ────────────────────────────────────────────
attr = MISPAttribute()
attr.type = 'ip-dst'
attr.category = 'Network activity'
attr.value = '185.220.101.45'
attr.to_ids = True
attr.comment = 'Emotet C2 server'

misp.add_attribute(event_id, attr)

# ─── Add a tag ───────────────────────────────────────────────────
misp.tag(event_id, 'tlp:amber')

# ─── Publish the event ───────────────────────────────────────────
misp.publish(event_id)
print("Event published!")

# ─── Search for a specific IoC ───────────────────────────────────
results = misp.search(
    controller='attributes',
    type_attribute='ip-dst',
    value='185.220.101.45'
)
if results:
    print(f"IoC found in {len(results)} event(s)")
else:
    print("IoC not found in MISP")
```

### Advanced: Adding Objects

```python
from pymisp import MISPObject

# Create a file object
file_object = MISPObject('file')
file_object.add_attribute('filename', value='Invoice_November_2024.doc')
file_object.add_attribute('md5', value='5f4dcc3b5aa765d61d8327deb882cf99')
file_object.add_attribute('sha256', value='6b86b273ff34fce19d6b804eff5a3f5701f57de')
file_object.add_attribute('size-in-bytes', value=204800)

misp.add_object(event_id, file_object)
```

---

## 16. Export Formats & STIX

MISP supports numerous **export formats**, allowing integration with virtually any security tool.

### Available Export Formats

| Format | Use Case |
|---|---|
| **JSON** | Full MISP event format for import/export between instances |
| **STIX 1.x** | Interoperability with TAXII-based systems |
| **STIX 2.0/2.1** | Modern threat intelligence exchange |
| **CSV** | Simple attribute export for spreadsheets/SIEM |
| **Snort** | IDS rules for Snort/Suricata |
| **Suricata** | Suricata-specific rule format |
| **YARA** | YARA malware detection rules |
| **OpenIOC** | OpenIOC format |
| **RPZ** | Response Policy Zone (DNS blocking) |
| **Bro/Zeek** | Network analysis rules |
| **Text** | Plain text attribute values |
| **Cached export** | Pre-generated cached exports for large datasets |

### Exporting via UI

Event view → **Download** → Select format

### Exporting via API

```bash
# Export event as STIX 2
curl -H "Authorization: YOUR_KEY" \
     -H "Accept: application/json" \
     https://your-misp.example.com/events/restSearch/returnFormat:stix2/eventid:123

# Export all IDS-flagged attributes as Snort rules
curl -H "Authorization: YOUR_KEY" \
     https://your-misp.example.com/attributes/snort/download

# Export all IDS-flagged attributes as YARA
curl -H "Authorization: YOUR_KEY" \
     https://your-misp.example.com/attributes/yara/download
```

### STIX 2.1 Integration

MISP has a bidirectional STIX 2.1 mapping. Key mappings:

| MISP Concept | STIX 2.1 Object |
|---|---|
| Event | `bundle` + `report` |
| Attribute (to_ids=true) | `indicator` |
| Attribute (to_ids=false) | `observed-data` |
| Object | `observed-data` or domain-specific SDO |
| Galaxy - Threat Actor | `threat-actor` |
| Galaxy - Malware | `malware` |
| Galaxy - ATT&CK | `attack-pattern` |
| Tag (TLP) | `marking-definition` |
| Relationship | `relationship` |

---

## 17. Best Practices

### Event Quality

- **Use descriptive `info` fields:** "Emotet Campaign Q4 2024 - European Finance" is far more useful than "malware"
- **Set `to_ids` correctly:** Only flag attributes that are genuinely actionable as IoCs
- **Set proper distribution before publishing:** Changing from level 3 to level 0 after publishing won't recall it from synced instances
- **Use objects instead of loose attributes** where relationships matter
- **Always attach relevant galaxies** — they massively increase the value of your events for recipients
- **Tag with TLP before publishing** — never publish without a TLP tag

### Indicator Lifecycle Management

- **Use sightings** to confirm or expire indicators
- **Set decay scores** (MISP 2.4.x+) to automatically reduce the confidence of old indicators
- **Periodically review and clean up** old events with stale IoCs
- **Add `first-seen` and `last-seen`** attributes/object fields when known

### Community Sharing

- **Share what you can:** The value of MISP grows with community participation. If you only consume without contributing, communities die
- **Don't over-classify:** Default to the lowest TLP that is safe. TLP:RED events never help anyone else
- **Use proposals** to improve others' events rather than duplicating them
- **Attribute your intelligence:** Use the `orgc` field correctly and add references to original sources

### Operational Security

- **Use dedicated sync accounts** with minimum necessary permissions
- **Rotate API keys** regularly
- **Enable audit logging**
- **Use HTTPS exclusively** — never sync over HTTP
- **Restrict admin accounts** with strong passwords and 2FA
- **Segregate networks** — MISP should not be directly internet-facing in high-security environments (use a proxy)

---

## 18. What's Coming in Part 2

Part 2 of this tutorial will cover:

- **MISP Modules** — The MISP enrichment module ecosystem (expansion, import, export modules)
- **MISP Workflows** — Automation triggers and actions (MISP 2.4.160+)
- **Decay Scoring** — Automatic IoC lifecycle management
- **MISP Dashboard** — Customisable statistics and visualisation
- **The Hive Integration** — How MISP and The Hive work together, alert creation from MISP events, bidirectional case/event linking
- **Cortex Integration** — Automated observable analysis using Cortex analyzers, enriching MISP attributes via Cortex
- **The Hive + Cortex + MISP Triad** — Full workflow walkthrough from threat intel to incident response
- **Advanced PyMISP** — Automation scripts, bulk operations, scheduled enrichment
- **MISP as a SIEM data source** — Feeding ElasticSearch/Splunk from MISP
- **TAXII Server** — Exposing MISP data via TAXII 2.1

---

*Document generated for training and operational reference purposes.*
*MISP is open-source software maintained by CIRCL and the MISP project community.*
*Official documentation: [https://www.misp-project.org/documentation/](https://www.misp-project.org/documentation/)*
*GitHub: [https://github.com/MISP/MISP](https://github.com/MISP/MISP)*