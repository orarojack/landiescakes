"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, X, Send, Phone, Mail, Clock, CheckCircle, HelpCircle, Star, Truck, Shield, Users } from "lucide-react"

interface FloatingHelpIconProps {
  className?: string
}

export default function FloatingHelpIcon({ className = "" }: FloatingHelpIconProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot" as const,
      content: "Hello! 👋 How can I help you today? I can assist with cake orders, delivery questions, or any other inquiries.",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: newMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: "bot" as const,
        content: getBotResponse(newMessage),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes("delivery") || lowerMessage.includes("shipping")) {
      return "We offer free delivery for orders above KSh 5,000 within Nairobi. Same-day delivery is available for orders placed before 2 PM. Delivery takes 2-4 hours."
    } else if (lowerMessage.includes("payment") || lowerMessage.includes("pay")) {
      return "We accept M-Pesa, Airtel Money, and card payments. Payment is required at the time of ordering. We also offer cash on delivery for orders above KSh 3,000."
    } else if (lowerMessage.includes("custom") || lowerMessage.includes("design")) {
      return "Yes! We offer custom cake designs. Please place your order at least 24-48 hours in advance for custom cakes. You can upload photos and specify your requirements during checkout."
    } else if (lowerMessage.includes("allergen") || lowerMessage.includes("dietary")) {
      return "We offer various dietary options including gluten-free, dairy-free, and vegan cakes. All allergen information is listed on each product page. Please specify any dietary requirements in your order notes."
    } else if (lowerMessage.includes("refund") || lowerMessage.includes("return")) {
      return "We offer a 100% satisfaction guarantee. If you're not happy with your cake, contact us within 24 hours of delivery for a full refund or replacement."
    } else if (lowerMessage.includes("contact") || lowerMessage.includes("phone")) {
      return "You can reach us at +254 700 000 000 or email us at support@cakemarketplace.com. Our customer service team is available 7 days a week from 8 AM to 8 PM."
    } else {
      return "Thank you for your message! I'm here to help with any questions about our cakes, delivery, payments, or custom orders. Feel free to ask anything!"
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "How does delivery work?",
    "What payment methods do you accept?",
    "Can I customize my cake?",
    "What about dietary restrictions?",
  ]

  const faqItems = [
    {
      question: "How far in advance should I order?",
      answer: "For regular cakes, we recommend ordering at least 24 hours in advance. Custom cakes require 48-72 hours notice."
    },
    {
      question: "Do you deliver outside Nairobi?",
      answer: "Yes! We deliver to most areas within 50km of Nairobi. Additional delivery fees may apply for distant locations."
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "Orders can be modified up to 12 hours before delivery. Cancellations are accepted up to 6 hours before delivery with a full refund."
    },
    {
      question: "What if my cake arrives damaged?",
      answer: "We take great care in packaging and delivery. If your cake arrives damaged, we'll provide a full refund or replacement immediately."
    },
    {
      question: "Do you offer wedding cakes?",
      answer: "Absolutely! We specialize in wedding cakes and offer consultations for custom designs. Wedding cakes should be ordered at least 2 weeks in advance."
    }
  ]

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      value: "+254 700 000 000",
      description: "Available 8 AM - 8 PM"
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "support@cakemarketplace.com",
      description: "We'll respond within 2 hours"
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "7 Days a Week",
      description: "8:00 AM - 8:00 PM"
    }
  ]

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}>
      {/* Help Window */}
      {isOpen && (
        <Card className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[calc(100vh-8rem)] sm:h-96 md:h-[500px] max-w-sm sm:max-w-md shadow-2xl border-0 rounded-2xl sm:rounded-3xl mb-4 bg-white/95 backdrop-blur-sm flex flex-col">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="relative">
                    {/* Main speech bubble */}
                    <div className="w-3 h-2 sm:w-4 sm:h-3 bg-white rounded-full relative">
                      <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white transform rotate-45"></div>
                    </div>
                    {/* Secondary speech bubble */}
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1"></div>
                    {/* Typing dots */}
                    <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 flex space-x-0.5">
                      <div className="w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
                      <div className="w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900 truncate">Cake Help</CardTitle>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs text-gray-600 truncate">Online now</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 p-3 sm:p-4 pt-0 min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 h-8 sm:h-10 flex-shrink-0">
                <TabsTrigger value="chat" className="rounded-lg sm:rounded-xl text-xs font-medium px-2 sm:px-3">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="faq" className="rounded-lg sm:rounded-xl text-xs font-medium px-2 sm:px-3">
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="contact" className="rounded-lg sm:rounded-xl text-xs font-medium px-2 sm:px-3">
                  Contact
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex flex-col flex-1 mt-3 sm:mt-4 min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 mb-3 sm:mb-4 px-1 min-h-0">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="mb-3 sm:mb-4 flex-shrink-0">
                    <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setNewMessage(question)}
                          className="text-xs bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-left transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex space-x-1.5 sm:space-x-2 flex-shrink-0">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 resize-none rounded-xl sm:rounded-2xl border-2 focus:border-orange-500 focus:ring-0 text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl sm:rounded-2xl px-2.5 sm:px-3 h-10 sm:h-11 flex-shrink-0"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="flex-1 mt-2 sm:mt-3 overflow-y-auto min-h-0">
                <div className="space-y-2 sm:space-y-3 px-1 pb-2">
                  {faqItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1.5 sm:mb-2 leading-tight">{item.question}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="flex-1 mt-2 sm:mt-3 overflow-y-auto min-h-0">
                <div className="space-y-2 sm:space-y-3 px-1 pb-2">
                  {contactInfo.map((contact, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <div className="flex items-center space-x-2.5 sm:space-x-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <contact.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{contact.title}</h4>
                          <p className="text-xs text-gray-600 font-medium truncate">{contact.value}</p>
                          <p className="text-xs text-gray-500 truncate">{contact.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Additional Info */}
                  <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-orange-200">
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-2.5 sm:mb-3">Why choose us?</h4>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center space-x-2">
                        <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">4.8/5 average rating</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">Free delivery over KSh 5,000</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">100% satisfaction guarantee</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3 text-purple-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">10,000+ happy customers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Floating Help Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-0"
      >
        <div className="relative">
          {/* Main speech bubble */}
          <div className="w-5 h-3 sm:w-6 sm:h-4 bg-white rounded-full relative">
            <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-2 h-2 sm:w-3 sm:h-3 bg-white transform rotate-45"></div>
          </div>
          {/* Secondary speech bubble */}
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1"></div>
          {/* Typing dots */}
          <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 flex space-x-0.5 sm:space-x-1">
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-pulse"></div>
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </Button>
    </div>
  )
} 