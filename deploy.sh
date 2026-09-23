#!/usr/bin/env bash
# ==============================================================================
# Affitti Milano - Automated Deployment Script for Hostinger VPS
# ==============================================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}  🚀 Affitti Milano - Hostinger VPS Deploy Script  ${NC}"
echo -e "${BLUE}====================================================${NC}"

START_TIME=$(date +%s)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 1. Check for .env file
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  File .env non trovato. Copio .env.example in .env...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${YELLOW}👉 Modifica il file .env con la tua GEMINI_API_KEY prima di avviare in produzione!${NC}"
  else
    touch .env
  fi
fi

# 2. Check deployment mode: Docker vs PM2
DEPLOY_MODE="pm2"
if command -v docker &> /dev/null && [ -f docker-compose.yml ] && docker compose ps &> /dev/null; then
  DEPLOY_MODE="docker"
fi

if [ "$1" == "--docker" ]; then
  DEPLOY_MODE="docker"
elif [ "$1" == "--pm2" ]; then
  DEPLOY_MODE="pm2"
fi

echo -e "${BLUE}ℹ️  Modalità di deploy selezionata: ${GREEN}${DEPLOY_MODE^^}${NC}"

# 3. Pull latest changes if inside git repo
if [ -d .git ]; then
  echo -e "\n${BLUE}📥 Scaricamento ultimi aggiornamenti dal repository Git...${NC}"
  git fetch --all --prune
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  git pull origin "$CURRENT_BRANCH" || echo -e "${YELLOW}⚠️  Git pull saltato o già aggiornato.${NC}"
fi

# 4. Execute Build & Reload based on mode
if [ "$DEPLOY_MODE" == "docker" ]; then
  echo -e "\n${BLUE}🐳 Avvio build ed esecuzione container Docker...${NC}"
  docker compose build --pull
  docker compose up -d --remove-orphans
else
  echo -e "\n${BLUE}📦 Installazione dipendenze Node.js...${NC}"
  npm install

  echo -e "\n${BLUE}🔨 Compilazione Vite (Frontend) ed esbuild (Server Node.js)...${NC}"
  npm run build

  # Ensure logs directory exists
  mkdir -p logs

  # PM2 reload or start
  echo -e "\n${BLUE}🔄 Ricaricamento applicazione con PM2 (Zero Downtime)...${NC}"
  if command -v pm2 &> /dev/null; then
    if pm2 describe affitti-milano > /dev/null 2>&1; then
      pm2 reload ecosystem.config.cjs --env production
    else
      pm2 start ecosystem.config.cjs --env production
      pm2 save
    fi
  else
    echo -e "${YELLOW}⚠️  PM2 non è installato globalmente. Avvio alternativo con npm run start...${NC}"
    echo -e "${YELLOW}👉 Per installare PM2: sudo npm install -g pm2${NC}"
    npm run start &
  fi
fi

# 5. Health Check Verification
echo -e "\n${BLUE}🩺 Verifica stato applicazione (/api/health)...${NC}"
MAX_RETRIES=10
RETRY_COUNT=0
HEALTHY=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  sleep 2
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
  if [ "$STATUS_CODE" -eq 200 ]; then
    HEALTHY=1
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo -e "${YELLOW}In attesa del server... (tentativo $RETRY_COUNT/$MAX_RETRIES)${NC}"
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $HEALTHY -eq 1 ]; then
  echo -e "\n${GREEN}====================================================${NC}"
  echo -e "${GREEN}  ✅ DEPLOY COMPLETATO CON SUCCESSO IN ${DURATION}s!  ${NC}"
  echo -e "${GREEN}  🌐 Server attivo su: http://localhost:3000          ${NC}"
  echo -e "${GREEN}  📊 Health endpoint:  http://localhost:3000/api/health${NC}"
  echo -e "${GREEN}====================================================${NC}"
  
  if [ "$DEPLOY_MODE" == "pm2" ] && command -v pm2 &> /dev/null; then
    pm2 status affitti-milano
  elif [ "$DEPLOY_MODE" == "docker" ]; then
    docker compose ps
  fi
else
  echo -e "\n${RED}====================================================${NC}"
  echo -e "${RED}  ❌ ATTENZIONE: Health check fallito (HTTP $STATUS_CODE) ${NC}"
  echo -e "${RED}  Controlla i log con: pm2 logs affitti-milano         ${NC}"
  echo -e "${RED}  oppure:              docker compose logs -f          ${NC}"
  echo -e "${RED}====================================================${NC}"
  exit 1
fi
