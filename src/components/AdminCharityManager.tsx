import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Charity } from '../types';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const AdminCharityManager: React.FC = () => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Charity>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching charities:', error);
    } else {
      setCharities(data as Charity[]);
    }
  };

  const handleEdit = (charity: Charity) => {
    setEditingId(charity.id);
    setEditForm(charity);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isAdding) {
        const { error } = await supabase
          .from('charities')
          .insert([editForm]);
        if (error) throw error;
        toast.success('Charity added successfully');
      } else {
        const { error } = await supabase
          .from('charities')
          .update(editForm)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Charity updated successfully');
      }
      handleCancel();
      fetchCharities();
    } catch (error: any) {
      console.error('Error saving charity:', error);
      toast.error(error.message || 'Failed to save charity');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this charity?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('charities')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Charity deleted successfully');
      fetchCharities();
    } catch (error: any) {
      console.error('Error deleting charity:', error);
      toast.error(error.message || 'Failed to delete charity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold">Charity Partners</h3>
          <p className="text-sm text-gray-500">Manage charity organizations and their details</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditForm({}); }}
          className="px-6 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center"
        >
          <Plus className="mr-2" size={18} />
          Add Charity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-black"
          >
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Charity Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                value={editForm.name || ''}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
              />
              <textarea 
                placeholder="Description"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm h-24"
                value={editForm.description || ''}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Image URL"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                value={editForm.image_url || ''}
                onChange={e => setEditForm({...editForm, image_url: e.target.value})}
              />
              <div className="flex space-x-2">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center"
                >
                  <Save className="mr-2" size={14} />
                  Save Charity
                </button>
                <button 
                  onClick={handleCancel}
                  className="px-4 py-3 bg-white text-gray-500 border border-gray-200 text-xs font-bold rounded-xl hover:border-black hover:text-black transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {charities.map((charity) => (
          <div key={charity.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group">
            {editingId === charity.id ? (
              <div className="space-y-4">
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                  value={editForm.name || ''}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm h-24"
                  value={editForm.description || ''}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                />
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                  value={editForm.image_url || ''}
                  onChange={e => setEditForm({...editForm, image_url: e.target.value})}
                />
                <div className="flex space-x-2">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center"
                  >
                    <Save className="mr-2" size={14} />
                    Update
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-3 bg-white text-gray-500 border border-gray-200 text-xs font-bold rounded-xl hover:border-black hover:text-black transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                    {charity.image_url ? (
                      <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={24} />
                    )}
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEdit(charity)}
                      className="p-2 bg-white text-gray-500 hover:text-black rounded-lg border border-gray-100 hover:border-black transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(charity.id)}
                      className="p-2 bg-white text-gray-500 hover:text-red-600 rounded-lg border border-gray-100 hover:border-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-2">{charity.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">{charity.description}</p>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Created {new Date(charity.created_at).toLocaleDateString()}</span>
                  <span className="text-black">Active Partner</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCharityManager;
