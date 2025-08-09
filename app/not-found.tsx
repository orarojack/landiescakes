import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 flex items-center justify-center">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Illustration */}
          <div className="mb-12">
            <div className="text-9xl font-black text-gray-200 mb-4">404</div>
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-6xl">🎂</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Oops! Page Not Found</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              The cake you're looking for seems to have been eaten! Don't worry, we have plenty more delicious options
              waiting for you.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                <Home className="h-5 w-5 mr-3" />
                Go Home
              </Button>
            </Link>

            <Link href="/cakes">
              <Button
                variant="outline"
                className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-300"
              >
                <Search className="h-5 w-5 mr-3" />
                Browse Cakes
              </Button>
            </Link>
          </div>

          {/* Suggestions */}
          <div className="mt-16 p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Suggestions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/cakes?category=birthday" className="group">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 group-hover:from-pink-100 group-hover:to-purple-100 transition-all duration-300">
                  <div className="text-3xl mb-2">🎂</div>
                  <div className="font-bold text-gray-900">Birthday Cakes</div>
                </div>
              </Link>

              <Link href="/cakes?category=wedding" className="group">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                  <div className="text-3xl mb-2">💒</div>
                  <div className="font-bold text-gray-900">Wedding Cakes</div>
                </div>
              </Link>

              <Link href="/cakes?category=chocolate" className="group">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 group-hover:from-amber-100 group-hover:to-orange-100 transition-all duration-300">
                  <div className="text-3xl mb-2">🍫</div>
                  <div className="font-bold text-gray-900">Chocolate Cakes</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
