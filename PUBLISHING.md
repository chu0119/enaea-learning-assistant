# 发布到 Greasy Fork

本指南将帮助你将 ENAEA Learning Assistant 发布到 Greasy Fork。

## 📋 发布前准备

### 1. 注册 Greasy Fork 账号

1. 访问 https://greasyfork.org/
2. 点击右上角的 "注册"
3. 选择注册方式（GitHub、Google 等）
4. 完成账号验证

### 2. 准备脚本元数据

确保脚本文件头部包含以下元数据：

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

## 🚀 发布步骤

### 步骤 1：登录 Greasy Fork

1. 访问 https://greasyfork.org/
2. 点击右上角的 "登录"
3. 使用你的账号登录

### 步骤 2：创建新脚本

1. 点击右上角的用户名
2. 选择 "发布脚本"
3. 选择 "从头开始编写"

### 步骤 3：填写脚本信息

#### 基本信息

- **名称**: `ENAEA Learning Assistant`
- **描述**: `Online learning platform assistant - streamlines course navigation and video playback`
- **分类**: 选择 "教育" 或 "工具"
- **许可证**: MIT

#### 代码

1. 打开 `enaea-auto-player.js` 文件
2. 复制全部内容
3. 粘贴到 Greasy Fork 的代码编辑器中

#### 额外信息

- **主页**: `https://github.com/chu0119/enaea-learning-assistant`
- **支持页面**: `https://github.com/chu0119/enaea-learning-assistant/issues`
- **更新 URL**: `https://raw.githubusercontent.com/chu0119/enaea-learning-assistant/master/enaea-auto-player.js`

### 步骤 4：设置自动更新

1. 在脚本设置中找到 "更新 URL"
2. 填入: `https://raw.githubusercontent.com/chu0119/enaea-learning-assistant/master/enaea-auto-player.js`
3. 这样用户安装后会自动从 GitHub 获取更新

### 步骤 5：预览和发布

1. 点击 "预览" 查看脚本效果
2. 确认无误后点击 "发布"
3. 等待审核通过（通常需要 1-3 天）

## 📝 脚本元数据说明

```javascript
// ==UserScript==
// @name         ENAEA Learning Assistant          // 脚本名称
// @namespace    https://github.com/...             // 命名空间（唯一标识）
// @version      9.0                                // 版本号
// @description  ...                                // 脚本描述
// @author       Learning Tech                      // 作者
// @match        https://study.enaea.edu.cn/*       // 匹配的网站
// @match        https://*.ttcdw.cn/*               // 匹配的网站
// @match        https://*.ertcloud.net/*           // 匹配的网站
// @grant        GM_getValue                        // 需要的权限
// @run-at       document-idle                      // 运行时机
// @license      MIT                                // 许可证
// @homepage     https://github.com/...             // 主页
// @supportURL   https://github.com/.../issues      // 支持页面
// ==/UserScript==
```

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

## ⚠️ 注意事项

1. **审核时间**: Greasy Fork 审核通常需要 1-3 天
2. **合规性**: 确保脚本符合 Greasy Fork 的 policies
3. **更新机制**: 设置更新 URL 可以让用户自动获取更新
4. **版本管理**: 每次更新都要修改版本号

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
