"use client"

import type React from "react"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/modern/loading-spinner"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const logoRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (logoRef.current) {
      logoRef.current.classList.add("animate-bounce-fade-in")
    }
  }, [])

  // Redirect buyer to homepage after login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "BUYER") {
      router.replace("/")
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // No reload, let useEffect handle redirect
      }
    } catch (error) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-8">
            <div ref={logoRef} className="w-20 h-20 mb-4 rounded-full overflow-hidden shadow-2xl bg-white/80 flex items-center justify-center transition-all duration-700">
              <Image src="/landy-logo.jpg" alt="Landy Cakes & Pastries Logo" width={80} height={80} className="object-cover" />
          </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome Back!</h1>
            <p className="text-gray-600 text-lg font-medium mb-2">Sign in to your CakeMarket account</p>
            <span className="text-sm text-purple-500 font-semibold tracking-wide mb-2">Delight in every slice.</span>
        </div>

        {/* Login Form */}
          <div className="relative animate-fade-in-slide">
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-orange-500 to-pink-500 rounded-l-3xl" />
            <Card className="bg-white/60 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl pl-4">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
                  <Alert className="border-red-200 bg-red-50 rounded-2xl animate-fade-in">
                <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field with Floating Label */}
                  <div className="relative pt-2">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                      className="peer pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg w-full transition-all duration-300 focus:shadow-orange-200/40 outline-none"
                      placeholder=" "
                      id="login-email"
                  />
                    <label htmlFor="login-email" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 -top-3 text-xs bg-white/80 px-1">
                      Email Address
                    </label>
              </div>

                  {/* Password Field with Floating Label */}
                  <div className="relative pt-2">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                      className="peer pl-12 pr-12 py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg w-full transition-all duration-300 focus:shadow-orange-200/40 outline-none"
                      placeholder=" "
                      id="login-password"
                  />
                    <label htmlFor="login-password" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 -top-3 text-xs bg-white/80 px-1">
                      Password
                    </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input type="checkbox" className="accent-orange-500 w-5 h-5 rounded border-2 border-gray-300 focus:ring-2 focus:ring-orange-200 transition-all duration-200" />
                      <span className="text-gray-700 font-medium text-sm">Remember me</span>
                    </label>
                    <Link href="/auth/forgot" className="text-sm text-orange-500 hover:underline font-medium">Forgot password?</Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl py-6 text-lg font-bold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 transform hover:scale-105 animate-gradient-shimmer"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

                {/* Divider for Social Login */}
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="mx-4 text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                {/* Social login buttons can be added here in the future */}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Don't have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link href="/auth/register">
              <Button
                variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 rounded-2xl py-6 text-lg font-bold bg-transparent transition-all duration-300 hover:scale-105"
              >
                Create New Account
              </Button>
            </Link>
          </CardContent>
        </Card>
              </div>
            </div>
      </div>
      <style jsx global>{`
        @keyframes bounce-fade-in {
          0% { opacity: 0; transform: scale(0.8) translateY(-30px); }
          60% { opacity: 1; transform: scale(1.1) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-bounce-fade-in {
          animation: bounce-fade-in 1.2s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fade-in-slide {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-slide {
          animation: fade-in-slide 1s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes gradient-shimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.08); }
          100% { filter: brightness(1); }
        }
        .animate-gradient-shimmer:hover {
          animation: gradient-shimmer 1.2s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
