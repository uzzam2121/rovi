import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { askGemini } from '../utils/gemini';

export default function Quotes() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const prompt = `Generate an inspirational and motivational quote. Respond ONLY with the quote text followed by a dash and the author name. Format: "Quote text" — Author Name. Keep it concise and meaningful.`;
      const response = await askGemini(prompt);
      
      // Parse the response to extract quote and author
      const parts = response.split('—').map(s => s.trim());
      if (parts.length >= 2) {
        const text = parts[0].replace(/^["']|["']$/g, '').trim();
        const author = parts.slice(1).join('—').trim();
        setQuote({ text, author });
      } else {
        // Fallback if parsing fails
        setQuote({ text: response, author: 'Unknown' });
      }
    } catch (error) {
      setQuote({ 
        text: "The only way to do great work is to love what you do.", 
        author: "Steve Jobs" 
      });
      console.error('Error fetching quote:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg shadow-md p-6 text-white h-40 flex flex-col border border-yellow-600/30"
      style={{ background: 'linear-gradient(135deg, #2d1b3d 0%, #3d2352 100%)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Quote className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Daily Quote</h3>
        </div>
        <button
          onClick={fetchQuote}
          disabled={loading}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Get new quote"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded animate-pulse"></div>
          <div className="h-3 bg-white/20 rounded animate-pulse w-1/2"></div>
        </div>
      ) : quote ? (
        <motion.div
          key={quote.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <p className="text-sm italic leading-relaxed">"{quote.text}"</p>
          <p className="text-xs opacity-90">— {quote.author}</p>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
