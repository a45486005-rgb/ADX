import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Plus, Trash2, Download, Search, Filter, Mail, Phone, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  rsvpStatus: 'pending' | 'attending' | 'declined';
  guestCount: number;
  notes: string;
}

export default function GuestManager() {
  const { weddingId } = useParams();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', rsvpStatus: 'pending', guestCount: 1 });

  const fetchGuests = async () => {
    if (!weddingId) return;
    const snap = await getDocs(query(collection(db, 'weddings', weddingId, 'guests')));
    setGuests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest)));
  };

  useEffect(() => {
    fetchGuests();
  }, [weddingId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;
    await addDoc(collection(db, 'weddings', weddingId, 'guests'), { ...newGuest, updatedAt: new Date().toISOString() });
    setIsAdding(false);
    setNewGuest({ name: '', email: '', phone: '', rsvpStatus: 'pending', guestCount: 1 });
    fetchGuests();
  };

  const handleDelete = async (id: string) => {
    if (!weddingId) return;
    if (confirm('Remove guest from list?')) {
      await deleteDoc(doc(db, 'weddings', weddingId, 'guests', id));
      fetchGuests();
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Guest Count', 'Notes'];
    const rows = guests.map(g => [
      g.name, g.email, g.phone, g.rsvpStatus, g.guestCount, g.notes
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wedding_guest_list.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || g.rsvpStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display mb-2">Guest Management</h1>
          <p className="text-stone-500 font-serif">Manage full guest list and track individual RSVPs</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white border border-stone-200 text-stone-600 px-6 py-3 rounded-xl hover:bg-stone-50 transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-wedding-gold transition-colors font-bold uppercase tracking-widest text-xs shadow-lg shadow-stone-200"
          >
            <Plus className="w-4 h-4" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:outline-none focus:border-wedding-gold transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['all', 'attending', 'pending', 'declined'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all",
                filterStatus === status 
                  ? "bg-stone-900 text-white" 
                  : "bg-white text-stone-400 border border-stone-100 hover:border-stone-200"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Adding Form Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-stone-900 p-8 text-white flex justify-between items-center">
              <h3 className="text-2xl font-display">New Guest</h3>
              <button onClick={() => setIsAdding(false)} className="text-white/50 hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Guest Name" required value={newGuest.name} onChange={v => setNewGuest({...newGuest, name: v})} />
                <Input label="Email Address" type="email" value={newGuest.email} onChange={v => setNewGuest({...newGuest, email: v})} />
                <Input label="Phone Number" value={newGuest.phone} onChange={v => setNewGuest({...newGuest, phone: v})} />
                <Input label="Initial Status" type="select" options={['pending', 'attending', 'declined']} value={newGuest.rsvpStatus} onChange={v => setNewGuest({...newGuest, rsvpStatus: v as any})} />
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-stone-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-wedding-gold transition-colors">Add to list</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest List List/Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm shadow-stone-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
                <th className="px-8 py-4">Guest</th>
                <th className="px-8 py-4">Contact</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-center">Size</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredGuests.map(guest => (
                <tr key={guest.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-stone-900">{guest.name}</div>
                    <div className="text-xs text-stone-400 mt-1 uppercase tracking-widest">{guest.id.substring(0, 8)}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Mail className="w-3 h-3" /> {guest.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Phone className="w-3 h-3" /> {guest.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold",
                      guest.rsvpStatus === 'attending' && "bg-emerald-100 text-emerald-700",
                      guest.rsvpStatus === 'declined' && "bg-red-100 text-red-700",
                      guest.rsvpStatus === 'pending' && "bg-stone-100 text-stone-500"
                    )}>
                      {guest.rsvpStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center font-mono text-stone-400">{guest.guestCount}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(guest.id)}
                      className="p-2 text-stone-200 hover:text-red-500 transition-colors lg:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGuests.length === 0 && (
            <div className="py-20 text-center text-stone-400 font-serif italic">
              No guests found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, options, required }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">{label}</label>
      {type === 'select' ? (
        <select 
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-wedding-gold transition-colors appearance-none"
        >
          {options.map((o: string) => (
            <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
          ))}
        </select>
      ) : (
        <input 
          required={required}
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-wedding-gold transition-colors"
        />
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
