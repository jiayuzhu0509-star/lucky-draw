// 抽奖程序 JavaScript

// 全局变量
let participants = []; // 所有参与者
let winners = []; // 已中奖者
let resultCount = 0; // 中奖结果编号

// DOM 元素
const participantsInput = document.getElementById('participantsInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const totalCount = document.getElementById('totalCount');
const prizeName = document.getElementById('prizeName');
const prizeCount = document.getElementById('prizeCount');
const drawBtn = document.getElementById('drawBtn');
const results = document.getElementById('results');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const winnerNames = document.getElementById('winnerNames');
const confirmBtn = document.getElementById('confirmBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    updateTotalCount();
});

// 添加参与者
addBtn.addEventListener('click', () => {
    const text = participantsInput.value.trim();
    if (!text) {
        alert('请输入参与者姓名');
        return;
    }

    const names = text.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

    if (names.length === 0) {
        alert('请输入有效的姓名');
        return;
    }

    // 添加新名字到列表
    const newNames = names.filter(name => !participants.includes(name));
    participants.push(...newNames);

    // 清空输入框
    participantsInput.value = '';
    participants = [...new Set(participants)]; // 去重

    updateTotalCount();
    saveToStorage();

    if (newNames.length > 0) {
        showToast(`成功添加 ${newNames.length} 位参与者`);
    } else {
        showToast('所有名字已存在');
    }
});

// 清空列表
clearBtn.addEventListener('click', () => {
    if (participants.length === 0) {
        showToast('列表已经是空的');
        return;
    }

    if (confirm('确定要清空所有参与者吗？')) {
        participants = [];
        winners = [];
        resultCount = 0;
        participantsInput.value = '';
        updateTotalCount();
        clearResults();
        saveToStorage();
        showToast('已清空所有数据');
    }
});

// 更新总数
function updateTotalCount() {
    totalCount.textContent = participants.length;
}

// 开始抽奖
drawBtn.addEventListener('click', () => {
    const count = parseInt(prizeCount.value) || 1;
    const prize = prizeName.value.trim() || '奖项';

    // 验证
    if (participants.length === 0) {
        alert('请先添加参与者！');
        participantsInput.focus();
        return;
    }

    // 计算剩余可抽奖人数
    const remaining = participants.filter(p => !winners.includes(p));

    if (remaining.length === 0) {
        alert('所有参与者都已中奖！');
        return;
    }

    if (count > remaining.length) {
        alert(`剩余可抽奖人数不足！当前剩余 ${remaining.length} 人`);
        return;
    }

    // 禁用按钮
    drawBtn.disabled = true;
    drawBtn.querySelector('.btn-text').textContent = '抽奖中...';

    // 开始抽奖动画
    startLotteryAnimation(count, prize, remaining);
});

// 抽奖动画
function startLotteryAnimation(count, prize, remaining) {
    let animationCount = 0;
    const totalAnimations = 15; // 动画次数

    const interval = setInterval(() => {
        animationCount++;

        // 随机显示名字
        const randomNames = [];
        const tempRemaining = [...remaining];

        for (let i = 0; i < Math.min(count, 3); i++) {
            if (tempRemaining.length > 0) {
                const randomIndex = Math.floor(Math.random() * tempRemaining.length);
                randomNames.push(tempRemaining[randomIndex]);
                tempRemaining.splice(randomIndex, 1);
            }
        }

        if (animationCount >= totalAnimations) {
            clearInterval(interval);
            finalizeLottery(count, prize, remaining);
        }
    }, 100);
}

// 完成抽奖
function finalizeLottery(count, prize, remaining) {
    // 随机抽取中奖者
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, count);

    // 添加到已中奖列表
    winners.push(...selectedWinners);

    // 创建结果
    resultCount++;
    addResult(prize, selectedWinners);

    // 显示弹窗
    showModal(prize, selectedWinners);

    // 保存到存储
    saveToStorage();

    // 恢复按钮
    setTimeout(() => {
        drawBtn.disabled = false;
        drawBtn.querySelector('.btn-text').textContent = '开始抽奖';
    }, 500);
}

// 显示弹窗
function showModal(prize, winnersList) {
    modalTitle.textContent = `🎉 ${prize} - 中奖公告`;

    winnerNames.innerHTML = '';
    winnersList.forEach((name, index) => {
        const span = document.createElement('span');
        span.className = 'winner-name';
        span.textContent = name;
        span.style.animationDelay = `${index * 0.1}s`;
        winnerNames.appendChild(span);
    });

    modal.classList.add('show');
}

// 关闭弹窗
function closeModal() {
    modal.classList.remove('show');
}

confirmBtn.addEventListener('click', closeModal);
closeModalBtn.addEventListener('click', closeModal);

// 点击弹窗外部关闭
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// 添加结果到列表
function addResult(prize, winnersList) {
    // 移除空状态
    const emptyState = results.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const card = document.createElement('div');
    card.className = 'result-card';

    const header = document.createElement('div');
    header.className = 'result-header';

    const title = document.createElement('span');
    title.className = 'prize-title';
    title.textContent = prize;

    const countBadge = document.createElement('span');
    countBadge.className = 'winner-count';
    countBadge.textContent = `${winnersList.length} 人`;

    header.appendChild(title);
    header.appendChild(countBadge);

    const list = document.createElement('div');
    list.className = 'winners-list';

    winnersList.forEach((name, index) => {
        const item = document.createElement('span');
        item.className = 'winner-item';
        item.textContent = name;
        item.style.animationDelay = `${index * 0.05}s`;
        list.appendChild(item);
    });

    card.appendChild(header);
    card.appendChild(list);

    // 添加到列表顶部
    results.insertBefore(card, results.firstChild);
}

// 清空结果
function clearResults() {
    results.innerHTML = '<div class="empty-state">还没有人中奖，快来抽奖吧！</div>';
}

// 本地存储
function saveToStorage() {
    const data = {
        participants,
        winners,
        resultCount
    };
    localStorage.setItem('luckyDrawData', JSON.stringify(data));
}

function loadFromStorage() {
    try {
        const data = localStorage.getItem('luckyDrawData');
        if (data) {
            const parsed = JSON.parse(data);
            participants = parsed.participants || [];
            winners = parsed.winners || [];
            resultCount = parsed.resultCount || 0;

            // 恢复参与者列表到输入框
            participantsInput.value = participants.join('\n');

            // 恢复结果（需要重新渲染）
            restoreResults();
        }
    } catch (e) {
        console.error('加载数据失败:', e);
    }
}

// 恢复结果（简化版本）
function restoreResults() {
    if (winners.length > 0) {
        // 简单清空，因为完整恢复需要保存奖项信息
        clearResults();
    }
}

// 显示提示
function showToast(message) {
    // 简单的提示效果
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Enter 键添加参与者（当焦点在输入框时）
    if (e.key === 'Enter' && document.activeElement === participantsInput && !e.shiftKey) {
        e.preventDefault();
        addBtn.click();
    }

    // Escape 关闭弹窗
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});