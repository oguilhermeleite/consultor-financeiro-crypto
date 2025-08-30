/**
 * Phase 3 JavaScript - High-Conversion Legal Framework
 * CRITICAL: Educational focus with psychological triggers for maximum conversion
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Phase 3 JavaScript initialized - High-Conversion Legal Framework');
    
    // Initialize all Phase 3 features
    initializeConversionFramework();
    initializePortfolioVisualization();
    initializeLiveActivityFeed();
    initializeVideoTestimonials();
    initializeUserProfileTracking();
});

// ==========================================
// CONVERSION FRAMEWORK INITIALIZATION
// ==========================================

function initializeConversionFramework() {
    console.log('🎯 Initializing conversion framework...');
    
    // Initialize hero section interactions
    initializeHeroSection();
    
    // Initialize authority building elements
    initializeAuthoritySection();
    
    // Initialize trust signals
    initializeTrustSignals();
    
    // Initialize FAQ interactions
    initializeFAQSection();
    
    console.log('✅ Conversion framework initialized');
}

/**
 * Hero Section with Psychological Triggers
 */
function initializeHeroSection() {
    const heroButton = document.querySelector('.cta-main');
    const userCounter = document.querySelector('.highlight-number');
    
    // Animate user counter on page load
    if (userCounter) {
        animateCounter(userCounter, 12847, 2000);
    }
    
    // Enhanced CTA button interactions
    if (heroButton) {
        heroButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Track conversion event
            trackConversionEvent('hero_cta_click', {
                button_text: this.textContent.trim(),
                position: 'hero_section'
            });
            
            // Smooth scroll to quiz with enhanced UX
            scrollToQuizWithAnimation();
        });
        
        // Add micro-interactions
        heroButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.animationPlayState = 'paused';
        });
        
        heroButton.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.animationPlayState = 'running';
        });
    }
}

/**
 * Authority Section Trust Building
 */
function initializeAuthoritySection() {
    const methodCards = document.querySelectorAll('.method-card');
    
    // Staggered entrance animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    methodCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

/**
 * Trust Signals and Social Proof
 */
function initializeTrustSignals() {
    // Update user count dynamically
    updateUserCount();
    
    // Initialize testimonial interactions
    const testimonialCards = document.querySelectorAll('.testimonial-card.verified');
    testimonialCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
            trackConversionEvent('testimonial_click', {
                user: this.querySelector('h4')?.textContent || 'unknown'
            });
        });
    });
}

/**
 * FAQ Section for Objection Removal
 */
function initializeFAQSection() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const isExpanded = this.classList.contains('expanded');
            
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('expanded');
            });
            
            // Toggle current FAQ
            if (!isExpanded) {
                this.classList.add('expanded');
                trackConversionEvent('faq_click', {
                    question: this.querySelector('h3')?.textContent || 'unknown'
                });
            }
        });
    });
}

// ==========================================
// PORTFOLIO VISUALIZATION
// ==========================================

function initializePortfolioVisualization() {
    console.log('📊 Initializing portfolio visualization...');
    
    // Chart.js configuration for portfolio pie chart
    window.portfolioChartConfig = {
        conservative: {
            data: [50, 20, 30],
            labels: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Stablecoins'],
            colors: ['#F7931A', '#627EEA', '#26A17B']
        },
        moderate: {
            data: [35, 25, 15, 10, 10, 5],
            labels: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Binance Coin (BNB)', 'Stablecoins', 'Altcoins'],
            colors: ['#F7931A', '#627EEA', '#9945FF', '#F3BA2F', '#26A17B', '#00D4AA']
        },
        aggressive: {
            data: [20, 20, 20, 30, 10],
            labels: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Altcoins', 'DeFi Tokens'],
            colors: ['#F7931A', '#627EEA', '#9945FF', '#00D4AA', '#FF6B6B']
        }
    };
}

/**
 * Render portfolio chart based on user profile
 */
function renderPortfolioChart(profile) {
    const canvas = document.getElementById('portfolioChart');
    if (!canvas || typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js not available or canvas not found');
        return;
    }
    
    const config = window.portfolioChartConfig[profile];
    if (!config) {
        console.warn('⚠️ No chart configuration for profile:', profile);
        return;
    }
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: config.labels,
            datasets: [{
                data: config.data,
                backgroundColor: config.colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
    
    console.log('📊 Portfolio chart rendered for profile:', profile);
}

/**
 * Show personalized portfolio result
 */
function showPortfolioResult(profileData) {
    const { profile, allocation, riskScore, strategies } = profileData;
    
    // Update profile badge
    const profileBadge = document.querySelector('.profile-type-badge');
    if (profileBadge) {
        profileBadge.textContent = profile.toUpperCase();
    }
    
    // Update risk meters
    updateRiskMeters(riskScore);
    
    // Update allocation details
    updateAllocationDetails(allocation);
    
    // Update investment examples
    updateInvestmentExamples(allocation);
    
    // Update strategies
    updatePersonalizedStrategies(strategies);
    
    // Render chart
    renderPortfolioChart(profile);
    
    // Track result view
    trackConversionEvent('portfolio_result_shown', {
        profile: profile,
        risk_score: riskScore
    });
}

/**
 * Update risk meters with animation
 */
function updateRiskMeters(riskScore) {
    const meters = document.querySelectorAll('.meter-fill');
    
    const riskValues = {
        volatility: riskScore.volatility || 60,
        potential: riskScore.potential || 70,
        protection: riskScore.protection || 65
    };
    
    meters.forEach((meter, index) => {
        const values = Object.values(riskValues);
        if (values[index]) {
            setTimeout(() => {
                meter.style.width = values[index] + '%';
            }, index * 500 + 1000);
        }
    });
}

/**
 * Update allocation details with real data
 */
function updateAllocationDetails(allocation) {
    const allocationItems = document.querySelectorAll('.allocation-item');
    
    if (allocation && allocationItems.length > 0) {
        allocation.forEach((item, index) => {
            const element = allocationItems[index];
            if (element) {
                const percentage = element.querySelector('.allocation-percentage');
                const reason = element.querySelector('.allocation-reason');
                
                if (percentage) percentage.textContent = item.percentage + '%';
                if (reason) reason.textContent = item.reason;
            }
        });
    }
}

// ==========================================
// LIVE ACTIVITY FEED
// ==========================================

function initializeLiveActivityFeed() {
    console.log('📡 Initializing live activity feed...');
    
    const activities = [
        { user: 'Pedro M.', action: 'descobriu ser Perfil Moderado', time: 'agora' },
        { user: 'Ana S.', action: 'refez sua análise após 6 meses', time: 'há 3 min' },
        { user: 'Lucas R.', action: 'baixou relatório personalizado', time: 'há 5 min' },
        { user: 'Maria C.', action: 'ativou alertas de rebalanceamento', time: 'há 8 min' },
        { user: 'João P.', action: 'completou análise de risco', time: 'há 12 min' },
        { user: 'Carla T.', action: 'descobriu ser Perfil Arrojado', time: 'há 15 min' }
    ];
    
    let currentIndex = 0;
    
    function updateActivityFeed() {
        const feedContainer = document.querySelector('.activity-items');
        if (!feedContainer) return;
        
        // Rotate activities to create live feel
        const activity = activities[currentIndex];
        const newItem = document.createElement('div');
        newItem.className = 'activity-item';
        newItem.innerHTML = `
            <span>${activity.user} ${activity.action}</span>
            <span class="time">${activity.time}</span>
        `;
        
        // Add to top of feed
        feedContainer.insertBefore(newItem, feedContainer.firstChild);
        
        // Remove oldest item if more than 4
        if (feedContainer.children.length > 4) {
            feedContainer.removeChild(feedContainer.lastChild);
        }
        
        currentIndex = (currentIndex + 1) % activities.length;
    }
    
    // Update activity feed every 15 seconds
    setInterval(updateActivityFeed, 15000);
    
    console.log('✅ Live activity feed initialized');
}

// ==========================================
// VIDEO TESTIMONIALS
// ==========================================

function initializeVideoTestimonials() {
    const playButton = document.querySelector('.play-btn');
    
    if (playButton) {
        playButton.addEventListener('click', function() {
            // For now, show modal with testimonial text
            // In production, this would open video modal
            showTestimonialModal();
            
            trackConversionEvent('video_testimonial_click', {
                source: 'hero_section'
            });
        });
    }
}

function showTestimonialModal() {
    const modal = document.createElement('div');
    modal.className = 'testimonial-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📹 Depoimentos Reais de Traders</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>João Silva (Perfil Conservador):</strong></p>
                <p>"A análise mudou completamente minha abordagem. Antes eu estava 100% em altcoins por FOMO. Agora tenho uma base sólida em BTC e ETH, e durmo tranquilo mesmo com a volatilidade."</p>
                
                <p><strong>Maria Costa (Perfil Arrojado):</strong></p>
                <p>"Descobri que posso arriscar mais do que pensava. A carteira sugerida tem altcoins que nem conhecia, mas faz total sentido com meu perfil. Já estou vendo resultados."</p>
                
                <p><strong>Carlos Mendes (Perfil Moderado):</strong></p>
                <p>"Uso mensalmente para acompanhar se meu perfil mudou. É incrível como evoluímos com experiência. As dicas de rebalanceamento são ouro."</p>
            </div>
            <div class="modal-footer">
                <button class="btn-start-analysis">Fazer Minha Análise Agora</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 20px;
        animation: slideInUp 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    const startBtn = modal.querySelector('.btn-start-analysis');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    startBtn.addEventListener('click', () => {
        modal.remove();
        scrollToQuizWithAnimation();
    });
}

// ==========================================
// USER PROFILE TRACKING
// ==========================================

function initializeUserProfileTracking() {
    // Track user journey for personalization
    window.userJourney = {
        startTime: Date.now(),
        interactions: [],
        profile: null,
        conversionPoints: []
    };
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestone scrolls
            if (scrollPercent >= 25 && !window.userJourney.interactions.includes('scroll_25')) {
                window.userJourney.interactions.push('scroll_25');
                trackConversionEvent('scroll_milestone', { depth: '25%' });
            }
            if (scrollPercent >= 50 && !window.userJourney.interactions.includes('scroll_50')) {
                window.userJourney.interactions.push('scroll_50');
                trackConversionEvent('scroll_milestone', { depth: '50%' });
            }
            if (scrollPercent >= 75 && !window.userJourney.interactions.includes('scroll_75')) {
                window.userJourney.interactions.push('scroll_75');
                trackConversionEvent('scroll_milestone', { depth: '75%' });
            }
        }
    });
    
    // Track time on page
    setInterval(() => {
        const timeOnPage = Math.round((Date.now() - window.userJourney.startTime) / 1000);
        
        // Track engagement milestones
        if (timeOnPage === 60) {
            trackConversionEvent('time_milestone', { duration: '1_minute' });
        }
        if (timeOnPage === 180) {
            trackConversionEvent('time_milestone', { duration: '3_minutes' });
        }
        if (timeOnPage === 300) {
            trackConversionEvent('time_milestone', { duration: '5_minutes' });
        }
    }, 30000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Animate counter numbers
 */
function animateCounter(element, targetNumber, duration) {
    const startNumber = 0;
    const startTime = Date.now();
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress);
        element.textContent = currentNumber.toLocaleString('pt-BR');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetNumber.toLocaleString('pt-BR');
        }
    }
    
    updateCounter();
}

/**
 * Enhanced quiz scroll with conversion optimization
 */
function scrollToQuizWithAnimation() {
    // Find quiz section
    const quizSection = document.querySelector('#questionnaire-section') || 
                       document.querySelector('.questionnaire-section') ||
                       document.querySelector('.quiz');
    
    if (quizSection) {
        // Show quiz if hidden
        if (quizSection.classList.contains('hidden')) {
            quizSection.classList.remove('hidden');
        }
        
        // Calculate offset
        const offsetTop = quizSection.getBoundingClientRect().top + window.pageYOffset;
        const stickyHeaderHeight = document.querySelector('.crypto-ticker-section')?.offsetHeight || 0;
        const navHeight = document.querySelector('.fixed-nav')?.offsetHeight || 0;
        const totalOffset = stickyHeaderHeight + navHeight + 20;
        
        window.scrollTo({
            top: offsetTop - totalOffset,
            behavior: 'smooth'
        });
        
        // Add visual feedback
        setTimeout(() => {
            quizSection.style.border = '3px solid var(--primary-crypto)';
            setTimeout(() => {
                quizSection.style.border = '';
            }, 2000);
        }, 500);
        
        console.log('📍 Scrolled to quiz with conversion optimization');
    } else {
        // Fallback: try existing functions
        if (typeof startAnalysis === 'function') {
            startAnalysis();
        }
    }
}

/**
 * Update user count with slight randomization
 */
function updateUserCount() {
    const counter = document.querySelector('.highlight-number');
    if (counter) {
        // Add slight variance to make it feel more real
        const baseCount = 12847;
        const variance = Math.floor(Math.random() * 50);
        const newCount = baseCount + variance;
        
        setTimeout(() => {
            animateCounter(counter, newCount, 1500);
        }, 1000);
    }
}

/**
 * Track conversion events for optimization
 */
function trackConversionEvent(eventName, data = {}) {
    try {
        // Enhanced analytics tracking
        const eventData = {
            ...data,
            timestamp: Date.now(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            session_id: getSessionId(),
            phase: 'phase3_conversion'
        };
        
        // Use existing analytics if available
        if (window.cryptoFeatures && window.cryptoFeatures.analytics) {
            window.cryptoFeatures.analytics.trackEvent(eventName, eventData);
        } else if (typeof gtag === 'function') {
            gtag('event', eventName, {
                event_category: 'Conversion',
                event_label: JSON.stringify(data),
                value: 1
            });
        }
        
        // Store in local storage for analysis
        const conversionLog = JSON.parse(localStorage.getItem('conversionLog') || '[]');
        conversionLog.push({ event: eventName, data: eventData });
        
        // Keep only last 100 events
        if (conversionLog.length > 100) {
            conversionLog.splice(0, conversionLog.length - 100);
        }
        
        localStorage.setItem('conversionLog', JSON.stringify(conversionLog));
        
        console.log('📊 Conversion event tracked:', eventName, data);
    } catch (error) {
        console.warn('⚠️ Conversion tracking failed:', error);
    }
}

/**
 * Get or create session ID
 */
function getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

/**
 * Portfolio result actions
 */
function initializeResultActions() {
    // Download report button
    const downloadBtn = document.querySelector('.btn-download-report');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            generatePDFReport();
            trackConversionEvent('pdf_download', { source: 'result_section' });
        });
    }
    
    // Save email button
    const emailBtn = document.querySelector('.btn-save-email');
    if (emailBtn) {
        emailBtn.addEventListener('click', function() {
            showEmailCaptureModal();
            trackConversionEvent('email_capture_click', { source: 'result_section' });
        });
    }
    
    // Retake analysis button
    const retakeBtn = document.querySelector('.btn-retake');
    if (retakeBtn) {
        retakeBtn.addEventListener('click', function() {
            restartAnalysis();
            trackConversionEvent('retake_analysis', { source: 'result_section' });
        });
    }
    
    // PRO upsell button
    const proBtn = document.querySelector('.btn-try-pro');
    if (proBtn) {
        proBtn.addEventListener('click', function() {
            showProModal();
            trackConversionEvent('pro_upsell_click', { source: 'result_section' });
        });
    }
}

/**
 * Generate PDF report (placeholder)
 */
function generatePDFReport() {
    // This would integrate with jsPDF or similar library
    alert('📄 Funcionalidade de PDF em desenvolvimento. Por enquanto, você pode fazer screenshot do resultado!');
}

/**
 * Show email capture modal
 */
function showEmailCaptureModal() {
    const modal = document.createElement('div');
    modal.className = 'email-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>📧 Receber Análise por Email</h3>
            <p>Digite seu email para receber o relatório completo:</p>
            <input type="email" placeholder="seu@email.com" class="email-input">
            <button class="btn-send-email">Enviar Relatório</button>
            <button class="btn-close-modal">Fechar</button>
        </div>
    `;
    
    // Modal styling
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    
    // Modal functionality
    modal.querySelector('.btn-close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.btn-send-email').addEventListener('click', function() {
        const email = modal.querySelector('.email-input').value;
        if (email) {
            // Here you would integrate with email service
            alert('✅ Email salvo! Em breve implementaremos o envio automático.');
            trackConversionEvent('email_captured', { email_domain: email.split('@')[1] });
            modal.remove();
        }
    });
}

/**
 * Show PRO modal
 */
function showProModal() {
    alert('🚀 Versão PRO em desenvolvimento! Em breve teremos dashboard avançado, alertas personalizados e comunidade exclusiva.');
}

/**
 * Restart analysis
 */
function restartAnalysis() {
    // Clear previous results
    localStorage.removeItem('userProfile');
    localStorage.removeItem('formData');
    
    // Scroll to top and restart
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide results and show quiz
    const resultsSection = document.getElementById('results');
    const quizSection = document.getElementById('questionnaire-section');
    
    if (resultsSection) resultsSection.classList.add('hidden');
    if (quizSection) quizSection.classList.remove('hidden');
    
    setTimeout(() => {
        scrollToQuizWithAnimation();
    }, 500);
}

// ==========================================
// ENHANCED INTERACTION TRACKING
// ==========================================

// Track clicks on all CTA elements
document.addEventListener('click', function(e) {
    const element = e.target;
    
    // Track CTA clicks
    if (element.classList.contains('cta-main') || 
        element.classList.contains('cta-secondary') ||
        element.id === 'primaryCTA' ||
        element.id === 'secondaryCTA') {
        
        trackConversionEvent('cta_click', {
            button_class: element.className,
            button_id: element.id,
            button_text: element.textContent.trim(),
            scroll_position: window.scrollY
        });
    }
    
    // Track value item clicks
    if (element.closest('.value-item')) {
        const valueItem = element.closest('.value-item');
        const title = valueItem.querySelector('h3')?.textContent;
        trackConversionEvent('value_item_click', { value_item: title });
    }
    
    // Track method card clicks
    if (element.closest('.method-card')) {
        const methodCard = element.closest('.method-card');
        const title = methodCard.querySelector('h3')?.textContent;
        trackConversionEvent('method_card_click', { method: title });
    }
});

// Track hover events for heat mapping
document.addEventListener('mouseover', function(e) {
    const element = e.target;
    
    if (element.classList.contains('cta-main') || 
        element.classList.contains('cta-secondary')) {
        trackConversionEvent('cta_hover', {
            button_class: element.className,
            time_to_hover: Date.now() - window.userJourney.startTime
        });
    }
});

// ==========================================
// INITIALIZATION COMPLETION
// ==========================================

// Initialize result actions when DOM is ready
setTimeout(initializeResultActions, 1000);

// Export Phase 3 functions
window.Phase3 = {
    showPortfolioResult,
    renderPortfolioChart,
    trackConversionEvent,
    restartAnalysis,
    scrollToQuizWithAnimation,
    generatePDFReport
};

console.log('✅ Phase 3 JavaScript fully loaded - High-Conversion Legal Framework ready');

// ==========================================
// DEVELOPMENT HELPERS
// ==========================================

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode - Phase 3 helpers available');
    console.log('💡 Use Phase3.showPortfolioResult({profile: "moderate", allocation: [...], riskScore: {...}})');
    console.log('💡 Use Phase3.trackConversionEvent("test_event", {data: "test"})');
    
    window.testConversion = function() {
        console.log('🧪 Testing conversion framework...');
        trackConversionEvent('test_conversion', { source: 'development' });
        console.log('📊 Check localStorage conversionLog for tracking data');
    };
}