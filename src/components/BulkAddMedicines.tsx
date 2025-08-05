'use client';

import React, { useState } from 'react';
import { Medicine } from '@/types/medicine';

interface MedicineRow {
  id: string;
  name: string;
  formula: string;
  dosage: string;
  formulation: string;
  stock: number;
  errors: { [key: string]: string };
}

interface BulkAddMedicinesProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medicines: Omit<Medicine, 'id'>[]) => void;
}

export default function BulkAddMedicines({
  isOpen,
  onClose,
  onSubmit
}: BulkAddMedicinesProps) {
  const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([
    {
      id: Date.now().toString(),
      name: '',
      formula: '',
      dosage: '',
      formulation: '',
      stock: 0,
      errors: {}
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createNewRow = (): MedicineRow => ({
    id: (Date.now() + Math.random()).toString(),
    name: '',
    formula: '',
    dosage: '',
    formulation: '',
    stock: 0,
    errors: {}
  });

  const addRow = () => {
    setMedicineRows(prev => [...prev, createNewRow()]);
  };

  const removeRow = (id: string) => {
    if (medicineRows.length > 1) {
      setMedicineRows(prev => prev.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof Omit<MedicineRow, 'id' | 'errors'>, value: string | number) => {
    setMedicineRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        // Clear errors for this field
        if (row.errors[field]) {
          updatedRow.errors = { ...row.errors, [field]: '' };
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const validateRows = (): boolean => {
    let isValid = true;
    const updatedRows = medicineRows.map(row => {
      const errors: { [key: string]: string } = {};

      // Name is required
      if (!row.name.trim()) {
        errors.name = 'Required';
        isValid = false;
      }

      // Stock must be non-negative
      if (row.stock < 0) {
        errors.stock = 'Cannot be negative';
        isValid = false;
      }

      return { ...row, errors };
    });

    setMedicineRows(updatedRows);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateRows()) return;

    // Filter out empty rows (rows with no name)
    const validMedicines = medicineRows
      .filter(row => row.name.trim())
      .map(row => ({
        name: row.name.trim(),
        formula: row.formula.trim(),
        dosage: row.dosage.trim(),
        formulation: row.formulation,
        stock: row.stock
      }));

    if (validMedicines.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      onSubmit(validMedicines);
      handleClose();
    } catch (error) {
      console.error('Error submitting bulk medicines:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMedicineRows([createNewRow()]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start md:items-center justify-center p-2 md:p-4">
      <div className="relative bg-gray-800 rounded-lg md:rounded-2xl shadow-xl w-full max-w-7xl max-h-[98vh] md:max-h-[90vh] border border-gray-700 flex flex-col mt-2 md:mt-0">
        {/* Header */}
        <div className="bg-green-500 p-3 md:p-4 rounded-t-lg md:rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-white truncate">Bulk Add Medicines</h3>
              <p className="text-green-100 text-sm mt-1">Add multiple medicines at once</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-green-100 transition-colors p-1 ml-2 flex-shrink-0"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Instructions */}
          <div className="p-3 md:p-4 bg-gray-750 border-b border-gray-700">
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
              Fill in the medicine details below. Medicine name is required for each row. Click &quot;Add Medicine Row&quot; to add more medicines.
            </p>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto p-3 md:p-4">
            {/* Desktop View */}
            <div className="hidden md:block min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 mb-3 text-xs font-medium text-gray-300 uppercase tracking-wide">
                <div className="col-span-3">Medicine Name *</div>
                <div className="col-span-2">Formula</div>
                <div className="col-span-2">Dosage</div>
                <div className="col-span-2">Formulation</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-1">Action</div>
              </div>

              {/* Medicine Rows */}
              <div className="space-y-3">
                {medicineRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-start">
                    {/* Medicine Name */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        className={`w-full px-2 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400 ${row.errors.name ? 'border-red-500' : 'border-gray-600'
                          }`}
                        placeholder="e.g., Panadol"
                      />
                      {row.errors.name && (
                        <p className="text-xs text-red-400 mt-1">{row.errors.name}</p>
                      )}
                    </div>

                    {/* Formula */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={row.formula}
                        onChange={(e) => updateRow(row.id, 'formula', e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400"
                        placeholder="e.g., Paracetamol"
                      />
                    </div>

                    {/* Dosage */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={row.dosage}
                        onChange={(e) => updateRow(row.id, 'dosage', e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400"
                        placeholder="e.g., 500 mg"
                      />
                    </div>

                    {/* Formulation */}
                    <div className="col-span-2">
                      <select
                        value={row.formulation}
                        onChange={(e) => updateRow(row.id, 'formulation', e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white bg-gray-700"
                      >
                        <option value="">Select</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Injection">Injection</option>
                        <option value="Cream">Cream</option>
                        <option value="Ointment">Ointment</option>
                        <option value="Lotion">Lotion</option>
                        <option value="Drops">Drops</option>
                        <option value="Powder">Powder</option>
                        <option value="Sachet">Sachet</option>
                      </select>
                    </div>

                    {/* Stock */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={row.stock === 0 ? '' : row.stock}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateRow(row.id, 'stock', value === '' ? 0 : parseInt(value) || 0);
                        }}
                        className={`w-full px-2 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-white bg-gray-700 placeholder-gray-400 ${row.errors.stock ? 'border-red-500' : 'border-gray-600'
                          }`}
                        placeholder="0"
                        min="0"
                      />
                      {row.errors.stock && (
                        <p className="text-xs text-red-400 mt-1">{row.errors.stock}</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={medicineRows.length === 1}
                        className={`p-1 rounded transition-colors ${medicineRows.length === 1
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-red-400 hover:text-red-300 hover:bg-red-900'
                          }`}
                        title="Remove row"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {medicineRows.map((row, index) => (
                <div key={row.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  {/* Medicine Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-200">
                      Medicine #{index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={medicineRows.length === 1}
                      className={`p-1 rounded transition-colors ${medicineRows.length === 1
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-red-400 hover:text-red-300 hover:bg-red-900'
                        }`}
                      title="Remove medicine"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Medicine Fields */}
                  <div className="space-y-3">
                    {/* Medicine Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Medicine Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-800 placeholder-gray-400 ${row.errors.name ? 'border-red-500' : 'border-gray-600'
                          }`}
                        placeholder="e.g., Panadol"
                      />
                      {row.errors.name && (
                        <p className="text-xs text-red-400 mt-1">{row.errors.name}</p>
                      )}
                    </div>

                    {/* Formula */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Formula
                      </label>
                      <input
                        type="text"
                        value={row.formula}
                        onChange={(e) => updateRow(row.id, 'formula', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-800 placeholder-gray-400"
                        placeholder="e.g., Paracetamol"
                      />
                    </div>

                    {/* Row 1: Dosage and Formulation */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={row.dosage}
                          onChange={(e) => updateRow(row.id, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-800 placeholder-gray-400"
                          placeholder="e.g., 500 mg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Formulation
                        </label>
                        <select
                          value={row.formulation}
                          onChange={(e) => updateRow(row.id, 'formulation', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-800"
                        >
                          <option value="">Select</option>
                          <option value="Tablet">Tablet</option>
                          <option value="Capsule">Capsule</option>
                          <option value="Syrup">Syrup</option>
                          <option value="Injection">Injection</option>
                          <option value="Cream">Cream</option>
                          <option value="Ointment">Ointment</option>
                          <option value="Lotion">Lotion</option>
                          <option value="Drops">Drops</option>
                          <option value="Powder">Powder</option>
                          <option value="Sachet">Sachet</option>
                        </select>
                      </div>
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={row.stock === 0 ? '' : row.stock}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateRow(row.id, 'stock', value === '' ? 0 : parseInt(value) || 0);
                        }}
                        className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-800 placeholder-gray-400 ${row.errors.stock ? 'border-red-500' : 'border-gray-600'
                          }`}
                        placeholder="0"
                        min="0"
                      />
                      {row.errors.stock && (
                        <p className="text-xs text-red-400 mt-1">{row.errors.stock}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Row Button - Shared for both views */}
            <div className="mt-6">
              <button
                type="button"
                onClick={addRow}
                className="w-full md:w-auto inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-green-400 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors border border-gray-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Medicine Row
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 md:p-4 bg-gray-750 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs md:text-sm text-gray-400 text-center sm:text-left">
            {medicineRows.filter(row => row.name.trim()).length} medicine(s) ready to add
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors border border-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || medicineRows.filter(row => row.name.trim()).length === 0}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding Medicines...' : `Add ${medicineRows.filter(row => row.name.trim()).length} Medicine(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
