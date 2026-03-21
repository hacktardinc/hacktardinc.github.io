---
title: Shodan Queries
description: Shodan Queries
icon: fontawesome/brands/searchengin
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

# Shodan Queries Cheatsheet

## Table of Contents
1. [Introduction](#introduction)
2. [Basic Query Syntax](#basic-query-syntax)
3. [Essential Filters](#essential-filters)
4. [Network & Infrastructure Filters](#network--infrastructure-filters)
5. [Location-Based Filters](#location-based-filters)
6. [Device & Service Filters](#device--service-filters)
7. [SSL/TLS Filters](#ssltls-filters)
8. [HTTP-Specific Filters](#http-specific-filters)
9. [Cloud & CDN Filters](#cloud--cdn-filters)
10. [Vulnerability Filters](#vulnerability-filters)
11. [Time-Based Filters](#time-based-filters)
12. [Screenshot & Visual Filters](#screenshot--visual-filters)
13. [Specialized Queries by Category](#specialized-queries-by-category)
14. [Advanced Query Combinations](#advanced-query-combinations)
15. [Operators & Logic](#operators--logic)
16. [Practical Use Cases](#practical-use-cases)
17. [Best Practices & Ethics](#best-practices--ethics)

---

## Introduction

**Shodan** is a search engine for Internet-connected devices that indexes services, banners, and metadata from open ports across the Internet. Unlike traditional search engines that index websites, Shodan scans IP addresses and catalogs information about servers, IoT devices, industrial control systems, and more.

### What is a Banner?
A banner is the fundamental unit of data in Shodan - it contains information returned by a service when queried. By default, Shodan only searches the `data` property of banners unless you use filters.

---

## Basic Query Syntax

### Plain Text Search
```
apache
```
Searches for the word "apache" in banner data (case-insensitive).

### Using Filters
```
filter:value
```
**Note:** No space between filter name and value.

### Quoted Values
```
org:"Google Cloud"
```
Use quotes when values contain spaces.

### Multiple Filters
```
country:US port:80 product:Apache
```
Filters are automatically ANDed together (all conditions must match).

---

## Essential Filters

### IP Address & Network
| Filter | Description | Example |
|--------|-------------|---------|
| `ip:` | Search for specific IP address | `ip:8.8.8.8` |
| `net:` | Search within IP range (CIDR notation) | `net:192.168.1.0/24` |
| `hostname:` | Search by hostname (reverse DNS) | `hostname:example.com` |

### Organization & ISP
| Filter | Description | Example |
|--------|-------------|---------|
| `org:` | Network organization name | `org:"Google"` |
| `isp:` | Internet Service Provider | `isp:"Verizon"` |
| `asn:` | Autonomous System Number | `asn:AS15169` |

### Port & Product
| Filter | Description | Example |
|--------|-------------|---------|
| `port:` | Service port number | `port:22` |
| `product:` | Product/software name | `product:Apache` |
| `version:` | Software version | `version:2.4.7` |
| `os:` | Operating system | `os:Linux` |

---

## Network & Infrastructure Filters

### Network Ranges
```
net:10.0.0.0/8              # Search entire 10.0.0.0 Class A network
net:172.16.0.0/12           # Private network range
net:192.168.0.0/16          # Common home/office networks
```

### ASN Queries
```
asn:AS15169                 # Google
asn:AS16509                 # Amazon
asn:AS8075                  # Microsoft
```

### Multiple IPs/Hostnames
```
hostname:google.com,facebook.com    # Comma-separated OR logic
ip:1.1.1.1,8.8.8.8                 # Multiple IP addresses
```

---

## Location-Based Filters

### Country
```
country:US                  # United States (2-letter code)
country:GB                  # United Kingdom
country:DE,FR,IT            # Multiple countries (OR)
```

### City & Region
```
city:"San Francisco"        # Specific city
city:"New York"
region:"California"         # State/province
state:"Texas"              # US state
postal:94102               # US postal code (ZIP)
```

### Geographic Coordinates
```
geo:"37.7749,-122.4194"            # Latitude, longitude
geo:"51.5074,-0.1278,10"           # With radius (km)
geo:"40.7128,-74.0060,5,10"        # Min and max radius
```

---

## Device & Service Filters

### Common Services
```
product:MySQL               # MySQL databases
product:MongoDB             # MongoDB instances
product:Apache              # Apache web servers
product:nginx               # Nginx servers
product:OpenSSH             # SSH servers
product:Microsoft-IIS       # IIS web servers
product:Docker              # Docker APIs
product:Redis               # Redis databases
product:Elasticsearch       # Elasticsearch clusters
product:PostgreSQL          # PostgreSQL databases
```

### Device Types
```
device:webcam               # Webcams
device:"storage device"     # Storage systems
device:phone                # VoIP phones
device:router               # Routers
device:firewall             # Firewalls
device:printer              # Network printers
```

---

## SSL/TLS Filters

### SSL Version
```
ssl.version:sslv2           # SSLv2 (insecure)
ssl.version:sslv3           # SSLv3 (insecure)
ssl.version:tlsv1           # TLS 1.0
ssl.version:tlsv1.1         # TLS 1.1
ssl.version:tlsv1.2         # TLS 1.2
ssl.version:tlsv1.3         # TLS 1.3
```

### Certificate Information
```
ssl.cert.subject.cn:*.google.com    # Common name
ssl.cert.issuer.cn:"Let's Encrypt"  # Certificate issuer
ssl.cert.expired:true               # Expired certificates
ssl.cert.serial:12345678            # Certificate serial number
ssl.cert.fingerprint:abc123         # Certificate fingerprint
ssl:domain.com                      # Any SSL cert for domain
```

### SSL Vulnerabilities
```
vuln:CVE-2014-0160          # Heartbleed
ssl.version:sslv2 -ssl.version:tlsv1,tlsv1.2,tlsv1.3  # Only SSLv2
```

---

## HTTP-Specific Filters

### Status Codes
```
http.status:200             # OK responses
http.status:301             # Redirects
http.status:403             # Forbidden
http.status:404             # Not found
http.status:500             # Server errors
```

### HTML & Content
```
http.html:login             # HTML content contains "login"
http.html_hash:12345678     # Specific HTML hash
http.title:"Admin Panel"    # Page title
http.title_hash:12345678    # Title hash
```

### Headers & Components
```
http.server:nginx           # Server header
http.component:PHP          # Technology/framework
http.component:WordPress    # WordPress sites
http.component:bootstrap    # Bootstrap framework
http.component_category:CMS # Content Management Systems
http.waf:Cloudflare        # Web Application Firewall
```

### Favicon
```
http.favicon.hash:12345678  # Favicon hash (useful for fingerprinting)
```

### Security Headers
```
http.headers_hash:12345678  # Headers hash
"Strict-Transport-Security" # HSTS header present
http.securitytxt            # security.txt file present
```

### Robots & DOM
```
http.robots_hash:12345678   # robots.txt hash
http.dom_hash:12345678      # DOM structure hash
```

---

## Cloud & CDN Filters

### Cloud Providers
```
cloud.provider:AWS          # Amazon Web Services
cloud.provider:Azure        # Microsoft Azure
cloud.provider:GCP          # Google Cloud Platform
cloud.provider:DigitalOcean # DigitalOcean
cloud.provider:Alibaba      # Alibaba Cloud
```

### Cloud Region
```
cloud.region:us-east-1      # AWS US East
cloud.region:eu-west-1      # AWS EU West
cloud.service:EC2           # AWS EC2 instances
cloud.service:S3            # AWS S3 buckets
```

---

## Vulnerability Filters

### CVE Search
```
vuln:CVE-2014-0160          # Heartbleed
vuln:CVE-2019-19781         # Citrix vulnerability
vuln:CVE-2017-5638          # Apache Struts
vuln:CVE-2018-7600          # Drupalgeddon2
vuln:CVE-2021-44228         # Log4Shell
```

### Vulnerability Presence
```
has_vuln:true               # Any known vulnerabilities
vuln.verified:true          # Verified vulnerabilities
```

### Malware & Tags
```
tag:malware                 # Tagged as malware
tag:ics                     # Industrial Control Systems
tag:vpn                     # VPN devices
tag:database                # Databases
tag:webcam                  # Webcams
```

---

## Time-Based Filters

### Date Ranges
```
after:01/01/2024            # After date (DD/MM/YYYY)
before:31/12/2023           # Before date
after:01-01-2024            # Also accepts DD-MM-YYYY
```

### Examples
```
before:01/01/2020 os:"Windows XP"   # Old unpatched systems
after:01/12/2023 vuln:CVE-2023-*    # Recent vulnerabilities
```

---

## Screenshot & Visual Filters

### Screenshot Availability
```
has_screenshot:true         # Devices with screenshots
has_screenshot:false        # No screenshots
```

### Screenshot Labels (ML-detected)
```
screenshot.label:ics        # Industrial control systems
screenshot.label:login      # Login pages
screenshot.label:desktop    # Remote desktops
```

### Screenshot Hash
```
screenshot.hash:12345678    # Specific screenshot hash
```

### OCR Content Search
```
has_screenshot:true encrypted attention  # Ransomware screens
has_screenshot:true "bitcoin"           # Crypto-related screens
```

---

## Specialized Queries by Category

### 🎥 Webcams & Surveillance
```
# Generic webcam searches
webcam
product:webcam
server:webcampxp
server:"webcam 7"
title:camera

# Specific camera types
"Server: yawcam"            # Yawcam cameras
product:"Hikvision"         # Hikvision cameras
ACTi                        # ACTi cameras
"Merit LILIN"               # LILIN cameras
Netwave IP Camera           # Netwave cameras
"DVR" port:81               # DVR systems

# Unprotected cameras
has_screenshot:true webcam
"authentication disabled" port:554
title:"+tm01+"              # Unprotected Linksys

# Screenshots available
has_screenshot:true camera
has_screenshot:true IP Webcam
```

### 🖥️ Remote Desktop
```
# RDP (Remote Desktop Protocol)
port:3389                   # Standard RDP port
port:3389 country:US
"Remote Desktop"

# VNC (Virtual Network Computing)
port:5900                   # VNC
"authentication disabled" "RFB 003.008"
has_screenshot:true vnc
has_screenshot:true rfb disabled port:80,443

# TeamViewer
port:5938                   # TeamViewer
```

### 🗄️ Databases
```
# MongoDB
product:MongoDB
port:27017
port:27017 product:MongoDB
"MongoDB Server Information"
port:27017 -authentication

# MySQL
product:MySQL
port:3306
port:3306 product:MySQL

# PostgreSQL
port:5432
product:PostgreSQL

# Redis
product:Redis
port:6379
"redis_version"

# Elasticsearch
product:Elasticsearch
port:9200
product:elastic port:9200
"elastic indices"

# CouchDB
product:CouchDB
port:5984

# Cassandra
product:Cassandra
port:9042

# Microsoft SQL Server
product:"Microsoft SQL Server"
port:1433

# Oracle
product:Oracle
port:1521
```

### 🏭 Industrial Control Systems (ICS/SCADA)
```
# General ICS
tag:ics
screenshot.label:ics
port:102                    # Siemens S7

# Modbus
port:502
product:Modbus

# Siemens
"Siemens, SIMATIC"
port:102 Siemens

# Schneider Electric
"Schneider Electric"
port:2404

# BACnet
port:47808

# EtherNet/IP
port:44818

# DNP3
port:20000

# MQTT (IoT protocol)
port:1883

# OPC UA
port:4840

# PCWorx
port:1962

# ProConOs
port:20547

# OMRON FINS
port:9600
```

### 🖨️ Printers
```
# Generic printer search
port:9100                   # JetDirect protocol

# Specific brands
"Printer Type: Lexmark"
"Server: EPSON-HTTP"
"Server: CANON HTTP Server"
ssl:"Xerox Generic Root"
"HP-ChaiSOE"
hp printer

# Web interfaces
http.title:"printer"
http.component:printer
```

### 📞 VoIP Devices
```
# SIP (Session Initiation Protocol)
port:5060
product:Asterisk

# Specific devices
product:snom                # Snom phones
"snom embedded"
"Cisco" port:5060
device:"voip phone"

# Conferencing
"Polycom"
"Grandstream"
```

### 🌐 Network Infrastructure
```
# Routers
device:router
"cisco" "router"
"MikroTik"
"Juniper"

# Firewalls
device:firewall
product:"pfSense"
"Fortinet"
"SonicWall"
product:"F5 BIG-IP"

# Load Balancers
product:"F5 BIG-IP"
"nginx" "load balancer"
"HAProxy"

# Switches
"cisco" "switch"
"HP Switch"
```

### ☁️ Cloud Storage & Services
```
# AWS
cloud.provider:AWS
"X-Amz-" port:80
"AmazonS3"

# Azure
cloud.provider:Azure
"Microsoft-Azure"

# Google Cloud
org:"Google Cloud"
cloud.provider:GCP

# Exposed file shares
"Index of /" port:80
```

### 🐳 Containers & Orchestration
```
# Docker
product:Docker
"Docker Containers:" port:2375
port:2375
port:2376                   # Docker TLS

# Kubernetes
"kubernetes" port:443
port:10250                  # Kubelet
port:6443                   # Kubernetes API

# Portainer
http.title:"Portainer"
```

### 🎮 Game Servers
```
# Minecraft
product:Minecraft
port:25565

# Steam
"Valve" port:27015

# TeamSpeak
port:9987

# Counter-Strike
product:"Counter-Strike"
```

### 🔐 Security Devices
```
# Security cameras (dedicated systems)
"DVR" "Security"
"NVR" http

# Access control
"Access Control"
"Card Reader"

# Alarm systems
"Alarm System"
```

### 💻 Development & CI/CD
```
# Jenkins
http.title:"Jenkins"
http.component:jenkins
"X-Jenkins"

# GitLab
http.title:"GitLab"

# Travis CI
http.title:"Travis CI"

# Sonarqube
http.favicon.hash:1485257654

# Jira
html:jira
http.title:"jira"

# Confluence
"confluence"
```

---

## Advanced Query Combinations

### Complex Searches
```
# Apache servers in US with specific version
product:Apache version:2.4.7 country:US

# Unsecured MongoDB in specific network
product:MongoDB port:27017 -authentication net:192.168.0.0/16

# Linux SSH servers in Japan
os:Linux port:22 country:JP

# Windows RDP in New York City
os:Windows port:3389 city:"New York"

# Expired SSL certs from Let's Encrypt
ssl.cert.expired:true ssl.cert.issuer.cn:"Let's Encrypt"

# Vulnerable Citrix in Europe
vuln:CVE-2019-19781 country:DE,CH,FR

# Industrial control systems without HTTP
tag:ics -port:80 -port:443

# Webcams with default passwords
webcam "default password"

# Databases with ransomware
port:27017 "send_bitcoin_to_retrieve_the_data"

# Apache excluding certain modules
product:Apache -http.component:"mod_ssl"
```

### Multi-filter Precision
```
# Find specific organization's vulnerable servers
org:"Company Name" vuln:CVE-2021-44228 port:443

# Unpatched Windows servers with RDP
os:"Windows Server 2008" port:3389 country:US

# IoT devices with telnet enabled
port:23 "root@" -login -password

# Cloud instances with SSH
cloud.provider:AWS port:22 os:Linux

# Old web servers in specific region
product:Apache version:2.2 region:California

# Compromised devices
http.title:"0wn3d by" has_screenshot:true

# Non-standard HTTP ports
port:8080,8888,8000 -port:80,443 http
```

---

## Operators & Logic

### Negation (Exclude)
```
-filter:value               # Exclude results matching filter
apache -port:80             # Apache not on port 80
country:US -city:"New York" # US excluding NYC
```

### Multiple Values (OR)
```
country:US,GB,CA            # Multiple countries
port:80,443,8080            # Multiple ports
product:Apache,nginx        # Apache OR nginx
```

### Combining AND with OR
```
# Devices in US OR UK on port 22
(country:US,GB) port:22

# SSH or Telnet in Germany
port:22,23 country:DE
```

### Wildcards
```
hostname:*.google.com       # Subdomains
ssl.cert.subject.cn:*.example.com
```

---

## Practical Use Cases

### 🔍 Security Auditing

#### Find Your Exposed Assets
```
# Search your organization's assets
org:"Your Company Name"
net:YOUR_IP_RANGE

# Find all services in your IP range
net:203.0.113.0/24

# Identify forgotten subdomains via SSL
ssl.cert.subject.cn:*.yourcompany.com
```

#### Check for Vulnerabilities
```
# Your assets with known CVEs
org:"Your Company" has_vuln:true

# Exposed databases
org:"Your Company" product:MongoDB,MySQL,PostgreSQL

# Services with default credentials
org:"Your Company" "default password"
```

### 🎯 Penetration Testing (Authorized)

#### Reconnaissance
```
# Map target's infrastructure
org:"Target Company"

# Find web servers
org:"Target" port:80,443

# Identify mail servers
org:"Target" port:25,587,465

# Locate VPN endpoints
org:"Target" ssl:"vpn"
```

#### Technology Stack Discovery
```
# Web technologies
org:"Target" http.component:*

# Operating systems
org:"Target" os:*

# Specific products
org:"Target" product:Apache,nginx,IIS
```

### 🕵️ OSINT & Threat Intelligence

#### Track Threat Actor Infrastructure
```
# C2 servers
product:"Cobalt Strike"
tag:malware
http.title:"Havoc"

# Phishing infrastructure
http.html:"login" ssl.cert.issuer.cn:"Let's Encrypt" -org:*

# Compromised sites
http.html:"hacked by"
"HACKED-ROUTER"
```

#### Monitor IoT Botnets
```
# Mirai-infected devices
"DVR" "Security" -password

# Insecure IoT
port:23 "root@" -login
```

### 📊 Research & Statistics

#### Technology Adoption
```
# Count HTTP/2 adoption
http.component:"HTTP/2"

# TLS 1.3 deployment
ssl.version:tlsv1.3

# IPv6 adoption
has_ipv6:true
```

#### Geographic Distribution
```
# Apache servers by country
product:Apache country:*

# Industrial control systems worldwide
tag:ics
```

---

## Best Practices & Ethics

### ⚠️ Legal & Ethical Guidelines

1. **Authorization Required**: Only scan networks and systems you own or have explicit written permission to test
2. **Read-Only Operations**: Shodan is for reconnaissance only - never attempt to exploit or access systems
3. **Responsible Disclosure**: Report vulnerabilities through proper channels
4. **Privacy Respect**: Avoid accessing personal devices, cameras, or sensitive systems
5. **Compliance**: Follow local laws and regulations (CFAA, GDPR, etc.)

### 🛡️ Defensive Use

#### Protect Your Assets
```
# Regular scans of your IP space
net:YOUR_RANGE

# Monitor for new exposures
Use Shodan Monitor feature

# Check SSL/TLS hygiene
org:"Your Company" ssl.cert.expired:true
org:"Your Company" ssl.version:sslv2,sslv3
```

#### Best Practices
- Regularly audit your external attack surface
- Close unnecessary ports
- Update software and patch vulnerabilities
- Use strong authentication
- Implement proper firewall rules
- Monitor for unexpected exposures

### 📝 Query Optimization

1. **Start Broad, Then Narrow**: Begin with general queries, then add filters
2. **Use Facets**: Analyze result distributions with facet analysis
3. **Save Queries**: Save frequently used queries for quick access
4. **API Automation**: Use Shodan API for programmatic access
5. **Rate Limiting**: Respect rate limits (especially on free accounts)

### 🔧 Tools & Integration

#### Shodan CLI
```bash
# Install
pip install shodan

# Initialize
shodan init YOUR_API_KEY

# Search
shodan search "apache country:US"

# Stats with facets
shodan stats --facets org,port apache
```

#### Python API
```python
import shodan

api = shodan.Shodan('YOUR_API_KEY')
results = api.search('apache')

for result in results['matches']:
    print(result['ip_str'], result['port'])
```

---

## Additional Resources

### Official Documentation
- [Shodan Help Center](https://help.shodan.io/)
- [Filter Reference](https://www.shodan.io/search/filters)
- [Search Examples](https://www.shodan.io/search/examples)
- [Shodan API Docs](https://developer.shodan.io/)

### Community Resources
- [Awesome Shodan Queries (GitHub)](https://github.com/jakejarvis/awesome-shodan-queries)
- [Shodan Explore](https://www.shodan.io/explore)
- [Shodan Maps](https://maps.shodan.io/)
- [Shodan ICS Radar](https://ics-radar.shodan.io/)

### Learning & Training
- Practice on your own authorized infrastructure
- Use Shodan for research and education
- Participate in bug bounty programs (with authorization)
- Contribute to security research

---

## Quick Reference Tables

### Common Ports
| Port | Service | Query |
|------|---------|-------|
| 21 | FTP | `port:21` |
| 22 | SSH | `port:22` |
| 23 | Telnet | `port:23` |
| 25 | SMTP | `port:25` |
| 80 | HTTP | `port:80` |
| 443 | HTTPS | `port:443` |
| 3306 | MySQL | `port:3306` |
| 3389 | RDP | `port:3389` |
| 5432 | PostgreSQL | `port:5432` |
| 5900 | VNC | `port:5900` |
| 6379 | Redis | `port:6379` |
| 8080 | HTTP Alt | `port:8080` |
| 9200 | Elasticsearch | `port:9200` |
| 27017 | MongoDB | `port:27017` |

### Country Codes (ISO 3166-1 alpha-2)
| Code | Country |
|------|---------|
| US | United States |
| GB | United Kingdom |
| DE | Germany |
| FR | France |
| CN | China |
| JP | Japan |
| IN | India |
| BR | Brazil |
| CA | Canada |
| AU | Australia |

---
