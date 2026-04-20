// ========================================
// 主应用逻辑 - 案卷实体治理与知识图谱检索系统
// ========================================

// 全局状态
const AppState = {
    currentPage: 'upload',
    currentCase: null,
    selectedCases: [],
    filters: {
        startDate: null,
        endDate: null,
        units: [],
        tags: []
    },
    searchQuery: '',
    sortColumn: 'time',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initUpload();
    initTable();
    initSearch();
    initTimelineControls();
    initChartControls();
    updateTime();
    
    // 默认加载案卷列表
    renderCaseTable();
});

// ========================================
// 导航系统
// ========================================

function initNavigation() {
    // 导航链接点击
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
    
    // 全局搜索回车
    document.getElementById('globalSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performGlobalSearch();
        }
    });
}

function navigateTo(page, data = null) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 显示目标页面
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = page;
        
        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
        
        // 页面特定初始化
        switch (page) {
            case 'search':
                if (data && data.query) {
                    document.getElementById('mainSearchInput').value = data.query;
                    performSearch();
                }
                break;
            case 'detail':
                if (data && data.caseId) {
                    loadCaseDetail(data.caseId);
                }
                break;
            case 'graph':
                initFullGraph(data);
                break;
            case 'dashboard':
                updateDashboard();
                break;
        }
    }
}

function goBack() {
    // 简单的返回逻辑
    const history = ['upload', 'search', 'dashboard'];
    const currentIndex = history.indexOf(AppState.currentPage);
    if (currentIndex > 0) {
        navigateTo(history[currentIndex - 1]);
    } else {
        navigateTo('upload');
    }
}

// ========================================
// 上传功能
// ========================================

function initUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    // 点击上传
    dropZone.addEventListener('click', () => fileInput.click());
    
    // 拖拽上传
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    // 验证文件类型
    const validTypes = ['docx', 'pdf', 'png', 'jpg', 'jpeg'];
    const invalidFiles = Array.from(files).filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return !validTypes.includes(ext);
    });
    
    if (invalidFiles.length > 0) {
        alert('仅支持 docx/pdf/png/jpg 格式的文件');
        return;
    }
    
    // 存储待上传文件
    AppState.pendingFiles = Array.from(files);
    updateUploadArea();
}

function updateUploadArea() {
    const dropZone = document.getElementById('dropZone');
    if (AppState.pendingFiles && AppState.pendingFiles.length > 0) {
        const fileNames = AppState.pendingFiles.map(f => f.name).join(', ');
        dropZone.querySelector('.upload-text').textContent = `已选择 ${AppState.pendingFiles.length} 个文件`;
        dropZone.querySelector('.upload-hint').textContent = fileNames;
    }
}

function startUpload() {
    const unit = document.getElementById('unitSelect').value;
    const tag = document.getElementById('tagSelect').value;
    
    if (!unit || !tag) {
        alert('请选择归属单位和业务标签');
        return;
    }
    
    if (!AppState.pendingFiles || AppState.pendingFiles.length === 0) {
        alert('请先选择要上传的文件');
        return;
    }
    
    // 显示上传进度弹窗
    openModal('uploadProgressModal');
    simulateUpload();
}

function simulateUpload() {
    let progress = 0;
    const progressFill = document.getElementById('uploadProgress');
    const progressText = document.getElementById('uploadPercent');
    const fileName = document.getElementById('currentFile');
    
    fileName.querySelector('.file-name').textContent = AppState.pendingFiles[0].name;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                closeModal('uploadProgressModal');
                showExtractionResult();
            }, 500);
        }
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = Math.round(progress);
    }, 200);
}

function showExtractionResult() {
    // 模拟抽取结果
    const persons = ['张三', '李四', '王五'];
    const units = ['派出所', '刑侦大队'];
    const events = ['盗窃案', '故意伤害案'];
    
    document.getElementById('personEntities').innerHTML = persons.map(p => 
        `<span class="entity-tag person">${p}</span>`
    ).join('');
    
    document.getElementById('unitEntities').innerHTML = units.map(u => 
        `<span class="entity-tag unit">${u}</span>`
    ).join('');
    
    document.getElementById('eventEntities').innerHTML = events.map(e => 
        `<span class="entity-tag event">${e}</span>`
    ).join('');
    
    openModal('extractionModal');
}

function confirmExtraction() {
    closeModal('extractionModal');
    
    // 添加新案卷到列表
    const newCase = {
        id: `AJ2026${String(CASES_DATA.length + 1).padStart(3, '0')}`,
        name: '新上传案卷',
        type: '刑事案卷',
        unit: document.getElementById('unitSelect').value,
        tags: [document.getElementById('tagSelect').value],
        uploadTime: new Date().toLocaleString('zh-CN'),
        persons: [{ name: '张三', role: '嫌疑人' }],
        status: 'pending'
    };
    
    CASES_DATA.unshift(newCase);
    renderCaseTable();
    
    // 重置上传区域
    AppState.pendingFiles = [];
    document.getElementById('dropZone').querySelector('.upload-text').textContent = '拖拽文件到此处或点击上传';
    document.getElementById('dropZone').querySelector('.upload-hint').textContent = '支持 docx / pdf / png / jpg 格式';
    document.getElementById('unitSelect').value = '';
    document.getElementById('tagSelect').value = '';
    
    alert('案卷上传成功，实体抽取完成！');
}

// ========================================
// 案卷列表
// ========================================

function initTable() {
    // 排序功能
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            if (AppState.sortColumn === column) {
                AppState.sortOrder = AppState.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                AppState.sortColumn = column;
                AppState.sortOrder = 'desc';
            }
            renderCaseTable();
        });
    });
}

function renderCaseTable() {
    const tbody = document.getElementById('caseTableBody');
    let data = [...CASES_DATA];
    
    // 排序
    data.sort((a, b) => {
        let aVal = a[AppState.sortColumn];
        let bVal = b[AppState.sortColumn];
        
        if (AppState.sortColumn === 'time') {
            aVal = new Date(a.uploadTime);
            bVal = new Date(b.uploadTime);
        }
        
        if (AppState.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    // 分页
    const start = (AppState.page - 1) * AppState.pageSize;
    const end = start + AppState.pageSize;
    const pageData = data.slice(start, end);
    
    // 渲染
    tbody.innerHTML = pageData.map(c => `
        <tr onclick="viewCaseDetail('${c.id}')">
            <td><span class="entity-link" onclick="event.stopPropagation(); searchBy('${c.id}')">${c.id}</span></td>
            <td><span class="entity-link" onclick="event.stopPropagation(); searchBy('${c.name}')">${c.name}</span></td>
            <td>${c.type}</td>
            <td><span class="entity-link" onclick="event.stopPropagation(); searchBy('${UNIT_MAP[c.unit]}')">${UNIT_MAP[c.unit]}</span></td>
            <td>${c.tags.map(t => `<span class="tag">${TAG_MAP[t]}</span>`).join('')}</td>
            <td>${c.uploadTime}</td>
            <td>${renderPersons(c.persons)}</td>
            <td><span class="status-tag ${c.status}">${STATUS_MAP[c.status]}</span></td>
            <td>
                <div class="action-btns" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="viewCaseDetail('${c.id}')">查看</button>
                    <button class="action-btn" onclick="viewInGraph('${c.id}')">图谱</button>
                    <button class="action-btn" onclick="viewTimeline('${c.id}')">时间轴</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // 更新统计
    document.getElementById('totalCount').textContent = data.length;
    document.getElementById('currentPage').textContent = AppState.page;
}

function renderPersons(persons) {
    const display = persons.slice(0, 3);
    const more = persons.length > 3 ? persons.length - 3 : 0;
    
    let html = '<div class="person-list">';
    display.forEach(p => {
        html += `<span class="person-tag" onclick="event.stopPropagation(); searchBy('${p.name}')">${p.name}</span>`;
    });
    if (more > 0) {
        html += `<span class="person-more" title="${persons.slice(3).map(p => p.name).join(', ')}">+${more}</span>`;
    }
    html += '</div>';
    
    return html;
}

function changePage(delta) {
    const maxPage = Math.ceil(CASES_DATA.length / AppState.pageSize);
    AppState.page = Math.max(1, Math.min(maxPage, AppState.page + delta));
    renderCaseTable();
}

function viewCaseDetail(caseId) {
    navigateTo('detail', { caseId });
}

function viewInGraph(caseId) {
    navigateTo('graph', { caseId });
}

function viewTimeline(caseId) {
    navigateTo('detail', { caseId });
}

// ========================================
// 检索功能
// ========================================

function initSearch() {
    // 主搜索框回车
    document.getElementById('mainSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performGlobalSearch() {
    const query = document.getElementById('globalSearch').value.trim();
    if (query) {
        navigateTo('search', { query });
    }
}

function performSearch() {
    const query = document.getElementById('mainSearchInput').value.trim();
    AppState.searchQuery = query;
    
    if (!query) {
        document.getElementById('searchResultsList').innerHTML = '<p style="padding: 20px; color: var(--text-muted);">请输入检索关键词</p>';
        document.getElementById('searchResultCount').textContent = '0';
        return;
    }
    
    // 模拟搜索
    const results = CASES_DATA.filter(c => {
        const searchText = `${c.id} ${c.name} ${UNIT_MAP[c.unit]} ${c.location || ''} ${c.persons.map(p => p.name).join(' ')}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    renderSearchResults(results);
    renderSearchGraph(results);
}

function renderSearchResults(results) {
    const container = document.getElementById('searchResultsList');
    document.getElementById('searchResultCount').textContent = results.length;
    
    if (results.length === 0) {
        container.innerHTML = '<p style="padding: 20px; color: var(--text-muted);">未找到相关结果</p>';
        return;
    }
    
    container.innerHTML = results.map(c => `
        <div class="result-card" onclick="viewCaseDetail('${c.id}')">
            <div class="result-title">${c.name} (${c.id})</div>
            <div class="result-summary">
                ${c.summary ? c.summary.substring(0, 100) + '...' : '暂无摘要'}
            </div>
            <div class="result-meta">
                <span>📅 ${c.occurTime || c.uploadTime}</span>
                <span>📍 ${c.location || '未知'}</span>
                <span>👥 ${c.persons.map(p => `<span class="entity-link" onclick="event.stopPropagation(); searchBy('${p.name}')">${p.name}</span>`).join('、')}</span>
            </div>
            <div class="result-tags">
                <span class="tag">${UNIT_MAP[c.unit]}</span>
                ${c.tags.map(t => `<span class="tag">${TAG_MAP[t]}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderSearchGraph(results) {
    // 简化的图谱预览
    const canvas = document.getElementById('searchGraphCanvas');
    canvas.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
            <div style="text-align: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                </svg>
                <p>找到 ${results.length} 个关联节点</p>
                <button class="btn btn-sm btn-primary" style="margin-top: 12px;" onclick="navigateTo('graph')">
                    查看完整图谱
                </button>
            </div>
        </div>
    `;
}

function searchBy(keyword) {
    document.getElementById('globalSearch').value = keyword;
    performGlobalSearch();
}

function clearSearch() {
    document.getElementById('mainSearchInput').value = '';
    AppState.searchQuery = '';
    AppState.filters = { startDate: null, endDate: null, units: [], tags: [] };
    document.getElementById('searchResultsList').innerHTML = '';
    document.getElementById('searchResultCount').textContent = '0';
    document.getElementById('activeFilters').innerHTML = '';
}

// ========================================
// 筛选功能
// ========================================

function openFilterModal() {
    openModal('filterModal');
}

function applyFilters() {
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const units = Array.from(document.querySelectorAll('#filterUnits input:checked')).map(cb => cb.value);
    const tags = Array.from(document.querySelectorAll('#filterTags input:checked')).map(cb => cb.value);
    
    AppState.filters = { startDate, endDate, units, tags };
    
    // 显示筛选标签
    renderActiveFilters();
    
    closeModal('filterModal');
    performSearch();
}

function renderActiveFilters() {
    const container = document.getElementById('activeFilters');
    let chips = [];
    
    if (AppState.filters.startDate) {
        chips.push(`<span class="filter-chip">开始: ${AppState.filters.startDate} <span class="remove" onclick="removeFilter('startDate')">×</span></span>`);
    }
    if (AppState.filters.endDate) {
        chips.push(`<span class="filter-chip">结束: ${AppState.filters.endDate} <span class="remove" onclick="removeFilter('endDate')">×</span></span>`);
    }
    AppState.filters.units.forEach(u => {
        chips.push(`<span class="filter-chip">${UNIT_MAP[u]} <span class="remove" onclick="removeFilter('unit', '${u}')">×</span></span>`);
    });
    AppState.filters.tags.forEach(t => {
        chips.push(`<span class="filter-chip">${TAG_MAP[t]} <span class="remove" onclick="removeFilter('tag', '${t}')">×</span></span>`);
    });
    
    container.innerHTML = chips.join('');
}

function removeFilter(type, value) {
    if (type === 'startDate') AppState.filters.startDate = null;
    else if (type === 'endDate') AppState.filters.endDate = null;
    else if (type === 'unit') {
        AppState.filters.units = AppState.filters.units.filter(u => u !== value);
    }
    else if (type === 'tag') {
        AppState.filters.tags = AppState.filters.tags.filter(t => t !== value);
    }
    
    renderActiveFilters();
    performSearch();
}

function resetFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.querySelectorAll('#filterUnits input, #filterTags input').forEach(cb => cb.checked = false);
}

// ========================================
// 案卷详情
// ========================================

function loadCaseDetail(caseId) {
    const caseData = CASES_DATA.find(c => c.id === caseId);
    if (!caseData) {
        alert('案卷不存在');
        goBack();
        return;
    }
    
    AppState.currentCase = caseData;
    
    // 渲染信息卡
    document.getElementById('caseInfoCard').innerHTML = `
        <h2>${caseData.name}</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">案件编号</span>
                <span class="info-value clickable" onclick="searchBy('${caseData.id}')">${caseData.id}</span>
            </div>
            <div class="info-item">
                <span class="info-label">案发时间</span>
                <span class="info-value">${caseData.occurTime || '未知'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">案发地点</span>
                <span class="info-value clickable" onclick="searchBy('${caseData.location}')">${caseData.location || '未知'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">办理单位</span>
                <span class="info-value clickable" onclick="searchBy('${UNIT_MAP[caseData.unit]}')">${UNIT_MAP[caseData.unit]}</span>
            </div>
            <div class="info-item">
                <span class="info-label">办案民警</span>
                <span class="info-value clickable" onclick="searchBy('${caseData.police?.name}')">${caseData.police?.name || '未知'} (${caseData.police?.badge || ''})</span>
            </div>
            <div class="info-item">
                <span class="info-label">案件状态</span>
                <span class="info-value"><span class="status-tag ${caseData.status}">${STATUS_MAP[caseData.status]}</span></span>
            </div>
        </div>
        <div class="involved-persons">
            <h4>涉案人员</h4>
            <div class="person-chips">
                ${caseData.persons.map(p => `
                    <span class="person-chip" onclick="searchBy('${p.name}')">
                        ${p.name}
                        <span class="role">${p.role}</span>
                    </span>
                `).join('')}
            </div>
        </div>
    `;
    
    // 渲染文档内容
    document.getElementById('documentBody').innerHTML = `
        <div class="doc-section">
            <h4>案情摘要</h4>
            <p>${caseData.summary || '暂无'}</p>
        </div>
        <div class="doc-section">
            <h4>涉案人员</h4>
            <p>${caseData.persons.map(p => `<span class="entity-link" onclick="searchBy('${p.name}')">${p.name}</span>(${p.role})`).join('、')}</p>
        </div>
        <div class="doc-section">
            <h4>办案民警</h4>
            <p><span class="entity-link" onclick="searchBy('${caseData.police?.name}')">${caseData.police?.name || '未知'}</span>（警号：${caseData.police?.badge || '未知'}）</p>
        </div>
        <div class="doc-section">
            <h4>证据材料</h4>
            <p>${caseData.evidence ? caseData.evidence.join('、') : '暂无'}</p>
        </div>
        <div class="doc-section">
            <h4>处理结果</h4>
            <p>${caseData.result || '暂无'}</p>
        </div>
    `;
    
    // 渲染时间轴
    renderTimeline(caseData);
}

function renderTimeline(caseData) {
    const events = [
        { time: caseData.occurTime, title: '案发时间', desc: caseData.location || '' },
        { time: caseData.reportTime, title: '报案时间', desc: '群众报警' },
        { time: caseData.reportTime ? addHours(caseData.reportTime, 0.5) : null, title: '接警时间', desc: '警方接警' },
        { time: caseData.reportTime ? addHours(caseData.reportTime, 1) : null, title: '到场时间', desc: '民警到达现场' },
        { time: caseData.reportTime ? addHours(caseData.reportTime, 2) : null, title: '勘查时间', desc: '现场勘查取证' },
        { time: caseData.uploadTime, title: '立案时间', desc: '案件正式立案' },
        { time: caseData.status === 'closed' ? addDays(caseData.uploadTime, 7) : null, title: '办结时间', desc: caseData.result || '' }
    ].filter(e => e.time);
    
    const container = document.getElementById('timelineBody');
    container.innerHTML = events.map((e, i) => `
        <div class="timeline-item ${i === 0 ? 'active' : ''}" onclick="selectTimelineItem(this)">
            <div class="timeline-time">${e.time}</div>
            <div class="timeline-title">${e.title}</div>
            <div class="timeline-desc">${e.desc}</div>
        </div>
    `).join('');
}

function selectTimelineItem(element) {
    document.querySelectorAll('.timeline-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
}

function initTimelineControls() {
    document.querySelectorAll('.timeline-controls .toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.timeline-controls .toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // 可以根据视图切换调整时间轴显示
        });
    });
}

function addHours(dateStr, hours) {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + hours);
    return date.toLocaleString('zh-CN');
}

function addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toLocaleString('zh-CN');
}

// ========================================
// 弹窗管理
// ========================================

function openModal(modalId) {
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById(modalId).classList.remove('active');
}

// 点击遮罩关闭
document.getElementById('modalOverlay')?.addEventListener('click', () => {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modalOverlay').classList.remove('active');
});

// ========================================
// 批量操作
// ========================================

function openBatchModal() {
    document.getElementById('selectedCount').textContent = AppState.selectedCases.length;
    openModal('batchModal');
}

function batchAudit() {
    alert('批量审核功能开发中...');
    closeModal('batchModal');
}

function batchTag() {
    alert('批量打标签功能开发中...');
    closeModal('batchModal');
}

function batchExport() {
    alert('批量导出功能开发中...');
    closeModal('batchModal');
}

// ========================================
// 驾驶舱
// ========================================

function updateDashboard() {
    document.getElementById('totalCases').textContent = DASHBOARD_STATS.totalCases.toLocaleString();
    document.getElementById('todayUpload').textContent = DASHBOARD_STATS.todayUpload;
    document.getElementById('totalPersons').textContent = DASHBOARD_STATS.totalPersons.toLocaleString();
    document.getElementById('closedCases').textContent = DASHBOARD_STATS.closedCases;
    document.getElementById('activeCases').textContent = DASHBOARD_STATS.activeCases;
    document.getElementById('totalUnits').textContent = DASHBOARD_STATS.totalUnits;
}

function updateTime() {
    document.getElementById('updateTime').textContent = new Date().toLocaleString('zh-CN');
}

function drillDown(type) {
    switch (type) {
        case 'total':
            navigateTo('upload');
            break;
        case 'today':
            navigateTo('upload');
            break;
        case 'persons':
            navigateTo('search');
            break;
        case 'status':
            navigateTo('upload');
            break;
        case 'units':
            navigateTo('graph');
            break;
    }
}

function drillDownChart(chartType) {
    navigateTo('search');
}

function initChartControls() {
    document.querySelectorAll('.chart-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const siblings = btn.parentElement.querySelectorAll('.chart-toggle');
            siblings.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // 更新图表
        });
    });
}

function viewLatestCases() {
    navigateTo('upload');
}

function openQuickSearch() {
    navigateTo('search');
}

// ========================================
// 工具函数
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
