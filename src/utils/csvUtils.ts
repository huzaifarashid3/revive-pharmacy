import Papa from 'papaparse';
import { Medicine } from '@/types/medicine';

export interface CSVParseResult {
  validMedicines: Omit<Medicine, 'id'>[];
  errors: CSVError[];
  totalRows: number;
}

export interface CSVError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

// Expected CSV headers (exact spelling, case-sensitive)
export const REQUIRED_CSV_HEADERS = ['name', 'formula', 'dosage', 'formulation', 'stock'] as const;

/**
 * Parse CSV content and validate medicine data
 */
export function parseCSV(csvContent: string): CSVParseResult {
  const result: CSVParseResult = {
    validMedicines: [],
    errors: [],
    totalRows: 0
  };

  try {
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase()
    });

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach(error => {
        result.errors.push({
          row: error.row || 0,
          message: `Parse error: ${error.message}`
        });
      });
    }

    const data = parseResult.data as Record<string, string>[];
    result.totalRows = data.length;

    if (data.length === 0) {
      result.errors.push({
        row: 0,
        message: 'CSV file is empty or contains no valid data'
      });
      return result;
    }

    // Validate headers
    const headers = parseResult.meta.fields || [];
    const missingHeaders = REQUIRED_CSV_HEADERS.filter(
      header => !headers.includes(header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      result.errors.push({
        row: 0,
        message: `Missing required headers: ${missingHeaders.join(', ')}. Expected: ${REQUIRED_CSV_HEADERS.join(', ')}`
      });
      return result;
    }

    // Process each row
    data.forEach((row, index) => {
      const rowNumber = index + 1; // 1-based row numbering
      const medicine = validateMedicineRow(row, rowNumber);
      
      if (medicine.errors.length > 0) {
        result.errors.push(...medicine.errors);
      } else if (medicine.data) {
        result.validMedicines.push(medicine.data);
      }
    });

  } catch (error) {
    result.errors.push({
      row: 0,
      message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  return result;
}

/**
 * Validate a single medicine row
 */
function validateMedicineRow(row: Record<string, string>, rowNumber: number): {
  data?: Omit<Medicine, 'id'>;
  errors: CSVError[];
} {
  const errors: CSVError[] = [];
  
  // Check required field: name
  if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'Name is required and cannot be empty'
    });
    return { errors };
  }

  // Validate stock (optional, should be number)
  let stock = 0;
  if (row.stock !== undefined && row.stock !== '') {
    const stockValue = Number(row.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      errors.push({
        row: rowNumber,
        field: 'stock',
        message: 'Stock must be a non-negative number'
      });
      return { errors };
    }
    stock = Math.floor(stockValue); // Ensure integer
  }

  // Create valid medicine object
  const medicine: Omit<Medicine, 'id'> = {
    name: row.name.trim(),
    formula: (row.formula || '').trim(),
    dosage: (row.dosage || '').trim(),
    formulation: (row.formulation || '').trim(),
    stock: stock
  };

  return { data: medicine, errors };
}

/**
 * Export medicines to CSV format
 */
export function exportMedicinesToCSV(medicines: Medicine[]): string {
  const csvData = medicines.map(medicine => ({
    name: medicine.name,
    formula: medicine.formula,
    dosage: medicine.dosage,
    formulation: medicine.formulation,
    stock: medicine.stock
  }));

  return Papa.unparse(csvData, {
    header: true,
    columns: [...REQUIRED_CSV_HEADERS]
  });
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate CSV template with sample data
 */
export function generateCSVTemplate(): string {
  const sampleData = [
    {
      name: 'Paracetamol',
      formula: 'C8H9NO2',
      dosage: '500mg',
      formulation: 'Tablet',
      stock: 100
    },
    {
      name: 'Aspirin',
      formula: 'C9H8O4',
      dosage: '325mg',
      formulation: 'Tablet',
      stock: 50
    },
    {
      name: 'Ibuprofen',
      formula: 'C13H18O2',
      dosage: '400mg',
      formulation: 'Capsule',
      stock: 75
    }
  ];

  return Papa.unparse(sampleData, {
    header: true,
    columns: [...REQUIRED_CSV_HEADERS]
  });
}

/**
 * Get current date in YYYY-MM-DD format for filenames
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}
