'use client'

import { motion } from 'framer-motion'

interface TabsProps {
  activeTab: 'login' | 'register'
  onTabChange: (tab: 'login' | 'register') => void
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2 mb-6 bg-white/5 rounded-lg p-1">
      <button
        onClick={() => onTabChange('login')}
        className={`
          relative flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200
          ${activeTab === 'login' 
            ? 'text-white font-semibold' 
            : 'text-slate-400 hover:text-slate-300 opacity-80'
          }
        `}
      >
        {activeTab === 'login' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-white/15 rounded-md border-b-2 border-blue-500"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10">Entrar</span>
      </button>
      
      <button
        onClick={() => onTabChange('register')}
        className={`
          relative flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200
          ${activeTab === 'register' 
            ? 'text-white font-semibold' 
            : 'text-slate-400 hover:text-slate-300 opacity-80'
          }
        `}
      >
        {activeTab === 'register' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-white/15 rounded-md border-b-2 border-blue-500"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10">Criar conta</span>
      </button>
    </div>
  )
}
