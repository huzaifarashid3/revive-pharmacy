'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import { exportMedicinesToCSV, downloadCSV, getCurrentDateString } from '@/utils/csvUtils';

interface CSVExportButtonProps {
  medicines: Medicine[];
  className?: string;
}

export default function CSVExportButton({ medicines, className = '' }: CSVExportButtonProps) {
  const handleExport = () => {
    try {
      const csvContent = exportMedicinesToCSV(medicines);
      const filename = `pharmacy-medicines-${getCurrentDateString()}.csv`;
      downloadCSV(csvContent, filename);
      
      // Show success notification (you can integrate with your notification system)
      console.log(`Exported ${medicines.length} medicines to ${filename}`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // Handle error (you can integrate with your error handling system)
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${className}`}
      title={`Export ${medicines.length} medicines to CSV`}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export CSV ({medicines.length})
    </button>
  );
}
