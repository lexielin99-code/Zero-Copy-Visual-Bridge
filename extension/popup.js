const btn = document.getElementById('activate');
const status = document.getElementById('status');

async function getTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id ?? null;
}

async function isToolActive(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!window.__vf__
    });
    return result;
  } catch { return false; }
}

async function init() {
  const tabId = await getTabId();
  if (!tabId) {
    status.textContent = '无法获取当前页面';
    status.className = 'err';
    return;
  }

  if (await isToolActive(tabId)) {
    showExitState(tabId);
  } else {
    showStartState(tabId);
  }
}

function showStartState(tabId) {
  btn.textContent = '✦ 开始审稿';
  btn.style.background = 'linear-gradient(135deg, #C4B5C8 0%, #A8B89A 100%)';
  btn.onclick = () => activate(tabId);
}

function showExitState(tabId) {
  btn.textContent = '⏹ 退出审稿';
  btn.style.background = 'linear-gradient(135deg, #CEB5B0 0%, #B09EA8 100%)';
  btn.onclick = () => deactivate(tabId);
}

async function activate(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['inject.js']
    });
    status.textContent = '✅ 已激活，可开始审稿';
    status.className = 'ok';
    setTimeout(() => window.close(), 800);
  } catch (e) {
    status.textContent = e.message.includes('file')
      ? '请在插件详情里勾选「允许访问文件网址」'
      : '注入失败：' + e.message;
    status.className = 'err';
  }
}

async function deactivate(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => { if (window.__vf__) window.__vf__.exit(); }
    });
  } catch { /* tab may have navigated */ }
  status.textContent = '已退出审稿模式';
  status.className = 'ok';
  setTimeout(() => window.close(), 600);
}

init();
