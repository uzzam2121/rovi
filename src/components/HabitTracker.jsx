import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Edit2, Check, X } from 'lucide-react';
import { generateHabits } from '../utils/mockData';

export default function HabitTracker() {
  const [habits, setHabits] = useState(() => generateHabits());
  const [editingId, setEditingId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg shadow-md p-6 h-full flex flex-col text-white border border-yellow-600/30"
      style={{ background: 'linear-gradient(135deg, #4a1a2e 0%, #6b2d4a 100%)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5" />
        <h3 className="font-semibold text-lg">Daily Habits</h3>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto">
        {habits.map((habit, index) => {
          const percentage = (habit.progress / habit.target) * 100;
          const isEditing = editingId === habit.id;

          const handleEdit = () => {
            setEditProgress(habit.progress);
            setEditingId(habit.id);
          };

          const handleSave = () => {
            setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, progress: Math.min(editProgress, habit.target) } : h));
            setEditingId(null);
          };

          const handleCancel = () => {
            setEditingId(null);
          };

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {habit.progress >= habit.target ? (
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/50" />
                  )}
                  <span className="text-sm font-medium">{habit.name}</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={habit.target}
                      value={editProgress}
                      onChange={(e) => setEditProgress(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-white/20 text-white rounded text-sm"
                    />
                    <span className="text-sm opacity-90">%</span>
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
                    <span className="text-sm opacity-90">{habit.progress}%</span>
                    <button
                      onClick={handleEdit}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title="Edit progress"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-2 rounded-full ${
                    percentage >= 100 ? 'bg-green-300' : 'bg-white'
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
