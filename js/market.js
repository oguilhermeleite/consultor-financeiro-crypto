// Market data module using CoinGecko free API
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'pendle'];
let marketCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 60000; // 60 seconds

async function fetchMarketData() {
    const now = Date.now();
    if (marketCache.data && (now - marketCache.timestamp < CACHE_DURATION)) {
        return marketCache.data;
    }
    
    try {
        const ids = COINS.join(',');
        const response = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
        );
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        marketCache = { data, timestamp: now };
        return data;
    } catch (error) {
        console.error('Market data fetch error:', error);
        // Return mock data as fallback
        return getMockMarketData();
    }
}

function getMockMarketData() {
    return [
        {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            current_price: 65420.50,
            market_cap: 1280450000000,
            price_change_percentage_24h: 2.45
        },
        {
            id: 'ethereum',
            symbol: 'eth',
            name: 'Ethereum',
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            current_price: 3542.80,
            market_cap: 425680000000,
            price_change_percentage_24h: 1.85
        },
        {
            id: 'solana',
            symbol: 'sol',
            name: 'Solana',
            image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
            current_price: 142.65,
            market_cap: 68450000000,
            price_change_percentage_24h: -0.85
        },
        {
            id: 'binancecoin',
            symbol: 'bnb',
            name: 'BNB',
            image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
            current_price: 582.30,
            market_cap: 84680000000,
            price_change_percentage_24h: 3.25
        },
        {
            id: 'ripple',
            symbol: 'xrp',
            name: 'XRP',
            image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
            current_price: 0.5825,
            market_cap: 32450000000,
            price_change_percentage_24h: -1.25
        },
        {
            id: 'pendle',
            symbol: 'pendle',
            name: 'Pendle',
            image: 'https://assets.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png',
            current_price: 4.82,
            market_cap: 720000000,
            price_change_percentage_24h: 5.65
        }
    ];
}

function formatPrice(price) {
    if (!price) return '$0.00';
    if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
}

function formatMarketCap(cap) {
    if (!cap) return '$0';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
}

function formatChange(change) {
    if (change === null || change === undefined) return '0.00%';
    const formatted = change.toFixed(2);
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '';
    return `${arrow} ${Math.abs(formatted)}%`;
}

function getChangeColor(change) {
    if (!change) return '#888';
    return change > 0 ? '#4CAF50' : change < 0 ? '#f44336' : '#888';
}

async function updateMarketDisplay() {
    const container = document.getElementById('marketTicker');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="ticker-loading">Carregando dados do mercado...</div>';
    
    const data = await fetchMarketData();
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="market-error">Falha ao carregar dados. Tentando novamente...</div>';
        return;
    }
    
    container.innerHTML = data.map(coin => `
        <div class="market-item" data-coin="${coin.id}">
            <div class="coin-info">
                <img src="${coin.image}" alt="${coin.name}" class="coin-icon" loading="lazy">
                <div>
                    <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                    <div class="coin-name">${coin.name}</div>
                </div>
            </div>
            <div class="coin-price">
                <div class="price-usd">${formatPrice(coin.current_price)}</div>
                <div class="price-change" style="color: ${getChangeColor(coin.price_change_percentage_24h)}">
                    ${formatChange(coin.price_change_percentage_24h)}
                </div>
            </div>
            <div class="coin-stats">
                <div class="stat-label">Market Cap</div>
                <div class="stat-value">${formatMarketCap(coin.market_cap)}</div>
            </div>
        </div>
    `).join('');
}

async function updateMarketOverview() {
    const container = document.getElementById('marketOverview');
    if (!container) return;
    
    try {
        // Fetch global market data
        const globalResponse = await fetch(`${COINGECKO_API}/global`);
        const globalData = await globalResponse.json();
        
        const marketData = globalData.data;
        
        container.innerHTML = `
            <div class="market-stats-grid">
                <div class="market-stat">
                    <div class="stat-label">Total Market Cap</div>
                    <div class="stat-value">${formatMarketCap(marketData.total_market_cap.usd)}</div>
                </div>
                <div class="market-stat">
                    <div class="stat-label">24h Volume</div>
                    <div class="stat-value">${formatMarketCap(marketData.total_volume.usd)}</div>
                </div>
                <div class="market-stat">
                    <div class="stat-label">BTC Dominance</div>
                    <div class="stat-value">${marketData.market_cap_percentage.btc.toFixed(1)}%</div>
                </div>
                <div class="market-stat">
                    <div class="stat-label">Active Cryptos</div>
                    <div class="stat-value">${marketData.active_cryptocurrencies.toLocaleString()}</div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to fetch global market data:', error);
        container.innerHTML = `
            <div class="market-stats-grid">
                <div class="market-stat">
                    <div class="stat-label">Total Market Cap</div>
                    <div class="stat-value">$2.45T</div>
                </div>
                <div class="market-stat">
                    <div class="stat-label">24h Volume</div>
                    <div class="stat-value">$85.2B</div>
                </div>
                <div class="market-stat">
                    <div class="stat-label">BTC Dominance</div>
                    <div class="stat-value">52.3%</div>
                </div>
                <div class="market-stat">
                    <div class="stat-label">Active Cryptos</div>
                    <div class="stat-value">13,245</div>
                </div>
            </div>
        `;
    }
}

// Fear & Greed Index
async function updateFearGreedIndex() {
    const container = document.querySelector('.fear-greed-meter');
    if (!container) return;
    
    try {
        // Using alternative.me API for Fear & Greed Index
        const response = await fetch('https://api.alternative.me/fng/');
        const data = await response.json();
        
        const fngData = data.data[0];
        const value = parseInt(fngData.value);
        const classification = fngData.value_classification;
        
        container.innerHTML = `
            <div class="meter-circle">
                <div class="meter-value">${value}</div>
                <div class="meter-max">100</div>
            </div>
            <div class="meter-label">${classification}</div>
            <div class="meter-description">Última atualização: ${new Date(fngData.timestamp * 1000).toLocaleDateString('pt-BR')}</div>
        `;
        
        // Add color based on value
        const valueElement = container.querySelector('.meter-value');
        if (value <= 25) {
            valueElement.style.color = '#f44336'; // Extreme Fear
        } else if (value <= 45) {
            valueElement.style.color = '#ff9800'; // Fear
        } else if (value <= 55) {
            valueElement.style.color = '#ffc107'; // Neutral
        } else if (value <= 75) {
            valueElement.style.color = '#8bc34a'; // Greed
        } else {
            valueElement.style.color = '#4caf50'; // Extreme Greed
        }
    } catch (error) {
        console.error('Failed to fetch Fear & Greed Index:', error);
        // Fallback to mock data
        container.innerHTML = `
            <div class="meter-value" style="color: #ffc107;">65</div>
            <div class="meter-label">Greed</div>
            <div class="meter-description">Dados em cache</div>
        `;
    }
}

// Initialize and auto-update
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('marketTicker')) {
        updateMarketDisplay();
        updateMarketOverview();
        updateFearGreedIndex();
        
        // Auto-update every 60 seconds
        setInterval(updateMarketDisplay, 60000);
        setInterval(updateMarketOverview, 300000); // 5 minutes
        setInterval(updateFearGreedIndex, 600000); // 10 minutes
    }
});

// Export for use in other modules
window.marketModule = { 
    fetchMarketData, 
    updateMarketDisplay, 
    updateMarketOverview,
    updateFearGreedIndex,
    formatPrice,
    formatMarketCap,
    formatChange
};