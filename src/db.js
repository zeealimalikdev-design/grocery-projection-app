import Dexie from 'dexie';

export const db = new Dexie('GroceryProjectionDB');

db.version(2).stores({
  inventory: '++id, name, category, unitCost, markup, expectedVolume, spoilageRate, bulkThreshold, discountPercentage',
  expenses: '++id, name, amount, frequency',
  projections: '++id, month, revenue, profit'
});

export const initDefaults = async () => {
  const inventoryCount = await db.inventory.count();
  if (inventoryCount === 0) {
    await db.inventory.bulkAdd([
      { name: 'Organic Apples', category: 'Fruits', unitCost: 450, markup: 40, expectedVolume: 5000, spoilageRate: 0.05, bulkThreshold: 4000, discountPercentage: 10 },
      { name: 'Whole Milk 1L', category: 'Dairy', unitCost: 280, markup: 25, expectedVolume: 8000, spoilageRate: 0.03, bulkThreshold: 6000, discountPercentage: 5 },
      { name: 'Basmati Rice 5kg', category: 'Grains', unitCost: 1800, markup: 30, expectedVolume: 2000, spoilageRate: 0.01, bulkThreshold: 3000, discountPercentage: 8 }
    ]);
  }

  const expenseCount = await db.expenses.count();
  if (expenseCount === 0) {
    await db.expenses.bulkAdd([
      { name: 'Warehouse Rent', amount: 450000, frequency: 'Monthly' },
      { name: 'Logistics Fleet', amount: 350000, frequency: 'Monthly' },
      { name: 'Staff Salaries', amount: 1200000, frequency: 'Monthly' },
      { name: 'Utilities', amount: 80000, frequency: 'Monthly' }
    ]);
  }
};
