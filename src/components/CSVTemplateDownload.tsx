'use client';

import React from 'react';
import { generateCSVTemplate, downloadCSV } from '@/utils/csvUtils';

interface CSVTemplateDownloadProps {
  className?: string;
}

export default function CSVTemplateDownload({ className = '' }: CSVTemplateDownloadProps) {
  const handleDownloadTemplate = () => {
    try {
      const templateContent = generateCSVTemplate();
      downloadCSV(templateContent, 'pharmacy-template.csv');
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  return (
    <button
      onClick={handleDownloadTemplate}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors border border-gray-600 ${className}`}
      title="Download CSV template with sample data"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download Template
    </button>
  );
}
