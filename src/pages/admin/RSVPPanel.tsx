import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, Calendar, User, AlignLeft, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface RSVP {
  id: string;
  name: string;
  rsvpStatus: string;
  guestCount: number;
  notes: string;
  updatedAt: any;
}

export default function RSVPPanel() {
  const { weddingId } = useParams();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  useEffect(() => {
    if (!weddingId) return;
    const fetchRSVPs = async () => {
      const q = query(collection(db, 'weddings', weddingId, 'guests'), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      setRsvps(snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as RSVP)));
    };
    fetchRSVPs();
  }, [weddingId]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-display mb-2">RSVP Data Panel</h1>
        <p className="text-stone-500 font-serif">Deep dive into guest responses and special notes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {rsvps.map((rsvp) => (
          <div key={rsvp.id} className="bg-white p-8 rounded-[32px] border border-stone-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full opacity-[0.03]",
              rsvp.rsvpStatus === 'attending' ? "bg-emerald-500" : "bg-red-500"
            )} />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{rsvp.name}</h3>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  rsvp.rsvpStatus === 'attending' ? "text-emerald-500" : "text-red-500"
                )}>
                  {rsvp.rsvpStatus} • {rsvp.guestCount} {rsvp.guestCount === 1 ? 'Guest' : 'Guests'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl min-h-[100px]">
                <div className="flex items-center gap-2 text-stone-400 mb-2">
                  <AlignLeft className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Message from Guest</span>
                </div>
                <p className="text-sm text-stone-600 font-serif italic italic leading-relaxed">
                  {rsvp.notes || "No special message provided."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>Response received: {rsvp.updatedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
              </div>
            </div>
          </div>
        ))}

        {rsvps.length === 0 && (
          <div className="md:col-span-3 text-center py-40">
            <MessageSquare className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 font-serif italic text-xl">Waiting for your first response...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
