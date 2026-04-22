'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>
          Page Error
        </h2>
        <p className="text-[var(--fg-muted)] text-sm mb-6 max-w-sm">
          {error.message || 'Something went wrong loading this page. Please try again.'}
        </p>
        <motion.button onClick={reset}
          className="btn btn-primary gap-2" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <RefreshCw size={14} /> Try Again
        </motion.button>
      </motion.div>
    </div>
  );
}
