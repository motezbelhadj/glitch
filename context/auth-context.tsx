"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  username: string
  email: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          // In a real app, you would validate the token with your backend
          // For now, we'll just simulate a logged-in user
          const userData = localStorage.getItem("user")
          if (userData) {
            setUser(JSON.parse(userData))
          } else {
            // If we have a token but no user data, try to fetch the user profile
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
              const userResponse = await fetch(`${apiUrl}/users/me/`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              })

              if (userResponse.ok) {
                const userData = await userResponse.json()
                localStorage.setItem("user", JSON.stringify(userData))
                setUser(userData)
              } else {
                // If we can't fetch the user, the token might be invalid
                localStorage.removeItem("token")
                localStorage.removeItem("refreshToken")
              }
            } catch (error) {
              console.error("Error fetching user profile:", error)
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      console.log("Login API URL:", `${apiUrl}/auth/login/`)

      // Make API call to Django backend
      const response = await fetch(`${apiUrl}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Login error response:", errorData)
        throw new Error(errorData.detail || "Login failed")
      }

      const data = await response.json()
      console.log("Login successful, received tokens")

      // Store tokens
      localStorage.setItem("token", data.access)
      localStorage.setItem("refreshToken", data.refresh)

      // Get user profile
      const userResponse = await fetch(`${apiUrl}/users/me/`, {
        headers: {
          Authorization: `Bearer ${data.access}`,
          "Content-Type": "application/json",
        },
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({}))
        console.error("User profile error response:", errorData)
        throw new Error(errorData.detail || "Failed to fetch user profile")
      }

      const userData = await userResponse.json()
      console.log("User profile fetched successfully")
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/register/`
      console.log("Attempting to register at:", apiUrl)

      // Register user
      const registerResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          password2: password,
        }),
        // Add credentials option for cookies if needed
        credentials: "include",
      })

      if (!registerResponse.ok) {
        let errorData
        try {
          errorData = await registerResponse.json()
        } catch (e) {
          errorData = await registerResponse.text()
        }

        console.error("Registration error response:", errorData)
        throw new Error(typeof errorData === "object" ? JSON.stringify(errorData) : errorData || "Registration failed")
      }

      console.log("Registration successful, proceeding to login")
      // Login after successful registration
      await login(email, password)
    } catch (error: any) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

      if (refreshToken) {
        // Blacklist the refresh token
        await fetch(`${apiUrl}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage and state regardless of API success
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
