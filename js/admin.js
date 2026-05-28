// 班级主页主逻辑 - 从 Worker API 获取配置
const WORKER_URL = 'https://api.mycw.ysnsm2899.ggff.net/api/config';  // ⚠️ 替换为你的 Worker 实际地址

let currentConfig = null;

async function loadConfig() {
    // 优先从 Worker 获取
    try {
        const response = await fetch(WORKER_URL);
        if (response.ok) {
            const config = await response.json();
            localStorage.setItem('handan_class_config', JSON.stringify(config));
            return config;
        }
    } catch (e) {
        console.warn('从 Worker 获取配置失败，尝试本地缓存', e);
    }
    // 回退：使用 localStorage 或 config.json
    const localConfig = localStorage.getItem('handan_class_config');
    if (localConfig) {
        return JSON.parse(localConfig);
    }
    const fallbackResponse = await fetch('config.json');
    return await fallbackResponse.json();
}

function renderPage(config) {
    currentConfig = config;
    // 更新导航标题
    document.querySelector('.logo h2').innerHTML = `🌸 ${config.classAlias || '菡萏班'}`;
    document.querySelector('.logo p').innerHTML = `${config.className} · 含苞待放`;
    document.title = `${config.classAlias} | ${config.className}`;
    
    const main = document.getElementById('app');
    let html = `
        <section class="hero" id="home"><div class="container"><div class="hero-content"><div class="hero-text"><div class="hero-badge"><i class="fas fa-leaf"></i> 荷香润童年</div><h1>欢迎来到 <span>${config.classAlias}</span><br>${config.className}</h1><div class="class-slogan"><i class="fas fa-quote-left"></i><span>${config.classSlogan}</span></div></div><div class="hero-img"><img src="assets/images/class-photo.jpg" alt="班级合影" onerror="this.src='https://picsum.photos/id/127/600/450'"></div></div><div class="stats-grid"><div class="stat-card"><i class="fas fa-user-friends"></i><div class="stat-number">${config.studentCount}</div><div class="stat-label">朝气同学</div></div><div class="stat-card"><i class="fas fa-chalkboard-user"></i><div class="stat-number">${config.teacherCount}</div><div class="stat-label">优秀教师</div></div><div class="stat-card"><i class="fas fa-trophy"></i><div class="stat-number">${config.honors.length}+</div><div class="stat-label">荣誉奖项</div></div></div></div></section>
        <section id="about"><div class="container"><h2 class="section-title">🌿 菡萏物语</h2><div class="section-desc">小荷才露尖尖角，早有蜻蜓立上头</div><div class="intro-text"><p>${config.aboutStory || '红谷一小六（13）班又名“菡萏班”，菡萏即荷花花苞，象征纯洁与希望。46位同学如初生的荷，在老师们的浇灌下茁壮成长。'}</p><div class="quote"><i class="fas fa-pen-fancy"></i> 班主任寄语：<br>“${config.teacherMessage}”</div></div></div></section>
        <section id="members"><div class="container"><h2 class="section-title">🌟 荷美少年</h2><div class="section-desc">每一朵荷花都有独特姿态，班级因你们而精彩</div><div class="members-grid" id="membersGrid"></div></div></section>
        <section id="honor"><div class="container"><h2 class="section-title">🏅 荣誉墙</h2><div class="honor-list" id="honorList"></div></div></section>
        <section id="gallery"><div class="container"><h2 class="section-title">📸 光影菡萏</h2><div class="gallery-grid" id="galleryGrid"></div></div></section>
    `;
    main.innerHTML = html;
    
    // 渲染成员
    document.getElementById('membersGrid').innerHTML = config.members.map(m => `
        <div class="member-card">
            <div class="member-avatar"><i class="fas ${m.icon || 'fa-user-graduate'}"></i></div>
            <div class="member-name">${m.name}</div>
            <div class="member-role">${m.role}</div>
            <div class="member-bio">${m.bio}</div>
        </div>
    `).join('');
    
    // 渲染荣誉
    document.getElementById('honorList').innerHTML = config.honors.map(h => `
        <div class="honor-item"><i class="fas ${h.icon || 'fa-medal'}"></i><h4>${h.title}</h4><p>${h.desc}</p></div>
    `).join('');
    
    // 渲染画廊
    document.getElementById('galleryGrid').innerHTML = config.gallery.map(item => {
        if (item.type === 'video') {
            return `<div class="gallery-card"><video controls src="${item.url}" poster="assets/images/video-poster.jpg"></video><div class="gallery-caption">${item.caption}</div></div>`;
        } else {
            return `<div class="gallery-card"><img src="${item.url}" alt="${item.caption}" loading="lazy"><div class="gallery-caption">${item.caption}</div></div>`;
        }
    }).join('');
    
    // 背景音乐
    const bgmAudio = document.getElementById('bgmAudio');
    if (config.bgmUrl) bgmAudio.src = config.bgmUrl;
}

function initMusicControl() {
    const toggleBtn = document.getElementById('bgmToggleBtn');
    const audio = document.getElementById('bgmAudio');
    let playing = false;
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (playing) {
                audio.pause();
                toggleBtn.classList.remove('fa-music');
                toggleBtn.classList.add('fa-volume-mute');
            } else {
                audio.play().catch(e => console.log('自动播放被阻止'));
                toggleBtn.classList.remove('fa-volume-mute');
                toggleBtn.classList.add('fa-music');
            }
            playing = !playing;
        });
    }
    document.getElementById('footerYear').innerText = new Date().getFullYear();
}

window.addEventListener('DOMContentLoaded', async () => {
    const config = await loadConfig();
    renderPage(config);
    initMusicControl();
});