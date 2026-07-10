# Greasy Fork 快速发布指南

## 🚀 快速开始

### 步骤 1：注册账号

1. 访问 https://greasyfork.org/
2. 点击 "注册"
3. 使用 GitHub 账号登录

### 步骤 2：创建脚本

1. 点击右上角用户名 → "发布脚本"
2. 选择 "从头开始编写"

### 步骤 3：填写表单

| 字段 | 内容 |
|------|------|
| **名称** | `ENAEA Learning Assistant` |
| **描述** | `Online learning platform assistant - streamlines course navigation and video playback` |
| **类型** | 公开用户脚本 |
| **语言** | 中文（简体） |
| **成人内容** | 不勾选 |

### 步骤 4：粘贴代码

将 `enaea-auto-player.js` 的完整内容粘贴到代码编辑器中。

### 步骤 5：填写附加信息

复制以下内容到附加信息框：

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

### 步骤 6：发布

点击 "发布脚本" 按钮。

## ⚠️ 注意事项

1. 审核时间：1-3 天
2. 确保代码格式正确
3. 确保描述准确
4. 确保附加信息完整

## 📞 有问题？

查看详细指南：[GREASYFORK_SUBMISSION_GUIDE.md](GREASYFORK_SUBMISSION_GUIDE.md)
