# Greasy Fork 发布表单填写指南

本指南将帮助你正确填写 Greasy Fork 的发布表单。

## 📋 表单填写说明

### 1. 脚本名称

**填写内容**: `ENAEA Learning Assistant`

**说明**: 使用英文名称，简洁明了。

### 2. 脚本描述

**填写内容**: `Online learning platform assistant - streamlines course navigation and video playback`

**说明**: 使用英文描述，准确反映脚本功能。

### 3. 脚本类型

**选择**: `公开用户脚本`

**说明**: 任何人都可以查看和使用。

### 4. 代码

**操作**: 将 `enaea-auto-player.js` 的完整内容粘贴到代码编辑器中

**注意事项**:
- 确保代码格式正确
- 不要压缩或混淆代码
- 确保所有功能都正常

### 5. 附加信息

**填写内容**:

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

### 6. 成人内容

**选择**: 不勾选

**说明**: 此脚本不包含成人内容。

### 7. 脚本语言

**选择**: `中文（简体）`

**说明**: 脚本描述和附加信息使用中文。

## 📝 填写示例

### 表单截图说明

```
脚本名称: ENAEA Learning Assistant
脚本描述: Online learning platform assistant - streamlines course navigation and video playback
脚本类型: ○ 公开用户脚本  ○ Unlisted user script  ○ 库
代码: [粘贴 enaea-auto-player.js 的完整内容]
附加信息: [粘贴上述附加信息内容]
成人内容: □ 此脚本包含成人内容
脚本语言: ○ 中文（简体）  ○ English  ○ 其他
```

## ⚠️ 注意事项

1. **代码格式**: 确保代码格式正确，没有语法错误
2. **描述准确**: 描述要准确反映脚本功能
3. **附加信息**: 附加信息要完整，包括安装说明、使用方法、配置说明等
4. **图片**: 可以添加最多5张图片展示功能
5. **审核**: 发布后需要等待审核通过（通常1-3天）

## 🔄 发布后

发布成功后：

1. 脚本页面会显示在 Greasy Fork
2. 用户可以搜索并安装
3. 可以分享链接给其他人
4. 更新 README 中的 Greasy Fork 链接

## 📞 联系支持

如果遇到问题：

1. 查看 [Greasy Fork 帮助](https://greasyfork.org/help)
2. 提交 [GitHub Issue](https://github.com/chu0119/enaea-learning-assistant/issues)
3. 联系 Greasy Fork 管理员

---

**准备好发布了吗？** 🚀
