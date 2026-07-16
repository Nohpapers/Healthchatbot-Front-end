import React, { useEffect, useRef, useState } from 'react';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

export default function PresetDropdown({ label, options, width = 210 }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref} style={{ width }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-4 bg-white border border-[#161415] px-5 h-[42px] w-full
                   hover:bg-[#f7f7f7] transition-colors"
        style={{ ...mono, fontSize: 14, color: '#161415', fontWeight: 700 }}
      >
        {selected || label}
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {open ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[48px] w-full bg-white border border-[#161415] py-2 z-20
                        shadow-[0px_4px_8px_rgba(0,0,0,0.2)]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { setSelected(opt); setOpen(false); }}
              className="w-full text-left px-5 py-2 hover:bg-[#f7f7f7] transition-colors"
              style={{ ...mono, fontSize: 14, color: '#6b5b1f', fontWeight: 700 }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
