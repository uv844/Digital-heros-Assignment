import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { MOCK_CHARITIES } from '../constants';
import { Charity } from '../types';
import { Heart, ArrowLeft, Globe, Mail, MapPin, Users, Calendar, Trophy, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CharityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile, updateProfile } = useAuth();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharity = async () => {
      setLoading(true);
      try {
        // 1. Try to find in MOCK_CHARITIES first (for quick load)
        const mockCharity = MOCK_CHARITIES.find(c => c.id === id);
        
        // 2. Try to fetch from database
        const { data, error } = await supabase
          .from('charities')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data) {
          // Merge mock data if it exists (for extra fields like upcoming_events if we add them)
          setCharity({
            ...mockCharity,
            ...data,
            image_url: data.image_url || mockCharity?.imageURL
          } as Charity);
        } else if (mockCharity) {
          setCharity({
            ...mockCharity,
            image_url: mockCharity.imageURL
          } as any);
        }
      } catch (error) {
        console.error('Error fetching charity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharity();
  }, [id]);

  const handleSelectCharity = async () => {
    if (!profile) {
      toast.error('Please log in to select a charity');
      return;
    }
    if (!charity) return;

    try {
      await updateProfile({ selectedCharityId: charity.id });
      toast.success(`You are now supporting ${charity.name}!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Charity not found</h1>
        <Link to="/charities" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-2" /> Back to Charities
        </Link>
      </div>
    );
  }

  const isSelected = profile?.selectedCharityId === charity.id;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={charity.image_url} 
            alt={charity.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Link 
                to="/charities" 
                className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors group"
              >
                <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Charities
              </Link>
              <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6 leading-none">
                {charity.name}
              </h1>
              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={handleSelectCharity}
                  className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center ${
                    isSelected 
                      ? 'bg-green-500 text-white cursor-default' 
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {isSelected ? (
                    <>Selected Charity <Heart size={18} className="ml-2 fill-current" /></>
                  ) : (
                    <>Support this Charity <Heart size={18} className="ml-2" /></>
                  )}
                </button>
                <div className="flex items-center space-x-6 text-white/60 ml-4">
                  <div className="flex items-center">
                    <Users size={18} className="mr-2" />
                    <span className="text-sm font-bold uppercase tracking-widest">1,240 Supporters</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy size={18} className="mr-2" />
                    <span className="text-sm font-bold uppercase tracking-widest">$45k Raised</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              <div>
                <h2 className="text-3xl font-bold mb-8">About the Mission</h2>
                <div className="prose prose-lg text-gray-500 max-w-none leading-relaxed">
                  <p className="mb-6">{charity.description}</p>
                  <p>
                    Every contribution through Digital Hero helps us expand our reach and deepen our impact. 
                    We believe in transparency and direct action, ensuring that your support translates into 
                    meaningful change for the communities we serve.
                  </p>
                </div>
              </div>

              {/* Impact Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Lives Impacted', value: '50k+', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Projects Completed', value: '120', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { label: 'Countries Active', value: '12', icon: Globe, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-8 rounded-[32px] border border-transparent hover:border-black/5 transition-all`}>
                    <stat.icon className={`${stat.color} mb-4`} size={32} />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Upcoming Initiatives</h2>
                <div className="space-y-4">
                  {(charity.upcoming_events || [
                    { name: 'Annual Gala 2026', date: 'May 15, 2026', description: 'Join us for an evening of celebration and fundraising.' },
                    { name: 'Community Outreach', date: 'June 10, 2026', description: 'Expanding our services to three new regions.' },
                    { name: 'Impact Report Release', date: 'July 01, 2026', description: 'A detailed look at what we achieved together this year.' }
                  ]).map((event, i) => (
                    <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm shrink-0">
                          <Calendar size={20} className="text-gray-400 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">MAY</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold mb-1">{event.name}</h4>
                          <p className="text-gray-500 text-sm">{event.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold mb-2">{event.date}</div>
                        <button className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-black flex items-center md:justify-end">
                          Learn More <ArrowLeft size={14} className="ml-1 rotate-180" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Contact Card */}
                <div className="bg-black text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-2xl font-bold mb-8 relative z-10">Get in Touch</h3>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <Globe size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Website</div>
                        <a href="#" className="text-sm font-bold hover:underline">www.{charity.name.toLowerCase().replace(/\s+/g, '')}.org</a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <Mail size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email</div>
                        <a href="#" className="text-sm font-bold hover:underline">contact@{charity.name.toLowerCase().replace(/\s+/g, '')}.org</a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Location</div>
                        <div className="text-sm font-bold">New York, NY</div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center">
                    Visit Website <ExternalLink size={16} className="ml-2" />
                  </button>
                </div>

                {/* Contribution Info */}
                <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100">
                  <h3 className="text-xl font-bold mb-6">How it Works</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    When you select this charity, 10% of your monthly subscription is automatically 
                    donated to support their mission. You can change your charity at any time from your dashboard.
                  </p>
                  <div className="p-6 bg-white rounded-3xl border border-gray-100">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your Impact</div>
                    <div className="text-2xl font-bold">$1.00 / mo</div>
                    <div className="text-[10px] text-gray-400 mt-1">Based on Pro Plan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CharityProfile;
