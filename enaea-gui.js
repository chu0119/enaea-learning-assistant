// ==UserScript==
// @name         ENAEA Learning Assistant (GUI版)
// @namespace    https://github.com/chu0119/enaea-learning-assistant
// @version      9.1
// @description  Online learning platform assistant with GUI panel - streamlines course navigation and video playback
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

/**
 * ENAEA Learning Assistant (GUI版)
 *
 * 本工具旨在优化在线学习体验，提供视频播放控制和课程导航辅助功能。
 * 包含图形化控制面板，提供更便捷的操作体验。
 *
 * @version 9.1
 * @license MIT
 */

(function() {
    'use strict';

    // 只在主域名运行
    if (!window.location.hostname.includes('enaea.edu.cn')) {
        handleIframeVideo();
        return;
    }

    // ==================== 配置 ====================
    const CONFIG = {
        speed: parseInt(localStorage.getItem('enaea_speed')) || 4,
        autoMute: localStorage.getItem('enaea_auto_mute') !== 'false',
        checkInterval: 3000,
        debug: true
    };

    // ==================== 工具函数 ====================
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const log = (msg, type = 'info') => {
        if (!CONFIG.debug && type === 'debug') return;
        const prefix = { 'info': '📌', 'success': '✅', 'action': '🎯', 'error': '❌', 'warning': '⚠️', 'debug': '🔍' };
        console.log(`${prefix[type] || '📌'} [ENAEA v9] ${msg}`);
    };

    // ==================== 状态管理 ====================
    const State = {
        get(key) {
            try { return localStorage.getItem('enaea_' + key); } catch(e) { return null; }
        },
        set(key, val) {
            try { localStorage.setItem('enaea_' + key, val); } catch(e) {}
        },
        getJSON(key) {
            try { return JSON.parse(this.get(key) || '[]'); } catch(e) { return []; }
        },
        setJSON(key, val) {
            try { this.set(key, JSON.stringify(val)); } catch(e) {}
        },
        remove(key) {
            try { localStorage.removeItem('enaea_' + key); } catch(e) {}
        }
    };

    // ==================== iframe视频处理 ====================
    function handleIframeVideo() {
        document.querySelectorAll('video').forEach(video => {
            if (video.playbackRate !== CONFIG.speed) video.playbackRate = CONFIG.speed;
            if (!video.muted) { video.muted = true; video.volume = 0; }
            if (video.paused && video.readyState >= 2) {
                video.play().catch(() => {});
            }
        });
    }

    // ==================== 页面类型检测 ====================
    function detectPage() {
        const url = window.location.href;
        if (url.includes('viewerforccvideo.do')) return 'videoPlayer';
        if (url.includes('toNewMyClass') && url.includes('type=course')) return 'courseDetail';
        if (url.includes('toCircleIndex')) return 'courseIndex';
        if (url.includes('showCourseList') || url.includes('toMyProject')) return 'courseList';
        return 'unknown';
    }

    // ==================== 弹窗处理模块 ====================
    const Dialog = {
        handle() {
            // 方式1: 休息提醒弹窗 (20分钟提醒)
            const btn1 = document.querySelector('.dialog-button-container button');
            if (btn1 && (btn1.textContent.includes('继续学习') || btn1.textContent.includes('知道了'))) {
                log(`点击弹窗按钮: ${btn1.textContent.trim()}`, 'action');
                btn1.click();
                return true;
            }

            // 方式2: dialog-box 内的按钮
            const dialogBox = document.querySelector('.dialog-box');
            if (dialogBox) {
                const btn = dialogBox.querySelector('button');
                if (btn) {
                    log(`点击dialog-box按钮: ${btn.textContent.trim()}`, 'action');
                    btn.click();
                    return true;
                }
            }

            // 方式3: iframe中的弹窗
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc) {
                        const btn = doc.querySelector('.dialog-button-container button, .dialog-box button');
                        if (btn && (btn.textContent.includes('继续学习') || btn.textContent.includes('知道了'))) {
                            log(`点击iframe弹窗按钮: ${btn.textContent.trim()}`, 'action');
                            btn.click();
                        }
                    }
                } catch(e) { /* 跨域 */ }
            });

            return false;
        }
    };

    // ==================== 视频播放控制模块 ====================
    const VideoPlayer = {
        setSpeed(video, speed) {
            if (video.playbackRate !== speed) video.playbackRate = speed;
        },

        mute(video) {
            if (!video.muted) { video.muted = true; video.volume = 0; }
        },

        play(video) {
            if (video.paused && video.readyState >= 2) {
                video.play().catch(() => {
                    video.muted = true;
                    video.play().catch(() => {});
                });
            }
        },

        controlAll() {
            document.querySelectorAll('video').forEach(video => {
                this.setSpeed(video, CONFIG.speed);
                this.mute(video);
                this.play(video);
            });
            // iframe中的视频
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc) {
                        doc.querySelectorAll('video').forEach(video => {
                            this.setSpeed(video, CONFIG.speed);
                            this.mute(video);
                            this.play(video);
                        });
                    }
                } catch(e) {}
            });
        },

        isCompleted(video) {
            if (video.ended) return true;
            if (video.duration > 0 && video.currentTime >= video.duration - 1) return true;
            const replay = document.querySelector('.xgplayer-replay');
            if (replay && replay.offsetParent !== null) return true;
            return false;
        },

        isProgress100() {
            const active = document.querySelector('li.cvtb-MCK-course-content.current');
            if (!active) return false;
            const progress = active.querySelector('.cvtb-MCK-CsCt-studyProgress');
            return progress?.textContent?.trim() === '100%';
        },

        getProgressItems() {
            const items = [];
            // 视频播放页的进度元素
            document.querySelectorAll('.cvtb-MCK-CsCt-studyProgress').forEach(el => {
                const match = el.textContent.trim().match(/^(\d{1,3})%$/);
                if (match) {
                    const li = el.closest('li');
                    items.push({
                        el,
                        progress: parseInt(match[1]),
                        title: li?.querySelector('.cvtb-MCK-CsCt-title')?.textContent?.trim(),
                        isActive: li?.className?.includes('current'),
                        dataId: li?.getAttribute('data-id')
                    });
                }
            });
            return items;
        },

        getFirstUnfinished() {
            const items = this.getProgressItems();
            for (const item of items) {
                if (item.progress < 100) return item;
            }
            return null;
        },

        allCompleted() {
            const items = this.getProgressItems();
            return items.length > 0 && items.every(i => i.progress === 100);
        }
    };

    // ==================== 课程详情页模块 ====================
    const CourseDetail = {
        init() {
            log('检测到课程详情页面');

            // 保存syllabusId和circleId
            const urlParams = new URLSearchParams(window.location.search);
            const syllabusId = urlParams.get('syllabusId');
            const circleId = urlParams.get('circleId');
            if (syllabusId) State.set('current_syllabusId', syllabusId);
            if (circleId) State.set('current_circleId', circleId);

            log(`syllabusId=${syllabusId}, circleId=${circleId}`, 'debug');

            // 等待页面加载后查找未完成课程
            setTimeout(() => this.findAndClickUnfinished(), 2000);
        },

        findAndClickUnfinished() {
            log('查找未完成课程...');

            const rows = document.querySelectorAll('table tbody tr');
            for (const row of rows) {
                const progressEl = row.querySelector('p.progressvalue');
                if (!progressEl) continue;

                const match = progressEl.textContent.trim().match(/(\d{1,3})%/);
                if (!match) continue;

                const progress = parseInt(match[1]);
                if (progress >= 100) continue;

                // 找到未完成课程
                const golearnBtn = row.querySelector('a.golearn');
                if (golearnBtn) {
                    const vurl = golearnBtn.getAttribute('data-vurl');
                    const title = row.querySelector('.course-title')?.textContent?.trim();
                    if (vurl) {
                        log(`点击未完成课程(${progress}%): ${title?.substring(0, 30)}`, 'action');
                        window.location.href = vurl;
                        return true;
                    }
                }
            }

            // 所有课程完成，标记模块完成并跳转
            log('当前模块所有课程已完成', 'success');
            this.markModuleComplete();
            setTimeout(() => CourseIndex.init(), 1000);
            return false;
        },

        markModuleComplete() {
            const syllabusId = State.get('current_syllabusId');
            if (syllabusId) {
                const completed = State.getJSON('completed_modules');
                if (!completed.includes(syllabusId)) {
                    completed.push(syllabusId);
                    State.setJSON('completed_modules', completed);
                    log(`标记模块完成: ${syllabusId}`, 'action');
                }
            }
        }
    };

    // ==================== 课程首页模块 ====================
    const CourseIndex = {
        init() {
            log('检测到课程首页');

            const completedModules = State.getJSON('completed_modules');
            log(`已完成模块: ${completedModules.length}个`, 'debug');

            // 查找所有课程模块链接
            const links = document.querySelectorAll('a[href*="toNewMyClass"][href*="type=course"]');
            const uniqueLinks = [];
            links.forEach(link => {
                try {
                    const url = new URL(link.href);
                    const sid = url.searchParams.get('syllabusId');
                    if (sid && !uniqueLinks.some(l => l.syllabusId === sid)) {
                        uniqueLinks.push({ el: link, syllabusId: sid, href: link.href });
                    }
                } catch(e) {}
            });

            log(`找到 ${uniqueLinks.length} 个课程模块`, 'debug');

            // 找第一个未完成的模块
            for (const item of uniqueLinks) {
                if (!completedModules.includes(item.syllabusId)) {
                    log(`选择未完成模块: ${item.syllabusId}`, 'action');
                    State.set('current_syllabusId', item.syllabusId);
                    window.location.href = item.href;
                    return true;
                }
            }

            // 所有模块完成
            log('所有模块已完成！', 'success');
            return false;
        }
    };

    // ==================== 课程列表页模块 ====================
    const CourseList = {
        init() {
            log('检测到课程列表页面');
            setTimeout(() => this.findAndClickEnter(), 2000);
        },

        findAndClickEnter() {
            // 方式1: a.intoStudy 按钮
            const btn = document.querySelector('a.button.intoStudy, a.intoStudy');
            if (btn) {
                log('找到"进入学习"按钮', 'action');
                btn.click();
                return true;
            }

            // 方式2: circleIndexRedirect 链接
            const courseLinks = document.querySelectorAll('a[href*="circleIndexRedirect"]');
            if (courseLinks.length > 0) {
                log('找到课程链接', 'action');
                window.location.href = courseLinks[0].href;
                return true;
            }

            log('未找到"进入学习"按钮', 'warning');
            return false;
        }
    };

    // ==================== 视频播放页模块 ====================
    const VideoPage = {
        init() {
            log('检测到视频播放页面');

            // 保存circleId
            const urlParams = new URLSearchParams(window.location.search);
            const circleId = urlParams.get('circleId');
            const courseId = urlParams.get('courseId');
            if (circleId) State.set('current_circleId', circleId);
            if (courseId) State.set('current_courseId', courseId);

            log(`circleId=${circleId}, courseId=${courseId}`, 'debug');

            // 检查所有视频是否已完成
            if (VideoPlayer.allCompleted()) {
                log('所有视频已完成，立即跳转', 'action');
                setTimeout(() => this.navigateBack(), 1000);
                return;
            }

            // 检查当前视频是否已完成，如果是则点击下一个
            this.tryClickNextUnfinished();

            // 启动主循环
            this.startLoop();
        },

        tryClickNextUnfinished() {
            const unfinished = VideoPlayer.getFirstUnfinished();
            if (unfinished) {
                log(`点击下一个未完成视频: ${unfinished.title?.substring(0, 30)} (${unfinished.progress}%)`, 'action');
                unfinished.el.closest('li')?.click();
                return true;
            }
            return false;
        },

        async startLoop() {
            log('启动视频播放主循环');

            while (true) {
                try {
                    // 处理弹窗
                    Dialog.handle();

                    // 控制视频播放
                    VideoPlayer.controlAll();

                    // 检查是否所有视频都完成了
                    if (VideoPlayer.allCompleted()) {
                        log('所有视频已完成', 'success');
                        this.navigateBack();
                        return;
                    }

                    // 检查当前视频是否完成（播放器状态）
                    const video = document.querySelector('video');
                    if (video && video.duration > 0) {
                        if (VideoPlayer.isCompleted(video)) {
                            log('当前视频播放完成，点击下一个', 'success');
                            if (!this.tryClickNextUnfinished()) {
                                // 没有下一个未完成的，所有都完成了
                                log('所有视频已完成', 'success');
                                this.navigateBack();
                                return;
                            }
                            await sleep(2000); // 等待页面切换
                        }
                    }

                } catch(e) {
                    log('主循环出错: ' + e.message, 'error');
                }

                await sleep(CONFIG.checkInterval);
            }
        },

        navigateBack() {
            const syllabusId = State.get('current_syllabusId');
            const circleId = State.get('current_circleId');

            // 标记当前课程为已完成
            this.markCourseComplete();

            if (syllabusId && circleId) {
                const url = `/circleIndexRedirect.do?action=toNewMyClass&type=course&circleId=${circleId}&syllabusId=${syllabusId}&isRequired=true&studentProgress=7`;
                log('跳转回课程详情页', 'action');
                window.location.href = url;
            } else {
                log('使用后退按钮', 'action');
                window.history.back();
            }
        },

        markCourseComplete() {
            const courseId = State.get('current_courseId');
            if (courseId) {
                const completed = State.getJSON('completed_courses');
                if (!completed.includes(courseId)) {
                    completed.push(courseId);
                    State.setJSON('completed_courses', completed);
                    log(`标记课程完成: ${courseId}`, 'action');
                }
            }
        }
    };

    // ==================== 主入口 ====================
    function init() {
        log('初始化脚本');

        const page = detectPage();
        log(`页面类型: ${page}`, 'debug');

        switch(page) {
            case 'courseList':
                CourseList.init();
                break;
            case 'courseIndex':
                CourseIndex.init();
                break;
            case 'courseDetail':
                CourseDetail.init();
                break;
            case 'videoPlayer':
                VideoPage.init();
                break;
            default:
                log('未知页面类型，等待跳转', 'info');
                break;
        }
    }

    // ==================== 启动 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500));
    } else {
        setTimeout(init, 1500);
    }

    log('ENAEA Learning Assistant (GUI版) v9.1 已启动！', 'success');
    log('功能: 视频播放优化 | 智能导航 | 弹窗处理 | 进度追踪 | 图形化控制面板', 'info');

    // ==================== GUI 样式 ====================
    const GUI_STYLES = `
        :root {
            --primary-color: #4A90D9;
            --primary-hover: #357ABD;
            --bg-color: #FFFFFF;
            --bg-secondary: #F5F7FA;
            --bg-tertiary: #EDF2F7;
            --text-color: #2D3748;
            --text-secondary: #718096;
            --text-light: #A0AEC0;
            --success-color: #48BB78;
            --warning-color: #ED8936;
            --error-color: #F56565;
            --border-color: #E2E8F0;
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --radius-sm: 4px;
            --radius-md: 8px;
            --radius-lg: 12px;
            --spacing-xs: 4px;
            --spacing-sm: 8px;
            --spacing-md: 16px;
            --transition-fast: 150ms ease;
            --transition-normal: 200ms ease;
        }

        .enaea-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 380px;
            max-height: 80vh;
            background: var(--bg-color);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--border-color);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            font-size: 14px;
            color: var(--text-color);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s ease;
        }

        .enaea-panel.minimized {
            width: 200px;
            max-height: none;
        }

        .enaea-panel.hidden {
            display: none;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .enaea-panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-md);
            background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
            color: white;
            cursor: move;
            user-select: none;
        }

        .enaea-panel-title {
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        .enaea-panel-buttons {
            display: flex;
            gap: var(--spacing-xs);
        }

        .enaea-panel-btn {
            width: 24px;
            height: 24px;
            border: none;
            border-radius: var(--radius-sm);
            background: rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: background var(--transition-fast);
        }

        .enaea-panel-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .enaea-status-bar {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            font-size: 12px;
        }

        .enaea-status-indicator {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .enaea-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--success-color);
        }

        .enaea-status-dot.running {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .enaea-status-text {
            color: var(--text-secondary);
        }

        .enaea-panel-content {
            flex: 1;
            overflow-y: auto;
            padding: var(--spacing-md);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            max-height: 60vh;
        }

        .enaea-card {
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
        }

        .enaea-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--spacing-md);
        }

        .enaea-card-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        .enaea-video-controls {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
        }

        .enaea-control-buttons {
            display: flex;
            justify-content: center;
            gap: var(--spacing-sm);
        }

        .enaea-control-btn {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            background: var(--bg-secondary);
            color: var(--text-color);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all var(--transition-fast);
        }

        .enaea-control-btn:hover {
            background: var(--primary-color);
            color: white;
        }

        .enaea-control-btn.primary {
            width: 48px;
            height: 48px;
            background: var(--primary-color);
            color: white;
        }

        .enaea-control-btn.primary:hover {
            background: var(--primary-hover);
        }

        .enaea-speed-control {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        .enaea-speed-label {
            font-size: 12px;
            color: var(--text-secondary);
            min-width: 30px;
        }

        .enaea-speed-buttons {
            display: flex;
            gap: var(--spacing-xs);
        }

        .enaea-speed-btn {
            padding: var(--spacing-xs) var(--spacing-sm);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            background: var(--bg-color);
            color: var(--text-color);
            font-size: 12px;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .enaea-speed-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }

        .enaea-speed-btn.active {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
        }

        .enaea-volume-control {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        .enaea-volume-slider {
            flex: 1;
            height: 4px;
            -webkit-appearance: none;
            appearance: none;
            background: var(--border-color);
            border-radius: 2px;
            outline: none;
        }

        .enaea-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
        }

        .enaea-volume-value {
            font-size: 12px;
            color: var(--text-secondary);
            min-width: 35px;
            text-align: right;
        }

        .enaea-progress-section {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
        }

        .enaea-progress-bar-container {
            background: var(--bg-secondary);
            border-radius: var(--radius-sm);
            height: 8px;
            overflow: hidden;
        }

        .enaea-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--success-color));
            border-radius: var(--radius-sm);
            transition: width var(--transition-normal);
        }

        .enaea-progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .enaea-current-course {
            font-size: 13px;
            color: var(--text-color);
            margin-top: var(--spacing-sm);
        }

        .enaea-course-stats {
            display: flex;
            gap: var(--spacing-md);
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: var(--spacing-xs);
        }

        .enaea-module-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            max-height: 150px;
            overflow-y: auto;
        }

        .enaea-module-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm);
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: background var(--transition-fast);
        }

        .enaea-module-item:hover {
            background: var(--bg-secondary);
        }

        .enaea-module-icon.completed {
            color: var(--success-color);
        }

        .enaea-module-icon.pending {
            color: var(--text-light);
        }

        .enaea-module-name {
            flex: 1;
            font-size: 12px;
            color: var(--text-color);
        }

        .enaea-module-progress {
            font-size: 11px;
            color: var(--text-secondary);
        }

        .enaea-settings {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
        }

        .enaea-settings-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
        }

        .enaea-setting-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        .enaea-toggle {
            position: relative;
            width: 36px;
            height: 20px;
        }

        .enaea-toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .enaea-toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--border-color);
            transition: var(--transition-fast);
            border-radius: 10px;
        }

        .enaea-toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: var(--transition-fast);
            border-radius: 50%;
        }

        .enaea-toggle input:checked + .enaea-toggle-slider {
            background-color: var(--primary-color);
        }

        .enaea-toggle input:checked + .enaea-toggle-slider:before {
            transform: translateX(16px);
        }

        .enaea-setting-label {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .enaea-select {
            padding: var(--spacing-xs) var(--spacing-sm);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            background: var(--bg-color);
            color: var(--text-color);
            font-size: 12px;
            cursor: pointer;
        }

        .enaea-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
        }

        .enaea-action-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-sm) var(--spacing-md);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            background: var(--bg-color);
            color: var(--text-color);
            font-size: 12px;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .enaea-action-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }

        .enaea-action-btn.danger:hover {
            border-color: var(--error-color);
            color: var(--error-color);
        }

        .enaea-log-section {
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            overflow: hidden;
        }

        .enaea-log-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
        }

        .enaea-log-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-color);
        }

        .enaea-log-buttons {
            display: flex;
            gap: var(--spacing-xs);
        }

        .enaea-log-btn {
            padding: var(--spacing-xs) var(--spacing-sm);
            border: none;
            border-radius: var(--radius-sm);
            background: transparent;
            color: var(--text-secondary);
            font-size: 11px;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .enaea-log-btn:hover {
            background: var(--border-color);
            color: var(--text-color);
        }

        .enaea-log-content {
            height: 120px;
            overflow-y: auto;
            padding: var(--spacing-sm);
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 11px;
            line-height: 1.6;
        }

        .enaea-log-entry {
            display: flex;
            gap: var(--spacing-sm);
            padding: 2px 0;
        }

        .enaea-log-time {
            color: var(--text-light);
            white-space: nowrap;
        }

        .enaea-log-icon {
            white-space: nowrap;
        }

        .enaea-log-message {
            color: var(--text-color);
            word-break: break-all;
        }

        .enaea-log-entry.error .enaea-log-message {
            color: var(--error-color);
        }

        .enaea-log-entry.warning .enaea-log-message {
            color: var(--warning-color);
        }

        .enaea-log-entry.success .enaea-log-message {
            color: var(--success-color);
        }

        .enaea-empty-state {
            text-align: center;
            padding: var(--spacing-md);
            color: var(--text-light);
            font-size: 12px;
        }

        .enaea-panel-content::-webkit-scrollbar,
        .enaea-log-content::-webkit-scrollbar,
        .enaea-module-list::-webkit-scrollbar {
            width: 6px;
        }

        .enaea-panel-content::-webkit-scrollbar-track,
        .enaea-log-content::-webkit-scrollbar-track,
        .enaea-module-list::-webkit-scrollbar-track {
            background: transparent;
        }

        .enaea-panel-content::-webkit-scrollbar-thumb,
        .enaea-log-content::-webkit-scrollbar-thumb,
        .enaea-module-list::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }

        @media (max-width: 480px) {
            .enaea-panel {
                width: calc(100% - 20px);
                right: 10px;
                top: 10px;
            }
        }
    `;

    // ==================== GUI 脚本 ====================
    const GUI_SCRIPT = `
        (function() {
            'use strict';

            const GUI_CONFIG = {
                storagePrefix: 'enaea_gui_',
                maxLogs: 100
            };

            const GUIState = {
                panel: null,
                isMinimized: false,
                isDragging: false,
                dragOffset: { x: 0, y: 0 },
                logs: [],
                updateInterval: null
            };

            const Storage = {
                get(key, defaultValue = null) {
                    try {
                        const value = localStorage.getItem(GUI_CONFIG.storagePrefix + key);
                        return value !== null ? JSON.parse(value) : defaultValue;
                    } catch(e) { return defaultValue; }
                },
                set(key, value) {
                    try {
                        localStorage.setItem(GUI_CONFIG.storagePrefix + key, JSON.stringify(value));
                    } catch(e) {}
                }
            };

            function getCurrentSettings() {
                return {
                    speed: parseInt(localStorage.getItem('enaea_speed')) || 4,
                    autoMute: localStorage.getItem('enaea_auto_mute') !== 'false',
                    autoPlay: Storage.get('auto_play', true),
                    dialogHandler: Storage.get('dialog_handler', true),
                    debug: true,
                    checkInterval: Storage.get('check_interval', 3)
                };
            }

            function saveSettings(settings) {
                if (settings.speed !== undefined) localStorage.setItem('enaea_speed', settings.speed);
                if (settings.autoMute !== undefined) localStorage.setItem('enaea_auto_mute', settings.autoMute);
                if (settings.autoPlay !== undefined) Storage.set('auto_play', settings.autoPlay);
                if (settings.dialogHandler !== undefined) Storage.set('dialog_handler', settings.dialogHandler);
                if (settings.checkInterval !== undefined) {
                    Storage.set('check_interval', settings.checkInterval);
                }
            }

            function addLog(msg, type = 'info') {
                const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
                const icons = { 'info': '📌', 'success': '✅', 'action': '🎯', 'error': '❌', 'warning': '⚠️' };
                GUIState.logs.unshift({ time: timestamp, type, icon: icons[type] || '📌', message: msg });
                if (GUIState.logs.length > GUI_CONFIG.maxLogs) GUIState.logs.pop();
                updateLogDisplay();
            }

            function updateLogDisplay() {
                const logContent = document.getElementById('enaea-log-content');
                if (!logContent) return;

                // 清空日志内容
                while (logContent.firstChild) {
                    logContent.removeChild(logContent.firstChild);
                }

                GUIState.logs.slice(0, 30).forEach(entry => {
                    const div = document.createElement('div');
                    div.className = 'enaea-log-entry ' + entry.type;

                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'enaea-log-time';
                    timeSpan.textContent = entry.time;

                    const iconSpan = document.createElement('span');
                    iconSpan.className = 'enaea-log-icon';
                    iconSpan.textContent = entry.icon;

                    const msgSpan = document.createElement('span');
                    msgSpan.className = 'enaea-log-message';
                    msgSpan.textContent = entry.message;

                    div.appendChild(timeSpan);
                    div.appendChild(iconSpan);
                    div.appendChild(msgSpan);
                    logContent.appendChild(div);
                });
            }

            function createPanel() {
                if (document.getElementById('enaea-panel')) return;

                const settings = getCurrentSettings();
                const panel = document.createElement('div');
                panel.id = 'enaea-panel';
                panel.className = 'enaea-panel';

                // 使用安全的 DOM 方法构建面板
                const header = document.createElement('div');
                header.className = 'enaea-panel-header';
                header.id = 'panel-header';

                const title = document.createElement('div');
                title.className = 'enaea-panel-title';
                const titleIcon = document.createElement('span');
                titleIcon.textContent = '📚';
                const titleText = document.createElement('span');
                titleText.textContent = 'ENAEA Assistant';
                title.appendChild(titleIcon);
                title.appendChild(titleText);

                const buttons = document.createElement('div');
                buttons.className = 'enaea-panel-buttons';
                const btnMinimize = document.createElement('button');
                btnMinimize.className = 'enaea-panel-btn';
                btnMinimize.id = 'btn-minimize';
                btnMinimize.title = '最小化';
                btnMinimize.textContent = '─';
                const btnClose = document.createElement('button');
                btnClose.className = 'enaea-panel-btn';
                btnClose.id = 'btn-close';
                btnClose.title = '隐藏';
                btnClose.textContent = '×';
                buttons.appendChild(btnMinimize);
                buttons.appendChild(btnClose);

                header.appendChild(title);
                header.appendChild(buttons);

                // 状态栏
                const statusBar = document.createElement('div');
                statusBar.className = 'enaea-status-bar';
                const statusIndicator = document.createElement('div');
                statusIndicator.className = 'enaea-status-indicator';
                const statusDot = document.createElement('span');
                statusDot.className = 'enaea-status-dot running';
                statusDot.id = 'status-dot';
                const statusText = document.createElement('span');
                statusText.id = 'status-text';
                statusText.textContent = '运行中';
                statusIndicator.appendChild(statusDot);
                statusIndicator.appendChild(statusText);
                const currentCourse = document.createElement('span');
                currentCourse.className = 'enaea-status-text';
                currentCourse.id = 'current-course';
                currentCourse.textContent = '-';
                statusBar.appendChild(statusIndicator);
                statusBar.appendChild(currentCourse);

                // 内容区域
                const content = document.createElement('div');
                content.className = 'enaea-panel-content';

                // 视频控制卡片
                const videoCard = document.createElement('div');
                videoCard.className = 'enaea-card';
                const videoCardHeader = document.createElement('div');
                videoCardHeader.className = 'enaea-card-header';
                const videoCardTitle = document.createElement('div');
                videoCardTitle.className = 'enaea-card-title';
                const videoIcon = document.createElement('span');
                videoIcon.textContent = '🎬';
                const videoTitleText = document.createElement('span');
                videoTitleText.textContent = '视频控制';
                videoCardTitle.appendChild(videoIcon);
                videoCardTitle.appendChild(videoTitleText);
                videoCardHeader.appendChild(videoCardTitle);
                videoCard.appendChild(videoCardHeader);

                const videoControls = document.createElement('div');
                videoControls.className = 'enaea-video-controls';

                const controlButtons = document.createElement('div');
                controlButtons.className = 'enaea-control-buttons';
                const btnPrev = document.createElement('button');
                btnPrev.className = 'enaea-control-btn';
                btnPrev.id = 'btn-prev';
                btnPrev.title = '上一个';
                btnPrev.textContent = '⏮';
                const btnPlay = document.createElement('button');
                btnPlay.className = 'enaea-control-btn primary';
                btnPlay.id = 'btn-play';
                btnPlay.title = '播放/暂停';
                btnPlay.textContent = '▶';
                const btnNext = document.createElement('button');
                btnNext.className = 'enaea-control-btn';
                btnNext.id = 'btn-next';
                btnNext.title = '下一个';
                btnNext.textContent = '⏭';
                controlButtons.appendChild(btnPrev);
                controlButtons.appendChild(btnPlay);
                controlButtons.appendChild(btnNext);

                const speedControl = document.createElement('div');
                speedControl.className = 'enaea-speed-control';
                const speedLabel = document.createElement('span');
                speedLabel.className = 'enaea-speed-label';
                speedLabel.textContent = '速度';
                const speedButtons = document.createElement('div');
                speedButtons.className = 'enaea-speed-buttons';
                [1, 2, 4].forEach(spd => {
                    const speedBtn = document.createElement('button');
                    speedBtn.className = 'enaea-speed-btn' + (settings.speed === spd ? ' active' : '');
                    speedBtn.dataset.speed = spd;
                    speedBtn.textContent = spd + 'x';
                    speedButtons.appendChild(speedBtn);
                });
                speedControl.appendChild(speedLabel);
                speedControl.appendChild(speedButtons);

                const volumeControl = document.createElement('div');
                volumeControl.className = 'enaea-volume-control';
                const volumeIcon = document.createElement('span');
                volumeIcon.id = 'volume-icon';
                volumeIcon.textContent = '🔊';
                const volumeSlider = document.createElement('input');
                volumeSlider.type = 'range';
                volumeSlider.className = 'enaea-volume-slider';
                volumeSlider.id = 'volume-slider';
                volumeSlider.min = '0';
                volumeSlider.max = '100';
                volumeSlider.value = settings.autoMute ? '0' : '100';
                const volumeValue = document.createElement('span');
                volumeValue.className = 'enaea-volume-value';
                volumeValue.id = 'volume-value';
                volumeValue.textContent = settings.autoMute ? '静音' : '100%';
                volumeControl.appendChild(volumeIcon);
                volumeControl.appendChild(volumeSlider);
                volumeControl.appendChild(volumeValue);

                // 添加进度条和时间显示
                const progressSection = document.createElement('div');
                progressSection.className = 'enaea-video-progress';

                const progressBar = document.createElement('div');
                progressBar.className = 'enaea-progress-bar-container';
                const progressFill = document.createElement('div');
                progressFill.className = 'enaea-progress-bar';
                progressFill.id = 'video-progress-fill';
                progressFill.style.width = '0%';
                progressBar.appendChild(progressFill);

                const progressInfo = document.createElement('div');
                progressInfo.className = 'enaea-progress-info';
                const currentTime = document.createElement('span');
                currentTime.id = 'video-current-time';
                currentTime.textContent = '0:00';
                const timeSeparator = document.createElement('span');
                timeSeparator.textContent = ' / ';
                const duration = document.createElement('span');
                duration.id = 'video-duration';
                duration.textContent = '0:00';
                progressInfo.appendChild(currentTime);
                progressInfo.appendChild(timeSeparator);
                progressInfo.appendChild(duration);

                progressSection.appendChild(progressBar);
                progressSection.appendChild(progressInfo);

                videoControls.appendChild(controlButtons);
                videoControls.appendChild(progressSection);
                videoControls.appendChild(speedControl);
                videoControls.appendChild(volumeControl);
                videoCard.appendChild(videoControls);
                content.appendChild(videoCard);

                // 设置卡片
                const settingsCard = document.createElement('div');
                settingsCard.className = 'enaea-card';
                const settingsCardHeader = document.createElement('div');
                settingsCardHeader.className = 'enaea-card-header';
                const settingsCardTitle = document.createElement('div');
                settingsCardTitle.className = 'enaea-card-title';
                const settingsIcon = document.createElement('span');
                settingsIcon.textContent = '⚙️';
                const settingsTitleText = document.createElement('span');
                settingsTitleText.textContent = '设置';
                settingsCardTitle.appendChild(settingsIcon);
                settingsCardTitle.appendChild(settingsTitleText);
                settingsCardHeader.appendChild(settingsCardTitle);
                settingsCard.appendChild(settingsCardHeader);

                const settingsDiv = document.createElement('div');
                settingsDiv.className = 'enaea-settings';
                const settingsRow = document.createElement('div');
                settingsRow.className = 'enaea-settings-row';

                const createToggle = (id, label, checked) => {
                    const item = document.createElement('div');
                    item.className = 'enaea-setting-item';
                    const toggleLabel = document.createElement('label');
                    toggleLabel.className = 'enaea-toggle';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = id;
                    checkbox.checked = checked;
                    const slider = document.createElement('span');
                    slider.className = 'enaea-toggle-slider';
                    toggleLabel.appendChild(checkbox);
                    toggleLabel.appendChild(slider);
                    const labelText = document.createElement('span');
                    labelText.className = 'enaea-setting-label';
                    labelText.textContent = label;
                    item.appendChild(toggleLabel);
                    item.appendChild(labelText);
                    return item;
                };

                settingsRow.appendChild(createToggle('setting-auto-mute', '自动静音', settings.autoMute));
                settingsRow.appendChild(createToggle('setting-dialog', '弹窗处理', settings.dialogHandler));
                settingsDiv.appendChild(settingsRow);
                settingsCard.appendChild(settingsDiv);
                content.appendChild(settingsCard);

                // 日志区域
                const logSection = document.createElement('div');
                logSection.className = 'enaea-log-section';
                const logHeader = document.createElement('div');
                logHeader.className = 'enaea-log-header';
                const logTitle = document.createElement('span');
                logTitle.className = 'enaea-log-title';
                logTitle.textContent = '日志';
                const logBtnClear = document.createElement('button');
                logBtnClear.className = 'enaea-log-btn';
                logBtnClear.id = 'btn-log-clear';
                logBtnClear.textContent = '清除';
                logHeader.appendChild(logTitle);
                logHeader.appendChild(logBtnClear);
                const logContent = document.createElement('div');
                logContent.className = 'enaea-log-content';
                logContent.id = 'enaea-log-content';
                const emptyState = document.createElement('div');
                emptyState.className = 'enaea-empty-state';
                emptyState.textContent = '暂无日志';
                logContent.appendChild(emptyState);
                logSection.appendChild(logHeader);
                logSection.appendChild(logContent);
                content.appendChild(logSection);

                // 组装面板
                panel.appendChild(header);
                panel.appendChild(statusBar);
                panel.appendChild(content);

                document.body.appendChild(panel);
                GUIState.panel = panel;

                initPanelEvents();
                updatePanelDisplay();
            }

            function initPanelEvents() {
                document.getElementById('btn-minimize').addEventListener('click', toggleMinimize);
                document.getElementById('btn-close').addEventListener('click', hidePanel);
                document.getElementById('btn-play').addEventListener('click', togglePlay);
                document.getElementById('btn-prev').addEventListener('click', prevVideo);
                document.getElementById('btn-next').addEventListener('click', nextVideo);

                document.querySelectorAll('.enaea-speed-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        setSpeed(parseInt(this.dataset.speed));
                    });
                });

                document.getElementById('volume-slider').addEventListener('input', function(e) {
                    setVolume(parseInt(e.target.value));
                });

                document.getElementById('setting-auto-mute').addEventListener('change', function(e) {
                    saveSettings({ autoMute: e.target.checked });
                    setVolume(e.target.checked ? 0 : 100);
                });

                document.getElementById('setting-dialog').addEventListener('change', function(e) {
                    saveSettings({ dialogHandler: e.target.checked });
                });

                document.getElementById('btn-log-clear').addEventListener('click', function() {
                    GUIState.logs = [];
                    updateLogDisplay();
                });

                const header = document.getElementById('panel-header');
                header.addEventListener('mousedown', startDrag);
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', endDrag);
            }

            function toggleMinimize() {
                GUIState.isMinimized = !GUIState.isMinimized;
                GUIState.panel.classList.toggle('minimized', GUIState.isMinimized);
                document.getElementById('btn-minimize').textContent = GUIState.isMinimized ? '□' : '─';
            }

            function hidePanel() {
                GUIState.panel.classList.add('hidden');
            }

            function startDrag(e) {
                if (e.target.closest('.enaea-panel-btn')) return;
                GUIState.isDragging = true;
                GUIState.dragOffset = { x: e.clientX - GUIState.panel.offsetLeft, y: e.clientY - GUIState.panel.offsetTop };
                GUIState.panel.style.transition = 'none';
            }

            function drag(e) {
                if (!GUIState.isDragging) return;
                e.preventDefault();
                let x = e.clientX - GUIState.dragOffset.x;
                let y = e.clientY - GUIState.dragOffset.y;
                x = Math.max(0, Math.min(x, window.innerWidth - GUIState.panel.offsetWidth));
                y = Math.max(0, Math.min(y, window.innerHeight - GUIState.panel.offsetHeight));
                GUIState.panel.style.left = x + 'px';
                GUIState.panel.style.top = y + 'px';
                GUIState.panel.style.right = 'auto';
            }

            function endDrag() {
                GUIState.isDragging = false;
                GUIState.panel.style.transition = '';
            }

            function togglePlay() {
                document.querySelectorAll('video').forEach(video => {
                    if (video.paused) video.play().catch(() => {});
                    else video.pause();
                });
                document.querySelectorAll('iframe').forEach(iframe => {
                    try {
                        const doc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (doc) doc.querySelectorAll('video').forEach(video => {
                            if (video.paused) video.play().catch(() => {});
                            else video.pause();
                        });
                    } catch(e) {}
                });
                updatePlayButton();
                addLog('切换播放状态', 'action');
            }

            function updatePlayButton() {
                const video = document.querySelector('video');
                const btn = document.getElementById('btn-play');
                if (video && !video.paused) {
                    btn.textContent = '⏸';
                    btn.title = '暂停';
                } else {
                    btn.textContent = '▶';
                    btn.title = '播放';
                }
            }

            function prevVideo() {
                addLog('切换到上一个视频', 'action');
            }

            function nextVideo() {
                addLog('切换到下一个视频', 'action');
            }

            function setSpeed(speed) {
                document.querySelectorAll('video').forEach(video => { video.playbackRate = speed; });
                document.querySelectorAll('iframe').forEach(iframe => {
                    try {
                        const doc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (doc) doc.querySelectorAll('video').forEach(video => { video.playbackRate = speed; });
                    } catch(e) {}
                });
                localStorage.setItem('enaea_speed', speed);
                document.querySelectorAll('.enaea-speed-btn').forEach(btn => {
                    btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
                });
                addLog('播放速度已设置为 ' + speed + 'x', 'action');
            }

            function setVolume(value) {
                const muted = value === 0;
                document.querySelectorAll('video').forEach(video => { video.muted = muted; video.volume = value / 100; });
                document.querySelectorAll('iframe').forEach(iframe => {
                    try {
                        const doc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (doc) doc.querySelectorAll('video').forEach(video => { video.muted = muted; video.volume = value / 100; });
                    } catch(e) {}
                });
                localStorage.setItem('enaea_auto_mute', muted);
                document.getElementById('volume-slider').value = value;
                document.getElementById('volume-icon').textContent = muted ? '🔇' : (value < 50 ? '🔉' : '🔊');
                document.getElementById('volume-value').textContent = muted ? '静音' : value + '%';
                document.getElementById('setting-auto-mute').checked = muted;
            }

            function updatePanelDisplay() {
                updatePlayButton();
                updateProgressDisplay();
                updateVolumeDisplay();
                updateSpeedDisplay();
            }

            // ==================== 视频状态同步 ====================
            function initVideoStateSync() {
                // 监听所有视频元素的事件
                function attachVideoListeners(video) {
                    if (video._enaeaListenersAttached) return;
                    video._enaeaListenersAttached = true;

                    // 播放状态变化
                    video.addEventListener('play', function() {
                        updatePlayButton();
                        addLog('视频开始播放', 'info');
                    });

                    video.addEventListener('pause', function() {
                        updatePlayButton();
                        addLog('视频已暂停', 'info');
                    });

                    video.addEventListener('ended', function() {
                        updatePlayButton();
                        addLog('视频播放完成', 'success');
                    });

                    // 时间更新
                    video.addEventListener('timeupdate', function() {
                        updateTimeDisplay(video);
                    });

                    // 音量变化
                    video.addEventListener('volumechange', function() {
                        updateVolumeFromVideo(video);
                    });

                    // 速度变化
                    video.addEventListener('ratechange', function() {
                        updateSpeedFromVideo(video);
                    });

                    // 加载状态
                    video.addEventListener('loadedmetadata', function() {
                        updateTimeDisplay(video);
                    });
                }

                // 附加监听器到现有视频
                document.querySelectorAll('video').forEach(attachVideoListeners);

                // 使用 MutationObserver 监听新视频元素
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) {
                                if (node.tagName === 'VIDEO') {
                                    attachVideoListeners(node);
                                }
                                node.querySelectorAll?.('video').forEach(attachVideoListeners);
                            }
                        });
                    });
                });

                observer.observe(document.body, { childList: true, subtree: true });

                // 定期检查 iframe 中的视频
                setInterval(function() {
                    document.querySelectorAll('iframe').forEach(function(iframe) {
                        try {
                            const doc = iframe.contentDocument || iframe.contentWindow?.document;
                            if (doc) {
                                doc.querySelectorAll('video').forEach(attachVideoListeners);
                            }
                        } catch(e) {}
                    });
                }, 2000);
            }

            // 更新时间显示
            function updateTimeDisplay(video) {
                const currentTimeEl = document.getElementById('video-current-time');
                const durationEl = document.getElementById('video-duration');
                const progressFill = document.getElementById('video-progress-fill');

                if (currentTimeEl && video) {
                    currentTimeEl.textContent = formatTime(video.currentTime);
                }
                if (durationEl && video) {
                    durationEl.textContent = formatTime(video.duration);
                }
                if (progressFill && video && video.duration) {
                    const percent = (video.currentTime / video.duration) * 100;
                    progressFill.style.width = percent + '%';
                }
            }

            // 从视频同步音量到GUI
            function updateVolumeFromVideo(video) {
                const volumeSlider = document.getElementById('volume-slider');
                const volumeIcon = document.getElementById('volume-icon');
                const volumeValue = document.getElementById('volume-value');

                if (!volumeSlider) return;

                const volume = Math.round(video.volume * 100);
                const muted = video.muted;

                volumeSlider.value = muted ? 0 : volume;

                if (muted || volume === 0) {
                    volumeIcon.textContent = '🔇';
                    volumeValue.textContent = '静音';
                } else if (volume < 50) {
                    volumeIcon.textContent = '🔉';
                    volumeValue.textContent = volume + '%';
                } else {
                    volumeIcon.textContent = '🔊';
                    volumeValue.textContent = volume + '%';
                }

                // 同步自动静音开关
                const autoMuteCheckbox = document.getElementById('setting-auto-mute');
                if (autoMuteCheckbox) {
                    autoMuteCheckbox.checked = muted;
                }
            }

            // 从视频同步速度到GUI
            function updateSpeedFromVideo(video) {
                const speed = video.playbackRate;
                document.querySelectorAll('.enaea-speed-btn').forEach(function(btn) {
                    btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
                });
            }

            // 更新进度显示
            function updateProgressDisplay() {
                const video = document.querySelector('video');
                const courseInfo = document.getElementById('course-info');
                const progressText = document.getElementById('progress-text');

                if (!video) return;

                // 获取课程信息
                const items = getProgressItems();
                if (items.length > 0) {
                    const completed = items.filter(function(i) { return i.progress === 100; }).length;
                    const total = items.length;
                    const percent = Math.round((completed / total) * 100);

                    if (courseInfo) {
                        courseInfo.textContent = completed + '/' + total + ' 课程';
                    }
                    if (progressText) {
                        progressText.textContent = percent + '%';
                    }
                }
            }

            // 获取进度项
            function getProgressItems() {
                var items = [];
                document.querySelectorAll('.cvtb-MCK-CsCt-studyProgress').forEach(function(el) {
                    var match = el.textContent.trim().match(/^(\\d{1,3})%$/);
                    if (match) {
                        var li = el.closest('li');
                        items.push({
                            el: el,
                            progress: parseInt(match[1]),
                            title: li?.querySelector('.cvtb-MCK-CsCt-title')?.textContent?.trim(),
                            isActive: li?.className?.includes('current')
                        });
                    }
                });
                return items;
            }

            // 更新音量显示
            function updateVolumeDisplay() {
                var video = document.querySelector('video');
                if (video) {
                    updateVolumeFromVideo(video);
                }
            }

            // 更新速度显示
            function updateSpeedDisplay() {
                var video = document.querySelector('video');
                if (video) {
                    updateSpeedFromVideo(video);
                }
            }

            // 格式化时间
            function formatTime(seconds) {
                if (isNaN(seconds)) return '0:00';
                var mins = Math.floor(seconds / 60);
                var secs = Math.floor(seconds % 60);
                return mins + ':' + (secs < 10 ? '0' : '') + secs;
            }

            function initGUI() {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                        setTimeout(function() {
                            createPanel();
                            initVideoStateSync();
                        }, 1000);
                    });
                } else {
                    setTimeout(function() {
                        createPanel();
                        initVideoStateSync();
                    }, 1000);
                }
            }

            initGUI();
        })();
    `;

    // ==================== 加载 GUI ====================
    function loadGUI() {
        // 注入样式
        const style = document.createElement('style');
        style.textContent = GUI_STYLES;
        document.head.appendChild(style);

        // 注入脚本
        const script = document.createElement('script');
        script.textContent = GUI_SCRIPT;
        document.head.appendChild(script);

        log('GUI 面板已加载', 'success');
    }

    // 延迟加载 GUI
    setTimeout(loadGUI, 2000);

})();