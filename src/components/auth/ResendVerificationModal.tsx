"use client"

import React from 'react'
import { X } from 'lucide-react';
import { Dispatch, SetStateAction, MouseEventHandler } from 'react';
import { motion } from 'framer-motion';

interface ResendVerificationModalProps {
  showVerifyModal: boolean;
  setShowVerifyModal: Dispatch<SetStateAction<boolean>>;
  modalErrorMessage: string;
  resending: boolean;
  handleResendVerification: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function ResendVerificationModal({
  showVerifyModal,
  setShowVerifyModal,
  modalErrorMessage,
  resending,
  handleResendVerification
}: ResendVerificationModalProps) {
  
  if (!showVerifyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🌟 1. Smooth Backdrop Fade-In and Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setShowVerifyModal(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* 🌟 2. Springy Modal Entry & Exit Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ 
          type: "spring", 
          duration: 0.35, 
          bounce: 0.15 
        }}
        className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-lg z-10"
      >
        {/* Close Button with micro-interactions */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowVerifyModal(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-5 w-5" />
        </motion.button>

        {/* Modal Content */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-destructive">
            Account Activation Required
          </h2>
          <p className="text-sm text-muted-foreground">
            {modalErrorMessage}
          </p>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowVerifyModal(false)}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
            >
              Cancel
            </button>
            
            {/* Button scales slightly down on tap to feel responsive */}
            <motion.button
              whileTap={!resending ? { scale: 0.97 } : {}}
              type="button"
              disabled={resending}
              onClick={handleResendVerification}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/95 disabled:opacity-50 transition"
            >
              {resending ? "Sending Link..." : "Resend Verification Email"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}