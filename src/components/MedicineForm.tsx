'use client';

import React, { useState, useEffect } from 'react';
import { Medicine } from '@/types/medicine';

interface MedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medicine: Omit<Medicine, 'id'>) => void;
  onBulkAdd?: () => void;
  onCSVImport?: () => void;
  editMedicine?: Medicine | null;
  title?: string;
}

export default function MedicineForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onBulkAdd,
  onCSVImport,
  editMedicine = null,
  title 
}: MedicineFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    formula: '',
    dosage: '',
    formulation: '',
    stock: 0
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or edit medicine changes
  useEffect(() => {
    if (isOpen) {
      if (editMedicine) {
        setFormData({
          name: editMedicine.name,
          formula: editMedicine.formula,
          dosage: editMedicine.dosage,
          formulation: editMedicine.formulation,
          stock: editMedicine.stock
        });
      } else {
        setFormData({
          name: '',
          formula: '',
          dosage: '',
          formulation: '',
          stock: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, editMedicine]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required';
    }

    // Stock must be a non-negative number
    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      formula: '',
      dosage: '',
      formulation: '',
      stock: 0
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  const modalTitle = title || (editMedicine ? 'Edit Medicine' : 'Add New Medicine');

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">{modalTitle}</h3>
              {!editMedicine && (onBulkAdd || onCSVImport) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {onBulkAdd && (
                    <button
                      type="button"
                      onClick={onBulkAdd}
                      className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Switch to Bulk Add
                    </button>
                  )}
                  {onCSVImport && (
                    <button
                      type="button"
                      onClick={onCSVImport}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Import from CSV
                    </button>
                  )}
                </div>
              )}
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Medicine Name - Required */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Medicine Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="e.g., Panadol"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Formula */}
            <div className="mb-4">
              <label htmlFor="formula" className="block text-sm font-medium text-gray-200 mb-2">
                Formula
              </label>
              <input
                type="text"
                id="formula"
                value={formData.formula}
                onChange={(e) => handleInputChange('formula', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400"
                placeholder="e.g., Paracetamol"
              />
            </div>

            {/* Dosage */}
            <div className="mb-4">
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-200 mb-2">
                Dosage
              </label>
              <input
                type="text"
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400"
                placeholder="e.g., 500 mg"
              />
            </div>

            {/* Formulation */}
            <div className="mb-4">
              <label htmlFor="formulation" className="block text-sm font-medium text-gray-200 mb-2">
                Formulation
              </label>
              <select
                id="formulation"
                value={formData.formulation}
                onChange={(e) => handleInputChange('formulation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-700"
              >
                <option value="">Select formulation</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Cream">Cream</option>
                <option value="Ointment">Ointment</option>
                <option value="Drops">Drops</option>
                <option value="Powder">Powder</option>
              </select>
            </div>

            {/* Stock */}
            <div className="mb-6">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-200 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                value={formData.stock === 0 ? '' : formData.stock}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('stock', value === '' ? 0 : parseInt(value) || 0);
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400 ${
                  errors.stock ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0"
                min="0"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-400">{errors.stock}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors border border-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : (editMedicine ? 'Update Medicine' : 'Add Medicine')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
