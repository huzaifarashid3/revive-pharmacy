import { Medicine } from '@/types/medicine';
import { DatabaseService } from '@/lib/database';

const MEDICINES_KEY = 'pharmacy_medicines';
const ADMIN_SESSION_KEY = 'pharmacy_admin_session';
const LAST_SYNC_KEY = 'pharmacy_last_sync';

// Sync interval: 30 seconds
const SYNC_INTERVAL = 30 * 1000;

// Default medicines data (for seeding and fallback)
export const defaultMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Panadol',
    formula: 'Paracetamol',
    dosage: '500 mg',
    formulation: 'Tablet',
    stock: 0 
  },
  {
    id: '2',
    name: 'Tylenol',
    formula: 'Paracetamol',
    dosage: '325 mg',
    formulation: 'Tablet',
    stock: 25
  },
  {
    id: '3',
    name: 'Calpol',
    formula: 'Paracetamol',
    dosage: '120 mg/5ml',
    formulation: 'Syrup',
    stock: 15
  },
  {
    id: '4',
    name: 'Aspirin',
    formula: 'Acetylsalicylic acid',
    dosage: '75 mg',
    formulation: 'Tablet',
    stock: 40
  },
  {
    id: '5',
    name: 'Ecospirin',
    formula: 'Acetylsalicylic acid',
    dosage: '150 mg',
    formulation: 'Tablet',
    stock: 8
  },
  {
    id: '6',
    name: 'Ibuprofen',
    formula: 'Ibuprofen',
    dosage: '200 mg',
    formulation: 'Capsule',
    stock: 3 
  },
  {
    id: '7',
    name: 'Advil',
    formula: 'Ibuprofen',
    dosage: '400 mg',
    formulation: 'Tablet',
    stock: 22
  },
  {
    id: '8',
    name: 'Brufen',
    formula: 'Ibuprofen',
    dosage: '600 mg',
    formulation: 'Tablet',
    stock: 12
  },
  {
    id: '9',
    name: 'Amoxicillin',
    formula: 'Amoxicillin',
    dosage: '250 mg',
    formulation: 'Capsule',
    stock: 2
  },
  {
    id: '10',
    name: 'Augmentin',
    formula: 'Amoxicillin',
    dosage: '500 mg',
    formulation: 'Tablet',
    stock: 18
  },
  {
    id: '11',
    name: 'Omeprazole',
    formula: 'Omeprazole',
    dosage: '20 mg',
    formulation: 'Tablet',
    stock: 30
  },
  {
    id: '12',
    name: 'Prilosec',
    formula: 'Omeprazole',
    dosage: '40 mg',
    formulation: 'Capsule',
    stock: 14
  },
  {
    id: '13',
    name: 'Losec',
    formula: 'Omeprazole',
    dosage: '10 mg',
    formulation: 'Tablet',
    stock: 0
  },
  {
    id: '14',
    name: 'Cetirizine',
    formula: 'Cetirizine',
    dosage: '10 mg',
    formulation: 'Tablet',
    stock: 35
  },
  {
    id: '15',
    name: 'Zyrtec',
    formula: 'Cetirizine',
    dosage: '5 mg/5ml',
    formulation: 'Syrup',
    stock: 20
  },
  {
    id: '16',
    name: 'Metformin',
    formula: 'Metformin',
    dosage: '500 mg',
    formulation: 'Tablet',
    stock: 45
  },
  {
    id: '17',
    name: 'Glucophage',
    formula: 'Metformin',
    dosage: '850 mg',
    formulation: 'Tablet',
    stock: 28
  }
];

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

  // Get medicines (try database first, fallback to localStorage)
  async getMedicines(): Promise<Medicine[]> {
    if (typeof window === 'undefined') return defaultMedicines;

    try {
      // Try to get from database first
      const dbMedicines = await DatabaseService.getAllMedicines();
      
      if (dbMedicines.length > 0) {
        // Update localStorage cache
        localStorage.setItem(MEDICINES_KEY, JSON.stringify(dbMedicines));
        this.updateLastSync();
        return dbMedicines;
      }
    } catch {
      console.log('Database unavailable, using localStorage');
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(MEDICINES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Final fallback to default data
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(defaultMedicines));
    return defaultMedicines;
  },

  // Sync localStorage medicines to database (for initial seed)
  async syncToDatabase(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const localMedicines = localStorage.getItem(MEDICINES_KEY);
      if (localMedicines) {
        const medicines = JSON.parse(localMedicines);
        const medicinesWithoutId = medicines.map(({ id: _, ...rest }: Medicine) => rest);
        await DatabaseService.seedDatabase(medicinesWithoutId);
      } else {
        // Seed with default data
        const medicinesWithoutId = defaultMedicines.map(({ id: _, ...rest }) => rest);
        await DatabaseService.seedDatabase(medicinesWithoutId);
      }
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  },

  // Add medicine (database first, localStorage backup)
  async addMedicine(medicine: Medicine): Promise<boolean> {
    try {
      // Try database first
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
    } catch {
      console.log('Database unavailable, using localStorage');
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const current = await this.getMedicines();
      const updated = [...current, medicine];
      localStorage.setItem(MEDICINES_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  },

  // Update medicine (database first, localStorage backup)
  async updateMedicine(updatedMedicine: Medicine): Promise<boolean> {
    try {
      // Try database first
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
    } catch {
      console.log('Database unavailable, using localStorage');
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const current = await this.getMedicines();
      const updated = current.map(med => med.id === updatedMedicine.id ? updatedMedicine : med);
      localStorage.setItem(MEDICINES_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  },

  // Delete medicine (database first, localStorage backup)
  async deleteMedicine(medicineId: string): Promise<boolean> {
    try {
      // Try database first
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
    } catch {
      console.log('Database unavailable, using localStorage');
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const current = await this.getMedicines();
      const updated = current.filter(med => med.id !== medicineId);
      localStorage.setItem(MEDICINES_KEY, JSON.stringify(updated));
      return true;
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
  }
};
