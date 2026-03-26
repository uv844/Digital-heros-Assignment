import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { GolfScore } from '../types';
import { STABLEFORD_MIN, STABLEFORD_MAX } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ScoreEntry: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [newScore, setNewScore] = useState<number | string>(36);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !profile) {
      console.log('[ScoreEntry] User present but profile missing, refreshing...');
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  useEffect(() => {
    if (!user) return;

    fetchScores();

    // Real-time subscription
    const subscription = supabase
      .channel('scores-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'golf_scores',
        filter: `uid=eq.${user.id}`
      }, () => {
        fetchScores();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchScores = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('uid', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching scores:', error);
    } else {
      setScores(data as GolfScore[]);
    }
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ScoreEntry] handleAddScore triggered. User:', !!user);
    if (!user) {
      toast.error('You must be logged in to add a score.');
      return;
    }
    
    const scoreVal = typeof newScore === 'string' ? parseInt(newScore) : newScore;
    console.log('[ScoreEntry] Score value:', scoreVal);
    if (isNaN(scoreVal) || scoreVal < STABLEFORD_MIN || scoreVal > STABLEFORD_MAX) {
      toast.error(`Score must be between ${STABLEFORD_MIN} and ${STABLEFORD_MAX}`);
      return;
    }

    setLoading(true);
    console.log('[ScoreEntry] Attempting to add score:', { uid: user.id, score: scoreVal });

    try {
      // If we already have 5 scores, delete the oldest one
      if (scores.length >= 5) {
        const oldestScore = scores[scores.length - 1];
        console.log('[ScoreEntry] Deleting oldest score:', oldestScore.id);
        if (oldestScore.id) {
          const { error: deleteError } = await supabase.from('golf_scores').delete().eq('id', oldestScore.id);
          if (deleteError) {
            console.error('[ScoreEntry] Error deleting old score:', deleteError);
          }
        }
      }

      console.log('[ScoreEntry] Inserting new score...');
      const { error } = await supabase.from('golf_scores').insert({
        uid: user.id,
        score: scoreVal,
        date: new Date().toISOString(),
      });

      if (error) {
        console.error('[ScoreEntry] Insert error:', error);
        if (error.code === '42501' || error.message?.includes('permission')) {
          if (!profile) {
            throw new Error('Your profile is still syncing. Please wait a moment and try again.');
          } else {
            throw new Error('Permission denied. Please ensure your account is active.');
          }
        }
        throw error;
      }

      console.log('[ScoreEntry] Score added successfully!');
      toast.success('Score added!');
      setNewScore(36);
      fetchScores();
    } catch (error: any) {
      console.error('[ScoreEntry] Error adding score:', error);
      toast.error(error.message || 'Failed to add score. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    try {
      const { error } = await supabase.from('golf_scores').delete().eq('id', id);
      if (error) throw error;
      toast.success('Score removed');
      fetchScores();
    } catch (error: any) {
      console.error('Error deleting score:', error);
      toast.error('Failed to remove score');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold">Recent Scores</h3>
          <p className="text-sm text-gray-500">Your last 5 Stableford rounds</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-full px-4">
          <Target size={16} className="text-gray-400" />
          <span className="text-sm font-bold">{scores.length}/5</span>
        </div>
      </div>

      <form onSubmit={handleAddScore} className="flex items-center space-x-4 mb-8">
        <div className="flex-1">
          <input 
            type="number" 
            min={STABLEFORD_MIN} 
            max={STABLEFORD_MAX}
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
            placeholder="Score (1-45)"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="p-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <Plus size={24} />
        </button>
      </form>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {scores.map((score) => (
            <motion.div 
              key={score.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                  {score.score}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Stableford</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {score.date ? format(new Date(score.date), 'MMM dd, yyyy') : 'Just now'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => score.id && handleDeleteScore(score.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {scores.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 text-sm">No scores entered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreEntry;
