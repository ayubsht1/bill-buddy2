"use client"
import React from 'react'
import { X } from 'lucide-react';
import { Dispatch,SetStateAction, MouseEventHandler } from 'react';

interface ResendVerificationModalProps {
  showVerifyModal: boolean;
  setShowVerifyModal: Dispatch<SetStateAction<boolean>>;
  modalErrorMessage: string;
  resending : boolean;
  handleResendVerification:MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function ResendVerificationModal({showVerifyModal,setShowVerifyModal,modalErrorMessage,resending,handleResendVerification}:ResendVerificationModalProps) {
  return (
    <div>
        {/* 💡 Verification Modal Overlay */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>

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
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendVerification}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/95 disabled:opacity-50 transition"
                >
                  {resending ? "Sending Link..." : "Resend Verification Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
