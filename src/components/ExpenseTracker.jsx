import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSessionData, getOverrides, setOverrides } from '../utils/dataStorage';

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState(() => {
    const data = getSessionData();
    const overrides = getOverrides();
    return data.expenses.map(exp => ({
      ...exp,
      amount: overrides.expenses[exp.category] ?? exp.amount,
    }));
  });
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState(0);
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Sync with storage changes
  useEffect(() => {
    const handleDataChange = () => {
      const data = getSessionData();
      const overrides = getOverrides();
      setExpenses(data.expenses.map(exp => ({
        ...exp,
        amount: overrides.expenses[exp.category] ?? exp.amount,
      })));
    };

    window.addEventListener('rovi:sessionDataChanged', handleDataChange);
    window.addEventListener('rovi:overridesChanged', handleDataChange);
    return () => {
      window.removeEventListener('rovi:sessionDataChanged', handleDataChange);
      window.removeEventListener('rovi:overridesChanged', handleDataChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg shadow-md p-6 flex flex-col text-white border border-yellow-600/30"
      style={{ background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Expenses</h3>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-2xl font-bold">${total}</span>
        </div>
      </div>
      <div className="w-full" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={expenses}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
            <XAxis dataKey="category" stroke="rgba(255,255,255,0.8)" />
            <YAxis stroke="rgba(255,255,255,0.8)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: 'white' }} />
            <Bar dataKey="amount" fill="rgba(255,255,255,0.9)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {expenses.map((exp) => {
          const isEditing = editingId === exp.id;

          const handleEdit = () => {
            setEditAmount(exp.amount);
            setEditingId(exp.id);
          };

          const handleSave = () => {
            setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, amount: editAmount } : e));
            // Save override to storage
            const overrides = getOverrides();
            setOverrides({
              ...overrides,
              expenses: { ...overrides.expenses, [exp.category]: editAmount }
            });
            setEditingId(null);
          };

          const handleCancel = () => {
            setEditingId(null);
          };

          return (
            <div key={exp.id} className="flex items-center justify-between p-2 bg-white/20 rounded">
              <span className="text-sm opacity-90">{exp.category}</span>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-white/30 text-white rounded text-sm font-semibold"
                  />
                  <button
                    onClick={handleSave}
                    className="p-1 bg-green-500 hover:bg-green-600 rounded"
                    title="Save"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 bg-red-500 hover:bg-red-600 rounded"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">${exp.amount}</span>
                  <button
                    onClick={handleEdit}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="Edit amount"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
