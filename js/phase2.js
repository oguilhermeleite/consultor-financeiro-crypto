/**
 * Phase 2 JavaScript - Real-Time Crypto Prices + WhatsApp Integration
 * CRITICAL: This file only ADDS new functionality without modifying existing code
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Phase 2 JavaScript initialized - Crypto Prices + WhatsApp');
    
    // Initialize all Phase 2 features
    initializeCryptoTicker();
    initializeWhatsAppButton();
});

// ==========================================
// CRYPTO PRICE TICKER FUNCTIONALITY
// ==========================================

const CRYPTO_CONFIG = {
    ids: ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano'],
    symbols: {
        'bitcoin': 'BTC',
        'ethereum': 'ETH', 
        'solana': 'SOL',
        'binancecoin': 'BNB',
        'ripple': 'XRP',
        'cardano': 'ADA'
    },
    api: {
        baseUrl: 'https://api.coingecko.com/api/v3',
        cacheDuration: 60000, // 60 seconds
        retryDelay: 5000, // 5 seconds
        maxRetries: 3
    }
};

let cryptoPriceData = {
    data: {},
    lastUpdate: 0,
    retryCount: 0
};

/**
 * Fetch crypto prices from CoinGecko API
 */
async function fetchCryptoPrices() {
    try {
        const now = Date.now();
        
        // Check if we have recent cached data
        if (now - cryptoPriceData.lastUpdate < CRYPTO_CONFIG.api.cacheDuration && 
            Object.keys(cryptoPriceData.data).length > 0) {
            console.log('📊 Using cached crypto prices');
            return cryptoPriceData.data;
        }
        
        console.log('📡 Fetching fresh crypto prices...');
        
        const url = `${CRYPTO_CONFIG.api.baseUrl}/simple/price?ids=${CRYPTO_CONFIG.ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_last_updated_at=true`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000) // 10 seconds
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate response data
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format');
        }
        
        // Update cache
        cryptoPriceData.data = data;
        cryptoPriceData.lastUpdate = now;
        cryptoPriceData.retryCount = 0; // Reset retry count on success
        
        console.log('✅ Crypto prices fetched successfully', Object.keys(data).length, 'currencies');
        return data;
        
    } catch (error) {
        console.error('❌ Error fetching crypto prices:', error.message);
        cryptoPriceData.retryCount++;
        
        // Return cached data if available, otherwise return empty object
        if (Object.keys(cryptoPriceData.data).length > 0) {
            console.log('📊 Fallback to cached crypto prices');
            return cryptoPriceData.data;
        }
        
        // If no cached data and we haven't exceeded retry limit, try again
        if (cryptoPriceData.retryCount <= CRYPTO_CONFIG.api.maxRetries) {
            console.log(`🔄 Retrying in ${CRYPTO_CONFIG.api.retryDelay/1000} seconds...`);
            setTimeout(() => {
                fetchCryptoPrices().then(data => updateCryptoTicker(data));
            }, CRYPTO_CONFIG.api.retryDelay);
        }
        
        return {};
    }
}

/**
 * Format price with appropriate currency symbol and decimals
 */
function formatPrice(price) {
    if (!price || isNaN(price)) return 'N/A';
    
    if (price >= 1) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 4,
            maximumFractionDigits: 6
        }).format(price);
    }
}

/**
 * Format percentage change with sign and color class
 */
function formatPercentChange(change) {
    if (change === null || change === undefined || isNaN(change)) {
        return { text: 'N/A', class: 'neutral' };
    }
    
    const formatted = Math.abs(change).toFixed(2);
    const sign = change >= 0 ? '+' : '-';
    const className = change >= 0 ? 'positive' : 'negative';
    
    return {
        text: `${sign}${formatted}%`,
        class: className
    };
}

/**
 * Update the crypto ticker display with new data
 */
function updateCryptoTicker(data) {
    const tickerContent = document.getElementById('cryptoTicker');
    
    if (!tickerContent) {
        console.warn('⚠️ Crypto ticker element not found');
        return;
    }
    
    if (!data || Object.keys(data).length === 0) {
        tickerContent.innerHTML = '<div class="ticker-error">Erro ao carregar preços. <button class="ticker-retry" onclick="refreshCryptoPrices()">Tentar novamente</button></div>';
        return;
    }
    
    let tickerHTML = '';
    let validItems = 0;
    
    CRYPTO_CONFIG.ids.forEach(id => {
        if (data[id] && data[id].usd) {
            const crypto = data[id];
            const symbol = CRYPTO_CONFIG.symbols[id];
            const price = formatPrice(crypto.usd);
            const changeData = formatPercentChange(crypto.usd_24h_change);
            
            tickerHTML += `
                <div class="crypto-item" data-crypto="${id}">
                    <span class="crypto-symbol">${symbol}</span>
                    <span class="crypto-price">${price}</span>
                    <span class="crypto-change ${changeData.class}">${changeData.text}</span>
                </div>
            `;
            validItems++;
        }
    });
    
    if (validItems === 0) {
        tickerContent.innerHTML = '<div class="ticker-error">Nenhum preço disponível no momento</div>';
        return;
    }
    
    // Duplicate content for seamless scrolling effect
    tickerContent.innerHTML = tickerHTML + tickerHTML;
    
    console.log(`📊 Crypto ticker updated with ${validItems} currencies`);
}

/**
 * Refresh crypto prices manually
 */
async function refreshCryptoPrices() {
    const refreshBtn = document.getElementById('refreshPrices');
    const tickerContent = document.getElementById('cryptoTicker');
    
    if (refreshBtn) {
        refreshBtn.style.transform = 'rotate(360deg)';
        refreshBtn.disabled = true;
    }
    
    if (tickerContent) {
        tickerContent.innerHTML = '<div class="loading-ticker">Atualizando preços...</div>';
    }
    
    try {
        // Force fresh fetch by clearing cache
        cryptoPriceData.lastUpdate = 0;
        const data = await fetchCryptoPrices();
        updateCryptoTicker(data);
        
        console.log('🔄 Crypto prices refreshed successfully');
    } catch (error) {
        console.error('❌ Error refreshing crypto prices:', error);
        if (tickerContent) {
            tickerContent.innerHTML = '<div class="ticker-error">Erro ao atualizar. <button class="ticker-retry" onclick="refreshCryptoPrices()">Tentar novamente</button></div>';
        }
    } finally {
        // Reset refresh button after delay
        setTimeout(() => {
            if (refreshBtn) {
                refreshBtn.style.transform = 'rotate(0deg)';
                refreshBtn.disabled = false;
            }
        }, 500);
    }
}

/**
 * Initialize crypto ticker functionality
 */
async function initializeCryptoTicker() {
    console.log('📊 Initializing crypto price ticker...');
    
    // Initial price fetch
    const data = await fetchCryptoPrices();
    updateCryptoTicker(data);
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refreshPrices');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshCryptoPrices);
        console.log('🔄 Refresh button connected');
    }
    
    // Auto-refresh prices every 2 minutes
    const autoRefreshInterval = setInterval(async () => {
        try {
            const data = await fetchCryptoPrices();
            updateCryptoTicker(data);
            console.log('🔄 Auto-refresh completed');
        } catch (error) {
            console.error('❌ Auto-refresh failed:', error);
        }
    }, 120000); // 2 minutes
    
    // Store interval ID for cleanup if needed
    window.cryptoTickerInterval = autoRefreshInterval;
    
    // Handle window resize to reset animation
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const tickerContent = document.getElementById('cryptoTicker');
            if (tickerContent) {
                // Reset scrolling animation
                tickerContent.style.animation = 'none';
                setTimeout(() => {
                    tickerContent.style.animation = 'scroll-ticker 60s linear infinite';
                }, 100);
            }
        }, 250);
    });
    
    console.log('✅ Crypto ticker initialized successfully');
}

// ==========================================
// WHATSAPP INTEGRATION FUNCTIONALITY
// ==========================================

const WHATSAPP_CONFIG = {
    // Default number - MUST be updated with real WhatsApp number
    number: '5511999999999',
    defaultMessage: 'Oi! Vim pelo site Consultor Financeiro Crypto e quero descobrir meu perfil de investidor. Podem me ajudar? 🚀',
    tooltipDelay: 5000,
    tooltipDuration: 3000
};

/**
 * Initialize WhatsApp floating button
 */
function initializeWhatsAppButton() {
    console.log('💬 Initializing WhatsApp integration...');
    
    const whatsappBtn = document.getElementById('whatsappBtn');
    const tooltip = document.getElementById('whatsappTooltip');
    
    if (!whatsappBtn) {
        console.warn('⚠️ WhatsApp button element not found');
        return;
    }
    
    // Update WhatsApp URL with encoded message
    const encodedMessage = encodeURIComponent(WHATSAPP_CONFIG.defaultMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.number}?text=${encodedMessage}`;
    whatsappBtn.href = whatsappUrl;
    
    // Add click tracking
    whatsappBtn.addEventListener('click', function(e) {
        console.log('💬 WhatsApp button clicked');
        
        // Track analytics if available
        try {
            if (window.cryptoFeatures && window.cryptoFeatures.analytics) {
                window.cryptoFeatures.analytics.trackEvent('whatsapp_click', {
                    source: 'floating_button',
                    timestamp: Date.now()
                });
            } else if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    event_category: 'WhatsApp',
                    event_label: 'floating_button',
                    value: 1
                });
            }
        } catch (error) {
            console.warn('⚠️ Analytics tracking failed:', error);
        }
        
        // Optional: Show confirmation or feedback
        showWhatsAppFeedback();
    });
    
    // Show tooltip after delay
    if (tooltip) {
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
            tooltip.style.transform = 'translateY(-5px)';
            
            console.log('💡 WhatsApp tooltip shown');
            
            // Hide tooltip after duration
            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
                tooltip.style.transform = 'translateY(0)';
            }, WHATSAPP_CONFIG.tooltipDuration);
            
        }, WHATSAPP_CONFIG.tooltipDelay);
    }
    
    // Add hover effects
    whatsappBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    whatsappBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    // Add keyboard support
    whatsappBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
    
    console.log('✅ WhatsApp button initialized successfully');
}

/**
 * Show WhatsApp click feedback
 */
function showWhatsAppFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 25px;
        background: #25D366;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1001;
        animation: slideInUp 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
    `;
    feedback.textContent = '📱 Abrindo WhatsApp...';
    
    document.body.appendChild(feedback);
    
    // Remove feedback after 2 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(20px)';
            setTimeout(() => {
                feedback.remove();
            }, 300);
        }
    }, 2000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Handle visibility change to pause/resume animations
 */
document.addEventListener('visibilitychange', function() {
    const tickerContent = document.getElementById('cryptoTicker');
    
    if (document.hidden) {
        // Page is hidden, pause animations
        if (tickerContent) {
            tickerContent.style.animationPlayState = 'paused';
        }
        console.log('⏸️ Paused ticker animations (page hidden)');
    } else {
        // Page is visible, resume animations
        if (tickerContent) {
            tickerContent.style.animationPlayState = 'running';
        }
        console.log('▶️ Resumed ticker animations (page visible)');
    }
});

/**
 * Error boundary for Phase 2 functionality
 */
window.addEventListener('error', function(e) {
    if (e.message.includes('phase2') || e.filename.includes('phase2')) {
        console.error('❌ Phase 2 error:', e.message);
        
        // Try to maintain basic functionality
        const tickerContent = document.getElementById('cryptoTicker');
        if (tickerContent && tickerContent.innerHTML.includes('loading')) {
            tickerContent.innerHTML = '<div class="ticker-error">Serviço temporariamente indisponível</div>';
        }
    }
});

// ==========================================
// EXPORT FOR GLOBAL ACCESS
// ==========================================

// Make refresh function globally available
window.refreshCryptoPrices = refreshCryptoPrices;

// Export Phase 2 functionality
window.Phase2 = {
    refreshPrices: refreshCryptoPrices,
    updateTicker: updateCryptoTicker,
    initTicker: initializeCryptoTicker,
    initWhatsApp: initializeWhatsAppButton,
    config: {
        crypto: CRYPTO_CONFIG,
        whatsapp: WHATSAPP_CONFIG
    }
};

console.log('✅ Phase 2 JavaScript fully loaded and ready');

// ==========================================
// DEVELOPMENT HELPER FUNCTIONS
// ==========================================

// Console helper for testing (only in development)
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode - Helper functions available');
    console.log('💡 Use Phase2.refreshPrices() to test price refresh');
    console.log('💡 Use Phase2.config to view current configuration');
    
    window.testCryptoPrices = async function() {
        console.log('🧪 Testing crypto price fetch...');
        const data = await fetchCryptoPrices();
        console.log('📊 Fetched data:', data);
        return data;
    };
}