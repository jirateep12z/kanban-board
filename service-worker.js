const CACHE_NAME = 'kanban-board-v1';

// Local assets - critical for offline functionality
const LOCAL_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/classes/Database.js',
  '/js/classes/TaskManager.js',
  '/js/classes/UIManager.js',
  '/js/classes/DragDropManager.js',
  '/js/classes/BoardManager.js',
  '/js/classes/TemplateManager.js',
  '/js/classes/RecurringTaskManager.js',
  '/js/classes/AnalyticsManager.js',
  '/js/classes/ThemeManager.js',
  '/js/classes/I18nManager.js',
  '/js/i18n/en.js',
  '/js/i18n/th.js',
  '/image/kanban_board.png'
];

// External resources - optional, cache with CORS mode
const EXTERNAL_RESOURCES = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/easymde/dist/easymde.min.css',
  'https://unpkg.com/easymde/dist/easymde.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&display=swap'
];

// Cache assets individually to prevent one failure from breaking all caching
async function CacheAssets(cache, urls, options = {}) {
  const results = await Promise.allSettled(
    urls.map(async url => {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          await cache.put(url, response);
          console.log(`[Service Worker] Cached: ${url}`);
        } else {
          console.warn(
            `[Service Worker] Failed to cache ${url}: ${response.status}`
          );
        }
      } catch (error) {
        console.warn(`[Service Worker] Error caching ${url}:`, error.message);
      }
    })
  );

  const failed_count = results.filter(r => r.status === 'rejected').length;
  if (failed_count > 0) {
    console.warn(`[Service Worker] ${failed_count} assets failed to cache`);
  }
}

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Caching local assets...');
        await CacheAssets(cache, LOCAL_ASSETS);
        console.log('[Service Worker] Caching external resources...');
        await CacheAssets(cache, EXTERNAL_RESOURCES, {
          mode: 'cors',
          cache: 'no-cache'
        });
        console.log('[Service Worker] Installation complete');
      } catch (error) {
        console.error('[Service Worker] Installation failed:', error);
      }
    })()
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cache_names => {
      return Promise.all(
        cache_names.map(cache_name => {
          if (cache_name !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache_name);
            return caches.delete(cache_name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) {
    return;
  }
  event.respondWith(
    (async () => {
      try {
        const cached_response = await caches.match(event.request);
        if (cached_response) {
          return cached_response;
        }
        try {
          const network_response = await fetch(event.request);
          if (
            network_response &&
            network_response.ok &&
            (network_response.type === 'basic' ||
              network_response.type === 'cors')
          ) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, network_response.clone());
          }
          return network_response;
        } catch (fetch_error) {
          console.warn(
            '[Service Worker] Fetch failed:',
            event.request.url,
            fetch_error.message
          );
          if (event.request.mode === 'navigate') {
            const fallback = await caches.match('/index.html');
            if (fallback) {
              return fallback;
            }
          }
          throw fetch_error;
        }
      } catch (error) {
        console.error('[Service Worker] Request failed:', error);
        throw error;
      }
    })()
  );
});
