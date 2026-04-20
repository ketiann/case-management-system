// ========================================
// 图表可视化 - 案卷实体治理与知识图谱检索系统
// ========================================

class ChartRenderer {
    constructor() {
        this.colors = {
            primary: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4',
            purple: '#8b5cf6'
        };
    }
    
    // 柱状图
    renderBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = Math.max(20, Math.min(50, (container.clientWidth - 40) / data.length - 10));
        
        let html = '<div style="display: flex; align-items: flex-end; height: 100%; padding: 10px; gap: 8px;">';
        
        data.forEach((item, index) => {
            const height = (item.value / maxValue) * 100;
            const color = options.colors ? options.colors[index % options.colors.length] : this.colors.primary;
            
            html += `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
                    <div style="flex: 1; display: flex; align-items: flex-end; width: 100%;">
                        <div style="
                            width: 100%;
                            height: ${height}%;
                            background: linear-gradient(to top, ${color}, ${color}99);
                            border-radius: 4px 4px 0 0;
                            transition: all 0.3s ease;
                            cursor: pointer;
                            position: relative;
                        " 
                        onmouseover="this.style.opacity='0.8'"
                        onmouseout="this.style.opacity='1'"
                        onclick="drillDownChart('${item.name}')"
                        title="${item.name}: ${item.value}">
                            <span style="
                                position: absolute;
                                top: -20px;
                                left: 50%;
                                transform: translateX(-50%);
                                font-size: 11px;
                                color: var(--text-secondary);
                                white-space: nowrap;
                            ">${item.value}</span>
                        </div>
                    </div>
                    <span style="
                        font-size: 10px;
                        color: var(--text-muted);
                        margin-top: 8px;
                        text-align: center;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: ${barWidth + 10}px;
                    ">${item.name}</span>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // 饼图
    renderPieChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const total = data.reduce((sum, d) => sum + d.value, 0);
        const size = Math.min(container.clientWidth, container.clientHeight) - 40;
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;
        const radius = size / 2 - 20;
        
        let currentAngle = -90;
        const slices = [];
        
        data.forEach(item => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            slices.push({
                ...item,
                startAngle,
                endAngle,
                percentage: ((item.value / total) * 100).toFixed(1)
            });
            
            currentAngle = endAngle;
        });
        
        // 使用 SVG 绘制
        let svg = `<svg width="${container.clientWidth}" height="${container.clientHeight}" style="cursor: pointer;">`;
        
        slices.forEach(slice => {
            const startRad = (slice.startAngle * Math.PI) / 180;
            const endRad = (slice.endAngle * Math.PI) / 180;
            
            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);
            
            const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
            
            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            svg += `
                <path 
                    d="${path}" 
                    fill="${slice.color || this.colors.primary}"
                    stroke="var(--bg-secondary)"
                    stroke-width="2"
                    onclick="drillDownChart('${slice.name}')"
                    onmouseover="this.style.opacity='0.8'"
                    onmouseout="this.style.opacity='1'"
                >
                    <title>${slice.name}: ${slice.value} (${slice.percentage}%)</title>
                </path>
            `;
        });
        
        // 中心圆
        svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.5}" fill="var(--bg-secondary)"/>`;
        
        // 图例
        let legendY = 20;
        slices.forEach(slice => {
            svg += `
                <rect x="10" y="${legendY}" width="12" height="12" fill="${slice.color}" rx="2"/>
                <text x="28" y="${legendY + 10}" fill="var(--text-secondary)" font-size="11">${slice.name}</text>
            `;
            legendY += 20;
        });
        
        svg += '</svg>';
        container.innerHTML = svg;
    }
    
    // 折线图
    renderLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const width = container.clientWidth - padding.left - padding.right;
        const height = container.clientHeight - padding.top - padding.bottom;
        
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;
        
        const xStep = width / (data.length - 1 || 1);
        
        // 计算点坐标
        const points = data.map((d, i) => ({
            x: padding.left + i * xStep,
            y: padding.top + height - ((d.value - minValue) / valueRange) * height,
            ...d
        }));
        
        // 生成路径
        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + height} L ${padding.left} ${padding.top + height} Z`;
        
        let svg = `<svg width="${container.clientWidth}" height="${container.clientHeight}">`;
        
        // 网格线
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (height / 4) * i;
            const value = maxValue - (valueRange / 4) * i;
            
            svg += `
                <line x1="${padding.left}" y1="${y}" x2="${padding.left + width}" y2="${y}" 
                      stroke="var(--border-color)" stroke-dasharray="4"/>
                <text x="${padding.left - 10}" y="${y + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end">
                    ${Math.round(value)}
                </text>
            `;
        }
        
        // 面积
        svg += `<path d="${areaD}" fill="url(#gradient-${containerId})" opacity="0.3"/>`;
        
        // 渐变定义
        svg += `
            <defs>
                <linearGradient id="gradient-${containerId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:var(--primary);stop-opacity:0.5"/>
                    <stop offset="100%" style="stop-color:var(--primary);stop-opacity:0"/>
                </linearGradient>
            </defs>
        `;
        
        // 线条
        svg += `<path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="2"/>`;
        
        // 数据点
        points.forEach(p => {
            svg += `
                <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--primary)" 
                        onclick="drillDownChart('${p.date}')"
                        onmouseover="this.setAttribute('r', '6')"
                        onmouseout="this.setAttribute('r', '4')"
                        style="cursor: pointer;">
                    <title>${p.date}: ${p.value}</title>
                </circle>
            `;
        });
        
        // X轴标签
        points.forEach((p, i) => {
            if (i % Math.ceil(points.length / 7) === 0) {
                svg += `
                    <text x="${p.x}" y="${padding.top + height + 20}" fill="var(--text-muted)" 
                          font-size="10" text-anchor="middle">${p.date}</text>
                `;
            }
        });
        
        svg += '</svg>';
        container.innerHTML = svg;
    }
    
    // 条形图（横向）
    renderHorizontalBarChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const maxValue = Math.max(...data.map(d => d.value));
        
        let html = '<div style="display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 8px;">';
        
        data.forEach(item => {
            const width = (item.value / maxValue) * 100;
            
            html += `
                <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" 
                     onclick="drillDownChart('${item.name}')">
                    <span style="
                        width: 60px;
                        font-size: 11px;
                        color: var(--text-secondary);
                        text-align: right;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    ">${item.name}</span>
                    <div style="flex: 1; height: 20px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                        <div style="
                            height: 100%;
                            width: ${width}%;
                            background: linear-gradient(to right, var(--primary), var(--primary-light));
                            border-radius: 4px;
                            transition: width 0.3s ease;
                            display: flex;
                            align-items: center;
                            justify-content: flex-end;
                            padding-right: 8px;
                        ">
                            <span style="font-size: 10px; color: white; font-weight: 500;">${item.value}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // 散点图（简易地图）
    renderScatterMap(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const maxValue = Math.max(...data.map(d => d.value));
        
        // 简化的北京区域布局
        const regions = {
            '朝阳区': { x: 0.6, y: 0.4 },
            '海淀区': { x: 0.35, y: 0.35 },
            '西城区': { x: 0.45, y: 0.55 },
            '东城区': { x: 0.55, y: 0.55 },
            '丰台区': { x: 0.45, y: 0.75 },
            '通州区': { x: 0.8, y: 0.5 },
            '大兴区': { x: 0.5, y: 0.85 },
            '昌平区': { x: 0.4, y: 0.15 },
            '顺义区': { x: 0.75, y: 0.25 },
            '房山区': { x: 0.25, y: 0.8 }
        };
        
        let svg = `<svg width="${container.clientWidth}" height="${container.clientHeight}" style="cursor: pointer;">`;
        
        // 背景
        svg += `<rect width="100%" height="100%" fill="var(--bg-tertiary)" rx="8"/>`;
        
        // 绘制点
        data.forEach(item => {
            const pos = regions[item.name] || { x: Math.random(), y: Math.random() };
            const x = pos.x * container.clientWidth;
            const y = pos.y * container.clientHeight;
            const radius = Math.max(8, (item.value / maxValue) * 25);
            
            svg += `
                <circle cx="${x}" cy="${y}" r="${radius}" fill="var(--primary)" opacity="0.6"
                        onclick="drillDownChart('${item.name}')"
                        onmouseover="this.setAttribute('opacity', '1')"
                        onmouseout="this.setAttribute('opacity', '0.6')">
                    <title>${item.name}: ${item.value}件</title>
                </circle>
                <text x="${x}" y="${y + radius + 12}" fill="var(--text-muted)" font-size="9" text-anchor="middle">
                    ${item.name}
                </text>
            `;
        });
        
        svg += '</svg>';
        container.innerHTML = svg;
    }
}

// 全局图表渲染器
const chartRenderer = new ChartRenderer();

// 初始化所有图表
function initCharts() {
    // 单位办案量柱状图
    chartRenderer.renderBarChart('unitChart', UNIT_CHART_DATA, {
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    });
    
    // 案件类型饼图
    chartRenderer.renderPieChart('typeChart', TYPE_CHART_DATA);
    
    // 时间趋势折线图
    chartRenderer.renderLineChart('trendChart', TREND_DATA.day);
    
    // 地点分布散点图
    chartRenderer.renderScatterMap('locationChart', LOCATION_DATA);
    
    // 标签统计条形图
    chartRenderer.renderHorizontalBarChart('tagChart', TAG_CHART_DATA);
    
    // 上传量曲线图
    chartRenderer.renderLineChart('uploadChart', UPLOAD_DATA);
}

// 页面加载后初始化图表
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保容器已渲染
    setTimeout(initCharts, 100);
});

// 窗口大小变化时重新渲染
window.addEventListener('resize', () => {
    clearTimeout(window.chartResizeTimeout);
    window.chartResizeTimeout = setTimeout(initCharts, 300);
});

// 切换时间维度
function switchTrendPeriod(period) {
    const data = TREND_DATA[period] || TREND_DATA.day;
    chartRenderer.renderLineChart('trendChart', data);
}

// 图表控制按钮事件
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.chart-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.dataset.period;
            if (period) {
                switchTrendPeriod(period);
            }
        });
    });
});
