import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { MapPin, Calendar, Clock, Phone, Mail, Instagram, ChevronDown, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useParams } from 'react-router-dom';

interface WeddingData {
  coupleNames: string;
  story: string;
  themeColor: string;
  heroImage: string;
  musicEnabled: boolean;
  contactPhone: string;
  contactEmail: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  mapUrl: string;
}

interface GalleryData {
  id: string;
  url: string;
  caption: string;
}

export default function InvitationPage() {
  const { weddingId } = useParams();
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [gallery, setGallery] = useState<GalleryData[]>([]);
  const [rsvpData, setRsvpData] = useState({ name: '', rsvpStatus: 'attending', guestCount: 1, notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!weddingId) return;
    const fetchData = async () => {
      const weddingDoc = await getDoc(doc(db, 'weddings', weddingId));
      if (weddingDoc.exists()) {
        setWedding(weddingDoc.data() as WeddingData);
      } else {
        // Fallback for non-existent IDs
        setWedding({
          coupleNames: 'Invitation Not Found',
          story: 'The link you followed seems to be incorrect or the invitation has been removed.',
          themeColor: '#D4AF37',
          heroImage: '',
          musicEnabled: false,
          contactPhone: '',
          contactEmail: ''
        });
      }
      
      const eventsSnap = await getDocs(query(collection(db, 'weddings', weddingId, 'events'), orderBy('order', 'asc')));
      const eventsData = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() } as EventData));
      setEvents(eventsData);

      const gallerySnap = await getDocs(query(collection(db, 'weddings', weddingId, 'gallery'), orderBy('order', 'asc')));
      const galleryData = gallerySnap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryData));
      setGallery(galleryData);
    };
    fetchData();
  }, [weddingId]);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'weddings', weddingId, 'guests'), {
        ...rsvpData,
        updatedAt: serverTimestamp()
      });
      setSubmitted(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#8B0000', '#ffffff']
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!wedding) return <div className="h-screen flex items-center justify-center font-serif text-2xl animate-pulse text-stone-600">Loading Invitation...</div>;

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={wedding.heroImage || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000"} 
            className="w-full h-full object-cover brightness-[0.4]"
            alt="Wedding Background"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <p className="text-wedding-gold font-serif italic text-xl md:text-2xl mb-4 tracking-widest">JOIN US TO CELEBRATE</p>
            <h1 className="text-6xl md:text-9xl font-display mb-6 tracking-tighter">
              {wedding.coupleNames.split('&').map((name, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="block my-2 text-wedding-gold font-serif italic text-4xl md:text-6xl">&</span>}
                  <span className="block">{name.trim()}</span>
                </React.Fragment>
              ))}
            </h1>
            <div className="h-px w-32 bg-wedding-gold mx-auto my-8 opacity-50" />
            <p className="text-xl md:text-2xl font-serif tracking-[0.2em] font-light">SAVE THE DATE</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-white/50 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 max-w-4xl mx-auto text-center border-b border-stone-200">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <Heart className="w-8 h-8 text-wedding-red mx-auto mb-8 fill-wedding-red/10" />
          <h2 className="text-4xl md:text-5xl mb-8">Our Love Story</h2>
          <p className="text-stone-600 font-serif text-xl leading-relaxed italic whitespace-pre-wrap">
            {wedding.story || "Once upon a time, in a world full of magic, we found each other. Our journey has been a beautiful blend of laughter, dreams, and endless love."}
          </p>
        </motion.div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center mb-16 font-display">The Celebrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="mb-6 flex justify-between items-start">
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center group-hover:bg-wedding-gold/10 transition-colors">
                  <Calendar className="w-6 h-6 text-wedding-gold" />
                </div>
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.3em]">{event.time}</span>
              </div>
              <h3 className={cn("text-2xl mb-4 font-display", event.title.toLowerCase().includes('reception') ? "text-wedding-red" : "text-stone-900")}>
                {event.title}
              </h3>
              <p className="text-stone-500 mb-6 font-serif italic text-sm leading-relaxed">{event.description}</p>
              
              <div className="space-y-4 pt-6 border-t border-stone-50">
                <div className="flex items-center gap-4 text-stone-600">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-wedding-gold" />
                  </div>
                  <span className="text-sm font-medium">{event.date}</span>
                </div>
                <div className="flex items-center gap-4 text-stone-600">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-wedding-gold" />
                  </div>
                  <span className="text-sm font-medium line-clamp-1">{event.location}</span>
                </div>
              </div>
              
              {event.mapUrl && event.mapUrl !== '#' && (
                <a 
                  href={event.mapUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-stone-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-wedding-gold transition-colors shadow-lg active:scale-[0.98]"
                >
                  <MapPin className="w-3 h-3" />
                  View on Map
                </a>
              )}
            </motion.div>
          ))}

          {events.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 rounded-[40px]">
              <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-400 font-serif italic">Event schedule to be announced soon...</p>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-wedding-gold font-serif italic text-lg block mb-2">Our Moments</span>
              <h2 className="text-4xl md:text-5xl font-display">Photo Gallery</h2>
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {gallery.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700"
                >
                  <img 
                    src={item.url} 
                    alt={item.caption}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  {item.caption && (
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <p className="text-white font-serif italic text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section className="py-24 px-4 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-wedding-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-wedding-red/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="max-w-xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl text-center mb-4 text-wedding-gold font-display">Will You Attend?</h2>
          <p className="text-stone-400 text-center mb-12 font-serif">Kindly respond by the end of the month</p>
          
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 backdrop-blur-sm p-12 rounded-3xl text-center border border-white/10"
            >
              <Heart className="w-12 h-12 text-wedding-gold mx-auto mb-4 fill-wedding-gold" />
              <h3 className="text-2xl mb-2">Thank you!</h3>
              <p className="text-stone-400">We've received your response and can't wait to see you.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleRSVP} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-stone-500 ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={rsvpData.name}
                  onChange={e => setRsvpData({...rsvpData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-wedding-gold transition-colors"
                  placeholder="Your Name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-stone-500 ml-1">Response</label>
                  <select 
                    value={rsvpData.rsvpStatus}
                    onChange={e => setRsvpData({...rsvpData, rsvpStatus: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-wedding-gold transition-colors appearance-none"
                  >
                    <option value="attending" className="bg-stone-900">Attending</option>
                    <option value="declined" className="bg-stone-900">Declined</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-stone-500 ml-1">Guest Count</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={rsvpData.guestCount}
                    onChange={e => setRsvpData({...rsvpData, guestCount: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-wedding-gold transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-stone-500 ml-1">Message</label>
                <textarea 
                  value={rsvpData.notes}
                  onChange={e => setRsvpData({...rsvpData, notes: e.target.value})}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-wedding-gold transition-colors resize-none"
                  placeholder="Optional note for the couple"
                />
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full bg-wedding-gold text-stone-900 py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm RSVP'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-stone-50 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl mb-8 italic font-serif">Made with love by {wedding.coupleNames}</h3>
          <p className="text-stone-400 text-xs uppercase tracking-widest">© ADX WISH</p>
        </div>
      </footer>
    </div>
  );
}
