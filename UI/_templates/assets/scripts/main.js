/**
 * {{FEATURE_NAME}} - 主要JavaScript文件
 * 提供通用功能和UI交互
 */

class UIFramework {
    constructor() {
        this.init();
    }

    // 初始化框架
    init() {
        this.setupDOMReady();
        this.setupImageLazyLoading();
        this.setupAnimations();
        this.setupInteractions();
    }

    // DOM就绪时执行
    setupDOMReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        console.log('{{FEATURE_NAME}} UI Framework initialized');
        this.setupFormValidation();
        this.setupModals();
        this.setupTooltips();
    }

    // 图片懒加载
    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('opacity-0');
                        img.classList.add('opacity-100', 'transition-opacity', 'duration-300');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                img.classList.add('opacity-0');
                imageObserver.observe(img);
            });
        } else {
            // 降级处理
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    // 设置动画
    setupAnimations() {
        // 滚动动画
        const animatedElements = document.querySelectorAll('[data-animate]');

        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const animation = element.dataset.animate;
                        element.classList.add(`animate-${animation}`);
                        animationObserver.unobserve(element);
                    }
                });
            }, { threshold: 0.1 });

            animatedElements.forEach(element => {
                animationObserver.observe(element);
            });
        }
    }

    // 设置交互功能
    setupInteractions() {
        // 按钮点击效果
        document.addEventListener('click', (e) => {
            if (e.target.matches('button') || e.target.closest('button')) {
                const button = e.target.matches('button') ? e.target : e.target.closest('button');
                this.addClickEffect(button);
            }
        });

        // 表单提交处理
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                this.handleFormSubmit(e);
            }
        });
    }

    // 按钮点击效果
    addClickEffect(button) {
        button.classList.add('transform', 'scale-95');
        setTimeout(() => {
            button.classList.remove('transform', 'scale-95');
        }, 100);
    }

    // 表单验证
    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');

        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    // 验证表单字段
    validateField(field) {
        const value = field.value.trim();
        const required = field.hasAttribute('required');
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // 必填验证
        if (required && !value) {
            isValid = false;
            errorMessage = '此字段为必填项';
        }

        // 邮箱验证
        if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = '请输入有效的邮箱地址';
        }

        // 密码验证
        if (type === 'password' && value && value.length < 6) {
            isValid = false;
            errorMessage = '密码长度不能少于6位';
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    // 显示字段验证结果
    showFieldValidation(field, isValid, errorMessage) {
        this.clearFieldError(field);

        if (!isValid) {
            field.classList.add('border-red-500', 'ring-red-500');
            field.classList.remove('border-gray-300');

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
            errorDiv.textContent = errorMessage;
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        } else {
            field.classList.remove('border-red-500', 'ring-red-500');
            field.classList.add('border-green-500');
        }
    }

    // 清除字段错误
    clearFieldError(field) {
        field.classList.remove('border-red-500', 'ring-red-500', 'border-green-500');
        field.classList.add('border-gray-300');

        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // 邮箱验证
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 表单提交处理
    handleFormSubmit(event) {
        const form = event.target;
        const inputs = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;

        // 验证所有字段
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            event.preventDefault();
            this.showMessage('请修正表单中的错误', 'error');
            return false;
        }

        // 显示加载状态
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalText = submitButton.textContent;
            submitButton.textContent = '提交中...';
            submitButton.disabled = true;

            // 模拟异步提交
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                this.showMessage('提交成功！', 'success');
            }, 2000);
        }

        event.preventDefault(); // 阻止默认提交，这里只是演示
        return false;
    }

    // 模态框功能
    setupModals() {
        // 打开模态框
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal-target]');
            if (trigger) {
                const modalId = trigger.dataset.modalTarget;
                this.openModal(modalId);
            }
        });

        // 关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
                this.closeModal();
            }
        });

        // 点击背景关闭
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay')) {
                this.closeModal();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // 打开模态框
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';

            // 动画效果
            setTimeout(() => {
                modal.querySelector('.modal-content').classList.add('animate-scale-in');
            }, 10);
        }
    }

    // 关闭模态框
    closeModal() {
        const modal = document.querySelector('.modal-overlay:not(.hidden)');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }

    // 工具提示
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });

            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    // 显示工具提示
    showTooltip(element) {
        const text = element.dataset.tooltip;
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg z-50 tooltip';
        tooltip.textContent = text;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    }

    // 隐藏工具提示
    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // 显示消息提示
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        messageDiv.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Unsplash图片服务
    getUnsplashImage(width, height, keywords = '', quality = 80) {
        const baseUrl = 'https://source.unsplash.com';
        return keywords
            ? `${baseUrl}/${width}x${height}/?${encodeURIComponent(keywords)}&q=${quality}`
            : `${baseUrl}/${width}x${height}/?q=${quality}`;
    }

    // 工具函数：防抖
    debounce(func, wait) {
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

    // 工具函数：节流
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 全局实例
window.UI = new UIFramework();

// 导出一些常用功能到全局
window.showMessage = (message, type) => window.UI.showMessage(message, type);
window.openModal = (modalId) => window.UI.openModal(modalId);
window.closeModal = () => window.UI.closeModal();