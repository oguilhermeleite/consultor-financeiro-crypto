/**
 * Market Dashboard Integration
 * 
 * Integrates market dashboard with existing crypto advisor functionality
 * DOES NOT MODIFY existing code - only adds hooks and extensions
 */

// Integration state
let integrationState = {
    originalShowResults: null,
    isHooked: false,
    profileCompleted: false
};

/**
 * Hook into existing CryptoAdvisor showResults function
 */
function hookIntoExistingFlow() {
    console.log('🔗 Setting up market dashboard integration hooks...');
    
    // Wait for the main application to be ready
    if (typeof window.cryptoAdvisor === 'undefined') {
        console.log('⏳ Waiting for main application...');
        setTimeout(hookIntoExistingFlow, 500);
        return;
    }
    
    try {
        // Hook into the showResults method
        if (window.cryptoAdvisor && typeof window.cryptoAdvisor.showResults === 'function') {
            integrationState.originalShowResults = window.cryptoAdvisor.showResults.bind(window.cryptoAdvisor);
            
            // Create enhanced showResults that adds dashboard functionality
            window.cryptoAdvisor.showResults = function() {
                console.log('📊 Enhanced showResults called - adding market dashboard');
                
                // Call original showResults first
                integrationState.originalShowResults();
                
                // Add dashboard integration after a delay
                setTimeout(() => {
                    integrateDashboard(this.userProfile);
                }, 2000); // 2 second delay to let results display
            };
            
            integrationState.isHooked = true;
            console.log('✅ Successfully hooked into showResults function');
            
        } else {
            console.warn('⚠️ Could not find showResults function to hook into');
        }
        
    } catch (error) {
        console.error('❌ Failed to hook into existing flow:', error);
    }
}

/**
 * Integrate dashboard after profile completion
 * @param {Object} userProfile - User profile data from the quiz
 */
function integrateDashboard(userProfile) {
    console.log('🎯 Integrating market dashboard with profile:', userProfile);
    
    try {
        // Store profile data for dashboard use
        integrationState.profileCompleted = true;
        
        // Wait a bit more to ensure results are fully displayed
        setTimeout(() => {
            // Show the dashboard section
            if (window.MarketDashboard && typeof window.MarketDashboard.showDashboard === 'function') {
                window.MarketDashboard.showDashboard(userProfile);
                console.log('✅ Market dashboard shown successfully');
            } else {
                console.error('❌ Market dashboard not available');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Failed to integrate dashboard:', error);
    }
}

/**
 * Add global CSS overrides to ensure smooth transitions
 */
function addTransitionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Smooth transitions between sections */
        #results, #dashboard {
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        #dashboard.slide-in {
            opacity: 0;
            transform: translateY(20px);
            animation: slideInDashboard 0.6s ease forwards;
        }
        
        @keyframes slideInDashboard {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Ensure proper z-index stacking */
        .dashboard-section {
            position: relative;
            z-index: 10;
        }
        
        .results-section {
            position: relative;
            z-index: 5;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Enhanced error handling for integration
 */
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        if (event.error && event.error.message.includes('market')) {
            console.error('🚨 Market integration error:', event.error);
            
            // Try to recover gracefully
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection && dashboardSection.style.display === 'block') {
                showFallbackDashboard();
            }
        }
    });
}

/**
 * Fallback dashboard for error scenarios
 */
function showFallbackDashboard() {
    console.log('🛟 Showing fallback dashboard due to error');
    
    const marketSection = document.getElementById('marketSection');
    if (marketSection) {
        marketSection.innerHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3 class="error-title">Serviço Temporariamente Indisponível</h3>
                <p class="error-message">
                    Os dados do mercado estão temporariamente indisponíveis. 
                    Você ainda pode navegar pelo site e refazer a análise de perfil.
                </p>
                <button class="error-retry" onclick="window.MarketDashboard?.backToProfile()">
                    🔄 Voltar ao Teste de Perfil
                </button>
            </div>
        `;
        marketSection.style.display = 'block';
    }
}

/**
 * Add accessibility enhancements
 */
function enhanceAccessibility() {
    // Add keyboard navigation support
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Allow ESC key to close dashboard if visible
            if (window.MarketDashboard && window.MarketDashboard.isVisible()) {
                window.MarketDashboard.backToProfile();
            }
        }
    });
    
    // Add focus management
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.id === 'dashboard' && target.style.display === 'block') {
                    // Focus first interactive element when dashboard shows
                    const firstButton = target.querySelector('button:not([disabled])');
                    if (firstButton) {
                        setTimeout(() => firstButton.focus(), 100);
                    }
                }
            }
        });
    });
    
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        observer.observe(dashboardSection, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
}

/**
 * Performance monitoring
 */
function setupPerformanceMonitoring() {
    if ('performance' in window && 'PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name.includes('market') || entry.name.includes('dashboard')) {
                        console.log(`⚡ Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
                    }
                });
            });
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        } catch (error) {
            console.warn('⚠️ Performance monitoring not available:', error);
        }
    }
}

/**
 * Initialize integration
 */
function initializeIntegration() {
    console.log('🚀 Initializing market dashboard integration...');
    
    // Add CSS for smooth transitions
    addTransitionStyles();
    
    // Setup error handling
    setupErrorHandling();
    
    // Enhance accessibility
    enhanceAccessibility();
    
    // Setup performance monitoring
    setupPerformanceMonitoring();
    
    // Hook into existing flow
    hookIntoExistingFlow();
    
    console.log('✅ Market dashboard integration initialized');
}

/**
 * Public API for integration status and control
 */
window.MarketIntegration = {
    // Status
    isHooked: () => integrationState.isHooked,
    isProfileCompleted: () => integrationState.profileCompleted,
    
    // Control
    rehook: hookIntoExistingFlow,
    showFallback: showFallbackDashboard,
    
    // State
    getState: () => ({ ...integrationState })
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all other scripts are loaded
    setTimeout(initializeIntegration, 100);
});

console.log('🔗 Market Dashboard Integration module loaded');