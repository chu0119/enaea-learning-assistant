# ENAEA Learning Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-✓-green.svg)](https://www.tampermonkey.net/)
[![GitHub Stars](https://img.shields.io/github/stars/chu0119/enaea-learning-assistant.svg)](https://github.com/chu0119/enaea-learning-assistant/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/chu0119/enaea-learning-assistant.svg)](https://github.com/chu0119/enaea-learning-assistant/issues)
[![GitHub Forks](https://img.shields.io/github/forks/chu0119/enaea-learning-assistant.svg)](https://github.com/chu0119/enaea-learning-assistant/network/members)

一款专为在线学习平台设计的浏览器辅助工具，帮助用户优化学习体验，提升课程学习效率。

## 📦 项目地址

- **GitHub**: https://github.com/chu0119/enaea-learning-assistant
- **Greasy Fork**: https://greasyfork.org/scripts/XXXXX (待发布)

> 📌 **安装提示**：推荐从 Greasy Fork 安装，可自动更新。

## 功能特性

### 🎬 视频学习优化
- **智能播放控制**：自动调节播放速度，支持多倍速学习
- **音频管理**：智能静音功能，避免打扰他人
- **断点续播**：自动恢复播放状态，无需手动操作

### 📚 课程进度管理
- **自动导航**：智能识别未完成课程，自动跳转学习
- **进度追踪**：实时记录学习进度，避免重复学习
- **模块化管理**：按章节组织学习内容，有序完成学习任务

### 🔔 弹窗智能处理
- **自动确认**：智能识别并处理系统提示弹窗
- **无干扰学习**：减少手动操作，专注学习内容

## 安装使用

### 前置要求

- 浏览器：Chrome / Firefox / Edge / Safari
- 插件：[Tampermonkey](https://www.tampermonkey.net/) 或 [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)

### 方法一：从 Greasy Fork 安装（推荐）

1. 访问 [Greasy Fork](https://greasyfork.org/scripts/XXXXX)
2. 点击 "安装此脚本"
3. 确认安装即可

> 💡 **提示**：Greasy Fork 是最安全的安装方式，脚本会自动更新。

### 方法二：从 GitHub 安装

1. 访问 [GitHub 仓库](https://github.com/chu0119/enaea-learning-assistant)
2. 点击 `enaea-auto-player.js` 文件
3. 点击 "Raw" 按钮查看原始代码
4. 复制全部代码

### 方法三：手动安装

1. 安装 Tampermonkey 浏览器插件
   - Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - Edge: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. 点击 Tampermonkey 图标，选择 "添加新脚本"

3. 将 `enaea-auto-player.js` 的内容粘贴到编辑器中

4. 按 `Ctrl + S` 保存脚本

> ⚠️ **注意**：手动安装的脚本不会自动更新，需要手动下载最新版本。

### 使用方法

1. 登录在线学习平台 (study.enaea.edu.cn)
2. 进入课程列表或课程详情页面
3. 脚本将自动运行，无需额外操作
4. 脚本图标会在工具栏显示，表示已激活

### 功能说明

| 页面类型 | 自动执行的操作 |
|---------|---------------|
| 课程列表页 | 自动点击"进入学习"按钮 |
| 课程首页 | 自动选择未完成的课程模块 |
| 课程详情页 | 自动找到并打开未完成的课程 |
| 视频播放页 | 自动播放、调节速度、处理弹窗 |

## 配置说明

### 默认配置

| 配置项 | 默认值 | 说明 |
|-------|--------|------|
| `speed` | 4 | 视频播放速度（倍速） |
| `autoMute` | true | 是否自动静音 |
| `checkInterval` | 3000 | 检查间隔（毫秒） |
| `debug` | true | 是否开启调试日志 |

### 自定义配置

在浏览器控制台中执行以下代码：

```javascript
// 调整播放速度（支持 0.5-16 倍速）
localStorage.setItem('enaea_speed', '2');

// 关闭自动静音
localStorage.setItem('enaea_auto_mute', 'false');

// 开启/关闭调试日志（默认开启）
// 在脚本代码中修改 CONFIG.debug 的值
```

### 配置生效

修改配置后，刷新页面即可生效。

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户脚本核心                          │
├─────────────────────────────────────────────────────────┤
│  页面检测模块  →  自动导航模块  →  视频控制模块          │
├─────────────────────────────────────────────────────────┤
│  状态管理模块  ←  弹窗处理模块  ←  进度追踪模块          │
└─────────────────────────────────────────────────────────┘
```

## 免责声明

### 重要提示

本工具仅供**个人学习研究**和**技术探索**使用。

### 使用须知

1. **合规使用**：请确保使用方式符合所在学习平台的使用条款和学术规范
2. **个人责任**：使用者需自行承担使用本工具产生的一切后果
3. **学习目的**：本工具旨在辅助学习，而非替代真实学习过程
4. **平台规则**：请尊重在线教育平台的规则和管理规定

### 法律声明

- 本工具不鼓励任何形式的学术不端行为
- 使用者应遵守相关法律法规及平台服务协议
- 本工具开发者不对因使用本工具产生的任何问题负责

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 如何贡献

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发指南

请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细的开发指南。

### 发布到 Greasy Fork

请查看 [PUBLISHING.md](PUBLISHING.md) 了解如何将脚本发布到 Greasy Fork。

### 问题反馈

- **Bug 报告**: 使用 [Bug Report](https://github.com/chu0119/enaea-learning-assistant/issues/new?template=bug_report.md) 模板
- **功能建议**: 使用 [Feature Request](https://github.com/chu0119/enaea-learning-assistant/issues/new?template=feature_request.md) 模板
- **问题咨询**: 使用 [Question](https://github.com/chu0119/enaea-learning-assistant/issues/new?template=question.md) 模板

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 更新日志

### v9.0
- 全新的模块化架构设计
- 优化课程导航逻辑
- 增强弹窗处理能力
- 改进状态管理系统

---

**请注意**：请合理使用本工具，确保学习的真实性和有效性。

## 📢 免责声明

本工具仅供学习和技术研究使用。使用本工具即表示您同意：
- 遵守所在学习平台的使用条款
- 承担使用本工具产生的一切后果
- 不将本工具用于任何违规或不道德的目的
