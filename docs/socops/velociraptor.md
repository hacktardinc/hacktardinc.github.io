---
title: Velociraptor
description: Velociraptor
icon: lucide/server
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

## Step 1: Download the Velociraptor binaries

For these pre-installation steps you may want to create a new working directory:

```bash
mkdir ~/velociraptor_setup
cd ~/velociraptor_setup
```

!!! note

    This directory and the files inside it will not be needed _after_ the server is installed, but you might want to keep a copy of these files as an off-server backup for disaster recovery purposes.

The latest velociraptor binaries can be found [here](https://github.com/Velocidex/velociraptor/releases)

```bash
wget -O velociraptor https://github.com/Velocidex/velociraptor/releases/download/v0.75/velociraptor-v0.75.1-linux-amd64
```

Then make the downloaded file executable so that you can run it in subsequent steps:

```bash
chmod +x velociraptor
```

If you run the binary without any command line parameters or with `-h`, it will display help for all the command line options.

```bash
./velociraptor -h | more
```


??? example "Full Help Options"

    ```bash
    ➜  ./velociraptor -h
    usage: velociraptor [<flags>] <command> [<args> ...]

    An advanced incident response and monitoring agent.

    Flags:
    -h, --[no-]help                Show context-sensitive help (also try --help-long and --help-man).
        --remap=REMAP              A remapping configuration file for dead disk analysis.
        --[no-]nobanner            Suppress the Velociraptor banner
        --[no-]debug               Enables debug and profile server.
        --debug_port=6060          Port for the debug server.
    -c, --config=CONFIG            The configuration file.
        --embedded_config=EMBEDDED_CONFIG
                                    Extract the embedded configuration from this file.
    -a, --api_config=API_CONFIG    The API configuration file.
    -o, --config_override=CONFIG_OVERRIDE
                                    A json object to override the config.
        --runas=RUNAS              Run as this username's ACLs
        --definitions=DEFINITIONS  A directory containing artifact definitions
        --[no-]nocolor             Disable color output
    -v, --[no-]verbose             Enabled verbose logging.
        --profile=PROFILE          Write profiling information to this file.
        --profile_duration=PROFILE_DURATION
                                    Generate a profile file for each period in seconds.
        --trace=TRACE              Write trace information to this file.
        --[no-]trace_vql           Enable VQL tracing.
        --logfile=LOGFILE          Write to this file as well
        --tempdir=TEMPDIR          Write all temp files to this directory
        --[no-]prompt              Present a prompt before exit
        --max_wait=10              Maximum time to queue results.
        --timezone=TIMEZONE        Default encoding timezone (e.g. Australia/Brisbane). If not set we use UTC

    Commands:
    help [<command>...]
    artifacts
        list [<flags>] [<regex>]
        show <name>
        collect [<flags>] <artifact_name>...
        reformat <paths>...
        verify [<flags>] <paths>...
    client [<flags>]
    config [<flags>]
        show [<flags>]
        client
        api_client --name=NAME [<flags>] <output>
        generate [<flags>]
        rotate_keys [<flags>]
        reissue_certs [<flags>]
        frontend
        repack [<flags>] <config_file> <output>
    csv [<flags>] <files>...
    deaddisk [<flags>] <output>
    debian [<flags>]
        server [<flags>]
        client [<flags>]
    frontend [<flags>]
    fs [<flags>]
        ls [<path>]
        cp <path> <dumpdir>
        cat <path>
        zcat <chunk_path> <file_path>
        rm <path>
    fuse [<flags>]
        container [<flags>] <directory> <files>...
    golden [<flags>] <directory>
    acl
        show [<flags>] <principal>
        grant [<flags>] <principal> [<policy>]
    gui [<flags>]
    hunts
        reconstruct
    collector [<flags>] [<spec_file>]
    pool_client [<flags>]
    query [<flags>] <queries>...
    rpm [<flags>]
        client [<flags>]
        server [<flags>]
    tools
        show [<file>]
        rm <name>
        upload --name=NAME [<flags>] [<path>]
    unzip [<flags>] <file> [<members>]
    user
        add --role=ROLE <username> [<password>]
        show [<flags>] <username>
    version
    vql
        list
        export [<old_file>]

    ➜  velociraptor_setup
    ```


## Step 2: Create the server configuration file

To generate a new configuration file we use the `config generate` command. The `-i` flag tells it to run in interactive mode, which means it will launch a question/answer dialogue-style “wizard” that will gather the most important details needed to produce your config.

```bash
./velociraptor config generate -i
```

In the configuration wizard you should choose the options highlighted below. For all other questions you should accept the default values.

!!! tip "Please Note:"

    For **Deployment Type**, choose: `Self Signed SSL`

![image](https://gist.github.com/user-attachments/assets/8333fa70-f14b-4334-8e95-e60bb4f1abf8)

![image](https://gist.github.com/user-attachments/assets/2c740dd8-06f4-4524-b24a-d3894bb5746b)


!!! tip "Please Note:"

    For **What is the public DNS name of the Master Frontend?** :  *Here you should enter the IP server address (or DNS name if you created one) that clients will use to connect to the server.*


![image](https://gist.github.com/user-attachments/assets/df776a7f-b605-403a-ba8e-cdc355f353c4)

On the 4th screen of the config wizard you will be asked to add Admin users.

![image](https://gist.github.com/user-attachments/assets/ef049f5b-190e-4be2-9535-be1bff41ae7a)

This user account will be used for initial access to the admin user interface.

You can add multiple users

![image](https://gist.github.com/user-attachments/assets/e66fe93f-9de8-423a-a977-7e093bfcdbff)

!!! tip "Please Note"

    You don’t need to add more than one admin user as additional users (admin or non-admin) can be added after installation. It is common to only have 1 admin user and many non-admin users, with the latter being used for day-to-day DFIR work. So after adding one user you can enter a blank username and password which will allow you to continue.

The final step of the config wizard will offer to write the config file to your working directory.

- **Name of file to write**: `server.config.yaml`

You can accept the default file name and the wizard will then exit.

![image](https://gist.github.com/user-attachments/assets/03d9d49c-eee1-4b99-b1dd-72b4f245cc6d)


As you saw, the configuration wizard guides you through the key decisions and provides sensible defaults for most options. Ultimately it produces a YAML configuration file that contains settings that both the Velociraptor server and clients will use. The configuration wizard is the recommended way to generate a new configuration, although it is common to manually tweak some settings in this configuration file, as we will do next.

??? example "Sample `server.config.yaml` generated"


    ```yaml
    ➜  cat server.config.yaml
    version:
    name: velociraptor
    version: 0.75.1
    commit: 46ff090b9
    build_time: "2025-09-03T16:01:20Z"
    compiler: go1.23.2
    system: linux
    architecture: amd64
    Client:
    server_urls:
    - https://192.168.10.50:8000/
    ca_certificate: |
        -----BEGIN CERTIFICATE-----
        MIIDSzCCAjOgAwIBAgIQShoywVLaE6nDiuaN/MOFRTANBgkqhkiG9w0BAQsFADAa
        MRgwFgYDVQQKEw9WZWxvY2lyYXB0b3IgQ0EwHhcNMjUxMjA2MTMyOTMwWhcNMzUx
        MjA0MTMyOTMwWjAaMRgwFgYDVQQKEw9WZWxvY2lyYXB0b3IgQ0EwggEiMA0GCSqG
        SIb3DQEBAQUAA4IBDwAwggEKAoIBAQC6Wf2F/DqwV91MxOrwbYK9Yjw6bl55nt7P
        x47OpXW22DAr/Hx2FPuro+WNBCNR7KOoC21/CLmVpgfNr57U+8WDi1rX0/xM7ReL
        k9H5+iWR0b4Pn94zHByJlQJfkTtrJGOOHkMviCyyibzHpvF9toolp0tLrRTWPtRf
        CqktsjFARevng2P7S/9WtfqBhEG1rxPDTTKJ1bOQ0HKQP4dWBnauJSc+ULZ45LgJ
        Lt0OMNF0MPe/8eCONIhwSs0x4BmmRNpe581q1J24NhaVPXgx+36AH0BCLTJlJHzB
        4/Azg2EDOC5iFeQXDDRycMXKUtlkrQdFRelqoC3RdP7d4dvMkTu9AgMBAAGjgYww
        gYkwDgYDVR0PAQH/BAQDAgKkMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcD
        AjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBT3rOPrtbUBiXeWyXTNHgZZTbDO
        EzAoBgNVHREEITAfgh1WZWxvY2lyYXB0b3JfY2EudmVsb2NpZGV4LmNvbTANBgkq
        hkiG9w0BAQsFAAOCAQEAY096eTFPa0seFS2P5QmnJ7KsOlfgNrKZKknhySRXUNNH
        M/9Zu07Xt5ilYq5E1RzeK4JaFVcthQOen7/xaIZs3RQlRHX+DBFd/GifhTg2Jdxk
        Czb5CbQM7fzVAZoYbKyBr89fWuP3XvmHB25vsjYDqCdcHW1rQx17aGzeYz/clbCg
        yidGcZgLd27uLEJnazyyZhJq7KePVfXB8PhmgKGp7OWvammP8S6TBzk3i9XX8s81
        EtWLn97CxBTjt/+lzZ1Sfx00VMUnP2ZVRCOA90I8u1egHWp1FJWpGeBKjzcYc/t+
        ceGaLchSTLI2Ebd1b6HYgbQx+Pywz4MRWhceOB/QJw==
        -----END CERTIFICATE-----
    nonce: ZyFCe5gCJiU=
    writeback_darwin: /etc/velociraptor.writeback.yaml
    writeback_linux: /etc/velociraptor.writeback.yaml
    writeback_windows: $ProgramFiles\Velociraptor\velociraptor.writeback.yaml
    level2_writeback_suffix: .bak
    tempdir_windows: $ProgramFiles\Velociraptor\Tools
    max_poll: 60
    nanny_max_connection_delay: 600
    windows_installer:
        service_name: Velociraptor
        install_path: $ProgramFiles\Velociraptor\Velociraptor.exe
        service_description: Velociraptor service
    darwin_installer:
        service_name: com.velocidex.velociraptor
        install_path: /usr/local/sbin/velociraptor
    server_version:
        version: 0.75.1
        commit: 46ff090b9
        build_time: "2025-09-03T16:01:20Z"
    use_self_signed_ssl: true
    max_upload_size: 5242880
    local_buffer:
        memory_size: 52428800
        disk_size: 1073741824
        filename_linux: /var/tmp/Velociraptor_Buffer.bin
        filename_windows: $TEMP/Velociraptor_Buffer.bin
        filename_darwin: /var/tmp/Velociraptor_Buffer.bin
    API:
    bind_address: 127.0.0.1
    bind_port: 8001
    bind_scheme: tcp
    GUI:
    bind_address: 127.0.0.1
    bind_port: 8889
    gw_certificate: |
        -----BEGIN CERTIFICATE-----
        MIIDQTCCAimgAwIBAgIQL/Hr+9ftzi/RWNyxBDOcBjANBgkqhkiG9w0BAQsFADAa
        MRgwFgYDVQQKEw9WZWxvY2lyYXB0b3IgQ0EwHhcNMjUxMjA2MTMyOTMwWhcNMzUx
        MjA0MTMyOTMwWjApMRUwEwYDVQQKEwxWZWxvY2lyYXB0b3IxEDAOBgNVBAMMB0dS
        UENfR1cwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDb0+7nx8lEuB/A
        nfkAVvok1d+lgEYHZEPIUlL/xyf2PuEXuOHt2wbwycKlmh58UqnAE7s2ltsYWF++
        6bcZYRG0hBt/A/73PB6hk/KU1xUGzzCHHpquPp2bGA0mOnFRp0XKmZ9+RSZSibGM
        4V+n2dxuTG3MkPzrJVUxZ+DbsLOZUVb4KNwmLPvf9mVOq/m/sEUUCwUcgV0SXpHe
        JwuTD9gdVHtYNmQXVONOZoSqkEPcg1KkFGNvHxDQcZo2pEQg1Bpgt0/gAZlzGmFY
        qZHmse2zXdmSncHo7EDZ3xePtckQZXLdCwQA6ffL3t3FvZLJkJcfCKvcJE53RrLj
        PVMHon27AgMBAAGjdDByMA4GA1UdDwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEF
        BQcDAQYIKwYBBQUHAwIwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBT3rOPrtbUB
        iXeWyXTNHgZZTbDOEzASBgNVHREECzAJggdHUlBDX0dXMA0GCSqGSIb3DQEBCwUA
        A4IBAQATO0ehT0gqizVxI0Zk/2x8ZsN/r2MI4OSZPKl7TdCcgt+c+owzwzmEhcE7
        7qNdnnyUwYzJd28G7Lg6yWSGB+8dHZc947taSP8uXEvvRex29HSs//s9ZUU7teAA
        iYEVx0UpFeq5Z6NifLMuF/sDyHwL/WFW3LAgMSYpK6A6qt/aU6Ic7JXK3n+wH7PB
        1rnXcobHMvSKJ6te8CMyXRI5g4k1cUghCnK48060Q7Ye+GKt/31LL3TzM1HqdzUG
        PgMoqSeFWfkZQD5GEc9DTMHYqKWabjxWBw1oZtSZG0UCWVSDLZXTKjCik0qCH97C
        4ADVUPUJgHD/UlWdddrrn0OsPevK
        -----END CERTIFICATE-----
    gw_private_key: |
        -----BEGIN RSA PRIVATE KEY-----
        MIIEpQIBAAKCAQEA29Pu58fJRLgfwJ35AFb6JNXfpYBGB2RDyFJS/8cn9j7hF7jh
        7dsG8MnCpZoefFKpwBO7NpbbGFhfvum3GWERtIQbfwP+9zweoZPylNcVBs8whx6a
        rj6dmxgNJjpxUadFypmffkUmUomxjOFfp9ncbkxtzJD86yVVMWfg27CzmVFW+Cjc
        Jiz73/ZlTqv5v7BFFAsFHIFdEl6R3icLkw/YHVR7WDZkF1TjTmaEqpBD3INSpBRj
        bx8Q0HGaNqREINQaYLdP4AGZcxphWKmR5rHts13Zkp3B6OxA2d8Xj7XJEGVy3QsE
        AOn3y97dxb2SyZCXHwir3CROd0ay4z1TB6J9uwIDAQABAoIBAQC4S9XfO//hPPxh
        4A8B2emdODFn70LGr6ikKWCsT6uRJuZPnRDM+PO4q24kqDEmyabHAcPS4GaO4ohi
        5k47WMYfMSJcOl1nqV+E1yRo5GkcbFei8GV978DyZhegFR8r9bDtSh4NHqwiRo40
        Lj6j2mKTlj/3YRapjYL/CLfbdykbPyfTse+h/kjvgXYoSYvqu07kZ2bdOGUmYmVh
        DCQY2gdaaFu4kKA/5zLefsi5614nKp/YD3W4iFNKpnirdOruJpdoYt/pcB5ietaJ
        WwmHQuSTzCkY561qid/AeHwr6l3W2oUNCuhiK/OTZSl3cZuvc8/RH0r+2ZoHz2Gs
        Vg0WAUABAoGBAPurRunfDSkLKqFMmGaV0VapelTTY7C+mYuz9Sgm9iLYibkZxjm9
        AdPI40qgMfNwGn2JGrkHHDwZA8+21EzJWHsgF8qABmGKoMs12yrZ5pjkPj8qypQv
        FAcU6i8FYMrG0qDgxfyn2ew8qa4i+Q0SsyIGSdJSHVGcIfRP81DU8Cq7AoGBAN+c
        YWi3oL3ks2+5BSrZn3ISC/CGZflqi91x+mZ0m5IiuYJtDE3CzpMl2+fsAg9UqYIL
        si8QzFr2+S51wnFwJsKEyYcbUmdiK332cUch6H/K3ujOn7Xqfaz5LUhjr3MsiP+5
        Gf0l+gbKlRH7NI3o47kP4NytygpEqRk/FnOa2UkBAoGBALCnDwXGjYRL1EaYbzlC
        3EhKehXks8syXrETRnhCsO7QtAt7rgqFQy0Xi4OsYqOQAugvPtS1yvncTTKWEPs9
        MaBrbIe1ycTZ+/fn+8leXmDfhVntfXj6esJlyePrkH+Fg/9tB0xLvcn24tvarJqi
        j57IbzT0cqQARk0peY85iMNVAoGBALmYNzVOLAlQmCojvAk7xV5NYkGJm3vvlhT/
        tCBzqmgZkDWTwwGLrh9t7d7KAU+uKl74zDTKUYMyt9F7Bh9XQaRzyDzuTW/niEet
        U4oBt9LRlEBQtzirXxJBYvdRXd9PWIo/nTWC3sniPOZGxPEAGnqQlkczq5zoLh35
        Qe5D2RMBAoGAds7cXpjLqKXdzwJxpF/8qsTq1CdYilizvOO9wxJi+5Z2SsuVr79a
        NkdBjTEr0TtKDsj3mg8X30s/Q0AfW2aBy5O5UNJtCOjoX2Cc4rA1YoZgCrGhmaEz
        ob+qxFgv9bZ671FuPA1ZMdeyO1tnc0ZSPmotzWMXwQLw34UjXlY0GKc=
        -----END RSA PRIVATE KEY-----
    public_url: https://192.168.10.50:8889/app/index.html
    links:
    - text: Documentation
        url: https://docs.velociraptor.app/
        icon_url: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MyIgaGVpZ2h0PSI2MyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTMgNjMiPjxwYXRoIGQ9Ik0yNyAzYy0zIDItMTMgOC0yMyAxMGw2IDMyYTEwMyAxMDMgMCAwIDAgMTcgMTZsNi01IDExLTExIDYtMzJDMzkgMTEgMzAgNSAyNyAzeiIgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTI2IDBDMjMgMiAxMiA4IDAgMTBjMSA3IDUgMzIgNyAzNWExMTMgMTEzIDAgMCAwIDE5IDE4bDctNiAxMi0xMmMyLTMgNi0yOCA4LTM1QzQwIDggMjkgMiAyNiAwWm0wIDU1LTYtNC04LTktNS0yNnYtMWwyLTFjOC0xIDE2LTYgMTYtNmwxLTEgMSAxczggNSAxNyA2bDEgMXYxcy0zIDIzLTUgMjZsLTggOWMtMiAyLTQgNC02IDR6IiBmaWxsPSIjYWIwMDAwIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjxwYXRoIGQ9Ik0zOSAxOWExMzQ3IDEzNDcgMCAwIDEtMTMgMjZoLTJMMTQgMTloM2wyIDEgMSAxdjFhMjUwIDI1MCAwIDAgMSA2IDE3IDUyODkgNTI4OSAwIDAgMCA5LTIwaDR6IiBmaWxsPSIjMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWRhc2hhcnJheT0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==
        type: sidebar
        new_tab: true
    initial_users:
    - name: analyst
        password_hash: 8e012f2999427d183df2832fa327b4f41e303b1894152fea01c34dec307536d9
        password_salt: 8d3d77be8d90ce1b230437a741bff1233afa455d0ef1dc2de9289b77587117ee
    - name: admin
        password_hash: 4df6e64c0ad1254808b7cf38e192df1891e8ffa364e69e3662593bf3a6170056
        password_salt: a4cb8130bf8b691553c12040b049a0fa0421e55b84072c9e704e8df206c27067
    authenticator:
        type: Basic
    CA:
    private_key: |
        -----BEGIN RSA PRIVATE KEY-----
        MIIEpAIBAAKCAQEAuln9hfw6sFfdTMTq8G2CvWI8Om5eeZ7ez8eOzqV1ttgwK/x8
        dhT7q6PljQQjUeyjqAttfwi5laYHza+e1PvFg4ta19P8TO0Xi5PR+folkdG+D5/e
        MxwciZUCX5E7ayRjjh5DL4gssom8x6bxfbaKJadLS60U1j7UXwqpLbIxQEXr54Nj
        +0v/VrX6gYRBta8Tw00yidWzkNBykD+HVgZ2riUnPlC2eOS4CS7dDjDRdDD3v/Hg
        jjSIcErNMeAZpkTaXufNatSduDYWlT14Mft+gB9AQi0yZSR8wePwM4NhAzguYhXk
        Fww0cnDFylLZZK0HRUXpaqAt0XT+3eHbzJE7vQIDAQABAoIBAFt4mrou4fv3VRg+
        vHfBuWAOnTOtQ1B9jC7/bHjAvPRAT/z3VXx8tkA9FgtPEas/9eEhouCtPrNXKRNs
        dhFjeEMmnzO7yWdVJa6Mo5AJmnFmO93dgisiTFu4Oc8BMeJYnUmAT0hAlngYpgJ2
        Tql/dXYgFRSTY9v6QTJZwEs+4XADS6Jl2UJXSo4MPMltL8n0SrozDwTQr8mVfuX/
        XZJXvZgjNhs+1o60r5gnmckf9q3mczEhQG8BIqQ7OV4fVhCkdmnskeru6FU30D16
        6W2HamY1CazGnI4COH7WYm8oPjU47Hv8sIFP9hi+1gfUkaFS8VQcUMqxklkoLtEN
        o4PK+QECgYEA5cRXndndqUSttEM6o9pLAAvDuXrPl0RujaC4tDsmyNfir9fkDrk0
        jAhqgIgs2I2hCPLLcJyoiyUGuF2v1JoTA1got5UsE7WzLrHgZ6hqny32bpEanxvF
        iKKH3PklU70j8SnHAc4WYFZiVM5LpZjsAwyX1owhRCdysSxFNhtyzv0CgYEAz6Cy
        OgNYcdVGXSITpuNfQ9W7M1T6DrAmNKWQK7QR90o9nC+oehbt8n3zzKM5KC4WY9Wr
        ayB+jR2ShLD6FRfTNhTM4ruChZF5o5s9Pcx+YvTtpwvg8mEinLxMvvLiLNbdh8lv
        sNOBPbLD2FhkPD18GGLwjCP9ZXv95R2/yP1wm8ECgYAhPjkXA5CIjwE61YdEca7s
        QMd+rIAgeKwuHZTbrrs7z9BidK/wWWd64zTVh95FLqif7ND2aBQSnbbNMfDgp7Ic
        h8LMXO7VozJbjSzUko9qnHHNKX1ai+AWlr1lgT6fUPxERjEe17xxD86GSpqzSN7M
        yiOlzPx7KeH0NF2HKI2B2QKBgQCEW1qCZPOSzXSnljuU3ckzAyLtHDSz/FK+qPR5
        B7eUPv17fV4XRlq1hNlQEJU1KfwX9HPsPLCv4LQwZmll3ORFy4i42PPhldVHGIU3
        yg6foqeFH6tsl8NqyxbZexf3oZljIGRVAt+Wp0j1t5NeW4uqOBhEHgVBFoPJ9Ob3
        h6irgQKBgQDkhzxQDVdlvt0bTeamJO5KT+lTaB9/haZzBFvAnjM6Ke2o+49xt+tE
        yYbf6UJ7jPpBnA4n/uahQWY4lTkUF/nb8UAVT5F/wYLFLeXdk8ujfTWgVGbI+ptq
        Ku6oHrlEsFql85wlmbdnD4ax8N76gFC8f9yqtfTQmTpniSg3Xw9nlA==
        -----END RSA PRIVATE KEY-----
    Frontend:
    hostname: 192.168.10.50
    bind_address: 0.0.0.0
    bind_port: 8000
    certificate: |
        -----BEGIN CERTIFICATE-----
        MIIDWDCCAkCgAwIBAgIRANllN9hp1p5UAkBSqyyIIU4wDQYJKoZIhvcNAQELBQAw
        GjEYMBYGA1UEChMPVmVsb2NpcmFwdG9yIENBMB4XDTI1MTIwNjEzMjkzMFoXDTM1
        MTIwNDEzMjkzMFowNDEVMBMGA1UEChMMVmVsb2NpcmFwdG9yMRswGQYDVQQDExJW
        ZWxvY2lyYXB0b3JTZXJ2ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
        AQDH5llufmnvjuke1vALPdHs72Om5fCHJ3ZIkRLmwktaHE8zwMqpPv/aj+Ivyhzc
        ci3Lc8opPVB8ejMr9c2+Umqs5D8FqKpAZKVtCv1V7k3gxd6uLr/JUQsxTku22u/d
        v7XvwwJ61P+M97oSxznv5S6aAj2xpFeVNDlKqe8gO8s1bmlklDL/OhUXQmQ70Fjb
        GI/Tm6MDw4O+vM1OAd9hiDx5uGEj1ADpf3Be8k09ejuuYq0zZ609oL0HDdxkRWFJ
        v7pSNK2EvJhZVjgbEZoiJQBsD6jc/GbyUr5ezFWDCUdHeUHFF6BdYAnyQcIM6w10
        awAvwSXWDEl8sJ8PICFQ+uO3AgMBAAGjfzB9MA4GA1UdDwEB/wQEAwIFoDAdBgNV
        HSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwDAYDVR0TAQH/BAIwADAfBgNVHSME
        GDAWgBT3rOPrtbUBiXeWyXTNHgZZTbDOEzAdBgNVHREEFjAUghJWZWxvY2lyYXB0
        b3JTZXJ2ZXIwDQYJKoZIhvcNAQELBQADggEBAIWqbRRXHDc5EPypiZ/UYJ/AK3HP
        gHHmrsZGhlIBR8yxxmkO9VrDCNVZJUl2llKnJ5RkxFeCAbBoA80n4YeNFTBSalL/
        wVBzygQNKgzMu4rZozI77Eg+fgrAAI/TTM7HF1cukN7IVwcmic0DYQZ8OM1TPq+H
        qefrKLmWsdcdn9nJBBWWz409wijmi5YZTemXEflI9yo0/D+CjGbUz6EwrkTJzelv
        ecW7LoWv8O1rml/iNX97W3U/2/ZbaaD4UlGK9os2wH4q2VsN4uS6J9HaH0Ulp6Mt
        MDzm/vRAOmtuWvhSS53Xxw1n9STWMwHIpionmEVbrSWia/06lxhYiAJBxso=
        -----END CERTIFICATE-----
    private_key: |
        -----BEGIN RSA PRIVATE KEY-----
        MIIEpAIBAAKCAQEAx+ZZbn5p747pHtbwCz3R7O9jpuXwhyd2SJES5sJLWhxPM8DK
        qT7/2o/iL8oc3HIty3PKKT1QfHozK/XNvlJqrOQ/BaiqQGSlbQr9Ve5N4MXeri6/
        yVELMU5Lttrv3b+178MCetT/jPe6Esc57+UumgI9saRXlTQ5SqnvIDvLNW5pZJQy
        /zoVF0JkO9BY2xiP05ujA8ODvrzNTgHfYYg8ebhhI9QA6X9wXvJNPXo7rmKtM2et
        PaC9Bw3cZEVhSb+6UjSthLyYWVY4GxGaIiUAbA+o3Pxm8lK+XsxVgwlHR3lBxReg
        XWAJ8kHCDOsNdGsAL8El1gxJfLCfDyAhUPrjtwIDAQABAoIBAQDBLiTjGRt7PNqg
        yQp1cqq6lKXzFmeZ1VMD0d84Ti/Px2frFbdEU/Oh3kax9Fpr15PV9/I4ZF6xzM5C
        /2pzMOaSaolVCKhvTlRnyqUENCXiwJXwMpF5Fe8BGS8maPJBlBFYwVZWKh1Et+qE
        Vy/wW8TrZJsGX1GciTmMpCjJN7+rw24CZTa3XNdxApAgZnE/p5wwiQs2D+EklKfS
        kHWae83RiRDgYYogEKuoMcsXaVXvzHovLp4E6HUFho84iQh1kE2ljz4T6K6aP9De
        cP5YptMoy/Vo5CrHhB3Dza27J9zK2sYASAtG/HdlKvaa7fuzsZuSaAOQ4PdrK825
        1zqw4cABAoGBAPyoPBU+PH/53r2h6ZLPbwjoo2IqaQsIniZnDGxKdb9/DChQmxmo
        tazTfj0TJFS/eznFdkUGubiidJqQpYef2VaL6etVBpXRja3Ye6NnsSfukoaic+nz
        XWG1AYWgMOGHYPLiNe6YHdxbODOihY2jHFCNsD5XSoIlY7fohSFfbxO3AoGBAMqL
        bBZtZPeUfh8n5ZYv6HA1fgfLfih3bZuk5vpyaLhohCnY8bRTHqX2ICkwX2dQCH+1
        67ooNi1dBokLGtBZLUhakUUOPVga7c2qHJXl6oeLnYalbmbxl330OZtcNLGypQyf
        30NL+0M5fpVBVbdt+wKf6MRG7xS2sCoOdE6X8rABAoGBAJ1WdvQTqcFYbWlSJw6R
        tuepV/WNy5RfbX0ktwvI4sK572w7phq4gUp6+iY2gW11QNudKCWcJpPgNxT59tsa
        pFHNF4LBlDRAJyaXpYcAz8W6P+0vxVdvgjuSaLw6IbaQg8M9M7C9cfsDo2AkWV72
        sG9JjPOFkJSzjAG+/wjlUVrJAoGAcGJkGx2gBG/0ez0b+vWiN4C26YRUAAgkXVRm
        hViuGoSDsOSbWL82JkgnGDOq/BxAWvyKS8S8KvePBMOQoUKaCaeXK4X3K8flY1Sc
        f+AO/h7NzURFugEbWdwFitrisia5xgN/Ukv6oxZn0lFqSllQCejIsv/Y8NldbjiO
        +Hz/QAECgYBuo00Gyi78AuXhS/AAGxopii/QRnayPH9m860B+04fdQ49DpdcKVXk
        Hu5eLzfZ4PCqlxmnoDMrF7H8kHMEzwnVntRHyUZhtpD4ZJgIgb59Wg7TVA8NX0jH
        P+rdw3gp/MX3ZFAnLnE7WtG4XRui0cQWrG9puc+ITgm8TdOF706Fcw==
        -----END RSA PRIVATE KEY-----
    default_client_monitoring_artifacts:
    - Generic.Client.Stats
    GRPC_pool_max_size: 100
    GRPC_pool_max_wait: 60
    resources:
        connections_per_second: 100
        notifications_per_second: 30
        max_upload_size: 10485760
        expected_clients: 30000
    Datastore:
    implementation: FileBaseDataStore
    location: /opt/velociraptor
    filestore_directory: /opt/velociraptor
    compression: zlib
    Logging:
    output_directory: /opt/velociraptor/logs
    separate_logs_per_component: true
    debug:
        disabled: true
    info:
        rotation_time: 604800
        max_age: 31536000
    error:
        rotation_time: 604800
        max_age: 31536000
    Monitoring:
    bind_address: 127.0.0.1
    bind_port: 8003
    api_config: {}
    obfuscation_nonce: tzsTG7s2zcg=
    defaults:
    hunt_expiry_hours: 168
    notebook_cell_timeout_min: 10
    security:
    certificate_validity_days: 3650
    ```

By default the configuration binds the GUI and Frontend services to only the loopback interface, `127.0.0.1`. We will need to change this in the configuration file to make these service accessible to other network hosts.

Open the configuration file in a text editor and change:


!!! example "Excerpt of Config to change"

    === "Frontend"

        ```yaml
        Frontend:
        bind_address: 127.0.0.1 # (1)
        ```

        1.   Set to `bind_address: 0.0.0.0`

    === "GUI"

        If you need to access the GUI from a different network host then also change:

        ```yaml
        GUI:
        bind_address: 127.0.0.1 # (1)
        ```

        1.   Set to `bind_address: 0.0.0.0`


!!! tip

    In Self-signed SSL mode, which only supports Basic authentication, you should avoid exposing the GUI to untrusted networks (i.e. the public internet). If your server needs to be accessible from the internet then you should leave the `GUI.bind_address` set to the loopback interface and use [SSH Local Port Forwarding](https://iximiuz.com/en/posts/ssh-tunnels/) which can be secured by stronger authentication mechanisms.


!!! warning "Please Note"

    1. Because the configuration file is a key component to your deployment and contains security-sensitive material you should always keep it secure and ideally also keep an backup of it in a secure location. The server configuration does not change unless you edit it, so remember to update your backup copy whenever you make any changes.
    2. The server installation package that we will create in the next step also contains a copy of the server config, so you should handle it with the same security considerations as the config file itself.


## Step 3: Create the server installation package

The server component will be installed and run as a service on your Linux machine. In addition to installing the Velociraptor binary and configuration file, the installation also creates a service account (named `velociraptor`) and service configuration so that it can run as a service. The installation package takes care of these setup tasks, and we generate it using a single command.

As mentioned previously, the Velociraptor binary provides several utility functions on the command line. One of these is the ability to generate Linux installation packages, specifically `deb` packages for Debian-based systems and `rpm` packages for RPM-based systems.

To create the server installation package, run the appropriate command below in your working directory.

```bash
./velociraptor debian server --config ./server.config.yaml
```

![image](https://gist.github.com/user-attachments/assets/45e5a2d2-2d4e-4885-8986-69606b96a4d8)

!!! tip "Please Note"

    The output file will be automatically named to include the version and architecture, but you can choose any file name you want and specify it with the `--output <your_file_name>` flag.

## Step 4: Install the server component

Install the server package using the command below according to your server’s packaging system.

=== "Debian-based server installation:"

    ```bash
    sudo dpkg -i xxxxxxxxxxxxxxxx.deb
    ```

=== "RPM-based server installation:"

    ```bash
    sudo rpm -Uvh xxxxxxxxxxxxxxxx.rpm
    ```


Now that the service is installed we can check its status in a few ways.


```bash
systemctl status velociraptor_server.service
```

![image](https://gist.github.com/user-attachments/assets/813cf9bb-fbbb-4b38-ae96-40fd32b33156)


Check that the GUI is listening:

```bash
➜  nc -vz 127.0.0.1 8889
Connection to 127.0.0.1 8889 port [tcp/*] succeeded!
```

Check that the Frontend is listening:

```bash
➜  nc -vz 127.0.0.1 8000
Connection to 127.0.0.1 8000 port [tcp/*] succeeded!
```


## Step 5: Log in to the Admin GUI

The Admin GUI should now be accessible with a web browser by connecting to `https://127.0.0.1:8889`, or using your server’s IP address if you changed the `GUI.bind_address` setting in `Step 2`.

Log in using the admin account that you created in the config wizard. You will arrive at the Welcome screen.

![image](https://gist.github.com/user-attachments/assets/3cb76471-75e8-4da7-b51d-5191db0b3cec)

![image](https://gist.github.com/user-attachments/assets/99c299ac-5bbe-44c7-a689-89e999fa088c)

![image](https://gist.github.com/user-attachments/assets/adc033ee-21cb-49a4-8db1-500dd54c5fdf)


## Step 6: Import artifacts from external projects

Although Velociraptor ships with hundreds of built-in artifacts it is recommended that you also try these more powerful artifacts, or visit their websites to learn more. Generally the built-in artifacts have very specific goals, for example extracting specific information from a specific file, while the complex artifacts encompass broader goals, for example searching the Windows registry for a broad set of indicators of suspicious activity.

|**Project**|**Description**|
|---|---|
|[Velociraptor Sigma Project](https://sigma.velocidex.com/)|Artifacts that implement Sigma-based triage and monitoring rules. Includes curated Sigma Rules (Hayabusa/Hayabusa Live/ChopChopGo)|
|[Velociraptor Triage Project](https://triage.velocidex.com/)|This project intends to develop a set of rules that are used for specifying the collection of files from the endpoint.|
|[Rapid7Labs](https://github.com/rapid7/Rapid7-Labs/tree/main/Vql)|Artifacts developed and shared by [Rapid7 Labs](https://www.rapid7.com/blog/tag/research/) .|
|[Velociraptor Registry Hunter Project](https://registry-hunter.velocidex.com/)|Our project to develop sophisticated registry analysis modules.|
|[Velociraptor SQLite Hunter Project](https://sqlitehunter.velocidex.com/)|This project aims to be a one-stop shop for `SQLite`, `ESE` and many other database-oriented forensic artifacts.|
|[The Velociraptor Artifact Exchange](https://docs.velociraptor.app/exchange/)|Our repository of community-contributed artifacts.|

To get these external artifacts into your Velociraptor server’s artifact repository, we have a built-in server artifact which will download them from any or all of the external sources. Here’s how to do that:

1. On the Welcome screen, click the link **Import Extra Artifacts**. 

	![image](https://gist.github.com/user-attachments/assets/8b769384-31f7-4e48-a8cc-86b134123ca7)

    This will start the artifact collection wizard for the server artifact `Server.Import.Extras`.

	![image](https://gist.github.com/user-attachments/assets/e9375d07-a03f-42cc-9589-8bee3e377e4c)

	  You don’t need to change anything here and can click **Configure Parameters** to navigate to that page of the wizard.

2. By default, the artifacts from all sub-projects will be imported by the `Server.Import.Extras` artifact. However you may not want all of them at this time and you can repeat this process at any time to import different artifacts or to update selected artifacts. To unselect any item, click it’s bin icon in the list.

	![image](https://gist.github.com/user-attachments/assets/2f773abb-f7e2-4576-8355-d8f5718b1b64)

	Once you’re happy with your selection you can click **Launch** to begin the import process.

 3. Once this artifact collection completes you can inspect the results in the collection’s **Results** tab. 

	![image](https://gist.github.com/user-attachments/assets/65dafb4e-29ee-49eb-8388-27acf0c7dc44)

	![image](https://gist.github.com/user-attachments/assets/478c3b7d-8806-4e73-9544-95e36cc7feda)

    ![image](https://gist.github.com/user-attachments/assets/a190ac33-1119-4fcc-b6ae-9718677dde00)

    If, for some reason, the import fails then you can review the log messages in the **Log** tab.

    ![image](https://gist.github.com/user-attachments/assets/d77b4ced-7409-4fa1-8ffc-01d7f37b124d)


## Step 7: Create an installation package for Windows clients

Velociraptor clients are available for many operating systems and architectures. 

The most important thing to know is that all Velociraptor clients need a _client configuration_, which is specific to the deployment. This configuration is a subset of the full YAML-based configuration. Because the server has access to the full configuration it is able to provide the client configuration to us when needed [in the form of a YAML file](https://docs.velociraptor.app/docs/deployment/clients/#option-1-obtaining-the-client-config-from-the-gui).


The most commonly deployed client by far is 64-bit Windows. The standard installer package format for Windows in enterprise environments is still the MSI format.

We publish a prebuilt MSI package on our GitHub Release page, however since the Velociraptor client requires _your_ unique configuration file which is linked to _your_ server, we don’t package a working configuration file in the official release MSI. The official MSI contains a placeholder configuration file. You will need to modify the official release MSI to include your client configuration file, and this is easily done through a process we call “repacking”. We have a streamlined process for generating a custom MSI package which can be done entirely in the Admin GUI. This is the quickest and easiest way to generate the MSI package, and so it’s the one we will use here.

1. In the Velociraptor web GUI select **Server Artifacts** from the sidebar on the left side of the page.

    ![image](https://gist.github.com/user-attachments/assets/aa3dc2dc-470b-4144-a891-8252fa07f975)

    ![image](https://gist.github.com/user-attachments/assets/546a19fc-fc4c-4baf-968e-19b38748459b)

2. Add a new collection: search for `Server.Utils.CreateMSI`, select it, and then click “Launch”.

    ![image](https://gist.github.com/user-attachments/assets/4769c12d-7cc2-4377-8baf-88b8b6ebb946)

3. It will take a moment to download the latest release MSI files (64-bit and optionally 32-bit) from GitHub and then repack them with your client config file.
    
4. The repacked MSI files will then be available in the **Uploaded Files** tab of the artifact collection.

    ![image](https://gist.github.com/user-attachments/assets/49c85ea0-bee7-4e1d-92b9-4f0a8a38575d)

    ![image](https://gist.github.com/user-attachments/assets/a4468618-4a23-4b1f-b925-ccbd1ee63944)

5. Download the MSI files. You will then need to copy them to a network share, USB stick or other medium that allows you to access them from your Windows endpoints. In this simplified scenario we will only be installing the client manually. For full-scale deployments the MSI is typically rolled out through enterprise application management tools.


## Step 8: Install the client on endpoints

On your Windows endpoints, installation is done by running the MSI that you created in the previous step.

![image](https://gist.github.com/user-attachments/assets/15411bdb-9f08-41c8-862a-ef7493dfe936)

The MSI installs the client as a Windows service, so it requires elevated privileges and you may be prompted with the familiar UAC prompt to allow the installation to continue.

![image](https://gist.github.com/user-attachments/assets/55449cf9-ac89-4fed-9cbf-78734bf1b089)

After installation you will have the client running as the “Velociraptor Service” which you can see in the Services app.

![image](https://gist.github.com/user-attachments/assets/4f1a0e8b-146c-4aec-90d9-c2c501af58ec)

Returning to your Velociraptor server, you can find the newly enrolled client by clicking the  button in the “Search clients” bar at the top of the page.

![image](https://gist.github.com/user-attachments/assets/f8bb8786-4482-43e9-b0e5-755544e1015c)

  

![image](https://gist.github.com/user-attachments/assets/dff8b248-1f46-443d-b2e9-10e2828bc7d2)