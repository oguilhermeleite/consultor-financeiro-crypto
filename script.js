// Intro screen to landing page transition
function goToMainApp() {
    const introScreen = document.getElementById('intro-screen');
    const landingPage = document.getElementById('landing-page');
    
    // Smooth transition
    introScreen.style.transition = 'opacity 0.5s ease';
    introScreen.style.opacity = '0';
    
    setTimeout(() => {
        introScreen.style.display = 'none';
        landingPage.style.display = 'flex';
        landingPage.style.opacity = '0';
        landingPage.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            landingPage.style.opacity = '1';
        }, 50);
    }, 500);
}

// Landing page to questionnaire transition
function startQuestionnaire() {
    const landingPage = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');
    
    // Smooth transition
    landingPage.style.transition = 'opacity 0.5s ease';
    landingPage.style.opacity = '0';
    
    setTimeout(() => {
        landingPage.style.display = 'none';
        mainApp.style.display = 'flex';
        mainApp.style.opacity = '0';
        mainApp.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            mainApp.style.opacity = '1';
        }, 50);
    }, 500);
}

// Back to landing page function
function backToLanding() {
    const landingPage = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');
    
    // Reset form and progress
    const form = document.getElementById('investor-form');
    const resultadoDiv = document.getElementById('resultado');
    
    if (form) {
        form.reset();
        form.style.display = 'block';
    }
    
    if (resultadoDiv) {
        resultadoDiv.classList.add('hidden');
    }
    
    // Reset progress
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0% completo';
    
    // Clear feedback
    document.querySelectorAll('.feedback-text').forEach(el => el.classList.add('hidden'));
    
    // Smooth transition back
    mainApp.style.transition = 'opacity 0.5s ease';
    mainApp.style.opacity = '0';
    
    setTimeout(() => {
        mainApp.style.display = 'none';
        landingPage.style.display = 'flex';
        landingPage.style.opacity = '0';
        landingPage.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            landingPage.style.opacity = '1';
        }, 50);
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('investor-form');
    const resultadoDiv = document.getElementById('resultado');
    
    // Progress tracking
    let progress = 0;
    const totalFields = 4; // objetivo, risco, valor, liquidez
    
    // Initialize progress
    updateProgress();
    
    // Add progress tracking to form fields
    const trackingFields = ['objetivo', 'valor', 'liquidez'];
    trackingFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('change', function() {
                updateProgress();
                showFieldFeedback(fieldName, this.value);
                // Limpar erro de validação quando o usuário corrigir
                limparErroValidacao(fieldName);
            });
        }
    });
    
    // Track radio buttons for risk
    const riskRadios = document.querySelectorAll('input[name="risco"]');
    riskRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateProgress();
            showFieldFeedback('risco', this.value);
            // Limpar erro de validação quando o usuário corrigir
            limparErroValidacao('risco');
        });
    });
    
    function updateProgress() {
        let completed = 0;
        
        // Check objetivo
        if (document.getElementById('objetivo').value) completed++;
        
        // Check risco
        if (document.querySelector('input[name="risco"]:checked')) completed++;
        
        // Check valor
        if (document.getElementById('valor').value) completed++;
        
        // Check liquidez
        if (document.getElementById('liquidez').value) completed++;
        
        const percentage = (completed / totalFields) * 100;
        document.getElementById('progress-fill').style.width = percentage + '%';
        document.getElementById('progress-text').textContent = Math.round(percentage) + '% completo';
    }
    
    function showFieldFeedback(fieldName, value) {
        const feedbackElement = document.getElementById(fieldName + '-feedback');
        
        const feedbacks = {
            objetivo: {
                'longo': '💡 Ótima escolha! Longo prazo oferece melhores oportunidades de crescimento.',
                'moderado': '⚡ Prazo equilibrado, permite estratégias diversificadas.',
                'curtissimo': '🚀 Alto risco! Adequado apenas para traders experientes.'
            },
            risco: {
                'baixo': '🛡️ Perfil conservador, prioriza segurança do capital.',
                'medio': '⚖️ Perfil equilibrado, boa relação risco/retorno.',
                'alto': '🔥 Perfil arrojado, busca máximo potencial de retorno.'
            },
            valor: {
                'baixo': '💸 Valores menores: foque em investimentos sem taxa.',
                'medio': '💰 Valor interessante para diversificar estratégias.',
                'alto': '💎 Valor alto permite acesso a produtos exclusivos.'
            },
            liquidez: {
                'alta': '🏃‍♂️ Prioriza flexibilidade para resgates rápidos.',
                'baixa': '🧘‍♂️ Permite investimentos de longo prazo com melhores retornos.'
            }
        };
        
        if (feedbacks[fieldName] && feedbacks[fieldName][value]) {
            feedbackElement.textContent = feedbacks[fieldName][value];
            feedbackElement.classList.remove('hidden');
        } else {
            feedbackElement.classList.add('hidden');
        }
    }
    
    // Debounce para evitar múltiplos cliques
    let isProcessing = false;
    
    function ensureResultsContainer() {
        let resultado = document.getElementById('resultado');
        
        if (!resultado) {
            // Criar container de resultado
            const mainContainer = document.querySelector('.container, main, body');
            resultado = document.createElement('div');
            resultado.id = 'resultado';
            resultado.className = 'resultado hidden';
            if (mainContainer) {
                mainContainer.appendChild(resultado);
            }
        }
        
        // Garantir que os cards de resultado existam
        const cards = [
            { id: 'res-horizonte', title: '🚀 Horizonte sugerido:', class: 'horizonte-card' },
            { id: 'res-resumo', title: '🧾 Resumo das suas respostas:', class: 'resumo-card' },
            { id: 'res-alocacao', title: '📊 Alocação recomendada para seu perfil:', class: 'alocacao-card' },
            { id: 'res-dicas', title: '💡 Dicas personalizadas para você:', class: 'dicas-card' }
        ];
        
        cards.forEach(cardInfo => {
            let card = document.getElementById(cardInfo.id);
            if (!card) {
                card = document.createElement('div');
                card.id = cardInfo.id;
                card.className = `result-card ${cardInfo.class}`;
                card.innerHTML = `
                    <h3>${cardInfo.title}</h3>
                    <div class="card-content"></div>
                `;
                resultado.appendChild(card);
            }
        });
        
        return resultado;
    }
    
    function readFormData() {
        const data = {};
        
        // Ler nome (opcional)
        const nomeInput = document.getElementById('nome') || 
                         document.querySelector('input[placeholder*="nome"], input[placeholder*="Nome"]');
        data.nome = nomeInput ? nomeInput.value.trim() : '';
        
        // Ler objetivo de investimento
        const objetivoSelect = document.getElementById('objetivo') || 
                              findElementByLabelText('Objetivo de investimento');
        if (objetivoSelect) {
            const objetivoValue = objetivoSelect.value;
            data.objetivo = objetivoValue;
            data.objetivoTexto = objetivoSelect.options[objetivoSelect.selectedIndex]?.text || objetivoValue;
        }
        
        // Ler tolerância a risco
        const riscoRadio = document.querySelector('input[name="risco"]:checked');
        if (riscoRadio) {
            data.risco = riscoRadio.value;
            data.riscoTexto = riscoRadio.parentElement.textContent.trim();
        }
        
        // Ler valor para investir
        const valorSelect = document.getElementById('valor') || 
                           findElementByLabelText('Valor aproximado para investir');
        if (valorSelect) {
            const valorValue = valorSelect.value;
            data.valor = valorValue;
            data.valorTexto = valorSelect.options[valorSelect.selectedIndex]?.text || valorValue;
        }
        
        // Ler preferência de liquidez
        const liquidezSelect = document.getElementById('liquidez') || 
                              findElementByLabelText('Preferência de liquidez');
        if (liquidezSelect) {
            const liquidezValue = liquidezSelect.value;
            data.liquidez = liquidezValue;
            data.liquidezTexto = liquidezSelect.options[liquidezSelect.selectedIndex]?.text || liquidezValue;
        }
        
        console.log('📋 READ_FORM_DATA: Form data collected', data);
        return data;
    }
    
    function findElementByLabelText(labelText) {
        // Procurar por label que contenha o texto
        const labels = document.querySelectorAll('label');
        for (let label of labels) {
            if (label.textContent.toLowerCase().includes(labelText.toLowerCase())) {
                const forAttr = label.getAttribute('for');
                if (forAttr) {
                    return document.getElementById(forAttr);
                }
                // Procurar input/select dentro ou próximo ao label
                return label.querySelector('input, select') || 
                       label.nextElementSibling?.querySelector('input, select');
            }
        }
        
        // Fallback: procurar por placeholder ou aria-label
        return document.querySelector(`[placeholder*="${labelText}"], [aria-label*="${labelText}"]`);
    }
    
    function renderHorizonte(perfil, horizonte, alertas = []) {
        const container = document.getElementById('res-horizonte');
        if (!container) {
            console.error('❌ RENDER_HORIZONTE: Container not found');
            return;
        }
        
        const content = container.querySelector('.card-content');
        if (!content) {
            console.error('❌ RENDER_HORIZONTE: Content area not found');
            return;
        }
        
        let html = `<div class="horizonte-result">
            <div class="horizonte-value">${horizonte}</div>
        `;
        
        if (alertas.length > 0) {
            html += `<div class="horizonte-alerts">`;
            alertas.forEach(alerta => {
                html += `<div class="alert-item">⚠️ ${alerta}</div>`;
            });
            html += `</div>`;
        }
        
        html += `</div>`;
        content.innerHTML = html;
        
        console.log('✅ RENDER_HORIZONTE: Horizon rendered', { horizonte, alertas });
    }
    
    function renderResumo(respostas) {
        const container = document.getElementById('res-resumo');
        if (!container) {
            console.error('❌ RENDER_RESUMO: Container not found');
            return;
        }
        
        const content = container.querySelector('.card-content');
        if (!content) {
            console.error('❌ RENDER_RESUMO: Content area not found');
            return;
        }
        
        let html = '<div class="resumo-grid">';
        
        if (respostas.nome) {
            html += `<div class="resumo-item">
                <strong>Nome:</strong> ${respostas.nome}
            </div>`;
        }
        
        if (respostas.objetivoTexto) {
            html += `<div class="resumo-item">
                <strong>Objetivo de investimento:</strong> ${respostas.objetivoTexto}
            </div>`;
        }
        
        if (respostas.riscoTexto) {
            html += `<div class="resumo-item">
                <strong>Tolerância a risco:</strong> ${respostas.riscoTexto}
            </div>`;
        }
        
        if (respostas.valorTexto) {
            html += `<div class="resumo-item">
                <strong>Valor aproximado para investir:</strong> ${respostas.valorTexto}
            </div>`;
        }
        
        if (respostas.liquidezTexto) {
            html += `<div class="resumo-item">
                <strong>Preferência de liquidez:</strong> ${respostas.liquidezTexto}
            </div>`;
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        console.log('✅ RENDER_RESUMO: Summary rendered');
    }
    
    function renderAlocacao(alocacao, perfil) {
        const container = document.getElementById('res-alocacao');
        if (!container) {
            console.error('❌ RENDER_ALOCACAO: Container not found');
            return;
        }
        
        const content = container.querySelector('.card-content');
        if (!content) {
            console.error('❌ RENDER_ALOCACAO: Content area not found');
            return;
        }
        
        // Ordem dos ativos conforme especificação
        const assetOrder = ['BTC', 'ETH', 'SOL', 'BNB', 'PENDLE', 'XRP', 'SPX6900'];
        const assetDescriptions = {
            'BTC': 'Bitcoin – Reserva de valor',
            'ETH': 'Ethereum – Contratos inteligentes',
            'SOL': 'Solana – Alta performance',
            'BNB': 'BNB – Ecossistema Binance',
            'PENDLE': 'PENDLE – Derivativos/infra DeFi',
            'XRP': 'XRP – Pagamentos globais',
            'SPX6900': 'SPX6900 – Memecoin (alto risco)'
        };
        
        let html = '<div class="alocacao-content">';
        
        // Barras de alocação
        html += '<div class="allocation-bars">';
        assetOrder.forEach(asset => {
            const percentage = alocacao[asset];
            if (percentage && percentage > 0) {
                html += `
                    <div class="allocation-bar-container">
                        <div class="allocation-bar-label">${asset} - ${percentage}%</div>
                        <div class="allocation-bar-track">
                            <div class="allocation-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }
        });
        html += '</div>';
        
        // Grid de descrições
        html += '<div class="allocation-grid">';
        assetOrder.forEach(asset => {
            const percentage = alocacao[asset];
            if (percentage && percentage > 0) {
                html += `
                    <div class="allocation-asset">
                        <div class="asset-header">
                            <span class="asset-name">${asset}</span>
                            <span class="asset-percent">${percentage}%</span>
                        </div>
                        <div class="asset-description">${assetDescriptions[asset]}</div>
                    </div>
                `;
            }
        });
        html += '</div>';
        
        html += '</div>';
        content.innerHTML = html;
        
        console.log('✅ RENDER_ALOCACAO: Allocation rendered');
    }
    
    function renderDicas(perfil, respostas) {
        const container = document.getElementById('res-dicas');
        if (!container) {
            console.error('❌ RENDER_DICAS: Container not found');
            return;
        }
        
        const content = container.querySelector('.card-content');
        if (!content) {
            console.error('❌ RENDER_DICAS: Content area not found');
            return;
        }
        
        const dicasPorPerfil = {
            'Conservador': [
                'Priorize custódia segura e metas de longo prazo.',
                'Evite alavancagem; rebalanceie trimestralmente.',
                'Use ordens limitadas; evite "market" em baixa liquidez.',
                'Mantenha parte em BTC/ETH como base da carteira.'
            ],
            'Moderado': [
                'Defina faixas de entrada/saída e stops (risco ≤ 1–2% por trade).',
                'Use DCA parcial em BTC/ETH e rotacione altcoins com critério.',
                'Acompanhe suporte/resistência e sentimento (funding/oi).',
                'Faça review semanal de performance e rebalanceamento.'
            ],
            'Arrojado': [
                'Foco em momentum e liquidez; evite pares ilíquidos.',
                'Stops curtos, metas objetivas; não aumente posição perdedora.',
                'Use tamanhos de posição pequenos em memecoins/altas beta.',
                'Registre cada trade (setup, entrada, saída, lições).'
            ]
        };
        
        const dicas = dicasPorPerfil[perfil] || dicasPorPerfil['Moderado'];
        
        let html = '<div class="dicas-content"><ul class="dicas-list">';
        dicas.forEach(dica => {
            html += `<li class="dica-item">${dica}</li>`;
        });
        html += '</ul></div>';
        
        content.innerHTML = html;
        
        console.log('✅ RENDER_DICAS: Tips rendered for profile', perfil);
    }
    
    function saveResults(data) {
        try {
            localStorage.setItem('financeAI_result', JSON.stringify(data));
            console.log('💾 SAVE_RESULTS: Results saved to localStorage');
        } catch (error) {
            console.error('❌ SAVE_RESULTS: Failed to save to localStorage', error);
        }
    }
    
    function loadResults() {
        try {
            const saved = localStorage.getItem('financeAI_result');
            if (saved) {
                const data = JSON.parse(saved);
                console.log('📂 LOAD_RESULTS: Results loaded from localStorage');
                return data;
            }
        } catch (error) {
            console.error('❌ LOAD_RESULTS: Failed to load from localStorage', error);
        }
        return null;
    }
    
    function clearResults() {
        try {
            localStorage.removeItem('financeAI_result');
            console.log('🗑️ CLEAR_RESULTS: Results cleared from localStorage');
        } catch (error) {
            console.error('❌ CLEAR_RESULTS: Failed to clear localStorage', error);
        }
    }
    
    // Pure rendering functions for stable ID containers
    function renderHorizonteSimple(horizonText) {
        const container = document.getElementById('resultHorizonte');
        if (!container) {
            console.warn('⚠️ RENDER_HORIZONTE_SIMPLE: Container not found');
            return;
        }
        
        container.innerHTML = horizonText || '—';
        console.log('✅ RENDER_HORIZONTE_SIMPLE: Rendered', horizonText);
    }
    
    function renderResumoSimple(answers) {
        const container = document.getElementById('resultResumo');
        if (!container) {
            console.warn('⚠️ RENDER_RESUMO_SIMPLE: Container not found');
            return;
        }
        
        if (!answers || Object.keys(answers).length === 0) {
            container.innerHTML = '—';
            return;
        }
        
        let html = '<dl style="margin: 0; line-height: 1.5;">';
        
        if (answers.nome) {
            html += `<dt><strong>Nome:</strong></dt><dd>${answers.nome}</dd>`;
        }
        if (answers.objetivoTexto) {
            html += `<dt><strong>Objetivo:</strong></dt><dd>${answers.objetivoTexto}</dd>`;
        }
        if (answers.riscoTexto) {
            html += `<dt><strong>Tolerância a risco:</strong></dt><dd>${answers.riscoTexto}</dd>`;
        }
        if (answers.valorTexto) {
            html += `<dt><strong>Valor aproximado:</strong></dt><dd>${answers.valorTexto}</dd>`;
        }
        if (answers.liquidezTexto) {
            html += `<dt><strong>Liquidez:</strong></dt><dd>${answers.liquidezTexto}</dd>`;
        }
        
        html += '</dl>';
        container.innerHTML = html;
        console.log('✅ RENDER_RESUMO_SIMPLE: Rendered');
    }
    
    function renderAlocacaoSimple(allocation, profileLabel) {
        const container = document.getElementById('resultAlocacao');
        if (!container) {
            console.warn('⚠️ RENDER_ALOCACAO_SIMPLE: Container not found');
            return;
        }
        
        if (!allocation || Object.keys(allocation).length === 0) {
            container.innerHTML = '—';
            return;
        }
        
        // Asset order (exact as specified)
        const assetOrder = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'PENDLE', 'SPX6900'];
        
        // Asset colors (reuse existing colors)
        const assetColors = {
            'BTC': '#f7931a',
            'ETH': '#627eea',
            'SOL': '#00d4aa',
            'BNB': '#f3ba2f',
            'XRP': '#23292f',
            'PENDLE': '#ff6b9d',
            'SPX6900': '#8b5cf6'
        };
        
        let html = '';
        
        // Profile subtitle
        if (profileLabel) {
            html += `<div style="margin-bottom: 15px; font-weight: 600; color: #667eea;">Seu perfil é ${profileLabel}</div>`;
        }
        
        // Horizontal bars
        assetOrder.forEach(asset => {
            const percentage = allocation[asset];
            if (percentage && percentage > 0) {
                const color = assetColors[asset] || '#667eea';
                html += `
                    <div style="display: flex; align-items: center; margin-bottom: 8px; background: white; padding: 6px 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="min-width: 70px; font-weight: 600; color: #333; font-size: 0.9rem;">${asset}</div>
                        <div style="flex: 1; height: 16px; background: #f0f0f0; border-radius: 8px; margin: 0 8px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 8px; transition: width 0.8s ease;"></div>
                        </div>
                        <div style="min-width: 45px; text-align: right; font-weight: 700; color: #333; font-size: 0.9rem;">${percentage}%</div>
                    </div>
                `;
            }
        });
        
        container.innerHTML = html;
        console.log('✅ RENDER_ALOCACAO_SIMPLE: Rendered');
    }
    
    function renderAlertasSimple(alertList) {
        const container = document.getElementById('resultAlertas');
        if (!container) {
            console.warn('⚠️ RENDER_ALERTAS_SIMPLE: Container not found');
            return;
        }
        
        if (!alertList || alertList.length === 0) {
            container.innerHTML = '—';
            return;
        }
        
        let html = '<div style="space-y: 8px;">';
        alertList.forEach(alert => {
            html += `
                <div style="padding: 8px 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 0.9rem;">
                    ${alert}
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        console.log('✅ RENDER_ALERTAS_SIMPLE: Rendered');
    }
    
    // Helper functions
    function getHorizonteDescription(horizonte) {
        const descriptions = {
            'Curto': 'Ideal para operações rápidas e aproveitamento de volatilidade',
            'Moderado': 'Equilibra oportunidades de curto e médio prazo',
            'Longo': 'Foco em acumulação e crescimento sustentável'
        };
        return descriptions[horizonte] || 'Estratégia personalizada';
    }
    
    function generateSampleAlerts(allocation) {
        const alerts = [];
        
        // Sample alerts based on allocation
        if (allocation.BTC && allocation.BTC > 0) {
            alerts.push('🚨 BTC: Alerta de entrada em US$ 62.500 - Zona de suporte');
        }
        if (allocation.ETH && allocation.ETH > 0) {
            alerts.push('🚨 ETH: Meta de lucro em US$ 3.120 - Resistência importante');
        }
        if (allocation.SOL && allocation.SOL > 0) {
            alerts.push('🚨 SOL: Stop loss em US$ 175 - Gestão de risco');
        }
        if (allocation.SPX6900 && allocation.SPX6900 > 0) {
            alerts.push('🚨 SPX6900: Alta volatilidade - Monitorar volume');
        }
        
        // Return max 3 alerts
        return alerts.slice(0, 3);
    }
    
    function showResults() {
        const resultContainer = ensureResultsContainer();
        
        // Mostrar container de resultados
        if (resultContainer.classList.contains('hidden')) {
            resultContainer.classList.remove('hidden');
        }
        resultContainer.style.display = 'block';
        
        // Esconder formulário
        if (form) {
            form.style.display = 'none';
        }
        
        // Focar no primeiro resultado para acessibilidade
        const firstCard = document.getElementById('res-horizonte');
        if (firstCard) {
            firstCard.setAttribute('tabindex', '-1');
            setTimeout(() => firstCard.focus(), 100);
        }
        
        // Scroll suave para os resultados
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }
    
    function processFormSubmission() {
        // Garantir que containers existam
        ensureResultsContainer();
        
        // Ler dados do formulário
        const respostas = readFormData();
        
        // Validar campos obrigatórios
        if (!respostas.objetivo || !respostas.risco || !respostas.valor || !respostas.liquidez) {
            console.warn('⚠️ PROCESS_FORM: Missing required fields');
            return false;
        }
        
        // Determinar perfil e horizonte
        const { perfil, horizonte, alertas } = determineProfile(respostas.objetivo, respostas.risco);
        
        // Calcular alocação
        const alocacao = calculateAllocation(perfil, horizonte);
        
        // Renderizar todos os cards
        try {
            // Keep existing rendering for backward compatibility
            renderHorizonte(perfil, horizonte, alertas);
            renderResumo(respostas);
            renderAlocacao(alocacao, perfil);
            renderDicas(perfil, respostas);
            
            // NEW: Render into stable ID containers
            const tradingLabels = {
                'Conservador': 'Conservador (HOLDER)',
                'Moderado': 'Moderado (TRADER DE MÉDIO PRAZO)',
                'Arrojado': 'Arrojado (TRADER DE CURTO PRAZO)'
            };
            
            const profileLabel = tradingLabels[perfil] || perfil;
            const horizonteTexto = `${horizonte} - ${getHorizonteDescription(horizonte)}`;
            
            // Generate sample alerts based on allocation
            const sampleAlerts = generateSampleAlerts(alocacao);
            
            // Render into stable containers
            renderHorizonteSimple(horizonteTexto);
            renderResumoSimple(respostas);
            renderAlocacaoSimple(alocacao, profileLabel);
            renderAlertasSimple(sampleAlerts);
            
            // Salvar resultados
            const resultData = {
                nome: respostas.nome,
                perfil,
                horizonte,
                respostas,
                alocacao,
                timestamp: new Date().toISOString()
            };
            saveResults(resultData);
            
            // Mostrar resultados e scroll para o topo dos cards
            showResults();
            
            // Scroll to top of results section
            setTimeout(() => {
                const resultContainer = document.getElementById('resultado');
                if (resultContainer) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
            
            console.log('🎉 PROCESS_FORM: All cards rendered successfully');
            return true;
            
        } catch (error) {
            console.error('❌ PROCESS_FORM: Error rendering results', error);
            return false;
        }
    }
    
    function determineProfile(objetivo, risco) {
        const alertas = [];
        let perfil = 'Moderado';
        let horizonte = 'Moderado';
        
        // Aplicar regras exatas conforme especificação
        if (objetivo === 'curtissimo' && risco === 'alto') {
            perfil = 'Arrojado';
            horizonte = 'Curto';
        } else if (objetivo === 'curtissimo' && risco === 'baixo') {
            perfil = 'Moderado';
            horizonte = 'Curto';
            alertas.push('Risco alto para curtíssimo prazo; ajuste considerado.');
        } else if (objetivo === 'moderado' && risco === 'baixo') {
            perfil = 'Conservador';
            horizonte = 'Moderado';
        } else if (objetivo === 'moderado' && risco === 'medio') {
            perfil = 'Moderado';
            horizonte = 'Moderado';
        } else if (objetivo === 'moderado' && risco === 'alto') {
            perfil = 'Arrojado';
            horizonte = 'Moderado';
            alertas.push('Volatilidade elevada esperada.');
        } else if (objetivo === 'longo' && risco === 'baixo') {
            perfil = 'Conservador';
            horizonte = 'Longo';
        } else if (objetivo === 'longo' && risco === 'medio') {
            perfil = 'Moderado';
            horizonte = 'Longo';
        } else if (objetivo === 'longo' && risco === 'alto') {
            perfil = 'Arrojado';
            horizonte = 'Longo';
            alertas.push('Volatilidade elevada esperada.');
        }
        
        console.log('🎯 DETERMINE_PROFILE: Profile determined', { objetivo, risco, perfil, horizonte, alertas });
        return { perfil, horizonte, alertas };
    }
    
    function calculateAllocation(perfil, horizonte) {
        // Alocações base conforme especificação
        const baseAllocations = {
            'Conservador': {
                'BTC': 70, 'ETH': 13, 'BNB': 3, 'SOL': 2, 'XRP': 7, 'PENDLE': 5
            },
            'Moderado': {
                'BTC': 50, 'ETH': 20, 'BNB': 10, 'SOL': 8, 'XRP': 7, 'PENDLE': 5
            },
            'Arrojado': {
                'ETH': 35, 'BNB': 15, 'SOL': 15, 'SPX6900': 20, 'XRP': 8, 'PENDLE': 7
            }
        };
        
        let allocation = { ...baseAllocations[perfil] };
        
        console.log('📊 CALCULATE_ALLOCATION: Base allocation', { perfil, allocation });
        
        // Aplicar ajustes por horizonte
        if (horizonte === 'Curto') {
            // +5% ETH, -5% distribuído proporcionalmente entre outras altcoins
            if (allocation.ETH) {
                allocation.ETH += 5;
                
                const otherAssets = Object.keys(allocation).filter(asset => 
                    asset !== 'ETH' && allocation[asset] > 0
                );
                
                if (otherAssets.length > 0) {
                    const reduction = 5 / otherAssets.length;
                    otherAssets.forEach(asset => {
                        allocation[asset] = Math.max(0, allocation[asset] - reduction);
                    });
                }
            }
        } else if (horizonte === 'Longo') {
            // +5% ETH, -5% BTC (se tiver BTC)
            if (allocation.BTC && allocation.BTC > 0) {
                allocation.BTC -= 5;
                allocation.ETH += 5;
            } else {
                // Se não tiver BTC, distribuir -5% proporcionalmente entre outras
                allocation.ETH += 5;
                const otherAssets = Object.keys(allocation).filter(asset => 
                    asset !== 'ETH' && allocation[asset] > 0
                );
                
                if (otherAssets.length > 0) {
                    const reduction = 5 / otherAssets.length;
                    otherAssets.forEach(asset => {
                        allocation[asset] = Math.max(0, allocation[asset] - reduction);
                    });
                }
            }
        }
        
        // Normalizar para 100%
        allocation = normalizeTo100(allocation);
        
        console.log('📈 CALCULATE_ALLOCATION: Final allocation', { horizonte, allocation });
        return allocation;
    }
    
    form.addEventListener('submit', function(e) {
        console.log('🎯 SUBMIT: Click handler started', { timestamp: new Date().toISOString() });
        e.preventDefault();
        
        if (isProcessing) {
            console.log('⚠️ SUBMIT: Already processing, ignoring click');
            return;
        }
        
        try {
            console.log('🔍 SUBMIT: Starting validation');
            
            // Verificar se elementos críticos existem
            const submitButton = document.querySelector('[data-test="submit-button"]');
            const resultContainer = document.querySelector('[data-test="result-container"]');
            
            if (!submitButton) {
                console.error('❌ SUBMIT: Submit button not found');
                mostrarErro('Opa! Algo deu errado. Tente novamente.');
                return;
            }
            
            if (!resultContainer) {
                console.error('❌ SUBMIT: Result container not found');
                mostrarErro('Opa! Algo deu errado. Tente novamente.');
                return;
            }
            
            // Validação amigável dos campos obrigatórios
            if (!validarFormulario()) {
                console.log('❌ SUBMIT: Validation failed');
                return;
            }
            
            console.log('✅ SUBMIT: Validation passed');
            
            // Estado de carregamento
            mostrarEstadoCarregamento(true);
            isProcessing = true;
            
            setTimeout(() => {
                try {
                    console.log('📊 SUBMIT: Starting comprehensive form processing');
                    
                    // Usar nova lógica abrangente
                    const success = processFormSubmission();
                    
                    if (success) {
                        // Atualizar progresso para 100%
                        const progressFill = document.getElementById('progress-fill');
                        const progressText = document.getElementById('progress-text');
                        if (progressFill) {
                            progressFill.style.width = '100%';
                            console.log('✅ SUBMIT: Progress updated to 100%');
                        }
                        
                        if (progressText) {
                            progressText.textContent = '100% completo';
                        }
                        
                        console.log('✅ SUBMIT: Form processing completed successfully');
                    } else {
                        console.warn('⚠️ SUBMIT: Form processing failed');
                        mostrarErro('Por favor, preencha todos os campos obrigatórios.');
                    }
                    
                } catch (error) {
                    console.error('❌ SUBMIT: Error in computation/rendering phase:', error);
                    mostrarErro('Opa! Algo deu errado. Tente novamente.');
                } finally {
                    mostrarEstadoCarregamento(false);
                    isProcessing = false;
                    console.log('🏁 SUBMIT: Process completed, flags reset');
                }
            }, 500); // Pequeno delay para mostrar loading
            
        } catch (error) {
            console.error('❌ SUBMIT: Error in main form handler:', error);
            mostrarErro('Opa! Algo deu errado. Tente novamente.');
            mostrarEstadoCarregamento(false);
            isProcessing = false;
        }
    });
    
    function validarFormulario() {
        const camposObrigatorios = [
            { id: 'objetivo', nome: 'Objetivo de investimento' },
            { id: 'valor', nome: 'Valor para investir' },
            { id: 'liquidez', nome: 'Preferência de liquidez' }
        ];
        
        // Validar campos select
        for (let campo of camposObrigatorios) {
            const elemento = document.getElementById(campo.id);
            if (!elemento || !elemento.value) {
                mostrarErroValidacao(campo.id, `Por favor, selecione ${campo.nome.toLowerCase()}`);
                elemento?.focus();
                return false;
            }
        }
        
        // Validar radio button de risco
        const riscoSelecionado = document.querySelector('input[name="risco"]:checked');
        if (!riscoSelecionado) {
            mostrarErroValidacao('risco', 'Por favor, selecione sua tolerância a risco');
            const primeiroRisco = document.querySelector('input[name="risco"]');
            primeiroRisco?.focus();
            return false;
        }
        
        // Limpar mensagens de erro se tudo estiver válido
        limparErrosValidacao();
        return true;
    }
    
    function mostrarErroValidacao(fieldId, mensagem) {
        // Criar ou atualizar container de erro
        let errorContainer = document.getElementById(`${fieldId}-error`);
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = `${fieldId}-error`;
            errorContainer.className = 'validation-error';
            errorContainer.setAttribute('aria-live', 'polite');
            
            const campo = fieldId === 'risco' ? 
                document.querySelector('.radio-group')?.parentElement :
                document.getElementById(fieldId)?.parentElement;
            
            if (campo) {
                campo.appendChild(errorContainer);
            }
        }
        
        errorContainer.textContent = mensagem;
        errorContainer.style.display = 'block';
    }
    
    function limparErrosValidacao() {
        document.querySelectorAll('.validation-error').forEach(error => {
            error.style.display = 'none';
        });
    }
    
    function limparErroValidacao(fieldId) {
        const errorContainer = document.getElementById(`${fieldId}-error`);
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }
    
    function mostrarEstadoCarregamento(loading) {
        const button = document.querySelector('.btn-primary[type="submit"]');
        if (!button) return;
        
        if (loading) {
            button.textContent = '⏳ Calculando...';
            button.disabled = true;
        } else {
            button.textContent = '🔍 Descobrir meu perfil';
            button.disabled = false;
        }
    }
    
    function mostrarErro(mensagem) {
        // Criar ou atualizar container de erro global
        let errorContainer = document.getElementById('global-error');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'global-error';
            errorContainer.className = 'global-error';
            errorContainer.setAttribute('aria-live', 'polite');
            
            const form = document.getElementById('investor-form');
            if (form) {
                form.insertBefore(errorContainer, form.firstChild);
            }
        }
        
        errorContainer.textContent = mensagem;
        errorContainer.style.display = 'block';
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
    
    function persistirResultado(perfil, nome, respostas) {
        try {
            const resultado = {
                nome: nome,
                perfil: perfil.tipo,
                tradingLabel: tradingLabels[perfil.tipo],
                horizonte: perfil.horizonte,
                alocacao: perfil.alocacao,
                data: new Date().toLocaleString('pt-BR'),
                respostas: respostas
            };
            
            localStorage.setItem('consultor-financeiro-ultimo-resultado', JSON.stringify(resultado));
        } catch (error) {
            console.warn('Não foi possível salvar resultado:', error);
        }
    }
    
    function calcularPerfil(objetivo, risco, valor, liquidez) {
        console.log('🧮 CALCULAR_PERFIL: Starting calculation with', { objetivo, risco, valor, liquidez });
        
        // Perfil padrão como fallback seguro
        let perfil = {
            tipo: 'Moderado',
            horizonte: 'Moderado',
            explicacao: 'Perfil trader moderado com mix equilibrado entre ativos consolidados e altcoins promissoras.',
            dicas: [
                'Diversifique entre BTC/ETH e altcoins conforme seu perfil e horizonte',
                'Use stop-loss e take-profit para limitar perdas e travar ganhos',
                'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                'Evite operar com capital que você não pode perder'
            ],
            alerta: null,
            icone: '⚖️',
            alocacao: {
                'BTC': 50,
                'ETH': 20,
                'BNB': 15,
                'SOL': 10,
                'XRP': 3,
                'PENDLE': 2
            }
        };
        
        console.log('📋 CALCULAR_PERFIL: Default profile set', perfil.tipo);
        
        // Definir alocações base por perfil (novas especificações)
        const alocacaoBase = {
            'Conservador': {
                'BTC': 70,
                'ETH': 13,
                'BNB': 3,
                'SOL': 2,
                'XRP': 7,
                'PENDLE': 5
            },
            'Moderado': {
                'BTC': 50,
                'ETH': 20,
                'BNB': 10,
                'SOL': 8,
                'XRP': 7,
                'PENDLE': 5
            },
            'Arrojado': {
                'ETH': 35,
                'BNB': 15,
                'SOL': 15,
                'SPX6900': 20,
                'XRP': 8,
                'PENDLE': 7
            }
        };
        
        // Mapeamento de perfil para trading label
        const tradingLabels = {
            'Conservador': 'HOLDER',
            'Moderado': 'TRADER DE MÉDIO PRAZO',
            'Arrojado': 'TRADER DE CURTO PRAZO'
        };
        
        try {
            console.log('🎯 CALCULAR_PERFIL: Starting profile logic with', { objetivo, risco });
            
            // Lógica principal baseada em objetivo e risco
            if (objetivo === 'curtissimo' && risco === 'alto') {
                console.log('📈 CALCULAR_PERFIL: Setting Arrojado profile (curtissimo + alto)');
            perfil = {
                tipo: 'Arrojado',
                horizonte: 'Curto',
                icone: '🚀',
                explicacao: 'Você tem perfil trader de curto prazo, focado em altcoins de alta volatilidade. Sua estratégia prioriza máximas oportunidades especulativas no mercado cripto.',
                dicas: [
                    'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                    'Use stop-loss e take-profit para limitar perdas e travar ganhos',
                    'Memecoins são altamente voláteis; opere com parcelas pequenas e metas claras',
                    'Monitore volumes e momentum em altcoins constantemente'
                ],
                alerta: null
            };
        }
        else if (objetivo === 'curtissimo' && risco === 'baixo') {
            perfil = {
                tipo: 'Moderado',
                horizonte: 'Curto',
                icone: '⚖️',
                explicacao: 'Perfil trader moderado com características conservadoras. O curtíssimo prazo com baixo risco requer foco em criptomoedas mais estáveis.',
                dicas: [
                    'Diversifique entre BTC/ETH e altcoins conforme seu perfil e horizonte',
                    'Use stop-loss e take-profit para limitar perdas e travar ganhos',
                    'Evite operar com capital que você não pode perder',
                    'Priorize assets consolidados para reduzir volatilidade'
                ],
                alerta: '⚠️ Atenção: Curtíssimo prazo com baixo risco pode resultar em retornos limitados.'
            };
        }
        else if (objetivo === 'moderado' && risco === 'baixo') {
            perfil = {
                tipo: 'Conservador',
                horizonte: 'Moderado',
                icone: '🛡️',
                explicacao: 'Perfil holder conservador focado em segurança máxima. Sua estratégia prioriza Bitcoin e Ethereum como base sólida, com exposição mínima a altcoins.',
                dicas: [
                    'Bitcoin domina sua carteira (80%) como reserva de valor digital',
                    'Diversifique entre BTC/ETH e altcoins conforme seu perfil e horizonte',
                    'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                    'Evite operar com capital que você não pode perder'
                ],
                alerta: null
            };
        }
        else if (objetivo === 'moderado' && risco === 'medio') {
            perfil = {
                tipo: 'Moderado',
                horizonte: 'Moderado',
                icone: '⚖️',
                explicacao: 'Perfil trader moderado com mix equilibrado entre ativos consolidados e altcoins promissoras. Você combina segurança com oportunidades de crescimento em mid-caps.',
                dicas: [
                    'Diversifique entre BTC/ETH e altcoins conforme seu perfil e horizonte',
                    'Use stop-loss e take-profit para limitar perdas e travar ganhos',
                    'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                    'Evite operar com capital que você não pode perder'
                ],
                alerta: null
            };
        }
        else if (objetivo === 'moderado' && risco === 'alto') {
            perfil = {
                tipo: 'Arrojado',
                horizonte: 'Moderado',
                icone: '🚀',
                explicacao: 'Perfil trader arrojado focado em altcoins de alta volatilidade e memecoins. Você prioriza máxima exposição a ativos especulativos com potencial explosivo.',
                dicas: [
                    'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                    'Use stop-loss e take-profit para limitar perdas e travar ganhos',
                    'Memecoins são altamente voláteis; opere com parcelas pequenas e metas claras',
                    'Evite operar com capital que você não pode perder'
                ],
                alerta: '⚠️ Atenção: Alta volatilidade esperada no prazo moderado.'
            };
        }
        else if (objetivo === 'longo' && risco === 'baixo') {
            perfil = {
                tipo: 'Conservador',
                horizonte: 'Longo',
                icone: '🛡️',
                explicacao: 'Perfil holder conservador de longo prazo com foco máximo em Bitcoin. Estratégia de acumulação em ativos mais seguros do mercado cripto.',
                dicas: [
                    'Bitcoin como dominância absoluta (80%) da carteira',
                    'Diversifique entre BTC/ETH e altcoins conforme seu perfil e horizonte',
                    'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                    'Evite operar com capital que você não pode perder'
                ],
                alerta: null
            };
        }
        else if (objetivo === 'longo' && risco === 'medio') {
            perfil = {
                tipo: 'Moderado',
                horizonte: 'Longo',
                icone: '⚖️',
                explicacao: 'Perfil trader moderado de longo prazo com mix equilibrado. Você combina a segurança do BTC/ETH com oportunidades de crescimento em altcoins sólidas.',
                dicas: [
                    'Diversifique entre BTC/ETH e altcoins conforme seu perfil e horizonte',
                    'Use stop-loss e take-profit para limitar perdas e travar ganhos',
                    'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                    'Evite operar com capital que você não pode perder'
                ],
                alerta: null
            };
        }
        else if (objetivo === 'longo' && risco === 'alto') {
            perfil = {
                tipo: 'Arrojado',
                horizonte: 'Longo',
                icone: '🚀',
                explicacao: 'Perfil trader agressivo de longo prazo focado em máxima exposição a altcoins e memecoins. Você busca retornos exponenciais através de alta volatilidade.',
                dicas: [
                    'Defina pontos de entrada e saída antes de operar e respeite seu plano',
                    'Use stop-loss e take-profit para limitar perdas e travar ganhos',
                    'Memecoins são altamente voláteis; opere com parcelas pequenas e metas claras',
                    'Evite operar com capital que você não pode perder'
                ],
                alerta: null
            };
        }
        
        console.log('✅ CALCULAR_PERFIL: Profile logic completed', { tipo: perfil.tipo, horizonte: perfil.horizonte });
        
        } catch (profileLogicError) {
            console.error('❌ CALCULAR_PERFIL: Error in profile logic, using default', profileLogicError);
            // perfil já tem valores padrão seguros
        }
        
        try {
            // Definir alocação base
            console.log('💰 CALCULAR_PERFIL: Setting base allocation for', perfil.tipo);
            
            if (alocacaoBase[perfil.tipo]) {
                perfil.alocacao = { ...alocacaoBase[perfil.tipo] };
                console.log('✅ CALCULAR_PERFIL: Base allocation set', perfil.alocacao);
            } else {
                console.warn('⚠️ CALCULAR_PERFIL: Profile type not found in alocacaoBase, using default');
                perfil.alocacao = { ...alocacaoBase['Moderado'] };
            }
        
        // Ajustes baseados no horizonte (conforme especificações)
        console.log('⚖️ CALCULAR_PERFIL: Starting horizon adjustments', { objetivo, tipo: perfil.tipo });
        
        if (objetivo === 'curtissimo') {
            console.log('⚡ CALCULAR_PERFIL: Applying short-term adjustments (Curto)');
            // Curto → Add 5% to ETH, subtract 5% distributed proportionally among the other altcoins
            if (perfil.alocacao.ETH) {
                perfil.alocacao.ETH += 5;
                
                // Identificar outras altcoins (exceto ETH)
                const outrasAltcoins = Object.keys(perfil.alocacao).filter(crypto => 
                    crypto !== 'ETH' && perfil.alocacao[crypto] > 0
                );
                
                if (outrasAltcoins.length > 0) {
                    const reducaoPorAltcoin = 5 / outrasAltcoins.length;
                    outrasAltcoins.forEach(crypto => {
                        perfil.alocacao[crypto] = Math.max(0, perfil.alocacao[crypto] - reducaoPorAltcoin);
                    });
                }
                console.log('📊 CALCULAR_PERFIL: Applied +5% ETH, distributed -5% among altcoins');
            }
        } else if (objetivo === 'longo') {
            console.log('📈 CALCULAR_PERFIL: Applying long-term adjustments (Longo)');
            // Longo → Add 5% to ETH, subtract 5% from BTC (only for profiles containing BTC)
            if (perfil.alocacao.BTC && perfil.alocacao.BTC > 0) {
                // Profile contains BTC
                perfil.alocacao.BTC -= 5;
                perfil.alocacao.ETH += 5;
                console.log('📊 CALCULAR_PERFIL: Applied +5% ETH, -5% BTC');
            } else {
                // No BTC in profile, distribute the –5% proportionally among the other coins
                perfil.alocacao.ETH += 5;
                
                const outrasCoins = Object.keys(perfil.alocacao).filter(crypto => 
                    crypto !== 'ETH' && perfil.alocacao[crypto] > 0
                );
                
                if (outrasCoins.length > 0) {
                    const reducaoPorCoin = 5 / outrasCoins.length;
                    outrasCoins.forEach(crypto => {
                        perfil.alocacao[crypto] = Math.max(0, perfil.alocacao[crypto] - reducaoPorCoin);
                    });
                }
                console.log('📊 CALCULAR_PERFIL: Applied +5% ETH, distributed -5% among other coins');
            }
        }
        
        } catch (horizonError) {
            console.error('❌ CALCULAR_PERFIL: Error in horizon adjustments', horizonError);
        }
        
        try {
            // Normalizar para garantir 100% usando função robusta
            console.log('🔄 CALCULAR_PERFIL: Normalizing allocation to 100%');
            perfil.alocacao = normalizeTo100(perfil.alocacao);
            console.log('✅ CALCULAR_PERFIL: Allocation normalized', perfil.alocacao);
        } catch (normalizationError) {
            console.error('❌ CALCULAR_PERFIL: Error in normalization, using fallback', normalizationError);
            perfil.alocacao = normalizeTo100({ ...alocacaoBase['Moderado'] });
        }
        
        // Dicas personalizadas por perfil (crypto-only, sem renda fixa/bolsa/staking)
        const dicasPersonalizadas = {
            'Conservador': [
                'Foque em custódia segura - use carteiras hardware para grandes quantias',
                'Aplique DCA (Dollar Cost Average) em BTC e ETH regularmente',
                'Evite alavancagem e trading com margem',
                'Defina limites de risco claros e não invista mais que pode perder',
                'Mantenha 80% em Bitcoin como reserva de valor digital'
            ],
            'Moderado': [
                'Combine análise de tendência com estratégia DCA',
                'Use stops técnicos para proteger posições',
                'Mantenha tamanho de posição responsável (max 5% por trade)',
                'Evite sobre-exposição a memecoins (máximo 10% da carteira)',
                'Diversifique entre majors (BTC/ETH) e altcoins sólidas'
            ],
            'Arrojado': [
                'Dê ênfase a memecoins e altcoins com maior % do capital',
                'PENDLE e SPX6900 podem oferecer oportunidades explosivas',
                'Mantenha gestão de risco rígida mesmo com perfil agressivo',
                'Use stops curtos e take profits parciais',
                'Monitore volume e momentum constantemente em altcoins'
            ]
        };
        
        // Substituir dicas padrão por dicas personalizadas
        perfil.dicas = [...dicasPersonalizadas[perfil.tipo]];
        
        // Ajustes baseados nos outros campos
        if (valor === 'baixo') {
            perfil.dicas.push('Com valores menores, use exchanges com taxas baixas e evite over-trading');
        } else if (valor === 'alto') {
            perfil.dicas.push('Com valores maiores, diversifique posições mas mantenha disciplina de risco');
        }
        
        if (liquidez === 'alta') {
            perfil.dicas.push('Mantenha stablecoins para aproveitar oportunidades rápidas de entrada');
        } else {
            perfil.dicas.push('Foque em posições de longo prazo com stop-loss bem definidos');
        }
        
        // Verificação final da integridade do perfil
        if (!perfil.tipo || !perfil.horizonte || !perfil.alocacao || !perfil.dicas) {
            console.error('❌ CALCULAR_PERFIL: Missing required fields, applying fallback', {
                tipo: !!perfil.tipo,
                horizonte: !!perfil.horizonte,
                alocacao: !!perfil.alocacao,
                dicas: !!perfil.dicas
            });
            
            // Aplicar fallbacks para campos obrigatórios
            if (!perfil.tipo) perfil.tipo = 'Moderado';
            if (!perfil.horizonte) perfil.horizonte = 'Moderado';
            if (!perfil.alocacao) perfil.alocacao = { ...alocacaoBase['Moderado'] };
            if (!perfil.dicas) perfil.dicas = ['Diversifique entre BTC/ETH e altcoins conforme seu perfil e horizonte'];
        }
        
        // Log final do perfil calculado
        const finalTotal = Object.values(perfil.alocacao).reduce((sum, val) => sum + (val || 0), 0);
        console.log('🎉 CALCULAR_PERFIL: Final profile calculated', {
            tipo: perfil.tipo,
            horizonte: perfil.horizonte,
            alocacaoTotal: finalTotal,
            dicasCount: perfil.dicas.length,
            alocacao: perfil.alocacao
        });
        
        // Extra validation for debugging
        if (Math.abs(finalTotal - 100) > 0.1) {
            console.warn('⚠️ CALCULAR_PERFIL: Allocation total is not 100%', {
                total: finalTotal,
                allocation: perfil.alocacao
            });
        }
        
        if (!perfil.alocacao || Object.keys(perfil.alocacao).length === 0) {
            console.error('❌ CALCULAR_PERFIL: Empty allocation object');
        }
        
        return perfil;
    }
    
    function exibirResultado(perfil, nome, respostas) {
        console.log('🎨 EXIBIR_RESULTADO: Starting result rendering', { 
            perfil: perfil?.tipo, 
            nome: nome || '[none]',
            respostasKeys: Object.keys(respostas || {})
        });
        
        if (!perfil) {
            console.error('❌ EXIBIR_RESULTADO: No profile provided');
            mostrarErro('Opa! Algo deu errado. Tente novamente.');
            return;
        }
        
        const saudacao = nome ? `${nome}, s` : 'S';
        
        try {
            // Atualizar ícone do resultado
            const resultIcon = document.getElementById('result-icon');
            if (resultIcon) {
                resultIcon.textContent = perfil.icone || '📊';
                console.log('✅ EXIBIR_RESULTADO: Result icon updated');
            } else {
                console.warn('⚠️ EXIBIR_RESULTADO: result-icon element not found');
            }
            
            // Atualizar título com formato: "Seu perfil é [perfil] [ícone] — [rótulo HOLDER/TRADER]"
            const tituloResultado = document.getElementById('titulo-resultado');
            if (tituloResultado) {
                const tradingLabel = tradingLabels[perfil.tipo] || 'TRADER MODERADO';
                tituloResultado.innerHTML = `
                    <div>${saudacao}eu perfil é ${perfil.tipo} ${perfil.icone || '📊'} — ${tradingLabel}</div>
                `;
                console.log('✅ EXIBIR_RESULTADO: Title updated with profile and trading label');
            } else {
                console.error('❌ EXIBIR_RESULTADO: titulo-resultado element not found');
            }
            
            // Atualizar explicação
            const explicacaoResultado = document.getElementById('explicacao-resultado');
            if (explicacaoResultado) {
                explicacaoResultado.textContent = perfil.explicacao || 'Perfil calculado com base nas suas respostas.';
                console.log('✅ EXIBIR_RESULTADO: Explanation updated');
            } else {
                console.warn('⚠️ EXIBIR_RESULTADO: explicacao-resultado element not found');
            }
        
        // Mostrar/ocultar alerta
        const alertaContainer = document.getElementById('alerta-container');
        const alertaTexto = document.getElementById('alerta-texto');
        
        if (alertaContainer && alertaTexto) {
            if (perfil.alerta) {
                alertaTexto.textContent = perfil.alerta;
                alertaContainer.classList.remove('hidden');
                console.log('✅ EXIBIR_RESULTADO: Alert shown');
            } else {
                alertaContainer.classList.add('hidden');
                console.log('✅ EXIBIR_RESULTADO: Alert hidden');
            }
        } else {
            console.warn('⚠️ EXIBIR_RESULTADO: Alert elements not found', {
                container: !!alertaContainer,
                texto: !!alertaTexto
            });
        }
        
        // Atualizar horizonte com explicação
        const horizonteSugerido = document.getElementById('horizonte-sugerido');
        if (horizonteSugerido) {
            const horizonteExplicacoes = {
                'Curto': 'Curto - Ideal para operações rápidas e aproveitamento de volatilidade',
                'Moderado': 'Moderado - Equilibra oportunidades de curto e médio prazo',
                'Longo': 'Longo - Foco em acumulação e crescimento sustentável'
            };
            horizonteSugerido.textContent = horizonteExplicacoes[perfil.horizonte] || 'Moderado - Equilibra oportunidades de curto e médio prazo';
            console.log('✅ EXIBIR_RESULTADO: Horizon updated with explanation');
        } else {
            console.warn('⚠️ EXIBIR_RESULTADO: horizonte-sugerido element not found');
        }
        
        // Criar resumo das respostas
        try {
            console.log('📋 EXIBIR_RESULTADO: Creating response summary');
            criarResumoRespostas(respostas);
            console.log('✅ EXIBIR_RESULTADO: Response summary created');
        } catch (resumoError) {
            console.error('❌ EXIBIR_RESULTADO: Error creating response summary', resumoError);
        }
        
        // Criar alocação
        try {
            console.log('💰 EXIBIR_RESULTADO: Creating allocation display');
            // Armazenar perfil globalmente para uso na renderização
            window.currentProfile = perfil.tipo;
            criarAlocacao(perfil.alocacao);
            console.log('✅ EXIBIR_RESULTADO: Allocation display created');
        } catch (alocacaoError) {
            console.error('❌ EXIBIR_RESULTADO: Error creating allocation display', alocacaoError);
        }
        
        // Criar alertas demo
        try {
            console.log('🚨 EXIBIR_RESULTADO: Creating alerts demo');
            criarAlertasDemo(perfil.alocacao);
            console.log('✅ EXIBIR_RESULTADO: Alerts demo created');
        } catch (alertasError) {
            console.error('❌ EXIBIR_RESULTADO: Error creating alerts demo', alertasError);
        }
        
        // Atualizar dicas
        try {
            console.log('💡 EXIBIR_RESULTADO: Updating tips');
            const listaDicas = document.getElementById('lista-dicas');
            if (listaDicas) {
                listaDicas.innerHTML = '';
                
                const dicas = perfil.dicas || [];
                console.log('📝 EXIBIR_RESULTADO: Adding tips', { count: dicas.length });
                
                dicas.forEach((dica, index) => {
                    const li = document.createElement('li');
                    li.textContent = dica;
                    listaDicas.appendChild(li);
                });
                console.log('✅ EXIBIR_RESULTADO: Tips updated successfully');
            } else {
                console.warn('⚠️ EXIBIR_RESULTADO: lista-dicas element not found');
            }
        } catch (dicasError) {
            console.error('❌ EXIBIR_RESULTADO: Error updating tips', dicasError);
        }
        
        } catch (renderError) {
            console.error('❌ EXIBIR_RESULTADO: Error in main render block', renderError);
        }
        
        // Esconder formulário e mostrar resultado
        try {
            console.log('🔄 EXIBIR_RESULTADO: Switching from form to result view');
            
            if (form) {
                form.style.display = 'none';
                console.log('✅ EXIBIR_RESULTADO: Form hidden');
            } else {
                console.warn('⚠️ EXIBIR_RESULTADO: Form element not found');
            }
            
            if (resultadoDiv) {
                resultadoDiv.classList.remove('hidden');
                resultadoDiv.style.display = 'block';
                console.log('✅ EXIBIR_RESULTADO: Result container shown');
                
                // Acessibilidade: focar no título do resultado
                const tituloResultado = document.getElementById('titulo-resultado');
                if (tituloResultado) {
                    tituloResultado.setAttribute('tabindex', '-1');
                    setTimeout(() => {
                        tituloResultado.focus();
                        console.log('✅ EXIBIR_RESULTADO: Focus set on title for accessibility');
                    }, 100);
                } else {
                    console.warn('⚠️ EXIBIR_RESULTADO: Could not set focus - title element not found');
                }
                
                // Scroll suave para o resultado
                setTimeout(() => {
                    resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    console.log('✅ EXIBIR_RESULTADO: Smooth scroll to result completed');
                }, 200);
            } else {
                console.error('❌ EXIBIR_RESULTADO: Result container not found - cannot show results');
                mostrarErro('Opa! Algo deu errado. Tente novamente.');
            }
        } catch (displayError) {
            console.error('❌ EXIBIR_RESULTADO: Error switching display', displayError);
            mostrarErro('Opa! Algo deu errado. Tente novamente.');
        }
        
        console.log('🎉 EXIBIR_RESULTADO: Result rendering completed successfully');
    }
    
    function criarResumoRespostas(respostas) {
        const resumoContent = document.getElementById('resumo-content');
        resumoContent.innerHTML = '';
        
        const labels = {
            objetivo: 'Objetivo de investimento',
            risco: 'Tolerância a risco',
            valor: 'Valor para investir',
            liquidez: 'Preferência de liquidez'
        };
        
        const valores = {
            objetivo: {
                'longo': '🏆 Longo prazo (1+ anos)',
                'moderado': '⚡ Moderado (4-9 semanas)',
                'curtissimo': '🚀 Curtíssimo prazo (1-7 dias)'
            },
            risco: {
                'baixo': '🛡️ Baixo',
                'medio': '⚖️ Médio',
                'alto': '🔥 Alto'
            },
            valor: {
                'baixo': '💸 Até R$ 5 mil',
                'medio': '💰 R$ 5-50 mil',
                'alto': '💎 Acima R$ 50 mil'
            },
            liquidez: {
                'alta': '🏃‍♂️ Resgate rápido',
                'baixa': '🧘‍♂️ Sem pressa'
            }
        };
        
        Object.keys(labels).forEach(key => {
            if (respostas[key]) {
                const item = document.createElement('div');
                item.className = 'resumo-item';
                item.innerHTML = `
                    <strong>${labels[key]}:</strong>
                    <span>${valores[key][respostas[key]]}</span>
                `;
                resumoContent.appendChild(item);
            }
        });
    }
    
    // Funções utilitárias robustas
    function safeNumber(x) {
        return (typeof x === 'number' && !isNaN(x)) ? x : 0;
    }
    
    function normalizeTo100(allocation) {
        console.debug('🔢 NORMALIZE: Starting normalization', allocation);
        
        const total = Object.values(allocation).reduce((sum, val) => sum + safeNumber(val), 0);
        console.debug('📊 NORMALIZE: Current total', total);
        
        if (total === 0) {
            console.warn('⚠️ NORMALIZE: Total is 0, cannot normalize');
            return allocation;
        }
        
        if (Math.abs(total - 100) < 0.01) {
            console.debug('✅ NORMALIZE: Already normalized');
            return allocation;
        }
        
        // Normalizar para 100%
        const factor = 100 / total;
        const normalized = {};
        let runningTotal = 0;
        
        const assets = Object.keys(allocation);
        
        // Aplicar fator e arredondar
        for (let i = 0; i < assets.length - 1; i++) {
            const asset = assets[i];
            normalized[asset] = Math.round(safeNumber(allocation[asset]) * factor * 10) / 10;
            runningTotal += normalized[asset];
        }
        
        // Último ativo recebe o resto para garantir exatamente 100%
        const lastAsset = assets[assets.length - 1];
        normalized[lastAsset] = Math.round((100 - runningTotal) * 10) / 10;
        
        const finalTotal = Object.values(normalized).reduce((sum, val) => sum + val, 0);
        console.debug('✅ NORMALIZE: Final result', { normalized, total: finalTotal });
        
        return normalized;
    }
    
    function findAllocationContainer() {
        // Procurar pela seção que contém "Alocação recomendada para seu perfil"
        const allElements = document.querySelectorAll('*');
        
        for (let element of allElements) {
            const text = element.textContent || element.innerText || '';
            if (text.toLowerCase().includes('alocação recomendada') || 
                text.toLowerCase().includes('alocacao recomendada')) {
                console.debug('📍 FIND: Found allocation section', element);
                return element;
            }
        }
        
        // Fallback: procurar pelo ID conhecido
        const knownContainer = document.querySelector('.alocacao-section');
        if (knownContainer) {
            console.debug('📍 FIND: Using known container', knownContainer);
            return knownContainer;
        }
        
        console.error('❌ FIND: Allocation container not found');
        return null;
    }
    
    function renderAllocation(allocation, perfil) {
        console.debug('🎨 RENDER_ALLOCATION: Starting render', { allocation, perfil });
        
        if (!allocation || typeof allocation !== 'object') {
            console.error('❌ RENDER_ALLOCATION: Invalid allocation object', allocation);
            return;
        }
        
        // Encontrar container dinamicamente
        let containerSection = findAllocationContainer();
        if (!containerSection) {
            console.warn('⚠️ RENDER_ALLOCATION: Dynamic search failed, trying fallback methods');
            
            // Fallback 1: Procurar pelo id conhecido do HTML
            containerSection = document.querySelector('#resultado .alocacao-section');
            
            if (!containerSection) {
                // Fallback 2: Qualquer seção que pareça com alocação
                containerSection = document.querySelector('.alocacao-section, [class*="alocacao"], [id*="alocacao"]');
            }
            
            if (!containerSection) {
                // Fallback 3: Criar uma seção temporária
                console.warn('⚠️ RENDER_ALLOCATION: Creating temporary allocation section');
                const resultContainer = document.getElementById('resultado');
                if (resultContainer) {
                    containerSection = document.createElement('div');
                    containerSection.className = 'alocacao-section';
                    containerSection.innerHTML = '<h3>📊 Alocação recomendada para seu perfil:</h3>';
                    resultContainer.appendChild(containerSection);
                }
            }
        }
        
        if (!containerSection) {
            console.error('❌ RENDER_ALLOCATION: Could not find or create container section');
            return;
        }
        
        // Procurar ou criar área de renderização
        let renderArea = containerSection.querySelector('[data-render="true"]');
        if (!renderArea) {
            renderArea = containerSection.querySelector('.allocation-chart, .allocation-list, #allocation-chart, #allocation-list');
        }
        
        if (!renderArea) {
            // Criar nova área de renderização
            renderArea = document.createElement('div');
            renderArea.className = 'allocation-body';
            renderArea.setAttribute('data-render', 'true');
            containerSection.appendChild(renderArea);
            console.debug('🏗️ RENDER_ALLOCATION: Created new render area');
        }
        
        // Limpar área
        renderArea.innerHTML = '';
        
        // Normalizar alocação
        const normalizedAllocation = normalizeTo100(allocation);
        
        // Ordem fixa de exibição (com base nas especificações)
        let displayOrder = [];
        
        if (perfil === 'Arrojado') {
            // Arrojado: ETH, BNB, SOL, SPX6900, XRP, PENDLE
            displayOrder = ['ETH', 'BNB', 'SOL', 'SPX6900', 'XRP', 'PENDLE'];
        } else {
            // Conservador e Moderado: BTC, ETH, BNB, SOL, XRP, PENDLE
            displayOrder = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'PENDLE'];
        }
        
        console.debug('📊 RENDER_ALLOCATION: Display order', displayOrder);
        
        // Criar barras para cada ativo (mostrar todos, mesmo com 0%)
        displayOrder.forEach(asset => {
            const percentage = safeNumber(normalizedAllocation[asset]);
            
            // Mostrar todos os ativos, incluindo os com 0%
            
            const assetRow = document.createElement('div');
            assetRow.className = 'allocation-row';
            assetRow.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
            
            // Label do ativo
            const assetLabel = document.createElement('div');
            assetLabel.className = 'allocation-label';
            assetLabel.textContent = asset;
            assetLabel.style.cssText = 'min-width: 80px; font-weight: 600; color: #333;';
            
            // Barra de progresso
            const progressContainer = document.createElement('div');
            progressContainer.style.cssText = 'flex: 1; height: 20px; background: #e9ecef; border-radius: 10px; margin: 0 10px; overflow: hidden;';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'allocation-bar';
            progressBar.style.cssText = `width: ${percentage}%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; transition: width 1s ease;`;
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', '100');
            progressBar.setAttribute('aria-valuenow', percentage.toString());
            progressBar.setAttribute('aria-label', `Alocação de ${asset}`);
            
            progressContainer.appendChild(progressBar);
            
            // Percentual
            const percentageLabel = document.createElement('div');
            percentageLabel.className = 'allocation-pct';
            percentageLabel.textContent = `${percentage}%`;
            percentageLabel.style.cssText = 'min-width: 50px; text-align: right; font-weight: 700; color: #333;';
            
            // Montar linha
            assetRow.appendChild(assetLabel);
            assetRow.appendChild(progressContainer);
            assetRow.appendChild(percentageLabel);
            
            renderArea.appendChild(assetRow);
        });
        
        // Remover classe hidden se existir
        if (containerSection.classList.contains('hidden')) {
            containerSection.classList.remove('hidden');
        }
        
        console.debug('✅ RENDER_ALLOCATION: Allocation rendered successfully');
    }
    
    function criarAlocacao(alocacao) {
        console.log('💰 CRIAR_ALOCACAO: Starting allocation creation', alocacao);
        
        if (!alocacao || typeof alocacao !== 'object') {
            console.error('❌ CRIAR_ALOCACAO: Invalid allocation provided', alocacao);
            return;
        }
        
        // Usar nova função robusta
        renderAllocation(alocacao, window.currentProfile || 'Moderado');
        
        // Manter compatibilidade com código existente se containers existirem
        const chartContainer = document.getElementById('allocation-chart');
        const listContainer = document.getElementById('allocation-list');
        
        if (!chartContainer && !listContainer) {
            console.debug('ℹ️ CRIAR_ALOCACAO: Legacy containers not found, using new render method only');
            return;
        }
        
        console.log('🔄 CRIAR_ALOCACAO: Also populating legacy containers for compatibility');
        
        if (chartContainer) chartContainer.innerHTML = '';
        if (listContainer) listContainer.innerHTML = '';
        
        // Se existirem containers legados, popular eles também
        if (listContainer) {
            let displayOrder = [];
            
            if (window.currentProfile === 'Arrojado') {
                displayOrder = ['ETH', 'BNB', 'SOL', 'SPX6900', 'XRP', 'PENDLE'];
            } else {
                displayOrder = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'PENDLE'];
            }
            
            const normalizedAllocation = normalizeTo100(alocacao);
            
            displayOrder.forEach(asset => {
                const percentage = safeNumber(normalizedAllocation[asset]);
                // Mostrar todos os ativos, incluindo os com 0%
                
                const card = document.createElement('div');
                card.className = 'allocation-item';
                card.innerHTML = `
                    <div class="crypto-name">${asset}</div>
                    <div class="crypto-percentage">${percentage}%</div>
                    <div class="crypto-description">${getCryptoDescription(asset)}</div>
                `;
                listContainer.appendChild(card);
            });
        }
        
    }
    
    function getCryptoDescription(asset) {
        const descriptions = {
            'BTC': 'Bitcoin - Reserva de valor digital',
            'ETH': 'Ethereum - Plataforma de contratos inteligentes',
            'SOL': 'Solana - Blockchain de alta performance',
            'BNB': 'Binance Coin - Token da maior exchange',
            'PENDLE': 'PENDLE - Protocol de yield trading',
            'XRP': 'XRP - Rede de pagamentos globais',
            'SPX6900': 'SPX6900 - Memecoin especulativa'
        };
        return descriptions[asset] || asset;
    }
    
    // Função legacy mantida para compatibilidade
    function criarAlocacaoLegacy(alocacao) {
        
        // Criar gráfico de barras
        const cryptoColors = {
            'BTC': '#f7931a',
            'ETH': '#627eea',
            'BNB': '#f3ba2f',
            'SOL': '#00d4aa',
            'XRP': '#23292f',
            'PENDLE': '#ff6b9d',
            'SPX6900': '#8b5cf6'
        };
        
        const cryptoDescriptions = {
            'BTC': 'Bitcoin - Reserva de valor digital',
            'ETH': 'Ethereum - Plataforma de contratos inteligentes',
            'SOL': 'Solana - Blockchain de alta performance',
            'BNB': 'Binance Coin - Token da maior exchange',
            'PENDLE': 'PENDLE - Protocol de yield trading',
            'XRP': 'XRP - Rede de pagamentos globais',
            'SPX6900': 'SPX6900 - Memecoin especulativa'
        };
        
        // Definir ordem específica de exibição (conforme especificações)
        const displayOrder = ['BTC', 'ETH', 'SOL', 'BNB', 'PENDLE', 'XRP', 'SPX6900'];
        console.log('📊 CRIAR_ALOCACAO: Required display order', displayOrder);
        
        // Filtrar e ordenar conforme ordem definida
        const sortedAllocation = displayOrder
            .filter(crypto => alocacao[crypto] && alocacao[crypto] > 0)
            .map(crypto => [crypto, alocacao[crypto]]);
            
        console.log('✅ CRIAR_ALOCACAO: Sorted allocation ready', {
            order: sortedAllocation.map(([crypto, percentage]) => `${crypto}: ${percentage}%`),
            total: sortedAllocation.reduce((sum, [, percentage]) => sum + percentage, 0)
        });
        
        // Criar barras
        sortedAllocation.forEach(([crypto, percentage]) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.innerHTML = `
                <div class="chart-bar-label">${crypto}</div>
                <div class="chart-bar-fill">
                    <div class="chart-bar-progress" style="width: 0%; background: ${cryptoColors[crypto] || '#667eea'}"></div>
                </div>
                <div class="chart-bar-percentage">${percentage}%</div>
            `;
            chartContainer.appendChild(bar);
            
            // Animar barra
            setTimeout(() => {
                bar.querySelector('.chart-bar-progress').style.width = percentage + '%';
            }, 100);
        });
        
        // Criar lista de cards
        sortedAllocation.forEach(([crypto, percentage]) => {
            const card = document.createElement('div');
            card.className = 'allocation-item';
            card.innerHTML = `
                <div class="crypto-name">${crypto}</div>
                <div class="crypto-percentage">${percentage}%</div>
                <div class="crypto-description">${cryptoDescriptions[crypto] || ''}</div>
            `;
            listContainer.appendChild(card);
        });
    }
    
    function criarAlertasDemo(alocacao) {
        const alertasContainer = document.getElementById('alertas-list');
        alertasContainer.innerHTML = '';
        
        // Dados simulados de alertas de trading (valores ilustrativos/demo)
        const dadosAlertas = {
            'BTC': { 
                entrada: 'US$ 62.500', 
                saida: 'US$ 64.800',
                status: 'active',
                descricao: 'BTC: Entrada interessante em US$ 62.500 | Saída parcial em US$ 64.800'
            },
            'ETH': { 
                entrada: 'US$ 2.950', 
                saida: 'US$ 3.120',
                status: 'active',
                descricao: 'ETH: Entrada US$ 2.950 | Saída US$ 3.120'
            },
            'SOL': { 
                entrada: 'US$ 185', 
                saida: 'US$ 205',
                status: 'triggered',
                descricao: 'SOL: Entrada US$ 185 | Saída US$ 205'
            },
            'BNB': { 
                entrada: 'US$ 580', 
                saida: 'US$ 620',
                status: 'active',
                descricao: 'BNB: Entrada US$ 580 | Saída US$ 620'
            },
            'PENDLE': { 
                entrada: 'US$ 4.80', 
                saida: 'US$ 5.50',
                status: 'triggered',
                descricao: 'PENDLE: Entrada US$ 4.80 | Saída US$ 5.50'
            },
            'XRP': { 
                entrada: 'US$ 0.52', 
                saida: 'US$ 0.58',
                status: 'active',
                descricao: 'XRP: Entrada US$ 0.52 | Saída US$ 0.58'
            },
            'SPX6900': { 
                entrada: 'US$ 0.008', 
                saida: 'US$ 0.012',
                status: 'triggered',
                descricao: 'SPX6900: Entrada US$ 0.008 | Saída US$ 0.012'
            }
        };
        
        // Filtrar apenas cryptos presentes na alocação
        const cryptosNaCarteira = Object.keys(alocacao).filter(crypto => alocacao[crypto] > 0);
        
        // Adicionar aviso de demo
        const demoWarning = document.createElement('div');
        demoWarning.style.cssText = 'text-align: center; font-size: 0.85rem; color: #666; margin-bottom: 15px; font-style: italic;';
        demoWarning.textContent = '⚠️ Exemplo/Demo – valores ilustrativos para demonstração';
        alertasContainer.appendChild(demoWarning);
        
        cryptosNaCarteira.forEach(crypto => {
            if (dadosAlertas[crypto]) {
                const dados = dadosAlertas[crypto];
                const alertaItem = document.createElement('div');
                alertaItem.className = 'alerta-item';
                
                const statusClass = dados.status === 'active' ? 'status-active' : 'status-triggered';
                const statusIcon = dados.status === 'active' ? '🟢' : '🟡';
                const statusText = dados.status === 'active' ? 'Ativo' : 'Acionado';
                
                alertaItem.innerHTML = `
                    <div class="alerta-crypto">
                        <div class="crypto-symbol">${crypto}</div>
                    </div>
                    <div class="alerta-info">
                        <div style="font-size: 0.9rem; color: #333; margin-bottom: 5px;">${dados.descricao}</div>
                        <div class="alerta-status ${statusClass}">
                            ${statusIcon} ${statusText}
                        </div>
                    </div>
                `;
                
                alertasContainer.appendChild(alertaItem);
            }
        });
    }
    
    document.getElementById('btn-recomecar').addEventListener('click', function() {
        try {
            if (form) {
                form.style.display = 'block';
                form.reset();
            }
            
            if (resultadoDiv) {
                resultadoDiv.classList.add('hidden');
                resultadoDiv.style.display = 'none';
            }
            
            updateProgress();
            
            // Limpar feedbacks e erros
            document.querySelectorAll('.feedback-text').forEach(el => el.classList.add('hidden'));
            limparErrosValidacao();
            
            // Limpar erro global se existir
            const globalError = document.getElementById('global-error');
            if (globalError) globalError.style.display = 'none';
            
            // Reset do botão de submit
            mostrarEstadoCarregamento(false);
            
            // Scroll suave de volta para o formulário
            setTimeout(() => {
                if (form) {
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Focar no primeiro campo
                    const primeiroInput = form.querySelector('input, select');
                    if (primeiroInput) primeiroInput.focus();
                }
            }, 200);
            
        } catch (error) {
            console.error('Erro ao recomeçar:', error);
        }
    });
    
    document.getElementById('btn-salvar').addEventListener('click', function() {
        try {
            const nomeElement = document.getElementById('nome');
            const tituloElement = document.getElementById('titulo-resultado');
            const horizonteElement = document.getElementById('horizonte-sugerido');
            
            if (!tituloElement || !horizonteElement) {
                alert('❌ Erro: resultado não encontrado para salvar.');
                return;
            }
            
            const resultado = {
                nome: nomeElement ? nomeElement.value : '',
                perfil: tituloElement.textContent,
                horizonte: horizonteElement.textContent,
                data: new Date().toLocaleString('pt-BR'),
                alocacao: getCurrentAllocation()
            };
            
            localStorage.setItem('consultor-financeiro-resultado-salvo', JSON.stringify(resultado));
            alert('💾 Resultado salvo com sucesso! Você pode acessá-lo posteriormente.');
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('❌ Erro ao salvar resultado. Verifique se o localStorage está habilitado.');
        }
    });
    
    function getCurrentAllocation() {
        const allocation = {};
        document.querySelectorAll('.allocation-item').forEach(item => {
            const name = item.querySelector('.crypto-name').textContent;
            const percentage = item.querySelector('.crypto-percentage').textContent;
            allocation[name] = percentage;
        });
        return allocation;
    }
    
    // Carregar resultado salvo se existir
    function carregarResultadoSalvo() {
        try {
            // Verificar resultado salvo manual
            const resultadoSalvo = localStorage.getItem('consultor-financeiro-resultado-salvo');
            if (resultadoSalvo) {
                const dados = JSON.parse(resultadoSalvo);
                adicionarBotaoCarregarResultado(dados, 'salvo');
            }
            
            // Verificar último resultado calculado (auto-save)
            const ultimoResultado = localStorage.getItem('consultor-financeiro-ultimo-resultado');
            if (ultimoResultado && !resultadoSalvo) {
                const dados = JSON.parse(ultimoResultado);
                adicionarBotaoCarregarResultado(dados, 'ultimo');
            }
        } catch (error) {
            console.warn('Erro ao carregar resultado salvo:', error);
        }
    }
    
    function adicionarBotaoCarregarResultado(dados, tipo) {
        const header = document.querySelector('header');
        if (!header) return;
        
        // Evitar duplicar botão
        const botaoExistente = document.getElementById('btn-carregar-resultado');
        if (botaoExistente) return;
        
        const btnCarregar = document.createElement('button');
        btnCarregar.id = 'btn-carregar-resultado';
        btnCarregar.className = 'btn-secondary';
        btnCarregar.style.cssText = 'margin-top: 10px; padding: 8px 16px; font-size: 0.9rem;';
        btnCarregar.innerHTML = tipo === 'salvo' ? '📋 Ver resultado salvo' : '🔄 Ver último resultado';
        
        btnCarregar.onclick = () => {
            const mensagem = `${tipo === 'salvo' ? 'Resultado salvo' : 'Último resultado'} em ${dados.data}:\n\n` +
                           `Perfil: ${dados.tradingLabel || dados.perfil}\n` +
                           `Horizonte: ${dados.horizonte}\n` +
                           `${dados.nome ? `Nome: ${dados.nome}` : ''}`;
            alert(mensagem);
        };
        
        header.appendChild(btnCarregar);
    }
    
    // Funcionalidade dos botões sociais
    document.getElementById('btn-whatsapp').addEventListener('click', function() {
        try {
            const tituloElement = document.getElementById('titulo-resultado');
            const horizonteElement = document.getElementById('horizonte-sugerido');
            
            if (!tituloElement || !horizonteElement) {
                alert('❌ Erro: resultado não encontrado para compartilhar.');
                return;
            }
            
            const titulo = tituloElement.textContent;
            const horizonte = horizonteElement.textContent;
            
            let alocacaoTexto = '';
            document.querySelectorAll('.allocation-item').forEach(item => {
                const cryptoName = item.querySelector('.crypto-name');
                const cryptoPercentage = item.querySelector('.crypto-percentage');
                
                if (cryptoName && cryptoPercentage) {
                    alocacaoTexto += `${cryptoName.textContent}: ${cryptoPercentage.textContent}\n`;
                }
            });
            
            const texto = `🎯 ${titulo}\n📊 Horizonte: ${horizonte}\n\n💰 Alocação recomendada:\n${alocacaoTexto}\n🔗 Descubra seu perfil: ${window.location.href}`;
            const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
            
            window.open(url, '_blank');
            
        } catch (error) {
            console.error('Erro ao compartilhar no WhatsApp:', error);
            alert('❌ Erro ao compartilhar. Tente novamente.');
        }
    });
    
    // Botão "Ver opções de investimento"
    document.getElementById('btn-ver-opcoes').addEventListener('click', function() {
        alert('🚀 Em breve: conexão com plataformas de investimento!\n\nEsta funcionalidade direcionará você para as melhores opções de corretoras e exchanges baseadas no seu perfil.');
    });
    
    // Funcionalidade do toggle de alertas
    document.addEventListener('change', function(e) {
        if (e.target.id === 'alertas-toggle') {
            const alertasSection = document.querySelector('.alertas-section');
            if (e.target.checked) {
                alertasSection.classList.remove('alertas-disabled');
            } else {
                alertasSection.classList.add('alertas-disabled');
            }
        }
    });
    
    // Carregar resultado salvo ao inicializar
    carregarResultadoSalvo();
});