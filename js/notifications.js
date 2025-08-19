// Push Notifications System for Price Alerts
// Comprehensive notification management with price monitoring

class NotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = Notification.permission;
    this.priceAPI = new CryptoPriceAPI();
    this.alerts = new Map();
    this.checkInterval = null;
    this.registrationKey = 'crypto-consultor-notifications';
  }
  
  /**
   * Initialize notification system
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (!this.isSupported) {
      console.warn('⚠️ Notifications not supported in this browser');
      return false;
    }
    
    try {
      // Load existing alerts from storage
      await this.loadStoredAlerts();
      
      // Start monitoring if we have alerts
      if (this.alerts.size > 0) {
        this.startPriceMonitoring();
      }
      
      console.log('🔔 Notification manager initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      return false;
    }
  }
  
  /**
   * Request notification permission from user
   * @returns {Promise<boolean>} Permission granted
   */
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications not supported');
    }
    
    if (this.permission === 'granted') {
      return true;
    }
    
    if (this.permission === 'denied') {
      throw new Error('Notification permission denied. Please enable in browser settings.');
    }
    
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        throw new Error('Notification permission not granted');
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      throw error;
    }
  }
  
  /**
   * Send a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @returns {Promise<boolean>} Success status
   */
  async sendNotification(title, options = {}) {
    try {
      if (!await this.requestPermission()) {
        return false;
      }
      
      const defaultOptions = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'crypto-alert',
        renotify: false,
        requireInteraction: false,
        silent: false,
        data: {
          timestamp: Date.now(),
          url: window.location.origin,
          source: 'crypto-consultor'
        }
      };
      
      const notificationOptions = { ...defaultOptions, ...options };
      
      // Use Service Worker for better reliability
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, notificationOptions);
        console.log('🔔 Service Worker notification sent:', title);
      } else {
        new Notification(title, notificationOptions);
        console.log('🔔 Direct notification sent:', title);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return false;
    }
  }
  
  /**
   * Schedule a price alert
   * @param {string} crypto - Cryptocurrency symbol
   * @param {number} targetPrice - Target price in BRL
   * @param {string} direction - 'above' or 'below'
   * @param {Object} options - Additional options
   * @returns {string} Alert ID
   */
  async schedulePriceAlert(crypto, targetPrice, direction = 'above', options = {}) {
    const alertId = this.generateAlertId();
    
    const alert = {
      id: alertId,
      crypto: crypto.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      direction: direction.toLowerCase(),
      createdAt: Date.now(),
      isActive: true,
      triggered: false,
      options: {
        persistent: options.persistent || false,
        sound: options.sound !== false,
        vibrate: options.vibrate !== false,
        message: options.message || `${crypto} atingiu o preço alvo`,
        ...options
      }
    };
    
    // Validate alert
    if (!this.validateAlert(alert)) {
      throw new Error('Invalid alert configuration');
    }
    
    this.alerts.set(alertId, alert);
    await this.saveAlertsToStorage();
    
    // Start monitoring if not already running
    if (!this.checkInterval) {
      this.startPriceMonitoring();
    }
    
    console.log('⏰ Price alert scheduled:', alert);
    return alertId;
  }
  
  /**
   * Cancel a price alert
   * @param {string} alertId - Alert ID to cancel
   * @returns {boolean} Success status
   */
  async cancelAlert(alertId) {
    if (this.alerts.has(alertId)) {
      this.alerts.delete(alertId);
      await this.saveAlertsToStorage();
      
      // Stop monitoring if no alerts remain
      if (this.alerts.size === 0) {
        this.stopPriceMonitoring();
      }
      
      console.log('❌ Alert cancelled:', alertId);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all active alerts
   * @returns {Array} Array of active alerts
   */
  getActiveAlerts() {
    return Array.from(this.alerts.values()).filter(alert => alert.isActive && !alert.triggered);
  }
  
  /**
   * Get triggered alerts history
   * @returns {Array} Array of triggered alerts
   */
  getTriggeredAlerts() {
    return Array.from(this.alerts.values()).filter(alert => alert.triggered);
  }
  
  /**
   * Start price monitoring
   * @param {number} intervalMs - Check interval in milliseconds
   */
  startPriceMonitoring(intervalMs = 60000) { // Default: 1 minute
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    console.log(`🔍 Starting price monitoring (${intervalMs/1000}s interval)`);
    
    this.checkInterval = setInterval(async () => {
      await this.checkPriceAlerts();
    }, intervalMs);
    
    // Also check immediately
    this.checkPriceAlerts();
  }
  
  /**
   * Stop price monitoring
   */
  stopPriceMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️ Price monitoring stopped');
    }
  }
  
  /**
   * Check all price alerts
   */
  async checkPriceAlerts() {
    const activeAlerts = this.getActiveAlerts();
    
    if (activeAlerts.length === 0) {
      return;
    }
    
    try {
      // Get unique cryptos to minimize API calls
      const uniqueCryptos = [...new Set(activeAlerts.map(alert => alert.crypto))];
      const cryptoIds = uniqueCryptos.map(symbol => this.priceAPI.symbolToId(symbol));
      
      const prices = await this.priceAPI.getPrices(cryptoIds);
      
      if (!prices) {
        console.warn('⚠️ Could not fetch prices for alert checking');
        return;
      }
      
      console.log('💰 Checking alerts against current prices');
      
      for (const alert of activeAlerts) {
        const cryptoId = this.priceAPI.symbolToId(alert.crypto);
        const currentPrice = prices[cryptoId]?.brl;
        
        if (currentPrice && this.shouldTriggerAlert(alert, currentPrice)) {
          await this.triggerAlert(alert, currentPrice);
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking price alerts:', error);
    }
  }
  
  /**
   * Check if alert should be triggered
   * @param {Object} alert - Alert configuration
   * @param {number} currentPrice - Current price
   * @returns {boolean} Should trigger
   */
  shouldTriggerAlert(alert, currentPrice) {
    if (alert.direction === 'above') {
      return currentPrice >= alert.targetPrice;
    } else if (alert.direction === 'below') {
      return currentPrice <= alert.targetPrice;
    }
    return false;
  }
  
  /**
   * Trigger a price alert
   * @param {Object} alert - Alert to trigger
   * @param {number} currentPrice - Current price that triggered alert
   */
  async triggerAlert(alert, currentPrice) {
    try {
      const formattedPrice = this.priceAPI.formatPrice(currentPrice);
      const directionText = alert.direction === 'above' ? 'subiu para' : 'desceu para';
      
      // Send notification
      await this.sendNotification(
        `🚨 Alerta de Preço: ${alert.crypto}`,
        {
          body: `${alert.crypto} ${directionText} ${formattedPrice}`,
          tag: `price-alert-${alert.id}`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          vibrate: alert.options.vibrate ? [200, 100, 200, 100, 200] : [],
          silent: !alert.options.sound,
          requireInteraction: true,
          data: {
            alertId: alert.id,
            crypto: alert.crypto,
            price: currentPrice,
            targetPrice: alert.targetPrice,
            direction: alert.direction,
            timestamp: Date.now()
          },
          actions: [
            {
              action: 'view',
              title: 'Ver Análise',
              icon: '/icons/action-view.png'
            },
            {
              action: 'dismiss',
              title: 'Dispensar',
              icon: '/icons/action-dismiss.png'
            }
          ]
        }
      );
      
      // Update alert status
      alert.triggered = true;
      alert.triggeredAt = Date.now();
      alert.triggerPrice = currentPrice;
      
      // Remove alert if not persistent
      if (!alert.options.persistent) {
        alert.isActive = false;
      }
      
      await this.saveAlertsToStorage();
      
      console.log('🔔 Alert triggered:', {
        crypto: alert.crypto,
        targetPrice: alert.targetPrice,
        currentPrice: currentPrice,
        direction: alert.direction
      });
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('priceAlertTriggered', {
        detail: { alert, currentPrice }
      }));
      
    } catch (error) {
      console.error('❌ Error triggering alert:', error);
    }
  }
  
  /**
   * Validate alert configuration
   * @param {Object} alert - Alert to validate
   * @returns {boolean} Is valid
   */
  validateAlert(alert) {
    if (!alert.crypto || typeof alert.crypto !== 'string') {
      return false;
    }
    
    if (!alert.targetPrice || alert.targetPrice <= 0) {
      return false;
    }
    
    if (!['above', 'below'].includes(alert.direction)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Generate unique alert ID
   * @returns {string} Unique ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Save alerts to localStorage
   */
  async saveAlertsToStorage() {
    try {
      const alertsArray = Array.from(this.alerts.values());
      localStorage.setItem('crypto-price-alerts', JSON.stringify(alertsArray));
      console.log('💾 Alerts saved to storage');
    } catch (error) {
      console.error('❌ Error saving alerts to storage:', error);
    }
  }
  
  /**
   * Load alerts from localStorage
   */
  async loadStoredAlerts() {
    try {
      const stored = localStorage.getItem('crypto-price-alerts');
      if (stored) {
        const alertsArray = JSON.parse(stored);
        
        // Filter out old triggered alerts (older than 7 days)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const validAlerts = alertsArray.filter(alert => 
          alert.isActive || alert.triggeredAt > sevenDaysAgo
        );
        
        // Rebuild alerts map
        this.alerts.clear();
        validAlerts.forEach(alert => {
          this.alerts.set(alert.id, alert);
        });
        
        console.log(`📂 Loaded ${validAlerts.length} alerts from storage`);
      }
    } catch (error) {
      console.error('❌ Error loading alerts from storage:', error);
      this.alerts.clear();
    }
  }
  
  /**
   * Clear all alerts
   */
  async clearAllAlerts() {
    this.alerts.clear();
    this.stopPriceMonitoring();
    await this.saveAlertsToStorage();
    console.log('🗑️ All alerts cleared');
  }
  
  /**
   * Get notification statistics
   * @returns {Object} Stats object
   */
  getStats() {
    const allAlerts = Array.from(this.alerts.values());
    
    return {
      total: allAlerts.length,
      active: allAlerts.filter(a => a.isActive && !a.triggered).length,
      triggered: allAlerts.filter(a => a.triggered).length,
      monitoring: this.checkInterval !== null,
      permission: this.permission,
      supported: this.isSupported
    };
  }
  
  /**
   * Test notification (for debugging)
   */
  async testNotification() {
    return await this.sendNotification(
      '🧪 Teste de Notificação',
      {
        body: 'Se você viu isso, as notificações estão funcionando!',
        tag: 'test-notification',
        requireInteraction: false
      }
    );
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
} else {
  window.NotificationManager = NotificationManager;
}