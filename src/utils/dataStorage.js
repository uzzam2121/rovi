// Centralized data storage using localStorage to persist data across refreshes
import { generateMeetings, generateHabits, generateExpenses, generatePrices } from './mockData';

const STORAGE_KEY = 'rovi_session_data';
const OVERRIDES_KEY = 'rovi_overrides';

// Initialize data with deterministic values (or use stored data)
function initializeData() {
  // Generate initial data with deterministic values
  // For expenses and habits, we'll use fixed seed values instead of random
  const meetings = generateMeetings(); // This is already deterministic
  
  // Generate expenses with fixed seed values
  const expenseSeed = 42; // Fixed seed for consistency
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];
  const expenses = categories.map((category, index) => {
    // Use a simple hash-like function to get consistent values
    const seed = expenseSeed + index * 73;
    const amount = ((seed * 7) % 500) + 50; // Generate value between 50-550
    return {
      id: index + 1,
      category,
      amount,
      date: new Date(2024, 0, index + 1).toISOString().split('T')[0],
    };
  });

  // Generate habits with fixed seed values
  const habitSeed = 123;
  const habitNames = [
    'Morning Exercise',
    'Read 30 minutes',
    'Drink 8 glasses water',
    'Meditation',
    'No phone before bed'
  ];
  const habits = habitNames.map((name, index) => {
    const seed = habitSeed + index * 37;
    const progress = (seed * 11) % 100; // Generate value between 0-99
    return {
      id: index + 1,
      name,
      progress,
      target: 100,
    };
  });

  const prices = generatePrices(); // This is already deterministic

  return {
    meetings,
    habits,
    expenses,
    prices,
  };
}

// Get session data from storage or initialize
export function getSessionData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that we have all required fields
      if (parsed.meetings && parsed.habits && parsed.expenses && parsed.prices) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading session data from storage:', error);
  }

  // Initialize new data if not found or invalid
  const newData = initializeData();
  setSessionData(newData);
  return newData;
}

// Save session data to storage
export function setSessionData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Broadcast the change so components can react
    window.dispatchEvent(new CustomEvent('rovi:sessionDataChanged', { detail: data }));
  } catch (error) {
    console.error('Error saving session data to storage:', error);
  }
}

// Update specific part of session data
export function updateSessionData(updates) {
  const current = getSessionData();
  const updated = {
    ...current,
    ...updates,
  };
  setSessionData(updated);
  return updated;
}

// Get overrides from storage
export function getOverrides() {
  try {
    const stored = localStorage.getItem(OVERRIDES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading overrides from storage:', error);
  }
  return {
    prices: {},
    habits: {},
    expenses: {},
  };
}

// Save overrides to storage
export function setOverrides(overrides) {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    // Broadcast the change
    window.dispatchEvent(new CustomEvent('rovi:overridesChanged', { detail: overrides }));
  } catch (error) {
    console.error('Error saving overrides to storage:', error);
  }
}

// Clear all stored data (for testing/reset)
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(OVERRIDES_KEY);
}

