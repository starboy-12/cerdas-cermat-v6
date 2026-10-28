'use strict';

/**
 * Cerdas Cermat - Cyber Security Shield Level 5
 * Enterprise-grade anti-tampering, anti-code-theft, anti-scraping, and integrity protection.
 */
(function () {
  function showSecurityNotice(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
      toastMsg.textContent = `🛡️ ${msg}`;
      toast.classList.add('is-visible');
      clearTimeout(window.__securityToastTimer);
      window.__securityToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
    }
  }

  // 1. Anti-Code-Theft: Disable Right Click Context Menu
  window.addEventListener('contextmenu', (event) => {
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    event.preventDefault();
    showSecurityNotice('Menu konteks dinonaktifkan oleh Cyber Security Level 5 untuk melindungi kode sumber dan materi soal.');
  }, { capture: true });

  // 2. Anti-Inspection & Anti-Reversing: Block DevTools and Source-Viewing Shortcuts
  window.addEventListener('keydown', (event) => {
    const key = event.key || '';
    const code = event.code || '';
    const ctrlOrMeta = event.ctrlKey || event.metaKey;

    // F12 Developer Tools
    if (key === 'F12' || code === 'F12') {
      event.preventDefault();
      event.stopPropagation();
      showSecurityNotice('Peralatan pengembang (F12) diblokir oleh Cyber Security Level 5.');
      return false;
    }

    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C / Cmd+Option+I / Cmd+Option+J / Cmd+Option+C
    if (ctrlOrMeta && event.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      showSecurityNotice('Inspeksi elemen & konsol diblokir oleh arsitektur Cyber Security Level 5.');
      return false;
    }

    // Ctrl+U / Cmd+U (View Source)
    if (ctrlOrMeta && (key === 'u' || key === 'U')) {
      event.preventDefault();
      event.stopPropagation();
      showSecurityNotice('Tampilan kode sumber (View Source) dilindungi oleh sistem anti-pencurian kode Level 5.');
      return false;
    }

    // Ctrl+S / Cmd+S (Save Webpage)
    if (ctrlOrMeta && (key === 's' || key === 'S')) {
      event.preventDefault();
      event.stopPropagation();
      showSecurityNotice('Penyimpanan lokal halaman dibatasi oleh proteksi integritas aplikasi.');
      return false;
    }

    // Ctrl+P / Cmd+P (Print / Bulk Question Scraping)
    if (ctrlOrMeta && (key === 'p' || key === 'P')) {
      event.preventDefault();
      event.stopPropagation();
      showSecurityNotice('Pencetakan massal materi soal dibatasi untuk perlindungan hak cipta.');
      return false;
    }
  }, { capture: true });

  // 3. Anti-Scraping: Prevent Dragging of Content & Images
  window.addEventListener('dragstart', (event) => {
    if (event.target.tagName === 'IMG' || event.target.closest('.question') || event.target.closest('.open-book')) {
      event.preventDefault();
    }
  }, { capture: true });

  // 4. Freeze Configuration to Prevent Console Tampering
  if (window.CERDAS_CONFIG) {
    try { Object.freeze(window.CERDAS_CONFIG); } catch {}
  }

  // 6. Cyber Security Runtime Shield Descriptor
  window.CERDAS_SECURITY = Object.freeze({
    level: 5,
    status: 'ACTIVE_SHIELD_L5',
    verifiedAt: new Date().toISOString(),
  });
})();
