// SakuraJP Homepage JavaScript - Modern iOS-Compliant Experience

class SakuraJPHomepage {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupThemeToggle();
        this.setupSmoothScrolling();
        this.setupNavbarEffects();
        this.setupScrollAnimations();
        this.setupInteractiveElements();
        this.setupPerformanceOptimizations();
    }
    
    // Theme Toggle Functionality
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;
        
        // Initialize theme from localStorage or system preference
        const savedTheme = localStorage.getItem('sakura-theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = savedTheme || systemTheme;
        
        this.setTheme(initialTheme);
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
                this.trackEvent('theme_toggle', { theme: newTheme });
            });
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('sakura-theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    setTheme(theme) {
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
        localStorage.setItem('sakura-theme', theme);
        
        // Animate theme transition
        html.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            html.style.transition = '';
        }, 300);
    }
    
    // Smooth Scrolling
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    this.trackEvent('navigation_click', { target: targetId });
                }
            });
        });
    }
    
    // Navbar Effects
    setupNavbarEffects() {
        const navbar = document.querySelector('.navbar');
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            if (navbar) {
                if (scrollY > 50) {
                    navbar.style.background = 'var(--glass-strong)';
                    navbar.style.borderBottomColor = 'var(--glass-border)';
                } else {
                    navbar.style.background = 'var(--glass-medium)';
                    navbar.style.borderBottomColor = 'var(--glass-border)';
                }
                
                // Hide/show navbar on scroll
                if (scrollY > lastScrollY && scrollY > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }
    
    // Scroll Animations
    setupScrollAnimations() {
        // Only run animations if user hasn't opted out
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animations
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, index * 100);
                }
            });
        }, observerOptions);
        
        // Animate elements on scroll
        const animatedElements = document.querySelectorAll(
            '.feature-card, .stat-card, .screenshot-feature, .download-card'
        );
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
        
        // Parallax effect for hero orbs
        this.setupParallaxEffects();
    }
    
    setupParallaxEffects() {
        const orbs = document.querySelectorAll('.orb');
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 0.2;
                orb.style.transform = `translate3d(0, ${rate * speed}px, 0)`;
            });
            
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }
    
    // Interactive Elements
    setupInteractiveElements() {
        // Feature card interactions
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                this.addRippleEffect(card);
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Button interactions
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createClickEffect(e.currentTarget, e);
                
                // Track button clicks
                const buttonText = button.textContent.trim();
                this.trackEvent('button_click', { button: buttonText });
            });
        });
        
        // Device mockup interaction
        const deviceMockup = document.querySelector('.device-mockup');
        if (deviceMockup) {
            deviceMockup.addEventListener('click', () => {
                this.animateDeviceMockup();
                this.trackEvent('mockup_interaction');
            });
        }
    }
    
    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            pointer-events: none;
            width: 100px;
            height: 100px;
            margin-top: -50px;
            margin-left: -50px;
            animation: ripple 0.6s ease-out;
            top: 50%;
            left: 50%;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    createClickEffect(button, event) {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
            transform: translate(-50%, -50%);
            animation: buttonRipple 0.5s ease-out;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 500);
    }
    
    animateDeviceMockup() {
        const mockInterface = document.querySelector('.mock-interface');
        if (mockInterface) {
            mockInterface.style.animation = 'mockupPulse 0.5s ease-out';
            setTimeout(() => {
                mockInterface.style.animation = '';
            }, 500);
        }
    }
    
    // Performance Optimizations
    setupPerformanceOptimizations() {
        // Lazy load images if any
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Prefetch critical resources
        this.prefetchResources();
    }
    
    prefetchResources() {
        // Prefetch fonts and critical resources
        const prefetchLinks = [
            'https://fonts.gstatic.com',
        ];
        
        prefetchLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = href;
            document.head.appendChild(link);
        });
    }
    
    // Analytics and Tracking
    trackEvent(eventName, properties = {}) {
        // Implement your analytics tracking here
        console.log(`Event: ${eventName}`, properties);
        
        // Example: Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
    }
    
    // Utility Methods
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
    
    @keyframes buttonRipple {
        to {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
    
    @keyframes mockupPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SakuraJPHomepage();
    });
} else {
    new SakuraJPHomepage();
}

// Export for potential module use
window.SakuraJPHomepage = SakuraJPHomepage;