import React from 'react';
import { useAuth } from '../context/AuthContext';
import ScoreEntry from '../components/ScoreEntry';
import SubscriptionCard from '../components/SubscriptionCard';
import { motion } from 'motion/react';
import { Trophy, Heart, Users, ArrowUpRight, Wallet } from 'lucide-react';
import { MOCK_CHARITIES } from '../constants';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const handleCharityChange = async (charityId: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ selected_charity_id: charityId })
        .eq('uid', profile.uid);

      if (error) throw error;
      toast.success('Charity preference updated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const selectedCharity = MOCK_CHARITIES.find(c => c.id === profile?.selected_charity_id) || MOCK_CHARITIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Hello, {profile?.display_name?.split(' ')[0] || 'Hero'}</h1>
          <p className="text-gray-500">Welcome back to your dashboard.</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <SubscriptionCard />
        </div>
        
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Winnings Card */}
            <div className="bg-black text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Wallet size={24} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40">Total Won</div>
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-bold mb-1">${profile?.total_winnings?.toLocaleString() || '0'}</div>
                  <p className="text-white/40 text-sm">Across 0 winning draws</p>
                </div>
                <button className="mt-8 text-sm font-bold flex items-center hover:underline">
                  View History <ArrowUpRight size={16} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Participation Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Trophy size={24} />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Next Draw</div>
              </div>
              <div className="mb-8">
                <div className="text-2xl font-bold mb-1">April 1st, 2026</div>
                <p className="text-gray-500 text-sm">Estimated Jackpot: $25,000</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users size={16} />
                <span>12,450 participants entered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ScoreEntry />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Your Charity</h3>
              <Heart size={20} className="text-red-500" />
            </div>

            <div className="mb-8">
              <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                <img src={selectedCharity.imageURL} alt={selectedCharity.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h4 className="font-bold mb-1">{selectedCharity.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{selectedCharity.description}</p>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contribution</span>
                <span className="text-sm font-bold">{profile?.charity_contribution_percentage || 10}%</span>
              </div>
            </div>

            <button 
              onClick={() => toast.info('Charity selection coming soon!')}
              className="w-full py-3 border border-gray-200 text-sm font-bold rounded-2xl hover:border-black transition-all"
            >
              Change Charity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
