import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, CheckCircle, Clock, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useParams } from 'react-router-dom';

export default function DashboardHome() {
  const { weddingId } = useParams();
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    pending: 0,
    declined: 0
  });

  useEffect(() => {
    if (!weddingId) return;
    const fetchStats = async () => {
      const guestSnap = await getDocs(collection(db, 'weddings', weddingId, 'guests'));
      const guests = guestSnap.docs.map(doc => doc.data());
      
      setStats({
        total: guests.length,
        attending: guests.filter(g => g.rsvpStatus === 'attending').length,
        pending: guests.filter(g => g.rsvpStatus === 'pending').length,
        declined: guests.filter(g => g.rsvpStatus === 'declined').length
      });
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Attending', count: stats.attending, color: '#D4AF37' },
    { name: 'Declined', count: stats.declined, color: '#DC2626' },
    { name: 'Pending', count: stats.pending, color: '#94A3B8' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display mb-2">Overview</h1>
          <p className="text-stone-500 font-serif">Quick metrics for your wedding planning progress</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Invited" 
          value={stats.total} 
          sub="Guest entries"
          color="bg-stone-900"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Confirmed" 
          value={stats.attending} 
          sub="Will be attending"
          color="bg-wedding-gold"
        />
        <StatCard 
          icon={Clock} 
          label="Pending" 
          value={stats.pending} 
          sub="No response yet"
          color="bg-sky-500"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Guest Cap" 
          value="500" 
          sub="Venue capacity"
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* RSVP Chart */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm shadow-stone-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold">RSVP Distribution</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Live Updates</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  cursor={{fill: '#f5f5f4'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coming Events */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm shadow-stone-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold">Recent RSVPs</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-wedding-gold hover:underline">View All</button>
          </div>
          
          <div className="space-y-6">
            {stats.total === 0 ? (
              <p className="text-stone-400 text-center py-10 italic font-serif">No responses yet</p>
            ) : (
              <div className="text-stone-500 text-sm text-center py-10">
                Data visible in Guests and RSVP tabs
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm shadow-stone-100 relative overflow-hidden group">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform", color)} />
      <div className="flex flex-col gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display">{value}</span>
            <span className="text-xs text-stone-400">{sub}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
