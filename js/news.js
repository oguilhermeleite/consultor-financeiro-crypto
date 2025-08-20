// Crypto news integration
const NEWS_CACHE_DURATION = 300000; // 5 minutes
let newsCache = { data: null, timestamp: 0 };

async function loadCryptoNews(filters = []) {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    // Show loading state
    newsContainer.innerHTML = `
        <h3>📰 Últimas Notícias</h3>
        <div class="news-loading">Carregando notícias...</div>
    `;
    
    try {
        const news = await fetchCryptoNews(filters);
        displayNews(news);
    } catch (error) {
        console.error('Error loading news:', error);
        newsContainer.innerHTML = `
            <h3>📰 Últimas Notícias</h3>
            <div class="news-error">Erro ao carregar notícias. Tente novamente mais tarde.</div>
        `;
    }
}

async function fetchCryptoNews(filters = []) {
    const now = Date.now();
    
    // Check cache first
    if (newsCache.data && (now - newsCache.timestamp < NEWS_CACHE_DURATION)) {
        return filterNewsByProfile(newsCache.data, filters);
    }
    
    try {
        // For production, you would use a real news API like:
        // - CryptoPanic API (free tier available)
        // - NewsAPI with crypto keywords
        // - CoinGecko news endpoints
        
        // Using mock data for demo - replace with actual API call
        const news = getMockNews();
        newsCache = { data: news, timestamp: now };
        
        return filterNewsByProfile(news, filters);
    } catch (error) {
        console.error('Failed to fetch crypto news:', error);
        return getMockNews();
    }
}

function filterNewsByProfile(news, filters) {
    if (!filters || filters.length === 0) return news;
    
    return news.filter(item => 
        filters.some(filter => 
            item.category.toLowerCase().includes(filter.toLowerCase()) ||
            item.title.toLowerCase().includes(filter.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        )
    );
}

function displayNews(news) {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    newsContainer.innerHTML = `
        <div class="news-header">
            <h3>📰 Últimas Notícias</h3>
            <div class="news-refresh">
                <button onclick="refreshNews()" class="refresh-btn">🔄 Atualizar</button>
            </div>
        </div>
        <div class="news-grid">
            ${news.map(item => `
                <article class="news-item" data-sentiment="${item.sentiment}">
                    <div class="news-header-item">
                        <div class="news-source">
                            <img src="${item.sourceIcon}" alt="${item.source}" class="source-icon">
                            <span>${item.source}</span>
                        </div>
                        <span class="news-time">${item.time}</span>
                    </div>
                    <h4 class="news-title">${item.title}</h4>
                    <p class="news-summary">${item.summary}</p>
                    <div class="news-tags">
                        ${item.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="news-meta">
                        <span class="news-category">${item.category}</span>
                        <div class="news-sentiment-container">
                            <span class="news-sentiment ${item.sentiment}">${getSentimentEmoji(item.sentiment)}</span>
                            <span class="sentiment-label">${getSentimentLabel(item.sentiment)}</span>
                        </div>
                    </div>
                    <div class="news-actions">
                        <button onclick="readMore('${item.id}')" class="read-more-btn">📖 Ler Mais</button>
                        <button onclick="shareNews('${item.id}')" class="share-news-btn">📤 Compartilhar</button>
                    </div>
                </article>
            `).join('')}
        </div>
        <div class="news-footer">
            <p>Última atualização: ${new Date().toLocaleTimeString('pt-BR')}</p>
            <small>As notícias são coletadas de fontes públicas e não constituem recomendação de investimento.</small>
        </div>
    `;
}

function getMockNews() {
    return [
        {
            id: 'news1',
            source: 'CoinDesk',
            sourceIcon: 'https://www.coindesk.com/favicon.ico',
            time: '2 horas atrás',
            title: 'Bitcoin atinge nova máxima mensal com entrada de fundos institucionais',
            summary: 'BTC ultrapassa resistência importante de $65.000 com volume significativo. Analistas preveem continuação do rally com base em indicadores técnicos positivos.',
            category: 'Bitcoin',
            sentiment: 'bullish',
            tags: ['Bitcoin', 'Institucionais', 'Rally'],
            url: 'https://example.com/news1'
        },
        {
            id: 'news2',
            source: 'Decrypt',
            sourceIcon: 'https://decrypt.co/favicon.ico',
            time: '4 horas atrás',
            title: 'Ethereum se prepara para próxima atualização Dencun em março',
            summary: 'Desenvolvedores confirmam data para implementação do EIP-4844, que promete reduzir significativamente as taxas de transação na rede.',
            category: 'Ethereum',
            sentiment: 'bullish',
            tags: ['Ethereum', 'Atualização', 'EIP-4844'],
            url: 'https://example.com/news2'
        },
        {
            id: 'news3',
            source: 'The Block',
            sourceIcon: 'https://www.theblock.co/favicon.ico',
            time: '6 horas atrás',
            title: 'Total Value Locked em DeFi cresce 15% na última semana',
            summary: 'Protocolos DeFi registram entrada significativa de capital, com destaque para Uniswap V4 e novos protocolos de lending.',
            category: 'DeFi',
            sentiment: 'bullish',
            tags: ['DeFi', 'TVL', 'Uniswap'],
            url: 'https://example.com/news3'
        },
        {
            id: 'news4',
            source: 'CoinTelegraph',
            sourceIcon: 'https://cointelegraph.com/favicon.ico',
            time: '8 horas atrás',
            title: 'Reguladores europeus discutem framework para stablecoins',
            summary: 'União Europeia avança nas discussões sobre regulamentação de moedas digitais estáveis, buscando equilibrio entre inovação e proteção.',
            category: 'Regulação',
            sentiment: 'neutral',
            tags: ['Regulação', 'Europa', 'Stablecoins'],
            url: 'https://example.com/news4'
        },
        {
            id: 'news5',
            source: 'Binance Blog',
            sourceIcon: 'https://www.binance.com/favicon.ico',
            time: '12 horas atrás',
            title: 'Solana Network registra novo recorde de transações diárias',
            summary: 'Rede Solana processa mais de 50 milhões de transações em 24 horas, superando Ethereum em volume de atividade.',
            category: 'Altcoins',
            sentiment: 'bullish',
            tags: ['Solana', 'Performance', 'Transações'],
            url: 'https://example.com/news5'
        },
        {
            id: 'news6',
            source: 'CryptoSlate',
            sourceIcon: 'https://cryptoslate.com/favicon.ico',
            time: '1 dia atrás',
            title: 'NFT market shows signs of recovery with new marketplace launches',
            summary: 'Mercado de NFTs demonstra sinais de recuperação com lançamento de novos marketplaces focados em utilidade real e gaming.',
            category: 'NFTs',
            sentiment: 'neutral',
            tags: ['NFTs', 'Marketplace', 'Gaming'],
            url: 'https://example.com/news6'
        },
        {
            id: 'news7',
            source: 'Messari',
            sourceIcon: 'https://messari.io/favicon.ico',
            time: '1 dia atrás',
            title: 'Análise: Meme coins mostram padrão de alta correlação com Bitcoin',
            summary: 'Estudo revela que principais meme coins têm seguido movimentos do Bitcoin com correlação de 0.85, indicando maturação do setor.',
            category: 'Análise',
            sentiment: 'neutral',
            tags: ['Meme Coins', 'Correlação', 'Bitcoin'],
            url: 'https://example.com/news7'
        },
        {
            id: 'news8',
            source: 'DeFi Pulse',
            sourceIcon: 'https://defipulse.com/favicon.ico',
            time: '2 dias atrás',
            title: 'Novo protocolo de yield farming oferece 20% APY em stablecoins',
            summary: 'Protocolo auditado por múltiplas empresas de segurança oferece rendimento atrativo para investidores conservadores em DeFi.',
            category: 'DeFi',
            sentiment: 'bullish',
            tags: ['Yield Farming', 'Stablecoins', 'APY'],
            url: 'https://example.com/news8'
        }
    ];
}

function getSentimentEmoji(sentiment) {
    const emojis = { 
        bullish: '🚀', 
        bearish: '🐻', 
        neutral: '➖' 
    };
    return emojis[sentiment] || '➖';
}

function getSentimentLabel(sentiment) {
    const labels = {
        bullish: 'Positivo',
        bearish: 'Negativo',
        neutral: 'Neutro'
    };
    return labels[sentiment] || 'Neutro';
}

function refreshNews() {
    // Clear cache and reload
    newsCache = { data: null, timestamp: 0 };
    
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || { type: 'moderate' };
    const filters = getNewsFiltersForProfile(userProfile.type);
    
    loadCryptoNews(filters);
}

function getNewsFiltersForProfile(profileType) {
    const filters = {
        conservative: ['bitcoin', 'ethereum', 'regulation', 'adoption'],
        moderate: ['altcoins', 'defi', 'análise', 'institucional'],
        aggressive: ['defi', 'nfts', 'meme coins', 'yield farming']
    };
    return filters[profileType] || filters.moderate;
}

function readMore(newsId) {
    const news = getMockNews().find(item => item.id === newsId);
    if (!news) return;
    
    // Create modal for full article
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
        <div class="news-modal-content">
            <div class="news-modal-header">
                <h2>${news.title}</h2>
                <button onclick="this.closest('.news-modal').remove()" class="close-btn">✕</button>
            </div>
            <div class="news-modal-meta">
                <span class="source">${news.source}</span>
                <span class="time">${news.time}</span>
                <span class="sentiment ${news.sentiment}">${getSentimentEmoji(news.sentiment)} ${getSentimentLabel(news.sentiment)}</span>
            </div>
            <div class="news-modal-body">
                <p>${news.summary}</p>
                <br>
                <p><strong>Nota:</strong> Esta é uma versão resumida da notícia. Para o artigo completo, visite o site da fonte.</p>
            </div>
            <div class="news-modal-footer">
                <button onclick="window.open('${news.url}', '_blank')" class="btn-primary">📖 Ver Artigo Completo</button>
                <button onclick="shareNews('${newsId}')" class="btn-secondary">📤 Compartilhar</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    document.body.appendChild(modal);
}

function shareNews(newsId) {
    const news = getMockNews().find(item => item.id === newsId);
    if (!news) return;
    
    const shareText = `📰 ${news.title}\n\n${news.summary}\n\nFonte: ${news.source}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: news.title,
            text: shareText,
            url: shareUrl
        }).catch(console.error);
    } else {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNewsNotification('✅ Notícia copiada para a área de transferência!');
        }).catch(() => {
            console.log('Could not copy to clipboard');
        });
    }
}

function showNewsNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'news-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize news when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // News will be loaded by dashboard.js when profile is determined
});

// Export for use in other modules
window.newsModule = {
    loadCryptoNews,
    refreshNews,
    readMore,
    shareNews
};