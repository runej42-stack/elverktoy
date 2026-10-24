# Måler tegnbredder for PDF-skriveren og skriver src/jobs/pdf-fonts.js.
# Helvetica har samme bredder som Arial, så Arial fra Windows brukes som kilde.
# Symbol-fonten måles fra symbol.ttf (tegnene ligger på U+F020–U+F0FF).
# Kjøres med en Python som har Pillow, f.eks.:
#   E:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\.venv\Scripts\python.exe tools\font-metrics.py

import json
import os
from PIL import ImageFont

FONTS = os.path.join(os.environ.get('WINDIR', r'C:\Windows'), 'Fonts')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIZE = 1000

# Tegnene vi bruker fra Symbol-fonten, med koden i fontens egen koding.
SYMBOL_CODES = {
    'Ω': 0x57, 'Δ': 0x44, '√': 0xD6, '≤': 0xA3, '≥': 0xB3, 'φ': 0x66, 'π': 0x70,
    'η': 0x68, 'θ': 0x71, 'α': 0x61, 'β': 0x62, 'ρ': 0x72, 'Σ': 0x53, '≈': 0xBB,
    '∞': 0xA5, '→': 0xAE, '↔': 0xAB, '−': 0x2D, 'Φ': 0x46, 'λ': 0x6C, 'ω': 0x77,
    '∑': 0xE5, '≠': 0xB9, '∆': 0x44, 'κ': 0x6B, 'τ': 0x74,
}


def widths(path):
    font = ImageFont.truetype(path, SIZE)
    out = []
    for code in range(32, 256):
        try:
            ch = bytes([code]).decode('cp1252')
        except UnicodeDecodeError:
            out.append(0)
            continue
        out.append(round(font.getlength(ch)))
    return out


def symbol_widths(path):
    font = ImageFont.truetype(path, SIZE, encoding='symb')
    return {ch: [code, round(font.getlength(chr(0xF000 + code)))] for ch, code in SYMBOL_CODES.items()}


helv = widths(os.path.join(FONTS, 'arial.ttf'))
helv_bold = widths(os.path.join(FONTS, 'arialbd.ttf'))
symbol = symbol_widths(os.path.join(FONTS, 'symbol.ttf'))

js = f"""// Tegnbredder (1/1000 em) for PDF-skriverens standardfonter. Generert av tools/font-metrics.py.
// Helvetica og Helvetica-Bold er målt fra Arial (samme bredder). Indeks 0 = tegnkode 32 i WinAnsi.

export const HELVETICA = {json.dumps(helv)};

export const HELVETICA_BOLD = {json.dumps(helv_bold)};

/** Tegn som hentes fra Symbol-fonten: tegn → [kode i Symbol, bredde]. */
export const SYMBOL = {json.dumps(symbol, ensure_ascii=False)};
"""
target = os.path.join(ROOT, 'src', 'jobs', 'pdf-fonts.js')
os.makedirs(os.path.dirname(target), exist_ok=True)
with open(target, 'w', encoding='utf-8', newline='\n') as f:
    f.write(js)
print('Skrev', target, 'A =', helv[ord('A') - 32], 'Omega =', symbol['Ω'][1])
