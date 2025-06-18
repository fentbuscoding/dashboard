/**
 * BronxBot Dashboard - Enhanced Debug Script for Navbar
 * Provides comprehensive debugging and diagnostic tools for navbar functionality
 */

console.log('🔧 BronxBot Dashboard - Enhanced Debug Script Loaded');

class NavbarDebugger {
    constructor() {
        this.debugInfo = {
            loadTime: Date.now(),
            errors: [],
            warnings: [],
            performance: {}
        };
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runDiagnostics());
        } else {
            this.runDiagnostics();
        }
    }

    runDiagnostics() {
        console.log('🔍 Running navbar diagnostics...');
        
        this.checkCriticalElements();
        this.checkNavbarStructure();
        this.checkThemeSystem();
        this.checkEventListeners();
        this.checkAccessibility();
        this.checkResponsiveness();
        this.performanceCheck();
        
        this.generateReport();
    }

    checkCriticalElements() {
        console.group('🎯 Checking Critical Elements');
        
        const criticalElements = {
            'theme-toggle': 'Theme Toggle Button',
            'mobile-menu-button': 'Mobile Menu Button',
            'user-dropdown-toggle': 'User Dropdown Toggle',
            'mobile-menu': 'Mobile Menu Container',
            'user-dropdown': 'User Dropdown Menu'
        };

        Object.entries(criticalElements).forEach(([id, description]) => {
            const element = document.getElementById(id);
            const status = element ? '✅ Found' : '❌ Missing';
            console.log(`${description}: ${status}`);
            
            if (!element) {
                this.debugInfo.errors.push(`Missing critical element: ${description} (#${id})`);
            } else {
                // Check if element is visible
                const rect = element.getBoundingClientRect();
                const isVisible = rect.width > 0 && rect.height > 0;
                if (!isVisible) {
                    this.debugInfo.warnings.push(`Element ${description} exists but is not visible`);
                }
            }
        });
        
        console.groupEnd();
    }

    checkNavbarStructure() {
        console.group('🏗️ Checking Navbar Structure');
        
        const navbar = document.querySelector('header');
        if (!navbar) {
            console.error('❌ Navbar header element not found!');
            this.debugInfo.errors.push('Navbar header element missing');
            console.groupEnd();
            return;
        }

        console.log('✅ Navbar header found');

        // Check logo
        const logo = navbar.querySelector('img[alt="BronxBot Logo"]');
        console.log(`Logo: ${logo ? '✅ Found' : '❌ Missing'}`);
        if (!logo) {
            this.debugInfo.warnings.push('BronxBot logo missing');
        }

        // Check navigation links
        const navLinks = navbar.querySelectorAll('a');
        console.log(`Navigation links: ${navLinks.length} found`);
        
        if (navLinks.length === 0) {
            this.debugInfo.warnings.push('No navigation links found');
        }

        // Check for proper semantic structure
        const nav = navbar.querySelector('nav');
        if (!nav) {
            this.debugInfo.warnings.push('Missing <nav> element for semantic structure');
        }

        console.groupEnd();
    }

    checkThemeSystem() {
        console.group('🌙 Checking Theme System');
        
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        
        console.log(`Theme toggle: ${themeToggle ? '✅ Found' : '❌ Missing'}`);
        console.log(`Sun icon: ${sunIcon ? '✅ Found' : '❌ Missing'}`);
        console.log(`Moon icon: ${moonIcon ? '✅ Found' : '❌ Missing'}`);
        
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        console.log(`Current theme: ${currentTheme}`);
        
        const storedTheme = localStorage.getItem('theme');
        console.log(`Stored theme: ${storedTheme || 'none'}`);
        
        if (!sunIcon || !moonIcon) {
            this.debugInfo.warnings.push('Theme icons missing, theme switching may not work properly');
            console.warn('⚠️ Theme icons missing, forcing light theme');
            document.documentElement.classList.remove('dark');
        }
        
        console.groupEnd();
    }

    checkEventListeners() {
        console.group('🎧 Checking Event Listeners');
        
        const elementsWithListeners = [
            'theme-toggle',
            'mobile-menu-button',
            'user-dropdown-toggle'
        ];

        elementsWithListeners.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const hasClickListener = element.onclick !== null || 
                    this.hasEventListener(element, 'click');
                console.log(`${id}: ${hasClickListener ? '✅ Has listeners' : '⚠️ No listeners detected'}`);
                
                if (!hasClickListener) {
                    this.debugInfo.warnings.push(`${id} may be missing click event listeners`);
                }
            }
        });
        
        console.groupEnd();
    }

    checkAccessibility() {
        console.group('♿ Checking Accessibility');
        
        const accessibilityChecks = [
            {
                selector: '[aria-label]',
                description: 'Elements with aria-label'
            },
            {
                selector: '[aria-expanded]',
                description: 'Elements with aria-expanded'
            },
            {
                selector: '[role]',
                description: 'Elements with role attributes'
            },
            {
                selector: 'button:not([aria-label]):not([title])',
                description: 'Buttons without accessible names',
                isError: true
            }
        ];

        accessibilityChecks.forEach(check => {
            const elements = document.querySelectorAll(check.selector);
            const count = elements.length;
            const status = count > 0 ? '✅' : (check.isError ? '❌' : '⚠️');
            console.log(`${status} ${check.description}: ${count}`);
            
            if (check.isError && count > 0) {
                this.debugInfo.errors.push(`Found ${count} buttons without accessible names`);
            }
        });
        
        console.groupEnd();
    }

    checkResponsiveness() {
        console.group('📱 Checking Responsive Design');
        
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        console.log(`Viewport: ${viewport.width}x${viewport.height}`);
        
        const breakpoints = {
            mobile: viewport.width <= 768,
            tablet: viewport.width > 768 && viewport.width <= 1024,
            desktop: viewport.width > 1024
        };
        
        const currentBreakpoint = Object.keys(breakpoints).find(key => breakpoints[key]);
        console.log(`Current breakpoint: ${currentBreakpoint}`);
        
        // Check if mobile menu is properly hidden/shown
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            const isHidden = mobileMenu.classList.contains('hidden') || 
                           getComputedStyle(mobileMenu).display === 'none';
            console.log(`Mobile menu hidden: ${isHidden ? '✅ Yes' : '❌ No'}`);
        }
        
        console.groupEnd();
    }

    performanceCheck() {
        console.group('⚡ Performance Check');
        
        const startTime = performance.now();
        
        // Measure DOM query performance
        const queryStart = performance.now();
        document.querySelectorAll('*');
        const queryTime = performance.now() - queryStart;
        
        console.log(`DOM query time: ${queryTime.toFixed(2)}ms`);
        
        // Check for potential performance issues
        const totalElements = document.querySelectorAll('*').length;
        console.log(`Total DOM elements: ${totalElements}`);
        
        if (totalElements > 1000) {
            this.debugInfo.warnings.push('High DOM element count may impact performance');
        }
        
        const endTime = performance.now();
        this.debugInfo.performance.diagnosticsTime = endTime - startTime;
        
        console.log(`Total diagnostics time: ${this.debugInfo.performance.diagnosticsTime.toFixed(2)}ms`);
        
        console.groupEnd();
    }

    hasEventListener(element, eventType) {
        // This is a simplified check - in reality, detecting event listeners is complex
        // We'll check for common patterns
        const listeners = element.getAttribute(`on${eventType}`);
        return listeners !== null;
    }

    generateReport() {
        console.group('📊 Debug Report Summary');
        
        const report = {
            timestamp: new Date().toISOString(),
            errors: this.debugInfo.errors.length,
            warnings: this.debugInfo.warnings.length,
            performance: this.debugInfo.performance,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            userAgent: navigator.userAgent,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        };
        
        console.log('📋 Summary:', report);
        
        if (this.debugInfo.errors.length > 0) {
            console.group('❌ Errors');
            this.debugInfo.errors.forEach(error => console.error(error));
            console.groupEnd();
        }
        
        if (this.debugInfo.warnings.length > 0) {
            console.group('⚠️ Warnings');
            this.debugInfo.warnings.forEach(warning => console.warn(warning));
            console.groupEnd();
        }
        
        if (this.debugInfo.errors.length === 0 && this.debugInfo.warnings.length === 0) {
            console.log('🎉 All checks passed!');
        }
        
        console.groupEnd();
        
        // Store report globally for access
        window.navbarDebugReport = report;
    }

    // Auto-fix common issues
    autoFix() {
        console.log('🔧 Attempting auto-fixes...');
        
        let fixesApplied = 0;
        
        // Fix missing theme icons
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle && (!document.getElementById('sun-icon') || !document.getElementById('moon-icon'))) {
            console.warn('⚠️ Theme icons missing, forcing light theme');
            document.documentElement.classList.remove('dark');
            fixesApplied++;
        }
        
        // Fix missing ARIA attributes
        const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
        buttons.forEach(button => {
            if (button.id) {
                const label = button.id.replace('-', ' ').replace(/([A-Z])/g, ' $1').trim();
                button.setAttribute('aria-label', label);
                fixesApplied++;
            }
        });
        
        console.log(`🔧 Applied ${fixesApplied} auto-fixes`);
        
        if (fixesApplied > 0) {
            // Re-run diagnostics to verify fixes
            setTimeout(() => this.runDiagnostics(), 100);
        }
    }
}

// Initialize debugger
const navbarDebugger = new NavbarDebugger();

// Export enhanced debug functions
window.debugNavbar = function() {
    return navbarDebugger.debugInfo;
};

window.debugNavbarFull = function() {
    navbarDebugger.runDiagnostics();
    return window.navbarDebugReport;
};

window.fixNavbar = function() {
    navbarDebugger.autoFix();
};

// Quick access functions
window.navbarHealth = function() {
    const report = window.navbarDebugReport || {};
    const health = (report.errors || 0) === 0 ? 'Healthy' : 'Issues Detected';
    console.log(`🏥 Navbar Health: ${health}`);
    return health;
};

console.log('🚀 Enhanced navbar debugger ready! Use debugNavbar(), debugNavbarFull(), fixNavbar(), or navbarHealth() in console.');
