---
title: DNS Records
description: DNS Records
icon: fontawesome/brands/docker
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

> A comprehensive guide to all DNS resource records with syntax, examples, and use cases.

---

## Table of Contents

1. [Core Address Records](#core-address-records)
2. [Name Server Records](#name-server-records)
3. [Email Security Records](#email-security-records)
4. [Security & Authentication Records](#security--authentication-records)
5. [Infrastructure Service Records](#infrastructure-service-records)
6. [Specialized Records](#specialized-records)
7. [Deprecated or Legacy Records](#deprecated-or-legacy-records)
8. [DNSSEC-Specific Records](#dnssec-specific-records)
9. [Cloud/SaaS Provider Records](#cloudsaas-provider-records)
10. [Record Syntax Reference](#record-syntax-reference)

---

## Core Address Records

### A Record (Address Record)

**Purpose:** Maps a domain name to an IPv4 address.

**Zone File Syntax:**
```
name    TTL    class    type    value
```

**Examples:**
```dns
; Basic A record
example.com.    3600    IN    A    192.0.2.1

; Subdomain A record
www.example.com.    3600    IN    A    192.0.2.2
mail.example.com.   3600    IN    A    192.0.2.3

; Multiple IPs (load balancing/round-robin)
service.example.com.    300    IN    A    192.0.2.10
service.example.com.    300    IN    A    192.0.2.11
service.example.com.    300    IN    A    192.0.2.12

; Using @ shorthand for origin
@    3600    IN    A    192.0.2.1

; Wildcard record
*.example.com.    3600    IN    A    192.0.2.100
```

**Query Examples:**
```bash
# Query A record
dig A example.com
# Output: example.com. 3600 IN A 192.0.2.1

# Short output
dig +short A example.com
# Output: 192.0.2.1

# Host command
host -t A example.com
# Output: example.com has address 192.0.2.1

# nslookup
nslookup -type=A example.com
```

**Common Use Cases:**
- Pointing domain root to web server
- Creating subdomains for services (www, mail, ftp)
- Load balancing with multiple A records
- Infrastructure mapping

---

### AAAA Record (IPv6 Address Record)

**Purpose:** Maps a domain name to an IPv6 address.

**Examples:**
```dns
; Basic IPv6 record
example.com.    3600    IN    AAAA    2001:db8::1

; Full expanded notation (also valid)
example.com.    3600    IN    AAAA    2001:0db8:0000:0000:0000:0000:0000:0001

; Multiple IPv6 addresses
www.example.com.    300    IN    AAAA    2001:db8::1
www.example.com.    300    IN    AAAA    2001:db8::2

; Dual stack (AAAA + A)
www.example.com.    3600    IN    AAAA    2001:db8::1
www.example.com.    3600    IN    A     192.0.2.1
```

**Query Examples:**
```bash
dig AAAA example.com
dig +short AAAA example.com
host -t AAAA example.com
```

**Tips:**
- Modern clients prefer AAAA over A if both exist
- Always provide both A and AAAA for dual-stack support
- Abbreviated notation (::) is standard

---

### CNAME Record (Canonical Name)

**Purpose:** Creates an alias pointing to another domain name.

**Examples:**
```dns
; Standard CNAME
www.example.com.    3600    IN    CNAME    example.com.

; Subdomain alias
blog.example.com.   3600    IN    CNAME    example.wordpress.com.

; CDN alias
static.example.com. 300    IN    CNAME    d1a2b3c4.cloudfront.net.

; Multi-level CNAME chain (avoid if possible)
api.example.com.    300    IN    CNAME    gateway.example.net.
gateway.example.net. 300   IN    CNAME    us-east.elb.amazonaws.com.

; Common patterns
mail.example.com.   3600    IN    CNAME   gsuite-alias.google.com.
drive.example.com.  3600    IN    CNAME   ghs.googlehosted.com.
```

**Query Examples:**
```bash
dig CNAME www.example.com
# Output: www.example.com. 3600 IN CNAME example.com.

# Follow chain
dig +trace www.example.com

# Short
dig +short CNAME www.example.com
# Output: example.com.
```

**Important Rules:**
- **CNAME cannot coexist with other records** on same name (except DNSSEC)
- Root zone (@) **cannot** be CNAME
- Creates extra DNS lookup (performance cost)
- MX and NS targets should point to A/AAAA, not CNAME

**Common Patterns:**
```dns
; Anti-pattern: CNAME at root (NOT ALLOWED)
@    3600    IN    CNAME    example.herokuapp.com.  ; INVALID!

; Solution: Use A record or ALIAS/ANAME records
@    3600    IN    A        192.0.2.1
www    3600    IN    CNAME    example.herokuapp.com.

; Another anti-pattern: CNAME with MX
mail.example.com.   3600    IN    CNAME    mail.google.com.  ; INVALID!
mail.example.com.   3600    IN    MX       10 mail.google.com. ; INVALID combo!

; Solution: Separate records
mail.example.com.   3600    IN    A        192.0.2.10
example.com.        3600    IN    MX       10 mail.example.com.
```

---

## Name Server Records

### NS Record (Name Server)

**Purpose:** Delegates a DNS zone to authoritative name servers.

**Examples:**
```dns
; Minimum required NS records
example.com.        86400    IN    NS    ns1.example.com.
example.com.        86400    IN    NS    ns2.example.com.

; External NS delegation
example.com.        86400    IN    NS    ns1.cloudflare.com.
example.com.        86400    IN    NS    ns2.cloudflare.com.

; Subdomain delegation (child zones)
dept.example.com.   86400    IN    NS    ns1.dept.example.com.
dept.example.com.   86400    IN    NS    ns2.dept.example.com.

; Glue records (if NS is under same zone)
ns1.example.com.    3600     IN    A     192.0.2.53
ns2.example.com.    3600     IN    A     192.0.2.54
```

**Query Examples:**
```bash
dig NS example.com
# Output: example.com. 86400 IN NS ns1.example.com.

; Get with glue records
dig +additional NS example.com

; Find authoritative servers
dig +short NS example.com
```

---

### SOA Record (Start of Authority)

**Purpose:** Provides administrative information about the zone.

**Syntax:**
```dns
name    TTL    class    SOA    primary_ns    admin_email    (
                        serial    ; Serial number
                        refresh   ; Refresh interval (sec)
                        retry     ; Retry interval (sec)
                        expire    ; Expire time (sec)
                        minimum   ; Minimum TTL (sec)
                        )
```

**Examples:**
```dns
; Standard SOA
example.com.    3600    IN    SOA    ns1.example.com. admin.example.com. (
                        2024021801    ; Serial: YYYYMMDDNN format
                        3600          ; Refresh: 1 hour
                        1800          ; Retry: 30 minutes
                        604800        ; Expire: 1 week
                        86400         ; Minimum TTL: 1 day
                        )

; More aggressive timing
example.com.    3600    IN    SOA    ns1.example.com. hostmaster.example.com. (
                        2024021801    ; Serial
                        900           ; Refresh: 15 minutes
                        300           ; Retry: 5 minutes
                        1814400       ; Expire: 3 weeks
                        300           ; Minimum: 5 minutes
                        )
```

**Field Breakdown:**

| Field | Purpose | Typical Value |
|-------|---------|---------------|
| **Primary NS** | Master server for zone | ns1.example.com |
| **Admin Email** | Contact (dots = @) | admin.example.com → admin@example.com |
| **Serial** | Version number, increments on change | YYYYMMDDNN |
| **Refresh** | Secondary checks for updates | 3600 (1h) |
| **Retry** | Retry if refresh fails | 1800 (30m) |
| **Expire** | Stop answering if no update | 604800 (1w) |
| **Minimum** | Default TTL for negative caching | 86400 (1d) |

**Query Examples:**
```bash
dig SOA example.com
# Parse SOA fields
dig +short SOA example.com | awk '{
    print "Primary NS: "$1
    print "Admin: "$2
    print "Serial: "$3
    print "Refresh: "$4
    print "Retry: "$5
    print "Expire: "$6
    print "Minimum: "$7
}'
```

---

## Email Security Records

### MX Record (Mail Exchange)

**Purpose:** Specifies mail servers responsible for accepting email.

**Syntax:**
```dns
name    TTL    class    MX    priority    target
```

**Examples:**
```dns
; Single mail server
example.com.    3600    IN    MX    10    mail.example.com.

; Multiple MX (failover/priority)
example.com.    3600    IN    MX    10    mail1.example.com.
example.com.    3600    IN    MX    20    mail2.example.com.
example.com.    3600    IN    MX    50    mail-backup.example.com.

; External mail service (Google Workspace)
example.com.    3600    IN    MX    1     ASPMX.L.GOOGLE.COM.
example.com.    3600    IN    MX    5     ALT1.ASPMX.L.GOOGLE.COM.
example.com.    3600    IN    MX    5     ALT2.ASPMX.L.GOOGLE.COM.
example.com.    3600    IN    MX    10    ALT3.ASPMX.L.GOOGLE.COM.
example.com.    3600    IN    MX    10    ALT4.ASPMX.L.GOOGLE.COM.

; Microsoft 365
example.com.    3600    IN    MX    0     example-com.mail.protection.outlook.com.

; Mailgun
example.com.    3600    IN    MX    10    mxa.mailgun.org.
example.com.    3600    IN    MX    10    mxb.mailgun.org.

; AWS SES
example.com.    3600    IN    MX    10    inbound-smtp.us-east-1.amazonaws.com.
```

**Priority System:**
- **Lower number = higher priority**
- 0 is highest priority (used by some providers)
- Equal priority = load balancing
- Higher only used if lower unavailable

**Query Examples:**
```bash
dig MX example.com
# Shows priority and target

; Short format
dig +short MX example.com | sort -n
# Output: 10 mail1.example.com.
#         20 mail2.example.com.
```

**Important:**
- MX targets MUST have A/AAAA records
- Don't point MX to CNAME
- SPF should align with MX domains

---

### TXT Record (Text Record)

**Purpose:** Stores arbitrary text data. Critical for email authentication & verification.

**Examples:**
```dns
; SPF Record (Sender Policy Framework)
example.com.    3600    IN    TXT    "v=spf1 include:_spf.google.com include:mailgun.org -all"

; DKIM Record (DomainKeys Identified Mail)
selector1._domainkey.example.com.    3600    IN    TXT    "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1TaNgLlSyQMNWVLNLvyY/neDgaL2oqQE8T5illKqCgDtFHc8eHVAU+nlcaGmrKmDMw9dbgiGk1ocgZ56NR4ycfUHwQhvQPMUZw0cveel/8EAGoi/UyPmqfcPibytH81NFtTMAxUeM4Op8A6iHkvAMj5qLf4YRNsTkKAKW3OkwPQIDAQAB"

; DMARC Record
txt._dmarc.example.com.    3600    IN    TXT    "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com; pct=100; adkim=s; aspf=s"

; Domain verification (Google)
example.com.    3600    IN    TXT    "google-site-verification=abc123xyz789"

; Domain verification (Microsoft)
example.com.    3600    IN    TXT    "MS=ms12345678"

; Generic verification
txt.example.com.    3600    IN    TXT    "verification_token=abcdef123456"

; Multi-string TXT (long records, split into 255-char chunks)
example.com.    3600    IN    TXT    "v=spf1 ip4:192.0.2.0/24 ip4:198.51.100.0/24" " include:_spf.example.com -all"

; Arbitrary data
notes.example.com.    3600    IN    TXT    "Contact: admin@example.com | Datacenter: US-East"
```

**Query Examples:**
```bash
; All TXT records
dig TXT example.com

; Specific record
dig TXT _dmarc.example.com
dig TXT selector1._domainkey.example.com

; View raw string
dig +short TXT example.com
```

**SPF Policy Levels:**

| Mechanism | Meaning |
|-----------|---------|
| `+all` | Pass all (DANGEROUS) |
| `~all` | Soft fail (suspicious, but accepted) |
| `-all` | Hard fail (reject if not matched) |
| `?all` | Neutral (no opinion) |

**Common SPF Includes:**
```
v=spf1 include:_spf.google.com -all          ; Google Workspace
v=spf1 include:spf.protection.outlook.com -all ; Microsoft 365
v=spf1 include:mailgun.org -all                ; Mailgun
v=spf1 include:sendgrid.net -all               ; SendGrid
v=spf1 include:_spf.salesforce.com -all      ; Salesforce
v=spf1 include:amazonses.com -all             ; AWS SES
v=spf1 ip4:192.0.2.0/24 -all                  ; Custom IP range
```

**DMARC Policies:**
```
p=none      ; Monitor only, no action
p=quarantine; Mark as spam/junk
p=reject    ; Reject outright
```

---

## Security & Authentication Records

### CAA Record (Certification Authority Authorization)

**Purpose:** Specifies which CAs can issue certificates for the domain.

**Syntax:**
```dns
name    TTL    class    CAA    flags    tag    value
```

**Examples:**
```dns
; Allow specific CA only
example.com.    3600    IN    CAA    0    issue    "letsencrypt.org"

; Allow multiple CAs
example.com.    3600    IN    CAA    0    issue    "letsencrypt.org"
example.com.    3600    IN    CAA    0    issue    "digicert.com"

; Wildcard certificate control
example.com.    3600    IN    CAA    0    issuewild    "sectigo.com"

; Report violations
example.com.    3600    IN    CAA    0    iodef    "mailto:security@example.com"

; Block all issuance (precautionary)
example.com.    3600    IN    CAA    0    issue    ";"

; Comprehensive CAA policy
example.com.    3600    IN    CAA    0    issue    "letsencrypt.org"
example.com.    3600    IN    CAA    0    issue    "pki.goog"
example.com.    3600    IN    CAA    0    issuewild    ";"
example.com.    3600    IN    CAA    0    iodef    "mailto:caa-reports@example.com"
```

**Tag Values:**

| Tag | Purpose |
|-----|---------|
| `issue` | Authorized to issue standard certs |
| `issuewild` | Authorized to issue wildcard certs |
| `iodef` | URL for violation reports |

**Query Examples:**
```bash
dig CAA example.com
dig +short CAA example.com

; Check CAA for subdomains (inherits from parent)
dig CAA www.example.com
```

**Common CA Identifiers:**
- `letsencrypt.org` - Let's Encrypt
- `digicert.com` - DigiCert
- `sectigo.com` - Sectigo (formerly Comodo)
- `pki.goog` - Google Trust Services
- `amazontrust.com` - Amazon
- `comodoca.com` - Comodo
- `entrust.net` - Entrust
- `identrust.com` - IdenTrust

---

### SSHFP Record (SSH Fingerprint)

**Purpose:** Publishes SSH host key fingerprints in DNS.

**Syntax:**
```dns
name    TTL    class    SSHFP    algorithm    type    fingerprint
```

**Examples:**
```dns
; RSA key with SHA-1 fingerprint
server.example.com.    3600    IN    SSHFP    1    1    abc123def456789...

; RSA key with SHA-256 fingerprint (preferred)
server.example.com.    3600    IN    SSHFP    1    2    1234abcd5678efgh...

; Ed25519 key with SHA-256
server.example.com.    3600    IN    SSHFP    4    2    fedcba9876543210...

; Multiple algorithms
server.example.com.    3600    IN    SSHFP    1    2    aaaabbbbccccdddd...
server.example.com.    3600    IN    SSHFP    4    2    eeeeffffgggghhhh...

; Auto-generated from SSH host key
; ssh-keygen -r server.example.com
```

**Algorithm Numbers:**

| Number | Algorithm |
|--------|-----------|
| 1 | RSA |
| 2 | DSA (deprecated) |
| 3 | ECDSA |
| 4 | Ed25519 |

**Type Numbers:**

| Number | Hash |
|--------|------|
| 1 | SHA-1 (legacy) |
| 2 | SHA-256 (preferred) |

**Query & Usage:**
```bash
dig SSHFP server.example.com

; Verify SSH host key
ssh -o VerifyHostKeyDNS=yes user@server.example.com

; In ssh_config:
# VerifyHostKeyDNS yes
# Use DNS to verify host keys
```

---

### TLSA Record (TLS Authentication)

**Purpose:** Associates TLS certificate with domain (DANE - DNS-based Authentication of Named Entities).

**Syntax:**
```dns
name    TTL    class    TLSA    usage    selector    match    certificate-data
```

**Examples:**
```dns
; Certificate usage: End-entity cert
_443._tcp.example.com.    3600    IN    TLSA    3    0    1    abc123def456...

; Trust anchor verification
_443._tcp.example.com.    3600    IN    TLSA    2    0    1    cadef123456...

; Full certificate hash
_25._tcp.mail.example.com.    3600    IN    TLSA    3    0    0    m1iO9qKd...

; Generate with tool
; openssl x509 -in cert.pem -outform DER | openssl sha256
```

**Field Explanations:**

| Field | Values |
|-------|--------|
| **Usage** | 0=CA constraint, 1=Service cert constraint, 2=Trust anchor, 3=Domain-issued cert |
| **Selector** | 0=Full cert, 1=SubjectPublicKeyInfo |
| **Match** | 0=Exact match, 1=SHA-256, 2=SHA-512 |

**Query:**
```bash
dig TLSA _443._tcp.example.com
```

**Note:** DANE/TLSA requires DNSSEC-signed zones to be effective.

---

## Infrastructure Service Records

### SRV Record (Service Locator)

**Purpose:** Specifies location of services (hostname + port).

**Syntax:**
```dns
_service._protocol.name    TTL    class    SRV    priority    weight    port    target
```

**Examples:**
```dns
; SIP service
_sip._tcp.example.com.    3600    IN    SRV    10    5    5060    sipserver.example.com.
_sip._udp.example.com.    3600    IN    SRV    10    5    5060    sipserver.example.com.

; XMPP (Jabber) service
_xmpp-client._tcp.example.com.    3600    IN    SRV    5    0    5222    xmpp.example.com.
_xmpp-server._tcp.example.com.    3600    IN    SRV    5    0    5269    xmpp.example.com.

; LDAP service
_ldap._tcp.example.com.    3600    IN    SRV    10    0    389    ldap.example.com.
_ldaps._tcp.example.com.    3600    IN    SRV    10    0    636    ldap.example.com.

; Kerberos
_kerberos._tcp.example.com.    3600    IN    SRV    0    0    88    kerberos.example.com.
_kerberos-master._tcp.example.com.    3600    IN    SRV    0    0    88    kerberos.example.com.

; Minecraft server
_minecraft._tcp.example.com.    3600    IN    SRV    0    0    25565    mc.example.com.

; Multiple servers (priority/weight load balancing)
_ldap._tcp.example.com.    3600    IN    SRV    10    60    389    ldap1.example.com.
_ldap._tcp.example.com.    3600    IN    SRV    10    40    389    ldap2.example.com.
_ldap._tcp.example.com.    3600    IN    SRV    20    0    389    ldap-backup.example.com.
```

**Priority vs Weight:**
- **Priority**: Lower = preferred. Higher only used if lower unavailable.
- **Weight**: Load balancing among same priority. Higher = more traffic.

**Query Examples:**
```bash
dig SRV _ldap._tcp.example.com
dig SRV _sip._tcp.example.com

; Query with service discovery
nslookup -type=SRV _xmpp-client._tcp.example.com
```

---

### PTR Record (Pointer/Reverse DNS)

**Purpose:** Maps IP address to hostname (reverse of A/AAAA).

**Zone File Format:**
```dns
; IPv4 PTR (in-addr.arpa zone)
1.2.0.192.in-addr.arpa.    3600    IN    PTR    example.com.

; IPv6 PTR (ip6.arpa zone)
1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa.    3600    IN    PTR    example.com.
```

**Forward vs Reverse:**
```
Forward:  example.com → A → 192.0.2.1
Reverse:  192.0.2.1 → PTR → example.com

IPv4 Reverse Construction:
192.0.2.1 → 1.2.0.192.in-addr.arpa.
```

**Query Examples:**
```bash
; IPv4 reverse
dig -x 192.0.2.1
# Equivalent to:
dig PTR 1.2.0.192.in-addr.arpa.

; IPv6 reverse
dig -x 2001:db8::1
dig PTR 1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa.

; Short output
dig +short -x 8.8.8.8
# Output: dns.google.
```

---

## Specialized Records

### DNAME Record (Delegation Name)

**Purpose:** Creates an alias for an entire subtree (like CNAME but for all descendants).

**Examples:**
```dns
; Redirect all *.old.example.com to *.new.example.com
department.old.example.com.    3600    IN    DNAME    department.new.example.com.

; Domain migration
old-domain.example.    3600    IN    DNAME    new-domain.example.

; Result:
; www.old-domain.example → www.new-domain.example
; mail.old-domain.example → mail.new-domain.example
; api.old-domain.example → api.new-domain.example
```

**Query:**
```bash
dig DNAME old.example.com
```

---

### NAPTR Record (Naming Authority Pointer)

**Purpose:** Used for service discovery with regular expression rewriting.

**Commonly used for:** ENUM (phone number to URI mapping), SIP service location.

**Syntax:**
```dns
name    TTL    class    NAPTR    order    preference    flags    service    regex    replacement
```

**Examples:**
```dns
; ENUM (E.164 to SIP URI)
4.3.2.1.5.5.5.1.1.8.e164.arpa.    3600    IN    NAPTR    10    100    "u"    "E2U+sip"    "!^.*$!sip:user@example.com!"    .

; SIP service with SRV fallback
_sip._udp.example.com.    3600    IN    NAPTR    100    10    "s"    "SIP+D2U"    ""    _sip._udp.example.com.

; Multiple services
example.com.    3600    IN    NAPTR    10    100    "s"    "SIP+D2U"    ""    _sip._udp.example.com.
example.com.    3600    IN    NAPTR    10    101    "s"    "SIP+D2T"    ""    _sip._tcp.example.com.
```

**Query:**
```bash
dig NAPTR example.com
```

---

### RP Record (Responsible Person)

**Purpose:** Identifies responsible person for the domain.

**Examples:**
```dns
; Basic RP record
example.com.    3600    IN    RP    admin.example.com. admin.example.com.

; With text record for details
example.com.    3600    IN    RP    admin.example.com. admin.text.example.com.
admin.text.example.com.    3600    IN    TXT    "John Doe, IT Administrator, +1-555-0100"
```

**Query:**
```bash
dig RP example.com
```

---

### LOC Record (Location)

**Purpose:** Geographic location of the domain/device.

**Syntax:**
```dns
name    TTL    class    LOC    lat-d    lat-m    lat-s    NS    lon-d    lon-m    lon-s    EW    alt    size    horiz-precision    vert-precision
```

**Examples:**
```dns
; Latitude/latitude of data center
server.example.com.    3600    IN    LOC    37    23    30.900    N    121    59    19.000    W    10.00m    1m    10000m    10m

; Simple location
dc.example.com.    3600    IN    LOC    51 30 0.000 N 0 7 0.000 W 0.00m 10m
```

**Query:**
```bash
dig LOC dc.example.com
```

---

### HINFO Record (Host Information)

**Purpose:** Provides CPU and OS information about the host.

**Examples:**
```dns
; Hardware/OS info
server.example.com.    3600    IN    HINFO    "Intel-Xeon" "Linux-5.15"

; Deprecated in modern DNS due to security concerns
; Reveals too much info to attackers
```

**Security Note:** Most admins avoid HINFO today as it provides OSINT to attackers.

---

### TXT Records for Modern Uses

```dns
; Google Workspace (multiple services)
example.com.    3600    IN    TXT    "google-site-verification=xxx"
example.com.    3600    IN    TXT    "google-gws-verification=xxx"

; Microsoft 365
example.com.    3600    IN    TXT    "MS=ms12345678"
example.com.    3600    IN    TXT    "v=verifydomain MS=xxx"

; Apple
example.com.    3600    IN    TXT    "apple-domain-verification=xxx"

; Facebook
txt.example.com.    3600    IN    TXT    "facebook-domain-verification=xxx"

; Atlassian
txt.example.com.    3600    IN    TXT    "atlassian-domain-verification=xxx"

; Zoom
txt.example.com.    3600    IN    TXT    "ZOOM_verify_xxx"

; DMARC reporting
_dmarc.example.com.    3600    IN    TXT    "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com; ruf=mailto:forensic@example.com; fo=1"

; BIMI (Brand Indicators for Message Identification)
default._bimi.example.com.    3600    IN    TXT    "v=BIMI1; l=https://example.com/logo.svg; a=https://example.com/certificate.pem"

; MTA-STS (Mail Transfer Agent Strict Transport Security)
_mta-sts.example.com.    3600    IN    TXT    "v=STSv1; id=20240101000000Z"

; TLS-RPT (TLS Reporting)
_smtp._tls.example.com.    3600    IN    TXT    "v=TLSRPTv1; rua=mailto:tls-reports@example.com"

; Enterprise security (MARC, ARC)
_marc.example.com.    3600    IN    TXT    "v=MARC1; p=reject; rua=mailto:marc@example.com"
```

---

## Deprecated or Legacy Records

### A6 Record (Experimental IPv6 - Deprecated)

**Status:** Obsoleted by RFC 6563, replaced by AAAA.

```dns
; NEVER use this - informational only
example.com.    3600    IN    A6    0    2001:db8::1
```

---

### MD, MF, MB, MG, MR, MINFO Records (Legacy Email)

**Status:** Historic, never widely adopted.

- **MD** - Mail destination (deprecated)
- **MF** - Mail forwarder (deprecated)
- **MB** - Mailbox (experimental)
- **MG** - Mail group member (experimental)
- **MR** - Mail rename (experimental)
- **MINFO** - Mailbox information (experimental)

**All superseded by MX.**

---

### WKS Record (Well Known Services)

**Status:** Obsolete.

```dns
; DO NOT USE
example.com.    3600    IN    WKS    192.0.2.1    TCP    (0 21 23 25 80)
```

---

### SPF Record (Type 99 - Deprecated)

**Status:** Deprecated, use TXT instead.

```dns
; Old SPF record type (not recommended)
example.com.    3600    IN    SPF    "v=spf1 -all"

; Modern approach (use this instead)
example.com.    3600    IN    TXT    "v=spf1 -all"
```

---

## DNSSEC-Specific Records

### DNSKEY Record (DNS Public Key)

**Purpose:** Contains public key used for DNSSEC signing.

**Examples:**
```dns
; Key Signing Key (KSK) - 256 for ZSK, 257 for KSK
example.com.    3600    IN    DNSKEY    257    3    8    AwEAAazQ...{base64}...
example.com.    3600    IN    DNSKEY    256    3    8    AwEAAbQ...

; Key Signing Key (KSK): flags=257
; Zone Signing Key (ZSK): flags=256

; Algorithm 8 = RSA/SHA-256
```

**Flags:**
- 256 = Zone Signing Key (ZSK)
- 257 = Key Signing Key (KSK) + Secure Entry Point

**Query:**
```bash
dig DNSKEY example.com +dnssec
```

---

### DS Record (Delegation Signer)

**Purpose:** Hash of DNSKEY, published in parent zone to establish trust chain.

**Examples:**
```dns
; In parent zone (e.g., .com zone for example.com)
example.com.    3600    IN    DS    30908    8    2    E460F1...{SHA256 hash}...

; Fields: key tag, algorithm, digest type, digest
; Digest type 1 = SHA-1 (avoid)
; Digest type 2 = SHA-256 (preferred)
; Digest type 4 = SHA-384
```

**Query:**
```bash
dig DS example.com
```

---

### RRSIG Record (Resource Record Signature)

**Purpose:** Cryptographic signature for resource sets.

**Examples:**
```dns
; Generated automatically by DNSSEC signer
; Not manually created

; View with:
; dig A example.com +dnssec
```

---

### NSEC / NSEC3 Record (Next Secure)

**Purpose:** Proves non-existence of records (prevents zone walking).

**Examples:**
```dns
; NSEC - shows next existing name (enables zone walking)
www.example.com.    3600    IN    NSEC    mail.example.com.    A RRSIG NSEC

; NSEC3 - hashed names (prevents zone walking)
abc123.example.com.    3600    IN    NSEC3    1    1    12    AABBCCDD...    NS SOA RRSIG DNSKEY
abc123.example.com.    3600    IN    NSEC3PARAM    1    0    12    AABBCCDD

; NSEC3PARAM - defines hashing parameters
example.com.    3600    IN    NSEC3PARAM    1    0    12    AABBCCDD
```

**NSEC3 Fields:**
- Algorithm (1 = SHA-1)
- Flags (0 or 1 for opt-out)
- Iterations (hash iterations, security/perf tradeoff)
- Salt (random value)

---

### CDNSKEY / CDS Record (Child DS)

**Purpose:** Allows child zone to publish its own DS record for parent update.

**Examples:**
```dns
; Child side - signals to parent
example.com.    3600    IN    CDS    30908    8    2    E460F1...
example.com.    3600    IN    CDNSKEY    257    3    8    AwEAAaz...

; Parent reads these and creates/updating DS
```

---

## Cloud/SaaS Provider Records

### AWS Route 53 Specific

```dns
; ALIAS record (Route 53 special - CNAME-like for root)
@    60    IN    ALIAS    dualstack.myelb.us-east-1.elb.amazonaws.com.

; Weighted routing
www.example.com.    60    IN    A    192.0.2.10    ; SetId: primary
www.example.com.    60    IN    A    192.0.2.20    ; SetId: secondary

; Latency-based routing
www.example.com.    60    IN    A    192.0.2.10    ; Region: us-east-1
www.example.com.    60    IN    A    198.51.100.10    ; Region: eu-west-1

; Failover
www.example.com.    60    IN    A    192.0.2.10    ; Failover: PRIMARY
www.example.com.    60    IN    A    192.0.2.20    ; Failover: SECONDARY
```

**Note:** ALIAS is Route 53-specific, not standard DNS.

---

### Cloudflare Specific

```dns
; CNAME flattening - behaves like ALIAS at root
; Configured via UI, not in zone file

; Cloudflare-specific proxied records (orange cloud)
www.example.com.    300    IN    A    192.0.2.1    ; Proxied: true

; Workers routing (managed via API/UI)
```

---

### Google Cloud DNS

```dns
; Standard DNS, no special records
; Uses Cloud DNS for management

; DNSSEC policy
; Configured via gcloud CLI, not in zone file
; gcloud dns managed-zones update example-com --dnssec-state on
```

---

### Azure DNS

```dns
; Standard records
; Uses Azure-specific naming for traffic manager

; Traffic Manager profile
trade-off-example.trafficmanager.net.    300    IN    CNAME    contoso.trafficmanager.net.
```

---

## Record Syntax Reference

### Zone File Format

```dns
; Comments start with semicolon
$ORIGIN example.com.              ; Default suffix for relative names
$TTL 3600                          ; Default TTL for records
$INCLUDE /path/to/other.zone       ; Include another zone file

; SOA (required)
@    IN    SOA    ns1.example.com. admin.example.com. (
                2024021801  ; Serial
                3600        ; Refresh
                1800        ; Retry
                604800      ; Expire
                86400 )     ; Minimum TTL

; NS records (required minimum 2)
@    IN    NS    ns1.example.com.
@    IN    NS    ns2.example.com.

; Glue records (if NS is under same zone)
ns1    IN    A    192.0.2.53
ns2    IN    A    192.0.2.54

; Standard records
@    IN    A        192.0.2.1
www    IN    CNAME    example.com.
mail    IN    A       192.0.2.10
@    IN    MX    10    mail.example.com.
@    IN    TXT    "v=spf1 include:_spf.example.com -all"
```

### Name Notation

| Notation | Meaning |
|----------|---------|
| `@` | Current $ORIGIN (usually zone root) |
| `example.com.` | Absolute FQDN (trailing dot) |
| `www` | Relative to $ORIGIN → www.example.com |
| `*` | Wildcard (matches anything not defined) |
| `_service._proto` | Service prefix (SRV, TLSA, etc) |

### Character Strings

```dns
; Plain string
example.com.    IN    TXT    "simple text"

; Escaped characters
example.com.    IN    TXT    "line1\nline2"       ; newline
example.com.    IN    TXT    "tab\there"          ; tab
example.com.    IN    TXT    "quote\"escape"     ; escaped quote
example.com.    IN    TXT    "backslash\\here"     ; backslash

; Multiple strings (concatenated)
example.com.    IN    TXT    "part1" "part2"      ; Becomes "part1part2"

; Long record (split into chunks)
example.com.    IN    TXT    "v=DKIM1; k=rsa; p=MIIBI..." "...rest of key"
```

### TTL Format

```dns
; Seconds (standard)
example.com.    3600    IN    A    192.0.2.1

; BIND format (can use units)
example.com.    1h      IN    A    192.0.2.1
example.com.    1d      IN    A    192.0.2.1
example.com.    1w      IN    A    192.0.2.1

; From $TTL directive
$TTL 1h
example.com.    IN    A    192.0.2.1    ; inherits 1h
```

### Class Values

| Class | Meaning |
|-------|---------|
| `IN` | Internet (standard) |
| `CH` | Chaos (rare, ancient) |
| `HS` | Hesiod (rare) |

99.9% of records use `IN`.

---

## Quick Reference Table

| Record | Type | Purpose | Example |
|--------|------|---------|---------|
| **A** | Address | IPv4 mapping | `192.0.2.1` |
| **AAAA** | Address | IPv6 mapping | `2001:db8::1` |
| **CNAME** | Canonical | Alias/redirect | `target.example.com.` |
| **MX** | Mail | Email routing | `10 mail.example.com.` |
| **NS** | Name Server | Zone delegation | `ns1.example.com.` |
| **PTR** | Pointer | Reverse lookup | `example.com.` |
| **SOA** | Authority | Zone metadata | administrative info |
| **TXT** | Text | Verification/data | `"v=spf1 -all"` |
| **SRV** | Service | Service location | `10 5 5060 sip.example.com.` |
| **CAA** | Certificate Auth | CA restriction | `0 issue "letsencrypt.org"` |
| **DNSKEY** | DNS Key | DNSSEC public key | cryptographic data |
| **DS** | Delegation Signer | Parent trust | key hash |
| **TLSA** | TLS Auth | Certificate pinning | DANE record |
| **SSHFP** | SSH Fingerprint | SSH host verification | key fingerprint |

---

## Validation Tools

```bash
# Check zone file syntax
named-checkzone example.com /var/named/example.com.zone

# Verify DNSSEC signatures
delv @8.8.8.8 example.com +root=example.com

# Online validators
# https://dnsviz.net/
# https://dnssec-analyzer.verisignlabs.com/
# https://dnscheck.pingdom.com/
# https://toolbox.googleapps.com/apps/checkmx/

# SPF validation
# https://mxtoolbox.com/spf.aspx
# https://dkimvalidator.com/

# CAA checking
# https://sslmate.com/caa/
```

---

## Resources

- [RFC 1035](https://tools.ietf.org/html/rfc1035) - DNS Specification
- [RFC 2181](https://tools.ietf.org/html/rfc2181) - DNS Clarifications
- [RFC 4033-4035](https://tools.ietf.org/html/rfc4033) - DNSSEC
- [RFC 6844](https://tools.ietf.org/html/rfc6844) - CAA Records
- [RFC 7208](https://tools.ietf.org/html/rfc7208) - SPF Specification
- [RFC 6376](https://tools.ietf.org/html/rfc6376) - DKIM
- [RFC 7489](https://tools.ietf.org/html/rfc7489) - DMARC
- [RFC 6698](https://tools.ietf.org/html/rfc6698) - DANE/TLSA
