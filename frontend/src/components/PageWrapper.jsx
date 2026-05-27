/**
 * components/PageWrapper.jsx  ← NEW
 * Animated page-level wrapper — fade + slide-up on mount.
 */

import React from "react";
import { motion } from "framer-motion";

const pageVariants = {
  hidden:  { opacity: 0, y: 20 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.07 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const PageWrapper = ({ children, className = "" }) => (
  <motion.div
    variants={pageVariants}
    initial="hidden"
    animate="show"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);

export default PageWrapper;