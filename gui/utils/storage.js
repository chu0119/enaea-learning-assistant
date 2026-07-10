/**
 * ENAEA Learning Assistant - 存储工具
 */

const StorageUtils = {
    prefix: 'enaea_',

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch(e) {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch(e) {
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch(e) {
            return false;
        }
    },

    clear() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch(e) {
            return false;
        }
    },

    // 导出所有数据
    exportAll() {
        const data = {};
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => {
                try {
                    data[key.replace(this.prefix, '')] = JSON.parse(localStorage.getItem(key));
                } catch(e) {
                    data[key.replace(this.prefix, '')] = localStorage.getItem(key);
                }
            });
        return data;
    },

    // 导入数据
    importAll(data) {
        Object.entries(data).forEach(([key, value]) => {
            this.set(key, value);
        });
    }
};

// 兼容旧的 State 对象
const State = {
    get(key) {
        return StorageUtils.get(key);
    },
    set(key, val) {
        StorageUtils.set(key, val);
    },
    getJSON(key) {
        return StorageUtils.get(key, []);
    },
    setJSON(key, val) {
        StorageUtils.set(key, val);
    },
    remove(key) {
        StorageUtils.remove(key);
    }
};
