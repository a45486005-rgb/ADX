import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import { Plus, Heart, Calendar, ChevronRight, Sparkles } from 'lucide-react';

interface Wedding {
  id: string;
  coupleNames: string;
  themeColor: string;
}

export default function WeddingsList() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchWeddings = async () => {
    const snap = await getDocs(collection(db, 'weddings'));
    setWeddings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wedding)));
  };

  useEffect(() => {
    fetchWeddings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await addDoc(collection(db, 'weddings'), {
        coupleNames: newName,
        themeColor: '#D4AF37',
        story: '',
        updatedAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewName('');
      fetchWeddings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-10">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-wedding-gold mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Admin Portal</span>
            </div>
            <h1 className="text-5xl font-display">Your Weddings</h1>
            <p className="text-stone-500 font-serif italic mt-2">Manage all your digital invitations from one place</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-wedding-gold transition-colors shadow-xl shadow-stone-200"
          >
            <Plus className="w-5 h-5" /> New Invitation
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-10 rounded-[40px] border-2 border-wedding-gold shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-display mb-6">Create New Invitation</h2>
            <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
              <input 
                autoFocus
                type="text" 
                placeholder="Couple Names (e.g. Romeo & Juliet)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-wedding-gold transition-colors"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 text-stone-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-wedding-gold transition-colors">Create Now</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {weddings.map(wedding => (
            <Link 
              key={wedding.id}
              to={`/admin/${wedding.id}`}
              className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-wedding-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-wedding-gold group-hover:bg-wedding-gold group-hover:text-white transition-colors duration-500">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                  ID: {wedding.id.substring(0, 8)}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <h3 className="text-3xl font-display mb-4">{wedding.coupleNames}</h3>
              
              <div className="flex items-center gap-6 text-stone-400 text-sm font-serif italic">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Invitation Ready</span>
                </div>
              </div>
            </Link>
          ))}

          {weddings.length === 0 && !isAdding && (
            <div className="md:col-span-2 text-center py-40 bg-white rounded-[40px] border-2 border-dashed border-stone-200">
              <Heart className="w-12 h-12 text-stone-100 mx-auto mb-4" />
              <p className="text-stone-400 font-serif italic text-xl">Start by creating your first wedding invitation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
