'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import MedicineItem from './MedicineItem';

interface MedicineListProps {
  medicines: Medicine[];
  isAdmin: boolean;
  onEdit?: (medicine: Medicine) => void;
  onDelete?: (id: string) => void;
  onMedicineClick?: (medicine: Medicine) => void;
}

export default function MedicineList({ medicines, isAdmin, onEdit, onDelete, onMedicineClick }: MedicineListProps) {
  if (medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="bg-gray-800 rounded-3xl p-12 text-center border border-gray-700 shadow-2xl max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-200 mb-3">No medicines found</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            The pharmacy registry is empty. Add some medicines to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {medicines.map((medicine) => (
        <MedicineItem
          key={medicine.id}
          medicine={medicine}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onMedicineClick={onMedicineClick}
        />
      ))}
    </div>
  );
}
