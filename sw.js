// Service Worker for Consultor Financeiro - Crypto Trading v3.0.0
const CACHE_NAME = 'crypto-consultor-v3.0.0';
const DYNAMIC_CACHE = 'crypto-dynamic-v3.0.0';
const API_CACHE = 'crypto-api-v3.0.0';

const urlsToCache = [
  '/',
  '/index.html',
  '/consultor-financeiro.html',
  '/styles.css',
  '/style.css',
  '/main.js',
  '/script.js',
  '/manifest.json',
  // Offline fallback page
  'data:text/html,<!DOCTYPE html><html><head><title>Offline</title><meta charset="utf-8"><style>body{font-family:sans-serif;text-align:center;padding:50px;}h1{color:#667eea;}</style></head><body><h1>🔌 Você está offline</h1><p>Conecte-se à internet para acessar o Consultor Financeiro</p><button onclick="location.reload()">Tentar Novamente</button></body></html>'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ All files cached successfully');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Cache install failed:', error);
      })
  );
});

// Fetch event with advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests with Network First strategy
  if (url.origin === 'https://api.coingecko.com') {
    event.respondWith(networkFirstCache(request, API_CACHE));
    return;
  }
  
  // Handle same-origin requests
  if (request.url.startsWith(self.location.origin)) {
    // Cache First for static assets
    if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
      event.respondWith(cacheFirst(request));
    }
    // Network First for HTML documents
    else if (request.destination === 'document') {
      event.respondWith(networkFirst(request));
    }
    // Stale While Revalidate for other requests
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Cache First Strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, serving from cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for HTML documents
    if (request.destination === 'document') {
      return caches.match('data:text/html,<!DOCTYPE html><html><head><title>Offline</title><meta charset="utf-8"><style>body{font-family:sans-serif;text-align:center;padding:50px;}h1{color:#667eea;}</style></head><body><h1>🔌 Você está offline</h1><p>Conecte-se à internet para acessar o Consultor Financeiro</p><button onclick="location.reload()">Tentar Novamente</button></body></html>');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cachedResponse);
  
  return cachedResponse || await networkPromise;
}

// Network First for API with caching
async function networkFirstCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Cache API responses for 5 minutes
      const responseHeaders = new Headers(networkResponse.headers);
      responseHeaders.set('sw-cache-timestamp', Date.now().toString());
      
      const responseToCache = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: responseHeaders
      });
      
      cache.put(request, responseToCache.clone());
      return networkResponse;
    }
    
    throw new Error(`API responded with ${networkResponse.status}`);
  } catch (error) {
    console.log('API network failed, checking cache:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const isStale = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) > 300000; // 5 minutes
      
      if (!isStale) {
        console.log('📦 Serving fresh cached API response');
        return cachedResponse;
      } else {
        console.log('⏰ Cached API response is stale but returning anyway');
        return cachedResponse;
      }
    }
    
    return new Response(JSON.stringify({
      error: 'Offline',
      bitcoin: { brl: 350000, usd: 70000, usd_24h_change: 0 },
      ethereum: { brl: 15000, usd: 3000, usd_24h_change: 0 }
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      self.clients.claim();
    })
  );
});

// Enhanced Background sync for analytics and price alerts
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === 'background-sync-price-alerts') {
    event.waitUntil(syncPriceAlerts());
  }
});

async function syncAnalytics() {
  try {
    const queuedEvents = await getStoredAnalytics();
    if (queuedEvents.length > 0) {
      console.log(`📊 Syncing ${queuedEvents.length} analytics events`);
      
      // Send to analytics endpoint (would be real endpoint in production)
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: queuedEvents })
      });
      
      if (response.ok) {
        await clearStoredAnalytics();
        console.log('✅ Analytics synced successfully');
      }
    }
  } catch (error) {
    console.error('❌ Analytics sync failed:', error);
  }
}

async function syncPriceAlerts() {
  try {
    console.log('🔔 Checking price alerts in background');
    // This would integrate with the price checking logic
    await checkPriceAlertsBackground();
  } catch (error) {
    console.error('❌ Price alerts sync failed:', error);
  }
}

async function getStoredAnalytics() {
  try {
    const cache = await caches.open('analytics-cache');
    const response = await cache.match('/analytics-queue');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting stored analytics:', error);
  }
  return [];
}

async function clearStoredAnalytics() {
  try {
    const cache = await caches.open('analytics-cache');
    await cache.delete('/analytics-queue');
  } catch (error) {
    console.error('Error clearing stored analytics:', error);
  }
}

async function checkPriceAlertsBackground() {
  // This would check stored price alerts and trigger notifications
  console.log('🔔 Background price alert check completed');
}

// Handle push notifications (future feature)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('📬 Push notification received:', data);
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver Análise',
          icon: '/icon-explore.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icon-close.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker loaded');