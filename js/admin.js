// admin.js - 管理后台逻辑（适配密码登录后的 token）
let configData = null;
let currentToken = null;
const API_BASE = 'https://api.mycw.ysnsm2899.ggff.net/api';

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
              { name: "章一诺", role: "班长", bio: "足球校队", icon: "fa-crown" },
              { name: "贾思睿", rode: "无职位",bio:"五年级期末考年级第一https://api.mycw.ysnsm2899.ggff.net", icon: "fa-crown"}
            ],
            honors: [
              { title: "2025年数学节", desc: "魔方个人及团体赛荣获第一", icon: "fa-trophy" },
            ],
            gallery: [
              { type: "image", url: "assets/images/lotus-festival.jpg", caption: "荷花节展示" },
              { type: "image", url: "assets/images/class-meeting.jpg", caption: "主题班会" },
              { type: "video", url: "assets/video/graduation-memory.mp4", caption: "成长记忆" }
            ]
};

// 加载配置（无需 token）
async function loadConfigFromCloud() {
    try {
        const resp = await fetch(`${API_BASE}/config`);
        if (resp.ok) {
            return await resp.json();
        }
    } catch (e) {}
    return null;
}

// 保存配置到云端（需要 token）
async function saveConfigToCloud(config, token) {
    const resp = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token
        },
        body: JSON.stringify(config)
    });
    return resp.ok;
}

// 渲染成员列表（编辑界面）
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
    // 删除按钮
    document.querySelectorAll(`#${type}List button[data-remove]`).forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('idx'));
            configData[type].splice(idx, 1);
            renderMembers();
            renderHonors();
            renderGallery();
        };
    });
    // 输入变更
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

// 初始化管理后台（在登录成功后调用）
async function initAdmin(token) {
    currentToken = token;
    // 从云端加载配置
    let cloudConfig = await loadConfigFromCloud();
    if (cloudConfig) {
        configData = cloudConfig;
        localStorage.setItem('handan_class_config', JSON.stringify(configData));
    } else {
        // 尝试 localStorage 或默认
        const local = localStorage.getItem('handan_class_config');
        if (local) {
            configData = JSON.parse(local);
        } else {
            configData = JSON.parse(JSON.stringify(defaultConfig));
        }
    }
    fillForm();
}

// 绑定事件（需要在登录后执行，但按钮一开始不存在，因为 adminContent 未显示）
function bindEvents() {
    document.getElementById('saveToCloudBtn').addEventListener('click', async () => {
        if (!currentToken) {
            alert('未登录，请刷新页面重新登录');
            return;
        }
        collectBasicInfo();
        const success = await saveConfigToCloud(configData, currentToken);
        if (success) {
            alert('✅ 配置已保存到云端！所有访问者将看到最新内容。');
            localStorage.setItem('handan_class_config', JSON.stringify(configData));
        } else {
            alert('❌ 保存失败，请检查网络或 token');
        }
    });

    document.getElementById('resetDefaultBtn').addEventListener('click', () => {
        if (confirm('重置后会丢失当前未保存的修改，确定吗？')) {
            configData = JSON.parse(JSON.stringify(defaultConfig));
            fillForm();
            alert('已重置为默认配置，请点击“保存配置到云端”上传。');
        }
    });

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
}

// 暴露初始化函数，供 admin.html 登录成功后调用
window.initAdmin = async (token) => {
    await initAdmin(token);
    bindEvents();
};