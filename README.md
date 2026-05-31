# Zero-Copy Visual Bridge

**不用写需求文档，不用截图标注，不用复制粘贴。直接在页面上改文案、贴便利贴说感受，Claude 自动看懂并更新源码。**

Point at what you don't like, say how it *feels* — Claude translates your vibe into working code.

---

## The Core Idea

You open a prototype in the browser and immediately sense something's off. But describing it in words, writing a ticket, waiting for a fix — that whole loop is friction.

Zero-Copy Visual Bridge collapses it:

1. **Click directly on the element** that feels wrong
2. **Drop a sticky note** — write anything: *"太冷了"*, *"不够高级"*, *"这个间距很奇怪"*, *"字太小用户根本看不到"*
3. **Tell Claude: "反馈好了"**
4. Claude reads your sticky notes, understands the intent, and edits the source code

No screenshots. No copy-pasting. No translating feelings into dev-speak yourself.

---

## Core Features / 核心亮点

**🎯 Vibe-to-Code (感受即指令)**
Write what you *feel*, not what you want coded. Drop a sticky note saying *"这里太压抑了"* or *"感觉有点廉价"* — Claude interprets the intent and decides how to fix it. Your design intuition is the instruction.
直接说"太冷""感觉不够高级"，Claude 读懂你的直觉感受，自己判断该改什么、怎么改。

**✏️ Inline Text Editing (所见即所得改稿)**
Click any text element to edit it directly in the browser — what you type becomes the new source. No switching tabs, no find-and-replace.
点击文字直接改，改完即存。不用在浏览器和编辑器之间反复切换。

**🧹 Zero DOM Pollution (零代码污染)**
The tool lives entirely in memory. Activate when needed, vanish when done — nothing injected into your source files.
按需唤醒，用完即焚。不向源码写入任何痕迹。

**🪶 Ultra-Lightweight (极致轻量)**
Pure Vanilla JS + Node.js built-ins. No React, no Express, no `npm install`. Bypasses `file://` CORS out of the box.
纯原生 JS，无依赖，开箱即用。

**🤖 Agent-Ready (为 AI 而生)**
Every annotation is saved as structured JSON with a precise CSS selector — Claude always knows exactly *which element* your feedback refers to.
每条反馈都绑定精准的 CSS 选择器，Claude 永远知道你在说哪个元素。

---

## How It Works

```
① Open your HTML in Chrome, click the extension → 开始审稿

② On the page:
   · Click any text to edit it inline
   · Switch to 备注 mode → click any element → drop a sticky note
     ("太工程师了" / "按钮没有点击欲望" / "配色让人感觉不信任这个产品")

③ Click 保存反馈 → feedback saved to .design_feedback.json

④ Tell Claude: 反馈好了
   → Claude reads the file → patches source code → reports back
```

---

## Prerequisites

- [Claude Code](https://claude.ai/code) with this skill installed
- Node.js (any recent version)
- Google Chrome

---

## Installation

### 1. Install the skill

Download `zero-copy-visual-bridge.skill` from Releases:

```bash
claude skill install zero-copy-visual-bridge.skill
```

Or copy the folder directly into your skills directory:

```
~/.claude/skills/zero-copy-visual-bridge/
```

### 2. Load the Chrome extension

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `extension/` folder inside this skill
4. In the extension details, enable **Allow access to file URLs**

The extension icon appears in your toolbar.

---

## Usage

### Start a review

1. Open your HTML file in Chrome
2. Click the **Zero-Copy Visual Bridge** icon → **开始审稿**
3. The control panel appears top-right

**Edit text** — hover any element to highlight, click to edit inline

**Drop sticky notes** — switch to 备注 mode, click any element to pin a note

> What to write in sticky notes: anything that captures your reaction.
> *"太工程师气质了，要更有设计感"* / *"这个按钮没有点击欲望"* / *"颜色组合让人感觉不信任这个产品"*
> Claude will interpret the intent and figure out the fix.

4. Click **保存反馈** when done

### Apply changes

In Claude Code, say:

> 反馈好了

Claude applies all text edits automatically, then interprets each sticky note — making direct fixes where the intent is clear, and asking you only when a design decision is genuinely ambiguous.

### Exit

Click **清空并退出** in the panel, or open the extension popup → **退出审稿**.

---

## Feedback format (under the hood)

```json
{
  "sessions": [{
    "source_url": "file:///Users/you/project/index.html",
    "changes": [
      { "type": "text_edit", "selector": "h1.hero", "original": "旧标题", "modified": "新标题" },
      { "type": "annotation", "selector": ".pricing-card", "note": "感觉太廉价了，要更有质感" }
    ]
  }]
}
```

---

## Skill triggers

- 反馈好了 / 我反馈好了
- feedback done / apply my feedback
- 可视化审稿 / 帮我设置审稿工具
- 插件怎么用

---

## License

MIT
