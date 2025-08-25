/**
 * Phase 1 - CTA Button + How It Works Section JavaScript
 * CRITICAL: This file only ADDS new functionality without modifying existing code
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Phase 1 JavaScript initialized');
    
    // Initialize CTA functionality
    initializeCTAButtons();
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize intersection observer for entrance animations
    initializeEntranceAnimations();
});

/**
 * Initialize CTA button functionality
 */
function initializeCTAButtons() {
    const primaryCTA = document.getElementById('primaryCTA');
    const secondaryCTA = document.getElementById('secondaryCTA');
    
    // Primary CTA click handler
    if (primaryCTA) {
        primaryCTA.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToQuiz();
            trackCTAClick('primary');
        });
        
        // Add subtle hover effects
        primaryCTA.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        primaryCTA.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    }
    
    // Secondary CTA click handler
    if (secondaryCTA) {
        secondaryCTA.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToQuiz();
            trackCTAClick('secondary');
        });
    }
    
    console.log('✅ CTA buttons initialized');
}

/**
 * Scroll to quiz/form section with smooth animation
 */
function scrollToQuiz() {
    // Try multiple selectors to find the quiz section
    const possibleSelectors = [
        '#questionnaire-section',
        '[data-quiz]',
        '.questionnaire-section',
        '.quiz',
        'form',
        '#quiz',
        '.form-card',
        '.unified-form'
    ];
    
    let quizSection = null;
    
    // Find the first matching element
    for (const selector of possibleSelectors) {
        quizSection = document.querySelector(selector);
        if (quizSection) {
            break;
        }
    }
    
    if (quizSection) {
        // Check if quiz is hidden and show it if needed
        if (quizSection.classList.contains('hidden')) {
            // Try to show it using existing methods
            if (typeof startAnalysis === 'function') {
                startAnalysis();
                return;
            } else if (typeof showQuestionnaire === 'function') {
                showQuestionnaire();
                return;
            }
            
            // Fallback: remove hidden class
            quizSection.classList.remove('hidden');
        }
        
        // Scroll to the section
        const offsetTop = quizSection.getBoundingClientRect().top + window.pageYOffset;
        const offset = 80; // Account for fixed nav
        
        window.scrollTo({
            top: offsetTop - offset,
            behavior: 'smooth'
        });
        
        console.log('📍 Scrolled to quiz section');
    } else {
        // Fallback: try to start analysis or scroll to bottom
        if (typeof startAnalysis === 'function') {
            startAnalysis();
        } else {
            // Scroll to bottom of page as last resort
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }
        
        console.log('⚠️ Quiz section not found, used fallback');
    }
}

/**
 * Initialize scroll animations for sections
 */
function initializeScrollAnimations() {
    const sections = document.querySelectorAll('.cta-hero-section, .how-it-works-section');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease';
    });
    
    // Trigger animations on page load
    setTimeout(() => {
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 100);
    
    console.log('✅ Scroll animations initialized');
}

/**
 * Initialize entrance animations for step items
 */
function initializeEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add stagger effect for step items
                const stepItems = entry.target.querySelectorAll('.step-item');
                stepItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 150);
                });
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe sections
    const animatedSections = document.querySelectorAll('.how-it-works-section');
    animatedSections.forEach(section => {
        observer.observe(section);
        
        // Initialize step items
        const stepItems = section.querySelectorAll('.step-item');
        stepItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s ease';
        });
    });
    
    console.log('✅ Entrance animations initialized');
}

/**
 * Track CTA button clicks for analytics
 */
function trackCTAClick(buttonType) {
    try {
        // Try to use existing analytics if available
        if (window.cryptoFeatures && window.cryptoFeatures.analytics) {
            window.cryptoFeatures.analytics.trackEvent('cta_click', {
                button_type: buttonType,
                section: 'phase1',
                timestamp: Date.now()
            });
        } else if (typeof gtag === 'function') {
            gtag('event', 'click', {
                event_category: 'CTA',
                event_label: buttonType,
                value: 1
            });
        }
        
        console.log(`📊 CTA click tracked: ${buttonType}`);
    } catch (error) {
        console.warn('⚠️ Analytics tracking failed:', error);
    }
}

/**
 * Handle keyboard navigation for accessibility
 */
document.addEventListener('keydown', function(e) {
    const activeElement = document.activeElement;
    
    // Enhanced Enter key handling for CTA buttons
    if (e.key === 'Enter' && activeElement) {
        if (activeElement.id === 'primaryCTA' || activeElement.id === 'secondaryCTA') {
            e.preventDefault();
            activeElement.click();
        }
    }
    
    // Tab navigation enhancement
    if (e.key === 'Tab') {
        const ctaButtons = document.querySelectorAll('#primaryCTA, #secondaryCTA');
        ctaButtons.forEach(button => {
            if (button === activeElement) {
                button.style.outline = '2px solid #4CAF50';
                button.style.outlineOffset = '2px';
            }
        });
    }
});

/**
 * Add focus/blur handlers for better UX
 */
document.addEventListener('focusin', function(e) {
    if (e.target.id === 'primaryCTA' || e.target.id === 'secondaryCTA') {
        e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.3)';
    }
});

document.addEventListener('focusout', function(e) {
    if (e.target.id === 'primaryCTA' || e.target.id === 'secondaryCTA') {
        e.target.style.boxShadow = '';
    }
});

/**
 * Handle reduced motion preferences
 */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
        .btn-discover-profile {
            animation: none !important;
        }
        .step-item,
        .cta-hero-section,
        .how-it-works-section,
        .btn-start-now {
            transition: none !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('♿ Reduced motion preferences applied');
}

/**
 * Responsive behavior adjustments
 */
function handleResponsiveAdjustments() {
    const isMobile = window.innerWidth <= 768;
    const steps = document.querySelectorAll('.step-item');
    
    if (isMobile) {
        // Adjust animation delays for mobile
        steps.forEach((step, index) => {
            step.style.animationDelay = `${index * 100}ms`;
        });
    }
}

// Handle resize events
window.addEventListener('resize', handleResponsiveAdjustments);
handleResponsiveAdjustments(); // Initial call

/**
 * Add error handling for missing elements
 */
window.addEventListener('error', function(e) {
    if (e.message.includes('phase1')) {
        console.warn('⚠️ Phase 1 error:', e.message);
        
        // Fallback functionality
        const fallbackCTA = document.querySelector('.cta-button');
        if (fallbackCTA && !document.getElementById('primaryCTA')) {
            console.log('🔄 Using fallback CTA button');
        }
    }
});

/**
 * Export functions for potential use by other modules
 */
window.Phase1 = {
    scrollToQuiz,
    trackCTAClick,
    initializeCTAButtons
};

console.log('✅ Phase 1 JavaScript fully loaded and ready');