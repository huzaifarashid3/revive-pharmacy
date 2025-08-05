# CSV Import Duplicate Detection

## Enhanced Duplicate Logic

The CSV import system now uses comprehensive duplicate detection based on **all key properties**:

### Properties Checked for Duplicates:
1. **Name** (case-insensitive)
2. **Dosage** (case-insensitive) 
3. **Formulation** (case-insensitive)
4. **Formula** (case-insensitive)

### How It Works:
- A medicine is considered a duplicate **only if ALL four properties match exactly**
- Comparison is case-insensitive and whitespace-trimmed
- Medicines with the same name but different dosage, formulation, or formula will **NOT** be considered duplicates

### Examples:

**These are NOT duplicates (will all be imported):**
```csv
name,formula,dosage,formulation,stock
Aspirin,C9H8O4,100mg,Tablet,25
Aspirin,C9H8O4,200mg,Tablet,15       # Different dosage
Aspirin,C9H8O4,100mg,Capsule,20      # Different formulation
Aspirin,C9H8O5,100mg,Tablet,30       # Different formula
```

**These ARE duplicates (second one will be skipped):**
```csv
name,formula,dosage,formulation,stock
Aspirin,C9H8O4,100mg,Tablet,25
Aspirin,C9H8O4,100mg,Tablet,50       # Exact match (stock doesn't matter)
```

### Benefits:
- Allows multiple variants of the same medicine (different strengths, forms)
- Prevents exact duplicates from being imported
- Clear user feedback about what constitutes a duplicate
- Maintains data integrity while allowing legitimate variations

### User Interface:
- Duplicates are shown in yellow warning sections
- Clear message explains duplicate criteria
- Duplicate count displayed in import summary
- Only exact matches are flagged as duplicates
