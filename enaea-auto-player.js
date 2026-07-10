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

/**
 * ENAEA Learning Assistant
 *
 * 本工具旨在优化在线学习体验，提供视频播放控制和课程导航辅助功能。
 * 请确保使用方式符合平台规则和学术规范。
 *
 * @version 9.0
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

    log('ENAEA Learning Assistant v9.0 已启动！', 'success');
    log('功能: 视频播放优化 | 智能导航 | 弹窗处理 | 进度追踪', 'info');

})();
