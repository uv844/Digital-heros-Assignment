import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Draw, DrawStatus } from '../types';
import { motion } from 'motion/react';
import { Play, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminDrawManager: React.FC = () => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchDraws();

    const subscription = supabase
      .channel('draws-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draws' }, () => {
        fetchDraws();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDraws = async () => {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching draws:', error);
    } else {
      setDraws(data as Draw[]);
    }
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);
      
      const { error } = await supabase.from('draws').insert({
        date: new Date().toISOString(),
        winning_numbers: winningNumbers,
        status: DrawStatus.SIMULATED,
        jackpot_amount: 25000,
      });

      if (error) throw error;
      toast.success('Simulation complete!');
      fetchDraws();
    } catch (error: any) {
      console.error('Error running simulation:', error);
      toast.error('Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  };

  const publishDraw = async (drawId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('draws')
        .update({ status: DrawStatus.PUBLISHED })
        .eq('id', drawId);

      if (error) throw error;
      toast.success('Draw results published!');
      fetchDraws();
    } catch (error: any) {
      console.error('Error publishing draw:', error);
      toast.error('Failed to publish draw');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold">Draw Management</h3>
          <p className="text-sm text-gray-500">Configure and execute monthly draws</p>
        </div>
        <button 
          onClick={runSimulation}
          disabled={simulating}
          className="px-6 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center disabled:opacity-50"
        >
          {simulating ? <RefreshCw className="mr-2 animate-spin" size={18} /> : <Play className="mr-2" size={18} />}
          Run Simulation
        </button>
      </div>

      <div className="space-y-4">
        {draws.map((draw) => (
          <div key={draw.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center space-x-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Date</div>
                <div className="text-sm font-bold">{draw.date ? format(new Date(draw.date), 'MMM dd, yyyy') : 'Pending'}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Winning Numbers</div>
                <div className="flex space-x-2">
                  {draw.winning_numbers?.map((num, i) => (
                    <div key={i} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm border border-gray-100">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Status</div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${draw.status === DrawStatus.PUBLISHED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {draw.status}
                </div>
              </div>
            </div>

            {draw.status === DrawStatus.SIMULATED && (
              <button 
                onClick={() => publishDraw(draw.id)}
                disabled={loading}
                className="px-4 py-2 bg-white text-black border border-gray-200 text-xs font-bold rounded-xl hover:border-black transition-all flex items-center"
              >
                <Send className="mr-2" size={14} />
                Publish Results
              </button>
            )}
          </div>
        ))}

        {draws.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 text-sm">No draws executed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDrawManager;
