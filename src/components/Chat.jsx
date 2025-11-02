import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { askGemini } from '../utils/gemini';
import { generateMeetings, generateHabits, generateExpenses, generatePrices } from '../utils/mockData';

export default function Chat({ city }) {
  // Get current data to include in chat context
  const getCurrentData = () => {
    const meetings = generateMeetings();
    const habits = generateHabits();
    const expenses = generateExpenses();
    const prices = generatePrices();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return {
      meetings: meetings.map(m => `${m.time} - ${m.title} (${m.participants.join(', ')})`).join('\n'),
      habits: habits.map(h => `${h.name}: ${h.progress}% complete`).join('\n'),
      expenses: expenses.map(e => `${e.category}: $${e.amount}`).join('\n'),
      totalExpenses: totalExpenses,
      prices: prices.map(p => `${p.name}: $${p.cheapest.toFixed(2)} (best price)`).join('\n'),
    };
  };
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `I'm Rovi, your AI assistant. How can I help you today?`,
      sender: 'rovi',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = getCurrentData();
      const prompt = `You are Rovi, a professional AI personal assistant. The user is in ${city}. Maintain a professional, courteous tone at all times.

Available data (ONLY use when SPECIFICALLY asked):
- Meetings: ${data.meetings}
- Habits: ${data.habits}
- Expenses: ${data.expenses} (Total: $${data.totalExpenses})
- Prices: ${data.prices}

User said: "${input}"

RESPONSE GUIDELINES:

1. GREETINGS ONLY WHEN USER GREETS ("hi", "hello", "hey", etc.): 
   - ONLY respond with a greeting if the user's message is a greeting
   - Respond professionally: "Hello! How may I assist you today?" or "Hi! How can I help you?"
   - Do NOT greet in any other response

2. ALL OTHER QUESTIONS (meetings, habits, expenses, prices, general questions):
   - Answer directly without any greeting words (no "Good day!", "Hello!", etc.)
   - Start immediately with the answer
   - Example: "price of eggs" → "The best price for eggs (12) is $4.99." (NOT "Good day! The best price...")
   - Example: "what are my meetings" → List meetings directly without greeting

3. MEETING QUESTIONS SPECIFICALLY:
   - Provide complete, professional responses with full context
   - Include: time, title, and participants for each meeting
   - Example: "You have Team Standup scheduled at 09:00 with John, Sarah, and Mike."
   - Example: "You have a meeting scheduled at 14:00 - Design Review with Lisa, Tom, and Alex."

4. FORMATTING REQUIREMENTS:
   - Use complete sentences with proper grammar
   - No bullet points with asterisks (*) or markdown formatting
   - No vague endings ("Hope this helps", etc.)
   - Professional language and structure
   - Be informative but concise (50-150 words as appropriate)
   - NO GREETINGS in non-greeting responses`;
      
      const response = await askGemini(prompt);

      const roviMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'rovi',
      };

      setMessages((prev) => [...prev, roviMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: 'rovi',
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4 shrink-0 border-b border-yellow-600/30">
        <h3 className="font-semibold text-base sm:text-lg text-yellow-400">Chat with Rovi</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 space-y-3 min-h-0">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-800 text-gray-200 border border-yellow-600/30'
                }`}
              >
                <p className="text-xs sm:text-sm">{message.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800 border border-yellow-600/30 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 shrink-0 border-t border-yellow-600/30 p-2 sm:p-3 md:p-4" style={{ backgroundColor: '#0C090A' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Rovi anything..."
          className="flex-1 px-3 sm:px-4 py-2 bg-gray-800 border border-yellow-600/30 rounded-lg text-white text-sm sm:text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 sm:px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold text-sm sm:text-base shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
