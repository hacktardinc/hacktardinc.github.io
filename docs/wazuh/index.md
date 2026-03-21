---
title: Wazuh SIEM Documentation
description: Wazuh is a free, open-source security platform that provides unified XDR and SIEM protection across endpoints, cloud services, and containers. It offers comprehensive security monitoring, intrusion detection, log analysis, and compliance management capabilities.
icon: lucide/server
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

## Introduction to Wazuh

Wazuh is a free, open-source security platform that provides unified XDR and SIEM protection across endpoints, cloud services, and containers. It offers comprehensive security monitoring, intrusion detection, log analysis, and compliance management capabilities.

### What is Wazuh?

Wazuh (pronounced "waz-uh") is a robust security monitoring solution that combines the capabilities of:

- **Security Information and Event Management (SIEM)**   
- **Extended Detection and Response (XDR)**
- **Intrusion Detection System (IDS)**
- **Security Compliance**
    
### Key Features

#### 1. **Log Data Analysis**

- Collects and analyzes log data from various sources
- Supports syslog, Windows event logs, and application logs
- Real-time log parsing and correlation
    
#### 2. **Intrusion Detection**

- File integrity monitoring 
- Rootkit and malware detection
- System call monitoring
- Policy and compliance monitoring
    

#### 3. **Vulnerability Detection**

- Automated vulnerability assessment
- CVE database integration
- Application inventory scanning
- Security configuration assessment
    
#### 4. **Incident Response**

- Automated response to security events
- Active response capabilities
- Integration with external tools
- Forensic data collection

#### 5. **Regulatory Compliance**

- Pre-built compliance templates (PCI DSS, GDPR, HIPAA, NIST)
- Custom compliance checks
- Comprehensive reporting capabilities

### Architecture Overview

Wazuh follows a client-server architecture with three main components:

#### **Wazuh Server**

- Central component for data analysis and storage
- Includes indexer, dashboard, and server components
- Stores alerts and events
- Handles rule and policy management

#### **Wazuh Indexer**

- Scalable indexing and storage engine
- Based on OpenSearch/Elasticsearch
- Provides fast search and data retrieval capabilities
    
#### **Wazuh Dashboard**

- Web-based user interface for data visualization
- Real-time security monitoring
- Customizable dashboards and reports
    

#### **Wazuh Agents**

- Lightweight agents deployed on monitored systems
- Collect security data and forward to server
- Support for Windows, Linux, macOS, and Solaris
    

### Supported Platforms

#### **Operating Systems**

- Amazon Linux 2, Amazon Linux 2023
- CentOS Stream 10
- Red Hat Enterprise Linux 7, 8, 9, 10
- Ubuntu 16.04, 18.04, 20.04, 22.04, 24.04
    
#### **Cloud & Container Platforms**

- AWS
- Azure
- Google Cloud
- Docker containers
- Kubernetes
    
### Use Cases

1. **Security Monitoring** - Real-time threat detection and alerting
2. **Compliance Management** - Automated compliance auditing and reporting
3. **Incident Investigation** - Forensic analysis and threat hunting
4. **Vulnerability Management** - Continuous vulnerability assessment
5. **Cloud Security** - Security monitoring for cloud environments
    
### Benefits

- **Open Source** - Free to use with active community support
- **Scalable** - Can monitor from small to very large environments
- **Comprehensive** - All-in-one security monitoring solution
- **Flexible** - Supports hybrid and multi-cloud environments
- **Extensible** - Custom rules, decoders, and integrations
    

---

_This documentation will cover various installation methods, configuration approaches, and best practices for deploying Wazuh in different environments._