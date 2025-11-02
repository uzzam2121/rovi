import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { generateMeetings, generateHabits, generateExpenses } from '../utils/mockData';

export default function DailySummary({ city }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a cached summary for today
    const today = new Date().toDateString();
    const cached = localStorage.getItem(`dailySummary_v4_${today}`);
    
    if (cached) {
      // Use cached summary
      setSummary(cached);
      setLoading(false);
    } else {
      // Generate generic summary for today
      generateSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateSummary = () => {
    setLoading(true);
    try {
      const meetings = generateMeetings();
      const habits = generateHabits();
      const expenses = generateExpenses();
      
      // Generate generic summary without Gemini (no dollar amounts)
      const genericSummary = `You have ${meetings.length} meetings scheduled today. Keep tracking your daily habits progress. Your expenses are tracked across ${expenses.length} categories. Stay focused and productive!`;
      
      // Cache the summary for today (using new version to force regeneration)
      const today = new Date().toDateString();
      localStorage.setItem(`dailySummary_v4_${today}`, genericSummary);
      
      setSummary(genericSummary);
    } catch (err) {
      const fallback = 'You have 3 meetings scheduled today. Track your habits progress. Stay productive!';
      const today = new Date().toDateString();
      localStorage.setItem(`dailySummary_v4_${today}`, fallback);
      setSummary(fallback);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg h-40"
    >
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-5 h-5" />
        <h3 className="font-semibold text-lg">Daily Summary</h3>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded animate-pulse"></div>
          <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed">{summary}</p>
      )}
    </motion.div>
  );
}
