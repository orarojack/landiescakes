"use client"

import type React from "react"

import { useState, useRef, useLayoutEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/modern/loading-spinner"
import Image from "next/image"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BUYER",
    businessName: "",
    businessDescription: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const logoRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (logoRef.current) {
      logoRef.current.classList.add("animate-bounce-fade-in")
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordStrengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"][passwordStrength]
  const passwordStrengthColor = ["red", "orange", "yellow", "blue", "green"][passwordStrength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Please use a stronger password.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully. You will be redirected to the login page.
            </p>
            <LoadingSpinner size="sm" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {success ? (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your account has been created successfully. You will be redirected to the login page.
              </p>
              <LoadingSpinner size="sm" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
            {/* Logo Header */}
            <div className="flex flex-col items-center mb-8">
              <div ref={logoRef} className="w-20 h-20 mb-4 rounded-full overflow-hidden shadow-2xl bg-white/80 flex items-center justify-center transition-all duration-700">
                <Image src="/landy-logo.jpg" alt="Landy Cakes & Pastries Logo" width={80} height={80} className="object-cover" />
          </div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">Join CakeMarket</h1>
              <p className="text-gray-600 text-lg font-medium mb-2">Create your account and start your cake journey</p>
              <span className="text-sm text-purple-500 font-semibold tracking-wide mb-2">Delight in every slice.</span>
        </div>

        {/* Registration Form */}
            <div className="relative animate-fade-in-slide">
              <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-orange-500 to-pink-500 rounded-l-3xl" />
              <Card className="bg-white/60 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl pl-4">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-600">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
                    <Alert className="border-red-200 bg-red-50 rounded-2xl animate-fade-in">
                <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field with Floating Label */}
                    <div className="relative pt-2">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                        className="peer pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg w-full transition-all duration-300 focus:shadow-orange-200/40 outline-none"
                        placeholder=" "
                        id="register-name"
                  />
                      <label htmlFor="register-name" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 -top-3 text-xs bg-white/80 px-1">
                        Full Name
                      </label>
              </div>

                    {/* Email Field with Floating Label */}
                    <div className="relative pt-2">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                        className="peer pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg w-full transition-all duration-300 focus:shadow-orange-200/40 outline-none"
                        placeholder=" "
                        id="register-email"
                  />
                      <label htmlFor="register-email" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 -top-3 text-xs bg-white/80 px-1">
                        Email Address
                      </label>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Account Type</label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger className="py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg transition-all duration-300 focus:shadow-orange-200/40">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUYER">Buyer - Browse and purchase cakes</SelectItem>
                    <SelectItem value="SELLER">Seller - Sell your cakes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Business Fields for Sellers */}
              {formData.role === "SELLER" && (
                <>
                        <div className="relative pt-2">
                          <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                          <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        required
                            className="peer pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg w-full transition-all duration-300 focus:shadow-orange-200/40 outline-none"
                            placeholder=" "
                            id="register-business-name"
                      />
                          <label htmlFor="register-business-name" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 -top-3 text-xs bg-white/80 px-1">
                            Business Name
                          </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Business Description</label>
                    <Textarea
                      value={formData.businessDescription}
                      onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                      placeholder="Describe your business and specialties"
                            className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md transition-all duration-300 focus:shadow-orange-200/40"
                      rows={3}
                      required
                    />
                  </div>
                </>
              )}

                    {/* Password Field with Floating Label */}
                    <div className="relative pt-2">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                        className="peer pl-12 pr-12 py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg w-full transition-all duration-300 focus:shadow-orange-200/40 outline-none"
                        placeholder=" "
                        id="register-password"
                  />
                      <label htmlFor="register-password" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 -top-3 text-xs bg-white/80 px-1">
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
                {formData.password && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300`}
                        style={{
                          width: `${(passwordStrength / 5) * 100}%`,
                          backgroundColor: passwordStrengthColor,
                        }}
                      />
                    </div>
                    <span className={`text-sm font-medium text-${passwordStrengthColor}-600`}>
                      {passwordStrengthText}
                    </span>
                  </div>
                )}

                    {/* Confirm Password Field with Floating Label */}
                    <div className="relative pt-2">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                        className="peer pl-12 pr-12 py-6 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/60 backdrop-blur-md text-lg w-full transition-all duration-300 focus:shadow-orange-200/40 outline-none"
                        placeholder=" "
                        id="register-confirm-password"
                  />
                      <label htmlFor="register-confirm-password" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 -top-3 text-xs bg-white/80 px-1">
                        Confirm Password
                      </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}

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
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

                  {/* Divider for Already have an account */}
                  <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="mx-4 text-gray-400 font-medium">Already have an account?</span>
                    <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign In Link */}
            <Link href="/auth/login">
              <Button
                variant="outline"
                      className="w-full border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 rounded-2xl py-6 text-lg font-bold bg-transparent transition-all duration-300 hover:scale-105"
              >
                Sign In Instead
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
        </div>
      )}
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
