(function () {
  'use strict';

  // Prevent double injection
  if (window.__vf__) {
    window.__vf__.toggle();
    return;
  }

  const PORT = 3456;
  const changes = []; // { type:'text_edit', selector, original, modified }
  const annotations = []; // { id, selector, note }
  let mode = 'edit';
  let activeEditEl = null;
  let annIdCounter = 0;

  // ─── Styles ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = '__vf_style__';
  style.textContent = `
    [data-vf-hover] {
      outline: 2px solid rgba(168,184,154,.85) !important;
      outline-offset: 3px !important;
      cursor: text !important;
    }
    [data-vf-hover][data-vf-mode="annotate"] {
      cursor: pointer !important;
      outline-color: rgba(206,181,176,.9) !important;
    }
    [data-vf-editing] {
      outline: 2px solid rgba(155,143,160,.8) !important;
      background: rgba(196,181,212,.07) !important;
    }

    #__vf_panel__ {
      all: initial;
      position: fixed !important; top: 20px !important; right: 20px !important;
      z-index: 2147483647 !important;
      background: linear-gradient(155deg, #F6F0EC 0%, #EDE6F0 55%, #E8EEE8 100%);
      color: #3D3540;
      border-radius: 14px; padding: 0; width: 218px;
      font: 13px/1.4 'DM Sans', system-ui, -apple-system, sans-serif;
      box-shadow: 0 6px 28px rgba(100,80,110,.18), 0 1px 3px rgba(100,80,110,.1);
      border: 1px solid rgba(196,181,212,.4);
      user-select: none;
      overflow: hidden;
    }
    #__vf_panel__ * { box-sizing: border-box; }

    #__vf_panel__ .vf-header {
      background: linear-gradient(135deg, rgba(196,181,212,.5) 0%, rgba(168,184,154,.4) 100%);
      padding: 12px 14px 11px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(196,181,212,.25);
      position: relative;
    }
    #__vf_panel__ .vf-header::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,.25) 0%, transparent 60%);
      pointer-events: none;
    }
    #__vf_panel__ h3 {
      margin: 0; font-size: 12.5px; font-weight: 500;
      color: #3D3540; letter-spacing: .2px;
      display: flex; align-items: center; gap: 6px;
    }
    #__vf_panel__ h3 .vf-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: linear-gradient(135deg, #C4B5C8, #A8B89A);
      flex-shrink: 0;
    }
    #__vf_panel__ .vf-body { padding: 12px 14px 14px; }
    #__vf_panel__ .vf-modes { display: flex; gap: 5px; margin-bottom: 11px; }
    #__vf_panel__ .vf-btn {
      flex: 1; padding: 6px 8px;
      border: 1px solid rgba(155,143,160,.25);
      border-radius: 8px;
      background: rgba(255,255,255,.55);
      color: #8A8190; cursor: pointer; font-size: 11.5px;
      font-family: inherit; font-weight: 400;
      transition: all .15s;
    }
    #__vf_panel__ .vf-btn.on {
      background: linear-gradient(135deg, #C4B5C8 0%, #A8B89A 100%);
      border-color: transparent; color: #fff;
      box-shadow: 0 2px 8px rgba(155,143,160,.3);
    }
    #__vf_panel__ .vf-btn:hover:not(.on) {
      background: rgba(255,255,255,.8);
      border-color: rgba(155,143,160,.4);
      color: #5A5060;
    }
    #__vf_panel__ .vf-stats {
      font-size: 11px; margin-bottom: 11px; line-height: 1.9;
      color: #9A8FA0;
    }
    #__vf_panel__ .vf-stats b { color: #5A5060; font-weight: 500; }

    #__vf_panel__ #__vf_save__ {
      width: 100%; padding: 8.5px;
      background: linear-gradient(135deg, #BFB0C4 0%, #A8B89A 100%);
      border: none; border-radius: 9px;
      color: #fff; font-size: 12.5px; font-weight: 500;
      cursor: pointer; font-family: inherit;
      box-shadow: 0 2px 10px rgba(155,143,160,.3);
      transition: opacity .15s, transform .1s;
      position: relative; overflow: hidden;
    }
    #__vf_panel__ #__vf_save__::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,.2) 0%, transparent 55%);
      pointer-events: none;
    }
    #__vf_panel__ #__vf_save__:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    #__vf_panel__ #__vf_save__:disabled {
      background: rgba(155,143,160,.2); color: rgba(90,80,96,.35);
      cursor: default; box-shadow: none;
    }
    #__vf_panel__ #__vf_exit__ {
      width: 100%; padding: 6px; margin-top: 6px;
      background: none; border: 1px solid rgba(155,143,160,.25);
      border-radius: 8px; color: #9A8FA0; font-size: 11.5px;
      cursor: pointer; font-family: inherit;
      transition: all .15s;
    }
    #__vf_panel__ #__vf_exit__:hover {
      border-color: rgba(192,80,80,.4); color: #C05050;
      background: rgba(192,80,80,.05);
    }
    #__vf_panel__ #__vf_close__ {
      background: none; border: none;
      color: rgba(90,80,96,.45); cursor: pointer; font-size: 17px;
      padding: 0; line-height: 1; z-index: 1; position: relative;
    }
    #__vf_panel__ #__vf_close__:hover { color: rgba(90,80,96,.85); }

    .vf-sticky {
      position: absolute !important; z-index: 2147483646 !important;
      background: linear-gradient(160deg, #FEFAF2 0%, #F9F3E8 100%);
      border: 1px solid rgba(220,195,160,.55);
      border-radius: 10px; width: 215px;
      box-shadow: 3px 6px 20px rgba(120,90,60,.14), 0 1px 3px rgba(120,90,60,.08);
      font: 13px/1.4 system-ui, sans-serif;
    }
    .vf-sticky-hd {
      background: linear-gradient(135deg, #EDD9A3 0%, #E8C98A 100%);
      border-radius: 9px 9px 0 0; padding: 6px 10px;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 10.5px; font-weight: 600; color: #6B4F20;
      cursor: move; letter-spacing: .2px;
    }
    .vf-sticky textarea {
      display: block; width: 100%; border: none;
      background: transparent;
      padding: 8px 11px 10px; resize: none; font-size: 12px; color: #4A3820;
      line-height: 1.6; outline: none; font-family: system-ui, sans-serif;
    }
    .vf-sticky-del {
      background: none; border: none; cursor: pointer;
      color: rgba(107,79,32,.5); font-size: 16px; padding: 0; line-height: 1;
    }
    .vf-sticky-del:hover { color: #C05050; }

    .__vf_toast__ {
      position: fixed !important; bottom: 26px !important; right: 26px !important;
      z-index: 2147483647 !important;
      background: linear-gradient(135deg, #F0EBF4 0%, #EBF0EB 100%);
      color: #3D3540; padding: 10px 16px; border-radius: 10px;
      font: 12.5px system-ui, sans-serif;
      box-shadow: 0 4px 20px rgba(100,80,110,.18);
      border: 1px solid rgba(196,181,212,.4);
      transition: opacity .3s; pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // ─── Panel ────────────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = '__vf_panel__';
  panel.innerHTML = `
    <div class="vf-header">
      <h3><span class="vf-dot"></span>Zero-Copy Visual Bridge</h3>
      <button id="__vf_close__">×</button>
    </div>
    <div class="vf-body">
      <div class="vf-modes">
        <button class="vf-btn on" id="__vf_edit_btn__">✦ 编辑文案</button>
        <button class="vf-btn" id="__vf_ann_btn__">◈ 备注</button>
      </div>
      <div class="vf-stats">
        文案修改：<b id="__vf_ec__">0</b> 处<br>
        便利贴备注：<b id="__vf_ac__">0</b> 条
      </div>
      <button id="__vf_save__" disabled>保存反馈</button>
      <button id="__vf_exit__">清空并退出</button>
    </div>
  `;
  document.body.appendChild(panel);

  const saveBtn = panel.querySelector('#__vf_save__');

  function updateStats() {
    panel.querySelector('#__vf_ec__').textContent = changes.length;
    panel.querySelector('#__vf_ac__').textContent = annotations.length;
    saveBtn.disabled = changes.length + annotations.length === 0;
  }

  // Mode switch
  panel.querySelector('#__vf_edit_btn__').addEventListener('click', () => setMode('edit'));
  panel.querySelector('#__vf_ann_btn__').addEventListener('click', () => setMode('annotate'));
  panel.querySelector('#__vf_close__').addEventListener('click', cleanup);
  panel.querySelector('#__vf_exit__').addEventListener('click', cleanup);

  function setMode(m) {
    mode = m;
    panel.querySelector('#__vf_edit_btn__').classList.toggle('on', m === 'edit');
    panel.querySelector('#__vf_ann_btn__').classList.toggle('on', m === 'annotate');
  }

  // ─── CSS selector generator ───────────────────────────────────────────────
  function getSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    const parts = [];
    let cur = el;
    while (cur && cur !== document.documentElement && cur !== document.body) {
      let seg = cur.tagName.toLowerCase();
      const classes = Array.from(cur.classList)
        .filter(c => !c.startsWith('vf-') && c !== '__vf_hover__')
        .slice(0, 2);
      if (classes.length) seg += '.' + classes.map(c => CSS.escape(c)).join('.');
      const siblings = cur.parentElement
        ? Array.from(cur.parentElement.children).filter(c => c.tagName === cur.tagName)
        : [];
      if (siblings.length > 1) seg += `:nth-of-type(${siblings.indexOf(cur) + 1})`;
      parts.unshift(seg);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  // ─── Event handlers (named so cleanup can removeEventListener) ───────────
  let hoveredEl = null;

  const _h = {
    mouseover: e => {
      const t = e.target;
      if (t.closest('#__vf_panel__') || t.closest('.vf-sticky')) return;
      if (hoveredEl) {
        hoveredEl.removeAttribute('data-vf-hover');
        hoveredEl.removeAttribute('data-vf-mode');
      }
      hoveredEl = t;
      t.setAttribute('data-vf-hover', '');
      if (mode === 'annotate') t.setAttribute('data-vf-mode', 'annotate');
    },
    mouseout: e => {
      if (e.target === hoveredEl) {
        hoveredEl.removeAttribute('data-vf-hover');
        hoveredEl.removeAttribute('data-vf-mode');
        hoveredEl = null;
      }
    },
    click: e => {
      if (e.target.closest('#__vf_panel__') || e.target.closest('.vf-sticky')) return;
      e.preventDefault();
      e.stopPropagation();
      if (mode === 'edit') startEdit(e.target);
      else addSticky(e.target);
    },
    keydown: e => {
      if (e.key === 'Escape' && activeEditEl) commitEdit();
    },
    blur: e => {
      if (e.target === activeEditEl) setTimeout(commitEdit, 50);
    }
  };

  document.addEventListener('mouseover', _h.mouseover, true);
  document.addEventListener('mouseout',  _h.mouseout,  true);
  document.addEventListener('click',     _h.click,     true);

  // ─── Text edit ────────────────────────────────────────────────────────────
  function startEdit(el) {
    if (activeEditEl) commitEdit();
    activeEditEl = el;
    el.dataset.vfOriginal = el.textContent;
    el.dataset.vfSelector = getSelector(el);
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-vf-editing', '');
    el.focus();
  }

  function commitEdit() {
    if (!activeEditEl) return;
    const el = activeEditEl;
    activeEditEl = null;
    const original = el.dataset.vfOriginal;
    const modified = el.textContent;
    el.removeAttribute('contenteditable');
    el.removeAttribute('data-vf-editing');
    delete el.dataset.vfOriginal;

    if (modified === original) return;
    const selector = el.dataset.vfSelector;
    delete el.dataset.vfSelector;

    const idx = changes.findIndex(c => c.selector === selector);
    if (idx > -1) changes.splice(idx, 1);
    changes.push({ type: 'text_edit', selector, original, modified });
    updateStats();
  }

  document.addEventListener('keydown', _h.keydown);
  document.addEventListener('blur',    _h.blur, true);

  // ─── Sticky notes ─────────────────────────────────────────────────────────
  function addSticky(el) {
    const id = ++annIdCounter;
    const selector = getSelector(el);
    const rect = el.getBoundingClientRect();

    const sticky = document.createElement('div');
    sticky.className = 'vf-sticky';
    sticky.dataset.vfId = id;
    sticky.dataset.vfSelector = selector;
    sticky.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    sticky.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 230) + 'px';
    sticky.innerHTML = `
      <div class="vf-sticky-hd">
        📌 备注
        <button class="vf-sticky-del">×</button>
      </div>
      <textarea rows="3" placeholder="写下你的意见..."></textarea>
    `;
    document.body.appendChild(sticky);
    sticky.querySelector('textarea').focus();

    sticky.querySelector('.vf-sticky-del').addEventListener('click', () => {
      sticky.remove();
      const i = annotations.findIndex(a => a.id === id);
      if (i > -1) annotations.splice(i, 1);
      updateStats();
    });

    sticky.querySelector('textarea').addEventListener('input', () => {
      const note = sticky.querySelector('textarea').value.trim();
      const existing = annotations.find(a => a.id === id);
      if (existing) existing.note = note;
      else annotations.push({ id, selector, note });
      updateStats();
    });

    makeDraggable(sticky.querySelector('.vf-sticky-hd'), sticky);
  }

  function makeDraggable(handle, el) {
    handle.addEventListener('mousedown', e => {
      e.preventDefault();
      const ox = e.clientX - el.offsetLeft, oy = e.clientY - el.offsetTop;
      const move = e => {
        el.style.left = (e.clientX - ox) + 'px';
        el.style.top = (e.clientY - oy) + 'px';
      };
      const up = () => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  saveBtn.addEventListener('click', async () => {
    if (activeEditEl) commitEdit();

    // Collect any sticky note text not yet captured via 'input' event
    document.querySelectorAll('.vf-sticky').forEach(s => {
      const id = parseInt(s.dataset.vfId);
      const note = s.querySelector('textarea').value.trim();
      const selector = s.dataset.vfSelector;
      if (!note) return;
      const existing = annotations.find(a => a.id === id);
      if (existing) { existing.note = note; existing.selector = selector; }
      else annotations.push({ id, selector, note });
    });

    const validAnnotations = annotations.filter(a => a.note);
    if (changes.length + validAnnotations.length === 0) return;

    const session = {
      timestamp: new Date().toISOString(),
      source_url: location.href,
      changes: [
        ...changes,
        ...validAnnotations.map(({ id, ...a }) => ({ type: 'annotation', ...a }))
      ]
    };

    saveBtn.disabled = true;
    saveBtn.textContent = '发送中...';

    try {
      const resp = await fetch(`http://localhost:${PORT}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      toast('✅ 反馈已保存！告诉 Claude "反馈好了" 即可');
      saveBtn.textContent = '✓ 已保存';
      saveBtn.style.background = '#555';
    } catch {
      toast('❌ receiver 未运行，请先执行：node receiver.js');
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 保存反馈';
    }
  });

  // ─── Toast ────────────────────────────────────────────────────────────────
  function toast(msg) {
    const t = document.createElement('div');
    t.className = '__vf_toast__';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 320);
    }, 3200);
  }

  // ─── Cleanup — removes ALL listeners and DOM traces ───────────────────────
  function cleanup() {
    document.removeEventListener('mouseover', _h.mouseover, true);
    document.removeEventListener('mouseout',  _h.mouseout,  true);
    document.removeEventListener('click',     _h.click,     true);
    document.removeEventListener('keydown',   _h.keydown);
    document.removeEventListener('blur',      _h.blur,      true);
    panel.remove();
    style.remove();
    document.querySelectorAll('.vf-sticky').forEach(s => s.remove());
    if (hoveredEl) {
      hoveredEl.removeAttribute('data-vf-hover');
      hoveredEl.removeAttribute('data-vf-mode');
    }
    if (activeEditEl) {
      activeEditEl.removeAttribute('contenteditable');
      activeEditEl.removeAttribute('data-vf-editing');
    }
    delete window.__vf__;
  }

  window.__vf__ = {
    exit: cleanup,
    toggle: () => { panel.style.display = panel.style.display === 'none' ? '' : 'none'; }
  };

  toast('🎨 Zero-Copy Visual Bridge 已激活');
})();
