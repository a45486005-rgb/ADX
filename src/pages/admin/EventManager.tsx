import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Plus, Edit2, Trash2, MapPin, Clock, Save, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  mapUrl: string;
  order: number;
}

export default function EventManager() {
  const { weddingId } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    mapUrl: '',
    order: 0
  });

  const fetchEvents = async () => {
    if (!weddingId) return;
    const q = query(collection(db, 'weddings', weddingId, 'events'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
  };

  useEffect(() => {
    fetchEvents();
  }, [weddingId]);

  const handleSave = async () => {
    if (!weddingId) return;
    try {
      // Create a clean copy of data to save, removing id if it's there
      const { id, ...dataToSave } = formData;
      const finalData = {
        ...dataToSave,
        updatedAt: new Date().toISOString()
      };

      if (isEditing === 'new') {
        await addDoc(collection(db, 'weddings', weddingId, 'events'), finalData);
      } else if (isEditing) {
        await updateDoc(doc(db, 'weddings', weddingId, 'events', isEditing), finalData);
      }
      setIsEditing(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please check your connection and try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!weddingId) return;
    if (confirm('Delete this event?')) {
      await deleteDoc(doc(db, 'weddings', weddingId, 'events', id));
      fetchEvents();
    }
  };

  const startEdit = (e?: Event) => {
    if (e) {
      setIsEditing(e.id);
      setFormData(e);
    } else {
      setIsEditing('new');
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        mapUrl: '',
        order: events.length
      });
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display mb-2">Event Manager</h1>
          <p className="text-stone-500 font-serif">Schedule and track all wedding ceremonies</p>
        </div>
        <button 
          onClick={() => startEdit()}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-wedding-gold transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isEditing && (
          <div className="bg-white p-10 rounded-3xl border-2 border-wedding-gold shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input label="Event Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
                  <Input label="Time" type="time" value={formData.time} onChange={v => setFormData({...formData, time: v})} />
                </div>
                <Input label="Location Name" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
              </div>
              <div className="space-y-4">
                <Input label="Google Maps URL" value={formData.mapUrl} onChange={v => setFormData({...formData, mapUrl: v})} />
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-wedding-gold transition-colors h-32 resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t border-stone-50">
              <button 
                onClick={() => setIsEditing(null)}
                className="px-6 py-3 text-stone-400 hover:text-stone-900 font-bold uppercase tracking-widest text-xs flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-stone-900 text-white px-10 py-3 rounded-xl hover:bg-wedding-gold transition-colors font-bold uppercase tracking-widest text-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Event
              </button>
            </div>
          </div>
        )}

        {events.map((event) => (
          <div key={event.id} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-wedding-gold">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-stone-400 font-serif italic">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.date} at {event.time}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => startEdit(event)}
                  className="p-3 bg-stone-50 text-stone-400 hover:bg-stone-900 hover:text-white rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="p-3 bg-stone-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {events.length === 0 && !isEditing && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
            <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 font-serif italic">No events scheduled yet. Add your first wedding event.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">{label}</label>
      <input 
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-wedding-gold transition-colors"
      />
    </div>
  );
}
