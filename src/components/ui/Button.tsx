import { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline'
  fullWidth?: boolean
  children: ReactNode
  isLoading?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  isLoading = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    outline: 'border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white focus:ring-slate-500',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  const isDisabled = disabled || isLoading
  
  return (
    <motion.button
      type={type}
      whileHover={isDisabled ? undefined : { scale: 1.05 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando...
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
