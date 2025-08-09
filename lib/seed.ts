import { prisma } from "./db"
import { UserRole, SellerStatus } from "@prisma/client"

export async function seedDatabase() {
  try {
    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: "Birthday Cakes" },
        update: {},
        create: {
          name: "Birthday Cakes",
          description: "Perfect cakes for birthday celebrations",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.upsert({
        where: { name: "Wedding Cakes" },
        update: {},
        create: {
          name: "Wedding Cakes",
          description: "Elegant cakes for your special day",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.upsert({
        where: { name: "Chocolate Cakes" },
        update: {},
        create: {
          name: "Chocolate Cakes",
          description: "Rich and decadent chocolate cakes",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.upsert({
        where: { name: "Fruit Cakes" },
        update: {},
        create: {
          name: "Fruit Cakes",
          description: "Fresh and fruity cake options",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.upsert({
        where: { name: "Custom Cakes" },
        update: {},
        create: {
          name: "Custom Cakes",
          description: "Personalized cakes made to your specifications",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.upsert({
        where: { name: "Cupcakes" },
        update: {},
        create: {
          name: "Cupcakes",
          description: "Individual treats perfect for any occasion",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.upsert({
        where: { name: "Cheesecakes" },
        update: {},
        create: {
          name: "Cheesecakes",
          description: "Rich and creamy cheesecakes in various flavors",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.upsert({
        where: { name: "Vegan Cakes" },
        update: {},
        create: {
          name: "Vegan Cakes",
          description: "Plant-based cakes made without animal products",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
    ])

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@cakemarket.com" },
      update: {},
      create: {
        email: "admin@cakemarket.com",
        name: "Admin User",
        role: UserRole.ADMIN,
        verified: true,
      },
    })

    // Create seller users and their seller profiles
    const seller1 = await prisma.user.upsert({
      where: { email: "sweetdreams@bakery.com" },
      update: {},
      create: {
        email: "sweetdreams@bakery.com",
        name: "Maria Rodriguez",
        role: UserRole.SELLER,
        verified: true,
        seller: {
          create: {
            businessName: "Sweet Dreams Bakery",
            description: "Premium handcrafted cakes made with love and finest ingredients",
            businessAddress: "123 Baker Street, Nairobi, Kenya",
            businessPhone: "+254712345678",
            experience: 5,
            verified: true,
            rating: 4.8,
            totalReviews: 124,
            totalSales: 450,
            status: SellerStatus.APPROVED,
            specialties: JSON.stringify(["Birthday Cakes", "Wedding Cakes", "Custom Designs"]),
          },
        },
      },
      include: {
        seller: true,
      },
    })

    const seller2 = await prisma.user.upsert({
      where: { email: "artisan@cakes.com" },
      update: {},
      create: {
        email: "artisan@cakes.com",
        name: "David Kim",
        role: UserRole.SELLER,
        verified: true,
        seller: {
          create: {
            businessName: "Artisan Cake Studio",
            description: "Modern cake designs with traditional flavors",
            businessAddress: "456 Cake Avenue, Mombasa, Kenya",
            businessPhone: "+254723456789",
            experience: 8,
            verified: true,
            rating: 4.9,
            totalReviews: 89,
            totalSales: 320,
            status: SellerStatus.APPROVED,
            specialties: JSON.stringify(["Chocolate Cakes", "Fruit Cakes", "Vegan Options"]),
          },
        },
      },
      include: {
        seller: true,
      },
    })

    // Create buyer users
    const buyer1 = await prisma.user.upsert({
      where: { email: "john@example.com" },
      update: {},
      create: {
        email: "john@example.com",
        name: "John Smith",
        role: UserRole.BUYER,
        phone: "+254734567890",
        verified: true,
      },
    })

    const buyer2 = await prisma.user.upsert({
      where: { email: "sarah@example.com" },
      update: {},
      create: {
        email: "sarah@example.com",
        name: "Sarah Johnson",
        role: UserRole.BUYER,
        phone: "+254745678901",
        verified: true,
      },
    })

    // Create products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Chocolate Truffle Delight",
          description:
            "Indulge in our signature chocolate truffle cake, featuring layers of rich chocolate sponge, velvety truffle filling, and a glossy ganache coating. Decorated with handcrafted chocolate roses and gold leaf accents.",
          shortDescription: "Rich chocolate cake with truffle filling and ganache coating",
          price: 4599,
          originalPrice: 5299,
          discount: 13,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=500&fit=crop",
            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=500&fit=crop",
          ]),
          categoryId: categories.find((c) => c.name === "Chocolate Cakes")!.id,
          sellerId: seller1.seller!.id,
          tags: JSON.stringify(["chocolate", "truffle", "premium", "birthday"]),
          rating: 4.8,
          reviewCount: 124,
          stockQuantity: 15,
          preparationTime: "2-3 hours",
          servingSize: "8-10 people",
          weight: 2.5,
          allergens: JSON.stringify(["eggs", "dairy", "gluten", "nuts"]),
          ingredients: JSON.stringify(["Premium Chocolate", "Fresh Cream", "Organic Eggs", "Belgian Cocoa"]),
          customizable: true,
          customOptions: JSON.stringify(["Custom Message", "Photo Print", "Color Theme"]),
          isFeatured: true,
          isNew: false,
          freeShipping: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Vanilla Bean Wedding Cake",
          description:
            "Elegant 3-tier vanilla bean cake with buttercream roses and pearl decorations. Perfect for your special day with premium vanilla beans and fresh cream.",
          shortDescription: "Elegant 3-tier vanilla bean cake with buttercream roses",
          price: 8999,
          images: JSON.stringify(["https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=500&fit=crop"]),
          categoryId: categories.find((c) => c.name === "Wedding Cakes")!.id,
          sellerId: seller1.seller!.id,
          tags: JSON.stringify(["wedding", "vanilla", "elegant", "3-tier"]),
          rating: 4.9,
          reviewCount: 89,
          stockQuantity: 5,
          preparationTime: "24 hours",
          servingSize: "50+ people",
          weight: 8.0,
          allergens: JSON.stringify(["eggs", "dairy", "gluten"]),
          ingredients: JSON.stringify(["Vanilla Beans", "Fresh Cream", "Organic Eggs", "Premium Flour"]),
          customizable: true,
          customOptions: JSON.stringify(["Custom Message", "Tier Colors", "Decoration Style"]),
          isFeatured: true,
          isNew: true,
          freeShipping: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Red Velvet Classic",
          description:
            "Traditional red velvet cake with cream cheese frosting. Moist, tender crumb with the perfect balance of cocoa and vanilla flavors.",
          shortDescription: "Traditional red velvet with cream cheese frosting",
          price: 3299,
          images: JSON.stringify(["https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=500&fit=crop"]),
          categoryId: categories.find((c) => c.name === "Birthday Cakes")!.id,
          sellerId: seller2.seller!.id,
          tags: JSON.stringify(["red velvet", "classic", "cream cheese"]),
          rating: 4.7,
          reviewCount: 156,
          stockQuantity: 20,
          preparationTime: "1-2 hours",
          servingSize: "6-8 people",
          weight: 1.8,
          allergens: JSON.stringify(["eggs", "dairy", "gluten"]),
          ingredients: JSON.stringify(["Cocoa Powder", "Cream Cheese", "Red Food Coloring", "Buttermilk"]),
          customizable: false,
          isFeatured: false,
          isNew: false,
          freeShipping: false,
        },
      }),
      prisma.product.create({
        data: {
          name: "Strawberry Shortcake",
          description:
            "Fresh strawberries layered with fluffy sponge cake and whipped cream. Light, airy, and bursting with fresh fruit flavors.",
          shortDescription: "Fresh strawberries with whipped cream and sponge layers",
          price: 2899,
          images: JSON.stringify(["https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=500&fit=crop"]),
          categoryId: categories.find((c) => c.name === "Fruit Cakes")!.id,
          sellerId: seller2.seller!.id,
          tags: JSON.stringify(["strawberry", "fresh", "light", "seasonal"]),
          rating: 4.6,
          reviewCount: 98,
          stockQuantity: 12,
          preparationTime: "1 hour",
          servingSize: "4-6 people",
          weight: 1.2,
          allergens: JSON.stringify(["eggs", "dairy", "gluten"]),
          ingredients: JSON.stringify(["Fresh Strawberries", "Whipped Cream", "Sponge Cake", "Sugar"]),
          customizable: true,
          customOptions: JSON.stringify(["Berry Selection", "Cream Type"]),
          isFeatured: false,
          isNew: true,
          freeShipping: true,
        },
      }),
    ])

    // Create some sample orders
    await prisma.order.create({
      data: {
        orderNumber: "ORD-001",
        userId: buyer1.id,
        sellerId: seller1.seller!.id,
        status: "DELIVERED",
        totalAmount: 4599,
        shippingAmount: 0,
        taxAmount: 459.9,
        paymentStatus: "COMPLETED",
        paymentMethod: "MPESA",
        shippingAddress: JSON.stringify({
          name: "John Smith",
          phone: "+254734567890",
          address: "789 Customer Street",
          city: "Nairobi",
          state: "Nairobi",
          zipCode: "00100",
        }),
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        items: {
          create: {
            productId: products[0].id,
            quantity: 1,
            price: 4599,
          },
        },
      },
    })

    // Create sample reviews
    await prisma.review.create({
      data: {
        userId: buyer1.id,
        productId: products[0].id,
        rating: 5,
        title: "Amazing chocolate cake!",
        comment:
          "Absolutely delicious! The chocolate was so rich and the presentation was stunning. Perfect for my daughter's birthday party.",
        verified: true,
        helpful: 12,
      },
    })

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
