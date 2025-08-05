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
  existingMedicines: Medicine[];
}

export default function CSVUploadModal({ isOpen, onClose, onImport, existingMedicines }: CSVUploadModalProps) {
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const result = parseCSV(csvContent, existingMedicines);
        setParseResult(result);
      } catch (error) {
        console.error('Error processing file:', error);
        setParseResult({
          validMedicines: [],
          errors: [{ row: 0, message: 'Failed to read file. Please ensure it is a valid CSV file.' }],
          totalRows: 0,
          duplicates: []
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      setParseResult({
        validMedicines: [],
        errors: [{ row: 0, message: 'Failed to read file. Please try again.' }],
        totalRows: 0,
        duplicates: []
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  }, [existingMedicines]);

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
          totalRows: 0,
          duplicates: []
        });
      }
    }
  });

  const handleImport = async () => {
    if (!parseResult || parseResult.validMedicines.length === 0 || isUploading) return;
    
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');
    
    try {
      // Filter out duplicates before importing
      const { filterDuplicates } = await import('@/utils/csvUtils');
      const medicinesToImport = filterDuplicates(parseResult.validMedicines, parseResult.duplicates, true);
      
      if (medicinesToImport.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No medicines to import (all entries were duplicates).');
        return;
      }
      
      await onImport(medicinesToImport);
      
      const duplicateCount = parseResult.duplicates.length;
      const importedCount = medicinesToImport.length;
      
      let message = `Successfully imported ${importedCount} medicine(s)!`;
      if (duplicateCount > 0) {
        message += ` ${duplicateCount} duplicate(s) were skipped.`;
      }
      
      setUploadStatus('success');
      setUploadMessage(message);
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error importing medicines:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to import medicines. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Don't allow closing during upload
    if (isUploading) return;
    
    setParseResult(null);
    setIsProcessing(false);
    setIsUploading(false);
    setUploadStatus('idle');
    setUploadMessage('');
    setIsDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  const canImport = parseResult && parseResult.validMedicines.length > 0 && !isUploading;
  const showUploadArea = !parseResult && uploadStatus === 'idle';
  const showPreview = parseResult && uploadStatus === 'idle';
  const showUploadProgress = isUploading;
  const showUploadResult = uploadStatus !== 'idle';

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-2 md:p-4">
      <div className="relative bg-gray-800 rounded-lg md:rounded-2xl shadow-xl w-full max-w-5xl max-h-[98vh] md:max-h-[90vh] border border-gray-700 flex flex-col mt-2 md:mt-0">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Import Medicines from CSV</h3>
            <p className="text-gray-300 text-sm mt-1">
              {showUploadProgress && 'Importing medicines...'}
              {showUploadResult && uploadStatus === 'success' && 'Import completed successfully!'}
              {showUploadResult && uploadStatus === 'error' && 'Import failed'}
              {!showUploadProgress && !showUploadResult && 'Upload a CSV file to bulk import medicines'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className={`transition-colors ${
              isUploading 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Progress */}
          {showUploadProgress && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <div className="text-center">
                <h4 className="text-lg font-medium text-white mb-2">Importing Medicines</h4>
                <p className="text-gray-300">Please wait while we add your medicines to the database...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Importing {parseResult?.validMedicines.length} medicine(s)
                </p>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {showUploadResult && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                uploadStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {uploadStatus === 'success' ? (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <h4 className={`text-lg font-medium mb-2 ${
                  uploadStatus === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {uploadStatus === 'success' ? 'Import Successful' : 'Import Failed'}
                </h4>
                <p className="text-gray-300">{uploadMessage}</p>
                {uploadStatus === 'success' && (
                  <p className="text-sm text-gray-400 mt-2">This dialog will close automatically...</p>
                )}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {showUploadArea && (
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
          )}

          {/* Preview */}
          {showPreview && parseResult && (
            <CSVPreviewTable
              medicines={parseResult.validMedicines}
              errors={parseResult.errors}
              duplicates={parseResult.duplicates}
              totalRows={parseResult.totalRows}
            />
          )}

          {/* Processing indicator */}
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
            {parseResult && uploadStatus === 'idle' && (
              <span>
                Ready to import {parseResult.validMedicines.length} medicine(s)
                {parseResult.errors.length > 0 && ` • ${parseResult.errors.length} error(s) found`}
              </span>
            )}
            {isUploading && (
              <span className="text-blue-400">Importing medicines to database...</span>
            )}
            {uploadStatus === 'success' && (
              <span className="text-green-400">Import completed successfully!</span>
            )}
            {uploadStatus === 'error' && (
              <span className="text-red-400">Import failed. Please try again.</span>
            )}
          </div>
          
          {!showUploadProgress && !showUploadResult && (
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isUploading}
                className={`px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Cancel
              </button>
              {parseResult && (
                <button
                  onClick={() => {
                    setParseResult(null);
                    setUploadStatus('idle');
                    setUploadMessage('');
                  }}
                  disabled={isUploading}
                  className={`px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Upload Different File
                </button>
              )}
              <button
                onClick={handleImport}
                disabled={!canImport || isUploading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors flex items-center ${
                  isUploading
                    ? 'bg-blue-500 cursor-not-allowed'
                    : canImport
                    ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                {isUploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {isUploading ? 'Importing...' : `Import ${canImport ? parseResult?.validMedicines.length || 0 : 0} Medicine(s)`}
              </button>
            </div>
          )}
          
          {(showUploadResult && uploadStatus === 'error') && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUploadStatus('idle');
                  setUploadMessage('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
