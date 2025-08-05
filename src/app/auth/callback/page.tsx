"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const error = searchParams.get("error")

  useEffect(() => {
    if (success === "google") {
      toast.success("Logged in with Google!")
    } else if (error) {
      toast.error("Google login failed.")
    }

    const timeout = setTimeout(() => {
      router.push("/")
    }, 1500)

    return () => clearTimeout(timeout)
  }, [success, error, router])

  return <Toaster position="top-center" /> // must render this
}
