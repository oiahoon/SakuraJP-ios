// 樱语 Homepage - Interactive JavaScript
// Modern ES6+ JavaScript for smooth interactions and animations

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Throttled function
     */
    function throttle(func, delay) {
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

    /**
     * Debounce function to delay function execution
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Check if element is in viewport
     * @param {Element} element - DOM element to check
     * @param {number} threshold - Threshold percentage (0-1)
     * @returns {boolean} Whether element is in viewport
     */
    function isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold &&
            rect.left <= windowWidth * (1 - threshold) &&
            rect.right >= windowWidth * threshold
        );
    }

    // =============================================================================
    // NAVIGATION SCROLL EFFECTS
    // =============================================================================

    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    const handleNavbarScroll = throttle(() => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScrollTop > scrollThreshold) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = '0 2px 20px rgba(248, 187, 217, 0.1)';
            
            // Hide navbar when scrolling down, show when scrolling up
            if (currentScrollTop > lastScrollTop && currentScrollTop > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.25)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = '0 8px 32px rgba(248, 187, 217, 0.2)';
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    }, 16); // ~60fps

    window.addEventListener('scroll', handleNavbarScroll);
    
    // =============================================================================
    // SMOOTH SCROLLING FOR NAVIGATION LINKS
    // =============================================================================

    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add active state animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });

    // =============================================================================
    // INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
    // =============================================================================

    const observerOptions = {
        threshold: [0.1, 0.3, 0.5],
        rootMargin: '-50px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('animate-in');
                
                // Special animations for different elements
                if (element.classList.contains('feature-card')) {
                    const delay = Array.from(element.parentNode.children).indexOf(element) * 100;
                    element.style.animationDelay = `${delay}ms`;
                }
                
                if (element.classList.contains('screenshot-item')) {
                    const delay = Array.from(element.parentNode.children).indexOf(element) * 150;
                    element.style.animationDelay = `${delay}ms`;
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.feature-card, .screenshot-item, .hero-stats, .section-header');
    animatedElements.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });

    // =============================================================================
    // HERO SECTION INTERACTIONS
    // =============================================================================

    // Floating cards animation enhancement
    const floatingCards = document.querySelectorAll('.floating-card');
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', throttle((e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        
        floatingCards.forEach((card, index) => {
            const intensity = (index + 1) * 0.5;
            const xOffset = mouseX * intensity * 10;
            const yOffset = mouseY * intensity * 10;
            
            card.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    }, 16));

    // Hero buttons interaction effects
    const heroButtons = document.querySelectorAll('.hero-actions .btn');
    heroButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
    });

    // =============================================================================
    // STATISTICS COUNTER ANIMATION
    // =============================================================================

    const statsNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    const animateStats = () => {
        if (statsAnimated) return;
        statsAnimated = true;
        
        statsNumbers.forEach(stat => {
            const text = stat.textContent;
            
            if (text === '17,929') {
                animateNumber(stat, 0, 17929, 2000, (num) => num.toLocaleString());
            } else if (text === 'AI') {
                stat.style.opacity = '0';
                setTimeout(() => {
                    stat.textContent = 'AI';
                    stat.style.opacity = '1';
                    stat.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        stat.style.transform = 'scale(1)';
                    }, 200);
                }, 500);
            } else if (text === 'iOS 18+') {
                stat.style.opacity = '0';
                setTimeout(() => {
                    stat.textContent = 'iOS 18+';
                    stat.style.opacity = '1';
                    stat.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        stat.style.transform = 'scale(1)';
                    }, 200);
                }, 1000);
            }
        });
    };

    function animateNumber(element, start, end, duration, formatter = (num) => num) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            
            element.textContent = formatter(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Trigger stats animation when hero section is visible
    const heroSection = document.querySelector('.hero');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                animateStats();
            }
        });
    }, { threshold: 0.5 });
    
    if (heroSection) {
        statsObserver.observe(heroSection);
    }

    // =============================================================================
    // FEATURE CARDS HOVER EFFECTS
    // =============================================================================

    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(248, 187, 217, 0.3)';
            
            // Animate icon
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 32px rgba(248, 187, 217, 0.2)';
            
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });

    // =============================================================================
    // SCREENSHOT CAROUSEL INTERACTIONS
    // =============================================================================

    const screenshotItems = document.querySelectorAll('.screenshot-item');
    
    screenshotItems.forEach(item => {
        const img = item.querySelector('.screenshot-img');
        
        item.addEventListener('mouseenter', function() {
            img.style.transform = 'scale(1.05)';
            img.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            img.style.transform = 'scale(1)';
            img.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
    });

    // =============================================================================
    // DOWNLOAD BUTTON ANALYTICS
    // =============================================================================

    const downloadButtons = document.querySelectorAll('.btn-primary, .download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Track download button clicks
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    event_category: 'Download',
                    event_label: 'App Store Link',
                    value: 1
                });
            }
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });

    // =============================================================================
    // RESPONSIVE INTERACTIONS
    // =============================================================================

    const handleResize = debounce(() => {
        // Reset any mouse-based animations on mobile
        if (window.innerWidth <= 768) {
            floatingCards.forEach(card => {
                card.style.transform = 'translate(0, 0)';
            });
        }
        
        // Recalculate scroll positions
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    }, 250);

    window.addEventListener('resize', handleResize);

    // =============================================================================
    // PERFORMANCE OPTIMIZATIONS
    // =============================================================================

    // Lazy load images when they come into view
    const images = document.querySelectorAll('img[src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // If the image has a data-src attribute, use lazy loading
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });

    images.forEach(img => {
        imageObserver.observe(img);
    });

    // =============================================================================
    // ACCESSIBILITY ENHANCEMENTS
    // =============================================================================

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // Disable animations for users who prefer reduced motion
        document.documentElement.style.setProperty('--transition-fast', '0.01ms');
        document.documentElement.style.setProperty('--transition-medium', '0.01ms');
        document.documentElement.style.setProperty('--transition-slow', '0.01ms');
    }

    // Focus management for better keyboard navigation
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #FF6B9D';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });

    // =============================================================================
    // INITIALIZATION COMPLETE
    // =============================================================================

    console.log('🌸 樱语 Homepage initialized successfully');
    
    // Add loaded class to body for any CSS animations that depend on JS loading
    document.body.classList.add('js-loaded');
});

// =============================================================================
// CSS ANIMATIONS (Added via JavaScript for better control)
// =============================================================================

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .js-loaded .hero-title {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .js-loaded .hero-description {
        animation: fadeInUp 0.8s ease-out 0.2s forwards;
        opacity: 0;
    }
    
    .js-loaded .hero-actions {
        animation: fadeInUp 0.8s ease-out 0.4s forwards;
        opacity: 0;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .screenshot-img, .feature-card, .floating-card {
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .feature-icon {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    img.loaded {
        opacity: 1;
        transition: opacity 0.3s ease-in-out;
    }
    
    img:not(.loaded) {
        opacity: 0;
    }
`;

document.head.appendChild(style);
