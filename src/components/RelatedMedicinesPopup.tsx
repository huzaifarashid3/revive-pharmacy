'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';

interface RelatedMedicinesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  formula: string;
  medicines: Medicine[];
}

export default function RelatedMedicinesPopup({ 
  isOpen, 
  onClose, 
  formula, 
  medicines
}: RelatedMedicinesPopupProps) {
  if (!isOpen) return null;

  const relatedMedicines = medicines.filter(
    medicine => 
      medicine.formula.toLowerCase() === formula.toLowerCase()
  );

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        color: 'text-red-400',
        bg: 'bg-red-900',
        border: 'border-red-500',
        icon: 'M6 18L18 6M6 6l12 12'
      };
    } else if (stock <= 10) {
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-900',
        border: 'border-yellow-500',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
      };
    } else {
      return {
        color: 'text-green-400',
        bg: 'bg-green-900',
        border: 'border-green-500',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Related Medicines</h3>
              <p className="text-green-100 text-sm mt-1">Formula: {formula}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {relatedMedicines.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-200 mb-2">No medicines found</h4>
              <p className="text-gray-400 text-sm">
                No medicines with formula &quot;{formula}&quot; found in the database.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Found {relatedMedicines.length} medicine{relatedMedicines.length === 1 ? '' : 's'} with formula &quot;{formula}&quot;:
              </p>
              
              {relatedMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.stock);
                return (
                  <div 
                    key={medicine.id}
                    className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{medicine.name}</h4>
                            <p className="text-xs text-gray-400">Medicine</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Dosage:</span>
                            <p className="text-gray-200">{medicine.dosage || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <p className="text-gray-200">{medicine.formulation || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${stockStatus.bg} ${stockStatus.color} border ${stockStatus.border}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stockStatus.icon} />
                        </svg>
                        {medicine.stock} in stock
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-700 border-t border-gray-600">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
