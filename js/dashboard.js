// Dashboard controller after profile discovery
let userProfile = null;
let isGuestMode = false;

function initDashboard() {
    userProfile = JSON.parse(localStorage.getItem('userProfile')) || { type: 'moderate', date: new Date() };
    isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    showDashboard();
    loadPersonalizedContent();
    
    // Initialize market data
    if (window.marketModule) {
        window.marketModule.updateMarketDisplay();
        window.marketModule.updateMarketOverview();
        window.marketModule.updateFearGreedIndex();
    }
    
    // Load news
    if (window.newsModule) {
        window.newsModule.loadCryptoNews(getNewsFilters());
    }
    
    console.log('Dashboard initialized for profile:', userProfile.type);
}

function showDashboard() {
    // Hide questionnaire sections
    const questionnaireSections = [
        'questionnaire-section',
        'review-section', 
        'results'
    ];
    
    questionnaireSections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show dashboard
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Display user profile
    displayUserProfile();
}

function displayUserProfile() {
    const profileDisplay = document.getElementById('userProfileCard');
    if (!profileDisplay) return;
    
    const profileData = getProfileDetails(userProfile.type);
    const userName = userProfile.name || 'Investidor';
    const profileDate = new Date(userProfile.date).toLocaleDateString('pt-BR');
    
    profileDisplay.innerHTML = `
        <div class="profile-header">
            <h3>👤 Seu Perfil de Investidor</h3>
            ${isGuestMode ? '<span class="guest-badge">Modo Visitante</span>' : ''}
        </div>
        
        <div class="profile-type-container">
            <div class="profile-type-badge ${userProfile.type}">
                ${profileData.icon} ${profileData.name}
            </div>
            <div class="profile-description">${profileData.description}</div>
        </div>
        
        <div class="profile-allocation">
            <h4>📊 Alocação Recomendada</h4>
            ${profileData.allocation.map(item => 
                `<div class="allocation-item">
                    <div class="allocation-asset">
                        <span class="asset-icon">${item.icon}</span>
                        <span class="asset-name">${item.asset}</span>
                    </div>
                    <div class="allocation-percent">${item.percent}%</div>
                    <div class="allocation-bar">
                        <div class="allocation-fill" style="width: ${item.percent}%"></div>
                    </div>
                </div>`
            ).join('')}
        </div>
        
        <div class="profile-tips">
            <h4>💡 Dicas para seu Perfil</h4>
            <ul>
                ${profileData.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        </div>
        
        <div class="profile-actions">
            <button class="btn-secondary" onclick="retakeQuiz()">🔄 Refazer Análise</button>
            <button class="btn-primary" onclick="shareProfile()">📤 Compartilhar</button>
        </div>
        
        <div class="profile-meta">
            <small>Análise realizada em ${profileDate}</small>
        </div>
    `;
}

function getProfileDetails(type) {
    const profiles = {
        conservative: {
            name: 'Conservador',
            icon: '🛡️',
            description: 'Você prioriza a segurança e estabilidade dos investimentos, focando em ativos consolidados.',
            allocation: [
                { asset: 'Bitcoin (BTC)', percent: 40, icon: '₿' },
                { asset: 'Ethereum (ETH)', percent: 30, icon: 'Ξ' },
                { asset: 'Stablecoins (USDT/USDC)', percent: 20, icon: '💰' },
                { asset: 'Índices Cripto', percent: 10, icon: '📈' }
            ],
            tips: [
                'Mantenha a estratégia de buy and hold',
                'Foque em projetos com histórico comprovado',
                'Considere DCA (Dollar Cost Averaging)',
                'Evite trading de curto prazo'
            ]
        },
        moderate: {
            name: 'Moderado',
            icon: '⚖️',
            description: 'Você busca um equilíbrio entre segurança e oportunidades de crescimento.',
            allocation: [
                { asset: 'Bitcoin & Ethereum', percent: 50, icon: '🔵' },
                { asset: 'Top 20 Altcoins', percent: 30, icon: '🟡' },
                { asset: 'Projetos Emergentes', percent: 15, icon: '🟢' },
                { asset: 'DeFi Protocols', percent: 5, icon: '🔄' }
            ],
            tips: [
                'Diversifique entre diferentes categorias',
                'Acompanhe trends do mercado',
                'Reserve parte para oportunidades',
                'Rebalanceie mensalmente'
            ]
        },
        aggressive: {
            name: 'Arrojado',
            icon: '🚀',
            description: 'Você aceita alto risco em busca de retornos significativos e está sempre em busca de novidades.',
            allocation: [
                { asset: 'Bitcoin & Ethereum', percent: 30, icon: '🔵' },
                { asset: 'Altcoins Promissoras', percent: 40, icon: '🟡' },
                { asset: 'DeFi & NFTs', percent: 20, icon: '🎨' },
                { asset: 'Meme Coins & Novidades', percent: 10, icon: '🎲' }
            ],
            tips: [
                'Explore novos protocolos DeFi',
                'Participe de IDOs e airdrops',
                'Mantenha-se atualizado com trends',
                'Use stop-loss para proteção'
            ]
        }
    };
    return profiles[type] || profiles.moderate;
}

function getNewsFilters() {
    const filters = {
        conservative: ['bitcoin', 'ethereum', 'regulation', 'adoption'],
        moderate: ['altcoins', 'defi', 'market-analysis', 'institutional'],
        aggressive: ['defi', 'nfts', 'new-projects', 'trading', 'memecoins']
    };
    return filters[userProfile.type] || filters.moderate;
}

function loadPersonalizedContent() {
    // Load market data relevant to user profile
    updateProfileRelevantData();
    
    // Show personalized recommendations
    showPersonalizedRecommendations();
}

function updateProfileRelevantData() {
    // This function can be expanded to show data most relevant to user's profile
    const profileType = userProfile.type;
    
    // For now, we'll use the general market update
    if (window.marketModule) {
        window.marketModule.updateMarketDisplay();
    }
}

function showPersonalizedRecommendations() {
    const container = document.getElementById('personalizedRecommendations');
    if (!container) return;
    
    const profileType = userProfile.type;
    const recommendations = getRecommendations(profileType);
    
    container.innerHTML = `
        <h3>🎯 Recomendações Personalizadas</h3>
        <div class="recommendations-grid">
            ${recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="rec-icon">${rec.icon}</div>
                    <div class="rec-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getRecommendations(profileType) {
    const recommendations = {
        conservative: [
            {
                icon: '📚',
                title: 'Estude Dollar Cost Averaging',
                description: 'Aprenda sobre compras regulares para reduzir volatilidade'
            },
            {
                icon: '🏦',
                title: 'Considere ETFs de Bitcoin',
                description: 'Explore opções mais tradicionais de exposição ao Bitcoin'
            },
            {
                icon: '🔒',
                title: 'Foque em Cold Storage',
                description: 'Mantenha seus ativos em carteiras físicas para máxima segurança'
            }
        ],
        moderate: [
            {
                icon: '📊',
                title: 'Análise Técnica Básica',
                description: 'Aprenda conceitos básicos para melhor timing de entrada'
            },
            {
                icon: '🔄',
                title: 'Explore Staking',
                description: 'Gere renda passiva com seus ativos em proof-of-stake'
            },
            {
                icon: '🎯',
                title: 'Defina Metas Claras',
                description: 'Estabeleça objetivos de curto e médio prazo'
            }
        ],
        aggressive: [
            {
                icon: '🚀',
                title: 'Monitore Lançamentos',
                description: 'Acompanhe IDOs e novos projetos promissores'
            },
            {
                icon: '📱',
                title: 'Use Ferramentas Avançadas',
                description: 'Aproveite bots de trading e ferramentas DeFi'
            },
            {
                icon: '⚡',
                title: 'Trading Ativo',
                description: 'Considere estratégias de trading de curto prazo'
            }
        ]
    };
    return recommendations[profileType] || recommendations.moderate;
}

function continueAsGuest() {
    localStorage.setItem('guestMode', 'true');
    hideLoginOptions();
    initDashboard();
}

function hideLoginOptions() {
    const loginModal = document.getElementById('loginOptions');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

function showLoginOptions() {
    const loginModal = document.getElementById('loginOptions');
    if (loginModal) {
        loginModal.style.display = 'block';
    }
}

function retakeQuiz() {
    // Clear stored data
    localStorage.removeItem('userProfile');
    localStorage.removeItem('guestMode');
    
    // Hide dashboard
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
    }
    
    // Show questionnaire
    const questionnaireSection = document.getElementById('questionnaire-section');
    if (questionnaireSection) {
        questionnaireSection.style.display = 'block';
        questionnaireSection.classList.remove('hidden');
    }
    
    // Reset any form states
    if (window.cryptoAdvisor && window.cryptoAdvisor.restartAnalysis) {
        window.cryptoAdvisor.restartAnalysis();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shareProfile() {
    const profileData = getProfileDetails(userProfile.type);
    const shareText = `🎯 Descobri meu perfil de investidor em cripto: ${profileData.name} ${profileData.icon}\n\nFaça você também sua análise gratuita!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Meu Perfil de Investidor Crypto',
            text: shareText,
            url: shareUrl
        }).catch(console.error);
    } else {
        // Fallback to copy to clipboard
        const fullShareText = `${shareText}\n\n${shareUrl}`;
        navigator.clipboard.writeText(fullShareText).then(() => {
            showNotification('✅ Link copiado para a área de transferência!');
        }).catch(() => {
            // Final fallback - show modal with text to copy
            showShareModal(fullShareText);
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showShareModal(text) {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <h3>📤 Compartilhar Perfil</h3>
            <textarea readonly>${text}</textarea>
            <div class="share-actions">
                <button onclick="this.previousElementSibling.previousElementSibling.select(); document.execCommand('copy'); this.textContent='✅ Copiado!'">📋 Copiar</button>
                <button onclick="this.closest('.share-modal').remove()">❌ Fechar</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
}

// Export functions for global access
window.dashboardModule = {
    initDashboard,
    showDashboard,
    continueAsGuest,
    retakeQuiz,
    shareProfile,
    showLoginOptions,
    hideLoginOptions
};