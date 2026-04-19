'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Activity } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="orb orb-brand" />
      <div className="orb orb-cyan" />

      <motion.div className="relative z-10 text-center max-w-md"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6246ea,#7c3aed)', boxShadow: '0 6px 24px rgba(98,70,234,0.5)' }}>
            <Activity size={20} className="text-white" />
          </div>
          <span className="font-black text-xl text-white" style={{ fontFamily: 'Outfit,sans-serif' }}>
            CLIN<span style={{ color: '#22d3ee' }}>IQ</span>
          </span>
        </div>

        {/* Giant 404 */}
        <div className="relative mb-6">
          <div className="text-[9rem] font-black leading-none select-none"
            style={{ fontFamily: 'Outfit,sans-serif', color: 'transparent',
              WebkitTextStroke: '2px rgba(99,102,241,0.25)' }}>
            404
          </div>
          <motion.div className="absolute inset-0 flex items-center justify-center"
            animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
            <div className="text-[9rem] font-black leading-none select-none text-gradient"
              style={{ fontFamily: 'Outfit,sans-serif', opacity: 0.12 }}>
              404
            </div>
          </motion.div>
        </div>

        <h1 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit,sans-serif' }}>
          Page not found
        </h1>
        <p className="text-[var(--fg-muted)] text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <motion.button onClick={() => router.back()}
            className="btn btn-outline gap-2"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <ArrowLeft size={15} />Go Back
          </motion.button>
          <motion.button onClick={() => router.push('/')}
            className="btn btn-primary gap-2"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Home size={15} />Dashboard
          </motion.button>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-10">
          {[0.2, 0.4, 0.6, 0.4, 0.2].map((o, i) => (
            <motion.div key={i} className="w-2 h-2 rounded-full"
              style={{ background: '#818cf8', opacity: o }}
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15, ease: 'easeInOut' }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
