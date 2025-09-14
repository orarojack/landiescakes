"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Camera,
  Calendar,
  MapPin,
  Clock,
  Gift,
  Star,
  Heart,
  MessageSquare,
} from "lucide-react"

interface CakeCustomizationProps {
  basePrice: number
  onCustomizationChange: (customization: any) => void
  onAddToCart: (customizedCake: any) => void
}

const sizeOptions = [
  { name: "1 KG", serves: "8-10 people", price: 0 },
  { name: "2 KG", serves: "15-20 people", price: 1500 },
  { name: "3 KG", serves: "25-30 people", price: 3000 },
]

const flavorOptions = [
  "Vanilla", "Chocolate", "Strawberry", "Red Velvet", "Carrot", "Lemon", "Coffee"
]

const icingOptions = [
  { name: "Soft Icing", description: "Light and fluffy buttercream", price: 0 },
  { name: "Hard Icing", description: "Fondant for smooth finish", price: 500 },
]

const accessoryOptions = [
  { name: "Topper", price: 300, icon: "🎂" },
  { name: "Birthday Card", price: 200, icon: "🎉" },
  { name: "Flowers", price: 400, icon: "🌹" },
  { name: "Balloons", price: 250, icon: "🎈" },
]

const themedCakes = [
  "Birthday", "Wedding", "Anniversary", "Graduation", "Baby Shower", "Holiday", "Corporate", "Custom"
]

export function CakeCustomization({ basePrice, onCustomizationChange, onAddToCart }: CakeCustomizationProps) {
  const [customization, setCustomization] = useState({
    size: "1 KG",
    flavors: [],
    icing: "Soft Icing",
    customMessage: "",
    edibleImage: false,
    nonEdibleImage: false,
    accessories: [],
    deliveryDate: "",
    deliveryTime: "",
    deliveryAddress: "",
    specialInstructions: "",
    themedCake: "",
    themedCakeImage: null,
  })

  const calculateTotalPrice = () => {
    let total = basePrice
    
    const selectedSize = sizeOptions.find(s => s.name === customization.size)
    total += selectedSize?.price || 0
    
    const selectedIcing = icingOptions.find(i => i.name === customization.icing)
    total += selectedIcing?.price || 0
    
    customization.accessories.forEach(accessory => {
      const acc = accessoryOptions.find(a => a.name === accessory)
      total += acc?.price || 0
    })
    
    if (customization.edibleImage) total += 800
    if (customization.nonEdibleImage) total += 500
    
    return total
  }

  const handleChange = (key: string, value: any) => {
    const newCustomization = { ...customization, [key]: value }
    setCustomization(newCustomization)
    onCustomizationChange(newCustomization)
  }

  const formatPriceKsh = (price: number): string => {
    return `KSh ${price.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Choose Size</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={customization.size}
            onValueChange={(value) => handleChange('size', value)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {sizeOptions.map((size) => (
              <div key={size.name} className="flex items-center space-x-3">
                <RadioGroupItem value={size.name} id={size.name} className="sr-only" />
                <Label
                  htmlFor={size.name}
                  className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    customization.size === size.name
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">{size.name}</div>
                    <div className="text-sm text-gray-600">{size.serves}</div>
                    {size.price > 0 && (
                      <div className="text-orange-600 font-bold">+{formatPriceKsh(size.price)}</div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Flavor Selection */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Mix Flavors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {flavorOptions.map((flavor) => (
              <div key={flavor} className="flex items-center space-x-2">
                <Checkbox
                  id={flavor}
                  checked={customization.flavors.includes(flavor)}
                  onCheckedChange={(checked) => {
                    const newFlavors = checked 
                      ? [...customization.flavors, flavor]
                      : customization.flavors.filter(f => f !== flavor)
                    handleChange('flavors', newFlavors)
                  }}
                />
                <Label htmlFor={flavor} className="text-sm font-medium cursor-pointer">
                  {flavor}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Icing Selection */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Icing Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={customization.icing}
            onValueChange={(value) => handleChange('icing', value)}
            className="space-y-4"
          >
            {icingOptions.map((icing) => (
              <div key={icing.name} className="flex items-center space-x-3">
                <RadioGroupItem value={icing.name} id={icing.name} />
                <Label htmlFor={icing.name} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{icing.name}</div>
                      <div className="text-sm text-gray-600">{icing.description}</div>
                    </div>
                    {icing.price > 0 && (
                      <div className="text-orange-600 font-bold">+{formatPriceKsh(icing.price)}</div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Custom Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your custom message for the cake..."
            value={customization.customMessage}
            onChange={(e) => handleChange('customMessage', e.target.value)}
            className="rounded-2xl border-2 focus:border-orange-500"
            maxLength={100}
          />
        </CardContent>
      </Card>

      {/* Themed Cakes */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Themed Cakes (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="themedCake">Select Theme</Label>
            <Select
              value={customization.themedCake}
              onValueChange={(value) => handleChange('themedCake', value)}
            >
              <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                <SelectValue placeholder="Choose a theme (optional)" />
              </SelectTrigger>
              <SelectContent>
                {themedCakes.map((theme) => (
                  <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {customization.themedCake && (
            <div>
              <Label htmlFor="themedCakeImage">Upload Reference Image (Optional)</Label>
              <div className="mt-2">
                <Input
                  id="themedCakeImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        handleChange('themedCakeImage', e.target?.result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="rounded-2xl border-2 focus:border-orange-500"
                />
                {customization.themedCakeImage && (
                  <div className="mt-2">
                    <img 
                      src={customization.themedCakeImage} 
                      alt="Themed cake reference" 
                      className="w-32 h-32 object-cover rounded-2xl border-2 border-orange-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Options */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Add Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="edibleImage"
                checked={customization.edibleImage}
                onCheckedChange={(checked) => handleChange('edibleImage', checked)}
              />
              <Label htmlFor="edibleImage" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Edible Image</div>
                    <div className="text-sm text-gray-600">+{formatPriceKsh(800)}</div>
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="nonEdibleImage"
                checked={customization.nonEdibleImage}
                onCheckedChange={(checked) => handleChange('nonEdibleImage', checked)}
              />
              <Label htmlFor="nonEdibleImage" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Non-Edible Image</div>
                    <div className="text-sm text-gray-600">+{formatPriceKsh(500)}</div>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessories */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Add Accessories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accessoryOptions.map((accessory) => (
              <div key={accessory.name} className="flex items-center space-x-3">
                <Checkbox
                  id={accessory.name}
                  checked={customization.accessories.includes(accessory.name)}
                  onCheckedChange={(checked) => {
                    const newAccessories = checked 
                      ? [...customization.accessories, accessory.name]
                      : customization.accessories.filter(a => a !== accessory.name)
                    handleChange('accessories', newAccessories)
                  }}
                />
                <Label htmlFor={accessory.name} className="flex-1 cursor-pointer">
                  <div className="text-center">
                    <div className="text-2xl">{accessory.icon}</div>
                    <div className="font-semibold">{accessory.name}</div>
                    <div className="text-orange-600 font-bold">+{formatPriceKsh(accessory.price)}</div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card className="border-0 shadow-lg rounded-3xl bg-orange-50">
        <CardHeader>
          <CardTitle className="text-xl font-black">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={customization.deliveryDate}
                onChange={(e) => handleChange('deliveryDate', e.target.value)}
                className="rounded-2xl border-2 focus:border-orange-500"
                min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="deliveryTime">Preferred Time</Label>
              <Select
                value={customization.deliveryTime}
                onValueChange={(value) => handleChange('deliveryTime', value)}
              >
                <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                  <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              placeholder="Enter your complete delivery address..."
              value={customization.deliveryAddress}
              onChange={(e) => handleChange('deliveryAddress', e.target.value)}
              className="rounded-2xl border-2 focus:border-orange-500"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black">Special Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any special requests or dietary requirements..."
            value={customization.specialInstructions}
            onChange={(e) => handleChange('specialInstructions', e.target.value)}
            className="rounded-2xl border-2 focus:border-orange-500"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-r from-orange-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black">Total Price</h3>
            <div className="text-3xl font-black text-orange-600">
              {formatPriceKsh(calculateTotalPrice())}
            </div>
          </div>
          
          <Button
            onClick={() => onAddToCart({
              ...customization,
              totalPrice: calculateTotalPrice(),
            })}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl py-4 text-lg font-bold"
          >
            Add Customized Cake to Cart
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
