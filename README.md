# Zero-Copy Visual Bridge

**在浏览器里直接改稿、贴便利贴，Claude 自动把你的修改同步到 HTML 源码。全程不用复制粘贴。**

A zero-copy design review skill for Claude Code. Edit copy and drop sticky notes directly in your browser — then just tell Claude *"反馈好了"* and every change gets applied to your source files automatically.

---

## Core Features / 核心亮点

**🎯 Zero-Copy Workflow (零复制闭环)**
Say goodbye to manual copy-pasting. Edit text or drop sticky notes directly on your UI, say "Feedback done" to your AI agent, and watch the source code update automatically.
告别繁琐的截图和复制粘贴。直接在网页上改文案、贴便利贴，对 AI 说一句"反馈好了"，源码自动更新。

**🧹 Zero DOM Pollution (零代码污染)**
Activated only when you need it via Chrome extension. It works entirely in memory and leaves absolutely no trace in your original HTML/CSS files.
按需唤醒，用完即焚。仅在内存中运行，绝不向你的原始项目代码中强塞任何脏数据。

**🪶 Ultra-Lightweight (极致轻量)**
Built with pure Vanilla JS and Node.js built-in modules. No React, no Express, no npm install bloat. Seamlessly bypasses file:// CORS restrictions.
纯原生 JS + Node.js 原生模块构建。无需安装臃肿的依赖包，优雅解决本地 file:// 协议跨域限制。

**🤖 Agent-Ready Architecture (为 AI 而生)**
Translates visual interactions into a structured, machine-readable JSON format (`.design_feedback.json`) combined with precise CSS selectors, acting as a perfect bridge for LLMs.
将人类的视觉反馈自动转化为 AI 极易理解的结构化 JSON 数据与精准的 CSS 选择器，填补视觉与代码的鸿沟。

---

## How it works

```
浏览器审稿（Chrome 插件）
    ↓ 点击「保存反馈」
本地接收端（自动启动）→ .design_feedback.json
    ↓ 你说「反馈好了」
Claude 读取文件 → 修改 HTML / CSS 源码 → 汇报结果
```

---

## Prerequisites

- [Claude Code](https://claude.ai/code) with this skill installed
- Node.js (any recent version)
- Google Chrome

---

## Installation

### 1. Install the skill

Download `visual-feedback.skill` and install it in Claude Code:

```bash
claude skill install visual-feedback.skill
```

Or copy the `visual-feedback/` folder into your Claude skills directory:

```
~/.claude/skills/visual-feedback/
```

### 2. Load the Chrome extension

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `extension/` folder inside this skill
4. In the extension details, enable **Allow access to file URLs**

That's it. The extension icon appears in your toolbar.

---

## Usage

### Start a review session

1. Open your HTML file in Chrome (double-click to open as `file://`)
2. Click the **Visual Feedback** extension icon → **开始审稿**
3. A control panel appears in the top-right corner of the page

**Edit copy** — hover to highlight any element, click to edit text inline

**Add sticky notes** — switch to 备注 mode, click any element to drop a sticky note

4. When done, click **保存反馈** in the panel

### Let Claude apply your changes

Back in Claude Code, just say:

> 反馈好了

Claude will read your feedback, apply all text edits to the source file, and summarize the sticky note annotations that need your design decisions.

### Exit

Click **清空并退出** in the panel, or open the extension popup and click **退出审稿**.

---

## Data

Feedback is saved to `.design_feedback.json` in your working directory. Sessions accumulate — each review adds a new entry so you have a full history. Claude never deletes this file.

---

## Skill triggers

This skill activates when you say things like:

- 反馈好了 / 我反馈好了
- feedback done / apply my feedback
- 可视化审稿 / 帮我设置审稿工具
- 插件怎么用

---

## License

MIT
