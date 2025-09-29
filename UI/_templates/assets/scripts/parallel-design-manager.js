/**
 * 并行设计任务管理器
 * 负责协调多个UI设计任务的并行执行
 */

class ParallelDesignManager {
    constructor(maxConcurrency = 4) {
        this.maxConcurrency = maxConcurrency;
        this.runningTasks = new Map();
        this.taskQueue = [];
        this.completedTasks = new Set();
        this.dependencies = new Map();
        this.results = new Map();
    }

    // 添加设计任务
    addTask(taskId, taskConfig) {
        const task = {
            id: taskId,
            type: taskConfig.type || 'page', // page, component, design-system
            priority: taskConfig.priority || 0,
            dependencies: taskConfig.dependencies || [],
            files: taskConfig.files || [],
            description: taskConfig.description || '',
            estimatedTime: taskConfig.estimatedTime || 5, // minutes
            agent: taskConfig.agent || 'general-purpose',
            prompt: taskConfig.prompt || '',
            status: 'pending'
        };

        this.taskQueue.push(task);
        this.dependencies.set(taskId, task.dependencies);

        return task;
    }

    // 开始执行任务队列
    async executeTaskQueue(featureName) {
        console.log(`🚀 开始并行设计任务执行 - ${featureName}`);
        console.log(`📊 总任务数: ${this.taskQueue.length}, 最大并行度: ${this.maxConcurrency}`);

        // 按优先级和依赖关系排序
        this.taskQueue.sort((a, b) => {
            // 首先按依赖关系排序（无依赖的优先）
            if (a.dependencies.length !== b.dependencies.length) {
                return a.dependencies.length - b.dependencies.length;
            }
            // 然后按优先级排序
            return b.priority - a.priority;
        });

        const results = [];

        while (this.taskQueue.length > 0 || this.runningTasks.size > 0) {
            // 启动可以执行的任务
            await this.startAvailableTasks();

            // 等待至少一个任务完成
            if (this.runningTasks.size > 0) {
                const completedTask = await this.waitForNextCompletion();
                results.push(completedTask);
            }
        }

        console.log('✅ 所有设计任务完成');
        return results;
    }

    // 启动可用的任务
    async startAvailableTasks() {
        while (this.runningTasks.size < this.maxConcurrency && this.taskQueue.length > 0) {
            const availableTask = this.findNextAvailableTask();

            if (availableTask) {
                const taskIndex = this.taskQueue.indexOf(availableTask);
                this.taskQueue.splice(taskIndex, 1);

                await this.startTask(availableTask);
            } else {
                // 没有可执行的任务，等待当前任务完成
                break;
            }
        }
    }

    // 查找下一个可执行的任务
    findNextAvailableTask() {
        return this.taskQueue.find(task => {
            return task.dependencies.every(depId => this.completedTasks.has(depId));
        });
    }

    // 启动单个任务
    async startTask(task) {
        console.log(`🔄 启动任务: ${task.id} (${task.description})`);

        task.status = 'running';
        task.startTime = Date.now();

        const taskPromise = this.executeTask(task);
        this.runningTasks.set(task.id, { task, promise: taskPromise });

        return taskPromise;
    }

    // 执行单个任务
    async executeTask(task) {
        try {
            // 这里应该调用Claude的Task工具来执行实际的设计任务
            const result = await this.callClaudeTask(task);

            task.status = 'completed';
            task.endTime = Date.now();
            task.duration = task.endTime - task.startTime;
            task.result = result;

            console.log(`✅ 任务完成: ${task.id} (耗时: ${Math.round(task.duration / 1000)}秒)`);

            return { task, result };
        } catch (error) {
            task.status = 'failed';
            task.error = error.message;

            console.error(`❌ 任务失败: ${task.id} - ${error.message}`);
            throw error;
        }
    }

    // 调用Claude Task工具
    async callClaudeTask(task) {
        // 这个方法会被实际的Task调用替换
        const taskPrompt = this.generateTaskPrompt(task);

        // 模拟Task调用
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    files: task.files,
                    summary: `${task.description} 已完成`,
                    duration: Math.random() * 5000 + 1000
                });
            }, Math.random() * 3000 + 1000);
        });
    }

    // 生成任务提示词
    generateTaskPrompt(task) {
        const basePrompt = `
作为资深前端开发工程师，请执行以下UI设计任务：

任务类型: ${task.type}
任务描述: ${task.description}
输出文件: ${task.files.join(', ')}

要求:
1. 使用HTML + Tailwind CSS + JavaScript
2. 确保响应式设计
3. 使用Unsplash图片服务
4. 实现页面间的正确跳转
5. 保持组件的可复用性

${task.prompt}
`;

        return basePrompt.trim();
    }

    // 等待下一个任务完成
    async waitForNextCompletion() {
        const runningPromises = Array.from(this.runningTasks.values()).map(
            ({ task, promise }) => promise.then(result => ({ taskId: task.id, result }))
        );

        const { taskId, result } = await Promise.race(runningPromises);

        this.runningTasks.delete(taskId);
        this.completedTasks.add(taskId);
        this.results.set(taskId, result);

        return result;
    }

    // 生成任务执行报告
    generateReport() {
        const totalTasks = this.completedTasks.size;
        const totalTime = Array.from(this.results.values())
            .reduce((sum, result) => sum + (result.task.duration || 0), 0);

        const report = {
            totalTasks,
            totalTime: Math.round(totalTime / 1000),
            averageTime: Math.round(totalTime / totalTasks / 1000),
            maxConcurrency: this.maxConcurrency,
            efficiency: this.calculateEfficiency(),
            taskBreakdown: this.getTaskBreakdown()
        };

        return report;
    }

    // 计算执行效率
    calculateEfficiency() {
        const actualTime = Array.from(this.results.values())
            .reduce((max, result) => Math.max(max, result.task.endTime || 0), 0) -
            Array.from(this.results.values())
            .reduce((min, result) => Math.min(min, result.task.startTime || Infinity), Infinity);

        const sequentialTime = Array.from(this.results.values())
            .reduce((sum, result) => sum + (result.task.duration || 0), 0);

        return sequentialTime > 0 ? Math.round((sequentialTime / actualTime) * 100) : 0;
    }

    // 获取任务分类统计
    getTaskBreakdown() {
        const breakdown = {
            'design-system': 0,
            'page': 0,
            'component': 0,
            'other': 0
        };

        Array.from(this.results.values()).forEach(result => {
            const type = result.task.type || 'other';
            breakdown[type] = (breakdown[type] || 0) + 1;
        });

        return breakdown;
    }
}

/**
 * 设计任务工厂
 * 根据项目需求生成合适的并行任务
 */
class DesignTaskFactory {
    constructor(featureName, prdContent, epicContent) {
        this.featureName = featureName;
        this.prdContent = prdContent;
        this.epicContent = epicContent;
    }

    // 生成完整的任务列表
    generateTasks(userPreferences = {}) {
        const tasks = [];

        // 1. 设计系统任务（最高优先级，其他任务的依赖）
        tasks.push(this.createDesignSystemTask());

        // 2. 核心页面任务
        const corePages = this.identifyCorePage();
        corePages.forEach((page, index) => {
            tasks.push(this.createPageTask(page, index + 2, ['design-system']));
        });

        // 3. 辅助页面任务
        const auxiliaryPages = this.identifyAuxiliaryPages();
        auxiliaryPages.forEach((page, index) => {
            tasks.push(this.createPageTask(page, index + 5, ['design-system']));
        });

        // 4. 组件库任务
        tasks.push(this.createComponentLibraryTask(corePages.length + auxiliaryPages.length + 6));

        // 5. 导航和路由任务
        tasks.push(this.createNavigationTask(corePages.length + auxiliaryPages.length + 7,
            ['design-system', ...corePages.map(p => p.id)]));

        // 6. 测试和验证任务
        tasks.push(this.createValidationTask(corePages.length + auxiliaryPages.length + 8,
            tasks.map(t => t.id || `task-${t.priority}`)));

        return tasks;
    }

    // 创建设计系统任务
    createDesignSystemTask() {
        return {
            id: 'design-system',
            type: 'design-system',
            priority: 1,
            dependencies: [],
            files: [
                `UI/${this.featureName}/design-system/design-guide.html`,
                `UI/${this.featureName}/design-system/colors.html`,
                `UI/${this.featureName}/design-system/typography.html`,
                `UI/${this.featureName}/design-system/components.html`
            ],
            description: '创建统一的设计系统和规范',
            estimatedTime: 15,
            prompt: `
创建${this.featureName}的完整设计系统，包括：
1. 设计原则和指导思想
2. 色彩系统（主色、辅助色、中性色）
3. 字体系统（层级、大小、权重）
4. 间距系统（标准化间距规范）
5. 基础组件样式（按钮、表单、卡片等）
6. 响应式断点定义
7. 动画和过渡效果规范

基于PRD需求和用户偏好生成合适的设计风格。
`
        };
    }

    // 创建页面任务
    createPageTask(pageInfo, priority, dependencies = []) {
        return {
            id: pageInfo.id,
            type: 'page',
            priority: priority,
            dependencies: dependencies,
            files: [`UI/${this.featureName}/pages/${pageInfo.path}`],
            description: pageInfo.description,
            estimatedTime: pageInfo.complexity * 5, // 复杂度乘以基础时间
            prompt: `
创建${pageInfo.name}页面，包括：
1. 完整的HTML结构
2. 使用设计系统的样式
3. 响应式布局适配
4. 必要的交互功能
5. 与其他页面的跳转链接
6. 适当的动画和过渡效果

页面功能：${pageInfo.features.join(', ')}
目标用户：${pageInfo.targetUsers || '通用用户'}
`
        };
    }

    // 创建组件库任务
    createComponentLibraryTask(priority) {
        return {
            id: 'component-library',
            type: 'component',
            priority: priority,
            dependencies: ['design-system'],
            files: [
                `UI/${this.featureName}/components/navigation/header.html`,
                `UI/${this.featureName}/components/forms/input.html`,
                `UI/${this.featureName}/components/data-display/card.html`,
                `UI/${this.featureName}/components/feedback/modal.html`
            ],
            description: '创建可复用的组件库',
            estimatedTime: 20,
            prompt: `
创建${this.featureName}的组件库，包括：
1. 导航组件（头部导航、侧边导航、面包屑）
2. 表单组件（输入框、选择器、按钮）
3. 数据展示组件（卡片、列表、表格）
4. 反馈组件（模态框、提示消息、加载器）
5. 布局组件（容器、网格、分割线）

确保所有组件：
- 可复用和可配置
- 符合设计系统规范
- 具有良好的可访问性
- 支持响应式设计
`
        };
    }

    // 创建导航任务
    createNavigationTask(priority, dependencies) {
        return {
            id: 'navigation-system',
            type: 'page',
            priority: priority,
            dependencies: dependencies,
            files: [
                `UI/${this.featureName}/index.html`,
                `UI/${this.featureName}/assets/scripts/router.js`
            ],
            description: '创建导航系统和路由管理',
            estimatedTime: 10,
            prompt: `
创建${this.featureName}的导航系统，包括：
1. 主入口页面(index.html)
2. 页面路由配置
3. 导航菜单和链接
4. 页面间的跳转逻辑
5. 浏览器历史管理
6. 404错误页面处理

确保：
- 所有页面都能正确跳转
- 支持浏览器前进后退
- 提供清晰的页面层级结构
- 移动端导航友好
`
        };
    }

    // 创建验证任务
    createValidationTask(priority, dependencies) {
        return {
            id: 'validation-testing',
            type: 'testing',
            priority: priority,
            dependencies: dependencies,
            files: [`UI/${this.featureName}/test-report.html`],
            description: '验证UI设计的完整性和正确性',
            estimatedTime: 15,
            prompt: `
对${this.featureName}的UI设计进行全面验证：

1. 页面跳转测试：
   - 验证所有内部链接能够正确跳转
   - 检查路由配置是否完整
   - 测试浏览器前进后退功能

2. 响应式测试：
   - 手机端(320px-768px)显示效果
   - 平板端(768px-1024px)显示效果
   - 桌面端(1024px+)显示效果
   - 关键断点的布局适配

3. 组件测试：
   - 检查组件复用情况
   - 验证组件交互功能
   - 确认设计系统一致性

4. 性能测试：
   - 图片加载优化
   - 页面加载速度
   - 动画流畅度

5. 可访问性测试：
   - 色彩对比度
   - 键盘导航
   - 屏幕阅读器支持

输出详细的测试报告，包括发现的问题和修复建议。
`
        };
    }

    // 识别核心页面
    identifyCorePage() {
        // 基于PRD和Epic内容分析核心页面
        const corePages = [
            {
                id: 'page-auth-login',
                name: '登录页面',
                path: 'auth/login.html',
                description: '用户登录和身份验证',
                complexity: 2,
                features: ['用户登录', '表单验证', '错误处理'],
                targetUsers: '所有用户'
            },
            {
                id: 'page-dashboard',
                name: '仪表板页面',
                path: 'main/dashboard.html',
                description: '主要功能入口和数据概览',
                complexity: 3,
                features: ['数据展示', '快速操作', '导航菜单'],
                targetUsers: '已登录用户'
            }
        ];

        // 根据PRD内容动态添加更多核心页面
        if (this.prdContent && this.prdContent.includes('购物')) {
            corePages.push({
                id: 'page-product-list',
                name: '产品列表',
                path: 'main/products.html',
                description: '产品浏览和筛选',
                complexity: 3,
                features: ['产品展示', '搜索筛选', '分页'],
                targetUsers: '购物用户'
            });
        }

        return corePages;
    }

    // 识别辅助页面
    identifyAuxiliaryPages() {
        return [
            {
                id: 'page-settings-profile',
                name: '个人资料设置',
                path: 'settings/profile.html',
                description: '用户个人信息管理',
                complexity: 2,
                features: ['信息编辑', '头像上传', '密码修改'],
                targetUsers: '已登录用户'
            },
            {
                id: 'page-help',
                name: '帮助页面',
                path: 'help/index.html',
                description: '用户帮助和常见问题',
                complexity: 1,
                features: ['FAQ展示', '搜索帮助', '联系支持'],
                targetUsers: '所有用户'
            }
        ];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParallelDesignManager, DesignTaskFactory };
} else {
    window.ParallelDesignManager = ParallelDesignManager;
    window.DesignTaskFactory = DesignTaskFactory;
}