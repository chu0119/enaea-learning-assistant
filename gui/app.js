/**
 * ENAEA Learning Assistant GUI
 * 版本: 9.0
 */

(function() {
    'use strict';

    // ==================== 配置 ====================
    const GUI_CONFIG = {
        defaultSpeed: 4,
        defaultVolume: 100,
        defaultMuted: true,
        defaultAutoPlay: true,
        defaultAutoMute: true,
        defaultDialogHandler: true,
        defaultDebug: false,
        defaultCheckInterval: 3,
        storagePrefix: 'enaea_gui_'
    };

    // ==================== 状态管理 ====================
    const GUIState = {
        panel: null,
        isMinimized: false,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        logs: [],
        maxLogs: 100,
        updateInterval: null
    };

    // ==================== 工具函数 ====================
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const log = (msg, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const icons = {
            'info': '📌',
            'success': '✅',
            'action': '🎯',
            'error': '❌',
            'warning': '⚠️',
            'debug': '🔍'
        };

        const entry = {
            time: timestamp,
            type: type,
            icon: icons[type] || '📌',
            message: msg
        };

        GUIState.logs.unshift(entry);
        if (GUIState.logs.length > GUIState.maxLogs) {
            GUIState.logs.pop();
        }

        updateLogDisplay();

        // 同时输出到控制台
        if (CONFIG.debug || type !== 'debug') {
            console.log(`${entry.icon} [ENAEA GUI] ${msg}`);
        }
    };

    // ==================== 存储管理 ====================
    const Storage = {
        get(key, defaultValue = null) {
            try {
                const value = localStorage.getItem(GUI_CONFIG.storagePrefix + key);
                return value !== null ? JSON.parse(value) : defaultValue;
            } catch(e) {
                return defaultValue;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(GUI_CONFIG.storagePrefix + key, JSON.stringify(value));
            } catch(e) {}
        }
    };

    // ==================== 获取当前设置 ====================
    function getCurrentSettings() {
        return {
            speed: parseInt(localStorage.getItem('enaea_speed')) || GUI_CONFIG.defaultSpeed,
            autoMute: localStorage.getItem('enaea_auto_mute') !== 'false',
            autoPlay: Storage.get('auto_play', GUI_CONFIG.defaultAutoPlay),
            dialogHandler: Storage.get('dialog_handler', GUI_CONFIG.defaultDialogHandler),
            debug: CONFIG.debug,
            checkInterval: Storage.get('check_interval', GUI_CONFIG.defaultCheckInterval)
        };
    }

    // ==================== 保存设置 ====================
    function saveSettings(settings) {
        if (settings.speed !== undefined) {
            localStorage.setItem('enaea_speed', settings.speed);
        }
        if (settings.autoMute !== undefined) {
            localStorage.setItem('enaea_auto_mute', settings.autoMute);
        }
        if (settings.autoPlay !== undefined) {
            Storage.set('auto_play', settings.autoPlay);
        }
        if (settings.dialogHandler !== undefined) {
            Storage.set('dialog_handler', settings.dialogHandler);
        }
        if (settings.debug !== undefined) {
            CONFIG.debug = settings.debug;
        }
        if (settings.checkInterval !== undefined) {
            Storage.set('check_interval', settings.checkInterval);
            CONFIG.checkInterval = settings.checkInterval * 1000;
        }
        log('设置已保存', 'success');
    }

    // ==================== 创建面板 ====================
    function createPanel() {
        if (document.getElementById('enaea-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'enaea-panel';
        panel.className = 'enaea-panel';
        panel.innerHTML = getPanelHTML();

        document.body.appendChild(panel);
        GUIState.panel = panel;

        initPanelEvents();
        updatePanelDisplay();
        startUpdateInterval();

        log('GUI 面板已加载', 'success');
    }

    // ==================== 面板 HTML ====================
    function getPanelHTML() {
        const settings = getCurrentSettings();

        return `
            <!-- 标题栏 -->
            <div class="enaea-panel-header" id="panel-header">
                <div class="enaea-panel-title">
                    <span class="enaea-panel-title-icon">📚</span>
                    <span>ENAEA Learning Assistant</span>
                </div>
                <div class="enaea-panel-buttons">
                    <button class="enaea-panel-btn" id="btn-minimize" title="最小化">─</button>
                    <button class="enaea-panel-btn" id="btn-close" title="隐藏面板">×</button>
                </div>
            </div>

            <!-- 状态栏 -->
            <div class="enaea-status-bar">
                <div class="enaea-status-indicator">
                    <span class="enaea-status-dot running" id="status-dot"></span>
                    <span id="status-text">运行中</span>
                </div>
                <span class="enaea-status-text" id="current-course">-</span>
                <span class="enaea-status-text" id="current-progress">0%</span>
            </div>

            <!-- 内容区域 -->
            <div class="enaea-panel-content">
                <!-- 视频控制区 -->
                <div class="enaea-card">
                    <div class="enaea-card-header">
                        <div class="enaea-card-title">
                            <span class="enaea-card-title-icon">🎬</span>
                            <span>视频控制</span>
                        </div>
                    </div>
                    <div class="enaea-video-controls">
                        <div class="enaea-control-buttons">
                            <button class="enaea-control-btn" id="btn-prev" title="上一个">⏮</button>
                            <button class="enaea-control-btn primary" id="btn-play" title="播放/暂停">▶</button>
                            <button class="enaea-control-btn" id="btn-next" title="下一个">⏭</button>
                        </div>
                        <div class="enaea-speed-control">
                            <span class="enaea-speed-label">速度</span>
                            <div class="enaea-speed-buttons">
                                <button class="enaea-speed-btn" data-speed="1">1x</button>
                                <button class="enaea-speed-btn" data-speed="2">2x</button>
                                <button class="enaea-speed-btn ${settings.speed === 4 ? 'active' : ''}" data-speed="4">4x</button>
                            </div>
                        </div>
                        <div class="enaea-volume-control">
                            <span id="volume-icon">🔊</span>
                            <input type="range" class="enaea-volume-slider" id="volume-slider" min="0" max="100" value="${settings.autoMute ? 0 : 100}">
                            <span class="enaea-volume-value" id="volume-value">${settings.autoMute ? '静音' : '100%'}</span>
                        </div>
                    </div>
                </div>

                <!-- 课程进度区 -->
                <div class="enaea-card">
                    <div class="enaea-card-header">
                        <div class="enaea-card-title">
                            <span class="enaea-card-title-icon">📊</span>
                            <span>课程进度</span>
                        </div>
                    </div>
                    <div class="enaea-progress-section">
                        <div class="enaea-progress-bar-container">
                            <div class="enaea-progress-bar" id="progress-bar" style="width: 0%"></div>
                        </div>
                        <div class="enaea-progress-info">
                            <span id="progress-current">-</span>
                            <span id="progress-percent">0%</span>
                        </div>
                        <div class="enaea-current-course" id="course-name">当前课程: -</div>
                        <div class="enaea-course-stats">
                            <span>已完成: <strong id="stat-completed">0</strong></span>
                            <span>总计: <strong id="stat-total">0</strong></span>
                        </div>
                        <div class="enaea-module-list" id="module-list">
                            <div class="enaea-empty-state">加载中...</div>
                        </div>
                    </div>
                </div>

                <!-- 设置区 -->
                <div class="enaea-card">
                    <div class="enaea-card-header">
                        <div class="enaea-card-title">
                            <span class="enaea-card-title-icon">⚙️</span>
                            <span>设置</span>
                        </div>
                    </div>
                    <div class="enaea-settings">
                        <div class="enaea-settings-row">
                            <div class="enaea-setting-item">
                                <label class="enaea-toggle">
                                    <input type="checkbox" id="setting-auto-play" ${settings.autoPlay ? 'checked' : ''}>
                                    <span class="enaea-toggle-slider"></span>
                                </label>
                                <span class="enaea-setting-label">自动播放</span>
                            </div>
                            <div class="enaea-setting-item">
                                <label class="enaea-toggle">
                                    <input type="checkbox" id="setting-auto-mute" ${settings.autoMute ? 'checked' : ''}>
                                    <span class="enaea-toggle-slider"></span>
                                </label>
                                <span class="enaea-setting-label">自动静音</span>
                            </div>
                            <div class="enaea-setting-item">
                                <label class="enaea-toggle">
                                    <input type="checkbox" id="setting-dialog" ${settings.dialogHandler ? 'checked' : ''}>
                                    <span class="enaea-toggle-slider"></span>
                                </label>
                                <span class="enaea-setting-label">弹窗处理</span>
                            </div>
                        </div>
                        <div class="enaea-settings-row">
                            <div class="enaea-setting-item">
                                <label class="enaea-toggle">
                                    <input type="checkbox" id="setting-debug" ${settings.debug ? 'checked' : ''}>
                                    <span class="enaea-toggle-slider"></span>
                                </label>
                                <span class="enaea-setting-label">调试模式</span>
                            </div>
                            <div class="enaea-setting-item">
                                <span class="enaea-setting-label">检查间隔</span>
                                <select class="enaea-select" id="setting-interval">
                                    <option value="1" ${settings.checkInterval === 1 ? 'selected' : ''}>1秒</option>
                                    <option value="2" ${settings.checkInterval === 2 ? 'selected' : ''}>2秒</option>
                                    <option value="3" ${settings.checkInterval === 3 ? 'selected' : ''}>3秒</option>
                                    <option value="5" ${settings.checkInterval === 5 ? 'selected' : ''}>5秒</option>
                                    <option value="10" ${settings.checkInterval === 10 ? 'selected' : ''}>10秒</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 操作区 -->
                <div class="enaea-card">
                    <div class="enaea-card-header">
                        <div class="enaea-card-title">
                            <span class="enaea-card-title-icon">🔧</span>
                            <span>操作</span>
                        </div>
                    </div>
                    <div class="enaea-actions">
                        <button class="enaea-action-btn danger" id="btn-reset">
                            <span>🔄</span>
                            <span>重置进度</span>
                        </button>
                        <button class="enaea-action-btn" id="btn-export">
                            <span>📤</span>
                            <span>导出配置</span>
                        </button>
                        <button class="enaea-action-btn" id="btn-import">
                            <span>📥</span>
                            <span>导入配置</span>
                        </button>
                        <button class="enaea-action-btn" id="btn-stats">
                            <span>📊</span>
                            <span>统计</span>
                        </button>
                    </div>
                </div>

                <!-- 日志区 -->
                <div class="enaea-log-section">
                    <div class="enaea-log-header">
                        <span class="enaea-log-title">日志</span>
                        <div class="enaea-log-buttons">
                            <button class="enaea-log-btn" id="btn-log-clear">清除</button>
                            <button class="enaea-log-btn" id="btn-log-copy">复制</button>
                        </div>
                    </div>
                    <div class="enaea-log-content" id="log-content">
                        <div class="enaea-empty-state">暂无日志</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== 初始化面板事件 ====================
    function initPanelEvents() {
        const panel = GUIState.panel;

        // 标题栏按钮
        document.getElementById('btn-minimize').addEventListener('click', toggleMinimize);
        document.getElementById('btn-close').addEventListener('click', hidePanel);

        // 拖拽功能
        const header = document.getElementById('panel-header');
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        // 视频控制按钮
        document.getElementById('btn-play').addEventListener('click', togglePlay);
        document.getElementById('btn-prev').addEventListener('click', prevVideo);
        document.getElementById('btn-next').addEventListener('click', nextVideo);

        // 速度按钮
        document.querySelectorAll('.enaea-speed-btn').forEach(btn => {
            btn.addEventListener('click', () => setSpeed(parseInt(btn.dataset.speed)));
        });

        // 音量滑块
        document.getElementById('volume-slider').addEventListener('input', (e) => setVolume(parseInt(e.target.value)));

        // 设置开关
        document.getElementById('setting-auto-play').addEventListener('change', (e) => {
            saveSettings({ autoPlay: e.target.checked });
        });
        document.getElementById('setting-auto-mute').addEventListener('change', (e) => {
            saveSettings({ autoMute: e.target.checked });
            setVolume(e.target.checked ? 0 : 100);
        });
        document.getElementById('setting-dialog').addEventListener('change', (e) => {
            saveSettings({ dialogHandler: e.target.checked });
        });
        document.getElementById('setting-debug').addEventListener('change', (e) => {
            saveSettings({ debug: e.target.checked });
        });
        document.getElementById('setting-interval').addEventListener('change', (e) => {
            saveSettings({ checkInterval: parseInt(e.target.value) });
        });

        // 操作按钮
        document.getElementById('btn-reset').addEventListener('click', resetProgress);
        document.getElementById('btn-export').addEventListener('click', exportConfig);
        document.getElementById('btn-import').addEventListener('click', importConfig);
        document.getElementById('btn-stats').addEventListener('click', showStats);

        // 日志按钮
        document.getElementById('btn-log-clear').addEventListener('click', clearLogs);
        document.getElementById('btn-log-copy').addEventListener('click', copyLogs);

        // 快捷键
        document.addEventListener('keydown', handleKeyboard);
    }

    // ==================== 面板显示/隐藏 ====================
    function toggleMinimize() {
        GUIState.isMinimized = !GUIState.isMinimized;
        GUIState.panel.classList.toggle('minimized', GUIState.isMinimized);

        const btn = document.getElementById('btn-minimize');
        btn.textContent = GUIState.isMinimized ? '□' : '─';
        btn.title = GUIState.isMinimized ? '展开' : '最小化';
    }

    function hidePanel() {
        GUIState.panel.classList.add('hidden');
        Storage.set('panel_visible', false);
        log('面板已隐藏', 'info');
    }

    function showPanel() {
        GUIState.panel.classList.remove('hidden');
        Storage.set('panel_visible', true);
    }

    // ==================== 拖拽功能 ====================
    function startDrag(e) {
        if (e.target.closest('.enaea-panel-btn')) return;

        GUIState.isDragging = true;
        GUIState.dragOffset = {
            x: e.clientX - GUIState.panel.offsetLeft,
            y: e.clientY - GUIState.panel.offsetTop
        };
        GUIState.panel.style.transition = 'none';
    }

    function drag(e) {
        if (!GUIState.isDragging) return;

        e.preventDefault();

        let x = e.clientX - GUIState.dragOffset.x;
        let y = e.clientY - GUIState.dragOffset.y;

        // 边界检测
        x = Math.max(0, Math.min(x, window.innerWidth - GUIState.panel.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - GUIState.panel.offsetHeight));

        GUIState.panel.style.left = x + 'px';
        GUIState.panel.style.top = y + 'px';
        GUIState.panel.style.right = 'auto';
    }

    function endDrag() {
        if (!GUIState.isDragging) return;

        GUIState.isDragging = false;
        GUIState.panel.style.transition = '';

        // 保存位置
        Storage.set('panel_position', {
            x: GUIState.panel.offsetLeft,
            y: GUIState.panel.offsetTop
        });
    }

    // ==================== 视频控制 ====================
    function togglePlay() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.paused) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });

        // iframe 中的视频
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                    doc.querySelectorAll('video').forEach(video => {
                        if (video.paused) {
                            video.play().catch(() => {});
                        } else {
                            video.pause();
                        }
                    });
                }
            } catch(e) {}
        });

        updatePlayButton();
        log('切换播放状态', 'action');
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
        // 尝试点击上一个视频
        const items = VideoPlayer.getProgressItems();
        const current = items.find(i => i.isActive);
        if (current) {
            const index = items.indexOf(current);
            if (index > 0) {
                items[index - 1].el.closest('li')?.click();
                log('切换到上一个视频', 'action');
            }
        }
    }

    function nextVideo() {
        // 尝试点击下一个未完成视频
        const unfinished = VideoPlayer.getFirstUnfinished();
        if (unfinished) {
            unfinished.el.closest('li')?.click();
            log('切换到下一个视频', 'action');
        }
    }

    function setSpeed(speed) {
        // 更新所有视频速度
        document.querySelectorAll('video').forEach(video => {
            video.playbackRate = speed;
        });

        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                    doc.querySelectorAll('video').forEach(video => {
                        video.playbackRate = speed;
                    });
                }
            } catch(e) {}
        });

        // 保存设置
        localStorage.setItem('enaea_speed', speed);

        // 更新按钮状态
        document.querySelectorAll('.enaea-speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
        });

        log(`播放速度已设置为 ${speed}x`, 'action');
    }

    function setVolume(value) {
        const muted = value === 0;

        // 更新所有视频音量
        document.querySelectorAll('video').forEach(video => {
            video.muted = muted;
            video.volume = value / 100;
        });

        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                    doc.querySelectorAll('video').forEach(video => {
                        video.muted = muted;
                        video.volume = value / 100;
                    });
                }
            } catch(e) {}
        });

        // 保存设置
        localStorage.setItem('enaea_auto_mute', muted);

        // 更新显示
        const volumeIcon = document.getElementById('volume-icon');
        const volumeValue = document.getElementById('volume-value');
        const volumeSlider = document.getElementById('volume-slider');

        volumeSlider.value = value;

        if (muted) {
            volumeIcon.textContent = '🔇';
            volumeValue.textContent = '静音';
        } else if (value < 50) {
            volumeIcon.textContent = '🔉';
            volumeValue.textContent = value + '%';
        } else {
            volumeIcon.textContent = '🔊';
            volumeValue.textContent = value + '%';
        }

        // 同步自动静音开关
        document.getElementById('setting-auto-mute').checked = muted;
        saveSettings({ autoMute: muted });
    }

    // ==================== 进度更新 ====================
    function updatePanelDisplay() {
        const settings = getCurrentSettings();
        const page = detectPage();

        // 更新状态
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');

        if (page === 'videoPlayer') {
            statusDot.className = 'enaea-status-dot running';
            statusText.textContent = '运行中';
        } else {
            statusDot.className = 'enaea-status-dot paused';
            statusText.textContent = '等待中';
        }

        // 更新进度
        updateProgressDisplay();
        updateModuleList();
        updatePlayButton();
    }

    function updateProgressDisplay() {
        const items = VideoPlayer.getProgressItems();
        if (items.length === 0) {
            document.getElementById('progress-current').textContent = '-';
            document.getElementById('progress-percent').textContent = '0%';
            document.getElementById('progress-bar').style.width = '0%';
            document.getElementById('course-name').textContent = '当前课程: -';
            document.getElementById('stat-completed').textContent = '0';
            document.getElementById('stat-total').textContent = '0';
            return;
        }

        const completed = items.filter(i => i.progress === 100).length;
        const total = items.length;
        const percent = Math.round((completed / total) * 100);

        document.getElementById('progress-current').textContent = `${completed}/${total} 课程`;
        document.getElementById('progress-percent').textContent = `${percent}%`;
        document.getElementById('progress-bar').style.width = `${percent}%`;
        document.getElementById('stat-completed').textContent = completed;
        document.getElementById('stat-total').textContent = total;

        // 当前课程名称
        const active = items.find(i => i.isActive);
        if (active) {
            document.getElementById('course-name').textContent = `当前课程: ${active.title || '-'}`;
        }
    }

    function updateModuleList() {
        const completedModules = State.getJSON('completed_modules');
        const moduleList = document.getElementById('module-list');

        // 获取所有模块链接
        const links = document.querySelectorAll('a[href*="toNewMyClass"][href*="type=course"]');
        const uniqueLinks = [];
        links.forEach(link => {
            try {
                const url = new URL(link.href);
                const sid = url.searchParams.get('syllabusId');
                if (sid && !uniqueLinks.some(l => l.syllabusId === sid)) {
                    uniqueLinks.push({
                        el: link,
                        syllabusId: sid,
                        name: link.textContent.trim().substring(0, 20) || `模块 ${uniqueLinks.length + 1}`
                    });
                }
            } catch(e) {}
        });

        if (uniqueLinks.length === 0) {
            moduleList.innerHTML = '<div class="enaea-empty-state">暂无模块信息</div>';
            return;
        }

        moduleList.innerHTML = '';

        uniqueLinks.forEach(item => {
            const isCompleted = completedModules.includes(item.syllabusId);
            const iconClass = isCompleted ? 'completed' : 'pending';
            const icon = isCompleted ? '☑️' : '⬜';

            const div = document.createElement('div');
            div.className = 'enaea-module-item';
            div.dataset.id = item.syllabusId;

            const iconSpan = document.createElement('span');
            iconSpan.className = `enaea-module-icon ${iconClass}`;
            iconSpan.textContent = icon;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'enaea-module-name';
            nameSpan.textContent = item.name;

            const progressSpan = document.createElement('span');
            progressSpan.className = 'enaea-module-progress';
            progressSpan.textContent = isCompleted ? '100%' : '0%';

            div.appendChild(iconSpan);
            div.appendChild(nameSpan);
            div.appendChild(progressSpan);
            moduleList.appendChild(div);
        });

        // 添加点击事件
        moduleList.querySelectorAll('.enaea-module-item').forEach(item => {
            item.addEventListener('click', () => {
                const link = document.querySelector(`a[href*="syllabusId=${item.dataset.id}"]`);
                if (link) {
                    window.location.href = link.href;
                }
            });
        });
    }

    // ==================== 日志显示 ====================
    function updateLogDisplay() {
        const logContent = document.getElementById('log-content');
        if (!logContent) return;

        if (GUIState.logs.length === 0) {
            logContent.innerHTML = '<div class="enaea-empty-state">暂无日志</div>';
            return;
        }

        logContent.innerHTML = '';

        GUIState.logs.slice(0, 50).forEach(entry => {
            const div = document.createElement('div');
            div.className = `enaea-log-entry ${entry.type}`;

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

    function clearLogs() {
        GUIState.logs = [];
        updateLogDisplay();
        log('日志已清除', 'info');
    }

    function copyLogs() {
        const text = GUIState.logs.map(entry =>
            `${entry.time} ${entry.icon} ${entry.message}`
        ).join('\n');

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                log('日志已复制到剪贴板', 'success');
            });
        } else {
            log('复制失败', 'error');
        }
    }

    // ==================== 操作功能 ====================
    function resetProgress() {
        if (confirm('确定要重置所有进度记录吗？此操作不可恢复。')) {
            State.remove('completed_modules');
            State.remove('completed_courses');
            State.remove('current_syllabusId');
            State.remove('current_circleId');
            State.remove('current_courseId');
            log('进度已重置', 'success');
            updatePanelDisplay();
        }
    }

    function exportConfig() {
        const config = {
            version: '9.0',
            exportTime: new Date().toISOString(),
            settings: getCurrentSettings(),
            progress: {
                completedModules: State.getJSON('completed_modules'),
                completedCourses: State.getJSON('completed_courses')
            }
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enaea-config-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        log('配置已导出', 'success');
    }

    function importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);

                    if (config.settings) {
                        saveSettings(config.settings);
                    }

                    if (config.progress) {
                        if (config.progress.completedModules) {
                            State.setJSON('completed_modules', config.progress.completedModules);
                        }
                        if (config.progress.completedCourses) {
                            State.setJSON('completed_courses', config.progress.completedCourses);
                        }
                    }

                    log('配置已导入', 'success');
                    updatePanelDisplay();
                } catch(e) {
                    log('导入失败: ' + e.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function showStats() {
        const completedModules = State.getJSON('completed_modules');
        const completedCourses = State.getJSON('completed_courses');
        const items = VideoPlayer.getProgressItems();
        const completedVideos = items.filter(i => i.progress === 100).length;

        alert(`📊 学习统计\n\n` +
              `✅ 已完成模块: ${completedModules.length}\n` +
              `✅ 已完成课程: ${completedCourses.length}\n` +
              `✅ 已完成视频: ${completedVideos}/${items.length}\n\n` +
              `📈 继续加油！`);
    }

    // ==================== 快捷键 ====================
    function handleKeyboard(e) {
        // 如果面板隐藏，不处理快捷键
        if (GUIState.panel.classList.contains('hidden')) return;

        // 如果正在输入框中，不处理
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextVideo();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevVideo();
                break;
            case 'ArrowUp':
                e.preventDefault();
                adjustVolume(10);
                break;
            case 'ArrowDown':
                e.preventDefault();
                adjustVolume(-10);
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                toggleMute();
                break;
            case 'Escape':
                e.preventDefault();
                hidePanel();
                break;
        }
    }

    function adjustVolume(delta) {
        const slider = document.getElementById('volume-slider');
        let value = parseInt(slider.value) + delta;
        value = Math.max(0, Math.min(100, value));
        setVolume(value);
    }

    function toggleMute() {
        const slider = document.getElementById('volume-slider');
        const currentVolume = parseInt(slider.value);
        setVolume(currentVolume === 0 ? 100 : 0);
    }

    // ==================== 定时更新 ====================
    function startUpdateInterval() {
        if (GUIState.updateInterval) {
            clearInterval(GUIState.updateInterval);
        }

        GUIState.updateInterval = setInterval(() => {
            updatePanelDisplay();
        }, 1000);
    }

    // ==================== 页面检测 ====================
    function detectPage() {
        const url = window.location.href;
        if (url.includes('viewerforccvideo.do')) return 'videoPlayer';
        if (url.includes('toNewMyClass') && url.includes('type=course')) return 'courseDetail';
        if (url.includes('toCircleIndex')) return 'courseIndex';
        if (url.includes('showCourseList') || url.includes('toMyProject')) return 'courseList';
        return 'unknown';
    }

    // ==================== 初始化 ====================
    function initGUI() {
        // 等待页面加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(createPanel, 1000));
        } else {
            setTimeout(createPanel, 1000);
        }

        // 恢复面板位置
        const savedPosition = Storage.get('panel_position');
        if (savedPosition) {
            setTimeout(() => {
                GUIState.panel.style.left = savedPosition.x + 'px';
                GUIState.panel.style.top = savedPosition.y + 'px';
                GUIState.panel.style.right = 'auto';
            }, 1500);
        }
    }

    // 启动 GUI
    initGUI();

})();
