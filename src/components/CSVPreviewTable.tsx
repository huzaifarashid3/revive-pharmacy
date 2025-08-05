'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import { CSVError } from '@/utils/csvUtils';

interface CSVPreviewTableProps {
  medicines: Omit<Medicine, 'id'>[];
  errors: CSVError[];
  totalRows: number;
}

export default function CSVPreviewTable({ medicines, errors, totalRows }: CSVPreviewTableProps) {
  const hasErrors = errors.length > 0;
  const validCount = medicines.length;
  const errorCount = errors.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-2">Import Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{totalRows}</div>
            <div className="text-gray-300">Total Rows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{validCount}</div>
            <div className="text-gray-300">Valid Medicines</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
            <div className="text-gray-300">Errors</div>
          </div>
        </div>
      </div>

      {/* Errors Section */}
      {hasErrors && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Errors Found
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-300 bg-red-900/30 rounded p-2">
                <span className="font-medium">Row {error.row}:</span> {error.message}
                {error.field && <span className="text-red-200"> (Field: {error.field})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valid Medicines Preview */}
      {validCount > 0 && (
        <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
          <div className="p-4 border-b border-gray-600">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Valid Medicines Preview {validCount > 5 && `(showing first 5 of ${validCount})`}
            </h4>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Formula</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dosage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {medicines.slice(0, 5).map((medicine, index) => (
                  <tr key={index} className="hover:bg-gray-600">
                    <td className="px-4 py-3 text-sm font-medium text-white">{medicine.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{medicine.formula || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{medicine.dosage || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{medicine.formulation || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{medicine.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-3">
            {medicines.slice(0, 5).map((medicine, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                <div className="font-medium text-white mb-2">{medicine.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <div><span className="text-gray-400">Formula:</span> {medicine.formula || '-'}</div>
                  <div><span className="text-gray-400">Stock:</span> {medicine.stock}</div>
                  <div><span className="text-gray-400">Dosage:</span> {medicine.dosage || '-'}</div>
                  <div><span className="text-gray-400">Type:</span> {medicine.formulation || '-'}</div>
                </div>
              </div>
            ))}
          </div>

          {validCount > 5 && (
            <div className="p-3 bg-gray-800 border-t border-gray-600 text-center text-sm text-gray-400">
              ... and {validCount - 5} more medicines
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {validCount === 0 && !hasErrors && (
        <div className="bg-gray-700 rounded-lg p-6 text-center border border-gray-600">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No valid data found</h3>
          <p className="text-gray-300">Please check your CSV format and try again.</p>
        </div>
      )}
    </div>
  );
}
