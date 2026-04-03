'use client'

import { cn } from '@repo/utils'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight, Eye, EyeClosed, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export function Component() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // For 3D card effect - increased rotation range for more pronounced 3D effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]) // Increased from 5/-5 to 10/-10
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]) // Increased from -5/5 to -10/10

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background gradient effect - matches the purple OnlyPipe style */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]"
        animate={{
          opacity: [0.15, 0.3, 0.15],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-400/20 blur-[60px]"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: 1,
        }}
      />

      {/* Animated glow spots */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card glow effect - reduced intensity */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                  '0 0 15px 5px rgba(255,255,255,0.05)',
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                ],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'mirror',
              }}
            />

            {/* Card background with glass effect */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5" />

              <div className="relative p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.h2
                    className="text-3xl font-bold text-white mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome Back
                  </motion.h2>
                  <motion.p
                    className="text-gray-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Sign in to your account to continue
                  </motion.p>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          'pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500',
                          focusedInput === 'email' && 'border-purple-500/50 bg-purple-500/5'
                        )}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          'pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500',
                          focusedInput === 'password' && 'border-purple-500/50 bg-purple-500/5'
                        )}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeClosed className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember Me & Forgot Password */}
                  <motion.div
                    className="flex items-center justify-between text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-gray-400 group-hover:text-white transition-colors">
                        Remember me
                      </span>
                    </label>
                    <Link
                      href="#"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      'w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400',
                      'text-white font-semibold rounded-lg transition-all duration-300',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'relative overflow-hidden group'
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center gap-2 transition-opacity',
                        isLoading && 'opacity-0'
                      )}
                    >
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    )}
                    {/* Button glow effect */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                  </motion.button>
                </form>

                {/* Divider */}
                <motion.div
                  className="relative my-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-black/40 text-gray-500">or continue with</span>
                  </div>
                </motion.div>

                {/* Sign Up Link */}
                <motion.p
                  className="text-center text-sm text-gray-400 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  Don't have an account?{' '}
                  <Link
                    href="#"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </motion.p>
              </div>
            </div>

            {/* Additional decorative elements */}
            <div className="absolute -top-1 -left-1 w-20 h-20 border-t-2 border-l-2 border-purple-500/30 rounded-tl-xl" />
            <div className="absolute -bottom-1 -right-1 w-20 h-20 border-b-2 border-r-2 border-purple-500/30 rounded-br-xl" />
          </div>
        </motion.div>
      </motion.div>

      {/* Mouse follower glow effect */}
      <motion.div
        className="fixed pointer-events-none w-80 h-80 rounded-full bg-purple-500/20 blur-[100px]"
        animate={{
          x: mousePosition.x - 640,
          y: mousePosition.y - 640,
        }}
        transition={{ type: 'spring', damping: 15 }}
      />
    </div>
  )
}
