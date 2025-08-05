'use client';

import React, { useState, useEffect } from 'react';
import { Medicine } from '@/types/medicine';

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  medicines: Medicine[];
}

export default function FilterPopup({ 
  isOpen, 
  onClose, 
  medicine,
  medicines
}: FilterPopupProps) {
  const [localFilters, setLocalFilters] = useState({
    formula: false,
    dosage: false,
    formulation: false,
  });

  // Reset filters when popup opens with new medicine
  useEffect(() => {
    if (isOpen && medicine) {
      setLocalFilters({
        formula: true,  // Formula filter is active by default
        dosage: false,
        formulation: false,
      });
    }
  }, [isOpen, medicine]);

  if (!isOpen || !medicine) return null;

  const toggleFilter = (filterType: 'formula' | 'dosage' | 'formulation') => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  // Calculate filtered medicines based on current selections
  const getFilteredMedicines = () => {
    return medicines.filter(med => {
      if (med.id === medicine.id) return true; // Always include the selected medicine
      
      const matchesFormula = !localFilters.formula || med.formula === medicine.formula;
      const matchesDosage = !localFilters.dosage || med.dosage === medicine.dosage;
      const matchesFormulation = !localFilters.formulation || med.formulation === medicine.formulation;
      
      // At least one filter must be active for other medicines to be included
      const hasActiveFilter = localFilters.formula || localFilters.dosage || localFilters.formulation;
      if (!hasActiveFilter) return false;
      
      return matchesFormula && matchesDosage && matchesFormulation;
    });
  };

  const filteredMedicines = getFilteredMedicines();

  const filterButtons = [
    {
      type: 'formula' as const,
      label: 'Formula',
      value: medicine.formula,
      isActive: localFilters.formula,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      type: 'dosage' as const,
      label: 'Dosage',
      value: medicine.dosage,
      isActive: localFilters.dosage,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      type: 'formulation' as const,
      label: 'Formulation',
      value: medicine.formulation,
      isActive: localFilters.formulation,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-800 rounded-2xl shadow-xl max-w-md w-full border border-gray-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-green-500 p-4 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Filter Medicines</h3>
              <p className="text-green-100 text-sm">{medicine.name}</p>
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

        {/* Horizontal Filter Buttons */}
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((button) => (
              <button
                key={button.type}
                onClick={() => toggleFilter(button.type)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  button.isActive
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                {button.icon}
                <span className="ml-1.5">{button.label}</span>
                {button.isActive && (
                  <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          {/* Filter count */}
          <div className="mt-3 text-sm text-gray-400">
            {filteredMedicines.length === 1 ? (
              'Select filters to find related medicines'
            ) : (
              `Found ${filteredMedicines.length} medicines`
            )}
          </div>
        </div>

        {/* Medicines List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredMedicines.map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  med.id === medicine.id
                    ? 'border-green-500 bg-green-500 bg-opacity-20'
                    : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold text-sm ${
                        med.id === medicine.id ? 'text-green-400' : 'text-white'
                      }`}>
                        {med.name}
                      </h4>
                      {med.id === medicine.id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      med.id === medicine.id ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {med.formula} • {med.dosage} • {med.formulation}
                    </p>
                    <div className={`flex items-center mt-2 text-xs ${
                      med.id === medicine.id ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Stock: {med.stock} units
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-700 rounded-b-2xl border-t border-gray-600 flex-shrink-0">
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
