// ========================================
// 模拟数据 - 案卷实体治理与知识图谱检索系统
// ========================================

// 单位映射
const UNIT_MAP = {
    'police': '派出所',
    'drug': '禁毒大队',
    'criminal': '刑侦大队',
    'traffic': '交警大队',
    'security': '治安大队'
};

// 标签映射
const TAG_MAP = {
    'security': '治安',
    'drug': '禁毒',
    'traffic': '交通',
    'criminal': '刑事',
    'mediation': '调解'
};

// 状态映射
const STATUS_MAP = {
    'pending': '待审核',
    'reviewed': '已审核',
    'closed': '已办结'
};

// 案卷数据
const CASES_DATA = [
    {
        id: 'AJ2026001',
        name: '张三涉嫌盗窃案',
        type: '刑事案卷',
        unit: 'police',
        tags: ['criminal', 'security'],
        uploadTime: '2026-01-15 09:30:00',
        persons: [
            { name: '张三', role: '嫌疑人' },
            { name: '李四', role: '受害人' },
            { name: '王五', role: '证人' },
            { name: '赵六', role: '证人' }
        ],
        status: 'closed',
        location: '北京市朝阳区建国路88号',
        occurTime: '2026-01-10 22:30:00',
        reportTime: '2026-01-11 08:15:00',
        police: { name: '刘明', badge: 'J11052' },
        summary: '2026年1月10日晚，嫌疑人张三在朝阳区建国路88号小区内，采用撬锁方式进入受害人李四家中，盗窃现金人民币5000元及金银首饰若干。',
        evidence: ['现场勘查笔录', '监控录像', '指纹鉴定报告', '赃物照片'],
        result: '张三被依法刑事拘留，案件已移送检察院审查起诉。'
    },
    {
        id: 'AJ2026002',
        name: '某小区聚众吸毒案',
        type: '禁毒案卷',
        unit: 'drug',
        tags: ['drug'],
        uploadTime: '2026-01-18 14:20:00',
        persons: [
            { name: '陈某', role: '嫌疑人' },
            { name: '周某', role: '嫌疑人' },
            { name: '吴某', role: '嫌疑人' }
        ],
        status: 'reviewed',
        location: '北京市海淀区中关村南大街12号',
        occurTime: '2026-01-16 23:00:00',
        reportTime: '2026-01-17 02:30:00',
        police: { name: '张伟', badge: 'J22031' },
        summary: '接群众举报，某小区出租屋内有人聚众吸食毒品。民警当场查获吸毒人员3名，缴获冰毒15克。',
        evidence: ['尿检报告', '毒品鉴定报告', '现场照片', '询问笔录'],
        result: '陈某被行政拘留15日，周某、吴某被强制戒毒。'
    },
    {
        id: 'AJ2026003',
        name: '交通肇事逃逸案',
        type: '交通事故案卷',
        unit: 'traffic',
        tags: ['traffic'],
        uploadTime: '2026-01-20 11:45:00',
        persons: [
            { name: '马某', role: '嫌疑人' },
            { name: '钱某', role: '受害人' }
        ],
        status: 'pending',
        location: '北京市西城区西单北大街',
        occurTime: '2026-01-19 18:20:00',
        reportTime: '2026-01-19 18:45:00',
        police: { name: '孙强', badge: 'J33018' },
        summary: '嫌疑人马某驾驶小型轿车在西单北大街与骑电动车的钱某发生碰撞后逃逸，致钱某轻伤。',
        evidence: ['监控录像', '车辆痕迹鉴定', '医院诊断证明', '证人证言'],
        result: '案件正在侦办中。'
    },
    {
        id: 'AJ2026004',
        name: '王氏兄弟故意伤害案',
        type: '刑事案卷',
        unit: 'criminal',
        tags: ['criminal'],
        uploadTime: '2026-01-22 16:30:00',
        persons: [
            { name: '王大', role: '嫌疑人' },
            { name: '王二', role: '嫌疑人' },
            { name: '刘某', role: '受害人' },
            { name: '郑某', role: '证人' }
        ],
        status: 'reviewed',
        location: '北京市丰台区方庄南路',
        occurTime: '2026-01-20 21:00:00',
        reportTime: '2026-01-20 21:30:00',
        police: { name: '李华', badge: 'J44025' },
        summary: '因债务纠纷，王氏兄弟持械将刘某打伤，经鉴定为轻伤二级。',
        evidence: ['伤情鉴定报告', '凶器照片', '现场勘查笔录', '证人证言'],
        result: '王大、王二已被刑事拘留。'
    },
    {
        id: 'AJ2026005',
        name: '邻里纠纷调解案',
        type: '调解案卷',
        unit: 'police',
        tags: ['mediation', 'security'],
        uploadTime: '2026-01-25 10:00:00',
        persons: [
            { name: '赵某', role: '当事人' },
            { name: '孙某', role: '当事人' }
        ],
        status: 'closed',
        location: '北京市东城区和平里街道',
        occurTime: '2026-01-24 15:00:00',
        reportTime: '2026-01-24 15:30:00',
        police: { name: '周涛', badge: 'J55012' },
        summary: '赵某与孙某因噪音问题发生口角，经民警调解，双方达成和解。',
        evidence: ['调解协议书', '现场录音'],
        result: '双方签订调解协议，矛盾化解。'
    },
    {
        id: 'AJ2026006',
        name: '电信诈骗案',
        type: '刑事案卷',
        unit: 'criminal',
        tags: ['criminal', 'security'],
        uploadTime: '2026-01-28 09:15:00',
        persons: [
            { name: '黄某', role: '受害人' },
            { name: '未知', role: '嫌疑人' }
        ],
        status: 'pending',
        location: '北京市通州区新华大街',
        occurTime: '2026-01-25 14:00:00',
        reportTime: '2026-01-26 10:00:00',
        police: { name: '吴刚', badge: 'J66038' },
        summary: '受害人黄某接到冒充公安机关的电话，被骗转账人民币20万元。',
        evidence: ['通话记录', '转账凭证', '银行流水', '受害人陈述'],
        result: '案件正在侦办中，已冻结涉案账户。'
    },
    {
        id: 'AJ2026007',
        name: '非法持有枪支案',
        type: '刑事案卷',
        unit: 'security',
        tags: ['criminal', 'security'],
        uploadTime: '2026-02-01 14:30:00',
        persons: [
            { name: '林某', role: '嫌疑人' },
            { name: '何某', role: '证人' }
        ],
        status: 'reviewed',
        location: '北京市大兴区黄村镇',
        occurTime: '2026-01-30 20:00:00',
        reportTime: '2026-01-30 22:00:00',
        police: { name: '郑明', badge: 'J77041' },
        summary: '民警在例行检查中发现林某非法持有猎枪一支、子弹若干。',
        evidence: ['枪支鉴定报告', '现场照片', '嫌疑人供述'],
        result: '林某已被刑事拘留，案件移送检察院。'
    },
    {
        id: 'AJ2026008',
        name: '醉酒驾驶案',
        type: '交通案卷',
        unit: 'traffic',
        tags: ['traffic'],
        uploadTime: '2026-02-05 08:00:00',
        persons: [
            { name: '郭某', role: '嫌疑人' }
        ],
        status: 'closed',
        location: '北京市昌平区回龙观东大街',
        occurTime: '2026-02-04 23:30:00',
        reportTime: '2026-02-04 23:45:00',
        police: { name: '冯强', badge: 'J88052' },
        summary: '郭某醉酒后驾驶机动车被交警查获，血液酒精含量达185mg/100ml。',
        evidence: ['血液检测报告', '执法记录仪视频', '驾驶证信息'],
        result: '郭某被吊销驾驶证，依法追究刑事责任。'
    },
    {
        id: 'AJ2026009',
        name: '入室抢劫案',
        type: '刑事案卷',
        unit: 'criminal',
        tags: ['criminal'],
        uploadTime: '2026-02-08 11:20:00',
        persons: [
            { name: '田某', role: '嫌疑人' },
            { name: '贾某', role: '受害人' },
            { name: '石某', role: '证人' }
        ],
        status: 'pending',
        location: '北京市顺义区马坡镇',
        occurTime: '2026-02-06 03:00:00',
        reportTime: '2026-02-06 07:00:00',
        police: { name: '曹伟', badge: 'J99063' },
        summary: '嫌疑人田某蒙面持刀入室抢劫，抢走现金及手机等财物，价值约8000元。',
        evidence: ['现场勘查笔录', 'DNA鉴定', '监控录像', '受害人陈述'],
        result: '案件正在侦办中。'
    },
    {
        id: 'AJ2026010',
        name: '贩毒案件',
        type: '禁毒案卷',
        unit: 'drug',
        tags: ['drug', 'criminal'],
        uploadTime: '2026-02-12 16:45:00',
        persons: [
            { name: '白某', role: '嫌疑人' },
            { name: '黑某', role: '嫌疑人' },
            { name: '灰某', role: '证人' }
        ],
        status: 'reviewed',
        location: '北京市房山区良乡',
        occurTime: '2026-02-10 19:00:00',
        reportTime: '2026-02-10 21:00:00',
        police: { name: '袁杰', badge: 'J10174' },
        summary: '经缜密侦查，成功打掉一个贩毒团伙，抓获嫌疑人2名，缴获海洛因200克。',
        evidence: ['毒品鉴定报告', '交易视频', '银行流水', '嫌疑人供述'],
        result: '白某、黑某已被刑事拘留，案件正在进一步审理。'
    }
];

// 知识图谱节点数据
const GRAPH_NODES = [
    // 人物节点
    { id: 'p1', type: 'person', name: '张三', label: '嫌疑人' },
    { id: 'p2', type: 'person', name: '李四', label: '受害人' },
    { id: 'p3', type: 'person', name: '王五', label: '证人' },
    { id: 'p4', type: 'person', name: '陈某', label: '嫌疑人' },
    { id: 'p5', type: 'person', name: '刘明', label: '民警' },
    { id: 'p6', type: 'person', name: '张伟', label: '民警' },
    { id: 'p7', type: 'person', name: '马某', label: '嫌疑人' },
    { id: 'p8', type: 'person', name: '钱某', label: '受害人' },
    
    // 单位节点
    { id: 'u1', type: 'unit', name: '派出所', label: '执法单位' },
    { id: 'u2', type: 'unit', name: '禁毒大队', label: '执法单位' },
    { id: 'u3', type: 'unit', name: '刑侦大队', label: '执法单位' },
    { id: 'u4', type: 'unit', name: '交警大队', label: '执法单位' },
    
    // 事件节点
    { id: 'e1', type: 'event', name: '张三盗窃案', label: '刑事案件', caseId: 'AJ2026001' },
    { id: 'e2', type: 'event', name: '聚众吸毒案', label: '禁毒案件', caseId: 'AJ2026002' },
    { id: 'e3', type: 'event', name: '交通肇事案', label: '交通案件', caseId: 'AJ2026003' },
    { id: 'e4', type: 'event', name: '故意伤害案', label: '刑事案件', caseId: 'AJ2026004' },
    
    // 地点节点
    { id: 'l1', type: 'location', name: '朝阳区建国路', label: '案发地点' },
    { id: 'l2', type: 'location', name: '海淀区中关村', label: '案发地点' },
    { id: 'l3', type: 'location', name: '西城区西单', label: '案发地点' },
    { id: 'l4', type: 'location', name: '丰台区方庄', label: '案发地点' }
];

// 知识图谱关系数据
const GRAPH_EDGES = [
    // 人物-事件关系
    { source: 'p1', target: 'e1', relation: '参与' },
    { source: 'p2', target: 'e1', relation: '受害' },
    { source: 'p3', target: 'e1', relation: '作证' },
    { source: 'p4', target: 'e2', relation: '参与' },
    { source: 'p7', target: 'e3', relation: '参与' },
    { source: 'p8', target: 'e3', relation: '受害' },
    
    // 人物-单位关系
    { source: 'p5', target: 'u1', relation: '属于' },
    { source: 'p6', target: 'u2', relation: '属于' },
    
    // 事件-单位关系
    { source: 'e1', target: 'u1', relation: '办理' },
    { source: 'e2', target: 'u2', relation: '办理' },
    { source: 'e3', target: 'u4', relation: '办理' },
    { source: 'e4', target: 'u3', relation: '办理' },
    
    // 事件-地点关系
    { source: 'e1', target: 'l1', relation: '发生在' },
    { source: 'e2', target: 'l2', relation: '发生在' },
    { source: 'e3', target: 'l3', relation: '发生在' },
    { source: 'e4', target: 'l4', relation: '发生在' }
];

// 驾驶舱统计数据
const DASHBOARD_STATS = {
    totalCases: 1284,
    todayUpload: 23,
    totalPersons: 3567,
    closedCases: 892,
    activeCases: 392,
    totalUnits: 12
};

// 单位办案量数据
const UNIT_CHART_DATA = [
    { name: '派出所', value: 320 },
    { name: '刑侦大队', value: 280 },
    { name: '交警大队', value: 250 },
    { name: '禁毒大队', value: 180 },
    { name: '治安大队', value: 154 }
];

// 案件类型分布数据
const TYPE_CHART_DATA = [
    { name: '刑事', value: 35, color: '#ef4444' },
    { name: '治安', value: 25, color: '#3b82f6' },
    { name: '交通', value: 20, color: '#10b981' },
    { name: '禁毒', value: 12, color: '#f59e0b' },
    { name: '调解', value: 8, color: '#8b5cf6' }
];

// 时间趋势数据
const TREND_DATA = {
    day: [
        { date: '01-15', value: 12 },
        { date: '01-16', value: 18 },
        { date: '01-17', value: 15 },
        { date: '01-18', value: 22 },
        { date: '01-19', value: 19 },
        { date: '01-20', value: 25 },
        { date: '01-21', value: 28 }
    ],
    week: [
        { date: '第1周', value: 85 },
        { date: '第2周', value: 102 },
        { date: '第3周', value: 95 },
        { date: '第4周', value: 118 }
    ],
    month: [
        { date: '1月', value: 320 },
        { date: '2月', value: 280 },
        { date: '3月', value: 350 }
    ]
};

// 地点分布数据
const LOCATION_DATA = [
    { name: '朝阳区', value: 180 },
    { name: '海淀区', value: 150 },
    { name: '西城区', value: 120 },
    { name: '东城区', value: 110 },
    { name: '丰台区', value: 95 },
    { name: '通州区', value: 80 },
    { name: '大兴区', value: 75 },
    { name: '昌平区', value: 70 }
];

// 标签统计数据
const TAG_CHART_DATA = [
    { name: '盗窃', value: 145 },
    { name: '诈骗', value: 132 },
    { name: '故意伤害', value: 98 },
    { name: '交通肇事', value: 87 },
    { name: '吸毒', value: 65 },
    { name: '醉酒驾驶', value: 58 }
];

// 上传量统计数据
const UPLOAD_DATA = [
    { date: '01-01', value: 8 },
    { date: '01-05', value: 15 },
    { date: '01-10', value: 22 },
    { date: '01-15', value: 18 },
    { date: '01-20', value: 28 },
    { date: '01-25', value: 35 },
    { date: '01-30', value: 42 }
];

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UNIT_MAP,
        TAG_MAP,
        STATUS_MAP,
        CASES_DATA,
        GRAPH_NODES,
        GRAPH_EDGES,
        DASHBOARD_STATS,
        UNIT_CHART_DATA,
        TYPE_CHART_DATA,
        TREND_DATA,
        LOCATION_DATA,
        TAG_CHART_DATA,
        UPLOAD_DATA
    };
}
