"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

export function RatingStars({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = "md",
  showValue = false,
  className 
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  }

  const handleMouseEnter = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating)
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
      setIsHovering(false)
    }
  }

  const handleClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const displayRating = isHovering ? hoverRating : rating

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "transition-colors duration-200",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                displayRating >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200",
                !readonly && "hover:fill-yellow-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void
  initialRating?: number
  initialComment?: string
  isLoading?: boolean
  className?: string
}

export function ReviewForm({ 
  onSubmit, 
  initialRating = 0, 
  initialComment = "", 
  isLoading = false,
  className 
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (comment.trim().length < 10) {
      setError("Review must be at least 10 characters long")
      return
    }

    onSubmit(rating, comment.trim())
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Rating *
        </label>
        <RatingStars
          rating={rating}
          onRatingChange={setRating}
          size="lg"
          showValue
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product (minimum 10 characters)..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none resize-none"
          rows={4}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 characters
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || rating === 0 || comment.trim().length < 10}
        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed"
      >
        {isLoading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}
