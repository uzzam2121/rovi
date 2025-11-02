import { motion } from 'framer-motion';
import { ShoppingCart, TrendingDown } from 'lucide-react';
import { generatePrices } from '../utils/mockData';

export default function PriceComparison() {
  const items = generatePrices();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg shadow-md p-6 text-white border border-yellow-600/30"
      style={{ background: 'linear-gradient(135deg, #2c1810 0%, #3d2415 100%)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5" />
        <h3 className="font-semibold text-lg">Price Comparison</h3>
      </div>
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-start">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col bg-white/10 rounded-lg p-2 border border-white/20"
            >
              <h4 className="font-medium text-xs sm:text-sm mb-1 text-center leading-tight">{item.name}</h4>
              <div className="flex flex-col gap-1">
                {item.prices.map((price, i) => (
                  <div
                    key={i}
                    className={`px-1.5 py-1 rounded text-center text-xs ${
                      price === item.cheapest
                        ? 'bg-yellow-400 text-gray-900 border-2 border-yellow-300 font-semibold shadow-md shadow-yellow-500/50'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    ${price.toFixed(2)}
                    {price === item.cheapest && (
                      <TrendingDown className="w-2.5 h-2.5 inline ml-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
