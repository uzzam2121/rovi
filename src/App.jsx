import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import WeatherWidget from './components/WeatherWidget';
import DailySummary from './components/DailySummary';
import MeetingScheduler from './components/MeetingScheduler';
import ExpenseTracker from './components/ExpenseTracker';
import HabitTracker from './components/HabitTracker';
import Quotes from './components/Quotes';
import PriceComparison from './components/PriceComparison';
import Chat from './components/Chat';

function App() {
  const [city, setCity] = useState('Miami');
  const [currentTime, setCurrentTime] = useState('');
  const [timezone, setTimezone] = useState('America/New_York'); // Default timezone for Miami

  // Update time every second based on city timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        // Create a formatter for the city's timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        
        const parts = formatter.formatToParts(now);
        let hours = '';
        let minutes = '';
        let ampm = '';
        
        parts.forEach(part => {
          if (part.type === 'hour') hours = part.value;
          if (part.type === 'minute') minutes = part.value;
          if (part.type === 'dayPeriod') ampm = part.value;
        });
        
        setCurrentTime(`${hours}:${minutes} ${ampm}`);
      } catch (error) {
        // Fallback to local time if timezone is invalid
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        setCurrentTime(`${hours}:${minutesStr} ${ampm}`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#0C090A' }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-yellow-600/30 shadow-lg shrink-0 z-20 w-full"
        style={{ backgroundColor: '#0C090A' }}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/50">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-900" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 md:gap-6 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Rovi
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-yellow-200/70 mt-0.5 sm:mt-1">AI Personal Assistant Dashboard</p>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-yellow-400 tracking-wide whitespace-nowrap">
                  {currentTime}
                </div>
              </div>
            </div>
            <div className="flex-1 sm:max-w-xs md:max-w-md lg:max-w-lg w-full sm:w-auto">
              <WeatherWidget city={city} onCityChange={setCity} onTimezoneChange={setTimezone} />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chat (Fixed) - Hidden on mobile, visible on larger screens */}
        <aside className="hidden lg:flex w-[30%] xl:w-[25%] border-r border-yellow-600/30 flex-col shrink-0" style={{ backgroundColor: '#0C090A', height: 'calc(100vh - 120px)' }}>
          <Chat city={city} />
        </aside>

        {/* Right Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Row 1: Daily Summary and Quotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DailySummary city={city} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Quotes />
              </motion.div>
            </div>

            {/* Row 2: MeetingScheduler and HabitTracker (side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="h-80 sm:h-96">
                <MeetingScheduler />
              </div>
              <div className="h-80 sm:h-96">
                <HabitTracker />
              </div>
            </div>

            {/* Row 3: Price Comparison (full width) */}
            <div className="mb-4 sm:mb-6">
              <PriceComparison />
            </div>

            {/* Row 4: Expense Tracker (full width) */}
            <div className="mb-4 sm:mb-6">
              <div className="h-80 sm:h-96">
                <ExpenseTracker />
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

export default App;
