import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionStatus } from '../types';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import PricingModal from './PricingModal';

const SubscriptionCard: React.FC = () => {
  const { profile } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  const isActive = profile?.subscriptionStatus === SubscriptionStatus.ACTIVE;

  return (
    <>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold">Subscription</h3>
            <p className="text-sm text-gray-500">Manage your membership</p>
          </div>
          <div className={`p-3 rounded-2xl ${isActive ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
            {isActive ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Status</div>
            <div className={`text-lg font-bold capitalize ${isActive ? 'text-green-600' : 'text-orange-600'}`}>
              {profile?.subscriptionStatus || 'Inactive'}
            </div>
          </div>

          {isActive && profile?.renewalDate && (
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Next Renewal</div>
              <div className="text-sm font-medium flex items-center text-gray-600">
                <Calendar size={14} className="mr-2" />
                {format(new Date(profile.renewalDate), 'MMMM dd, yyyy')}
              </div>
            </div>
          )}
        </div>

        {!isActive ? (
          <button 
            onClick={() => setShowPricing(true)}
            className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center group"
          >
            <CreditCard className="mr-2" size={18} />
            Subscribe Now
          </button>
        ) : (
          <button className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl cursor-not-allowed">
            Manage Billing
          </button>
        )}
      </div>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </>
  );
};

export default SubscriptionCard;
