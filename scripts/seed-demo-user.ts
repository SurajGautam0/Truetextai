import { createUser } from "@/lib/redis"

async function seedDemoUser() {
  try {
    const demoUser = await createUser("Demo User", "demo@example.com", "password", "user", "pro")

    if (demoUser) {
      console.log("Demo user created successfully:", demoUser)
    } else {
      console.log("Demo user already exists")
    }
  } catch (error) {
    console.error("Error seeding demo user:", error)
  }
}

// Run the seed function
seedDemoUser()
