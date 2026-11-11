"""Genera la voz de Nigi (voz diseñada en VoiceStudio) para todas sus frases.

Requisitos: VoiceStudio corriendo en http://127.0.0.1:3900 con OmniVoice instalado.
Uso:  python scripts/voice/generate.py   (desde la raíz del proyecto)
Lee scripts/voice/lines.json (npx tsx scripts/voice-lines.ts) y escribe
public/voice/<clave>.mp3 + public/voice/manifest.json. Salta los que ya existen.
"""
import json, subprocess, sys, urllib.request, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = ROOT / "scripts" / "voice"
OUT = ROOT / "public" / "voice"
FFMPEG = sys.argv[1] if len(sys.argv) > 1 else "ffmpeg"
API = "http://127.0.0.1:3900/generate"
# Voz diseñada: joven, amigable y aguda. La semilla fija mantiene la misma voz en todas las frases.
VOICE = {"language": "Spanish", "instruct": "female, young adult, high pitch", "seed": "7", "num_step": "32", "speed": "1.05"}
# Ajustes de pronunciación (solo para el audio; el texto en pantalla no cambia).
SAY = {
    "Nigi": "Nigui", "CI&T": "ci and ti", "LinkedIn": "Linkedin", "NestJS": "Nest yei es", "NutriWeb": "Nutri güeb", "Node.js": "Nod yei es", "Supabase": "Supa beis",
    "AWS": "a, doble ve, ese", "EC2": "e, ce, dos", "S3": "ese tres", "IAM": "i, a, eme",
    "SST": "ese, ese, te", "CloudFront": "Claud front", "Payphone": "Pei fon", "JWT": "jota, doble ve, te",
}


def post(fields, files):
    b = uuid.uuid4().hex
    body = b""
    for k, v in fields.items():
        body += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, p in files.items():
        body += f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{p.name}"\r\nContent-Type: audio/wav\r\n\r\n'.encode() + p.read_bytes() + b"\r\n"
    body += f"--{b}--\r\n".encode()
    req = urllib.request.Request(API, body, {"Content-Type": f"multipart/form-data; boundary={b}"})
    return urllib.request.urlopen(req, timeout=900).read()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    lines = json.loads((HERE / "lines.json").read_text(encoding="utf-8"))
    manifest = {}
    for i, (key, text) in enumerate(lines.items(), 1):
        mp3 = OUT / f"{key}.mp3"
        if not mp3.exists():
            wav = HERE / "tmp.wav"
            spoken = text
            for a, b in SAY.items():
                spoken = spoken.replace(a, b)
            wav.write_bytes(post({"text": spoken, **VOICE}, {}))
            subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "64k", str(mp3)], check=True)
            wav.unlink()
        manifest[key] = mp3.name
        print(f"[{i}/{len(lines)}] {key} {text[:50]}", flush=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print("listo:", len(manifest))


main()
