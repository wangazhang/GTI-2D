/**
 * 页面跳转和响应式检查器
 * 验证UI设计的完整性和正确性
 */

class UIValidationChecker {
    constructor(featureName, baseUrl = '') {
        this.featureName = featureName;
        this.baseUrl = baseUrl;
        this.results = {
            navigation: { passed: 0, failed: 0, issues: [] },
            responsive: { passed: 0, failed: 0, issues: [] },
            components: { passed: 0, failed: 0, issues: [] },
            performance: { passed: 0, failed: 0, issues: [] },
            accessibility: { passed: 0, failed: 0, issues: [] }
        };
    }

    // 执行完整的UI验证
    async validateComplete(options = {}) {
        console.log(`🔍 开始验证 ${this.featureName} UI设计...`);

        const validations = [];

        if (options.navigation !== false) {
            validations.push(this.validateNavigation());
        }

        if (options.responsive !== false) {
            validations.push(this.validateResponsive());
        }

        if (options.components !== false) {
            validations.push(this.validateComponents());
        }

        if (options.performance !== false) {
            validations.push(this.validatePerformance());
        }

        if (options.accessibility !== false) {
            validations.push(this.validateAccessibility());
        }

        // 并行执行所有验证
        await Promise.allSettled(validations);

        return this.generateReport();
    }

    // 验证导航和页面跳转
    async validateNavigation() {
        console.log('🔗 检查页面导航和跳转...');

        try {
            // 1. 检查主入口页面
            await this.checkMainIndex();

            // 2. 发现所有页面
            const pages = await this.discoverAllPages();

            // 3. 验证每个页面的链接
            for (const page of pages) {
                await this.validatePageLinks(page);
            }

            // 4. 检查路由配置
            await this.validateRouterConfiguration();

            // 5. 测试浏览器历史
            await this.validateBrowserHistory();

        } catch (error) {
            this.addIssue('navigation', 'error', `导航验证失败: ${error.message}`);
        }
    }

    // 检查主入口页面
    async checkMainIndex() {
        const indexPath = `UI/${this.featureName}/index.html`;

        try {
            const content = await this.loadFileContent(indexPath);

            if (!content) {
                this.addIssue('navigation', 'error', '主入口页面 index.html 不存在');
                return;
            }

            // 检查基本结构
            if (!content.includes('<!DOCTYPE html>')) {
                this.addIssue('navigation', 'warning', '主入口页面缺少 DOCTYPE 声明');
            }

            // 检查导航元素
            if (!content.includes('<nav') && !content.includes('navigation')) {
                this.addIssue('navigation', 'warning', '主入口页面可能缺少导航元素');
            }

            // 检查路由脚本
            if (!content.includes('navigation.js') && !content.includes('router')) {
                this.addIssue('navigation', 'warning', '主入口页面可能缺少路由脚本');
            }

            this.results.navigation.passed++;

        } catch (error) {
            this.addIssue('navigation', 'error', `无法读取主入口页面: ${error.message}`);
        }
    }

    // 发现所有页面
    async discoverAllPages() {
        const pages = [];
        const pagesDir = `UI/${this.featureName}/pages`;

        try {
            // 这里应该使用实际的文件系统API
            // 模拟页面发现过程
            const commonPaths = [
                'auth/login.html',
                'auth/signup.html',
                'auth/forgot-password.html',
                'main/dashboard.html',
                'settings/profile.html',
                'settings/preferences.html',
                'settings/account.html',
                'help/index.html',
                'error/404.html'
            ];

            for (const path of commonPaths) {
                const fullPath = `${pagesDir}/${path}`;
                const content = await this.loadFileContent(fullPath);

                if (content) {
                    pages.push({
                        path: fullPath,
                        relativePath: path,
                        name: this.extractPageTitle(content),
                        content: content
                    });
                }
            }

        } catch (error) {
            this.addIssue('navigation', 'warning', `页面发现过程出错: ${error.message}`);
        }

        return pages;
    }

    // 验证页面链接
    async validatePageLinks(page) {
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
        const links = [];
        let match;

        while ((match = linkRegex.exec(page.content)) !== null) {
            links.push({
                href: match[1],
                fullTag: match[0]
            });
        }

        for (const link of links) {
            await this.checkLinkValidity(link, page);
        }
    }

    // 检查链接有效性
    async checkLinkValidity(link, sourcePage) {
        const href = link.href;

        // 跳过外部链接和特殊协议
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }

        // 跳过锚点链接
        if (href.startsWith('#')) {
            return;
        }

        // 解析相对路径
        const targetPath = this.resolveRelativePath(href, sourcePage.path);

        try {
            const targetExists = await this.fileExists(targetPath);

            if (targetExists) {
                this.results.navigation.passed++;
            } else {
                this.results.navigation.failed++;
                this.addIssue('navigation', 'error',
                    `页面 ${sourcePage.relativePath} 中的链接 "${href}" 指向不存在的文件: ${targetPath}`);
            }
        } catch (error) {
            this.addIssue('navigation', 'warning',
                `无法验证链接 "${href}": ${error.message}`);
        }
    }

    // 验证响应式设计
    async validateResponsive() {
        console.log('📱 检查响应式设计适配...');

        const breakpoints = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 },
            { name: 'Large Desktop', width: 2560, height: 1440 }
        ];

        try {
            const pages = await this.discoverAllPages();

            for (const page of pages) {
                for (const breakpoint of breakpoints) {
                    await this.validatePageAtBreakpoint(page, breakpoint);
                }
            }

        } catch (error) {
            this.addIssue('responsive', 'error', `响应式验证失败: ${error.message}`);
        }
    }

    // 在特定断点验证页面
    async validatePageAtBreakpoint(page, breakpoint) {
        // 检查Tailwind CSS响应式类
        const responsiveClasses = this.extractResponsiveClasses(page.content);

        // 验证基本响应式模式
        const hasResponsiveLayout = this.checkResponsiveLayout(page.content, breakpoint);

        if (hasResponsiveLayout) {
            this.results.responsive.passed++;
        } else {
            this.results.responsive.failed++;
            this.addIssue('responsive', 'warning',
                `页面 ${page.relativePath} 在 ${breakpoint.name} (${breakpoint.width}px) 断点可能缺少响应式适配`);
        }
    }

    // 提取响应式CSS类
    extractResponsiveClasses(content) {
        const responsiveClassRegex = /\b(sm:|md:|lg:|xl:|2xl:)[a-zA-Z0-9-]+/g;
        return content.match(responsiveClassRegex) || [];
    }

    // 检查响应式布局
    checkResponsiveLayout(content, breakpoint) {
        const indicators = {
            mobile: ['sm:', 'block', 'flex', 'grid', 'hidden', 'w-full'],
            tablet: ['md:', 'lg:', 'grid-cols', 'flex-row', 'flex-col'],
            desktop: ['lg:', 'xl:', 'max-w', 'container', 'mx-auto']
        };

        let category = 'mobile';
        if (breakpoint.width >= 768) category = 'tablet';
        if (breakpoint.width >= 1024) category = 'desktop';

        const requiredIndicators = indicators[category];
        const hasIndicators = requiredIndicators.some(indicator =>
            content.includes(indicator));

        return hasIndicators;
    }

    // 验证组件复用
    async validateComponents() {
        console.log('🧩 检查组件复用和一致性...');

        try {
            // 检查组件目录
            const componentPath = `UI/${this.featureName}/components`;
            const components = await this.discoverComponents(componentPath);

            // 验证组件使用情况
            const pages = await this.discoverAllPages();

            for (const component of components) {
                await this.validateComponentUsage(component, pages);
            }

            // 检查设计系统一致性
            await this.validateDesignSystemConsistency(pages);

        } catch (error) {
            this.addIssue('components', 'error', `组件验证失败: ${error.message}`);
        }
    }

    // 验证性能
    async validatePerformance() {
        console.log('⚡ 检查性能优化...');

        try {
            const pages = await this.discoverAllPages();

            for (const page of pages) {
                // 检查图片优化
                await this.checkImageOptimization(page);

                // 检查资源加载
                await this.checkResourceLoading(page);

                // 检查代码压缩
                await this.checkCodeMinification(page);
            }

        } catch (error) {
            this.addIssue('performance', 'error', `性能验证失败: ${error.message}`);
        }
    }

    // 验证可访问性
    async validateAccessibility() {
        console.log('♿ 检查可访问性...');

        try {
            const pages = await this.discoverAllPages();

            for (const page of pages) {
                // 检查语义化标签
                await this.checkSemanticHTML(page);

                // 检查alt属性
                await this.checkImageAltTexts(page);

                // 检查颜色对比度
                await this.checkColorContrast(page);

                // 检查键盘导航
                await this.checkKeyboardNavigation(page);
            }

        } catch (error) {
            this.addIssue('accessibility', 'error', `可访问性验证失败: ${error.message}`);
        }
    }

    // 检查图片优化
    async checkImageOptimization(page) {
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = imgRegex.exec(page.content)) !== null) {
            const src = match[1];
            const imgTag = match[0];

            // 检查是否使用Unsplash
            if (src.includes('unsplash.com')) {
                this.results.performance.passed++;
            } else if (src.startsWith('data:') || src.includes('base64')) {
                this.addIssue('performance', 'warning',
                    `页面 ${page.relativePath} 使用了base64图片，可能影响性能`);
            }

            // 检查懒加载
            if (imgTag.includes('data-src') || imgTag.includes('loading="lazy"')) {
                this.results.performance.passed++;
            } else {
                this.addIssue('performance', 'info',
                    `页面 ${page.relativePath} 的图片可能缺少懒加载优化`);
            }
        }
    }

    // 检查语义化HTML
    async checkSemanticHTML(page) {
        const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
        const foundTags = [];

        semanticTags.forEach(tag => {
            if (page.content.includes(`<${tag}`)) {
                foundTags.push(tag);
            }
        });

        if (foundTags.length >= 3) {
            this.results.accessibility.passed++;
        } else {
            this.addIssue('accessibility', 'warning',
                `页面 ${page.relativePath} 语义化标签使用较少，建议使用更多语义化元素`);
        }
    }

    // 工具方法
    async loadFileContent(filePath) {
        // 这里应该实现实际的文件读取逻辑
        // 模拟文件内容
        try {
            // 在实际实现中，这里会调用Read工具或其他文件读取方法
            return `模拟文件内容 - ${filePath}`;
        } catch (error) {
            return null;
        }
    }

    async fileExists(filePath) {
        // 模拟文件存在检查
        const commonFiles = [
            'index.html',
            'auth/login.html',
            'auth/signup.html',
            'main/dashboard.html',
            'settings/profile.html'
        ];

        return commonFiles.some(file => filePath.includes(file));
    }

    extractPageTitle(content) {
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1] : '未知页面';
    }

    resolveRelativePath(href, sourcePath) {
        // 简化的相对路径解析
        if (href.startsWith('/')) {
            return `UI/${this.featureName}${href}`;
        }

        const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf('/'));
        return `${sourceDir}/${href}`;
    }

    addIssue(category, type, message) {
        this.results[category].issues.push({
            type,
            message,
            timestamp: new Date().toISOString()
        });
    }

    // 生成验证报告
    generateReport() {
        const totalPassed = Object.values(this.results).reduce((sum, result) => sum + result.passed, 0);
        const totalFailed = Object.values(this.results).reduce((sum, result) => sum + result.failed, 0);
        const totalIssues = Object.values(this.results).reduce((sum, result) => sum + result.issues.length, 0);

        const report = {
            featureName: this.featureName,
            timestamp: new Date().toISOString(),
            summary: {
                totalChecks: totalPassed + totalFailed,
                passed: totalPassed,
                failed: totalFailed,
                successRate: totalPassed + totalFailed > 0 ?
                    Math.round((totalPassed / (totalPassed + totalFailed)) * 100) : 0,
                totalIssues: totalIssues
            },
            categories: this.results,
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    // 生成改进建议
    generateRecommendations() {
        const recommendations = [];

        // 基于验证结果生成建议
        if (this.results.navigation.failed > 0) {
            recommendations.push({
                category: 'navigation',
                priority: 'high',
                message: '修复所有无效链接，确保页面间能正确跳转'
            });
        }

        if (this.results.responsive.failed > this.results.responsive.passed) {
            recommendations.push({
                category: 'responsive',
                priority: 'high',
                message: '增强响应式设计，确保在所有设备上都有良好体验'
            });
        }

        if (this.results.accessibility.issues.length > 5) {
            recommendations.push({
                category: 'accessibility',
                priority: 'medium',
                message: '改进可访问性，使用更多语义化标签和无障碍属性'
            });
        }

        return recommendations;
    }

    // 生成HTML格式的报告
    generateHTMLReport() {
        const report = this.generateReport();

        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI验证报告 - ${report.featureName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="max-w-6xl mx-auto py-8 px-4">
        <div class="bg-white rounded-lg shadow-sm border p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">UI验证报告</h1>

            <div class="grid md:grid-cols-3 gap-6 mb-8">
                <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 class="text-lg font-semibold text-green-900 mb-2">通过检查</h3>
                    <p class="text-3xl font-bold text-green-600">${report.summary.passed}</p>
                </div>
                <div class="bg-red-50 p-6 rounded-lg border border-red-200">
                    <h3 class="text-lg font-semibold text-red-900 mb-2">失败检查</h3>
                    <p class="text-3xl font-bold text-red-600">${report.summary.failed}</p>
                </div>
                <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 class="text-lg font-semibold text-blue-900 mb-2">成功率</h3>
                    <p class="text-3xl font-bold text-blue-600">${report.summary.successRate}%</p>
                </div>
            </div>

            ${this.generateCategoryReports(report.categories)}

            ${this.generateRecommendationsHTML(report.recommendations)}
        </div>
    </div>
</body>
</html>`;
    }

    generateCategoryReports(categories) {
        return Object.entries(categories).map(([category, result]) => `
            <div class="mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4 capitalize">${category} 验证</h2>
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div class="flex items-center">
                        <span class="text-green-600">✅</span>
                        <span class="ml-2">通过: ${result.passed}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-red-600">❌</span>
                        <span class="ml-2">失败: ${result.failed}</span>
                    </div>
                </div>
                ${result.issues.length > 0 ? `
                    <div class="space-y-2">
                        ${result.issues.map(issue => `
                            <div class="p-3 rounded border-l-4 ${
                                issue.type === 'error' ? 'border-red-500 bg-red-50' :
                                issue.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                                'border-blue-500 bg-blue-50'
                            }">
                                <span class="font-medium">${issue.type.toUpperCase()}:</span>
                                ${issue.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    generateRecommendationsHTML(recommendations) {
        if (recommendations.length === 0) return '';

        return `
            <div class="mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">改进建议</h2>
                <div class="space-y-3">
                    ${recommendations.map(rec => `
                        <div class="p-4 rounded-lg border-l-4 ${
                            rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                            rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                            'border-blue-500 bg-blue-50'
                        }">
                            <div class="flex items-center mb-2">
                                <span class="font-medium text-gray-900">${rec.category.toUpperCase()}</span>
                                <span class="ml-2 px-2 py-1 text-xs rounded ${
                                    rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                                    rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-blue-200 text-blue-800'
                                }">${rec.priority}</span>
                            </div>
                            <p class="text-gray-700">${rec.message}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIValidationChecker;
} else {
    window.UIValidationChecker = UIValidationChecker;
}