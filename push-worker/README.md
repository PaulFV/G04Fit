# G04Fit Push Worker

Der Worker speichert pro Gerät genau eine Web-Push-Anmeldung in einem eigenen Durable Object. Ein Durable-Object-Alarm weckt den Worker am gewählten Trainingstag und sendet die Erinnerung auch dann, wenn G04Fit geschlossen ist.

## Bereitstellung

1. `npm install`
2. `npx wrangler login`
3. `npx web-push generate-vapid-keys`
4. Öffentlichen und privaten Schlüssel als Secrets setzen:
   - `npx wrangler secret put VAPID_PUBLIC_KEY`
   - `npx wrangler secret put VAPID_PRIVATE_KEY`
5. `npm run check`
6. `npm run deploy`
7. Falls Cloudflare eine andere Worker-URL ausgibt, diese in `../push-config.js` eintragen.

Der private VAPID-Schlüssel darf niemals im Repository oder in `push-config.js` gespeichert werden.
