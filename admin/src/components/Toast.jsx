import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const Icon = toast.type === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div className={`toast toast-${toast.type}`} role="status" key={toast.id}>
      <Icon size={18} /> {toast.message}
    </div>
  );
}
