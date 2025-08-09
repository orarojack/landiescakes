import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data
  await prisma.cartItem.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.sellerProfile.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log("🗑️  Cleared existing data")

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Wedding Cakes",
        description: "Elegant multi-tier cakes perfect for your special day",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Birthday Cakes",
        description: "Fun and colorful cakes to celebrate another year",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Cupcakes",
        description: "Individual treats perfect for any occasion",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Custom Cakes",
        description: "Personalized cakes made to your specifications",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Cheesecakes",
        description: "Rich and creamy cheesecakes in various flavors",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Chocolate Cakes",
        description: "Rich and decadent chocolate cakes for chocolate lovers",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Fruit Cakes",
        description: "Fresh and fruity cakes with seasonal fruits",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Vegan Cakes",
        description: "Plant-based cakes made without animal products",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
  ])

  console.log("📂 Created categories")

  // Create users
  const hashedPassword = await bcrypt.hash("admin123", 12)
  const sellerPassword = await bcrypt.hash("seller123", 12)
  const buyerPassword = await bcrypt.hash("buyer123", 12)

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@cakemarket.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  const seller1 = await prisma.user.create({
    data: {
      name: "Maria Rodriguez",
      email: "maria@sweetdreams.com",
      password: sellerPassword,
      role: "SELLER",
    },
  })

  const seller2 = await prisma.user.create({
    data: {
      name: "David Chen",
      email: "david@artisancakes.com",
      password: sellerPassword,
      role: "SELLER",
    },
  })

  const buyer1 = await prisma.user.create({
    data: {
      name: "John Smith",
      email: "john@example.com",
      password: buyerPassword,
      role: "BUYER",
    },
  })

  const buyer2 = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: buyerPassword,
      role: "BUYER",
    },
  })

  console.log("👥 Created users")

  // Create seller profiles
  const sellerProfile1 = await prisma.sellerProfile.create({
    data: {
      userId: seller1.id,
      businessName: "Sweet Dreams Bakery",
      description:
        "Artisan bakery specializing in custom wedding cakes and gourmet desserts. Family-owned business with 15 years of experience.",
      address: "123 Baker Street, Sweet City, SC 12345",
      phone: "+1 (555) 123-4567",
      website: "https://sweetdreamsbakery.com",
      logo: "/placeholder.svg?height=100&width=100",
      status: "APPROVED",
    },
  })

  const sellerProfile2 = await prisma.sellerProfile.create({
    data: {
      userId: seller2.id,
      businessName: "Artisan Cake Co.",
      description: "Modern cake designs with traditional flavors. Specializing in birthday cakes and custom creations.",
      address: "456 Cake Avenue, Dessert Town, DT 67890",
      phone: "+1 (555) 987-6543",
      website: "https://artisancakeco.com",
      logo: "/placeholder.svg?height=100&width=100",
      status: "APPROVED",
    },
  })

  console.log("🏪 Created seller profiles")

  // Create Accessories category
  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Accessories",
      description: "Candles, toppers, knives, and other cake accessories",
      image: "/placeholder.svg?height=200&width=300",
    },
  });

  // Create accessory products (some with discounts)
  await Promise.all([
    prisma.product.create({
      data: {
        name: "Birthday Candle Pack",
        description: "Colorful candles for birthday cakes (pack of 12).",
        price: 150,
        originalPrice: 200, // Discounted
        images: ["/placeholder.svg?height=200&width=200"],
        categoryId: accessoriesCategory.id,
        sellerId: sellerProfile1.id,
        stock: 100,
      },
    }),
    prisma.product.create({
      data: {
        name: "Gold Cake Topper",
        description: "Elegant gold acrylic cake topper for celebrations.",
        price: 300,
        images: ["/placeholder.svg?height=200&width=200"],
        categoryId: accessoriesCategory.id,
        sellerId: sellerProfile2.id,
        stock: 50,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cake Knife & Server Set",
        description: "Stainless steel knife and server for cake cutting.",
        price: 500,
        originalPrice: 700, // Discounted
        images: ["/placeholder.svg?height=200&width=200"],
        categoryId: accessoriesCategory.id,
        sellerId: sellerProfile1.id,
        stock: 30,
      },
    }),
  ]);

  // Create products
  const products = await Promise.all([
    // Wedding Cakes
    prisma.product.create({
      data: {
        name: "Elegant Rose Wedding Cake",
        description:
          "A stunning 3-tier wedding cake adorned with handcrafted sugar roses. Features vanilla sponge with raspberry filling and smooth buttercream finish.",
        price: 299.99,
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
        ],
        categoryId: categories[0].id,
        sellerId: sellerProfile1.id,
        stock: 5,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Classic Vanilla Wedding Cake",
        description:
          "Traditional 4-tier wedding cake with classic vanilla flavor and elegant white fondant finish. Perfect for timeless celebrations.",
        price: 399.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[0].id,
        sellerId: sellerProfile2.id,
        stock: 3,
      },
    }),

    // Birthday Cakes
    prisma.product.create({
      data: {
        name: "Rainbow Layer Birthday Cake",
        description:
          "Vibrant 6-layer rainbow cake with vanilla buttercream frosting. Each layer is a different color of the rainbow!",
        price: 89.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[1].id,
        sellerId: sellerProfile1.id,
        stock: 10,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Chocolate Fudge Birthday Cake",
        description:
          "Rich chocolate cake with fudge filling and chocolate ganache topping. Decorated with chocolate shavings and fresh berries.",
        price: 79.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[1].id,
        sellerId: sellerProfile2.id,
        stock: 8,
      },
    }),

    // Cupcakes
    prisma.product.create({
      data: {
        name: "Assorted Gourmet Cupcakes (12 pack)",
        description:
          "A dozen assorted gourmet cupcakes including vanilla, chocolate, red velvet, and lemon flavors with premium frosting.",
        price: 36.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[2].id,
        sellerId: sellerProfile1.id,
        stock: 20,
      },
    }),
    prisma.product.create({
      data: {
        name: "Red Velvet Cupcakes (6 pack)",
        description:
          "Classic red velvet cupcakes with cream cheese frosting. Moist, flavorful, and beautifully decorated.",
        price: 24.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[2].id,
        sellerId: sellerProfile2.id,
        stock: 15,
      },
    }),

    // Custom Cakes
    prisma.product.create({
      data: {
        name: "Custom Photo Cake",
        description:
          "Personalized cake with edible photo print. Choose your favorite image and we'll create a delicious cake around it.",
        price: 149.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[3].id,
        sellerId: sellerProfile1.id,
        stock: 7,
      },
    }),
    prisma.product.create({
      data: {
        name: "Themed Character Cake",
        description:
          "Custom cake designed around your favorite character or theme. Perfect for kids' parties and special occasions.",
        price: 199.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[3].id,
        sellerId: sellerProfile2.id,
        stock: 4,
      },
    }),

    // Cheesecakes
    prisma.product.create({
      data: {
        name: "New York Style Cheesecake",
        description:
          "Classic New York style cheesecake with graham cracker crust. Rich, creamy, and perfectly smooth texture.",
        price: 59.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[4].id,
        sellerId: sellerProfile1.id,
        stock: 12,
      },
    }),
    prisma.product.create({
      data: {
        name: "Berry Swirl Cheesecake",
        description:
          "Creamy cheesecake with mixed berry swirl and fresh berry topping. A perfect balance of tart and sweet.",
        price: 69.99,
        images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
        categoryId: categories[4].id,
        sellerId: sellerProfile2.id,
        stock: 9,
      },
    }),
  ])

  console.log("🍰 Created products")

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      userId: buyer1.id,
      total: 389.98,
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "Credit Card",
      shippingAddress: {
        name: "John Smith",
        address: "789 Customer Lane",
        city: "Buyer City",
        state: "BC",
        zipCode: "11111",
        phone: "+1 (555) 111-2222",
      },
      orderItems: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: 299.99,
          },
          {
            productId: products[2].id,
            quantity: 1,
            price: 89.99,
          },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      userId: buyer2.id,
      total: 104.98,
      status: "PREPARING",
      paymentStatus: "PAID",
      paymentMethod: "PayPal",
      shippingAddress: {
        name: "Alice Johnson",
        address: "321 Buyer Boulevard",
        city: "Customer Town",
        state: "CT",
        zipCode: "22222",
        phone: "+1 (555) 333-4444",
      },
      orderItems: {
        create: [
          {
            productId: products[3].id,
            quantity: 1,
            price: 79.99,
          },
          {
            productId: products[5].id,
            quantity: 1,
            price: 24.99,
          },
        ],
      },
    },
  })

  console.log("📦 Created sample orders")

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        userId: buyer1.id,
        productId: products[0].id,
        rating: 5,
        comment: "Absolutely stunning cake! The roses looked so real and it tasted amazing. Perfect for our wedding!",
      },
    }),
    prisma.review.create({
      data: {
        userId: buyer2.id,
        productId: products[2].id,
        rating: 5,
        comment: "The rainbow layers were so beautiful and each layer had a different flavor. Kids loved it!",
      },
    }),
    prisma.review.create({
      data: {
        userId: buyer1.id,
        productId: products[8].id,
        rating: 4,
        comment: "Great cheesecake, very creamy and not too sweet. Will order again!",
      },
    }),
  ])

  console.log("⭐ Created reviews")

  // Create wishlist items
  await Promise.all([
    prisma.wishlistItem.create({
      data: {
        userId: buyer1.id,
        productId: products[1].id,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        userId: buyer1.id,
        productId: products[7].id,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        userId: buyer2.id,
        productId: products[2].id,
      },
    }),
  ])

  console.log("❤️  Created wishlist items")

  // Create cart items
  await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: buyer1.id,
        productId: products[3].id,
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: buyer2.id,
        productId: products[9].id,
        quantity: 2,
      },
    }),
  ])

  console.log("🛒 Created cart items")

  console.log("✅ Database seeded successfully!")
  console.log("\n🔑 Test Accounts:")
  console.log("Admin: admin@cakemarket.com / admin123")
  console.log("Seller 1: maria@sweetdreams.com / seller123")
  console.log("Seller 2: david@artisancakes.com / seller123")
  console.log("Buyer 1: john@example.com / buyer123")
  console.log("Buyer 2: alice@example.com / buyer123")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
