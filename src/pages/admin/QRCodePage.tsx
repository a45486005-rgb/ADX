import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download, ExternalLink, QrCode } from 'lucide-react';

import { useParams } from 'react-router-dom';

export default function QRCodePage() {
  const { weddingId } = useParams();
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    // Determine the public URL of the app
    setAppUrl(`${window.location.origin}/${weddingId}`);
  }, [weddingId]);

  const downloadQR = () => {
    const svg = document.getElementById('wedding-qr');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "wedding-invite-qr.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-4xl font-display mb-2">QR Generator</h1>
        <p className="text-stone-500 font-serif">Generate and share your digital invitation QR codes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[40px] border border-stone-200 shadow-xl shadow-stone-100 flex flex-col items-center justify-center text-center">
          <div className="p-8 bg-stone-50 rounded-[32px] mb-8 border border-stone-100 relative group">
            <QRCodeSVG 
              id="wedding-qr"
              value={appUrl} 
              size={256}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>
          <h3 className="text-2xl font-bold mb-2">Public Invitation QR</h3>
          <p className="text-stone-400 text-sm mb-8 font-serif italic">Scan to view the full digital invitation</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={downloadQR}
              className="flex-1 bg-stone-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-wedding-gold transition-colors"
            >
              <Download className="w-5 h-5" /> Download PNG
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-stone-900 text-white p-10 rounded-[40px] h-full flex flex-col justify-between">
            <div>
              <QrCode className="w-12 h-12 text-wedding-gold mb-6" />
              <h3 className="text-2xl font-display mb-4">Sharing Instructions</h3>
              <ul className="space-y-4 text-stone-400 text-sm font-serif italic">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-wedding-gold/20 text-wedding-gold flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">1</div>
                  <span>Print this QR code on physical cards so guests can access the digital site easily.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-wedding-gold/20 text-wedding-gold flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">2</div>
                  <span>Directly share the URL below for instant access on mobile devices.</span>
                </li>
              </ul>
            </div>

            <div className="mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-wedding-gold font-bold mb-2">Invitation Web URL</p>
              <div className="flex items-center justify-between gap-4">
                <code className="text-stone-300 text-xs truncate flex-1">{appUrl}</code>
                <a 
                  href={appUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
