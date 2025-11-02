// Generate mock meetings
export function generateMeetings() {
  const meetings = [
    { id: 1, time: '09:00', title: 'Team Standup', participants: ['John', 'Sarah', 'Mike'] },
    { id: 2, time: '11:30', title: 'Client Presentation', participants: ['Emma', 'David'] },
    { id: 3, time: '14:00', title: 'Design Review', participants: ['Lisa', 'Tom', 'Alex'] },
  ];
  return meetings;
}

// Generate mock expenses
export function generateExpenses() {
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];
  const expenses = categories.map((category, index) => ({
    id: index + 1,
    category,
    amount: Math.floor(Math.random() * 500) + 50,
    date: new Date(2024, 0, index + 1).toISOString().split('T')[0],
  }));
  return expenses;
}

// Generate mock habits
export function generateHabits() {
  const habits = [
    { id: 1, name: 'Morning Exercise', progress: Math.floor(Math.random() * 100), target: 100 },
    { id: 2, name: 'Read 30 minutes', progress: Math.floor(Math.random() * 100), target: 100 },
    { id: 3, name: 'Drink 8 glasses water', progress: Math.floor(Math.random() * 100), target: 100 },
    { id: 4, name: 'Meditation', progress: Math.floor(Math.random() * 100), target: 100 },
    { id: 5, name: 'No phone before bed', progress: Math.floor(Math.random() * 100), target: 100 },
  ];
  return habits;
}

// Generate mock quotes
export function generateQuotes() {
  const quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { id: 2, text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { id: 3, text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
    { id: 4, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Generate mock prices
export function generatePrices() {
  const items = [
    { id: 1, name: 'Milk (1L)', prices: [3.49, 3.79, 4.99] },
    { id: 2, name: 'Bread', prices: [2.99, 3.29, 4.49] },
    { id: 3, name: 'Eggs (12)', prices: [4.99, 5.49, 6.99] },
    { id: 4, name: 'Chicken (1kg)', prices: [8.99, 9.99, 12.99] },
    { id: 5, name: 'Rice (2kg)', prices: [5.49, 6.29, 7.99] },
    { id: 6, name: 'Bananas (1kg)', prices: [2.49, 2.79, 3.49] },
    { id: 7, name: 'Oranges (1kg)', prices: [3.99, 4.49, 5.99] },
  ];
  
  return items.map(item => {
    const sortedPrices = [...item.prices].sort((a, b) => a - b);
    return {
      ...item,
      prices: sortedPrices,
      cheapest: sortedPrices[0],
    };
  });
}
