// Nodo Code "Prepara job" — modalità: Run Once for All Items
// Legge la risposta di Claude (campo text del nodo precedente) e prepara il pacchetto per GitHub.
const raw = $input.first().json.text || '';

const pick = (tag) => {
  const m = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : '';
};

const titolo = pick('titolo');
const caption = pick('caption');
const hashtag = pick('hashtag');
let codice = pick('codice').replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();

const scene = [...pick('scene').matchAll(/<scena(?:\s+secondi="([\d.]+)")?\s*>([\s\S]*?)<\/scena>/g)]
  .map((m) => ({ voiceover: m[2].trim(), seconds: Number(m[1] || 0) }));

if (!codice || scene.length === 0) {
  throw new Error('Risposta di Claude incompleta: mancano <codice> o <scene>.');
}

const job = {
  code: codice,
  scenes: scene,
  voice: 'it-IT-IsabellaNeural', // voci: it-IT-IsabellaNeural, it-IT-ElsaNeural, it-IT-DiegoNeural
  rate: '+8%',
};
const job_b64 = Buffer.from(JSON.stringify(job), 'utf8').toString('base64');

if (job_b64.length > 60000) {
  throw new Error('Codice troppo lungo per GitHub (oltre 60.000 caratteri).');
}

return [{
  json: {
    titolo,
    caption,
    hashtag,
    testo_post: `${caption}\n\n${hashtag}`,
    voce: scene.map((s) => s.voiceover).join(' '),
    job_b64,
  },
}];
