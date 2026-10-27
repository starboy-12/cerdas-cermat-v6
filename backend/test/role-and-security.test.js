'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');
const { once } = require('node:events');

async function freePort() {
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const { port } = socket.address();
  await new Promise((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()));
  return port;
}

test('Role-Based Access Control (Jenjang & Guru) dan Cyber Security Tingkat 5', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cerdas-role-sec-'));
  const progressFile = path.join(directory, 'progress.json');
  const contentFile = path.join(directory, 'content.json');

  await fs.writeFile(progressFile, JSON.stringify({
    progress: {}, attempts: {}, readingProgress: {}, users: {}, classes: {},
  }));

  const port = await freePort();
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      PORT: String(port),
      PROGRESS_FILE: progressFile,
      CONTENT_FILE: contentFile,
      RATE_LIMIT: '500',
    },
    stdio: 'ignore',
  });

  t.after(async () => {
    child.kill();
    await Promise.race([once(child, 'exit'), new Promise((resolve) => setTimeout(resolve, 3000))]);
    await fs.rm(directory, { recursive: true, force: true });
  });

  const base = `http://127.0.0.1:${port}/api`;
  let healthy = false;
  for (let index = 0; index < 60; index += 1) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) {
        healthy = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(healthy, true, 'Server API harus aktif dan berjalan');

  async function api(pathName, { method = 'GET', body, rawBody, token, headers = {} } = {}) {
    const finalHeaders = { ...headers };
    if (body !== undefined || rawBody !== undefined) finalHeaders['Content-Type'] = 'application/json';
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
    const response = await fetch(`${base}${pathName}`, {
      method,
      headers: finalHeaders,
      body: rawBody !== undefined ? rawBody : (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const json = await response.json().catch(() => ({}));
    return { status: response.status, headers: response.headers, data: json };
  }

  // 1. Verifikasi Header Keamanan Cyber Security Tingkat 5
  const healthRes = await api('/health');
  assert.equal(healthRes.status, 200);
  assert.equal(healthRes.headers.get('x-cyber-security-level'), '5-Enterprise-Defense');
  assert.equal(healthRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(healthRes.headers.get('x-frame-options'), 'SAMEORIGIN');

  // 2. Pendaftaran Akun Siswa TK (student_tk)
  const regTk = await api('/auth/register', {
    method: 'POST',
    body: { email: 'siswa.tk@example.com', password: 'Password123!', name: 'Budi TK', role: 'student_tk' },
  });
  assert.equal(regTk.status, 201, 'Siswa TK berhasil mendaftar tanpa kode undangan');
  assert.equal(regTk.data.user.role, 'student_tk');
  assert.equal(regTk.data.user.allowedLevel, 'tk');
  const tokenTk = regTk.data.token;

  // 3. Siswa TK dapat mengakses buku dan cerita jenjang TK
  const tkBook = await api('/books/tk/pages/1', { token: tokenTk });
  assert.equal(tkBook.status, 200, 'Siswa TK dapat membuka buku TK');

  const tkStory = await api('/storybook/tk', { token: tokenTk });
  assert.equal(tkStory.status, 200, 'Siswa TK dapat membuka buku cerita TK');

  // 4. Siswa TK DITOLAK saat mencoba mengakses jenjang SD / SMP / SMA
  const blockSd = await api('/books/sd/pages/1', { token: tokenTk });
  assert.equal(blockSd.status, 403, 'Siswa TK ditolak membuka buku SD');
  assert.match(blockSd.data.message || blockSd.data.error, /Akses ditolak.*Siswa TK \/ PAUD.*tidak diizinkan membuka/);

  const blockSmpStory = await api('/storybook/smp', { token: tokenTk });
  assert.equal(blockSmpStory.status, 403, 'Siswa TK ditolak membuka cerita SMP');

  const blockSmaCatalog = await api('/catalog/sma/subjects', { token: tokenTk });
  assert.equal(blockSmaCatalog.status, 403, 'Siswa TK ditolak membuka katalog SMA');

  // 5. Pendaftaran Akun Guru (teacher)
  const regTeacher = await api('/auth/register', {
    method: 'POST',
    body: { email: 'guru.hebat@example.com', password: 'Password123!', name: 'Ibu Guru Ani', role: 'teacher' },
  });
  assert.equal(regTeacher.status, 201, 'Guru berhasil mendaftar');
  assert.equal(regTeacher.data.user.role, 'teacher');
  const tokenTeacher = regTeacher.data.token;

  // 6. Guru dapat mengakses SEMUA jenjang (TK, SD, SMP, SMA)
  const teacherTk = await api('/books/tk/pages/1', { token: tokenTeacher });
  assert.equal(teacherTk.status, 200, 'Guru dapat mengakses jenjang TK');

  const teacherSd = await api('/books/sd/pages/1', { token: tokenTeacher });
  assert.equal(teacherSd.status, 200, 'Guru dapat mengakses jenjang SD');

  const teacherSmp = await api('/storybook/smp', { token: tokenTeacher });
  assert.equal(teacherSmp.status, 200, 'Guru dapat mengakses jenjang SMP');

  const teacherSma = await api('/books/sma/pages/1', { token: tokenTeacher });
  assert.equal(teacherSma.status, 200, 'Guru dapat mengakses jenjang SMA');

  // 7. WAF Cyber Security: Penolakan Payload Berbahaya (Prototype Pollution)
  const wafRes = await api('/auth/register', {
    method: 'POST',
    rawBody: '{"email":"attacker@evil.com","password":"Password123!","name":"Attacker","__proto__":{"isAdmin":true}}',
  });
  assert.equal(wafRes.status, 400, 'WAF memblokir payload yang mengandung __proto__');

  // 8. Cyber Security: Perlindungan Brute-force login lockout (5 percobaan salah)
  for (let i = 0; i < 5; i++) {
    await api('/auth/login', {
      method: 'POST',
      body: { email: 'siswa.tk@example.com', password: 'WrongPassword!' },
    });
  }
  const lockedRes = await api('/auth/login', {
    method: 'POST',
    body: { email: 'siswa.tk@example.com', password: 'Password123!' },
  });
  assert.equal(lockedRes.status, 429, 'Akun terkunci setelah 5 kali gagal login');
  assert.match(lockedRes.data.message || lockedRes.data.error, /Terlalu banyak percobaan/);
});
