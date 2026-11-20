import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../data/seed';

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {FAQS.map((f, i) => (
        <div key={f.q} className={`faq-item ${open === i ? 'open' : ''}`}>
          <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {f.q} <ChevronDown size={18} />
          </button>
          {open === i && <p className="faq-a">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
