import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      medicines: {
        Row: {
          id: string;
          name: string;
          formula: string | null;
          dosage: string | null;
          formulation: string | null;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          formula?: string | null;
          dosage?: string | null;
          formulation?: string | null;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          formula?: string | null;
          dosage?: string | null;
          formulation?: string | null;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
