#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Smart Drain System — Droplet Bootstrap Script
#  Run this ONCE on your DigitalOcean droplet after creation:
#
#    ssh -i ~/.ssh/smart-drain-key root@167.71.199.20
#    curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/smart-drain/main/scripts/setup-droplet.sh | bash
#
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "🔧 Starting Smart Drain droplet setup..."

# ── 1. Update system ──────────────────────────────────────────────────────────
apt-get update -qq
apt-get upgrade -y -qq

# ── 2. Install Docker ─────────────────────────────────────────────────────────
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# ── 3. Install Docker Compose plugin ──────────────────────────────────────────
apt-get install -y docker-compose-plugin

# Verify
docker --version
docker compose version

# ── 4. Create app directory ───────────────────────────────────────────────────
mkdir -p /opt/smart-drain
cd /opt/smart-drain

# ── 5. Configure UFW firewall ─────────────────────────────────────────────────
echo "🔒 Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 80/tcp    # HTTP (web frontend)
ufw allow 443/tcp   # HTTPS (future SSL)
ufw deny 8080/tcp   # Block direct API gateway access from internet
ufw deny 8081/tcp   # Block telemetry service from internet
ufw deny 8082/tcp   # Block alert service from internet
ufw status

# ── 6. Set up automatic security updates ─────────────────────────────────────
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# ── 7. Configure Docker log rotation (avoid disk fill) ───────────────────────
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

echo ""
echo "✅ Droplet setup complete!"
echo "───────────────────────────────────────────────"
echo "  Droplet IP   : 167.71.199.20"
echo "  App dir      : /opt/smart-drain"
echo "  Docker        : $(docker --version)"
echo "───────────────────────────────────────────────"
echo "  Next: Add GitHub Secrets and push to main!"
echo ""
