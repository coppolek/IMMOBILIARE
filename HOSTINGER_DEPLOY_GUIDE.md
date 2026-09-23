# 🚀 Guida Completa al Deploy su VPS Hostinger
## Piattaforma: Affitti Milano • Stanze, Monolocali & Appartamenti

Questa guida illustra la procedura passo-passo per pubblicare l'applicazione sul tuo **VPS Hostinger** (Ubuntu 22.04 o 24.04 LTS), garantendo:
- ✅ **Zero Downtime Reload** (aggiornamenti senza interruzioni per gli utenti)
- ✅ **SSL Gratuito (HTTPS)** tramite Let's Encrypt / Certbot con rinnovo automatico
- ✅ **Compressione Gzip + HTTP/2** per caricamenti ultra-veloci da mobile e desktop
- ✅ **Cache Immutabile 1 Anno** su file JS/CSS/immagini con hash Vite
- ✅ **Protezione e Isolamento** tramite reverse proxy Nginx e firewall UFW
- ✅ **Scelta tra PM2 (leggerissimo) o Docker Compose**

---

## 📋 Indice
1. [Requisiti e Accesso VPS Hostinger](#1-requisiti-e-accesso-vps-hostinger)
2. [Setup Automatico del Server (One-Click)](#2-setup-automatico-del-server)
3. [Caricamento / Clonazione del Codice](#3-caricamento-del-codice)
4. [Configurazione Ambiente (.env)](#4-configurazione-ambiente-env)
5. [Metodo A: Deploy con PM2 (Consigliato per VPS KVM 1 / KVM 2)](#5-metodo-a-deploy-con-pm2-consigliato)
6. [Metodo B: Deploy con Docker Compose](#6-metodo-b-deploy-con-docker-compose)
7. [Configurazione Dominio & Nginx Reverse Proxy](#7-configurazione-dominio--nginx-reverse-proxy)
8. [Certificato SSL Gratuito (HTTPS) con Certbot](#8-certificato-ssl-gratuito-https-con-certbot)
9. [Aggiornamenti Futuri in 1 Clic (`./deploy.sh`)](#9-aggiornamenti-futuri-in-1-clic)
10. [Comandi Utili di Manutenzione e Monitoraggio](#10-comandi-utili)

---

## 1. Requisiti e Accesso VPS Hostinger

1. Accedi al pannello di controllo **Hostinger hPanel**:
   - Vai nella sezione **VPS** -> Seleziona il tuo server.
   - Assicurati che il sistema operativo sia **Ubuntu 22.04 LTS** o **Ubuntu 24.04 LTS** (se non lo è, puoi reinstallarlo con 1 clic dalla scheda *OS & Modelli*).
2. Annota l'**Indirizzo IP Pubblico** del VPS e la **Password di root**.
3. Apri il terminale del tuo computer ed esegui la connessione SSH:
   ```bash
   ssh root@INDIRIZZO_IP_TUO_VPS
   ```

---

## 2. Setup Automatico del Server

Abbiamo predisposto uno script dedicato `setup-hostinger-vps.sh` che installa e configura automaticamente:
- Node.js 22 LTS (da repository ufficiale NodeSource)
- PM2 (Process Manager globale)
- Nginx Web Server
- Certbot per SSL HTTPS
- Git, curl, wget, build-essential
- Firewall UFW (porte 22 SSH, 80 HTTP, 443 HTTPS aperte; porta 3000 interna protetta)

### Esecuzione:
Se hai già caricato la cartella del progetto:
```bash
cd /var/www/affitti-milano
sudo bash setup-hostinger-vps.sh
```

Oppure in alternativa esegui i comandi manuali:
```bash
apt update && apt upgrade -y
apt install -y curl wget git ufw htop nginx certbot python3-certbot-nginx

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 3. Caricamento del Codice

Consigliamo di posizionare il progetto nella directory standard `/var/www/affitti-milano`:

```bash
mkdir -p /var/www/affitti-milano
cd /var/www/affitti-milano
```

### Opzione 1: Tramite Git (Consigliato)
```bash
git clone <URL_DEL_TUO_REPOSITORY_GITHUB> .
```

### Opzione 2: Tramite SFTP / SCP (FileZilla o Cyberduck)
Carica tutti i file del progetto (eccetto `node_modules` e `dist`) nella cartella `/var/www/affitti-milano`.

---

## 4. Configurazione Ambiente (.env)

Copia il template `.env.example` in `.env`:
```bash
cd /var/www/affitti-milano
cp .env.example .env
nano .env
```

Configura i seguenti valori:
```ini
NODE_ENV=production
PORT=3000

# Inserisci la tua API Key Gemini per il rilevatore truffe e il formattatore post Facebook
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Inserisci l'URL pubblico del tuo sito (con https quando avrai configurato il dominio)
APP_URL="https://tuo-dominio.it"
```
Salva con `CTRL + O`, premi `INVIO` e chiudi con `CTRL + X`.

> **Nota su Firebase:** La configurazione del database Firestore è già integrata nel file `firebase-applet-config.json` e compilata automaticamente nel bundle di produzione. Non serve alcuna configurazione aggiuntiva.

---

## 5. Metodo A: Deploy con PM2 (Consigliato)

Questo metodo è il più performante e leggero per i piani VPS Hostinger (KVM 1 / KVM 2 / KVM 4):

```bash
cd /var/www/affitti-milano

# Rendi eseguibile lo script di deploy
chmod +x deploy.sh

# Esegui il deploy automatico
./deploy.sh --pm2
```

Lo script eseguirà:
1. `npm install`
2. `npm run build` (genera sia il frontend Vite in `dist/` sia il server Node in `dist/server.cjs`)
3. Avvio di PM2 con `ecosystem.config.cjs`
4. Health check su `http://localhost:3000/api/health`

### Salvare PM2 al riavvio del VPS:
```bash
pm2 save
```

---

## 6. Metodo B: Deploy con Docker Compose

Se preferisci usare Docker e Docker Compose:

1. Installa Docker se non già presente:
   ```bash
   curl -fsSL https://get.docker.com | bash
   ```
2. Esegui il deploy:
   ```bash
   cd /var/www/affitti-milano
   docker compose up -d --build
   ```
3. Verifica lo stato del container:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

---

## 7. Configurazione Dominio & Nginx Reverse Proxy

### 1. Puntamento DNS nel pannello Hostinger / Cloudflare:
Vai nella gestione DNS del tuo dominio e aggiungi due record **A**:
- Tipo: `A` | Nome: `@` (o vuoto) | Valore: `IP_DEL_TUO_VPS` | TTL: Automatico
- Tipo: `A` | Nome: `www` | Valore: `IP_DEL_TUO_VPS` | TTL: Automatico

### 2. Configura Nginx:
Copia la configurazione ottimizzata inclusa nel progetto:
```bash
sudo cp /var/www/affitti-milano/nginx/affitti-milano.conf /etc/nginx/sites-available/affitti-milano.conf
```

Modifica il file sostituendo `tuo-dominio.it` con il tuo dominio reale:
```bash
sudo nano /etc/nginx/sites-available/affitti-milano.conf
```
*(Premi `CTRL+\` in nano per sostituire `tuo-dominio.it` con il tuo dominio effettivo)*

### 3. Abilita il sito e ricarica Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/affitti-milano.conf /etc/nginx/sites-enabled/
# Rimuovi il sito di default di Nginx se presente
sudo rm -f /etc/nginx/sites-enabled/default

# Verifica che la sintassi Nginx sia corretta
sudo nginx -t

# Ricarica Nginx
sudo systemctl reload nginx
```

---

## 8. Certificato SSL Gratuito (HTTPS) con Certbot

Ottieni un certificato SSL di classe A+ con rinnovo automatico tramite Let's Encrypt:

```bash
sudo certbot --nginx -d tuo-dominio.it -d www.tuo-dominio.it
```
- Inserisci la tua email (es. `coppolek@gmail.com`).
- Accetta i termini di servizio.
- Certbot configurerà automaticamente i certificati in Nginx e imposterà il redirect da HTTP a HTTPS.

Il rinnovo automatico è già attivo via timer di sistema. Puoi testarlo con:
```bash
sudo certbot renew --dry-run
```

---

## 9. Aggiornamenti Futuri in 1 Clic

Ogni volta che modifichi il codice o scarichi nuovi aggiornamenti, basta eseguire:

```bash
cd /var/www/affitti-milano
./deploy.sh
```

Lo script:
- Esegue `git pull` degli ultimi commit.
- Ricompila frontend e backend in modalità produzione.
- Ricarica l'applicazione tramite PM2 (`pm2 reload`) a **zero tempo di inattività**.
- Verifica che il server risponda con HTTP 200 su `/api/health`.

---

## 10. Comandi Utili

| Azione | Comando |
| :--- | :--- |
| **Stato applicazione** | `pm2 status` |
| **Visualizza log in tempo reale** | `pm2 logs affitti-milano` |
| **Riavvio applicazione** | `pm2 restart affitti-milano` |
| **Ricarica a caldo (zero downtime)** | `pm2 reload affitti-milano` |
| **Test Nginx** | `sudo nginx -t` |
| **Ricarica configurazione Nginx** | `sudo systemctl reload nginx` |
| **Stato del Firewall** | `sudo ufw status verbose` |
| **Monitoraggio risorse VPS** | `htop` |
| **Controllo Health Check** | `curl http://localhost:3000/api/health` |
