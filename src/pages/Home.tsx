import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Trophy, Heart, Target, ChevronRight } from 'lucide-react';
import { MOCK_CHARITIES } from '../constants';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px] opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-black text-white rounded-full">
              Digital Heros Golf Charity Subscription Platform
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-black mb-8 leading-[0.9]">
              Play for <span className="text-gray-400 italic serif">Purpose.</span><br />
              Win for <span className="text-gray-400 italic serif">Impact.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track your performance, enter monthly draws, and support world-class charities with every subscription.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all flex items-center group">
                  Go to Dashboard
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all flex items-center group">
                    Join Now
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                  <Link to="/login" className="px-8 py-4 bg-white text-black border border-gray-200 font-bold rounded-full hover:border-black transition-all">
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Impact Section */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">$1.2M+</div>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Raised for Charity</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">15k+</div>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Active Golfers</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">250+</div>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Monthly Winners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                A subscription that <br />
                <span className="text-gray-400">gives back.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Target className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Score Tracking</h3>
                    <p className="text-gray-500 leading-relaxed">Enter your latest 5 Stableford scores. We keep your performance data clean and simple.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Trophy className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Monthly Draws</h3>
                    <p className="text-gray-500 leading-relaxed">Every subscriber is entered into our monthly prize pools. Match 3, 4, or 5 numbers to win.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Heart className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Charity Impact</h3>
                    <p className="text-gray-500 leading-relaxed">Choose a charity to support. 10% of your subscription goes directly to your chosen cause.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-[40px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&q=80&w=1200" 
                  alt="Golf Impact" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl max-w-xs hidden md:block">
                <p className="text-sm font-medium italic text-gray-600 mb-4">
                  "This platform has completely changed how I think about my weekend rounds. Every bogey feels like it's for a better cause."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <div className="text-xs font-bold">James Wilson</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">Subscriber since 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Spotlight */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">Charity Spotlight</span>
              <h2 className="text-4xl font-bold tracking-tight">Making a difference.</h2>
            </div>
            <Link to="/charities" className="text-sm font-bold flex items-center hover:underline">
              View All Charities <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_CHARITIES.map((charity) => (
              <motion.div 
                key={charity.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={charity.imageURL} alt={charity.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-2">{charity.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{charity.description}</p>
                  <Link to={`/charities/${charity.id}`} className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1">
                    Read More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-black text-white rounded-[60px] p-16 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Ready to join the <br />club?</h2>
              <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
                Join thousands of golfers making a real impact. Choose your plan and start playing for purpose today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link to="/dashboard" className="px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all inline-block">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all inline-block">
                      Join Now
                    </Link>
                    <Link to="/login" className="px-12 py-5 bg-transparent text-white border border-white/20 font-bold rounded-full hover:bg-white/10 transition-all inline-block">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
