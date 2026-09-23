import React from 'react';

interface FooterProps {
  onSelectDisaster?: (id: any) => void;
  onOpenChecklist?: () => void;
  onOpenMap?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 py-6 px-6 mt-auto text-center text-xs font-medium">
      <div>© 2026 RAWAN (Ruang Antisipasi Waspada Anak Nusantara) - Edukasi Mitigasi Kebencanaan.</div>
    </footer>
  );
};

