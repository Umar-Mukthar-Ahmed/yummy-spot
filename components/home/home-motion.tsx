"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

/** Subtle viewport reveal that respects the visitor's reduced-motion preference. */
export function HomeReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()
  return <motion.div
    className={className}
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
  >{children}</motion.div>
}

/** Decorative, restrained floating motion for the hero illustration. */
export function HeroFloat({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  return <motion.div
    initial={{ y: 0 }}
    animate={{ y: [0, -7, 0] }}
    transition={reduceMotion ? { duration: 0, repeat: 0 } : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
  >{children}</motion.div>
}
