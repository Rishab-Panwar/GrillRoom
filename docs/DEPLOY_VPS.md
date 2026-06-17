# Deploy GrillRoom to a VPS (grillroom.rishabai.me)

The app = a static frontend (`dist/`) + a small Node server ([`server/index.js`](../server/index.js))
that serves it and handles `/api/signed-url` with the ElevenLabs key kept server-side.
nginx reverse-proxies the subdomain to the Node process (same pattern as your other subdomains).

---

## 0. Before you deploy — rotate the leaked keys
Both keys were shared in plaintext during setup. **Regenerate them:**
- **Firecrawl:** dashboard → revoke old key → create new → update the `firecrawl_search` tool's
  `Authorization` secret in the ElevenLabs console (`Bearer <new-key>`).
- **ElevenLabs:** Developers → API Keys → delete `grillroom` → create a new one → use the new
  value in the env file below.

---

## 1. Get the code + secrets onto the server
```bash
# on the VPS, e.g. /var/www/grillroom
git clone <your-repo> grillroom    # or rsync the project up
cd grillroom
npm ci
npm run build                      # produces dist/
```

Create the secret env file **outside** the repo (so it's never committed), e.g. `/etc/grillroom.env`:
```env
ELEVENLABS_API_KEY=sk_your_NEW_key
ELEVENLABS_AGENT_ID=agent_5601kv8c8cf4ftstec8e387yyx68
PORT=8787
```
```bash
sudo chmod 600 /etc/grillroom.env
```

## 2. Run the Node server with systemd
Create `/etc/systemd/system/grillroom.service`:
```ini
[Unit]
Description=GrillRoom
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/grillroom
EnvironmentFile=/etc/grillroom.env
ExecStart=/usr/bin/node server/index.js
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now grillroom
sudo systemctl status grillroom        # confirm it's listening on :8787
```

## 3. nginx reverse proxy for the subdomain
Create `/etc/nginx/sites-available/grillroom.rishabai.me`:
```nginx
server {
    server_name grillroom.rishabai.me;

    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 80;
}
```
```bash
sudo ln -s /etc/nginx/sites-available/grillroom.rishabai.me /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> The mic + ElevenLabs WebSocket require **HTTPS**. The ElevenLabs voice runs over a *separate*
> WSS connection straight from the browser to ElevenLabs, so nginx only needs to proxy normal
> HTTP(S) here — no extra WebSocket proxy config required for `/api`.

## 4. DNS + SSL
- Add an **A record**: `grillroom` → your VPS IP (same as your other subdomains).
- Issue a cert:
```bash
sudo certbot --nginx -d grillroom.rishabai.me
```

## 5. Verify
- Visit `https://grillroom.rishabai.me` → tab title **GrillRoom**.
- Click the door, allow mic, pitch → search + roast + Case File PDF (verdict + evidence).
- Confirm the **cost limits** end a session as expected. These are enforced **server-side in
  the ElevenLabs agent** (Advanced → Conversational behavior): "End conversation after silence"
  and "Max conversation duration". This stops per-minute billing at the source even if the
  browser tab is backgrounded. There is no client-side watchdog.

## Updating later
```bash
cd /var/www/grillroom && git pull && npm ci && npm run build && sudo systemctl restart grillroom
```
