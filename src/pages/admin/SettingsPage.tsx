import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Music, Globe, Lock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function SettingsPage() {
  const { weddingId } = useParams();
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    if (!weddingId) return;
    const fetchSettings = async () => {
      const d = await getDoc(doc(db, 'weddings', weddingId));
      if (d.exists()) {
        setMusicEnabled(d.data().musicEnabled || false);
      }
    };
    fetchSettings();
  }, [weddingId]);

  const toggleMusic = async () => {
    if (!weddingId) return;
    const newVal = !musicEnabled;
    setMusicEnabled(newVal);
    await updateDoc(doc(db, 'weddings', weddingId), { musicEnabled: newVal });
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-4xl font-display mb-2">System Settings</h1>
        <p className="text-stone-500 font-serif">Configure dashboard preferences and application security</p>
      </div>

      <div className="space-y-6">
        <SettingRow 
          icon={Music} 
          title="Background Music" 
          desc="Enable auto-playing ambient music for guests" 
          toggle 
          active={musicEnabled}
          onToggle={toggleMusic}
        />
        <SettingRow 
          icon={Bell} 
          title="RSVP Notifications" 
          desc="Receive email alerts when a guest responds" 
          toggle 
          active 
        />
        <SettingRow 
          icon={Globe} 
          title="Custom Domain" 
          desc="Connect your own domain (e.g. rahulwedsanjali.com)" 
          action="Connect" 
        />
        <SettingRow 
          icon={Shield} 
          title="Admin Access" 
          desc="Manage secondary administrator permissions" 
          action="Manage" 
        />
        <SettingRow 
          icon={Lock} 
          title="Security Rules" 
          desc="Current status of database security hardening" 
          status="Hardened" 
        />
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, toggle, active, onToggle, action, status }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-stone-200 flex items-center justify-between group hover:border-wedding-gold transition-colors">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm text-stone-400 font-serif italic">{desc}</p>
        </div>
      </div>
      
      {toggle ? (
        <div 
          onClick={onToggle}
          className={cn(
          "w-12 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer",
          active ? "bg-emerald-500" : "bg-stone-200"
        )}>
          <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-all", active ? "translate-x-6" : "translate-x-0")} />
        </div>
      ) : action ? (
        <button className="px-6 py-2 bg-stone-50 text-stone-900 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-stone-900 hover:text-white transition-all">
          {action}
        </button>
      ) : status ? (
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{status}</span>
      ) : null}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
