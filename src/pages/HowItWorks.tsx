import React from 'react';
import { motion } from 'motion/react';
import { Target, Trophy, Heart, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: CreditCard,
      title: "Subscribe",
      description: "Choose a monthly or yearly plan. 10% of your fee goes directly to a charity of your choice.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Target,
      title: "Enter Scores",
      description: "Log your latest 5 Stableford scores. We track your performance and keep you in the game.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Trophy,
      title: "Monthly Draws",
      description: "Match 3, 4, or 5 numbers in our monthly draws. The more you play, the more chances to win.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: Heart,
      title: "Make Impact",
      description: "Even if you don't win a prize, your subscription is making a real difference in the world.",
      color: "bg-red-50 text-red-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <header className="mb-24 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">The Mechanics</span>
          <h1 className="text-5xl font-bold tracking-tight mb-6">How it works.</h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            We've simplified the connection between your passion for golf and your desire to give back. Here's the journey.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-full w-full border-t-2 border-dashed border-gray-100 -z-10" />
            )}
            <div className={`w-20 h-20 ${step.color} rounded-[30px] flex items-center justify-center mb-8 shadow-sm`}>
              <step.icon size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-black text-white rounded-[60px] p-12 md:p-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-8">The Prize Pool Logic</h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            A fixed portion of every subscription contributes to the monthly prize pool. We distribute the pool based on match types:
          </p>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="font-bold">5-Number Match</span>
              <span className="text-orange-400 font-bold">40% Share (Jackpot)</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="font-bold">4-Number Match</span>
              <span className="text-orange-400 font-bold">35% Share</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="font-bold">3-Number Match</span>
              <span className="text-orange-400 font-bold">25% Share</span>
            </div>
          </div>
        </div>
        <div className="aspect-square bg-white/5 rounded-[40px] flex items-center justify-center p-12">
          <div className="text-center">
            <Trophy size={80} className="text-orange-400 mx-auto mb-8" />
            <div className="text-5xl font-bold mb-4">$25,000</div>
            <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">Current Estimated Jackpot</p>
          </div>
        </div>
      </div>

      <div className="mt-32 text-center">
        <h2 className="text-3xl font-bold mb-8">Ready to make an impact?</h2>
        <Link to="/signup" className="px-12 py-5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all inline-flex items-center group">
          Join Digital Heroes
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default HowItWorks;
