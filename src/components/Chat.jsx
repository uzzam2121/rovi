import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { askGemini } from '../utils/gemini';
import { getSessionData, setSessionData as saveSessionData, getOverrides, setOverrides as saveOverrides } from '../utils/dataStorage';

export default function Chat({ city }) {
  // Get current data to include in chat context
  const [overrides, setOverrides] = useState(() => getOverrides());

  // Persist session mock data so the chat and UI stay consistent
  const [sessionData, setSessionData] = useState(() => getSessionData());

  // Initialize session data from storage on mount
  useEffect(() => {
    const data = getSessionData();
    setSessionData(data);
    const storedOverrides = getOverrides();
    setOverrides(storedOverrides);
  }, []); // Only run once on mount

  const getCurrentData = () => {
    const meetings = sessionData.meetings;
    // Apply overrides to habits from session data
    const habits = sessionData.habits.map(habit => ({
      ...habit,
      progress: overrides.habits[habit.name] ?? habit.progress,
    }));

    // Apply overrides to expenses from session data
    const expenses = sessionData.expenses.map(exp => ({
      ...exp,
      amount: overrides.expenses[exp.category] ?? exp.amount,
    }));

    // Apply overrides to prices from session data
    const prices = sessionData.prices.map(price => ({
      ...price,
      cheapest: overrides.prices[price.name] ?? price.cheapest,
    }));

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
  const messagesContainerRef = useRef(null);

  // Broadcast helper for other UI components to react to changes
  const broadcast = (name, detail) => {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch {}
  };

  // Helpers for time parsing/formatting
  const to24Hour = (hour12, minuteStr = '00', ampm) => {
    let h = parseInt(hour12, 10);
    const m = minuteStr.padStart(2, '0');
    const suffix = (ampm || '').toLowerCase();
    if (suffix === 'pm' && h !== 12) h += 12;
    if (suffix === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const formatTimeHuman = (time24) => {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mStr} ${ampm}`;
  };

  // Resolve expense category names to those present in session data (handle synonyms)
  const resolveExpenseCategory = (rawName) => {
    if (!rawName) return rawName;
    const input = String(rawName).trim();
    const inputLc = input.toLowerCase();
    const aliasMap = {
      groceries: 'Food', // common synonym
      dining: 'Food',
      meals: 'Food',
      food: 'Food',
      transportation: 'Transport',
      commute: 'Transport',
      transit: 'Transport',
    };
    if (aliasMap[inputLc]) return aliasMap[inputLc];
    // Try exact case-insensitive match against existing categories
    const categories = sessionData.expenses.map(e => e.category);
    const exact = categories.find(c => c.toLowerCase() === inputLc);
    if (exact) return exact;
    // Try startsWith/contains heuristic
    const starts = categories.find(c => c.toLowerCase().startsWith(inputLc));
    if (starts) return starts;
    const contains = categories.find(c => c.toLowerCase().includes(inputLc));
    if (contains) return contains;
    return input; // fallback to original
  };

  const scrollToBottom = (immediate = false) => {
    // Use requestAnimationFrame for better performance
    const scroll = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const targetScroll = container.scrollHeight - container.clientHeight;
        
        if (immediate) {
          // Immediate scroll for better mobile experience
          container.scrollTop = targetScroll;
        } else {
          // Smooth scroll
          container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      }
      
      // Also try scrollIntoView as fallback
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: immediate ? 'auto' : 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    };
    
    // Use requestAnimationFrame for immediate updates, setTimeout for delayed
    if (immediate) {
      requestAnimationFrame(() => {
        requestAnimationFrame(scroll);
      });
    } else {
      setTimeout(scroll, 100);
    }
  };

  useEffect(() => {
    scrollToBottom(false);
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
    
    // Scroll to bottom immediately after user message (use immediate for responsiveness)
    scrollToBottom(true);

    try {
      // Lightweight command parsing for temporary UI-only overrides
      const text = input.trim();

      // Regexes for commands
      const priceMatch = text.match(/^(?:set|update)\s+price\s+of\s+(.+?)\s+to\s+\$?(\d+(?:\.\d+)?)/i);
      const habitMatch = text.match(/^(?:set|update)\s+habit\s+(.+?)\s+to\s+(\d{1,3})%/i);
      const expenseMatch = text.match(/^(?:set|update)\s+expense\s+(.+?)\s+to\s+\$?(\d+(?:\.\d+)?)/i);
      const resetMatch = text.match(/^reset\s+(prices|habits|expenses|all)$/i);
      const rescheduleMatch = text.match(/^(?:change|move|reschedule).*?(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?\s+meeting\s+to\s+(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?/i);
      const timeQueryMatch = text.match(/^(?:what\s+about|do\s+i\s+have\s+.*at)\s+(\d{1,2})(?::?(\d{2}))?\s*(am|pm)\??$/i);

      if (priceMatch || habitMatch || expenseMatch || resetMatch || rescheduleMatch || timeQueryMatch) {
        setLoading(false);
        if (rescheduleMatch) {
          const [, fromH, fromM, fromAmpm, toH, toM, toAmpm] = rescheduleMatch;
          const fromTime = to24Hour(fromH, fromM || '00', fromAmpm || 'am');
          const toTime = to24Hour(toH, toM || '00', toAmpm || 'am');

          // Find a meeting at fromTime and update its time
          let updated = false;
          setSessionData(prev => {
            const meetings = prev.meetings.map(m => {
              if (!updated && m.time === fromTime) {
                updated = true;
                return { ...m, time: toTime };
              }
              return m;
            });
            const next = { ...prev, meetings };
            saveSessionData(next); // Save to storage
            broadcast('rovi:sessionDataChanged', next);
            return next;
          });

          const roviMessage = {
            id: Date.now() + 1,
            text: updated
              ? `Confirmed. Moved your ${formatTimeHuman(fromTime)} meeting to ${formatTimeHuman(toTime)}.`
              : `I couldn't find a meeting at ${formatTimeHuman(fromTime)}. Please specify the title or confirm the original time.`,
            sender: 'rovi',
          };
          setMessages((prev) => [...prev, roviMessage]);
          scrollToBottom(false);
          return;
        }

        if (timeQueryMatch) {
          const [, h, m, ampm] = timeQueryMatch;
          const time24 = to24Hour(h, m || '00', ampm);
          const atThatTime = sessionData.meetings.filter(mtg => mtg.time === time24);
          const roviMessage = {
            id: Date.now() + 1,
            text: atThatTime.length
              ? atThatTime.map(m => `You have ${m.title} scheduled at ${formatTimeHuman(m.time)} with ${m.participants.join(', ')}.`).join(' ')
              : `There are no meetings scheduled at ${formatTimeHuman(time24)}.`,
            sender: 'rovi',
          };
          setMessages((prev) => [...prev, roviMessage]);
          scrollToBottom(false);
          return;
        }
        if (priceMatch) {
          const name = priceMatch[1].trim();
          const value = parseFloat(priceMatch[2]);
          setOverrides(prev => {
            const next = { ...prev, prices: { ...prev.prices, [name]: value } };
            saveOverrides(next); // Save to storage
            broadcast('rovi:overridesChanged', next);
            return next;
          });
          const roviMessage = {
            id: Date.now() + 1,
            text: `Noted. Temporarily set the price of ${name} to $${value.toFixed(2)} for this session.`,
            sender: 'rovi',
          };
          setMessages((prev) => [...prev, roviMessage]);
          scrollToBottom(false);
          return;
        }

        if (habitMatch) {
          const name = habitMatch[1].trim();
          const value = Math.max(0, Math.min(100, parseInt(habitMatch[2], 10)));
          setOverrides(prev => {
            const next = { ...prev, habits: { ...prev.habits, [name]: value } };
            saveOverrides(next); // Save to storage
            broadcast('rovi:overridesChanged', next);
            return next;
          });
          const roviMessage = {
            id: Date.now() + 1,
            text: `Understood. Updated the progress of ${name} to ${value}%.`,
            sender: 'rovi',
          };
          setMessages((prev) => [...prev, roviMessage]);
          scrollToBottom(false);
          return;
        }

        if (expenseMatch) {
          const rawCategory = expenseMatch[1].trim();
          const value = parseFloat(expenseMatch[2]);
          const resolvedCategory = resolveExpenseCategory(rawCategory);
          setOverrides(prev => {
            const next = { ...prev, expenses: { ...prev.expenses, [resolvedCategory]: value } };
            saveOverrides(next); // Save to storage
            broadcast('rovi:overridesChanged', next);
            return next;
          });
          const label = resolvedCategory !== rawCategory ? `${rawCategory} → ${resolvedCategory}` : resolvedCategory;
          const roviMessage = {
            id: Date.now() + 1,
            text: `Okay. Set the ${label} expense to $${value.toFixed(2)} for now.`,
            sender: 'rovi',
          };
          setMessages((prev) => [...prev, roviMessage]);
          scrollToBottom(false);
          return;
        }

        if (resetMatch) {
          const scope = resetMatch[1].toLowerCase();
          setOverrides(prev => {
            let next = prev;
            if (scope === 'all') next = { prices: {}, habits: {}, expenses: {} };
            else if (scope === 'prices') next = { ...prev, prices: {} };
            else if (scope === 'habits') next = { ...prev, habits: {} };
            else if (scope === 'expenses') next = { ...prev, expenses: {} };
            saveOverrides(next); // Save to storage
            broadcast('rovi:overridesChanged', next);
            return next;
          });
          const roviMessage = {
            id: Date.now() + 1,
            text: scope === 'all' ? 'All temporary overrides cleared.' : `Cleared temporary ${scope} overrides.`,
            sender: 'rovi',
          };
          setMessages((prev) => [...prev, roviMessage]);
          scrollToBottom(false);
          return;
        }
      }

      const data = getCurrentData();
      
      // Include recent conversation history for context (last 6 messages)
      const recentMessages = messages.slice(-6).map(m => 
        `${m.sender === 'user' ? 'User' : 'Rovi'}: ${m.text}`
      ).join('\n');
      
      const prompt = `You are Rovi, a professional and helpful AI personal assistant. The user is located in ${city}. You are friendly, knowledgeable, and capable of answering both personal data questions and general knowledge questions.

AVAILABLE USER DATA (use this when the question relates to the user's personal information):
- Meetings: ${data.meetings}
- Habits: ${data.habits}
- Expenses: ${data.expenses} (Total: $${data.totalExpenses})
- Prices: ${data.prices}

RECENT CONVERSATION HISTORY (use this to understand context and follow-up questions):
${recentMessages}

User's current message: "${input}"

RESPONSE GUIDELINES:

1. GENERAL APPROACH:
   - Answer all questions naturally and helpfully, whether they're about personal data or general knowledge
   - For questions about the user's data (meetings, habits, expenses, prices), use the available data above
   - For general knowledge questions (cricket, sports, history, science, etc.), provide accurate, helpful answers
   - Maintain context from previous messages - if the user asks "who manage them" after discussing cricket, answer about cricket team managers
   - Be conversational and natural, not robotic

2. GREETINGS:
   - ONLY greet if the user's message is clearly a greeting ("hi", "hello", "hey", etc.)
   - Do NOT include greetings in other responses

3. DATA-RELATED QUESTIONS:
   - When asked about meetings, habits, expenses, or prices, use the data provided above
   - Provide complete, helpful information
   - For habits: If asked about a habit's routine or details not in the data, provide general helpful advice about that type of habit
   - Example: "what is my morning exercise progress" → Use the data to give the percentage
   - Example: "tell me about my morning exercise routine" → If routine details aren't in data, provide helpful general advice about morning exercise routines while acknowledging their progress

4. GENERAL KNOWLEDGE QUESTIONS:
   - Answer these naturally and accurately
   - Provide helpful, informative responses
   - Examples: "how many players in cricket" → "A cricket team has 11 players on the field."
   - Examples: "who manage them" (referring to cricket) → "Cricket teams are typically managed by a team manager or coach, along with support staff."

5. FORMATTING:
   - Use complete sentences with proper grammar
   - No markdown formatting (no bullet points with asterisks, no bold/italic)
   - Be concise but informative (50-200 words as appropriate)
   - Professional yet friendly tone`;
      
      const response = await askGemini(prompt);

      const roviMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'rovi',
      };

      setMessages((prev) => [...prev, roviMessage]);
      
      // Scroll to bottom after receiving response
      scrollToBottom(false);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: 'rovi',
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', error);
      
      // Scroll to bottom after error message
      scrollToBottom(false);
    } finally {
      setLoading(false);
      // Final scroll after loading completes
      setTimeout(() => scrollToBottom(false), 200);
    }
  };

  // Allow external/manual updates to keep chat in sync
  useEffect(() => {
    const onSetData = (e) => {
      const detail = e.detail || {};
      // detail: { meetings?, habits?, expenses?, prices? }
      setSessionData(prev => {
        const next = {
          meetings: detail.meetings ?? prev.meetings,
          habits: detail.habits ?? prev.habits,
          expenses: detail.expenses ?? prev.expenses,
          prices: detail.prices ?? prev.prices,
        };
        saveSessionData(next); // Save to storage
        return next;
      });
    };

    const onSetOverride = (e) => {
      const { scope, key, value } = e.detail || {};
      if (!scope || key == null) return;
      if (scope === 'prices') setOverrides(prev => {
        const next = { ...prev, prices: { ...prev.prices, [key]: value } };
        saveOverrides(next);
        return next;
      });
      if (scope === 'habits') setOverrides(prev => {
        const next = { ...prev, habits: { ...prev.habits, [key]: value } };
        saveOverrides(next);
        return next;
      });
      if (scope === 'expenses') setOverrides(prev => {
        const next = { ...prev, expenses: { ...prev.expenses, [key]: value } };
        saveOverrides(next);
        return next;
      });
    };

    const onResetOverrides = (e) => {
      const scope = (e.detail && e.detail.scope) || 'all';
      setOverrides(prev => {
        let next = prev;
        if (scope === 'all') next = { prices: {}, habits: {}, expenses: {} };
        else if (scope === 'prices') next = { ...prev, prices: {} };
        else if (scope === 'habits') next = { ...prev, habits: {} };
        else if (scope === 'expenses') next = { ...prev, expenses: {} };
        saveOverrides(next);
        return next;
      });
    };

    // Listen for storage changes from other tabs/windows
    const onStorageChange = (e) => {
      if (e.key === 'rovi_session_data' || e.key === 'rovi_overrides') {
        if (e.key === 'rovi_session_data') {
          const data = getSessionData();
          setSessionData(data);
        } else {
          const overrides = getOverrides();
          setOverrides(overrides);
        }
      }
    };

    window.addEventListener('rovi:setData', onSetData);
    window.addEventListener('rovi:setOverride', onSetOverride);
    window.addEventListener('rovi:resetOverrides', onResetOverrides);
    window.addEventListener('storage', onStorageChange);
    window.addEventListener('rovi:sessionDataChanged', (e) => {
      const data = e.detail;
      if (data) setSessionData(data);
    });
    window.addEventListener('rovi:overridesChanged', (e) => {
      const overrides = e.detail;
      if (overrides) setOverrides(overrides);
    });
    
    return () => {
      window.removeEventListener('rovi:setData', onSetData);
      window.removeEventListener('rovi:setOverride', onSetOverride);
      window.removeEventListener('rovi:resetOverrides', onResetOverrides);
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('rovi:sessionDataChanged', () => {});
      window.removeEventListener('rovi:overridesChanged', () => {});
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4 shrink-0 border-b border-yellow-600/30">
        <h3 className="font-semibold text-base sm:text-lg text-yellow-400">Chat with Rovi</h3>
      </div>
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 space-y-3 min-h-0"
        onScroll={(e) => {
          // Prevent parent scrolling when user is scrolling chat
          e.stopPropagation();
        }}
      >
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
      <form 
        onSubmit={handleSend} 
        onTouchStart={(e) => e.stopPropagation()}
        className="flex gap-2 shrink-0 border-t border-yellow-600/30 p-2 sm:p-3 md:p-4" 
        style={{ backgroundColor: '#0C090A' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            // Ensure chat stays visible when input is focused on mobile
            setTimeout(() => scrollToBottom(false), 300);
          }}
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
