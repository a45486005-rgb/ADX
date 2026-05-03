import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ImageIcon, Plus, Trash2, Camera } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  order: number;
}

export default function GalleryManager() {
  const { weddingId } = useParams();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ url: '', caption: '', order: 0 });

  const fetchItems = async () => {
    if (!weddingId) return;
    const q = query(collection(db, 'weddings', weddingId, 'gallery'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
  };

  useEffect(() => {
    fetchItems();
  }, [weddingId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;
    await addDoc(collection(db, 'weddings', weddingId, 'gallery'), { ...newItem, order: items.length });
    setIsAdding(false);
    setNewItem({ url: '', caption: '', order: 0 });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!weddingId) return;
    if (confirm('Delete this image?')) {
      await deleteDoc(doc(db, 'weddings', weddingId, 'gallery', id));
      fetchItems();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display mb-2">Gallery Manager</h1>
          <p className="text-stone-500 font-serif">Upload and organize the wedding photo collection</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-wedding-gold transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Photo
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] border border-stone-200 shadow-xl">
          <form onSubmit={handleAdd} className="space-y-4">
            <input 
              type="url" 
              placeholder="Image URL" 
              value={newItem.url}
              onChange={e => setNewItem({...newItem, url: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50"
              required
            />
            <input 
              type="text" 
              placeholder="Caption (optional)" 
              value={newItem.caption}
              onChange={e => setNewItem({...newItem, caption: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-stone-400">Cancel</button>
              <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded-xl">Save Photo</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="aspect-square bg-white rounded-[32px] border border-stone-200 overflow-hidden relative group">
            <img 
              src={item.url} 
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
              alt={item.caption}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-3 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        <div 
          onClick={() => setIsAdding(true)}
          className="aspect-square border-2 border-dashed border-stone-200 rounded-[32px] flex flex-col items-center justify-center gap-4 text-stone-300 hover:border-wedding-gold hover:text-wedding-gold cursor-pointer transition-all"
        >
          <Camera className="w-8 h-8" />
          <span className="text-xs font-bold uppercase tracking-widest">Upload New</span>
        </div>
      </div>
    </div>
  );
}
