# Greasy Fork 发布完整指南

本指南将帮助你将 ENAEA Learning Assistant 发布到 Greasy Fork。

## 📋 发布前准备

### 1. 注册 Greasy Fork 账号

1. 访问 https://greasyfork.org/
2. 点击右上角的 "注册"
3. 选择注册方式（GitHub、Google 等）
4. 完成账号验证

### 2. 确保脚本符合要求

根据 Greasy Fork 的规则：

✅ **必须满足**：
- 脚本功能描述准确
- 代码清晰可读，不得压缩
- 尊重版权
- 外部代码必须有许可证

❌ **禁止**：
- 混淆或压缩代码
- 侵犯他人版权
- 使用无许可证的外部代码

## 🚀 发布步骤

### 步骤 1：登录并创建新脚本

1. 访问 https://greasyfork.org/
2. 点击右上角的 "登录"
3. 使用你的账号登录
4. 点击右上角的用户名
5. 选择 "发布脚本"
6. 选择 "从头开始编写"

### 步骤 2：填写脚本信息

#### 基本信息

- **名称**: `ENAEA Learning Assistant`
- **描述**: `Online learning platform assistant - streamlines course navigation and video playback`
- **脚本类型**: 选择 "公开用户脚本"
- **脚本语言**: 选择 "中文（简体）"

#### 代码

1. 打开 `enaea-auto-player.js` 文件
2. 复制全部内容
3. 粘贴到 Greasy Fork 的代码编辑器中

#### 附加信息

```markdown
## ENAEA Learning Assistant

一款专为在线学习平台设计的浏览器辅助工具，帮助用户优化学习体验，提升课程学习效率。

### 功能特性

- **智能播放控制**：自动调节播放速度，支持多倍速学习
- **音频管理**：智能静音功能，避免打扰他人
- **断点续播**：自动恢复播放状态，无需手动操作
- **自动导航**：智能识别未完成课程，自动跳转学习
- **进度追踪**：实时记录学习进度，避免重复学习
- **弹窗处理**：智能识别并处理系统提示弹窗

### 安装说明

1. 安装 Tampermonkey 浏览器插件
2. 点击插件图标，选择"添加新脚本"
3. 将脚本内容粘贴到编辑器中
4. 保存脚本即可生效

### 使用方法

1. 登录在线学习平台 (study.enaea.edu.cn)
2. 进入课程列表或课程详情页面
3. 脚本将自动运行，无需额外操作

### 配置说明

在浏览器控制台中执行以下代码进行配置：

```javascript
// 调整播放速度（支持 0.5-16 倍速）
localStorage.setItem('enaea_speed', '2');

// 关闭自动静音
localStorage.setItem('enaea_auto_mute', 'false');
```

### 更新说明

脚本会自动从 GitHub 检查更新。

### 免责声明

本工具仅供学习和技术研究使用。使用本工具即表示您同意：
- 遵守所在学习平台的使用条款
- 承担使用本工具产生的一切后果
- 不将本工具用于任何违规或不道德的目的

### GitHub 仓库

https://github.com/chu0119/enaea-learning-assistant

### 许可证

MIT License
```

#### 成人内容

**不勾选** - 此脚本不包含成人内容

### 步骤 3：设置自动更新

1. 在脚本设置中找到 "更新 URL"
2. 填入: `https://raw.githubusercontent.com/chu0119/enaea-learning-assistant/master/enaea-auto-player.js`
3. 这样用户安装后会自动从 GitHub 获取更新

### 步骤 4：预览和发布

1. 点击 "预览" 查看脚本效果
2. 确认无误后点击 "发布"
3. 等待审核通过（通常需要 1-3 天）

## 📝 脚本元数据说明

确保脚本头部包含以下元数据：

```javascript
// ==UserScript==
// @name         ENAEA Learning Assistant
// @namespace    https://github.com/chu0119/enaea-learning-assistant
// @version      9.0
// @description  Online learning platform assistant - streamlines course navigation and video playback
// @author       Learning Tech
// @match        https://study.enaea.edu.cn/*
// @match        https://*.ttcdw.cn/*
// @match        https://*.ertcloud.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// @homepage     https://github.com/chu0119/enaea-learning-assistant
// @supportURL   https://github.com/chu0119/enaea-learning-assistant/issues
// ==/UserScript==
```

## ✅ 发布检查清单

发布前请确认：

- [ ] 脚本元数据完整
- [ ] `@match` 规则正确
- [ ] `@grant` 权限必要
- [ ] 代码无语法错误
- [ ] 功能测试正常
- [ ] 描述清晰准确
- [ ] 许可证正确（MIT）
- [ ] 更新 URL 设置正确
- [ ] 附加信息完整
- [ ] 图片（可选）已添加

## ⚠️ 注意事项

1. **审核时间**: Greasy Fork 审核通常需要 1-3 天
2. **合规性**: 确保脚本符合 Greasy Fork 的 policies
3. **更新机制**: 设置更新 URL 可以让用户自动获取更新
4. **版本管理**: 每次更新都要修改版本号

## 🔄 更新脚本

### 版本号规范

使用语义化版本号：
- **主版本号**: 重大更改（如 9.0 → 10.0）
- **次版本号**: 新功能（如 9.0 → 9.1）
- **修订号**: Bug 修复（如 9.0.0 → 9.0.1）

### 更新步骤

1. 修改脚本代码
2. 更新 `@version` 版本号
3. 提交到 GitHub
4. Greasy Fork 会自动检测更新（如果设置了更新 URL）
5. 或者手动在 Greasy Fork 更新脚本

## 📞 联系支持

如果遇到问题：

1. 查看 [Greasy Fork 帮助](https://greasyfork.org/help)
2. 提交 [GitHub Issue](https://github.com/chu0119/enaea-learning-assistant/issues)
3. 联系 Greasy Fork 管理员

## 🎉 发布成功

发布成功后：

1. 脚本页面会显示在 Greasy Fork
2. 用户可以搜索并安装
3. 可以分享链接给其他人
4. 可以在 README 中添加 Greasy Fork 链接

---

**祝你发布顺利！** 🚀
