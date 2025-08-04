'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Medicine } from '@/types/medicine';
import { storageUtils } from '@/utils/storage';
import SearchBar from '@/components/SearchBar';
import MedicineList from '@/components/MedicineList';
import AdminLogin from '@/components/AdminLogin';
import MedicineForm from '@/components/MedicineForm';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import RelatedMedicinesPopup from '@/components/RelatedMedicinesPopup';

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);
  const [showRelatedMedicines, setShowRelatedMedicines] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState('');
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);
  const [showRelatedMedicines, setShowRelatedMedicines] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState('');

  // Load medicines and admin status on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedMedicines = await storageUtils.getMedicines();
        const adminStatus = storageUtils.getAdminSession();
        
        setMedicines(loadedMedicines);
        setIsAdmin(adminStatus);
        
        // Try to sync to database on first load
        await storageUtils.syncToDatabase();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Periodic sync with database
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (storageUtils.shouldSync()) {
        try {
          const freshMedicines = await storageUtils.getMedicines();
          setMedicines(freshMedicines);
        } catch (error) {
          console.log('Sync failed, continuing with cached data');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(syncInterval);
  }, []);

  // Filter medicines based on search query only
  const filteredMedicines = useMemo(() => {
    let filtered = medicines;
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(medicine => 
        medicine.name.toLowerCase().includes(query) ||
        medicine.formula.toLowerCase().includes(query) ||
        medicine.dosage.toLowerCase().includes(query) ||
        medicine.formulation.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [medicines, searchQuery]);

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowMedicineForm(true);
  };

  const handleDelete = (id: string) => {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) {
      setDeletingMedicine(medicine);
      setShowDeleteConfirmation(true);
    }
  };

    const handleMedicineClick = (medicine: Medicine) => {
    // Show related medicines popup if formula exists
    if (medicine.formula && medicine.formula.trim()) {
      setSelectedFormula(medicine.formula);
      setShowRelatedMedicines(true);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setShowMedicineForm(true);
  };

  const handleMedicineSubmit = async (medicineData: Omit<Medicine, 'id'>) => {
    try {
      if (editingMedicine) {
        // Update existing medicine
        const updatedMedicineData = { ...editingMedicine, ...medicineData };
        const success = await storageUtils.updateMedicine(updatedMedicineData);
        if (success) {
          const updatedMedicines = await storageUtils.getMedicines();
          setMedicines(updatedMedicines);
        }
      } else {
        // Add new medicine
        const newMedicineData = { ...medicineData, id: Date.now().toString() };
        const success = await storageUtils.addMedicine(newMedicineData);
        if (success) {
          const updatedMedicines = await storageUtils.getMedicines();
          setMedicines(updatedMedicines);
        }
      }
      setShowMedicineForm(false);
      setEditingMedicine(null);
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingMedicine) {
      try {
        const success = await storageUtils.deleteMedicine(deletingMedicine.id);
        if (success) {
          const updatedMedicines = await storageUtils.getMedicines();
          setMedicines(updatedMedicines);
        }
        setShowDeleteConfirmation(false);
        setDeletingMedicine(null);
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setDeletingMedicine(null);
  };

  const toggleAdminMode = () => {
    if (isAdmin) {
      // Logout admin
      setIsAdmin(false);
      storageUtils.setAdminSession(false);
    } else {
      // Show login modal
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdmin(true);
      storageUtils.setAdminSession(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Revive Pharmacy</h1>
                </div>
              </div>
            </div>
            
            {/* Modern Admin Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-md">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                  ADMIN MODE
                </span>
              )}
              <button
                onClick={toggleAdminMode}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isAdmin 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isAdmin ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="sm:hidden">Exit</span>
                    <span className="hidden sm:inline">Exit Admin</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="sm:hidden">Admin</span>
                    <span className="hidden sm:inline">Admin Login</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Admin Mode Indicator */}
          {isAdmin && (
            <div className="sm:hidden pb-3 pt-1">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-md">
                <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                ADMIN MODE ACTIVE
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchBar 
          query={searchQuery}
          onQueryChange={setSearchQuery}
        />

        {/* Active Filters */}
        {searchQuery.trim() && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-300">Active filters:</span>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-blue-500 text-white shadow-md">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-gray-200 font-medium underline transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium text-gray-300">
              Showing {filteredMedicines.length} of {medicines.length} medicines
            </p>
          </div>
          {isAdmin && (
            <button 
              onClick={handleAddMedicine}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Medicine
            </button>
          )}
        </div>

        <MedicineList
          medicines={filteredMedicines}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMedicineClick={handleMedicineClick}
        />
      </main>

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
      />

      {/* Medicine Form Modal */}
      <MedicineForm
        isOpen={showMedicineForm}
        onClose={() => {
          setShowMedicineForm(false);
          setEditingMedicine(null);
        }}
        onSubmit={handleMedicineSubmit}
        editMedicine={editingMedicine}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        medicine={deletingMedicine}
      />

      {/* Related Medicines Popup */}
      <RelatedMedicinesPopup
        isOpen={showRelatedMedicines}
        onClose={() => setShowRelatedMedicines(false)}
        formula={selectedFormula}
        medicines={medicines}
      />
    </div>
  );
}
