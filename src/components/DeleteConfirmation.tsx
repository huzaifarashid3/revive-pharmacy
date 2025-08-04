'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medicine: Medicine | null;
}

export default function DeleteConfirmation({ 
  isOpen, 
  onClose, 
  onConfirm, 
  medicine 
}: DeleteConfirmationProps) {
  if (!isOpen || !medicine) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-900 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Delete Medicine</h3>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this medicine? This action cannot be undone.
            </p>
            
            {/* Medicine Details */}
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <h4 className="font-semibold text-white mb-2">{medicine.name}</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p><span className="font-medium">Formula:</span> {medicine.formula || 'Not specified'}</p>
                <p><span className="font-medium">Dosage:</span> {medicine.dosage || 'Not specified'}</p>
                <p><span className="font-medium">Formulation:</span> {medicine.formulation || 'Not specified'}</p>
                <p><span className="font-medium">Stock:</span> {medicine.stock}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors border border-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              Delete Medicine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
