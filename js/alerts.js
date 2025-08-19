// Real-Time Alert Management System
// Comprehensive alert system for price monitoring and user engagement

class AlertSystem {
  constructor() {
    this.alerts = this.loadAlerts();
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.priceAPI = null;
    this.notificationManager = null;
    this.checkInterval = 2 * 60 * 1000; // 2 minutes
    this.maxAlerts = 20; // Maximum alerts per user
    
    this.initializeAlertSystem();
  }
  
  /**
   * Initialize the alert system
   */
  async initializeAlertSystem() {
    // Wait for dependencies to be available
    await this.waitForDependencies();
    
    // Start monitoring if there are active alerts
    if (this.getActiveAlerts().length > 0) {
      this.startMonitoring();
    }
    
    // Check for triggered alerts on page load
    await this.checkAlertsOnLoad();
    
    // Setup UI event listeners
    this.setupUIEventListeners();
    
    console.log('🚨 Alert System initialized with', this.alerts.length, 'total alerts');
  }
  
  /**
   * Wait for required dependencies to be available
   */
  async waitForDependencies() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      if (window.cryptoFeatures?.priceAPI && window.cryptoFeatures?.notificationManager) {
        this.priceAPI = window.cryptoFeatures.priceAPI;
        this.notificationManager = window.cryptoFeatures.notificationManager;
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    console.warn('⚠️ Alert system dependencies not fully available');
  }
  
  /**
   * Setup UI event listeners for alert management
   */
  setupUIEventListeners() {
    // Listen for portfolio display events to show alert options
    document.addEventListener('portfolioDisplayed', (event) => {
      this.addAlertButtonsToPortfolio(event.detail);
    });
    
    // Listen for alert creation requests
    document.addEventListener('createAlert', (event) => {
      this.handleCreateAlertRequest(event.detail);
    });
  }
  
  /**
   * Create a new price alert
   * @param {Object} alertData - Alert configuration
   * @returns {Promise<Object>} Created alert
   */
  async createAlert(alertData) {
    // Validate alert data
    if (!this.validateAlertData(alertData)) {
      throw new Error('Invalid alert data provided');
    }
    
    // Check alert limit
    if (this.getActiveAlerts().length >= this.maxAlerts) {
      throw new Error(`Maximum ${this.maxAlerts} alerts allowed`);
    }
    
    const alert = {
      id: this.generateAlertId(),
      crypto: alertData.crypto.toUpperCase(),
      condition: alertData.condition, // 'above', 'below', 'change_percent'
      targetValue: parseFloat(alertData.targetValue),
      currentPrice: await this.getCurrentPrice(alertData.crypto),
      createdAt: Date.now(),
      triggeredAt: null,
      isActive: true,
      userProfile: alertData.userProfile || 'moderado',
      description: this.generateAlertDescription(alertData),
      source: alertData.source || 'manual', // 'manual', 'suggestion', 'auto'
      priority: alertData.priority || 'normal' // 'low', 'normal', 'high'
    };
    
    this.alerts.push(alert);
    this.saveAlerts();
    
    // Start monitoring if this is the first alert
    if (this.getActiveAlerts().length === 1) {
      this.startMonitoring();
    }
    
    // Show confirmation
    this.showAlertCreatedNotification(alert);
    
    // Track analytics
    if (window.cryptoFeatures?.analytics) {
      window.cryptoFeatures.analytics.trackEvent('alert_created', {
        crypto: alert.crypto,
        condition: alert.condition,
        targetValue: alert.targetValue,
        userProfile: alert.userProfile,
        source: alert.source
      });
    }
    
    console.log('🚨 Alert created:', alert);
    return alert;
  }
  
  /**
   * Validate alert data
   * @param {Object} alertData - Data to validate
   * @returns {boolean} Is valid
   */
  validateAlertData(alertData) {
    if (!alertData.crypto || !alertData.condition || !alertData.targetValue) {
      return false;
    }
    
    const validConditions = ['above', 'below', 'change_percent'];
    if (!validConditions.includes(alertData.condition)) {
      return false;
    }
    
    const targetValue = parseFloat(alertData.targetValue);
    if (isNaN(targetValue) || targetValue <= 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Generate alert description
   * @param {Object} alertData - Alert configuration
   * @returns {string} Human-readable description
   */
  generateAlertDescription(alertData) {
    const { crypto, condition, targetValue } = alertData;
    
    const descriptions = {
      'above': `Notificar quando ${crypto} subir acima de R$ ${this.formatCurrency(targetValue)}`,
      'below': `Notificar quando ${crypto} descer abaixo de R$ ${this.formatCurrency(targetValue)}`,
      'change_percent': `Notificar quando ${crypto} variar ${targetValue > 0 ? '+' : ''}${targetValue}% em 24h`
    };
    
    return descriptions[condition] || `Alerta para ${crypto}`;
  }
  
  /**
   * Get current price for a cryptocurrency
   * @param {string} crypto - Cryptocurrency symbol
   * @returns {Promise<number>} Current price in BRL
   */
  async getCurrentPrice(crypto) {
    if (!this.priceAPI) {
      console.warn('Price API not available');
      return 0;
    }
    
    try {
      const cryptoIds = [this.priceAPI.symbolToId(crypto)];
      const prices = await this.priceAPI.getPrices(cryptoIds);
      const cryptoId = this.priceAPI.symbolToId(crypto);
      return prices[cryptoId]?.brl || 0;
    } catch (error) {
      console.error('Error getting current price:', error);
      return 0;
    }
  }
  
  /**
   * Start price monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Initial check
    this.checkAllAlerts();
    
    // Set up interval checking
    this.monitoringInterval = setInterval(() => {
      this.checkAllAlerts();
    }, this.checkInterval);
    
    console.log('🔍 Alert monitoring started (checking every', this.checkInterval / 1000, 'seconds)');
  }
  
  /**
   * Stop price monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ Alert monitoring stopped');
  }
  
  /**
   * Check all active alerts
   */
  async checkAllAlerts() {
    if (!navigator.onLine || !this.priceAPI) {
      console.log('📶 Offline or API unavailable, skipping alert check');
      return;
    }
    
    const activeAlerts = this.getActiveAlerts();
    if (activeAlerts.length === 0) {
      this.stopMonitoring();
      return;
    }
    
    try {
      // Get unique cryptocurrencies to minimize API calls
      const uniqueCryptos = [...new Set(activeAlerts.map(alert => alert.crypto))];
      const cryptoIds = uniqueCryptos.map(crypto => this.priceAPI.symbolToId(crypto));
      
      console.log('🔍 Checking alerts for:', uniqueCryptos);
      const prices = await this.priceAPI.getPrices(cryptoIds);
      
      if (!prices) {
        console.warn('⚠️ No price data received');
        return;
      }
      
      // Check each alert
      for (const alert of activeAlerts) {
        await this.checkAlert(alert, prices);
      }
      
      // Save any changes
      this.saveAlerts();
      
    } catch (error) {
      console.error('❌ Error checking alerts:', error);
    }
  }
  
  /**
   * Check a specific alert
   * @param {Object} alert - Alert to check
   * @param {Object} prices - Current price data
   */
  async checkAlert(alert, prices) {
    const cryptoId = this.priceAPI.symbolToId(alert.crypto);
    const priceData = prices[cryptoId];
    
    if (!priceData) {
      console.warn(`⚠️ No price data for ${alert.crypto}`);
      return;
    }
    
    const currentPrice = priceData.brl;
    const shouldTrigger = this.evaluateAlertCondition(alert, currentPrice, priceData);
    
    if (shouldTrigger) {
      await this.triggerAlert(alert, currentPrice, priceData);
    }
  }
  
  /**
   * Evaluate if alert condition is met
   * @param {Object} alert - Alert configuration
   * @param {number} currentPrice - Current price
   * @param {Object} priceData - Complete price data
   * @returns {boolean} Should trigger
   */
  evaluateAlertCondition(alert, currentPrice, priceData) {
    switch (alert.condition) {
      case 'above':
        return currentPrice >= alert.targetValue;
      
      case 'below':
        return currentPrice <= alert.targetValue;
      
      case 'change_percent':
        const change24h = priceData.usd_24h_change || 0;
        if (alert.targetValue > 0) {
          return change24h >= alert.targetValue;
        } else {
          return change24h <= alert.targetValue;
        }
      
      default:
        return false;
    }
  }
  
  /**
   * Trigger an alert
   * @param {Object} alert - Alert that was triggered
   * @param {number} currentPrice - Current price
   * @param {Object} priceData - Complete price data
   */
  async triggerAlert(alert, currentPrice, priceData) {
    console.log('🔔 Triggering alert:', alert.id, alert.crypto, currentPrice);
    
    // Mark as triggered
    alert.triggeredAt = Date.now();
    alert.isActive = false;
    alert.triggerPrice = currentPrice;
    alert.triggerData = {
      price: currentPrice,
      change24h: priceData.usd_24h_change || 0,
      marketCap: priceData.usd_market_cap || 0
    };
    
    // Send push notification
    if (this.notificationManager) {
      await this.notificationManager.sendNotification(
        `🚨 Alerta: ${alert.crypto}`,
        {
          body: `${alert.description}\nPreço atual: ${this.formatCurrency(currentPrice)}`,
          icon: `/icons/${alert.crypto.toLowerCase()}.png`,
          tag: `alert-${alert.id}`,
          requireInteraction: true,
          data: {
            alertId: alert.id,
            crypto: alert.crypto,
            price: currentPrice,
            action: 'view_alert'
          },
          actions: [
            {
              action: 'view_exchange',
              title: 'Ver Exchange',
              icon: '/icons/action-exchange.png'
            },
            {
              action: 'create_new',
              title: 'Novo Alerta',
              icon: '/icons/action-new.png'
            }
          ]
        }
      );
    }
    
    // Show in-app notification
    this.showInAppNotification(alert, currentPrice);
    
    // Create suggested follow-up alerts
    this.createSuggestedAlerts(alert, currentPrice);
    
    // Track analytics
    if (window.cryptoFeatures?.analytics) {
      window.cryptoFeatures.analytics.trackEvent('alert_triggered', {
        crypto: alert.crypto,
        condition: alert.condition,
        targetValue: alert.targetValue,
        actualValue: currentPrice,
        timeToTrigger: alert.triggeredAt - alert.createdAt,
        priceChange: ((currentPrice - alert.currentPrice) / alert.currentPrice) * 100
      });
    }
    
    // Dispatch custom event for UI updates
    document.dispatchEvent(new CustomEvent('alertTriggered', {
      detail: { alert, currentPrice, priceData }
    }));
  }
  
  /**
   * Show in-app notification for triggered alert
   * @param {Object} alert - Triggered alert
   * @param {number} currentPrice - Current price
   */
  showInAppNotification(alert, currentPrice) {
    const notification = document.createElement('div');
    notification.className = 'alert-notification alert-triggered';
    notification.innerHTML = `
      <div class="alert-notification-content">
        <div class="alert-header">
          <span class="alert-icon">🚨</span>
          <span class="alert-title">Alerta Disparado!</span>
          <button class="alert-close" onclick="this.closest('.alert-notification').remove()">×</button>
        </div>
        <div class="alert-body">
          <div class="alert-crypto">
            <strong>${alert.crypto}</strong>
            <span class="alert-price">${this.formatCurrency(currentPrice)}</span>
          </div>
          <div class="alert-description">${alert.description}</div>
          <div class="alert-change">
            ${alert.triggerData?.change24h ? 
              `Variação 24h: ${alert.triggerData.change24h > 0 ? '+' : ''}${alert.triggerData.change24h.toFixed(2)}%` 
              : ''
            }
          </div>
        </div>
        <div class="alert-actions">
          <button class="btn btn-sm btn-primary" onclick="window.open('https://www.binance.com/pt-BR/trade/${alert.crypto}_BRL', '_blank')">
            Ver no Exchange
          </button>
          <button class="btn btn-sm btn-secondary" onclick="window.alertSystem.showCreateAlertModal('${alert.crypto}')">
            Novo Alerta
          </button>
        </div>
      </div>
    `;
    
    // Add styling
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 350px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      border-left: 4px solid #ff6b35;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 15 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 15000);
  }
  
  /**
   * Create suggested follow-up alerts
   * @param {Object} triggeredAlert - The alert that was triggered
   * @param {number} currentPrice - Current price
   */
  createSuggestedAlerts(triggeredAlert, currentPrice) {
    const suggestions = [];
    
    // Suggest reverse direction alert
    if (triggeredAlert.condition === 'above') {
      const suggestedPrice = currentPrice * 0.9; // 10% below current
      suggestions.push({
        crypto: triggeredAlert.crypto,
        condition: 'below',
        targetValue: suggestedPrice,
        source: 'suggestion',
        description: `Sugestão: Alerta de correção para ${triggeredAlert.crypto}`
      });
    } else if (triggeredAlert.condition === 'below') {
      const suggestedPrice = currentPrice * 1.1; // 10% above current
      suggestions.push({
        crypto: triggeredAlert.crypto,
        condition: 'above',
        targetValue: suggestedPrice,
        source: 'suggestion',
        description: `Sugestão: Alerta de recuperação para ${triggeredAlert.crypto}`
      });
    }
    
    // Store suggestions for user to see later
    const existingSuggestions = JSON.parse(localStorage.getItem('alert-suggestions') || '[]');
    existingSuggestions.push(...suggestions);
    localStorage.setItem('alert-suggestions', JSON.stringify(existingSuggestions));
    
    console.log('💡 Created', suggestions.length, 'suggested alerts');
  }
  
  /**
   * Check alerts on application load
   */
  async checkAlertsOnLoad() {
    const recentlyTriggered = this.alerts.filter(alert => 
      alert.triggeredAt && 
      (Date.now() - alert.triggeredAt) < (24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    if (recentlyTriggered.length > 0) {
      this.showRecentTriggeredAlertsNotification(recentlyTriggered);
    }
  }
  
  /**
   * Show notification for recently triggered alerts
   * @param {Array} alerts - Recently triggered alerts
   */
  showRecentTriggeredAlertsNotification(alerts) {
    if (alerts.length === 1) {
      const alert = alerts[0];
      this.showSimpleNotification(
        `🔔 Alerta recente: ${alert.crypto} atingiu ${this.formatCurrency(alert.triggerPrice)}`,
        'info'
      );
    } else {
      this.showSimpleNotification(
        `🔔 ${alerts.length} alertas foram disparados nas últimas 24h`,
        'info'
      );
    }
  }
  
  /**
   * Show simple notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   */
  showSimpleNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `simple-notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 300px;
      padding: 12px 16px;
      background: #667eea;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
  
  /**
   * Show alert creation confirmation
   * @param {Object} alert - Created alert
   */
  showAlertCreatedNotification(alert) {
    this.showSimpleNotification(
      `✅ Alerta criado para ${alert.crypto} - ${alert.description}`,
      'success'
    );
  }
  
  /**
   * Add alert buttons to portfolio display
   * @param {Object} portfolioData - Portfolio information
   */
  addAlertButtonsToPortfolio(portfolioData) {
    const allocationItems = document.querySelectorAll('.allocation-item');
    
    allocationItems.forEach(item => {
      const crypto = item.querySelector('[data-crypto]')?.getAttribute('data-crypto');
      if (crypto && !item.querySelector('.alert-button')) {
        const alertButton = document.createElement('button');
        alertButton.className = 'alert-button btn-small';
        alertButton.innerHTML = '🔔';
        alertButton.title = `Criar alerta para ${crypto}`;
        alertButton.onclick = () => this.showCreateAlertModal(crypto);
        
        item.appendChild(alertButton);
      }
    });
  }
  
  /**
   * Show create alert modal
   * @param {string} crypto - Cryptocurrency symbol
   */
  showCreateAlertModal(crypto) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'alert-modal';
    modal.innerHTML = `
      <div class="alert-modal-backdrop" onclick="this.parentElement.remove()"></div>
      <div class="alert-modal-content">
        <div class="alert-modal-header">
          <h3>Criar Alerta - ${crypto}</h3>
          <button class="alert-modal-close" onclick="this.closest('.alert-modal').remove()">×</button>
        </div>
        <div class="alert-modal-body">
          <form id="create-alert-form">
            <input type="hidden" name="crypto" value="${crypto}">
            
            <div class="form-group">
              <label>Tipo de Alerta:</label>
              <select name="condition" required>
                <option value="">Selecione...</option>
                <option value="above">Preço subir acima de</option>
                <option value="below">Preço descer abaixo de</option>
                <option value="change_percent">Variação de 24h</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Valor:</label>
              <input type="number" name="targetValue" placeholder="Ex: 50000" step="0.01" required>
            </div>
            
            <div class="form-group">
              <label>Prioridade:</label>
              <select name="priority">
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="low">Baixa</option>
              </select>
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
    
    // Add modal styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = modal.querySelector('#create-alert-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const alertData = {
        crypto: formData.get('crypto'),
        condition: formData.get('condition'),
        targetValue: formData.get('targetValue'),
        priority: formData.get('priority'),
        source: 'manual'
      };
      
      try {
        await this.createAlert(alertData);
        modal.remove();
      } catch (error) {
        alert('Erro ao criar alerta: ' + error.message);
      }
    });
  }
  
  /**
   * Get active alerts
   * @returns {Array} Active alerts
   */
  getActiveAlerts() {
    return this.alerts.filter(alert => alert.isActive);
  }
  
  /**
   * Get triggered alerts
   * @returns {Array} Triggered alerts
   */
  getTriggeredAlerts() {
    return this.alerts.filter(alert => alert.triggeredAt !== null);
  }
  
  /**
   * Delete an alert
   * @param {string} alertId - Alert ID to delete
   */
  deleteAlert(alertId) {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    this.saveAlerts();
    
    // Stop monitoring if no active alerts
    if (this.getActiveAlerts().length === 0) {
      this.stopMonitoring();
    }
    
    console.log('🗑️ Alert deleted:', alertId);
  }
  
  /**
   * Format currency value
   * @param {number} value - Value to format
   * @returns {string} Formatted currency
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  }
  
  /**
   * Generate unique alert ID
   * @returns {string} Unique ID
   */
  generateAlertId() {
    return 'alert_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  /**
   * Load alerts from storage
   * @returns {Array} Stored alerts
   */
  loadAlerts() {
    try {
      return JSON.parse(localStorage.getItem('crypto-alerts') || '[]');
    } catch (error) {
      console.error('Error loading alerts:', error);
      return [];
    }
  }
  
  /**
   * Save alerts to storage
   */
  saveAlerts() {
    try {
      localStorage.setItem('crypto-alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }
  
  /**
   * Get alert statistics
   * @returns {Object} Alert statistics
   */
  getAlertStats() {
    const active = this.getActiveAlerts();
    const triggered = this.getTriggeredAlerts();
    
    return {
      total: this.alerts.length,
      active: active.length,
      triggered: triggered.length,
      byType: {
        above: this.alerts.filter(a => a.condition === 'above').length,
        below: this.alerts.filter(a => a.condition === 'below').length,
        change_percent: this.alerts.filter(a => a.condition === 'change_percent').length
      },
      byCrypto: this.alerts.reduce((acc, alert) => {
        acc[alert.crypto] = (acc[alert.crypto] || 0) + 1;
        return acc;
      }, {}),
      isMonitoring: this.isMonitoring
    };
  }
  
  /**
   * Export alerts data
   * @returns {Object} Export data
   */
  exportData() {
    return {
      alerts: this.alerts,
      stats: this.getAlertStats(),
      exportDate: new Date().toISOString()
    };
  }
  
  /**
   * Clear all alerts
   */
  clearAllAlerts() {
    this.alerts = [];
    this.saveAlerts();
    this.stopMonitoring();
    console.log('🗑️ All alerts cleared');
  }
}

// Auto-initialize alert system
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.alertSystem = new AlertSystem();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlertSystem;
} else if (typeof window !== 'undefined') {
  window.AlertSystem = AlertSystem;
}