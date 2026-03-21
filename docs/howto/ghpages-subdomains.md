---
title: Set Up a Custom Subdomain for GitHub Pages Using Cloudflare
description: Set Up a Custom Subdomain for GitHub Pages Using Cloudflare
icon: simple/github
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---


When deploying a documentation site or any static site to GitHub Pages, you may want it to live on a clean custom subdomain like `docs.yourdomain.com` instead of the default `username.github.io`. This guide walks you through doing exactly that — using Cloudflare as your DNS provider and GitHub Actions as your deployment source.

---

## Prerequisites

- A GitHub repository with GitHub Pages enabled and deployed via **GitHub Actions**
- A domain registered and managed on **Cloudflare**
- Admin access to your GitHub repository settings

---

## Step 1 — Configure the Custom Domain on GitHub

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (under the *Code and automation* section)
3. Under **Custom domain**, enter your desired subdomain:
   ```
   docs.yourdomain.com
   ```
4. Click **Save**

![image](https://gist.github.com/user-attachments/assets/5ff2e927-6528-4d04-959f-317c4c38e35d)

!!! note

    Since you are publishing via GitHub Actions (not a branch), GitHub will **not** create a `CNAME` file in your repository — and none is required. You can safely ignore any mention of a CNAME file in the GitHub docs.

---

## Step 2 — Add a CNAME Record in Cloudflare

1. Log in to your **Cloudflare dashboard** and select your domain
2. Navigate to **DNS** → **Records** → **Add record**
3. Fill in the following:

    | Field | Value |
    |-------|-------|
    | **Type** | `CNAME` |
    | **Name** | `docs` |
    | **Content** | `your-username.github.io` |
    | **Proxy status** | DNS only *(grey cloud)* |
    | **TTL** | Auto |

4. Click **Save**

![image](https://gist.github.com/user-attachments/assets/fa80b6c9-fa87-4f98-9efc-ec9bf45c9cfe)

!!! danger "Important"

    Make sure the proxy status is set to **"DNS only" (grey cloud 🌫️)** and NOT **"Proxied" (orange cloud 🟠)**. The orange cloud routes traffic through Cloudflare's proxy, which interferes with GitHub Pages' automatic SSL certificate provisioning and will cause an `InvalidDNSError`.

---

## Step 3 — Verify DNS Propagation

DNS changes don't take effect instantly. Before GitHub can validate your domain, the records need to propagate. You can check this in two ways:

### **Via terminal:**

```bash
dig docs.yourdomain.com +noall +answer
```

The output should resolve through to `your-username.github.io`. If it does, DNS is propagated on your end.

!!! example ""

    ```bash
    ➜  ~ dig docs.ostehomelab.site +noall +answer
    docs.ostehomelab.site.  300     IN      CNAME   your-username.github.io.
    your-username.github.io.  3600    IN      A       185.199.110.153
    your-username.github.io.  3600    IN      A       185.199.111.153
    your-username.github.io.  3600    IN      A       185.199.108.153
    your-username.github.io.  3600    IN      A       185.199.109.153
    ```


### **Via browser:**

Visit [dnschecker.org](https://dnschecker.org), enter `docs.yourdomain.com`, and confirm it is resolving globally across different regions.

![image](https://gist.github.com/user-attachments/assets/d583a9c1-3bc8-473e-b8b5-7df8c375173c)

!!! info

    As confirmed on DNSChecker.org, docs.ostehomelab.site has successfully propagated across all global regions — including the US, Canada, Russia, South Africa, and Asia. All DNS servers are resolving the domain to the same four IP addresses (185.199.108–111.153), which are the official GitHub Pages servers as documented in the [GitHub Pages DNS configuration guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain). This confirms that the custom subdomain is correctly wired up and accessible worldwide. 🌍

---

## Step 4 — Confirm on GitHub and Enable HTTPS

Once DNS has propagated:

1. Go back to **Settings** → **Pages** in your repository
2. Click **"Check again"** next to the DNS check status
3. Wait for the green **"DNS check successful"** confirmation
4. Once confirmed, tick **"Enforce HTTPS"** to enable SSL

![image](https://gist.github.com/user-attachments/assets/a9ccfc51-32c5-4d69-88cd-9436e02ca713)


!!! note

    DNS propagation can take anywhere from a few minutes to 24 hours depending on your DNS provider and region. If you see `InvalidDNSError`, simply wait 10–15 minutes and click "Check again".

---

## How It Works

Here's a quick overview of the full request flow once everything is configured:

```
User visits docs.yourdomain.com
        │
        ▼
Cloudflare DNS resolves CNAME
        │
        ▼
Resolves to your-username.github.io
        │
        ▼
GitHub Pages serves your site
        │
        ▼
HTTPS certificate issued by GitHub (via Let's Encrypt)
```

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|--------|--------------|-----|
| `InvalidDNSError` on GitHub | DNS hasn't propagated yet | Wait and click "Check again" |
| SSL certificate not provisioning | Cloudflare proxy is enabled (orange cloud) | Switch to "DNS only" (grey cloud) |
| Site loads but shows wrong content | Old CNAME record still cached | Flush DNS cache or wait for TTL to expire |
| `docs.yourdomain.com` not resolving | CNAME record not saved correctly | Double-check the record name and content in Cloudflare |

---

That's it! Your GitHub Pages site will now be accessible at your custom subdomain with a valid HTTPS certificate managed automatically by GitHub.