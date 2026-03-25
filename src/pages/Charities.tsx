import React from 'react';
import { motion } from 'motion/react';
import { MOCK_CHARITIES } from '../constants';
import { Search, Filter, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Charities: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">Our Partners</span>
          <h1 className="text-5xl font-bold tracking-tight mb-6">Charities we support.</h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            We partner with world-class organizations making a real impact. Choose the cause that resonates with you, and 10% of your subscription goes directly to them.
          </p>
        </motion.div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search charities..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold flex items-center shadow-sm hover:border-black transition-all">
            <Filter size={18} className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_CHARITIES.map((charity, i) => (
          <motion.div 
            key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-50 flex flex-col"
          >
            <div className="aspect-video overflow-hidden">
              <img src={charity.imageURL} alt={charity.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
            </div>
            <div className="p-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{charity.name}</h3>
                <Heart size={20} className="text-gray-200 hover:text-red-500 cursor-pointer transition-colors" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">{charity.description}</p>
              
              <div className="pt-8 border-t border-gray-50">
                <Link to={`/charities/${charity.id}`} className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center group">
                  View Profile
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Charities;
