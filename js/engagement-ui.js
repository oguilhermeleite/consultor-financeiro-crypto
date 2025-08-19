// Engagement UI Manager
// Coordinates all engagement feature interfaces and user interactions

class EngagementUI {
  constructor() {
    this.alertSystem = null;
    this.historyManager = null;
    this.scenarioComparator = null;
    this.isInitialized = false;
    
    this.initializeUI();
  }
  
  /**
   * Initialize the engagement UI system
   */
  async initializeUI() {
    // Wait for dependencies
    await this.waitForDependencies();
    
    // Load engagement styles
    this.loadEngagementStyles();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize interface components
    this.initializeComponents();
    
    this.isInitialized = true;
    console.log('🎨 Engagement UI initialized');
  }
  
  /**
   * Wait for engagement system dependencies
   */
  async waitForDependencies() {
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      if (window.alertSystem && window.userHistoryManager && window.scenarioComparator) {
        this.alertSystem = window.alertSystem;
        this.historyManager = window.userHistoryManager;
        this.scenarioComparator = window.scenarioComparator;
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
    }
    
    console.warn('⚠️ Some engagement UI dependencies not available');
  }
  
  /**
   * Load engagement CSS styles
   */
  loadEngagementStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/engagement.css';
    document.head.appendChild(link);
  }
  
  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Listen for profile calculations to show engagement features
    document.addEventListener('profileCalculated', (event) => {
      this.handleProfileCalculated(event.detail);
    });
    
    // Listen for alert system events
    document.addEventListener('alertTriggered', (event) => {
      this.handleAlertTriggered(event.detail);
    });
    
    // Listen for history updates
    document.addEventListener('analysisHistoryUpdated', (event) => {
      this.handleHistoryUpdated(event.detail);
    });
    
    // Listen for scenario generation
    document.addEventListener('scenariosGenerated', (event) => {
      this.handleScenariosGenerated(event.detail);
    });
    
    // Listen for results display
    document.addEventListener('resultsDisplayed', (event) => {
      this.showEngagementFeatures(event.detail);
    });
  }
  
  /**
   * Initialize UI components
   */
  initializeComponents() {
    this.createEngagementPanel();
    this.createQuickActionsMenu();
    this.initializePortfolioEnhancements();
  }
  
  /**
   * Handle profile calculation completion
   * @param {Object} profileData - Calculated profile data
   */
  async handleProfileCalculated(profileData) {
    // Save to history
    if (this.historyManager) {
      await this.historyManager.saveAnalysis(profileData);
    }
    
    // Generate scenarios
    if (this.scenarioComparator) {
      await this.scenarioComparator.generateScenarios(
        profileData.type || profileData.profile, 
        profileData.formData || {}
      );
    }
    
    // Show engagement features
    setTimeout(() => {
      this.showEngagementFeatures(profileData);
    }, 1000);
  }
  
  /**
   * Show engagement features after results are displayed
   * @param {Object} data - Profile or results data
   */
  showEngagementFeatures(data) {
    this.showAlertButtons();
    this.showHistoryButton();
    this.showScenarioComparison();
    this.createEngagementNotifications();
  }
  
  /**
   * Show alert buttons on portfolio items
   */
  showAlertButtons() {
    const allocationItems = document.querySelectorAll('.allocation-item');
    
    allocationItems.forEach(item => {
      const cryptoElement = item.querySelector('[data-crypto]');
      if (cryptoElement && !item.querySelector('.alert-button')) {
        const crypto = cryptoElement.getAttribute('data-crypto');
        const button = this.createAlertButton(crypto);
        item.style.position = 'relative';
        item.appendChild(button);
      }
    });
  }
  
  /**
   * Create alert button for crypto
   * @param {string} crypto - Cryptocurrency symbol
   * @returns {HTMLElement} Alert button
   */
  createAlertButton(crypto) {
    const button = document.createElement('button');
    button.className = 'alert-button engagement-tooltip';
    button.innerHTML = '🔔';
    button.setAttribute('data-tooltip', `Criar alerta para ${crypto}`);
    button.onclick = (e) => {
      e.stopPropagation();
      this.showCreateAlertModal(crypto);
    };
    
    return button;
  }
  
  /**
   * Show create alert modal
   * @param {string} crypto - Cryptocurrency symbol
   */
  showCreateAlertModal(crypto) {
    if (this.alertSystem && this.alertSystem.showCreateAlertModal) {
      this.alertSystem.showCreateAlertModal(crypto);
    } else {
      this.createQuickAlertModal(crypto);
    }
  }
  
  /**
   * Create quick alert modal if alert system method not available
   * @param {string} crypto - Cryptocurrency symbol
   */
  createQuickAlertModal(crypto) {
    const modal = document.createElement('div');
    modal.className = 'alert-modal';
    modal.innerHTML = `
      <div class="alert-modal-backdrop" onclick="this.parentElement.remove()"></div>
      <div class="alert-modal-content">
        <div class="alert-modal-header">
          <h3>🔔 Criar Alerta - ${crypto}</h3>
          <button class="alert-modal-close" onclick="this.closest('.alert-modal').remove()">×</button>
        </div>
        <div class="alert-modal-body">
          <form id="quick-alert-form">
            <div class="form-group">
              <label>Tipo de Alerta:</label>
              <select name="condition" required>
                <option value="">Selecione...</option>
                <option value="above">Preço subir acima de</option>
                <option value="below">Preço descer abaixo de</option>
                <option value="change_percent">Variação de 24h (%)</option>
              </select>
            </div>
            <div class="form-group">
              <label id="value-label">Valor:</label>
              <input type="number" name="targetValue" placeholder="Ex: 50000" step="0.01" required>
              <small id="value-help" style="color: #7f8c8d; font-size: 12px;">Digite o preço em reais</small>
            </div>
            <div class="alert-modal-actions">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.alert-modal').remove()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Criar Alerta
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Update form based on condition selection
    const conditionSelect = modal.querySelector('select[name="condition"]');
    const valueLabel = modal.querySelector('#value-label');
    const valueHelp = modal.querySelector('#value-help');
    const valueInput = modal.querySelector('input[name="targetValue"]');
    
    conditionSelect.addEventListener('change', (e) => {
      if (e.target.value === 'change_percent') {
        valueLabel.textContent = 'Variação (%)';
        valueHelp.textContent = 'Digite a variação em % (ex: 10 para +10%, -5 para -5%)';
        valueInput.placeholder = 'Ex: 10';
        valueInput.step = '0.1';
      } else {
        valueLabel.textContent = 'Valor (R$)';
        valueHelp.textContent = 'Digite o preço em reais';
        valueInput.placeholder = 'Ex: 50000';
        valueInput.step = '0.01';
      }
    });
    
    // Handle form submission
    const form = modal.querySelector('#quick-alert-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const alertData = {
        crypto: crypto,
        condition: formData.get('condition'),
        targetValue: parseFloat(formData.get('targetValue')),
        source: 'ui_quick',
        priority: 'normal'
      };
      
      try {
        if (this.alertSystem) {
          await this.alertSystem.createAlert(alertData);
        }
        modal.remove();
        this.showSuccessNotification(`Alerta criado para ${crypto}!`);
      } catch (error) {
        this.showErrorNotification('Erro ao criar alerta: ' + error.message);
      }
    });
  }
  
  /**
   * Show history button
   */
  showHistoryButton() {
    if (document.querySelector('.history-button')) return;
    
    const actionsContainer = document.querySelector('.actions-container');
    if (actionsContainer) {
      const historyButton = document.createElement('button');
      historyButton.className = 'action-button tertiary history-button';
      historyButton.innerHTML = '📚 Ver Histórico';
      historyButton.onclick = () => this.showHistoryPanel();
      
      actionsContainer.appendChild(historyButton);
    }
  }
  
  /**
   * Show history panel
   */
  showHistoryPanel() {
    if (!this.historyManager) return;
    
    const existingPanel = document.querySelector('.history-panel');
    if (existingPanel) {
      existingPanel.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    const historyPanel = this.createHistoryPanel();
    resultsContainer.appendChild(historyPanel);
    
    // Scroll to history panel
    setTimeout(() => {
      historyPanel.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  
  /**
   * Create history panel
   * @returns {HTMLElement} History panel
   */
  createHistoryPanel() {
    const analyses = this.historyManager.getAnalysisHistory();
    const evolution = this.historyManager.getProfileEvolution();
    
    const panel = document.createElement('div');
    panel.className = 'history-panel';
    panel.innerHTML = `
      <div class="history-header">
        <h2 class="history-title">📚 Seu Histórico de Análises</h2>
        <div class="history-stats">
          <div class="history-stat">
            <div class="history-stat-value">${analyses.length}</div>
            <div>Análises</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-value">${evolution.mostCommonProfile}</div>
            <div>Perfil Comum</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-value">${evolution.consistency.score}%</div>
            <div>Consistência</div>
          </div>
        </div>
      </div>
      <div class="history-content">
        ${analyses.length > 0 ? this.createHistoryTimeline(analyses) : this.createEmptyHistoryMessage()}
      </div>
    `;
    
    return panel;
  }
  
  /**
   * Create history timeline
   * @param {Array} analyses - Analysis history
   * @returns {string} Timeline HTML
   */
  createHistoryTimeline(analyses) {
    const recentAnalyses = analyses.slice(0, 10); // Show last 10
    
    return `
      <div class="history-timeline">
        ${recentAnalyses.map(analysis => this.createHistoryItem(analysis)).join('')}
      </div>
      ${analyses.length > 10 ? `
        <div style="text-align: center; margin-top: 20px;">
          <button class="comparison-btn" onclick="window.engagementUI.showFullHistory()">
            Ver Todas as ${analyses.length} Análises
          </button>
        </div>
      ` : ''}
    `;
  }
  
  /**
   * Create history item
   * @param {Object} analysis - Analysis data
   * @returns {string} Item HTML
   */
  createHistoryItem(analysis) {
    return `
      <div class="history-item" data-analysis-id="${analysis.id}">
        <div class="history-item-header">
          <div class="history-profile">
            <span class="history-profile-badge">${analysis.profile}</span>
          </div>
          <span class="history-date">${analysis.date} ${analysis.time || ''}</span>
        </div>
        <div class="history-details">
          <div class="history-detail">
            <div class="history-detail-label">Objetivo</div>
            <div class="history-detail-value">${this.formatObjective(analysis.objective)}</div>
          </div>
          <div class="history-detail">
            <div class="history-detail-label">Risco</div>
            <div class="history-detail-value">${this.formatRisk(analysis.risk)}</div>
          </div>
          ${analysis.amount ? `
            <div class="history-detail">
              <div class="history-detail-label">Valor</div>
              <div class="history-detail-value">${this.formatAmount(analysis.amount)}</div>
            </div>
          ` : ''}
          ${analysis.experience ? `
            <div class="history-detail">
              <div class="history-detail-label">Experiência</div>
              <div class="history-detail-value">${this.formatExperience(analysis.experience)}</div>
            </div>
          ` : ''}
        </div>
        <div class="history-actions">
          <button class="history-action-btn" onclick="window.engagementUI.viewAnalysisDetails('${analysis.id}')">
            Ver Detalhes
          </button>
          <button class="history-action-btn" onclick="window.engagementUI.compareWithCurrent('${analysis.id}')">
            Comparar
          </button>
          <button class="history-action-btn" onclick="window.engagementUI.recreateAnalysis('${analysis.id}')">
            Recriar
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Create empty history message
   * @returns {string} Empty message HTML
   */
  createEmptyHistoryMessage() {
    return `
      <div style="text-align: center; padding: 40px; color: #7f8c8d;">
        <h3>📊 Comece Seu Histórico</h3>
        <p>Esta é sua primeira análise! Continue usando o consultor para construir seu histórico de investimentos.</p>
      </div>
    `;
  }
  
  /**
   * Show scenario comparison
   */
  showScenarioComparison() {
    if (!this.scenarioComparator) return;
    
    const scenarios = this.scenarioComparator.getAllScenarios();
    if (scenarios.length === 0) return;
    
    const existingPanel = document.querySelector('.scenarios-panel');
    if (existingPanel) return;
    
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    const scenariosPanel = this.createScenariosPanel(scenarios);
    resultsContainer.appendChild(scenariosPanel);
  }
  
  /**
   * Create scenarios panel
   * @param {Array} scenarios - Available scenarios
   * @returns {HTMLElement} Scenarios panel
   */
  createScenariosPanel(scenarios) {
    const panel = document.createElement('div');
    panel.className = 'scenarios-panel';
    panel.innerHTML = `
      <div class="scenarios-header">
        <h2 class="scenarios-title">🎬 Compare Cenários</h2>
        <p class="scenarios-subtitle">Veja como diferentes estratégias se comparam ao seu perfil</p>
      </div>
      <div class="scenarios-grid">
        ${scenarios.map(scenario => this.createScenarioCard(scenario)).join('')}
      </div>
      <div class="comparison-actions">
        <button class="comparison-btn" onclick="window.engagementUI.compareSelectedScenarios()">
          📊 Comparar Selecionados
        </button>
        <button class="comparison-btn primary" onclick="window.engagementUI.showDetailedComparison()">
          📈 Análise Detalhada
        </button>
      </div>
      <div id="comparison-results" class="comparison-results engagement-hidden"></div>
    `;
    
    return panel;
  }
  
  /**
   * Create scenario card
   * @param {Object} scenario - Scenario data
   * @returns {string} Card HTML
   */
  createScenarioCard(scenario) {
    const isRecommended = scenario.metadata.isRecommended;
    const allocation = Object.entries(scenario.allocation)
      .filter(([, percent]) => percent > 0)
      .sort(([, a], [, b]) => b - a);
    
    return `
      <div class="scenario-card ${isRecommended ? 'recommended' : ''}" 
           data-scenario-id="${scenario.id}"
           onclick="window.engagementUI.toggleScenarioSelection('${scenario.id}')">
        <div class="scenario-header">
          <h3 class="scenario-title">${scenario.metadata.title}</h3>
          <span class="scenario-score">${scenario.score}/100</span>
        </div>
        <p class="scenario-description">${scenario.metadata.description}</p>
        
        <div class="scenario-metrics">
          <div class="scenario-metric">
            <div class="scenario-metric-label">Retorno Esperado</div>
            <div class="scenario-metric-value positive">${scenario.expectedReturns.average}%</div>
          </div>
          <div class="scenario-metric">
            <div class="scenario-metric-label">Risco</div>
            <div class="scenario-metric-value">${scenario.riskMetrics.riskScore}/10</div>
          </div>
        </div>
        
        <div class="scenario-allocation">
          <div class="scenario-allocation-title">Distribuição:</div>
          <div class="scenario-allocation-bars">
            ${allocation.map(([crypto, percent]) => 
              `<div class="scenario-allocation-bar" 
                    style="width: ${percent}%; background: ${this.getCryptoColor(crypto)};"
                    title="${crypto}: ${percent}%"></div>`
            ).join('')}
          </div>
          <div style="font-size: 11px; color: #7f8c8d; margin-top: 4px;">
            ${allocation.slice(0, 3).map(([crypto, percent]) => `${crypto}: ${percent}%`).join(' • ')}
          </div>
        </div>
        
        <div class="scenario-pros-cons">
          <div class="scenario-pros">
            <h4>👍 Vantagens</h4>
            <ul>
              ${scenario.pros.slice(0, 2).map(pro => `<li>${pro}</li>`).join('')}
            </ul>
          </div>
          <div class="scenario-cons">
            <h4>⚠️ Cuidados</h4>
            <ul>
              ${scenario.cons.slice(0, 2).map(con => `<li>${con}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Toggle scenario selection
   * @param {string} scenarioId - Scenario ID
   */
  toggleScenarioSelection(scenarioId) {
    const card = document.querySelector(`[data-scenario-id="${scenarioId}"]`);
    if (!card) return;
    
    card.classList.toggle('selected');
    
    // Update comparison button state
    const selectedCards = document.querySelectorAll('.scenario-card.selected');
    const compareButton = document.querySelector('.comparison-btn');
    
    if (compareButton) {
      compareButton.disabled = selectedCards.length < 2;
      if (selectedCards.length >= 2) {
        compareButton.textContent = `📊 Comparar ${selectedCards.length} Cenários`;
      } else {
        compareButton.textContent = '📊 Comparar Selecionados';
      }
    }
  }
  
  /**
   * Compare selected scenarios
   */
  compareSelectedScenarios() {
    const selectedCards = document.querySelectorAll('.scenario-card.selected');
    if (selectedCards.length < 2) {
      this.showWarningNotification('Selecione pelo menos 2 cenários para comparar');
      return;
    }
    
    const scenarioIds = Array.from(selectedCards).map(card => 
      card.getAttribute('data-scenario-id')
    );
    
    try {
      const comparison = this.scenarioComparator.compareScenarios(scenarioIds);
      this.showComparisonResults(comparison);
    } catch (error) {
      this.showErrorNotification('Erro ao comparar cenários: ' + error.message);
    }
  }
  
  /**
   * Show comparison results
   * @param {Object} comparison - Comparison data
   */
  showComparisonResults(comparison) {
    const resultsContainer = document.querySelector('#comparison-results');
    if (!resultsContainer) return;
    
    resultsContainer.className = 'comparison-results';
    resultsContainer.innerHTML = `
      <h3 class="comparison-title">📊 Comparação de Cenários</h3>
      
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Cenário</th>
              <th>Retorno Esperado</th>
              <th>Risco</th>
              <th>Score</th>
              <th>Diversificação</th>
            </tr>
          </thead>
          <tbody>
            ${comparison.metrics.map(metric => `
              <tr>
                <td><strong>${metric.title}</strong></td>
                <td class="positive">${metric.expectedReturn}%</td>
                <td>${metric.riskScore}/10</td>
                <td>${metric.score}/100</td>
                <td>${metric.diversification}/10</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="comparison-recommendations">
        ${comparison.recommendations.map(rec => `
          <div class="comparison-recommendation">
            <h4>${this.getRecommendationIcon(rec.type)} ${rec.scenario}</h4>
            <p>${rec.reason}</p>
          </div>
        `).join('')}
      </div>
    `;
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }
  
  /**
   * Create engagement panel for quick access
   */
  createEngagementPanel() {
    const panel = document.createElement('div');
    panel.id = 'engagement-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      padding: 16px;
      z-index: 1000;
      display: none;
    `;
    
    panel.innerHTML = `
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #2c3e50;">
        🚀 Recursos Avançados
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button class="engagement-quick-btn" onclick="window.engagementUI.showHistoryPanel()">
          📚 Histórico
        </button>
        <button class="engagement-quick-btn" onclick="window.engagementUI.showAllAlerts()">
          🔔 Alertas
        </button>
        <button class="engagement-quick-btn" onclick="window.engagementUI.showScenarioComparison()">
          🎬 Cenários
        </button>
      </div>
    `;
    
    document.body.appendChild(panel);
  }
  
  /**
   * Create quick actions menu
   */
  createQuickActionsMenu() {
    // This will be shown after results are displayed
    // Implementation depends on UI layout
  }
  
  /**
   * Initialize portfolio enhancements
   */
  initializePortfolioEnhancements() {
    // Add event listeners for portfolio interactions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.allocation-item')) {
        const item = e.target.closest('.allocation-item');
        const crypto = item.querySelector('[data-crypto]')?.getAttribute('data-crypto');
        if (crypto && e.altKey) { // Alt+click for quick alert
          this.showCreateAlertModal(crypto);
        }
      }
    });
  }
  
  /**
   * Create engagement notifications for new users
   */
  createEngagementNotifications() {
    if (!this.historyManager) return;
    
    const analyses = this.historyManager.getAnalysisHistory();
    
    // Show tutorial for first-time users
    if (analyses.length === 1) {
      setTimeout(() => {
        this.showTutorialNotification();
      }, 3000);
    }
    
    // Show engagement tips for returning users
    if (analyses.length > 1 && analyses.length % 5 === 0) {
      setTimeout(() => {
        this.showMilestoneNotification(analyses.length);
      }, 2000);
    }
  }
  
  /**
   * Show tutorial notification for new users
   */
  showTutorialNotification() {
    this.showInfoNotification(`
      🎉 <strong>Bem-vindo!</strong><br>
      Agora você pode criar alertas de preço, ver seu histórico e comparar cenários!
      <br><small>Clique nos ícones 🔔 na carteira para criar alertas</small>
    `, 8000);
  }
  
  /**
   * Show milestone notification
   * @param {number} count - Number of analyses
   */
  showMilestoneNotification(count) {
    this.showInfoNotification(`
      🏆 <strong>Parabéns!</strong><br>
      Você completou ${count} análises! Continue evoluindo sua estratégia de investimento.
    `, 5000);
  }
  
  // Utility Methods
  
  /**
   * Format objective for display
   * @param {string} objective - Objective value
   * @returns {string} Formatted objective
   */
  formatObjective(objective) {
    const map = {
      'curtissimo': 'Curto',
      'moderado': 'Médio',
      'longo': 'Longo'
    };
    return map[objective] || objective;
  }
  
  /**
   * Format risk for display
   * @param {string} risk - Risk value
   * @returns {string} Formatted risk
   */
  formatRisk(risk) {
    const map = {
      'baixo': 'Baixo',
      'medio': 'Médio',
      'alto': 'Alto'
    };
    return map[risk] || risk;
  }
  
  /**
   * Format amount for display
   * @param {string} amount - Amount value
   * @returns {string} Formatted amount
   */
  formatAmount(amount) {
    const map = {
      'baixo': 'Até 1k',
      'medio-baixo': '1k-10k',
      'medio-alto': '10k-50k',
      'alto': '50k+'
    };
    return map[amount] || amount;
  }
  
  /**
   * Format experience for display
   * @param {string} experience - Experience value
   * @returns {string} Formatted experience
   */
  formatExperience(experience) {
    const map = {
      'iniciante': 'Iniciante',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado'
    };
    return map[experience] || experience;
  }
  
  /**
   * Get crypto color for visualization
   * @param {string} crypto - Crypto symbol
   * @returns {string} Color code
   */
  getCryptoColor(crypto) {
    const colors = {
      'BTC': '#f7931a',
      'ETH': '#627eea',
      'BNB': '#f3ba2f',
      'SOL': '#9945ff',
      'XRP': '#23292f',
      'PENDLE': '#ff6b9d',
      'SPX6900': '#8b5cf6'
    };
    return colors[crypto] || '#667eea';
  }
  
  /**
   * Get recommendation icon
   * @param {string} type - Recommendation type
   * @returns {string} Icon
   */
  getRecommendationIcon(type) {
    const icons = {
      'balanced': '⚖️',
      'conservative': '🛡️',
      'aggressive': '🚀'
    };
    return icons[type] || '💡';
  }
  
  // Notification Methods
  
  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {number} duration - Duration in ms
   */
  showSuccessNotification(message, duration = 3000) {
    this.showNotification(message, 'success', duration);
  }
  
  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {number} duration - Duration in ms
   */
  showErrorNotification(message, duration = 5000) {
    this.showNotification(message, 'error', duration);
  }
  
  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {number} duration - Duration in ms
   */
  showWarningNotification(message, duration = 4000) {
    this.showNotification(message, 'warning', duration);
  }
  
  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {number} duration - Duration in ms
   */
  showInfoNotification(message, duration = 4000) {
    this.showNotification(message, 'info', duration);
  }
  
  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {number} duration - Duration in ms
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `simple-notification notification-${type}`;
    notification.innerHTML = message;
    
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#667eea'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      max-width: 400px;
      padding: 16px 20px;
      background: ${colors[type]};
      color: white;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      z-index: 10000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideUp 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }
  
  // Event Handlers for UI Actions
  
  handleAlertTriggered(alertData) {
    // Handle when alerts are triggered
    console.log('🔔 UI handling triggered alert:', alertData);
  }
  
  handleHistoryUpdated(historyData) {
    // Update UI when history changes
    console.log('📚 UI handling history update:', historyData);
  }
  
  handleScenariosGenerated(scenarioData) {
    // Handle when scenarios are generated
    console.log('🎬 UI handling scenarios generated:', scenarioData);
  }
  
  /**
   * Get engagement UI status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasAlertSystem: !!this.alertSystem,
      hasHistoryManager: !!this.historyManager,
      hasScenarioComparator: !!this.scenarioComparator
    };
  }
}

// Auto-initialize engagement UI
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.engagementUI = new EngagementUI();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EngagementUI;
} else if (typeof window !== 'undefined') {
  window.EngagementUI = EngagementUI;
}