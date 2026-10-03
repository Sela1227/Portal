/* ═══════════════════════════════════════════
   SELA Portal — 個人工具（AES-256-GCM 加密）

   此檔案僅由 /workspace/ 載入
   同仁首頁不會載入此檔案

   結構：salt(16) | iv(12) | ciphertext | authTag(16)
   ═══════════════════════════════════════════ */

const ENCRYPTED = 'k5/R8wvdw+3lanEMWZUfkdWhIgO/CSv/4MIt5jH7PPiNGMI4hbsi4c/XUBPbgvXZwbclw6BJX4cdXHOYR+LEdQK/LSi6bt7pJVz17dwdnMlweDPfVQnUq8+65KbHxnoXsSLpXv4O/RSvU7lIQ9pLvAvHh2XI9wkOLYjtEGtTPJzd5CT7LH4Hhh5N28P315yHpbjlJVuhW/B1vcAcdyykk8vWocv+2FBKQ4bDpZ4ityyjC34xAPFA9cIbngPB69DnmeGHmHEp0lT3rRbuQ8h5YmsB8xvrrGHuH2XydsBtkDiVvxhE6omKaeL8VMltBBGQYYgQHR2LkduqyGNXWdFTWG4g/izpqefr6xuZ98pESBEQVj9w/tKgIThHUEo7B4W7jTd/GG+RMcHL2q+fLQGrEyet8D18ku9KX2Kw2fxBpPnaYcPDBjxoEp4lWY4WbQayBItGQLJlMaL+pBOZAF8bghrF3dNkjfQ2DKXOuzihYmv7xixQrSZwZup6tbFyS2ll3/A+SeXvlfnfCOr/Adh0imbqVs6qXtNvB+eKhkcP+1idOz/M+JHE+jsjo2BDSL98GwoRM6EPe4d8bxY0oxSzEkSI2ZWViIrEDtCjI/Xrqt+JWOTLv2mweFWKwj+iX3bQxOEUTbyiHT/IIcM7/hKcVXjXIhJhMk7MzgJ7RuHjLlgV224gv3NPVAON47LyVsm6nw9VmRzBLf2l3vsfEQ0KLZOBRbVMwTD+f6vpFHoqKnyfjikUDbxd9TUZqIho+b3J2M7tszHIVK32y21bVUq7qFdLd4MXPgFAbKIk023XmWOL/lPUPNjulZihCsggRgNxPa61rh5z/rzzFjKYkfqlfLkFPYA25h06uR6XyLZ69OtZmjjJvGTogXoy2oGdXlJfD/HRjskNb5hBPmowcFpEgDpO1FpbcRnGf4isl8v7fPlfuAaZhxeAq2OOqlHP';

async function decryptPersonalTools(password) {
  const buf  = Uint8Array.from(atob(ENCRYPTED), c => c.charCodeAt(0));
  const salt = buf.slice(0, 16);
  const iv   = buf.slice(16, 28);
  const body = buf.slice(28);

  const keyMat = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'PBKDF2' }, false, ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMat, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, body);
  return JSON.parse(new TextDecoder().decode(plain));
}
