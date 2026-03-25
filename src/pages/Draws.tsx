import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, ChevronRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const Draws: React.FC = () => {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: false });

      if (error) throw error;
      setDraws(data || []);
    } catch (error) {
      console.error('Error fetching draws:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Results Center</span>
        <h1 className="text-4xl font-bold tracking-tight text-black">Monthly Draw Results</h1>
        <p className="text-gray-500 mt-2">Check the latest winning numbers and jackpot distributions.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : draws.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-bold">No results found</h3>
          <p className="text-gray-500 text-sm">Check back later for the next draw results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {draws.map((draw) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 border border-gray-100 hover:shadow-xl transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-black rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
                    <span className="text-xs font-bold uppercase">{format(new Date(draw.date), 'MMM')}</span>
                    <span className="text-xl font-bold leading-none">{format(new Date(draw.date), 'dd')}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                      <Calendar size={12} />
                      <span>{format(new Date(draw.date), 'MMMM yyyy')}</span>
                    </div>
                    <h3 className="text-xl font-bold">Monthly Prize Draw</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {draw.winning_numbers.map((num: number, idx: number) => (
                    <div 
                      key={idx}
                      className="w-12 h-12 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-lg font-bold group-hover:border-black transition-colors"
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Jackpot Pool</div>
                  <div className="text-2xl font-bold text-black">${Number(draw.jackpot_amount).toLocaleString()}</div>
                </div>

                <div className="flex items-center text-gray-300 group-hover:text-black transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-50 rounded-3xl p-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Trophy className="text-black" size={24} />
          </div>
          <h4 className="text-lg font-bold mb-2">How to Win</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Match 3, 4, or 5 numbers from your subscription to win a share of the monthly jackpot.
          </p>
        </div>
        <div className="bg-gray-50 rounded-3xl p-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Calendar className="text-black" size={24} />
          </div>
          <h4 className="text-lg font-bold mb-2">Draw Schedule</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Draws take place on the last Friday of every month at 8:00 PM UTC.
          </p>
        </div>
        <div className="bg-gray-50 rounded-3xl p-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Search className="text-black" size={24} />
          </div>
          <h4 className="text-lg font-bold mb-2">Verify Results</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            All draws are simulated for demonstration purposes. Real draws will be independently audited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Draws;
