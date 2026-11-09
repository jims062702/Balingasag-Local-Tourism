import React from 'react';
import { motion } from 'framer-motion';

/**
 * DroppingWaterAnimation:
 * Authentic dropping water animation where droplets form, fall with gravity acceleration,
 * and create an expanding ripple splash upon impact.
 */
export const DroppingWaterAnimation: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-cyan-950/40 border border-cyan-500/20 ${className}`}>
      <svg viewBox="0 0 40 40" className="w-full h-full">
        {/* Top Dropper / Condensation Source */}
        <path
          d="M17 4 H23 C22 7, 18 7, 17 4 Z"
          fill="#38bdf8"
          opacity="0.8"
        />

        {/* Droplet 1: Falling with Gravity Easing */}
        <motion.path
          d="M20 7 C18.5 10, 18 12, 18 13.5 C18 15, 19 16, 20 16 C21 16, 22 15, 22 13.5 C22 12, 21.5 10, 20 7 Z"
          fill="#38bdf8"
          initial={{ y: 0, opacity: 0, scaleY: 0.8 }}
          animate={{
            y: [0, 2, 20],
            opacity: [0, 1, 0.9, 0],
            scaleY: [0.8, 1.2, 1.4, 0.6],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: [0.45, 0, 0.8, 0.6], // Accelerate downwards like gravity
            times: [0, 0.2, 0.9, 1],
          }}
        />

        {/* Droplet 1 Impact Ripple / Splash */}
        <motion.ellipse
          cx="20"
          cy="34"
          rx="2"
          ry="0.8"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="1.2"
          initial={{ rx: 1, ry: 0.4, opacity: 0 }}
          animate={{
            rx: [1, 7],
            ry: [0.4, 2.5],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: 1.3, // Triggers right when the droplet lands
            ease: 'easeOut',
          }}
        />

        {/* Secondary Droplet (Staggered) */}
        <motion.path
          d="M20 7 C18.8 9.5, 18.5 11, 18.5 12 C18.5 13, 19.2 13.8, 20 13.8 C20.8 13.8, 21.5 13, 21.5 12 C21.5 11, 21.2 9.5, 20 7 Z"
          fill="#0ea5e9"
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, 2, 20],
            opacity: [0, 0.85, 0.8, 0],
            scaleY: [0.8, 1.15, 1.3, 0.5],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: 0.8, // Halfway staggered
            ease: [0.45, 0, 0.8, 0.6],
          }}
        />

        {/* Secondary Impact Ripple */}
        <motion.ellipse
          cx="20"
          cy="34"
          rx="1"
          ry="0.4"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1"
          initial={{ rx: 1, ry: 0.4, opacity: 0 }}
          animate={{
            rx: [1, 5.5],
            ry: [0.4, 2],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: 2.1,
            ease: 'easeOut',
          }}
        />

        {/* Water Level / Base Puddle */}
        <ellipse cx="20" cy="35" rx="9" ry="2" fill="#0284c7" opacity="0.4" />
      </svg>
    </div>
  );
};

/**
 * BlowingWindAnimation:
 * Authentic blowing wind animation with flowing horizontal breeze currents,
 * swooping wind swirl lines, and floating air particles blowing across.
 */
export const BlowingWindAnimation: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-teal-950/40 border border-teal-500/20 ${className}`}>
      <svg viewBox="0 0 50 40" className="w-full h-full">
        {/* Stream 1: Top Breeze Stream with Loop Gust */}
        <motion.path
          d="M2 13 Q16 13 24 11 Q32 9 36 12 Q40 15 37 18 Q34 20 31 17"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="16 28"
          animate={{
            strokeDashoffset: [44, -44],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Stream 2: Middle Strong Gust Swoop */}
        <motion.path
          d="M1 21 Q18 21 28 20 Q38 19 44 22"
          fill="none"
          stroke="#5eead4"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="20 30"
          animate={{
            strokeDashoffset: [50, -50],
          }}
          transition={{
            duration: 1.7,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Stream 3: Lower Coastal Breeze with Loop */}
        <motion.path
          d="M4 29 Q15 29 22 28 Q29 27 32 30 Q35 33 32 35 Q29 36 27 33"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="14 26"
          animate={{
            strokeDashoffset: [40, -40],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Drifting Wind Particles / Sea Spray Motes */}
        <motion.circle
          r="1"
          fill="#ccfbf1"
          initial={{ cx: 0, cy: 19, opacity: 0 }}
          animate={{
            cx: [0, 48],
            cy: [18, 22, 19],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: 1.7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.circle
          r="0.8"
          fill="#99f6e4"
          initial={{ cx: 0, cy: 12, opacity: 0 }}
          animate={{
            cx: [4, 46],
            cy: [12, 15, 11],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: 0.6,
            ease: 'easeInOut',
          }}
        />
        <motion.circle
          r="0.9"
          fill="#5eead4"
          initial={{ cx: 0, cy: 28, opacity: 0 }}
          animate={{
            cx: [2, 44],
            cy: [28, 26, 30],
            opacity: [0, 0.75, 0.75, 0],
          }}
          transition={{
            duration: 2.0,
            repeat: Infinity,
            delay: 1.1,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
};
