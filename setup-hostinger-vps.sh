#!/usr/bin/env bash
# ==============================================================================
# Affitti Milano - Hostinger VPS Setup Script (Ubuntu 22.04 / 24.04 LTS)
# Run as root or with sudo:
#   sudo bash setup-hostinger-vps.sh
# ==============================================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  ⚡ Configurazione Iniziale VPS Hostinger - Affitti Milano  ${NC}"
echo -e "${BLUE}================================================================${NC}"

# 1. Aggiornamento pacchetti di sistema
echo -e "\n${BLUE}🔄 1. Aggiornamento repository Ubuntu...${NC}"
apt update && apt upgrade -y

# 2. Installazione tool essenziali (curl, wget, git, ufw, htop)
echo -e "\n${BLUE}📦 2. Installazione tool di base...${NC}"
apt install -y curl wget git ufw htop build-essential ca-certificates gnupg lsb-release

# 3. Installazione Node.js 22 LTS da NodeSource
echo -e "\n${BLUE}🟢 3. Installazione Node.js 22 LTS...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v) != v22* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi
echo -e "${GREEN}Node.js installato: $(node -v) | NPM: $(npm -v)${NC}"

# 4. Installazione globale di PM2
echo -e "\n${BLUE}🚀 4. Installazione di PM2 per la gestione processi...${NC}"
npm install -g pm2
pm2 startup systemd -u root --hp /root || true

# 5. Installazione Nginx e Certbot
echo -e "\n${BLUE}🌐 5. Installazione Nginx e Certbot (Let's Encrypt)...${NC}"
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx

# 6. Configurazione Firewall UFW
echo -e "\n${BLUE}🛡️ 6. Configurazione Firewall UFW (SSH, HTTP, HTTPS)...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
# Non apriamo la porta 3000 pubblicamente per sicurezza (passerà tramite Nginx)
ufw --force enable

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}  ✅ Setup VPS Hostinger completato con successo!                ${NC}"
echo -e "${GREEN}  - Node.js:  $(node -v)                                        ${NC}"
echo -e "${GREEN}  - PM2:      $(pm2 -v)                                         ${NC}"
echo -e "${GREEN}  - Nginx:    Attivo e avviato                                  ${NC}"
echo -e "${GREEN}  - Firewall: Abilitato per SSH, HTTP (80) e HTTPS (443)        ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "\n${BLUE}Prossimi passi:${NC}"
echo "1. Clona l'applicazione in /var/www/affitti-milano"
echo "2. Configura il file .env con la tua GEMINI_API_KEY"
echo "3. Copia nginx/affitti-milano.conf in /etc/nginx/sites-available/"
echo "4. Esegui ./deploy.sh"
echo "5. Ottieni il certificato SSL gratuito: certbot --nginx -d tuo-dominio.it"
