import { Medicine } from '@/types/medicine';
import { DatabaseService } from '@/lib/database';

/**
 * STORAGE ARCHITECTURE:
 * 
 * 1. SUPABASE = SINGLE SOURCE OF TRUTH
 *    - All data operations (add/edit/delete) go directly to Supabase
 *    - Only admins can modify data through the UI
 * 
 * 2. LOCALSTORAGE = OFFLINE CACHE ONLY
 *    - Used only for reading when database is unavailable
 *    - Never pushes data back to Supabase
 *    - Gets refreshed from Supabase on each app load
 * 
 * 3. NO DEFAULT DATA
 *    - App shows exactly what's in Supabase
 *    - If Supabase is empty, app shows empty state
 */

const MEDICINES_KEY = 'pharmacy_medicines';
const ADMIN_SESSION_KEY = 'pharmacy_admin_session';
const LAST_SYNC_KEY = 'pharmacy_last_sync';

// Sync interval: 30 seconds
const SYNC_INTERVAL = 30 * 1000;

// Default medicines data (empty - no default data)
export const defaultMedicines: Medicine[] = [];

export const storageUtils = {
  // Check if we need to sync with database
  shouldSync(): boolean {
    if (typeof window === 'undefined') return false;
    
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (!lastSync) return true;
    
    const timeSinceSync = Date.now() - parseInt(lastSync);
    return timeSinceSync > SYNC_INTERVAL;
  },

  // Update last sync timestamp
  updateLastSync(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  },

  // Get medicines (database is source of truth, localStorage for offline only)
  async getMedicines(): Promise<Medicine[]> {
    if (typeof window === 'undefined') return [];

    try {
      // Always try database first - it's the source of truth
      const dbMedicines = await DatabaseService.getAllMedicines();
      
      // Cache in localStorage for offline access
      localStorage.setItem(MEDICINES_KEY, JSON.stringify(dbMedicines));
      this.updateLastSync();
      return dbMedicines;
    } catch {
      console.log('Database unavailable, using offline cache');
      
      // Only use localStorage when database is unavailable (offline mode)
      const stored = localStorage.getItem(MEDICINES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }

    // Return empty array if no data available
    return [];
  },

  // Remove sync to database - localStorage should never push to database
  async syncToDatabase(): Promise<void> {
    // No longer sync from localStorage to database
    // Database is the single source of truth
    console.log('Database is the source of truth - no sync from localStorage');
  },

  // Add medicine (database only - localStorage is just cache)
  async addMedicine(medicine: Medicine): Promise<boolean> {
    try {
      // Only add to database - it's the source of truth
      const dbMedicine = await DatabaseService.addMedicine(medicine);
      if (dbMedicine) {
        // Update localStorage cache
        const current = await this.getMedicines();
        const updated = [...current, dbMedicine];
        if (typeof window !== 'undefined') {
          localStorage.setItem(MEDICINES_KEY, JSON.stringify(updated));
          this.updateLastSync();
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to add medicine to database:', error);
      // Don't fallback to localStorage - database is source of truth
    }
    return false;
  },

  // Bulk add medicines (database only - localStorage is just cache)
  async addMedicinesBulk(medicines: Medicine[]): Promise<boolean> {
    try {
      // Only add to database - it's the source of truth
      const dbMedicines: Medicine[] = [];
      for (const medicine of medicines) {
        const dbMedicine = await DatabaseService.addMedicine(medicine);
        if (dbMedicine) {
          dbMedicines.push(dbMedicine);
        }
      }
      
      if (dbMedicines.length > 0) {
        // Update localStorage cache
        const current = await this.getMedicines();
        const updated = [...current, ...dbMedicines];
        if (typeof window !== 'undefined') {
          localStorage.setItem(MEDICINES_KEY, JSON.stringify(updated));
          this.updateLastSync();
        }
        return dbMedicines.length === medicines.length;
      }
    } catch (error) {
      console.error('Failed to bulk add medicines to database:', error);
      // Don't fallback to localStorage - database is source of truth
    }
    return false;
  },

  // Update medicine (database only - localStorage is just cache)
  async updateMedicine(updatedMedicine: Medicine): Promise<boolean> {
    try {
      // Only update in database - it's the source of truth
      const dbMedicine = await DatabaseService.updateMedicine(updatedMedicine.id, updatedMedicine);
      if (dbMedicine) {
        // Update localStorage cache
        const current = await this.getMedicines();
        const updated = current.map(med => med.id === updatedMedicine.id ? dbMedicine : med);
        if (typeof window !== 'undefined') {
          localStorage.setItem(MEDICINES_KEY, JSON.stringify(updated));
          this.updateLastSync();
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to update medicine in database:', error);
      // Don't fallback to localStorage - database is source of truth
    }
    return false;
  },

  // Delete medicine (database only - localStorage is just cache)
  async deleteMedicine(medicineId: string): Promise<boolean> {
    try {
      // Only delete from database - it's the source of truth
      const success = await DatabaseService.deleteMedicine(medicineId);
      if (success) {
        // Update localStorage cache
        const current = await this.getMedicines();
        const updated = current.filter(med => med.id !== medicineId);
        if (typeof window !== 'undefined') {
          localStorage.setItem(MEDICINES_KEY, JSON.stringify(updated));
          this.updateLastSync();
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to delete medicine from database:', error);
      // Don't fallback to localStorage - database is source of truth
    }
    return false;
  },

  // Admin session management (unchanged)
  getAdminSession(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        const now = Date.now();
        // Session expires after 1 hour
        if (now - session.timestamp < 3600000) {
          return session.isAdmin;
        } else {
          // Session expired, remove it
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
      return false;
    } catch (error) {
      console.error('Error reading admin session:', error);
      return false;
    }
  },

  setAdminSession(isAdmin: boolean): void {
    if (typeof window === 'undefined') return;
    
    try {
      const session = {
        isAdmin,
        timestamp: Date.now()
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving admin session:', error);
    }
  },

  clearAdminSession(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing admin session:', error);
    }
  },

  // Clear all localStorage data (useful for debugging/reset)
  clearAllLocalData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(MEDICINES_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(LAST_SYNC_KEY);
      console.log('All local data cleared');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  },

  // Force refresh from database (ignores cache)
  async forceRefreshFromDatabase(): Promise<Medicine[]> {
    if (typeof window === 'undefined') return [];

    try {
      const dbMedicines = await DatabaseService.getAllMedicines();
      localStorage.setItem(MEDICINES_KEY, JSON.stringify(dbMedicines));
      this.updateLastSync();
      return dbMedicines;
    } catch (error) {
      console.error('Failed to refresh from database:', error);
      return [];
    }
  }
};
