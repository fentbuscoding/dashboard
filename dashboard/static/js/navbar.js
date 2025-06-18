/**
 * Enhanced BronxBot Navbar JavaScript
 * Advanced navigation functionality with animations, accessibility, and modern features
 * @version 2.0.0
 * @author BronxBot Dashboard Team
 */

class BronxBotNavbar {
    constructor() {
        this.config = {
            animationDuration: 300,
            scrollThreshold: 100,
            debounceDelay: 16,
            debug: false
        };
        
        this.state = {
            theme: 'light',
            mobileMenuOpen: false,
            userDropdownOpen: false,
            isScrolled: false,
            lastScrollY: 0,
            navbarVisible: true
        };
        
        this.elements = {};
        this.eventListeners = [];
        this.animationFrameId = null;
        
        this.init();
    }
    
    init() {
        this.log('Initializing BronxBot Navbar...');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize components
        this.initTheme();
        this.initMobileMenu();
        this.initUserDropdown();
        this.initScrollEffects();
        this.initKeyboardNavigation();
        this.initAccessibility();
        this.initAnimations();
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.log('BronxBot Navbar initialized successfully');
    }
    
    cacheElements() {
        this.elements = {
            // Theme elements
            themeToggle: document.getElementById('theme-toggle'),
            sunIcon: document.getElementById('sun-icon'),
            moonIcon: document.getElementById('moon-icon'),
            themeLoading: document.getElementById('theme-loading'),
            
            // Mobile menu elements
            mobileMenuButton: document.getElementById('mobile-menu-button'),
            mobileMenu: document.getElementById('mobile-menu'),
            menuIcon: document.getElementById('menu-icon'),
            closeIcon: document.getElementById('close-icon'),
            
            // User dropdown elements
            userDropdownToggle: document.getElementById('user-dropdown-toggle'),
            userDropdownMenu: document.getElementById('user-dropdown-menu'),
            
            // Navigation elements
            navbar: document.querySelector('nav'),
            navLinks: document.querySelectorAll('.nav-link, .mobile-nav-link'),
            
            // Body element for scroll lock
            body: document.body
        };
        
        this.log('DOM elements cached');
    }
    
    initTheme() {
        // Initialize theme based on saved preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.state.theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.applyTheme(this.state.theme, false);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.addEventListener(mediaQuery, 'change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.state.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.state.theme, true);
            }
        });
        
        this.log(`Theme initialized: ${this.state.theme}`);
    }
    
    initMobileMenu() {
        if (!this.elements.mobileMenuButton || !this.elements.mobileMenu) return;
        
        // Set initial ARIA attributes
        this.elements.mobileMenuButton.setAttribute('aria-expanded', 'false');
        this.elements.mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');
        
        // Close menu when clicking on links
        this.elements.navLinks.forEach(link => {
            if (link.classList.contains('mobile-nav-link')) {
                this.addEventListener(link, 'click', () => {
                    this.closeMobileMenu();
                });
            }
        });
        
        // Handle escape key
        this.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.state.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        this.log('Mobile menu initialized');
    }
    
    initUserDropdown() {
        if (!this.elements.userDropdownToggle || !this.elements.userDropdownMenu) return;
        
        // Set initial ARIA attributes
        this.elements.userDropdownToggle.setAttribute('aria-expanded', 'false');
        this.elements.userDropdownToggle.setAttribute('aria-haspopup', 'true');
        
        // Add keyboard navigation for dropdown items
        const dropdownItems = this.elements.userDropdownMenu.querySelectorAll('[role="menuitem"], a, button');
        dropdownItems.forEach((item, index) => {
            this.addEventListener(item, 'keydown', (e) => {
                this.handleDropdownKeyNavigation(e, dropdownItems, index);
            });
        });
        
        this.log('User dropdown initialized');
    }
    
    initScrollEffects() {
        if (!this.elements.navbar) return;
        
        // Throttled scroll handler
        const handleScroll = this.throttle(() => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > this.state.lastScrollY;
            const scrollThresholdMet = currentScrollY > this.config.scrollThreshold;
            
            // Update scroll state
            this.state.isScrolled = scrollThresholdMet;
            
            // Auto-hide navbar on scroll down (if it has the auto-hide class)
            if (this.elements.navbar.classList.contains('auto-hide')) {
                if (scrollingDown && scrollThresholdMet && this.state.navbarVisible) {
                    this.hideNavbar();
                } else if (!scrollingDown && !this.state.navbarVisible) {
                    this.showNavbar();
                }
            }
            
            // Add/remove scrolled class for styling
            this.elements.navbar.classList.toggle('scrolled', this.state.isScrolled);
            
            this.state.lastScrollY = currentScrollY;
        }, this.config.debounceDelay);
        
        this.addEventListener(window, 'scroll', handleScroll);
        
        this.log('Scroll effects initialized');
    }
    
    initKeyboardNavigation() {
        // Global keyboard shortcuts
        this.addEventListener(document, 'keydown', (e) => {
            // Alt + M: Toggle mobile menu
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
            
            // Alt + T: Toggle theme
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Alt + U: Toggle user dropdown
            if (e.altKey && e.key === 'u' && this.elements.userDropdownToggle) {
                e.preventDefault();
                this.toggleUserDropdown();
            }
        });
        
        this.log('Keyboard navigation initialized');
    }
    
    initAccessibility() {
        // Skip link functionality
        this.createSkipLink();
        
        // Focus management
        this.initFocusManagement();
        
        // Announce dynamic changes to screen readers
        this.createAriaLiveRegion();
        
        this.log('Accessibility features initialized');
    }
    
    initAnimations() {
        // Preload animation classes
        const animationClasses = [
            'transition-all',
            'duration-300',
            'transform',
            'translate-y-0',
            '-translate-y-full',
            'opacity-0',
            'opacity-100',
            'scale-95',
            'scale-100'
        ];
        
        // Add animation classes to relevant elements
        if (this.elements.navbar) {
            this.elements.navbar.classList.add('transition-transform', 'duration-300');
        }
        
        if (this.elements.userDropdownMenu) {
            this.elements.userDropdownMenu.classList.add('transition-all', 'duration-200');
        }
        
        if (this.elements.mobileMenu) {
            this.elements.mobileMenu.classList.add('transition-all', 'duration-300');
        }
        
        this.log('Animations initialized');
    }
    
    setupEventListeners() {
        // Theme toggle
        if (this.elements.themeToggle) {
            this.addEventListener(this.elements.themeToggle, 'click', () => {
                this.toggleTheme();
            });
        }
        
        // Mobile menu toggle
        if (this.elements.mobileMenuButton) {
            this.addEventListener(this.elements.mobileMenuButton, 'click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // User dropdown toggle
        if (this.elements.userDropdownToggle) {
            this.addEventListener(this.elements.userDropdownToggle, 'click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }
        
        // Click outside handlers
        this.addEventListener(document, 'click', (e) => {
            this.handleOutsideClick(e);
        });
        
        // Window resize handler
        this.addEventListener(window, 'resize', this.throttle(() => {
            this.handleResize();
        }, 100));
        
        this.log('Event listeners setup complete');
    }
    
    // Theme methods
    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme, true);
    }
    
    applyTheme(theme, animate = false) {
        this.state.theme = theme;
        
        if (animate && this.elements.themeLoading) {
            this.showThemeLoading();
        }
        
        const applyThemeChanges = () => {
            // Update document class
            document.documentElement.classList.toggle('dark', theme === 'dark');
            
            // Update icons
            if (this.elements.sunIcon && this.elements.moonIcon) {
                if (theme === 'dark') {
                    this.elements.sunIcon.classList.add('hidden');
                    this.elements.moonIcon.classList.remove('hidden');
                } else {
                    this.elements.sunIcon.classList.remove('hidden');
                    this.elements.moonIcon.classList.add('hidden');
                }
            }
            
            // Save to localStorage
            localStorage.setItem('theme', theme);
            
            // Dispatch custom event
            this.dispatchCustomEvent('themeChanged', { theme });
            
            // Announce to screen readers
            this.announceToScreenReader(`Theme changed to ${theme} mode`);
            
            if (animate && this.elements.themeLoading) {
                this.hideThemeLoading();
            }
            
            this.log(`Theme applied: ${theme}`);
        };
        
        if (animate) {
            setTimeout(applyThemeChanges, 150);
        } else {
            applyThemeChanges();
        }
    }
    
    showThemeLoading() {
        if (!this.elements.themeLoading) return;
        
        this.elements.sunIcon?.classList.add('hidden');
        this.elements.moonIcon?.classList.add('hidden');
        this.elements.themeLoading.classList.remove('hidden');
    }
    
    hideThemeLoading() {
        if (!this.elements.themeLoading) return;
        
        this.elements.themeLoading.classList.add('hidden');
    }
    
    // Mobile menu methods
    toggleMobileMenu() {
        if (this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        if (this.state.mobileMenuOpen) return;
        
        this.state.mobileMenuOpen = true;
        
        // Update ARIA attributes
        this.elements.mobileMenuButton.setAttribute('aria-expanded', 'true');
        
        // Lock body scroll
        this.elements.body.classList.add('overflow-hidden');
        
        // Show menu with animation
        this.elements.mobileMenu.classList.remove('-translate-y-full', 'opacity-0');
        this.elements.mobileMenu.classList.add('translate-y-0', 'opacity-100');
        
        // Update button icons
        this.updateMobileMenuIcon(true);
        
        // Focus first menu item
        this.focusFirstMenuItem();
        
        // Dispatch event
        this.dispatchCustomEvent('mobileMenuOpened');
        
        this.log('Mobile menu opened');
    }
    
    closeMobileMenu() {
        if (!this.state.mobileMenuOpen) return;
        
        this.state.mobileMenuOpen = false;
        
        // Update ARIA attributes
        this.elements.mobileMenuButton.setAttribute('aria-expanded', 'false');
        
        // Unlock body scroll
        this.elements.body.classList.remove('overflow-hidden');
        
        // Hide menu with animation
        this.elements.mobileMenu.classList.remove('translate-y-0', 'opacity-100');
        this.elements.mobileMenu.classList.add('-translate-y-full', 'opacity-0');
        
        // Update button icons
        this.updateMobileMenuIcon(false);
        
        // Return focus to button
        this.elements.mobileMenuButton.focus();
        
        // Dispatch event
        this.dispatchCustomEvent('mobileMenuClosed');
        
        this.log('Mobile menu closed');
    }
    
    updateMobileMenuIcon(isOpen) {
        if (this.elements.menuIcon && this.elements.closeIcon) {
            if (isOpen) {
                this.elements.menuIcon.classList.add('hidden');
                this.elements.closeIcon.classList.remove('hidden');
            } else {
                this.elements.menuIcon.classList.remove('hidden');
                this.elements.closeIcon.classList.add('hidden');
            }
        }
    }
    
    // User dropdown methods
    toggleUserDropdown() {
        if (this.state.userDropdownOpen) {
            this.closeUserDropdown();
        } else {
            this.openUserDropdown();
        }
    }
    
    openUserDropdown() {
        if (this.state.userDropdownOpen) return;
        
        this.state.userDropdownOpen = true;
        
        // Update ARIA attributes
        this.elements.userDropdownToggle.setAttribute('aria-expanded', 'true');
        
        // Show dropdown with animation
        this.elements.userDropdownMenu.classList.remove('opacity-0', 'invisible', 'scale-95');
        this.elements.userDropdownMenu.classList.add('opacity-100', 'visible', 'scale-100');
        
        // Focus first menu item
        const firstItem = this.elements.userDropdownMenu.querySelector('[role="menuitem"], a, button');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 100);
        }
        
        // Dispatch event
        this.dispatchCustomEvent('userDropdownOpened');
        
        this.log('User dropdown opened');
    }
    
    closeUserDropdown() {
        if (!this.state.userDropdownOpen) return;
        
        this.state.userDropdownOpen = false;
        
        // Update ARIA attributes
        this.elements.userDropdownToggle.setAttribute('aria-expanded', 'false');
        
        // Hide dropdown with animation
        this.elements.userDropdownMenu.classList.remove('opacity-100', 'visible', 'scale-100');
        this.elements.userDropdownMenu.classList.add('opacity-0', 'invisible', 'scale-95');
        
        // Return focus to toggle
        this.elements.userDropdownToggle.focus();
        
        // Dispatch event
        this.dispatchCustomEvent('userDropdownClosed');
        
        this.log('User dropdown closed');
    }
    
    // Navbar visibility methods
    hideNavbar() {
        if (!this.state.navbarVisible) return;
        
        this.state.navbarVisible = false;
        this.elements.navbar.style.transform = 'translateY(-100%)';
        
        this.log('Navbar hidden');
    }
    
    showNavbar() {
        if (this.state.navbarVisible) return;
        
        this.state.navbarVisible = true;
        this.elements.navbar.style.transform = 'translateY(0)';
        
        this.log('Navbar shown');
    }
    
    // Event handlers
    handleOutsideClick(e) {
        // Close user dropdown if clicking outside
        if (this.state.userDropdownOpen && 
            !this.elements.userDropdownToggle.contains(e.target) && 
            !this.elements.userDropdownMenu.contains(e.target)) {
            this.closeUserDropdown();
        }
        
        // Close mobile menu if clicking outside (and not on button)
        if (this.state.mobileMenuOpen && 
            !this.elements.mobileMenu.contains(e.target) && 
            !this.elements.mobileMenuButton.contains(e.target)) {
            this.closeMobileMenu();
        }
    }
    
    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth >= 1024 && this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Close dropdown on resize
        if (this.state.userDropdownOpen) {
            this.closeUserDropdown();
        }
    }
    
    handleDropdownKeyNavigation(e, items, currentIndex) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                items[prevIndex].focus();
                break;
                
            case 'Home':
                e.preventDefault();
                items[0].focus();
                break;
                
            case 'End':
                e.preventDefault();
                items[items.length - 1].focus();
                break;
                
            case 'Escape':
                e.preventDefault();
                this.closeUserDropdown();
                break;
                
            case 'Tab':
                this.closeUserDropdown();
                break;
        }
    }
    
    // Accessibility methods
    createSkipLink() {
        if (document.getElementById('skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.id = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all duration-200';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    createAriaLiveRegion() {
        if (document.getElementById('navbar-aria-live')) return;
        
        const liveRegion = document.createElement('div');
        liveRegion.id = 'navbar-aria-live';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        
        document.body.appendChild(liveRegion);
    }
    
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('navbar-aria-live');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    initFocusManagement() {
        // Focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    focusFirstMenuItem() {
        const firstItem = this.elements.mobileMenu?.querySelector('a, button');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 100);
        }
    }
    
    // Utility methods
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
    
    dispatchCustomEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...detail, navbar: this },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }
    
    log(message) {
        if (this.config.debug) {
            console.log(`[BronxBotNavbar] ${message}`);
        }
    }
    
    // Public API methods
    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.applyTheme(theme, true);
        }
    }
    
    getState() {
        return { ...this.state };
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    // Cleanup method
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Clean up body classes
        this.elements.body.classList.remove('overflow-hidden', 'keyboard-navigation');
        
        // Remove created elements
        const skipLink = document.getElementById('skip-link');
        const liveRegion = document.getElementById('navbar-aria-live');
        
        if (skipLink) skipLink.remove();
        if (liveRegion) liveRegion.remove();
        
        this.log('BronxBot Navbar destroyed');
    }
}

// Initialize navbar when DOM is ready
function initializeBronxBotNavbar() {
    if (typeof window !== 'undefined') {
        window.bronxBotNavbar = new BronxBotNavbar();
        
        // Global convenience methods
        window.toggleTheme = () => window.bronxBotNavbar.toggleTheme();
        window.toggleMobileMenu = () => window.bronxBotNavbar.toggleMobileMenu();
        
        // Debug mode
        if (window.bronxBotNavbar.config.debug) {
            console.log('BronxBot Navbar initialized and available as window.bronxBotNavbar');
        }
    }
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBronxBotNavbar);
} else {
    initializeBronxBotNavbar();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.bronxBotNavbar) {
        window.bronxBotNavbar.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BronxBotNavbar;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return BronxBotNavbar;
    });
}
