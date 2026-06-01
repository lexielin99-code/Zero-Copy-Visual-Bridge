(function () {
  'use strict';

  if (window.__vf__) {
    window.__vf__.toggle();
    return;
  }

  const PORT = 3456;
  const changes = [];
  const annotations = [];
  let mode = 'edit';
  let annIdCounter = 0;

  // ─── Styles ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'zcvb-styles';
  style.textContent = `
    /* --- 主控制台 --- */
    #zcvb-panel {
      all: initial;
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 280px !important;
      background: rgba(18, 18, 18, 0.85) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 16px !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
      color: #EFEFEF !important;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif !important;
      z-index: 999999 !important;
      padding: 16px !important;
      box-sizing: border-box !important;
    }
    #zcvb-panel * { box-sizing: border-box; }

    .zcvb-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 600;
    }
    .zcvb-status-dot {
      width: 8px; height: 8px;
      background: #10B981;
      border-radius: 50%;
      margin-right: 8px;
      flex-shrink: 0;
    }

    /* --- 模式切换 --- */
    .zcvb-tabs {
      display: flex;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 4px;
      margin-bottom: 16px;
    }
    .zcvb-tab {
      flex: 1; text-align: center;
      padding: 6px 0; font-size: 12px;
      cursor: pointer; border-radius: 6px;
      color: #888; transition: all 0.2s;
      user-select: none;
    }
    .zcvb-tab.active {
      background: rgba(255, 255, 255, 0.1);
      color: #fff; font-weight: 500;
    }

    /* --- 数据统计 --- */
    .zcvb-stats {
      display: flex; justify-content: space-between;
      font-size: 12px; color: #aaa;
      margin-bottom: 16px; padding: 0 4px;
    }
    .zcvb-stats .stat-label { margin-right: 4px; }
    .zcvb-stats .stat-count {
      font-family: monospace;
      color: #FF5E00; font-weight: 600; font-size: 14px;
    }

    /* --- 按钮 --- */
    .zcvb-btn-primary {
      width: 100%; background: #FF5E00; color: #FFFFFF;
      border: none; padding: 10px; border-radius: 8px;
      font-weight: 600; font-size: 13px; cursor: pointer;
      transition: all 0.2s; margin-bottom: 12px;
      font-family: inherit;
    }
    .zcvb-btn-primary:hover:not(:disabled) {
      box-shadow: 0 0 16px rgba(255, 94, 0, 0.4);
      filter: brightness(1.1);
    }
    .zcvb-btn-primary:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.25);
      cursor: default;
    }
    .zcvb-btn-secondary {
      width: 100%; background: transparent;
      color: #FF453A; border: none;
      font-size: 12px; cursor: pointer; font-family: inherit;
    }
    .zcvb-btn-secondary:hover { text-decoration: underline; }

    /* --- 网页元素交互 --- */
    .zcvb-hover-outline {
      outline: 2px dashed #FF5E00 !important;
      outline-offset: 6px !important;
      background: rgba(255, 94, 0, 0.08) !important;
      cursor: crosshair !important;
      border-radius: 4px;
    }
    .zcvb-tooltip {
      position: absolute;
      background: #1A1A1A; border: 1px solid #333;
      border-radius: 8px; padding: 8px 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      display: flex; align-items: center;
      z-index: 999998;
    }
    .zcvb-tooltip input {
      background: transparent; border: none;
      border-bottom: 1px solid #FF5E00;
      color: #fff; font-size: 13px;
      padding: 4px; outline: none; width: 180px;
    }
    .zcvb-tooltip button {
      background: #FF5E00; color: #FFFFFF; border: none;
      width: 24px; height: 24px; border-radius: 4px;
      margin-left: 8px; font-weight: bold; cursor: pointer;
    }
    .zcvb-pin-marker {
      position: absolute;
      width: 12px; height: 12px;
      background: #FF5E00; border-radius: 50%;
      border: 2px solid #000;
      box-shadow: 0 0 12px rgba(255, 94, 0, 0.4);
      z-index: 999997;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* --- 便利贴 --- */
    .vf-sticky {
      position: absolute !important; z-index: 2147483646 !important;
      background: rgba(22, 22, 22, 0.92);
      border: 1px solid rgba(255, 94, 0, 0.3);
      border-radius: 10px; width: 215px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(255,94,0,0.1);
      font: 13px/1.4 system-ui, sans-serif;
      backdrop-filter: blur(8px);
    }
    .vf-sticky-hd {
      background: rgba(255, 94, 0, 0.15);
      border-bottom: 1px solid rgba(255, 94, 0, 0.25);
      border-radius: 9px 9px 0 0; padding: 6px 10px;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 10.5px; font-weight: 600; color: #FF5E00;
      cursor: move; letter-spacing: .2px;
    }
    .vf-sticky textarea {
      display: block; width: 100%; border: none;
      background: transparent;
      padding: 8px 11px 10px; resize: none;
      font-size: 12px; color: #EFEFEF;
      line-height: 1.6; outline: none;
      font-family: system-ui, sans-serif;
    }
    .vf-sticky-del {
      background: none; border: none; cursor: pointer;
      color: rgba(255, 94, 0, 0.5); font-size: 16px;
      padding: 0; line-height: 1;
    }
    .vf-sticky-del:hover { color: #FF453A; }

    /* --- Toast --- */
    .__vf_toast__ {
      position: fixed !important; bottom: 26px !important; right: 26px !important;
      z-index: 2147483647 !important;
      background: rgba(22, 22, 22, 0.92);
      color: #EFEFEF; padding: 10px 16px; border-radius: 10px;
      font: 12.5px system-ui, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      border: 1px solid rgba(255, 94, 0, 0.3);
      transition: opacity .3s; pointer-events: none;
      backdrop-filter: blur(8px);
    }
  `;
  document.head.appendChild(style);

  // ─── Panel ────────────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = 'zcvb-panel';
  panel.innerHTML = `
    <div class="zcvb-header">
      <div class="zcvb-status-dot"></div>
      <span id="zcvb-title">Zero-Copy Visual Bridge</span>
    </div>

    <div class="zcvb-tabs">
      <div class="zcvb-tab active" id="zcvb-mode-text">✦ 编辑文案</div>
      <div class="zcvb-tab" id="zcvb-mode-note">◈ 备注</div>
    </div>

    <div class="zcvb-stats">
      <div><span class="stat-label">文案修改</span><span id="zcvb-count-text" class="stat-count">0 处</span></div>
      <div><span class="stat-label">便利贴备注</span><span id="zcvb-count-note" class="stat-count">0 条</span></div>
    </div>

    <button class="zcvb-btn-primary" id="zcvb-btn-save" disabled>保存反馈</button>
    <button class="zcvb-btn-secondary" id="zcvb-btn-exit">清空并退出</button>
  `;
  document.body.appendChild(panel);

  const saveBtn = panel.querySelector('#zcvb-btn-save');

  function updateStats() {
    panel.querySelector('#zcvb-count-text').textContent = changes.length + ' 处';
    panel.querySelector('#zcvb-count-note').textContent = annotations.length + ' 条';
    saveBtn.disabled = changes.length + annotations.length === 0;
  }

  // Mode switch
  panel.querySelector('#zcvb-mode-text').addEventListener('click', () => setMode('edit'));
  panel.querySelector('#zcvb-mode-note').addEventListener('click', () => setMode('annotate'));
  panel.querySelector('#zcvb-btn-exit').addEventListener('click', cleanup);

  function setMode(m) {
    mode = m;
    panel.querySelector('#zcvb-mode-text').classList.toggle('active', m === 'edit');
    panel.querySelector('#zcvb-mode-note').classList.toggle('active', m === 'annotate');
    if (activeTooltip) dismissTooltip();
  }

  // ─── CSS selector generator ───────────────────────────────────────────────
  function getSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    const parts = [];
    let cur = el;
    while (cur && cur !== document.documentElement && cur !== document.body) {
      let seg = cur.tagName.toLowerCase();
      const classes = Array.from(cur.classList)
        .filter(c => !c.startsWith('vf-') && !c.startsWith('zcvb-'))
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

  // ─── Event handlers ───────────────────────────────────────────────────────
  let hoveredEl = null;
  let activeTooltip = null;

  const _h = {
    mouseover: e => {
      const t = e.target;
      if (t.closest('#zcvb-panel') || t.closest('.vf-sticky') || t.closest('.zcvb-tooltip')) return;
      if (hoveredEl) hoveredEl.classList.remove('zcvb-hover-outline');
      hoveredEl = t;
      t.classList.add('zcvb-hover-outline');
    },
    mouseout: e => {
      if (e.target === hoveredEl) {
        hoveredEl.classList.remove('zcvb-hover-outline');
        hoveredEl = null;
      }
    },
    click: e => {
      if (e.target.closest('#zcvb-panel') || e.target.closest('.vf-sticky') || e.target.closest('.zcvb-tooltip')) return;
      e.preventDefault();
      e.stopPropagation();
      if (mode === 'edit') showEditTooltip(e.target);
      else addSticky(e.target);
    },
    keydown: e => {
      if (e.key === 'Escape' && activeTooltip) dismissTooltip();
    }
  };

  document.addEventListener('mouseover', _h.mouseover, true);
  document.addEventListener('mouseout',  _h.mouseout,  true);
  document.addEventListener('click',     _h.click,     true);
  document.addEventListener('keydown',   _h.keydown);

  // ─── Edit tooltip ─────────────────────────────────────────────────────────
  function showEditTooltip(el) {
    if (activeTooltip) dismissTooltip();

    const rect = el.getBoundingClientRect();
    const original = el.textContent.trim();

    const tooltip = document.createElement('div');
    tooltip.className = 'zcvb-tooltip';
    tooltip.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
    tooltip.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 248) + 'px';
    tooltip.innerHTML = `<input type="text" value="${original.replace(/"/g, '&quot;')}"><button title="确认">✓</button>`;
    document.body.appendChild(tooltip);
    activeTooltip = tooltip;

    const input = tooltip.querySelector('input');
    input.focus();
    input.select();

    function commit() {
      const modified = input.value.trim();
      dismissTooltip();
      if (!modified || modified === original) return;
      el.textContent = modified;
      const selector = getSelector(el);
      const idx = changes.findIndex(c => c.selector === selector);
      if (idx > -1) changes.splice(idx, 1);
      changes.push({ type: 'text_edit', selector, original, modified });
      updateStats();
    }

    tooltip.querySelector('button').addEventListener('click', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') dismissTooltip();
    });
  }

  function dismissTooltip() {
    if (activeTooltip) { activeTooltip.remove(); activeTooltip = null; }
  }

  // ─── Sticky notes ─────────────────────────────────────────────────────────
  function addSticky(el) {
    const id = ++annIdCounter;
    const selector = getSelector(el);
    const rect = el.getBoundingClientRect();

    // Orange pin marker centered on clicked element
    const pin = document.createElement('div');
    pin.className = 'zcvb-pin-marker';
    pin.dataset.vfPinId = id;
    pin.style.top  = (rect.top  + window.scrollY + rect.height / 2) + 'px';
    pin.style.left = (rect.left + window.scrollX + rect.width  / 2) + 'px';
    document.body.appendChild(pin);

    const sticky = document.createElement('div');
    sticky.className = 'vf-sticky';
    sticky.dataset.vfId = id;
    sticky.dataset.vfSelector = selector;
    sticky.style.top  = (rect.bottom + window.scrollY + 8) + 'px';
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
      pin.remove();
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
        el.style.top  = (e.clientY - oy) + 'px';
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
    if (activeTooltip) dismissTooltip();

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
      saveBtn.style.background = '#333';
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
    panel.remove();
    style.remove();
    if (activeTooltip) activeTooltip.remove();
    document.querySelectorAll('.vf-sticky').forEach(s => s.remove());
    document.querySelectorAll('.zcvb-pin-marker').forEach(p => p.remove());
    if (hoveredEl) hoveredEl.classList.remove('zcvb-hover-outline');
    delete window.__vf__;
  }

  window.__vf__ = {
    exit: cleanup,
    toggle: () => { panel.style.display = panel.style.display === 'none' ? '' : 'none'; }
  };

  toast('🎨 Zero-Copy Visual Bridge 已激活');
})();
