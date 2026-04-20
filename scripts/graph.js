// ========================================
// 知识图谱可视化 - 案卷实体治理与知识图谱检索系统
// ========================================

class KnowledgeGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas?.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        this.hoveredNode = null;
        this.offset = { x: 0, y: 0 };
        this.scale = 1;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.showLocation = true;
        
        if (this.canvas) {
            this.init();
        }
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.onTouchEnd());
    }
    
    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }
    
    loadData(nodes, edges) {
        this.nodes = nodes.map((n, i) => ({
            ...n,
            x: this.canvas ? this.canvas.width / 2 + (Math.random() - 0.5) * 400 : 0,
            y: this.canvas ? this.canvas.height / 2 + (Math.random() - 0.5) * 300 : 0,
            vx: 0,
            vy: 0,
            radius: n.type === 'event' ? 30 : 25
        }));
        
        this.edges = edges;
        this.simulate();
    }
    
    simulate() {
        // 简单的力导向布局
        const iterations = 100;
        const k = 0.1; // 弹簧常数
        const repulsion = 5000; // 斥力
        const damping = 0.9;
        
        for (let iter = 0; iter < iterations; iter++) {
            // 计算斥力
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[j].x - this.nodes[i].x;
                    const dy = this.nodes[j].y - this.nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = repulsion / (dist * dist);
                    
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    
                    this.nodes[i].vx -= fx;
                    this.nodes[i].vy -= fy;
                    this.nodes[j].vx += fx;
                    this.nodes[j].vy += fy;
                }
            }
            
            // 计算引力（边）
            for (const edge of this.edges) {
                const source = this.nodes.find(n => n.id === edge.source);
                const target = this.nodes.find(n => n.id === edge.target);
                
                if (source && target) {
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (dist - 150) * k;
                    
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    
                    source.vx += fx;
                    source.vy += fy;
                    target.vx -= fx;
                    target.vy -= fy;
                }
            }
            
            // 更新位置
            for (const node of this.nodes) {
                node.vx *= damping;
                node.vy *= damping;
                node.x += node.vx;
                node.y += node.vy;
                
                // 边界约束
                const margin = 50;
                node.x = Math.max(margin, Math.min(this.canvas.width - margin, node.x));
                node.y = Math.max(margin, Math.min(this.canvas.height - margin, node.y));
            }
        }
        
        this.render();
    }
    
    render() {
        if (!this.ctx) return;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 应用变换
        this.ctx.save();
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.scale, this.scale);
        
        // 绘制边
        for (const edge of this.edges) {
            const source = this.nodes.find(n => n.id === edge.source);
            const target = this.nodes.find(n => n.id === edge.target);
            
            if (source && target) {
                // 过滤地点节点
                if (!this.showLocation && (source.type === 'location' || target.type === 'location')) {
                    continue;
                }
                
                this.drawEdge(source, target, edge.relation);
            }
        }
        
        // 绘制节点
        for (const node of this.nodes) {
            // 过滤地点节点
            if (!this.showLocation && node.type === 'location') {
                continue;
            }
            
            const isSelected = this.selectedNode && this.selectedNode.id === node.id;
            const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
            
            this.drawNode(node, isSelected, isHovered);
        }
        
        this.ctx.restore();
    }
    
    drawNode(node, isSelected, isHovered) {
        const ctx = this.ctx;
        const colors = {
            person: '#ef4444',
            unit: '#3b82f6',
            event: '#10b981',
            location: '#f59e0b'
        };
        
        const color = colors[node.type] || '#64748b';
        const radius = node.radius;
        
        // 发光效果
        if (isSelected || isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                node.x, node.y, radius,
                node.x, node.y, radius + 20
            );
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        // 节点圆
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? color : color + '20';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
        
        // 节点文字
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '12px "Noto Sans SC"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 截断长文本
        const maxLen = 6;
        const text = node.name.length > maxLen ? node.name.substring(0, maxLen) + '...' : node.name;
        ctx.fillText(text, node.x, node.y);
        
        // 标签
        ctx.font = '10px "Noto Sans SC"';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(node.label, node.x, node.y + radius + 14);
    }
    
    drawEdge(source, target, relation) {
        const ctx = this.ctx;
        
        // 计算箭头位置
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        
        const startX = source.x + nx * source.radius;
        const startY = source.y + ny * source.radius;
        const endX = target.x - nx * target.radius;
        const endY = target.y - ny * target.radius;
        
        // 绘制线
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 绘制箭头
        const arrowSize = 8;
        const angle = Math.atan2(endY - startY, endX - startX);
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#475569';
        ctx.fill();
        
        // 绘制关系文字
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        ctx.font = '10px "Noto Sans SC"';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 背景
        const textWidth = ctx.measureText(relation).width;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16);
        
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(relation, midX, midY);
    }
    
    getNodeAt(x, y) {
        const canvasX = (x - this.offset.x) / this.scale;
        const canvasY = (y - this.offset.y) / this.scale;
        
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (!this.showLocation && node.type === 'location') continue;
            
            const dx = canvasX - node.x;
            const dy = canvasY - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= node.radius) {
                return node;
            }
        }
        return null;
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const node = this.getNodeAt(x, y);
        
        if (node) {
            this.selectedNode = node;
            this.showNodeInfo(node);
        } else {
            this.isDragging = true;
            this.dragStart = { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
        }
        
        this.render();
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isDragging) {
            this.offset.x = e.clientX - this.dragStart.x;
            this.offset.y = e.clientY - this.dragStart.y;
            this.render();
        } else {
            const node = this.getNodeAt(x, y);
            if (node !== this.hoveredNode) {
                this.hoveredNode = node;
                this.canvas.style.cursor = node ? 'pointer' : 'grab';
                this.render();
            }
        }
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(0.5, Math.min(3, this.scale * delta));
        this.render();
    }
    
    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const node = this.getNodeAt(x, y);
        if (node) {
            // 双击跳转到详情
            if (node.type === 'event' && node.caseId) {
                navigateTo('detail', { caseId: node.caseId });
            } else if (node.type === 'person') {
                searchBy(node.name);
            } else if (node.type === 'unit') {
                searchBy(node.name);
            }
        }
    }
    
    onTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const node = this.getNodeAt(x, y);
            if (node) {
                this.selectedNode = node;
                this.showNodeInfo(node);
                this.render();
            } else {
                this.isDragging = true;
                this.dragStart = { x: touch.clientX - this.offset.x, y: touch.clientY - this.offset.y };
            }
        }
    }
    
    onTouchMove(e) {
        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            this.offset.x = touch.clientX - this.dragStart.x;
            this.offset.y = touch.clientY - this.dragStart.y;
            this.render();
        }
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    showNodeInfo(node) {
        const panel = document.getElementById('graphInfoPanel');
        const details = document.getElementById('graphNodeDetails');
        
        if (panel && details) {
            const typeNames = {
                person: '人物',
                unit: '单位',
                event: '事件',
                location: '地点'
            };
            
            details.innerHTML = `
                <div class="info-item">
                    <span class="info-label">类型</span>
                    <span class="info-value">${typeNames[node.type]}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">名称</span>
                    <span class="info-value">${node.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">标签</span>
                    <span class="info-value">${node.label}</span>
                </div>
                ${node.caseId ? `
                <div class="info-item">
                    <span class="info-label">案件编号</span>
                    <span class="info-value">${node.caseId}</span>
                </div>
                ` : ''}
            `;
            
            panel.classList.add('visible');
        }
    }
    
    reset() {
        this.offset = { x: 0, y: 0 };
        this.scale = 1;
        this.selectedNode = null;
        this.render();
    }
    
    toggleLocation() {
        this.showLocation = !this.showLocation;
        this.render();
        return this.showLocation;
    }
}

// 全局图谱实例
let fullGraph = null;

// 初始化全屏图谱
function initFullGraph(data) {
    if (!fullGraph) {
        fullGraph = new KnowledgeGraph('fullGraphCanvas');
    }
    
    // 加载数据
    fullGraph.loadData(GRAPH_NODES, GRAPH_EDGES);
    
    // 如果有特定案件，高亮相关节点
    if (data && data.caseId) {
        const caseNode = GRAPH_NODES.find(n => n.caseId === data.caseId);
        if (caseNode) {
            fullGraph.selectedNode = caseNode;
        }
    }
}

// 重置图谱
function resetGraph() {
    if (fullGraph) {
        fullGraph.reset();
    }
}

// 切换地点节点显示
function toggleLocationNodes() {
    if (fullGraph) {
        const show = fullGraph.toggleLocation();
        const btn = document.getElementById('toggleLocationBtn');
        btn.textContent = show ? '隐藏地点/物品' : '显示地点/物品';
    }
}

// 查看节点时间轴
function viewNodeTimeline() {
    if (fullGraph && fullGraph.selectedNode) {
        const node = fullGraph.selectedNode;
        if (node.type === 'event' && node.caseId) {
            navigateTo('detail', { caseId: node.caseId });
        } else {
            alert('请先选择一个事件节点');
        }
    } else {
        alert('请先选择一个节点');
    }
}

// 查看节点关联案卷
function viewNodeCases() {
    if (fullGraph && fullGraph.selectedNode) {
        const node = fullGraph.selectedNode;
        searchBy(node.name);
    } else {
        alert('请先选择一个节点');
    }
}

// 关闭信息面板
function closeInfoPanel() {
    const panel = document.getElementById('graphInfoPanel');
    if (panel) {
        panel.classList.remove('visible');
    }
}

// 在图谱中查看节点
function viewNodeInGraph() {
    closeModal('nodeDetailModal');
    navigateTo('graph');
}
