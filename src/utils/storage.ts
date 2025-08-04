import { Medicine } from '@/types/medicine';

const STORAGE_KEY = 'pharmacy_medicines';
const ADMIN_SESSION_KEY = 'pharmacy_admin_session';

// Default mock data for initial setup
const defaultMedicines: Medicine[] = [
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
  // Get all medicines from localStorage
  getMedicines: (): Medicine[] => {
    if (typeof window === 'undefined') return defaultMedicines;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with default data if nothing exists
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMedicines));
        return defaultMedicines;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading medicines from localStorage:', error);
      return defaultMedicines;
    }
  },

  // Save medicines to localStorage
  saveMedicines: (medicines: Medicine[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    } catch (error) {
      console.error('Error saving medicines to localStorage:', error);
    }
  },

  // Add a new medicine
  addMedicine: (medicine: Omit<Medicine, 'id'>): Medicine => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString() // Simple ID generation
    };
    
    const medicines = storageUtils.getMedicines();
    medicines.push(newMedicine);
    storageUtils.saveMedicines(medicines);
    
    return newMedicine;
  },

  // Update an existing medicine
  updateMedicine: (id: string, updates: Partial<Medicine>): Medicine | null => {
    const medicines = storageUtils.getMedicines();
    const index = medicines.findIndex(m => m.id === id);
    
    if (index === -1) return null;
    
    medicines[index] = { ...medicines[index], ...updates };
    storageUtils.saveMedicines(medicines);
    
    return medicines[index];
  },

  // Delete a medicine
  deleteMedicine: (id: string): boolean => {
    const medicines = storageUtils.getMedicines();
    const filteredMedicines = medicines.filter(m => m.id !== id);
    
    if (filteredMedicines.length === medicines.length) return false;
    
    storageUtils.saveMedicines(filteredMedicines);
    return true;
  },

  // Admin session management
  setAdminSession: (isAdmin: boolean): void => {
    if (typeof window === 'undefined') return;
    
    if (isAdmin) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  },

  getAdminSession: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }
};
