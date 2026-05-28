// 班级管理后台 - 保存配置到 Worker API
const WORKER_URL = 'https://class-api.你的子域.workers.dev/api/config';  // ⚠️ 替换为你的 Worker 实际地址
const ADMIN_TOKEN = 'handan123';  // ⚠️ 必须与 Worker 环境变量 ADMIN_TOKEN 一致

let configData = null;

// 默认配置（与 Worker 中的默认配置保持一致）
const defaultConfig = {
    className: "红谷一小六（13）班",
    classAlias: "菡萏班",
    classSlogan: "灼灼荷花瑞，亭亭出水中",
    teacherMessage: "愿你们如清荷，不染纤尘，中通外直，香远益清。",
    studentCount: 46,
    teacherCount: 12,
    bgmUrl: "assets/audio/class-bgm.mp3",
    aboutStory: "红谷一小六（13）班又名“菡萏班”，菡萏即荷花花苞，象征纯洁与希望。46朵小荷在老师们的浇灌下茁壮成长。",
    members: [
        { name: "林清菡", role: "班长", bio: "校优秀学生干部", icon: "fa-crown" },
        { name: "周子荷", role: "学习委员", bio: "作文大赛一等奖", icon: "fa-book" },
        { name: "罗逸飞", role: "体育健将", bio: "校田径队主力", icon: "fa-futbol" },
        { name: "叶之夏", role: "文艺部长", bio: "舞蹈荷花奖", icon: "fa-palette" }
    ],
    honors: [
        { title: "红谷滩区优秀班集体", desc: "2023-2024学年", icon: "fa-trophy" },
        { title: "校艺术节合唱特等奖", desc: "曲目《荷花谣》", icon: "fa-music" },
        { title: "书香班级称号", desc: "人均阅读量第一", icon: "fa-book-open" }
    ],
    gallery: [
        { type: "image", url: "assets/images/lotus-festival.jpg", caption: "荷花节展示" },
        { type: "image", url: "assets/images/class-meeting.jpg", caption: "主题班会" },
        { type: "video", url: "assets/video/graduation-memory.mp4", caption: "成长记忆" }
    ]
};

// 从 Worker 加载现有配置
async function loadConfigForAdmin() {
    try {
        const resp = await fetch(WORKER_URL);
        if (resp.ok) {
            configData = await resp.json();
            // 同时保存到 localStorage 作为备份
            localStorage.setItem('handan_class_config', JSON.stringify(configData));
        } else {
            throw new Error('加载失败');
        }
    } catch (e) {
        console.warn('从 Worker 加载失败，尝试本地缓存', e);
        const local = localStorage.getItem('handan_class_config');
        if (local) {
            configData = JSON.parse(local);
        } else {
            configData = JSON.parse(JSON.stringify(defaultConfig));
        }
    }
    fillForm();
}

function fillForm() {
    document.getElementById('className').value = configData.className || '';
    document.getElementById('classAlias').value = configData.classAlias || '';
    document.getElementById('classSlogan').value = configData.classSlogan || '';
    document.getElementById('teacherMessage').value = configData.teacherMessage || '';
    document.getElementById('studentCount').value = configData.studentCount || 46;
    document.getElementById('teacherCount').value = configData.teacherCount || 12;
    document.getElementById('bgmUrl').value = configData.bgmUrl || '';
    renderMembers();
    renderHonors();
    renderGallery();
}

function renderMembers() {
    const container = document.getElementById('membersList');
    container.innerHTML = '';
    configData.members.forEach((m, idx) => {
        const div = document.createElement('div');
        div.className = 'member-item';
        div.innerHTML = `
            <input placeholder="姓名" value="${escapeHtml(m.name)}" data-field="name" data-index="${idx}">
            <input placeholder="职务" value="${escapeHtml(m.role)}" data-field="role" data-index="${idx}">
            <input placeholder="简介" value="${escapeHtml(m.bio)}" data-field="bio" data-index="${idx}">
            <input placeholder="图标类(fa-xxx)" value="${escapeHtml(m.icon)}" data-field="icon" data-index="${idx}">
            <button class="btn-outline" data-remove idx="${idx}">删除</button>
        `;
        container.appendChild(div);
    });
    attachArrayEvents('members');
}

function renderHonors() {
    const container = document.getElementById('honorList');
    container.innerHTML = '';
    configData.honors.forEach((h, idx) => {
        const div = document.createElement('div');
        div.className = 'honor-item';
        div.innerHTML = `
            <input placeholder="荣誉名称" value="${escapeHtml(h.title)}" data-field="title" data-idx="${idx}">
            <input placeholder="描述" value="${escapeHtml(h.desc)}" data-field="desc" data-idx="${idx}">
            <input placeholder="图标" value="${escapeHtml(h.icon)}" data-field="icon" data-idx="${idx}">
            <button class="btn-outline" data-remove idx="${idx}">删除</button>
        `;
        container.appendChild(div);
    });
    attachArrayEvents('honors');
}

function renderGallery() {
    const container = document.getElementById('galleryList');
    container.innerHTML = '';
    configData.gallery.forEach((g, idx) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <select data-field="type" data-idx="${idx}">
                <option ${g.type === 'image' ? 'selected' : ''}>image</option>
                <option ${g.type === 'video' ? 'selected' : ''}>video</option>
            </select>
            <input placeholder="URL" value="${escapeHtml(g.url)}" data-field="url" data-idx="${idx}">
            <input placeholder="说明" value="${escapeHtml(g.caption)}" data-field="caption" data-idx="${idx}">
            <button class="btn-outline" data-remove idx="${idx}">删除</button>
        `;
        container.appendChild(div);
    });
    attachArrayEvents('gallery');
}

function attachArrayEvents(type) {
    // 删除按钮事件
    document.querySelectorAll(`#${type}List button[data-remove]`).forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('idx'));
            configData[type].splice(idx, 1);
            renderMembers();
            renderHonors();
            renderGallery();
        };
    });
    // 输入变更事件
    const inputs = document.querySelectorAll(`#membersList input, #honorList input, #galleryList input, #galleryList select`);
    inputs.forEach(inp => {
        inp.onchange = (e) => {
            const idx = inp.getAttribute('data-index') || inp.getAttribute('data-idx');
            const field = inp.getAttribute('data-field');
            if (inp.closest('#membersList') && idx !== null) {
                configData.members[idx][field] = inp.value;
            } else if (inp.closest('#honorList')) {
                configData.honors[idx][field] = inp.value;
            } else if (inp.closest('#galleryList')) {
                configData.gallery[idx][field] = inp.value;
            }
        };
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function collectBasicInfo() {
    configData.className = document.getElementById('className').value;
    configData.classAlias = document.getElementById('classAlias').value;
    configData.classSlogan = document.getElementById('classSlogan').value;
    configData.teacherMessage = document.getElementById('teacherMessage').value;
    configData.studentCount = parseInt(document.getElementById('studentCount').value);
    configData.teacherCount = parseInt(document.getElementById('teacherCount').value);
    configData.bgmUrl = document.getElementById('bgmUrl').value;
}

// 保存到云端 Worker
document.getElementById('saveToLocalBtn').addEventListener('click', async () => {
    collectBasicInfo();
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Token': ADMIN_TOKEN
            },
            body: JSON.stringify(configData)
        });
        if (response.ok) {
            alert('✅ 配置已保存到云端！所有访问者将看到最新内容。');
            localStorage.setItem('handan_class_config', JSON.stringify(configData));
        } else {
            const err = await response.json();
            alert('❌ 云端保存失败：' + (err.error || '未知错误'));
        }
    } catch (err) {
        console.error(err);
        alert('❌ 网络错误，保存失败');
    }
});

// 重置为默认配置
document.getElementById('resetDefaultBtn').addEventListener('click', () => {
    if (confirm('重置后会丢失当前未保存的修改，确定吗？')) {
        configData = JSON.parse(JSON.stringify(defaultConfig));
        fillForm();
        alert('已重置为默认配置，请点击“保存配置到浏览器”上传至云端。');
    }
});

// 导出 JSON 文件
document.getElementById('exportConfigBtn').addEventListener('click', () => {
    collectBasicInfo();
    const dataStr = JSON.stringify(configData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('导出 config.json 成功');
});

// 添加成员/荣誉/画廊
document.getElementById('addMemberBtn').addEventListener('click', () => {
    configData.members.push({ name: "新同学", role: "职位", bio: "自我介绍", icon: "fa-smile" });
    renderMembers();
});
document.getElementById('addHonorBtn').addEventListener('click', () => {
    configData.honors.push({ title: "新荣誉", desc: "描述", icon: "fa-award" });
    renderHonors();
});
document.getElementById('addGalleryBtn').addEventListener('click', () => {
    configData.gallery.push({ type: "image", url: "assets/images/new.jpg", caption: "新瞬间" });
    renderGallery();
});

// 启动
loadConfigForAdmin();