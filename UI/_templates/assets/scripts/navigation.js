/**
 * {{FEATURE_NAME}} - 导航系统
 * 单页应用路由和页面跳转管理
 */

class NavigationSystem {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.maxHistoryLength = 50;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.registerDefaultRoutes();
        this.loadCurrentPage();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 拦截所有链接点击
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link.href)) {
                e.preventDefault();
                this.navigate(link.href, null, link.dataset.transition);
            }
        });

        // 浏览器前进后退
        window.addEventListener('popstate', (e) => {
            this.loadPage(location.pathname, e.state);
        });

        // 表单提交后导航
        document.addEventListener('formNavigate', (e) => {
            this.navigate(e.detail.url, e.detail.data);
        });
    }

    // 注册默认路由
    registerDefaultRoutes() {
        // 根据项目结构自动注册路由
        const routes = {
            '/': 'index.html',
            '/auth/login': 'pages/auth/login.html',
            '/auth/signup': 'pages/auth/signup.html',
            '/auth/forgot-password': 'pages/auth/forgot-password.html',
            '/dashboard': 'pages/main/dashboard.html',
            '/settings/profile': 'pages/settings/profile.html',
            '/settings/preferences': 'pages/settings/preferences.html',
            '/settings/account': 'pages/settings/account.html',
            '/design-system': 'design-system/design-guide.html',
            '/404': 'pages/error/404.html'
        };

        Object.entries(routes).forEach(([path, file]) => {
            this.addRoute(path, file);
        });
    }

    // 添加路由
    addRoute(path, fileOrFunction) {
        this.routes.set(path, fileOrFunction);
    }

    // 导航到指定页面
    navigate(url, data = null, transition = 'default') {
        const path = this.extractPath(url);

        if (this.routes.has(path)) {
            // 更新浏览器历史
            if (path !== this.currentRoute) {
                history.pushState(data, '', path);
                this.addToHistory(path, data);
            }

            this.loadPage(path, data, transition);
        } else {
            console.warn(`Route ${path} not found`);
            this.navigate('/404');
        }
    }

    // 加载页面内容
    async loadPage(path, data = null, transition = 'default') {
        const route = this.routes.get(path);
        if (!route) {
            this.navigate('/404');
            return;
        }

        try {
            // 显示加载状态
            this.showLoadingState();

            // 执行页面切换动画
            await this.performTransition(transition, async () => {
                let content;

                if (typeof route === 'function') {
                    content = await route(data);
                } else {
                    content = await this.loadFileContent(route);
                }

                // 更新页面内容
                this.updatePageContent(content);
                this.currentRoute = path;

                // 执行页面特定的初始化
                this.initializePage(path, data);

                // 更新导航状态
                this.updateNavigationState(path);

                // 隐藏加载状态
                this.hideLoadingState();
            });

        } catch (error) {
            console.error('Failed to load page:', error);
            this.showErrorMessage('页面加载失败，请重试');
            this.hideLoadingState();
        }
    }

    // 加载文件内容
    async loadFileContent(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.status}`);
        }
        return await response.text();
    }

    // 更新页面内容
    updatePageContent(content) {
        // 如果是完整的HTML页面，替换整个文档
        if (content.includes('<!DOCTYPE html>')) {
            document.open();
            document.write(content);
            document.close();
        } else {
            // 否则只更新主要内容区域
            const mainContent = document.querySelector('main') || document.querySelector('#app') || document.body;
            mainContent.innerHTML = content;
        }
    }

    // 执行页面切换动画
    async performTransition(transitionType, callback) {
        const container = document.querySelector('main') || document.querySelector('#app') || document.body;

        switch (transitionType) {
            case 'fade':
                await this.fadeTransition(container, callback);
                break;
            case 'slide':
                await this.slideTransition(container, callback);
                break;
            case 'scale':
                await this.scaleTransition(container, callback);
                break;
            default:
                await this.defaultTransition(container, callback);
        }
    }

    // 默认切换动画
    async defaultTransition(container, callback) {
        // 淡出
        container.style.opacity = '0';
        container.style.transform = 'translateY(10px)';
        container.style.transition = 'all 0.2s ease-out';

        await this.wait(200);

        // 执行回调
        await callback();

        // 淡入
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';

        await this.wait(200);
        container.style.transition = '';
    }

    // 淡入淡出动画
    async fadeTransition(container, callback) {
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.3s ease-in-out';

        await this.wait(300);
        await callback();

        container.style.opacity = '1';
        await this.wait(300);
        container.style.transition = '';
    }

    // 滑动动画
    async slideTransition(container, callback) {
        container.style.transform = 'translateX(-100%)';
        container.style.transition = 'transform 0.3s ease-in-out';

        await this.wait(300);
        await callback();

        container.style.transform = 'translateX(0)';
        await this.wait(300);
        container.style.transition = '';
    }

    // 缩放动画
    async scaleTransition(container, callback) {
        container.style.transform = 'scale(0.95)';
        container.style.opacity = '0';
        container.style.transition = 'all 0.2s ease-out';

        await this.wait(200);
        await callback();

        container.style.transform = 'scale(1)';
        container.style.opacity = '1';
        await this.wait(200);
        container.style.transition = '';
    }

    // 初始化页面特定功能
    initializePage(path, data) {
        // 滚动到顶部
        window.scrollTo(0, 0);

        // 更新页面标题
        this.updatePageTitle(path);

        // 触发页面加载事件
        const event = new CustomEvent('pageLoaded', {
            detail: { path, data }
        });
        document.dispatchEvent(event);

        // 重新初始化UI框架功能
        if (window.UI) {
            window.UI.setupImageLazyLoading();
            window.UI.setupAnimations();
        }
    }

    // 更新页面标题
    updatePageTitle(path) {
        const titles = {
            '/': '{{FEATURE_NAME}}',
            '/auth/login': '登录 - {{FEATURE_NAME}}',
            '/auth/signup': '注册 - {{FEATURE_NAME}}',
            '/dashboard': '仪表板 - {{FEATURE_NAME}}',
            '/settings/profile': '个人资料 - {{FEATURE_NAME}}',
            '/settings/preferences': '偏好设置 - {{FEATURE_NAME}}',
            '/settings/account': '账户设置 - {{FEATURE_NAME}}',
            '/design-system': '设计系统 - {{FEATURE_NAME}}',
            '/404': '页面未找到 - {{FEATURE_NAME}}'
        };

        const title = titles[path] || '{{FEATURE_NAME}}';
        document.title = title;
    }

    // 更新导航状态
    updateNavigationState(path) {
        // 更新导航菜单活动状态
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.classList.remove('active', 'text-primary-600', 'bg-primary-50');
            if (this.extractPath(link.href) === path) {
                link.classList.add('active', 'text-primary-600', 'bg-primary-50');
            }
        });

        // 更新面包屑
        this.updateBreadcrumb(path);
    }

    // 更新面包屑导航
    updateBreadcrumb(path) {
        const breadcrumbContainer = document.querySelector('.breadcrumb');
        if (!breadcrumbContainer) return;

        const pathSegments = path.split('/').filter(segment => segment);
        const breadcrumbItems = ['首页'];

        let currentPath = '';
        pathSegments.forEach(segment => {
            currentPath += `/${segment}`;
            const title = this.getPageTitle(currentPath);
            if (title) {
                breadcrumbItems.push(title);
            }
        });

        breadcrumbContainer.innerHTML = breadcrumbItems
            .map((item, index) => {
                if (index === breadcrumbItems.length - 1) {
                    return `<span class="text-gray-900">${item}</span>`;
                } else {
                    return `<a href="${this.getPathForTitle(item)}" class="text-primary-600 hover:text-primary-800">${item}</a>`;
                }
            })
            .join(' <span class="text-gray-400">/</span> ');
    }

    // 显示加载状态
    showLoadingState() {
        let loader = document.getElementById('page-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'page-loader';
            loader.className = 'fixed top-0 left-0 w-full h-1 bg-primary-500 z-50 transform scale-x-0 origin-left transition-transform duration-300';
            document.body.appendChild(loader);
        }

        loader.style.transform = 'scaleX(1)';
    }

    // 隐藏加载状态
    hideLoadingState() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            setTimeout(() => {
                loader.style.transform = 'scaleX(0)';
            }, 200);
        }
    }

    // 显示错误消息
    showErrorMessage(message) {
        if (window.UI && window.UI.showMessage) {
            window.UI.showMessage(message, 'error');
        } else {
            alert(message);
        }
    }

    // 工具方法
    extractPath(url) {
        try {
            return new URL(url, location.origin).pathname;
        } catch {
            return url.startsWith('/') ? url : `/${url}`;
        }
    }

    isInternalLink(url) {
        try {
            const urlObj = new URL(url, location.origin);
            return urlObj.origin === location.origin;
        } catch {
            return true; // 相对路径默认为内部链接
        }
    }

    addToHistory(path, data) {
        this.history.push({ path, data, timestamp: Date.now() });
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    getPageTitle(path) {
        const titles = {
            '/': '首页',
            '/dashboard': '仪表板',
            '/settings': '设置',
            '/settings/profile': '个人资料',
            '/settings/preferences': '偏好设置',
            '/settings/account': '账户设置'
        };
        return titles[path];
    }

    getPathForTitle(title) {
        const paths = {
            '首页': '/',
            '仪表板': '/dashboard',
            '设置': '/settings',
            '个人资料': '/settings/profile',
            '偏好设置': '/settings/preferences',
            '账户设置': '/settings/account'
        };
        return paths[title] || '/';
    }

    loadCurrentPage() {
        const currentPath = location.pathname;
        this.loadPage(currentPath);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 返回上一页
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // 移除当前页
            const previousPage = this.history[this.history.length - 1];
            this.navigate(previousPage.path, previousPage.data);
        } else {
            window.history.back();
        }
    }

    // 刷新当前页面
    refresh() {
        this.loadPage(this.currentRoute);
    }

    // 预加载页面
    preloadPage(path) {
        const route = this.routes.get(path);
        if (route && typeof route === 'string') {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = route;
            document.head.appendChild(link);
        }
    }
}

// 初始化导航系统
window.Navigation = new NavigationSystem();

// 导出常用方法到全局
window.navigate = (url, data, transition) => window.Navigation.navigate(url, data, transition);
window.goBack = () => window.Navigation.goBack();
window.refresh = () => window.Navigation.refresh();