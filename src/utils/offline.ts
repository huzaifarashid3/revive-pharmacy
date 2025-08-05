interface OfflineOperation {
  type: string;
  data: unknown;
  timestamp: number;
  id: string;
}

// Enhanced offline storage utilities
export const offlineUtils = {
  // Store offline queue of operations
  addToOfflineQueue(operation: Omit<OfflineOperation, 'timestamp' | 'id'>) {
    const queue = this.getOfflineQueue();
    queue.push({
      ...operation,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
    localStorage.setItem('offline_queue', JSON.stringify(queue));
  },

  getOfflineQueue() {
    try {
      const queue = localStorage.getItem('offline_queue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error reading offline queue:', error);
      return [];
    }
  },

  clearOfflineQueue() {
    localStorage.removeItem('offline_queue');
  },

  // Check if app is in offline mode
  isOffline() {
    return !navigator.onLine;
  },

  // Process offline queue when back online
  async processOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline operations...`);
    
    // Process each operation
    for (const operation of queue) {
      try {
        // Here you would replay the operation to the database
        console.log('Processing offline operation:', operation);
      } catch (error) {
        console.error('Failed to process offline operation:', operation, error);
      }
    }

    // Clear queue after processing
    this.clearOfflineQueue();
  },

  // Enhanced cache management
  cacheData(key: string, data: unknown) {
    try {
      const cached = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cached));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  },

  getCachedData(key: string, maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cached data:', error);
      return null;
    }
  }
};
