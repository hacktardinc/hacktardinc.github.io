---
title: Google Dorking
description: Google Dorking
icon: fontawesome/brands/google
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---


## Table of Contents
1. [Introduction](#introduction)
2. [Basic Search Operators](#basic-search-operators)
3. [Advanced Search Operators](#advanced-search-operators)
4. [Logical Operators](#logical-operators)
5. [File Type Searches](#file-type-searches)
6. [Security & Vulnerability Assessment](#security--vulnerability-assessment)
7. [OSINT & Information Gathering](#osint--information-gathering)
8. [Common Use Cases](#common-use-cases)
9. [Combining Operators](#combining-operators)
10. [Protection & Defense](#protection--defense)
11. [Legal & Ethical Considerations](#legal--ethical-considerations)

---

## Introduction

**Google Dorking** (also known as Google Hacking) is an advanced search technique that uses specialized operators to refine Google searches and uncover specific information that may not be readily available through standard search queries.

### What is Google Dorking?
- A search query technique using advanced search operators
- Leverages Google's indexing capabilities to find specific information
- Created by security researcher Johnny Long in 2002
- Used for OSINT, penetration testing, and vulnerability assessment

### Key Resources
- **Google Hacking Database (GHDB)**: https://www.exploit-db.com/google-hacking-database
- Repository of 6000+ categorized dorks for various purposes

---

## Basic Search Operators

### `site:`
**Function**: Restricts search results to a specific website or domain

**Syntax**: `site:example.com`

**Examples**:
```
site:github.com python
site:.gov "budget"
site:*.example.com
site:.edu login
```

**Use Cases**:
- Search within a specific website
- Find all subdomains of a site
- Target specific TLDs (.com, .gov, .edu, .mil)

---

### `inurl:`
**Function**: Searches for URLs containing specific keywords

**Syntax**: `inurl:keyword`

**Examples**:
```
inurl:admin
inurl:login
inurl:config
inurl:/admin/login.php
```

**Use Cases**:
- Find admin panels
- Locate login pages
- Discover specific URL patterns

---

### `allinurl:`
**Function**: Searches for URLs containing ALL specified keywords

**Syntax**: `allinurl:keyword1 keyword2`

**Examples**:
```
allinurl:admin login
allinurl:admin config php
```

---

### `intitle:`
**Function**: Searches for pages with specific keywords in the title

**Syntax**: `intitle:keyword`

**Examples**:
```
intitle:"index of"
intitle:admin
intitle:login
intitle:"dashboard"
```

**Use Cases**:
- Find pages with specific purposes
- Locate directory listings
- Discover admin interfaces

---

### `allintitle:`
**Function**: Searches for pages containing ALL specified keywords in the title

**Syntax**: `allintitle:keyword1 keyword2`

**Examples**:
```
allintitle:admin panel login
allintitle:index of passwords
```

---

### `intext:`
**Function**: Searches for specific text within page content

**Syntax**: `intext:keyword`

**Examples**:
```
intext:"password"
intext:"confidential"
intext:"internal use only"
```

**Use Cases**:
- Find sensitive information in page content
- Locate specific phrases or keywords
- Discover leaked documents

---

### `allintext:`
**Function**: Searches for ALL specified keywords in page content

**Syntax**: `allintext:keyword1 keyword2 keyword3`

**Examples**:
```
allintext:username password email
allintext:admin password database
```

---

### `filetype:` or `ext:`
**Function**: Searches for specific file types

**Syntax**: `filetype:extension` or `ext:extension`

**Examples**:
```
filetype:pdf
filetype:xlsx
filetype:sql
ext:log
ext:env
```

**Supported File Types**:
- **Documents**: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, odt
- **Configuration**: xml, json, yml, yaml, ini, conf, config, env
- **Databases**: sql, db, sqlite, mdb
- **Backup**: bak, old, backup, tar, zip, gz, rar
- **Code**: php, asp, aspx, jsp, js, py, java, c, cpp
- **Logs**: log, txt

---

### `cache:`
**Function**: Shows Google's cached version of a webpage

**Syntax**: `cache:example.com`

**Examples**:
```
cache:example.com
cache:website.com/page.html
```

**Note**: Google deprecated the cache: operator in September 2024. It may not work consistently.

**Use Cases**:
- View pages that are currently down
- See older versions of pages
- Bypass current restrictions

---

### `link:`
**Function**: Finds pages linking to a specific URL (deprecated)

**Syntax**: `link:example.com`

**Note**: This operator has been deprecated by Google but may still work in limited cases.

---

### `related:`
**Function**: Finds websites similar to the specified domain

**Syntax**: `related:example.com`

**Examples**:
```
related:github.com
related:stackoverflow.com
```

---

### `info:`
**Function**: Shows information Google has about a specific page

**Syntax**: `info:example.com`

**Examples**:
```
info:google.com
info:wikipedia.org
```

---

### `define:`
**Function**: Provides definitions of a word or phrase

**Syntax**: `define:term`

**Examples**:
```
define:dorking
define:phishing
```

---

## Advanced Search Operators

### Date-Based Operators

#### `before:` and `after:`
**Function**: Filter results by publication date

**Syntax**: 
- `before:YYYY-MM-DD`
- `after:YYYY-MM-DD`

**Examples**:
```
site:news.com cybersecurity after:2024-01-01
vulnerability report before:2023-12-31
site:gov budget after:2023-01-01 before:2024-01-01
```

---

### Range Operator

#### `..` (number range)
**Function**: Search for numbers within a range

**Syntax**: `number1..number2`

**Examples**:
```
camera $100..$500
laptop price 500..1000
smartphone 2020..2024
```

---

### Wildcard Operator

#### `*` (asterisk)
**Function**: Acts as a wildcard for unknown or variable words

**Syntax**: `* in search query`

**Examples**:
```
"how to * a website"
"best * programming language"
set * password
```

**Use Cases**:
- Find variations of phrases
- Search for half-remembered content
- Discover related concepts

---

### Exact Match

#### `"quote marks"`
**Function**: Search for exact phrases

**Syntax**: `"exact phrase"`

**Examples**:
```
"password reset"
"confidential document"
"internal use only"
```

---

## Logical Operators

### `OR` (pipe symbol `|`)
**Function**: Returns results matching either term

**Syntax**: `keyword1 OR keyword2` or `keyword1 | keyword2`

**Examples**:
```
filetype:pdf OR filetype:doc
site:.gov OR site:.edu
admin | administrator
```

---

### `AND` (implicit)
**Function**: Returns results matching all terms (default behavior)

**Syntax**: `keyword1 AND keyword2` or `keyword1 keyword2`

**Examples**:
```
password AND username
site:example.com confidential
```

---

### `-` (minus/exclusion)
**Function**: Excludes results containing the specified term

**Syntax**: `-keyword`

**Examples**:
```
site:example.com -www
android -iphone
security -"for sale"
```

**Use Cases**:
- Remove unwanted results
- Exclude specific domains
- Filter out noise

---

### `( )` (parentheses)
**Function**: Groups operators and controls logic

**Syntax**: `(keyword1 OR keyword2)`

**Examples**:
```
site:gov (budget OR spending)
(inurl:admin OR inurl:login) site:example.com
```

---

## File Type Searches

### Documents
```
site:example.com filetype:pdf
site:company.com ext:xlsx "confidential"
site:.gov filetype:doc "budget"
site:*.edu filetype:ppt "presentation"
```

### Configuration Files
```
filetype:env "DB_PASSWORD"
filetype:config inurl:web.config
filetype:ini "password"
ext:yml "database"
ext:xml "connection string"
```

### Database Files
```
filetype:sql "INSERT INTO"
filetype:sql "password" site:example.com
ext:db
ext:sqlite
```

### Backup Files
```
filetype:bak
ext:old site:example.com
filetype:backup
inurl:backup.zip
```

### Log Files
```
filetype:log
ext:log "password"
ext:log "username"
filetype:log inurl:access.log
```

### Source Code
```
ext:php site:example.com
filetype:js "api_key"
ext:py "password"
filetype:java "connection string"
```

---

## Security & Vulnerability Assessment

### Finding Admin Panels
```
inurl:admin
inurl:/admin/
intitle:admin panel
inurl:administrator
inurl:admin/login.php
intitle:"Admin Login"
inurl:wp-admin (for WordPress)
inurl:cpanel
inurl:phpmyadmin
```

### Finding Login Pages
```
inurl:login
intitle:"login"
inurl:signin
inurl:auth
inurl:authentication
inurl:portal/login
intitle:"Dashboard Login"
```

### Directory Listings
```
intitle:"index of"
intitle:"index of" "parent directory"
intitle:"index of" "name" "size" "last modified"
intitle:"index of" passwd
intitle:"index of" "backup"
intitle:"index of" inurl:ftp
```

### Error Messages & Debug Info
```
"Fatal error"
"Warning: mysql_connect()"
"Parse error" "syntax error"
"An illegal character has been found"
"error occurred"
intext:"sql syntax near"
```

### Exposed Databases
```
filetype:sql "INSERT INTO" "users"
filetype:sql "password"
inurl:phpmyadmin intitle:"welcome to phpmyadmin"
"phpMyAdmin" "running on" inurl:"main.php"
```

### Configuration Files
```
filetype:env "DB_PASSWORD"
filetype:config inurl:web.config
ext:ini "password"
filetype:yml "password"
ext:conf "password"
inurl:config.php
```

### Backup Files
```
intitle:"index of" "backup"
filetype:bak inurl:backup
filetype:old
ext:backup site:example.com
inurl:backup.sql
```

### Vulnerable WordPress Sites
```
inurl:wp-content/plugins/
inurl:wp-includes/
site:wordpress.com inurl:wp-login.php
filetype:sql inurl:wp-content
inurl:/wp-admin/admin-ajax.php
```

### Exposed FTP Servers
```
intitle:"index of" inurl:ftp
"index of" inurl:ftp site:.gov
intitle:"FTP root at"
```

### Cameras & IoT Devices
```
inurl:/view/view.shtml
intitle:"webcamXP 5"
inurl:ViewerFrame?Mode=
intitle:"Live View / - AXIS"
intitle:"Network Camera"
```

### Sensitive Documents
```
filetype:pdf "confidential"
filetype:doc "not for public release"
ext:xlsx "confidential" OR "sensitive"
filetype:ppt "internal use only"
```

### Email Lists
```
filetype:txt inurl:email.txt
filetype:xls inurl:email
filetype:csv email
```

### Credentials & Passwords
```
filetype:log username password
ext:pwd
filetype:txt "password"
ext:sql "password hash"
inurl:password.txt
```

---

## OSINT & Information Gathering

### Social Media Profiles
```
site:linkedin.com "John Smith" "Company Name"
site:twitter.com "username"
site:facebook.com "email@example.com"
site:instagram.com "location"
```

### Email Finding
```
site:example.com intext:@example.com
site:linkedin.com "@company.com"
site:github.com "email" "@gmail.com"
```

### Company Information
```
site:company.com filetype:pdf "annual report"
site:company.com "org chart" OR "organizational chart"
site:company.com "employee directory"
site:.com "About Us" inurl:company-name
```

### Government Documents
```
site:.gov filetype:pdf budget
site:.gov filetype:xlsx financial
site:.mil "phone number"
site:.gov intext:"confidential"
```

### Educational Resources
```
site:.edu filetype:pdf
site:.edu "login" "student"
site:.edu "research paper" filetype:pdf
```

### Technology Stack Identification
```
site:example.com "powered by WordPress"
site:example.com "powered by vBulletin"
site:example.com intext:"Apache/2.4"
site:example.com "built with React"
```

### Subdomains Discovery
```
site:*.example.com
site:*.example.com -www
```

### API Keys & Secrets
```
site:github.com "api_key"
site:github.com "password"
site:pastebin.com api_key
ext:env "API_KEY"
```

---

## Common Use Cases

### Finding Specific Documents
```
site:company.com filetype:pdf "quarterly report"
site:.gov filetype:xlsx budget 2024
site:.edu filetype:ppt "machine learning"
```

### Research & Competitive Analysis
```
site:competitor.com inurl:blog "new product"
site:competitor.com filetype:pdf "whitepaper"
related:competitor.com
```

### Bug Bounty & Penetration Testing
```
site:target.com inurl:admin
site:target.com filetype:sql
site:target.com ext:log
site:target.com intitle:"index of" "config"
```

### Recruiting & HR
```
site:linkedin.com "software engineer" "San Francisco"
site:github.com "Python developer"
site:stackoverflow.com "location:New York"
```

### Content Theft Detection
```
"exact content from your site" -site:yoursite.com
intext:"your unique phrase" -site:yoursite.com
```

### Finding Free Resources
```
intitle:"index of" "mp3" artist-name
intitle:"index of" "pdf" book-name
intitle:"index of" "ebook" format
```

### Price Comparison
```
product name price $100..$500
smartphone 2024 price 500..1000
```

---

## Combining Operators

### Multiple Operators (Advanced Queries)

#### Finding Sensitive PDFs on Government Sites
```
site:.gov filetype:pdf "confidential" OR "sensitive"
```

#### Exposed Database Backups
```
site:example.com (ext:sql OR ext:db OR ext:bak) inurl:backup
```

#### Login Pages on Educational Sites
```
site:.edu (inurl:login OR inurl:signin OR inurl:admin)
```

#### Configuration Files with Passwords
```
(filetype:env OR filetype:config OR filetype:ini) "password" site:example.com
```

#### WordPress Vulnerabilities
```
site:example.com inurl:wp-content filetype:sql
site:example.com (inurl:wp-admin OR inurl:wp-login) -inurl:css -inurl:js
```

#### Exposed Log Files
```
site:example.com (ext:log OR ext:txt) (intext:"error" OR intext:"warning")
```

#### Finding Competitors' Documents
```
site:competitor.com (filetype:pdf OR filetype:doc) (annual report OR financial)
```

#### Email Harvesting (Legal Research Only)
```
site:company.com intext:@company.com -site:linkedin.com
```

#### Server Information Disclosure
```
intitle:"Apache Status" "Apache Server Status for"
intitle:"index of" "server-status"
```

#### Exposed API Documentation
```
site:example.com (inurl:api OR inurl:swagger OR inurl:docs) (json OR xml)
```

---

## Protection & Defense

### Securing Your Website from Dorking

#### 1. **robots.txt Configuration**
```txt
User-agent: *
Disallow: /admin/
Disallow: /config/
Disallow: /backup/
Disallow: /logs/
Disallow: /*.sql$
Disallow: /*.bak$
Disallow: /*.env$
```

**Note**: robots.txt is a request, not a security measure. Sensitive files should not be publicly accessible.

---

#### 2. **Proper File Permissions**
- Restrict access to sensitive directories
- Use .htaccess or web server configuration
- Implement authentication for admin panels

---

#### 3. **Remove Sensitive Files**
- Delete backup files from public directories
- Don't store sensitive files on web servers
- Use Google Search Console to request removal

---

#### 4. **Monitor Your Exposure**

Run defensive dorks regularly:
```
site:yoursite.com filetype:sql
site:yoursite.com filetype:env
site:yoursite.com filetype:log
site:yoursite.com intitle:"index of"
site:yoursite.com inurl:backup
site:yoursite.com "password"
```

---

#### 5. **Security Headers**
Implement proper security headers:
- `X-Robots-Tag: noindex, nofollow`
- `X-Content-Type-Options: nosniff`

---

#### 6. **Regular Audits**
- Conduct weekly vulnerability scans
- Use tools like Google Search Console
- Monitor for exposed sensitive information

---

#### 7. **Encryption**
- Encrypt sensitive data
- Use HTTPS everywhere
- Never store passwords in plain text

---

#### 8. **Access Controls**
- Implement strong authentication
- Use IP whitelisting for admin panels
- Enable 2FA/MFA

---

## Legal & Ethical Considerations

### ⚠️ Important Warnings

#### Legal Boundaries
1. **Viewing search results**: Generally legal
2. **Accessing data without authorization**: Illegal
3. **Downloading or manipulating data**: May be illegal

#### Ethical Use
- **Use only on authorized targets**
- **Get written permission for penetration testing**
- **Respect privacy and data protection laws**
- **Never use for malicious purposes**

---

### Legal Use Cases ✅
- Security research on your own systems
- Bug bounty programs with authorization
- OSINT for legitimate research
- Competitive analysis of public information
- Educational purposes

---

### Illegal Use Cases ❌
- Accessing systems without permission
- Stealing sensitive data
- Identity theft
- Cyber stalking
- Corporate espionage
- Any unauthorized access

---

### Best Practices

1. **Always get authorization** before testing any system you don't own
2. **Document your activities** for legal protection
3. **Use responsibly** - just because something is indexed doesn't mean it's meant to be accessed
4. **Report vulnerabilities** through proper channels
5. **Respect robots.txt** and terms of service
6. **Use VPN/Tor** for sensitive research (with caution)
7. **Stay updated** on local laws and regulations

---

### Reporting Vulnerabilities

If you find exposed sensitive data:

1. **Don't download or access the data**
2. **Document the finding** (screenshot search results only)
3. **Contact the website owner** through:
   - Security contact (security@example.com)
   - Responsible disclosure programs
   - CERT/CSIRT
4. **Give them time to respond** (typically 90 days)
5. **Don't publicly disclose** until resolved

---

## Quick Reference Card

### Most Useful Operators
```
site:          Specific domain/site
filetype:      Specific file type
inurl:         URL contains keyword
intitle:       Title contains keyword
intext:        Body contains keyword
cache:         Cached version (deprecated)
-              Exclude term
OR |           Either term
" "            Exact phrase
*              Wildcard
( )            Grouping
..             Number range
before:        Before date
after:         After date
```

### Common Combinations
```
site:example.com filetype:pdf
inurl:admin site:example.com
intitle:"index of" site:example.com
site:*.example.com -www
(pdf OR doc) site:example.com
site:example.com -filetype:html
```

---

## Additional Resources

### Databases & Tools
- **Google Hacking Database (GHDB)**: https://www.exploit-db.com/google-hacking-database
- **DorkFinder**: https://dorkfinder.com
- **OSINT Framework**: https://osintframework.com
- **SearchDiggity**: Tool for automating Google Dorks

### Learning Resources
- Google Advanced Search Guide
- HackTricks: Google Dorks
- Bug Bounty platforms (HackerOne, Bugcrowd)
- Security blogs and forums

---

## Changelog & Notes

### Deprecated Operators (No Longer Work)
- `cache:` - Deprecated September 2024
- `link:` - Deprecated
- `info:` - Limited functionality
- `~` (tilde for synonyms) - Deprecated

### Search Engine Variations
Different search engines support different operators:
- **Google**: Most comprehensive
- **Bing**: Similar but different results (use `ext:` instead of `filetype:`)
- **DuckDuckGo**: Limited operator support
- **Yandex**: Different operator set

---

## Pro Tips

1. **Start broad, then narrow**: Begin with general queries and add operators progressively
2. **Iterate and refine**: Analyze results and adjust your query
3. **Use quotation marks** for exact phrases
4. **Combine operators** for more specific results
5. **Check multiple search engines** - they index differently
6. **Use cached versions** when sites are down (if available)
7. **Monitor your own site** regularly for exposed data
8. **Stay updated** - Google changes operator behavior
9. **Test in incognito mode** to avoid personalized results
10. **Document your queries** for future reference

---


## Examples in Action

### Example 1: Finding Exposed Configuration Files
```
site:example.com (ext:env OR ext:config OR ext:ini) "password"
```

### Example 2: Discovering Subdomains
```
site:*.example.com -www
```

### Example 3: Locating Sensitive Documents
```
site:company.com filetype:pdf (confidential OR internal OR "not for distribution")
```

### Example 4: Finding Login Portals
```
site:example.com (inurl:admin OR inurl:login OR inurl:signin OR inurl:portal)
```

### Example 5: Identifying Technology Stack
```
site:example.com ("powered by" OR "built with" OR "running on")
```
