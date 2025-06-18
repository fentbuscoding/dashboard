/**
 * Enhanced UI Components Library
 * Advanced component management with animations, accessibility, and modern features
 * @version 2.0.0
 * @author BronxBot Dashboard Team
 */

class UIComponents {
    constructor() {
        this.dropdowns = new Map();
        this.mobileMenus = new Map();
        this.modals = new Map();
        this.tooltips = new Map();
        this.notifications = [];
        this.animations = new Map();
        this.observers = new Map();
        
        // Configuration
        this.config = {
            animationDuration: 300,
            notificationTimeout: 5000,
            tooltipDelay: 500,
            debug: false,
            accessibility: true
        };
        
        // Event listeners cleanup
        this.eventListeners = [];
        
        this.init();
    }
    
    init() {
        this.log('Initializing UI Components...');
        
        // Initialize all components
        this.initDropdowns();
        this.initMobileMenus();
        this.initModals();
        this.initTooltips();
        this.initNotifications();
        this.initScrollEffects();
        this.initKeyboardHandlers();
        this.initAccessibilityFeatures();
        this.initClickOutsideHandlers();
        this.initIntersectionObservers();
        
        // Initialize theme handling
        this.initThemeHandling();
        
        this.log('UI Components initialized successfully');
    }
    
    // Enhanced dropdown functionality
    initDropdowns() {
        // User dropdown with enhanced animations
        const userDropdownToggle = document.getElementById('user-dropdown-toggle');
        const userDropdownMenu = document.getElementById('user-dropdown-menu');
        
        if (userDropdownToggle && userDropdownMenu) {
            this.dropdowns.set('user', {
                toggle: userDropdownToggle,
                menu: userDropdownMenu,
                isOpen: false,
                animation: null
            });
            
            this.addEventListener(userDropdownToggle, 'click', (e) => {
                e.stopPropagation();
                this.toggleDropdown('user');
            });
            
            // Enhanced keyboard navigation
            this.addEventListener(userDropdownToggle, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDropdown('user');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.openDropdown('user');
                    this.focusFirstMenuItem('user');
                }
            });
            
            // Menu item navigation
            const menuItems = userDropdownMenu.querySelectorAll('[role="menuitem"], a, button');
            menuItems.forEach((item, index) => {
                this.addEventListener(item, 'keydown', (e) => {
                    this.handleMenuKeyNavigation(e, menuItems, index);
                });
            });
            
            // Prevent dropdown from closing when clicking inside menu
            this.addEventListener(userDropdownMenu, 'click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Generic dropdown handler with enhanced features
        document.querySelectorAll('[data-dropdown]').forEach(toggle => {
            const dropdownId = toggle.getAttribute('data-dropdown');
            const menu = document.getElementById(dropdownId);
            
            if (menu) {
                this.dropdowns.set(dropdownId, {
                    toggle: toggle,
                    menu: menu,
                    isOpen: false,
                    animation: null,
                    trigger: toggle.getAttribute('data-trigger') || 'click'
                });
                
                const trigger = this.dropdowns.get(dropdownId).trigger;
                
                if (trigger === 'hover') {
                    this.setupHoverDropdown(dropdownId);
                } else {
                    this.addEventListener(toggle, 'click', (e) => {
                        e.stopPropagation();
                        this.toggleDropdown(dropdownId);
                    });
                }
                
                this.addEventListener(menu, 'click', (e) => {
                    if (!e.target.closest('[data-close-dropdown]')) {
                        e.stopPropagation();
                    } else {
                        this.closeDropdown(dropdownId);
                    }
                });
            }
        });
    }
    
    // Setup hover-triggered dropdowns
    setupHoverDropdown(dropdownId) {
        const dropdown = this.dropdowns.get(dropdownId);
        if (!dropdown) return;
        
        let hoverTimeout;
        
        this.addEventListener(dropdown.toggle, 'mouseenter', () => {
            clearTimeout(hoverTimeout);
            this.openDropdown(dropdownId);
        });
        
        this.addEventListener(dropdown.toggle, 'mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                if (!dropdown.menu.matches(':hover')) {
                    this.closeDropdown(dropdownId);
                }
            }, 300);
        });
        
        this.addEventListener(dropdown.menu, 'mouseenter', () => {
            clearTimeout(hoverTimeout);
        });
        
        this.addEventListener(dropdown.menu, 'mouseleave', () => {
            this.closeDropdown(dropdownId);
        });
    }
    
    // Enhanced mobile menu functionality
    initMobileMenus() {
        // Main mobile menu with animations
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            this.mobileMenus.set('main', {
                button: mobileMenuButton,
                menu: mobileMenu,
                isOpen: false,
                overlay: this.createOverlay('mobile-menu-overlay')
            });
            
            this.addEventListener(mobileMenuButton, 'click', () => {
                this.toggleMobileMenu('main');
            });
            
            // Enhanced menu link handling
            mobileMenu.querySelectorAll('a:not([data-no-close])').forEach(link => {
                this.addEventListener(link, 'click', () => {
                    this.closeMobileMenu('main');
                });
            });
            
            // Swipe gesture support for mobile
            this.initSwipeGestures(mobileMenu, 'main');
        }
        
        // Sidebar menu
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            this.mobileMenus.set('sidebar', {
                button: sidebarToggle,
                menu: sidebar,
                isOpen: false,
                overlay: this.createOverlay('sidebar-overlay')
            });
            
            this.addEventListener(sidebarToggle, 'click', () => {
                this.toggleMobileMenu('sidebar');
            });
        }
    }
    
    // Initialize modal functionality
    initModals() {
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                this.modals.set(modalId, {
                    trigger: trigger,
                    modal: modal,
                    isOpen: false,
                    overlay: this.createOverlay(`${modalId}-overlay`),
                    focusTrap: null
                });
                
                this.addEventListener(trigger, 'click', (e) => {
                    e.preventDefault();
                    this.openModal(modalId);
                });
                
                // Close button handling
                const closeButtons = modal.querySelectorAll('[data-close-modal]');
                closeButtons.forEach(btn => {
                    this.addEventListener(btn, 'click', () => {
                        this.closeModal(modalId);
                    });
                });
                
                // ESC key handling
                this.addEventListener(modal, 'keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.closeModal(modalId);
                    }
                });
            }
        });
    }
    
    // Initialize tooltip functionality
    initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const position = element.getAttribute('data-tooltip-position') || 'top';
            const delay = parseInt(element.getAttribute('data-tooltip-delay')) || this.config.tooltipDelay;
            
            const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
            
            this.tooltips.set(element, {
                id: tooltipId,
                text: tooltipText,
                position: position,
                delay: delay,
                timeout: null,
                element: null
            });
            
            this.addEventListener(element, 'mouseenter', () => {
                this.showTooltip(element);
            });
            
            this.addEventListener(element, 'mouseleave', () => {
                this.hideTooltip(element);
            });
            
            this.addEventListener(element, 'focus', () => {
                this.showTooltip(element);
            });
            
            this.addEventListener(element, 'blur', () => {
                this.hideTooltip(element);
            });
        });
    }
    
    // Initialize notification system
    initNotifications() {
        // Create notification container
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        
        // Listen for custom notification events
        this.addEventListener(document, 'show-notification', (e) => {
            this.showNotification(e.detail);
        });
    }
    
    // Initialize scroll effects
    initScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateScrollEffects = () => {
            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            
            // Hide/show navbar on scroll
            const navbar = document.querySelector('nav, header');
            if (navbar && navbar.classList.contains('sticky')) {
                if (scrollDirection === 'down' && currentScrollY > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            // Update scroll progress
            const scrollProgress = document.getElementById('scroll-progress');
            if (scrollProgress) {
                const progress = (currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                scrollProgress.style.width = `${Math.min(progress, 100)}%`;
            }
            
            // Parallax effects
            document.querySelectorAll('[data-parallax]').forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
                const yPos = -(currentScrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        this.addEventListener(window, 'scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        });
    }
    
    // Initialize keyboard handlers
    initKeyboardHandlers() {
        this.addEventListener(document, 'keydown', (e) => {
            // Global keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.openCommandPalette();
                        break;
                    case '/':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                }
            }
            
            // ESC key global handler
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.closeAllMobileMenus();
                this.closeAllModals();
            }
            
            // Tab trap for modals
            this.handleTabTrapping(e);
        });
    }
    
    // Initialize accessibility features
    initAccessibilityFeatures() {
        if (!this.config.accessibility) return;
        
        // Announce dynamic content changes
        this.createAriaLiveRegion();
        
        // Enhanced focus management
        this.initFocusManagement();
        
        // Color contrast checking
        this.checkColorContrast();
        
        // Reduced motion preferences
        this.handleReducedMotion();
    }
    
    // Initialize intersection observers for animations
    initIntersectionObservers() {
        // Fade in animation observer
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('[data-animate="fade-in"]').forEach(el => {
            fadeInObserver.observe(el);
        });
        
        // Slide up animation observer
        const slideUpObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                    slideUpObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('[data-animate="slide-up"]').forEach(el => {
            slideUpObserver.observe(el);
        });
        
        this.observers.set('fadeIn', fadeInObserver);
        this.observers.set('slideUp', slideUpObserver);
    }
    
    // Initialize theme handling
    initThemeHandling() {
        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            this.addEventListener(themeToggle, 'click', () => {
                this.toggleTheme();
            });
        }
        
        // System theme change detection
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.addEventListener(mediaQuery, 'change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    // Enhanced dropdown methods
    toggleDropdown(dropdownId) {
        const dropdown = this.dropdowns.get(dropdownId);
        if (!dropdown) return;
        
        if (dropdown.isOpen) {
            this.closeDropdown(dropdownId);
        } else {
            this.openDropdown(dropdownId);
        }
    }
    
    openDropdown(dropdownId) {
        const dropdown = this.dropdowns.get(dropdownId);
        if (!dropdown || dropdown.isOpen) return;
        
        // Close other dropdowns
        this.closeAllDropdowns();
        
        dropdown.isOpen = true;
        dropdown.toggle.setAttribute('aria-expanded', 'true');
        
        // Enhanced animation
        this.animateDropdownOpen(dropdown);
        
        this.log(`Opened dropdown: ${dropdownId}`);
    }
    
    closeDropdown(dropdownId) {
        const dropdown = this.dropdowns.get(dropdownId);
        if (!dropdown || !dropdown.isOpen) return;
        
        dropdown.isOpen = false;
        dropdown.toggle.setAttribute('aria-expanded', 'false');
        
        // Enhanced animation
        this.animateDropdownClose(dropdown);
        
        this.log(`Closed dropdown: ${dropdownId}`);
    }
    
    closeAllDropdowns() {
        this.dropdowns.forEach((dropdown, id) => {
            this.closeDropdown(id);
        });
    }
    
    // Enhanced mobile menu methods
    toggleMobileMenu(menuId) {
        const menu = this.mobileMenus.get(menuId);
        if (!menu) return;
        
        if (menu.isOpen) {
            this.closeMobileMenu(menuId);
        } else {
            this.openMobileMenu(menuId);
        }
    }
    
    openMobileMenu(menuId) {
        const menu = this.mobileMenus.get(menuId);
        if (!menu || menu.isOpen) return;
        
        menu.isOpen = true;
        document.body.classList.add('overflow-hidden');
        
        // Show overlay
        if (menu.overlay) {
            menu.overlay.classList.remove('hidden');
            menu.overlay.classList.add('opacity-50');
        }
        
        // Animate menu
        this.animateMobileMenuOpen(menu);
        
        // Update button icon
        this.updateMobileMenuIcon(menu.button, true);
        
        this.log(`Opened mobile menu: ${menuId}`);
    }
    
    closeMobileMenu(menuId) {
        const menu = this.mobileMenus.get(menuId);
        if (!menu || !menu.isOpen) return;
        
        menu.isOpen = false;
        document.body.classList.remove('overflow-hidden');
        
        // Hide overlay
        if (menu.overlay) {
            menu.overlay.classList.remove('opacity-50');
            setTimeout(() => {
                menu.overlay.classList.add('hidden');
            }, this.config.animationDuration);
        }
        
        // Animate menu
        this.animateMobileMenuClose(menu);
        
        // Update button icon
        this.updateMobileMenuIcon(menu.button, false);
        
        this.log(`Closed mobile menu: ${menuId}`);
    }
    
    closeAllMobileMenus() {
        this.mobileMenus.forEach((menu, id) => {
            this.closeMobileMenu(id);
        });
    }
    
    // Modal methods
    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal || modal.isOpen) return;
        
        modal.isOpen = true;
        document.body.classList.add('overflow-hidden');
        
        // Show overlay
        modal.overlay.classList.remove('hidden');
        
        // Animate modal
        this.animateModalOpen(modal);
        
        // Focus management
        this.trapFocus(modal.modal);
        
        this.log(`Opened modal: ${modalId}`);
    }
    
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal || !modal.isOpen) return;
        
        modal.isOpen = false;
        document.body.classList.remove('overflow-hidden');
        
        // Animate modal
        this.animateModalClose(modal);
        
        // Release focus
        this.releaseFocus(modal.modal);
        
        this.log(`Closed modal: ${modalId}`);
    }
    
    closeAllModals() {
        this.modals.forEach((modal, id) => {
            this.closeModal(id);
        });
    }
    
    // Tooltip methods
    showTooltip(element) {
        const tooltip = this.tooltips.get(element);
        if (!tooltip) return;
        
        clearTimeout(tooltip.timeout);
        tooltip.timeout = setTimeout(() => {
            this.createTooltipElement(element, tooltip);
        }, tooltip.delay);
    }
    
    hideTooltip(element) {
        const tooltip = this.tooltips.get(element);
        if (!tooltip) return;
        
        clearTimeout(tooltip.timeout);
        if (tooltip.element) {
            tooltip.element.remove();
            tooltip.element = null;
        }
    }
    
    createTooltipElement(element, tooltip) {
        // Remove existing tooltip
        if (tooltip.element) {
            tooltip.element.remove();
        }
        
        const tooltipEl = document.createElement('div');
        tooltipEl.id = tooltip.id;
        tooltipEl.className = `absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200 opacity-0`;
        tooltipEl.textContent = tooltip.text;
        tooltipEl.setAttribute('role', 'tooltip');
        
        document.body.appendChild(tooltipEl);
        
        // Position tooltip
        this.positionTooltip(element, tooltipEl, tooltip.position);
        
        // Show tooltip
        requestAnimationFrame(() => {
            tooltipEl.classList.remove('opacity-0');
            tooltipEl.classList.add('opacity-100');
        });
        
        tooltip.element = tooltipEl;
    }
    
    positionTooltip(element, tooltipEl, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.top - tooltipRect.height - 8;
                break;
            case 'bottom':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.bottom + 8;
                break;
            case 'left':
                left = rect.left - tooltipRect.width - 8;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = rect.right + 8;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            default:
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.top - tooltipRect.height - 8;
        }
        
        // Keep tooltip in viewport
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
        top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
        
        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${top}px`;
    }
    
    // Notification methods
    showNotification(options) {
        const notification = {
            id: `notification-${Date.now()}`,
            message: options.message || 'Notification',
            type: options.type || 'info',
            duration: options.duration || this.config.notificationTimeout,
            actions: options.actions || []
        };
        
        this.notifications.push(notification);
        this.renderNotification(notification);
        
        // Auto remove
        if (notification.duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, notification.duration);
        }
        
        return notification.id;
    }
    
    renderNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notificationEl = document.createElement('div');
        notificationEl.id = notification.id;
        notificationEl.className = `
            transform transition-all duration-300 translate-x-full
            bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
            p-4 max-w-sm pointer-events-auto
        `;
        
        const typeColors = {
            success: 'text-green-600 dark:text-green-400',
            error: 'text-red-600 dark:text-red-400',
            warning: 'text-yellow-600 dark:text-yellow-400',
            info: 'text-blue-600 dark:text-blue-400'
        };
        
        notificationEl.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                    <div class="w-5 h-5 ${typeColors[notification.type]}">
                        ${this.getNotificationIcon(notification.type)}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        ${notification.message}
                    </p>
                    ${notification.actions.length > 0 ? `
                        <div class="mt-2 flex gap-2">
                            ${notification.actions.map(action => `
                                <button class="text-xs font-medium text-blue-600 hover:text-blue-500"
                                        onclick="${action.handler}">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onclick="window.uiComponents.removeNotification('${notification.id}')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        
        container.appendChild(notificationEl);
        
        // Animate in
        requestAnimationFrame(() => {
            notificationEl.classList.remove('translate-x-full');
        });
    }
    
    removeNotification(id) {
        const notificationEl = document.getElementById(id);
        if (!notificationEl) return;
        
        notificationEl.classList.add('translate-x-full');
        
        setTimeout(() => {
            notificationEl.remove();
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, this.config.animationDuration);
    }
    
    // Animation methods
    animateDropdownOpen(dropdown) {
        dropdown.menu.classList.remove('opacity-0', 'invisible', 'scale-95');
        dropdown.menu.classList.add('opacity-100', 'visible', 'scale-100');
    }
    
    animateDropdownClose(dropdown) {
        dropdown.menu.classList.remove('opacity-100', 'visible', 'scale-100');
        dropdown.menu.classList.add('opacity-0', 'invisible', 'scale-95');
    }
    
    animateMobileMenuOpen(menu) {
        menu.menu.classList.remove('-translate-y-full', 'opacity-0');
        menu.menu.classList.add('translate-y-0', 'opacity-100');
    }
    
    animateMobileMenuClose(menu) {
        menu.menu.classList.remove('translate-y-0', 'opacity-100');
        menu.menu.classList.add('-translate-y-full', 'opacity-0');
    }
    
    animateModalOpen(modal) {
        modal.overlay.classList.add('opacity-50');
        modal.modal.classList.remove('opacity-0', 'scale-95');
        modal.modal.classList.add('opacity-100', 'scale-100');
    }
    
    animateModalClose(modal) {
        modal.overlay.classList.remove('opacity-50');
        modal.modal.classList.remove('opacity-100', 'scale-100');
        modal.modal.classList.add('opacity-0', 'scale-95');
        
        setTimeout(() => {
            modal.overlay.classList.add('hidden');
        }, this.config.animationDuration);
    }
    
    // Utility methods
    createOverlay(id) {
        let overlay = document.getElementById(id);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = id;
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 hidden transition-opacity duration-300';
            document.body.appendChild(overlay);
            
            this.addEventListener(overlay, 'click', () => {
                this.closeAllDropdowns();
                this.closeAllMobileMenus();
                this.closeAllModals();
            });
        }
        return overlay;
    }
    
    updateMobileMenuIcon(button, isOpen) {
        const menuIcon = button.querySelector('#menu-icon');
        const closeIcon = button.querySelector('#close-icon');
        
        if (menuIcon && closeIcon) {
            if (isOpen) {
                menuIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            } else {
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }
        }
        
        button.setAttribute('aria-expanded', isOpen.toString());
    }
    
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    initClickOutsideHandlers() {
        this.addEventListener(document, 'click', (e) => {
            // Close dropdowns when clicking outside
            this.dropdowns.forEach((dropdown, id) => {
                if (!dropdown.toggle.contains(e.target) && 
                    !dropdown.menu.contains(e.target) && 
                    dropdown.isOpen) {
                    this.closeDropdown(id);
                }
            });
        });
    }
    
    // Swipe gesture support
    initSwipeGestures(element, menuId) {
        let startX, startY, distX, distY;
        
        this.addEventListener(element, 'touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        this.addEventListener(element, 'touchmove', (e) => {
            if (!startX || !startY) return;
            
            const touch = e.touches[0];
            distX = touch.clientX - startX;
            distY = touch.clientY - startY;
        });
        
        this.addEventListener(element, 'touchend', () => {
            if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 100) {
                if (distX < 0) {
                    // Swipe left - close menu
                    this.closeMobileMenu(menuId);
                }
            }
            startX = startY = distX = distY = null;
        });
    }
    
    // Theme methods
    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
        
        // Update theme toggle icon
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    // Accessibility methods
    createAriaLiveRegion() {
        if (!document.getElementById('aria-live-region')) {
            const region = document.createElement('div');
            region.id = 'aria-live-region';
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-atomic', 'true');
            region.className = 'sr-only';
            document.body.appendChild(region);
        }
    }
    
    announceToScreenReader(message) {
        const region = document.getElementById('aria-live-region');
        if (region) {
            region.textContent = message;
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }
    
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        firstElement.focus();
        
        const trapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        this.addEventListener(element, 'keydown', trapHandler);
        return () => element.removeEventListener('keydown', trapHandler);
    }
    
    releaseFocus(element) {
        // Focus management cleanup would go here
    }
    
    // Utility methods
    getNotificationIcon(type) {
        const icons = {
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>',
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        };
        
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[type] || icons.info}</svg>`;
    }
    
    log(message) {
        if (this.config.debug) {
            console.log(`[UIComponents] ${message}`);
        }
    }
    
    // Cleanup method
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // Disconnect observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        
        // Clear maps
        this.dropdowns.clear();
        this.mobileMenus.clear();
        this.modals.clear();
        this.tooltips.clear();
        this.animations.clear();
        this.observers.clear();
        
        this.log('UI Components destroyed');
    }
}

// Initialize UI components when DOM is ready
function initializeUIComponents() {
    if (typeof window !== 'undefined') {
        window.uiComponents = new UIComponents();
        
        // Make it globally accessible for debugging
        if (window.uiComponents.config.debug) {
            console.log('UIComponents initialized and available as window.uiComponents');
        }
    }
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUIComponents);
} else {
    initializeUIComponents();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIComponents;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return UIComponents;
    });
}
