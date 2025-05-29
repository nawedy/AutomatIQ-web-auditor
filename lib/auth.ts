// Browser-compatible auth service for demo purposes
export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface User {
  id: string
  email: string
  name: string
  password_hash: string
  role: "admin" | "user"
  subscription: "free" | "pro" | "enterprise"
  created_at: string
}

// Mock user database for demo
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password_hash: "hashed_admin_password",
    role: "admin",
    subscription: "enterprise",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Demo User",
    password_hash: "hashed_user_password",
    role: "user",
    subscription: "pro",
    created_at: new Date().toISOString(),
  },
]

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    // Simple hash simulation for demo
    return `hashed_${password}`
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    // Simple comparison for demo
    return hashedPassword === `hashed_${password}`
  }

  static generateToken(payload: JWTPayload): string {
    // Simple token generation for demo
    return btoa(JSON.stringify(payload))
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return JSON.parse(atob(token)) as JWTPayload
    } catch {
      return null
    }
  }

  static async register(email: string, password: string, name: string) {
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Create new user
    const user: User = {
      id: (mockUsers.length + 1).toString(),
      email,
      name,
      password_hash: await this.hashPassword(password),
      role: "user",
      subscription: "free",
      created_at: new Date().toISOString(),
    }

    mockUsers.push(user)

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return { user, token }
  }

  static async login(email: string, password: string) {
    // Find user
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Check password
    const isValid = await this.comparePassword(password, user.password_hash)
    if (!isValid) {
      throw new Error("Invalid credentials")
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return { user, token }
  }

  static async getUserFromToken(token: string) {
    const payload = this.verifyToken(token)
    if (!payload) {
      throw new Error("Invalid token")
    }

    const user = mockUsers.find((u) => u.id === payload.userId)
    if (!user) {
      throw new Error("User not found")
    }

    return user
  }

  static async findByEmail(email: string) {
    return mockUsers.find((u) => u.email === email) || null
  }

  static async findById(id: string) {
    return mockUsers.find((u) => u.id === id) || null
  }
}
