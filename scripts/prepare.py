"""
Prepara un render a partire da job.json (inviato da n8n):

{
  "code":   "<componente React scritto da Claude>",
  "scenes": [ {"voiceover": "testo letto nella scena", "seconds": 3}, ... ],
  "voice":  "it-IT-IsabellaNeural",   (opzionale)
  "rate":   "+5%"                     (opzionale)
}

Fa tre cose:
1. controlla il codice e lo scrive in src/generated/Scene.tsx
2. genera la voce narrante scena per scena (edge-tts) e misura quanto dura
3. scrive public/voice.mp3 e props.json con l'inizio e la durata in frame di ogni scena,
   così le animazioni restano sincronizzate con la voce.

In caso di errore scrive il motivo in errors.txt ed esce con codice 1.
"""
import asyncio
import json
import math
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
GAP_S = 0.35          # pausa dopo ogni frase
TAIL_S = 0.8          # coda dopo l'ultima scena
MIN_SCENE_FRAMES = 45  # 1,5 s
MAX_TOTAL_S = 60
DEFAULT_VOICE = "it-IT-IsabellaNeural"
ALLOWED_IMPORTS = re.compile(r"^(react|remotion)$")
TMP = ROOT / "tmp_audio"


def fail(msg: str) -> None:
    (ROOT / "errors.txt").write_text(msg, encoding="utf-8")
    print("ERRORE:", msg, file=sys.stderr)
    sys.exit(1)


def check_code(code: str) -> None:
    if "export const GeneratedVideo" not in code:
        fail("Il codice deve esportare `export const GeneratedVideo: React.FC<{ scenes: { start: number; duration: number }[] }>`.")
    for mod in re.findall(r"""(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]""", code):
        if not ALLOWED_IMPORTS.match(mod):
            fail(f"Import non consentito: '{mod}'. Sono ammessi solo 'react' e 'remotion'. I font Montserrat, Poppins e Bebas Neue sono già caricati: usali con fontFamily.")
    for bad in ("fetch(", "XMLHttpRequest", "require(", "import("):
        if bad in code:
            fail(f"Uso non consentito nel codice: '{bad}'.")


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


async def tts(text: str, voice: str, rate: str, out: Path) -> None:
    if os.environ.get("FAKE_TTS"):  # solo per test locali senza rete
        secs = max(1.0, len(text.split()) / 2.6)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
                        f"anullsrc=r=44100:cl=stereo", "-t", f"{secs:.2f}", str(out)], check=True)
        return
    import edge_tts
    last = None
    for _ in range(3):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(str(out))
            if out.exists() and out.stat().st_size > 0:
                return
        except Exception as e:  # rete instabile: riprova
            last = e
        await asyncio.sleep(2)
    fail(f"Generazione voce fallita: {last}")


def main() -> None:
    job_path = ROOT / "job.json"
    try:
        job = json.loads(job_path.read_text(encoding="utf-8"))
    except Exception as e:
        fail(f"job.json non valido: {e}")

    code = job.get("code") or ""
    scenes = job.get("scenes") or []
    voice = job.get("voice") or DEFAULT_VOICE
    rate = job.get("rate") or "+0%"

    if not isinstance(scenes, list) or not scenes:
        fail("Il campo 'scenes' deve essere una lista con almeno una scena.")
    if len(scenes) > 12:
        fail("Troppe scene: massimo 12.")
    check_code(code)
    (ROOT / "src" / "generated" / "Scene.tsx").write_text(code, encoding="utf-8")

    TMP.mkdir(exist_ok=True)
    timings, segments, has_voice, cursor = [], [], False, 0

    for i, sc in enumerate(scenes):
        text = (sc.get("voiceover") or "").strip()
        min_s = float(sc.get("seconds") or 0)
        voice_s = 0.0
        raw = TMP / f"raw_{i}.mp3"
        if text:
            asyncio.run(tts(text, voice, rate, raw))
            voice_s = duration(raw)
            has_voice = True
        secs = max(voice_s + GAP_S, min_s)
        if i == len(scenes) - 1:
            secs += TAIL_S
        frames = max(MIN_SCENE_FRAMES, math.ceil(secs * FPS))
        exact = frames / FPS

        seg = TMP / f"seg_{i}.wav"
        if text:
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
                   "-af", f"apad=whole_dur={exact:.4f}", "-t", f"{exact:.4f}",
                   "-ar", "44100", "-ac", "2", str(seg)]
        else:
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
                   "anullsrc=r=44100:cl=stereo", "-t", f"{exact:.4f}", str(seg)]
        subprocess.run(cmd, check=True)
        segments.append(seg)
        timings.append({"start": cursor, "duration": frames})
        cursor += frames

    if cursor / FPS > MAX_TOTAL_S:
        fail(f"Video troppo lungo: {cursor / FPS:.1f} s (massimo {MAX_TOTAL_S}). Accorcia i testi della voce.")

    if has_voice:
        lst = TMP / "list.txt"
        lst.write_text("".join(f"file '{s.name}'\n" for s in segments), encoding="utf-8")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
                        "-i", str(lst), "-c:a", "libmp3lame", "-b:a", "160k",
                        str(ROOT / "public" / "voice.mp3")], check=True)

    props = {
        "scenes": timings,
        "totalFrames": cursor,
        "hasVoice": has_voice,
        "hasMusic": (ROOT / "public" / "music.mp3").exists(),
    }
    (ROOT / "props.json").write_text(json.dumps(props), encoding="utf-8")
    print(json.dumps(props))


if __name__ == "__main__":
    main()
