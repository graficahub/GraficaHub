'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  const baseStyles = `
    bg-white/10 
    backdrop-blur-md
    border border-white/20 
    rounded-lg
    shadow-md
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  if (onClick) {
    return (
      <div onClick={onClick} className={baseStyles}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={baseStyles}
    >
      {children}
    </motion.div>
  )
}

