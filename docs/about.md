---
title: About
hide:
  - toc
  - feedback
---

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

.ab-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
.ab-wrap {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #e8e8e8;
  max-width: 980px;
  margin: 0 auto;
  padding: 0rem 0 4rem;
}
.ab-wrap a { color: #ff2222 !important; text-decoration: none !important; }
.ab-wrap a:hover { color: #fff !important; }

/* ── IDENTITY CARD ── */
.ab-hero {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 2rem;
  align-items: center;
  padding: 2rem 2rem;
  border: 1px solid #1e0000;
  background: #070000;
  margin-bottom: 1.75rem;
  position: relative;
  overflow: hidden;
}
.ab-hero::before {
  content: '';
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(200,0,0,.018) 2px, rgba(200,0,0,.018) 4px);
  pointer-events: none;
}
.ab-hero::after {
  content: '';
  position: absolute; top: 0; right: 0;
  width: 50%; height: 100%;
  background: radial-gradient(ellipse at right, rgba(204,0,0,.04), transparent 70%);
  pointer-events: none;
}

.ab-avatar {
  position: relative; z-index: 1;
  width: 100px; height: 100px; border-radius: 50%;
  border: 2px solid #cc0000;
  box-shadow: 0 0 24px rgba(204,0,0,.4), 0 0 60px rgba(204,0,0,.07);
  background: #0b0000;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ab-avatar svg { width: 54px; height: 54px; }

.ab-identity { position: relative; z-index: 1; }
.ab-name { font-size: 1.45rem; font-weight: 700; color: #fff; margin-bottom: 3px; letter-spacing: .02em; }
.ab-title { font-size: 11px; color: #cc0000; letter-spacing: .1em; margin-bottom: 10px; }
.ab-location { font-size: 11px; color: #3a3a3a; margin-bottom: 12px; display: flex; align-items: center; gap: 5px; }
.ab-location svg { width: 11px; height: 11px; flex-shrink: 0; }

.ab-roles { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }
.ab-role { font-size: 10px; letter-spacing: .1em; border: 1px solid #1e1e1e; padding: 3px 10px; color: #555; }
.ab-role-hi { border-color: #7a0000; color: #ff4444; background: rgba(204,0,0,.07); }

.ab-social { display: flex; gap: 8px; flex-wrap: wrap; }
.ab-social a {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10px; letter-spacing: .08em;
  color: #3a3a3a !important; border: 1px solid #181818; padding: 4px 10px;
  transition: all .15s;
}
.ab-social a:hover { color: #ff2222 !important; border-color: #cc0000; }
.ab-social svg { width: 11px; height: 11px; }

/* ── SECTION CHROME ── */
.ab-section { margin-bottom: 1.75rem; }
.ab-sh { display: flex; align-items: center; gap: 12px; margin-bottom: 1.1rem; }
.ab-sp { font-size: 10px; color: #cc0000; letter-spacing: .12em; white-space: nowrap; }
.ab-st { font-size: 11px; font-weight: 700; letter-spacing: .25em; color: #e8e8e8; white-space: nowrap; }
.ab-sline { flex: 1; height: 1px; background: linear-gradient(to right, #1e0000, transparent); }

/* ── BIO ── */
.ab-bio {
  font-size: 13px; line-height: 1.9; color: #666;
  padding: 1.25rem 1.5rem;
  border-left: 2px solid #cc0000;
  background: #060606;
  margin-bottom: 1rem;
}
.ab-bio .hi  { color: #e8e8e8; font-weight: 500; }
.ab-bio .acc { color: #ff2222; }
.ab-bio .dim { color: #2e2e2e; }

/* ── RADAR CHART LAYOUT ── */
.ab-radar-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 0;
}
.ab-radar-box {
  background: #060606;
  border: 1px solid #160000;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border-color .2s;
}
.ab-radar-box:hover { border-color: #cc0000; }
.ab-radar-label {
  font-size: 10px; letter-spacing: .14em; color: #cc0000;
  text-transform: uppercase; margin-bottom: 1rem;
  align-self: flex-start;
  display: flex; align-items: center; gap: 8px;
}
.ab-radar-label svg { width: 12px; height: 12px; }
.ab-radar-box canvas { max-width: 100%; }

/* Skill bars (mobile fallback / alternate view) */
.ab-bars { width: 100%; }
.ab-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.ab-bar-name { font-size: 10px; color: #555; min-width: 130px; letter-spacing: .04em; }
.ab-bar-track { flex: 1; height: 3px; background: #0e0e0e; }
.ab-bar-fill { height: 100%; background: #cc0000; transition: width .6s ease; }
.ab-bar-val { font-size: 10px; color: #330000; min-width: 28px; text-align: right; }

/* ── TECH STACK ── */
.ab-stack { display: flex; flex-direction: column; gap: 10px; }
.ab-stack-card {
  background: #060606;
  border: 1px solid #160000;
  padding: 1rem 1.25rem;
  transition: border-color .2s;
}
.ab-stack-card:hover { border-color: #cc0000; }
.ab-stack-title {
  font-size: 10px; letter-spacing: .14em; color: #cc0000;
  text-transform: uppercase; margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.ab-stack-title svg { width: 12px; height: 12px; flex-shrink: 0; }
.ab-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.ab-tag {
  font-size: 10px; color: #555; letter-spacing: .05em;
  border: 1px solid #1a1a1a; padding: 3px 9px;
  transition: all .15s; cursor: default;
}
.ab-tag:hover { color: #ff2222; border-color: #550000; }

/* ── FOOTER QUOTE ── */
.ab-quote {
  margin-top: 2.5rem; padding: 1rem 1.5rem;
  border-left: 2px solid #1a0000;
  font-size: 12px; color: #2a2a2a;
  font-style: italic; line-height: 1.9;
}
.ab-quote span { color: #550000; }

/* ── RESPONSIVE ── */
@media (max-width: 720px) {
  .ab-hero { grid-template-columns: 1fr; text-align: center; }
  .ab-roles, .ab-social { justify-content: center; }
  .ab-location { justify-content: center; }
  .ab-radar-wrap { grid-template-columns: 1fr; }
}
</style>

<div class="ab-wrap">

  <!-- ░░ IDENTITY ░░ -->
  <div class="ab-hero">
    <div class="ab-avatar">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="27" r="17" stroke="#cc0000" stroke-width="1.4"/>
        <circle cx="25" cy="25" r="4" fill="#cc0000" opacity=".85"/>
        <circle cx="39" cy="25" r="4" fill="#cc0000" opacity=".85"/>
        <path d="M27 35 Q32 40 37 35" stroke="#cc0000" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M23 44 h18 v5 a3 3 0 0 1-3 3 h-12 a3 3 0 0 1-3-3 z" stroke="#cc0000" stroke-width="1.4" fill="none"/>
        <line x1="29" y1="44" x2="29" y2="52" stroke="#cc0000" stroke-width="1"/>
        <line x1="32" y1="44" x2="32" y2="52" stroke="#cc0000" stroke-width="1"/>
        <line x1="35" y1="44" x2="35" y2="52" stroke="#cc0000" stroke-width="1"/>
        <path d="M15 27 L8 27 L8 20" stroke="#cc0000" stroke-width=".8" opacity=".35" stroke-linecap="round"/>
        <circle cx="8" cy="20" r="1.5" fill="#cc0000" opacity=".35"/>
        <path d="M49 27 L56 27 L56 20" stroke="#cc0000" stroke-width=".8" opacity=".35" stroke-linecap="round"/>
        <circle cx="56" cy="20" r="1.5" fill="#cc0000" opacity=".35"/>
        <path d="M32 10 L32 4" stroke="#cc0000" stroke-width=".8" opacity=".3" stroke-linecap="round"/>
        <circle cx="32" cy="4" r="1.5" fill="#cc0000" opacity=".3"/>
      </svg>
    </div>
    <div class="ab-identity">
      <div class="ab-name">05t3</div>
      <div class="ab-title">// Cybersecurity Analyst · 5 yrs experience</div>
      <div class="ab-location">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Nairobi, Kenya
      </div>
      <div class="ab-roles">
        <span class="ab-role ab-role-hi">Offensive Sec</span>
        <span class="ab-role ab-role-hi">Defensive Sec</span>
        <span class="ab-role ab-role-hi">DFIR</span>
        <span class="ab-role ab-role-hi">Cloud Security</span>
        <span class="ab-role ab-role-hi">AI Security</span>
        <span class="ab-role ab-role-hi">API Security</span>
        <span class="ab-role ab-role-hi">CTF Player &amp; Author</span>
        <span class="ab-role ab-role-hi">Homelab Builder</span>
      </div>
      <div class="ab-social">
        <a href="https://05t3.github.io" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          Blog
        </a>
        <a href="https://www.linkedin.com/in/stephen-kageche/" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          LinkedIn
        </a>
        <a href="https://twitter.com/oste_ke" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
          @oste_ke
        </a>
      </div>
    </div>
  </div>

  <!-- ░░ BIO ░░ -->
  <div class="ab-section">
    <div class="ab-sh">
      <span class="ab-sp">// 01</span>
      <span class="ab-st">WHO AM I</span>
      <div class="ab-sline"></div>
    </div>
    <div class="ab-bio">
      <span class="hi">My name is 05t3</span> — a <span class="acc">Cybersecurity Analyst </span> with
      <span class="acc">5 years of experience</span> working across Offensive, Defensive and Forensics roles.
      <br><br>
      During my free time I enjoy playing games, cuddling with my cats 🐱, competing in CTFs, creating CTF challenges,
      hiking, reading and continuously upskilling. This is my <span class="acc">realm of knowledge</span> — where I share tips,
      tricks, cheat sheets and life learnings accumulated across engagements, labs and rabbit holes.
      <br><br>
      <span class="dim">// explore freely. break things responsibly. document everything.</span>
    </div>
  </div>

  <!-- ░░ SKILL RADAR CHARTS ░░ -->
  <div class="ab-section">
    <div class="ab-sh">
      <span class="ab-sp">// 02</span>
      <span class="ab-st">SKILL PROFICIENCY</span>
      <div class="ab-sline"></div>
    </div>
    <div class="ab-radar-wrap">

      <!-- Radar 1 — Security domains -->
      <div class="ab-radar-box">
        <div class="ab-radar-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Security Domains
        </div>
        <canvas id="radarSec" width="320" height="280"></canvas>
      </div>

      <!-- Radar 2 — Technical areas -->
      <div class="ab-radar-box">
        <div class="ab-radar-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          Technical Areas
        </div>
        <canvas id="radarTech" width="320" height="280"></canvas>
      </div>

    </div>
  </div>

  <!-- ░░ TECHNICAL STACK ░░ -->
  <div class="ab-section">
    <div class="ab-sh">
      <span class="ab-sp">// 03</span>
      <span class="ab-st">TECHNICAL STACK</span>
      <div class="ab-sline"></div>
    </div>
    <div class="ab-stack">

      <div class="ab-stack-card">
        <div class="ab-stack-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          Operating Systems
        </div>
        <div class="ab-tags">
          <span class="ab-tag">Windows</span>
          <span class="ab-tag">Linux</span>
          <span class="ab-tag">Red Hat</span>
          <span class="ab-tag">CentOS</span>
        </div>
      </div>

      <div class="ab-stack-card">
        <div class="ab-stack-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          Languages &amp; Scripting
        </div>
        <div class="ab-tags">
          <span class="ab-tag">Bash</span>
          <span class="ab-tag">PowerShell</span>
          <span class="ab-tag">Python</span>
          <span class="ab-tag">Go</span>
          <span class="ab-tag">JavaScript</span>
          <span class="ab-tag">TypeScript</span>
          <span class="ab-tag">Node.js</span>
          <span class="ab-tag">React</span>
        </div>
      </div>

      <div class="ab-stack-card">
        <div class="ab-stack-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          Virtualisation
        </div>
        <div class="ab-tags">
          <span class="ab-tag">Proxmox</span>
          <span class="ab-tag">VMware</span>
          <span class="ab-tag">VirtualBox</span>
          <span class="ab-tag">QEMU/KVM</span>
        </div>
      </div>

      <div class="ab-stack-card">
        <div class="ab-stack-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          Cloud Platforms
        </div>
        <div class="ab-tags">
          <span class="ab-tag">AWS</span>
          <span class="ab-tag">Azure</span>
          <span class="ab-tag">GCP</span>
          <span class="ab-tag">Linode</span>
          <span class="ab-tag">Hetzner</span>
          <span class="ab-tag">Contabo</span>
        </div>
      </div>

      <div class="ab-stack-card">
        <div class="ab-stack-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          DevOps &amp; Automation
        </div>
        <div class="ab-tags">
          <span class="ab-tag">Docker</span>
          <span class="ab-tag">Kubernetes</span>
          <span class="ab-tag">Ansible</span>
          <span class="ab-tag">Terraform</span>
          <span class="ab-tag">Pulumi</span>
          <span class="ab-tag">n8n</span>
          <span class="ab-tag">Zapier</span>
          <span class="ab-tag">Make</span>
          <span class="ab-tag">Kestra</span>
          <span class="ab-tag">Packer</span>
          <span class="ab-tag">Vagrant</span>
          <span class="ab-tag">Portainer</span>
          <span class="ab-tag">Traefik</span>
          <span class="ab-tag">Gitea</span>
          <span class="ab-tag">Forgejo</span>
          <span class="ab-tag">Semaphore</span>
          <span class="ab-tag">OpenClaw</span>
        </div>
      </div>

    </div>
  </div>

  <!-- ░░ FOOTER ░░ -->
  <div class="ab-quote">
    <span>//</span> "The quieter you become, the more you are able to hear." — Kali Linux<br>
    <span>//</span> Knowledge shared is knowledge multiplied.
  </div>

</div>

<!-- Chart.js from CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script>
(function () {

  /* ── Shared radar defaults ── */
  var RED        = 'rgba(204,0,0,0.75)';
  var RED_FILL   = 'rgba(204,0,0,0.12)';
  var RED_GRID   = 'rgba(204,0,0,0.1)';
  var RED_ANGLE  = 'rgba(100,0,0,0.4)';
  var LABEL_COL  = '#555';
  var POINT_COL  = '#cc0000';

  var defaults = {
    type: 'radar',
    options: {
      responsive: true,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: {
            display: false,
            stepSize: 20
          },
          grid:        { color: RED_GRID, circular: false },
          angleLines:  { color: RED_ANGLE },
          pointLabels: {
            color: LABEL_COL,
            font: { family: "'JetBrains Mono', monospace", size: 10 }
          }
        }
      }
    }
  };

  function makeDataset(values) {
    return [{
      data: values,
      borderColor: RED,
      borderWidth: 1.5,
      backgroundColor: RED_FILL,
      pointBackgroundColor: POINT_COL,
      pointBorderColor: 'transparent',
      pointRadius: 3,
      pointHoverRadius: 5
    }];
  }

  /* ── Radar 1 — Security Domains ──
     Labels & values to modify:
     Offensive Security     → 90   (change this number, 0–100)
     Defensive Security     → 90
     Digital Forensics      → 85
     Incident Response      → 80
     Malware Analysis       → 75
     Web Security           → 85
     Cloud Security         → 80
     AI Security            → 60
     API Security           → 72
     Security Research      → 83
  ── */
  var ctx1 = document.getElementById('radarSec');
  if (ctx1) {
    new Chart(ctx1, Object.assign({}, defaults, {
      data: {
        labels: [
          'Offensive Sec',
          'Defensive Sec',
          'DFIR',
          'Incident Response',
          'Malware Analysis',
          'Web Security',
          'Cloud Security',
          'AI Security',
          'API Security',
          'Security Research'
        ],
        datasets: makeDataset([90, 90, 85, 80, 75, 85, 80, 60, 72, 83])
      }
    }));
  }

  /* ── Radar 2 — Technical Areas ──
     Labels & values to modify:
     DevOps / Automation    → 70
     Cloud Platforms        → 75
     Scripting / Dev        → 85
     Virtualisation         → 90
     Networking             → 80
     SIEM / Detection       → 90
     Container Security     → 76
     Threat Intelligence    → 90
  ── */
  var ctx2 = document.getElementById('radarTech');
  if (ctx2) {
    new Chart(ctx2, Object.assign({}, defaults, {
      data: {
        labels: [
          'DevOps',
          'Cloud',
          'Scripting / Dev',
          'Virtualisation',
          'Networking',
          'SIEM / Detection',
          'Container Sec',
          'Threat Intel'
        ],
        datasets: makeDataset([70, 75, 85, 90, 80, 90, 76, 90])
      }
    }));
  }

})();
</script>