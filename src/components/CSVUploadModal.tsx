'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Medicine } from '@/types/medicine';
import { parseCSV, CSVParseResult } from '@/utils/csvUtils';
import CSVPreviewTable from './CSVPreviewTable';
import CSVTemplateDownload from './CSVTemplateDownload';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (medicines: Omit<Medicine, 'id'>[]) => void;
}

export default function CSVUploadModal({ isOpen, onClose, onImport }: CSVUploadModalProps) {
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const result = parseCSV(csvContent);
        setParseResult(result);
      } catch (error) {
        console.error('Error processing file:', error);
        setParseResult({
          validMedicines: [],
          errors: [{ row: 0, message: 'Failed to read file. Please ensure it is a valid CSV file.' }],
          totalRows: 0
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      setParseResult({
        validMedicines: [],
        errors: [{ row: 0, message: 'Failed to read file. Please try again.' }],
        totalRows: 0
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: (fileRejections) => {
      setIsDragActive(false);
      const rejection = fileRejections[0];
      if (rejection) {
        const errorMessages = rejection.errors.map(e => e.message).join(', ');
        setParseResult({
          validMedicines: [],
          errors: [{ row: 0, message: `File rejected: ${errorMessages}` }],
          totalRows: 0
        });
      }
    }
  });

  const handleImport = async () => {
    if (!parseResult || parseResult.validMedicines.length === 0) return;
    
    try {
      await onImport(parseResult.validMedicines);
      handleClose();
    } catch (error) {
      console.error('Error importing medicines:', error);
    }
  };

  const handleClose = () => {
    setParseResult(null);
    setIsProcessing(false);
    setIsDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  const canImport = parseResult && parseResult.validMedicines.length > 0;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-2 md:p-4">
      <div className="relative bg-gray-800 rounded-lg md:rounded-2xl shadow-xl w-full max-w-5xl max-h-[98vh] md:max-h-[90vh] border border-gray-700 flex flex-col mt-2 md:mt-0">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Import Medicines from CSV</h3>
            <p className="text-gray-300 text-sm mt-1">Upload a CSV file to bulk import medicines</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!parseResult ? (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragActive || dropzoneIsDragActive
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">
                      {isDragActive || dropzoneIsDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Maximum file size: 5MB • Supported format: .csv
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Section */}
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-3">CSV Format Requirements</h4>
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">Your CSV file must have these exact headers (case-sensitive):</p>
                    <code className="bg-gray-800 px-2 py-1 rounded text-green-400 text-xs">
                      name,formula,dosage,formulation,stock
                    </code>
                  </div>
                  <div className="text-sm text-gray-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>name</strong>: Required - Medicine name</li>
                      <li><strong>formula</strong>: Optional - Chemical formula</li>
                      <li><strong>dosage</strong>: Optional - Dosage information</li>
                      <li><strong>formulation</strong>: Optional - Medicine type (tablet, capsule, etc.)</li>
                      <li><strong>stock</strong>: Optional - Stock quantity (defaults to 0)</li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <CSVTemplateDownload />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <CSVPreviewTable
              medicines={parseResult.validMedicines}
              errors={parseResult.errors}
              totalRows={parseResult.totalRows}
            />
          )}

          {isProcessing && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-300">Processing CSV file...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-700 space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-400">
            {parseResult && (
              <span>
                Ready to import {parseResult.validMedicines.length} medicine(s)
                {parseResult.errors.length > 0 && ` • ${parseResult.errors.length} error(s) found`}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            {parseResult && (
              <button
                onClick={() => {
                  setParseResult(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Upload Different File
              </button>
            )}
            <button
              onClick={handleImport}
              disabled={!canImport}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Import {canImport ? parseResult.validMedicines.length : 0} Medicine(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
