import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Image as ImageIcon, Heart, Sparkles, MessageSquare, Phone, Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function WebsiteCustomizer() {
  const { weddingId } = useParams();
  const [formData, setFormData] = useState({
    coupleNames: '',
    story: '',
    themeColor: '#D4AF37',
    heroImage: '',
    musicEnabled: false,
    contactPhone: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!weddingId) return;
    const fetchConfig = async () => {
      const d = await getDoc(doc(db, 'weddings', weddingId));
      if (d.exists()) setFormData(d.data() as any);
      setLoading(false);
    };
    fetchConfig();
  }, [weddingId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'weddings', weddingId), {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert('Website preferences updated successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse flex items-center justify-center py-20 text-stone-400">Loading Configuration...</div>;

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-4xl font-display mb-2">Customization</h1>
        <p className="text-stone-500 font-serif">Personalize your invitation website theme and content</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <Section title="Basic Information" icon={Heart}>
            <div className="grid grid-cols-1 gap-6">
              <Input label="Couple Names (e.g. Rahul & Anjali)" value={formData.coupleNames} onChange={v => setFormData({...formData, coupleNames: v})} />
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Our Story</label>
                <textarea 
                  value={formData.story}
                  onChange={e => setFormData({...formData, story: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-wedding-gold transition-colors h-48 resize-none"
                  placeholder="Share how you both met..."
                />
              </div>
            </div>
          </Section>

          <Section title="Visual Appearance" icon={Sparkles}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Hero Banner Image URL" value={formData.heroImage} onChange={v => setFormData({...formData, heroImage: v})} />
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Theme Gold Shade</label>
                <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-xl px-4 py-2">
                  <input 
                    type="color" 
                    value={formData.themeColor} 
                    onChange={e => setFormData({...formData, themeColor: e.target.value})}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-sm font-mono text-stone-500">{formData.themeColor}</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-8">
          <div className="bg-stone-900 text-white rounded-3xl p-8 sticky top-10 flex flex-col gap-8 shadow-2xl shadow-stone-300">
            <h3 className="font-display text-xl border-b border-white/10 pb-4">Status & Sync</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-wedding-gold" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 tracking-widest">VISIBILITY</p>
                  <p className="text-sm">Live Public Site</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-emerald-500/20 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-emerald-500 rounded-full" />
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed italic font-serif">
              Changes applied here will reflect instantly on your public invitation page after saving.
            </p>

            <button 
              type="submit"
              disabled={saving}
              className="mt-4 w-full bg-wedding-gold text-stone-900 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Update Website'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-stone-50 rounded-lg text-wedding-gold">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">{label}</label>
      <input 
        type="text" 
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-wedding-gold transition-colors"
      />
    </div>
  );
}
