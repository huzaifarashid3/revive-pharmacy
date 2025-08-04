import { supabase } from './supabase';
import { Medicine } from '@/types/medicine';

export class DatabaseService {
  // Fetch all medicines from database
  static async getAllMedicines(): Promise<Medicine[]> {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching medicines:', error);
        return [];
      }

      // Convert database format to app format
      return data.map(item => ({
        id: item.id,
        name: item.name,
        formula: item.formula || '',
        dosage: item.dosage || '',
        formulation: item.formulation || '',
        stock: item.stock
      }));
    } catch (error) {
      console.error('Database connection error:', error);
      return [];
    }
  }

  // Add new medicine
  static async addMedicine(medicine: Omit<Medicine, 'id'>): Promise<Medicine | null> {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          name: medicine.name,
          formula: medicine.formula || null,
          dosage: medicine.dosage || null,
          formulation: medicine.formulation || null,
          stock: medicine.stock
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding medicine:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        formula: data.formula || '',
        dosage: data.dosage || '',
        formulation: data.formulation || '',
        stock: data.stock
      };
    } catch (error) {
      console.error('Database connection error:', error);
      return null;
    }
  }

  // Update existing medicine
  static async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine | null> {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({
          name: updates.name,
          formula: updates.formula || null,
          dosage: updates.dosage || null,
          formulation: updates.formulation || null,
          stock: updates.stock
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating medicine:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        formula: data.formula || '',
        dosage: data.dosage || '',
        formulation: data.formulation || '',
        stock: data.stock
      };
    } catch (error) {
      console.error('Database connection error:', error);
      return null;
    }
  }

  // Delete medicine
  static async deleteMedicine(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting medicine:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  // Seed database with initial data (run once)
  static async seedDatabase(medicines: Omit<Medicine, 'id'>[]): Promise<boolean> {
    try {
      const { data: existingMedicines } = await supabase
        .from('medicines')
        .select('id')
        .limit(1);

      // Only seed if database is empty
      if (existingMedicines && existingMedicines.length > 0) {
        console.log('Database already has data, skipping seed');
        return true;
      }

      const { error } = await supabase
        .from('medicines')
        .insert(medicines.map(med => ({
          name: med.name,
          formula: med.formula || null,
          dosage: med.dosage || null,
          formulation: med.formulation || null,
          stock: med.stock
        })));

      if (error) {
        console.error('Error seeding database:', error);
        return false;
      }

      console.log('Database seeded successfully');
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
}
