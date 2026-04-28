# HERO Wallet VDS S — Server Hardening SOP

**Document Version:** 1.0.0
**Last Updated:** April 28, 2026
**Classification:** OPERATIONAL — Execute on VDS provisioning
**Server Label:** HERO Wallet VDS S

---

## Pre-Hardening Checklist

Before executing this SOP, confirm:
- [ ] Contabo VDS S provisioned and accessible via SSH
- [ ] Root password received via email
- [ ] IP address noted in environmental architecture
- [ ] DNS for wallet.herobase.io NOT yet pointed (point AFTER hardening)

---

## Phase 1 — Initial Access & User Setup

```bash
# 1. SSH in as root (first and last time)
ssh root@<VDS_IP>

# 2. Update system immediately
apt update && apt upgrade -y && apt autoremove -y

# 3. Create non-root admin user
adduser herowallet
usermod -aG sudo herowallet

# 4. Set up SSH key authentication for new user
mkdir -p /home/herowallet/.ssh
chmod 700 /home/herowallet/.ssh
# Copy your public key:
echo "ssh-ed25519 <YOUR_PUBLIC_KEY>" > /home/herowallet/.ssh/authorized_keys
chmod 600 /home/herowallet/.ssh/authorized_keys
chown -R herowallet:herowallet /home/herowallet/.ssh
```

---

## Phase 2 — SSH Hardening

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Apply these settings:
Port 2222                          # Non-standard port
PermitRootLogin no                 # No root SSH
PasswordAuthentication no          # Key-only
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers herowallet
Protocol 2

# Restart SSH
systemctl restart sshd
```

**IMPORTANT:** Test new SSH connection in a SEPARATE terminal before closing current session.

---

## Phase 3 — Firewall (UFW)

```bash
# Install and configure UFW
apt install ufw -y

# Default deny all incoming
ufw default deny incoming
ufw default allow outgoing

# Allow only required ports
ufw allow 2222/tcp comment 'SSH non-standard'
ufw allow 443/tcp comment 'HTTPS wallet API'
ufw allow 80/tcp comment 'HTTP redirect to HTTPS'

# Enable firewall
ufw enable
ufw status verbose
```

---

## Phase 4 — Fail2Ban

```bash
# Install fail2ban
apt install fail2ban -y

# Create custom jail config
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600
EOF

systemctl enable fail2ban
systemctl restart fail2ban
```

---

## Phase 5 — Automatic Security Updates

```bash
# Install unattended-upgrades
apt install unattended-upgrades -y

# Configure automatic security patches
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

# Enable security-only updates
dpkg-reconfigure -plow unattended-upgrades
```

---

## Phase 6 — Node.js & Application Setup

```bash
# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create application directory
mkdir -p /opt/hero-wallet
chown herowallet:herowallet /opt/hero-wallet

# Clone the repo (as herowallet user)
su - herowallet
cd /opt/hero-wallet
git clone https://github.com/jratdish1/hero-wallet.git .
npm install

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Phase 7 — Nginx Reverse Proxy + SSL

```bash
# Install Nginx
apt install nginx -y

# Install Certbot for Let's Encrypt
apt install certbot python3-certbot-nginx -y

# Configure Nginx
cat > /etc/nginx/sites-available/hero-wallet << 'EOF'
server {
    listen 80;
    server_name wallet.herobase.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wallet.herobase.io;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/hero-wallet /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Get SSL cert (after DNS is pointed)
certbot --nginx -d wallet.herobase.io --non-interactive --agree-tos -m admin@herobase.io
```

---

## Phase 8 — Guardian Agent Deployment

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Create guardian agent directory
mkdir -p /opt/hero-guardian
chown herowallet:herowallet /opt/hero-guardian

# Deploy guardian agent (as herowallet)
su - herowallet
cd /opt/hero-guardian

# Create guardian config
cat > guardian-config.json << 'EOF'
{
  "name": "HERO Guardian Agent",
  "mode": "autonomous",
  "schedule": "continuous",
  "checks": [
    "dependency_audit",
    "contract_monitoring",
    "log_analysis",
    "port_scan",
    "ssl_validity",
    "disk_space",
    "memory_usage",
    "process_health"
  ],
  "alerts": {
    "telegram_bot_token": "${TELEGRAM_BOT_TOKEN}",
    "telegram_chat_id": "${TELEGRAM_CHAT_ID}",
    "escalation_threshold": "HIGH"
  },
  "audit_interval_minutes": 30,
  "max_budget_per_run": 0.50
}
EOF

# Start guardian with PM2
pm2 start guardian.js --name hero-guardian
pm2 save
```

---

## Phase 9 — Monitoring & Alerting

```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# Set up log rotation
cat > /etc/logrotate.d/hero-wallet << 'EOF'
/opt/hero-wallet/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 herowallet herowallet
}
EOF

# Cron job for health checks (every 5 min)
crontab -l | { cat; echo "*/5 * * * * /opt/hero-wallet/scripts/health-check.sh >> /var/log/hero-health.log 2>&1"; } | crontab -
```

---

## Phase 10 — Final Security Audit

After all phases complete, run:

```bash
# Port scan (should only show 2222, 80, 443)
ss -tlnp

# Check for open backdoors
netstat -tlnp | grep -v "2222\|80\|443\|127.0.0.1"

# Verify no root login
grep "PermitRootLogin" /etc/ssh/sshd_config

# Check fail2ban status
fail2ban-client status

# Verify firewall
ufw status numbered

# Check for world-writable files
find / -xdev -type f -perm -0002 -ls 2>/dev/null

# Verify no unnecessary services
systemctl list-units --type=service --state=running
```

---

## Post-Hardening Checklist

- [ ] SSH key-only access confirmed (password disabled)
- [ ] Root login disabled
- [ ] UFW active (only ports 2222, 80, 443)
- [ ] Fail2ban running with custom jails
- [ ] Automatic security updates enabled
- [ ] Nginx reverse proxy with SSL
- [ ] PM2 managing wallet and guardian processes
- [ ] Health check cron running every 5 minutes
- [ ] Telegram alerts configured and tested
- [ ] Port scan clean (no unexpected listeners)
- [ ] Server labeled "HERO Wallet VDS S" in Contabo panel

---

## Emergency Procedures

### Circuit Breaker Triggered
1. Guardian Agent pauses all wallet operations
2. Telegram alert sent immediately
3. Investigate via SSH (port 2222)
4. Review `/opt/hero-wallet/logs/watchdog.log`
5. Clear circuit breaker only after root cause identified

### Suspected Compromise
1. Immediately revoke all API keys
2. Block all inbound traffic except your IP: `ufw allow from <YOUR_IP>`
3. Capture forensic snapshot: `tar -czf /tmp/forensic-$(date +%s).tar.gz /var/log /opt/hero-wallet/logs`
4. Rebuild from last known-good GitHub tag
5. Rotate all credentials

---

*This SOP is a PERMANENT directive. Execute upon VDS provisioning.*
*Document maintained in: `hero-wallet/docs/SOP_SERVER_HARDENING.md`*
