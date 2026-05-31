---
name: zero-copy-visual-bridge
description: Zero-copy visual review workflow for HTML/CSS files. ALWAYS use this skill when the user says "反馈好了", "我反馈好了", "feedback done", "apply my feedback", or anything indicating they've finished annotating in the browser. Also trigger when the user wants to set up the review tool ("可视化审稿", "设置审稿工具", "插件怎么用", "bookmarklet", "怎么在浏览器里改稿"). Handles two phases: (1) guide the user to set up receiver.js + Chrome extension; (2) read .design_feedback.json and patch HTML/CSS source files automatically.
---

# Visual Feedback Workflow

浏览器直接改文案、贴便利贴 → 说「反馈好了」→ Claude 自动同步到源码。全程零复制。

---

## 场景 A：初次设置

### Step 1：启动本地接收端（Claude 自动完成）

用 Bash 工具以后台模式启动 receiver.js（`run_in_background: true`），不要阻塞等待：
```bash
node ~/.claude/skills/zero-copy-visual-bridge/scripts/receiver.js
```
启动后告诉用户「接收端已在后台运行，可以开始审稿了」。

用户**不需要**自己开终端运行，这一步由 Claude 代劳。

---

### Step 2：安装 Chrome 插件（推荐）

1. 打开 `chrome://extensions/`
2. 右上角开启「开发者模式」
3. 点「加载已解压的扩展程序」，选择目录：
   ```
   ~/.claude/skills/zero-copy-visual-bridge/extension/
   ```
4. 插件加载后，点插件图标旁的「详情」→ 勾选「**允许访问文件网址**」

> **备用方案（Console 注入）**：如果不想装插件，打开 HTML 文件后按 F12 → Console，运行：
> ```js
> fetch('').then() // 不行，需要粘贴 inject.js 全文
> ```
> 将 `~/.claude/skills/zero-copy-visual-bridge/extension/inject.js` 全部内容复制粘贴到 Console 回车。

---

### Step 3：使用审稿工具

1. 用 Chrome 打开要审稿的 HTML 文件（直接双击或拖进浏览器）
2. 点击工具栏里的 **Visual Feedback** 插件图标
3. 弹窗里点「▶ 开始审稿」
4. 页面右上角出现控制面板

**操作方式：**
- **编辑文案**：鼠标悬停高亮（蓝框），点击文字即可直接编辑，点别处保存
- **添加备注**：切换到「📌 备注模式」，点击任意元素 → 贴出黄色便利贴，写下意见
- 便利贴可以拖动，点 × 删除
- 全部完成后点「**💾 保存反馈**」→ 看到绿色 toast 提示即成功
5. 告诉 Claude：「反馈好了」

---

## 场景 B：用户说「反馈好了」→ 自动应用修改

按顺序执行：

### 1. 找到反馈文件

在当前工作目录查找 `.design_feedback.json`。不存在则询问用户项目路径。

### 2. 解析数据结构

```json
{
  "sessions": [
    {
      "timestamp": "2026-06-01T...",
      "source_url": "file:///Users/lexie/project/index.html",
      "changes": [
        { "type": "text_edit", "selector": "h1.hero", "original": "旧文案", "modified": "新文案" },
        { "type": "annotation", "selector": ".cta-btn", "note": "颜色太浅" }
      ]
    }
  ]
}
```

### 3. 定位 HTML 源文件

从 `source_url` 提取路径：`file:///Users/lexie/project/index.html` → `/Users/lexie/project/index.html`

**多文件过滤规则**：如果 sessions 里存在多个不同 `source_url`：
- 如果当前 agent 明确正在处理某个 HTML 文件，只取该文件的 sessions（匹配路径）
- 否则默认取**时间戳最新**的 session 对应的文件，并告知用户：「检测到多个文件的反馈，已选取最新一条（`<文件名>`），如需处理其他文件请告诉我。」

### 4. 应用 text_edit

- 用 Read 工具读取 HTML 文件
- 按 selector 定位元素，替换文本内容
- 同一 selector 多个 session 都有修改时，**以最新 session 为准**
- 用 Edit 工具写回

### 5. 处理 annotation

annotation **不自动应用**（因为涉及设计决策）。将所有备注汇总展示：
```
📌 需要处理的备注：
  1. [.cta-btn] → 颜色太浅
  2. [.hero-section] → 间距太大，移动端会被截断
```
问用户：「这些备注你希望我怎么处理？」

### 6. 完成汇报

格式：
```
✅ 已自动应用的文案修改（X 处）：
  · h1.hero: "旧文案" → "新文案"
  · ...

📌 需要你决策的备注（Y 条）：
  · ...

❌ 无法匹配的 selector（Z 个，可能页面结构已变）：
  · ...
```

**不要删除 `.design_feedback.json`**，历史反馈累积保留。

### 7. 关闭接收端

汇报完成后，用 Bash 工具停掉后台 receiver：
```bash
pkill -f "zero-copy-visual-bridge/scripts/receiver.js"
```
告诉用户「接收端已关闭」。
