# auto-video

Video verticali animati (1080×1920) scritti da Claude, con voce narrante e musica, renderizzati gratis su GitHub Actions e restituiti a n8n.

## Come funziona
1. n8n chiede a Claude un video (`prompts/`) e prepara il pacchetto (`n8n/code-prepara-job.js`).
2. n8n avvia l'Action `render` con due input: `job` (base64) e `callback` (resumeUrl del nodo Wait).
3. L'Action genera la voce con edge-tts, sincronizza le scene, renderizza con Remotion e invia l'mp4 (massimo circa 9,5 MB) a n8n.
4. Se qualcosa fallisce, invia a n8n `ok=false` e il messaggio d'errore, che torna a Claude per la correzione.

## File
- `src/generated/Scene.tsx`: sovrascritto a ogni video con il codice di Claude
- `examples/Brufolo.tsx`: esempio di riferimento incluso nel prompt
- `scripts/prepare.py`: controllo del codice, voce, durate delle scene
- `.github/workflows/render.yml`: il render
- `public/music.mp3`: musica di sottofondo (opzionale, libera da diritti)

## Prova in locale
```
npm ci
npm run studio
```
