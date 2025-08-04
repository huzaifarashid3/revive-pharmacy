export interface Medicine {
  id: string;
  name: string;        // Required field
  formula: string;     // Optional
  dosage: string;      // Optional  
  formulation: string; // Optional
  stock: number;       // Optional, defaults to 0
}

export interface SearchFilters {
  query: string;
  searchBy: 'name' | 'formula' | 'both';
}
