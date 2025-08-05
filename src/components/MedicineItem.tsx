'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';

interface MedicineItemProps {
  medicine: Medicine;
  isAdmin: boolean;
  onEdit?: (medicine: Medicine) => void;
  onDelete?: (id: string) => void;
  onMedicineClick?: (medicine: Medicine) => void;
}

export default function MedicineItem({ medicine, isAdmin, onEdit, onDelete, onMedicineClick }: MedicineItemProps) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { 
      color: 'text-red-600', 
      bg: 'bg-red-100', 
      border: 'border-l-red-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
      label: 'Out of Stock' 
    };
    if (stock <= 5) return { 
      color: 'text-orange-600', 
      bg: 'bg-orange-100', 
      border: 'border-l-orange-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
      label: 'Low Stock' 
    };
    return { 
      color: 'text-green-600', 
      bg: 'bg-green-100', 
      border: 'border-l-green-500',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      label: 'In Stock' 
    };
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on admin buttons
    if (isAdmin && (e.target as Element).closest('button')) {
      return;
    }
    
    // Only filter if medicine has a formula
    if (medicine.formula.trim() && onMedicineClick) {
      onMedicineClick(medicine);
    }
  };

  const stockStatus = getStockStatus(medicine.stock);
  const hasFormula = medicine.formula.trim() !== '' && medicine.formula !== 'Not specified';

  return (
    <div 
      className={`bg-gray-800 border-l-4 ${stockStatus.border} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-700 ${
        hasFormula 
          ? 'cursor-pointer hover:border-green-500' 
          : ''
      }`}
      onClick={handleCardClick}
      title={hasFormula ? `Click to filter by formula: ${medicine.formula}` : undefined}
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{medicine.name}</h3>
                </div>
              </div>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${stockStatus.bg} ${stockStatus.color} shadow-sm`}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stockStatus.icon} />
                </svg>
                {medicine.stock} in stock
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-bold text-sm text-gray-200">Formula</span>
                </div>
                <p className={`text-sm ${hasFormula ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                  {medicine.formula || 'Not specified'}
                </p>
              </div>
              <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M10 11v6m4-6v6" />
                  </svg>
                  <span className="font-bold text-sm text-gray-200">Dosage</span>
                </div>
                <p className="text-sm text-gray-300">{medicine.dosage || 'Not specified'}</p>
              </div>
              <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
                  </svg>
                  <span className="font-bold text-sm text-gray-200">Type</span>
                </div>
                <p className="text-sm text-gray-300">{medicine.formulation || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 sm:mt-0 sm:ml-6 flex gap-2">
              <button
                onClick={() => onEdit?.(medicine)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all duration-200"
                title="Edit medicine"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete?.(medicine.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-all duration-200"
                title="Delete medicine"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
