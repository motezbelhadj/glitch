// Update the API_BASE_URL and add more robust error handling
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Log the API base URL when the module loads
console.log("API Base URL:", API_BASE_URL)

// Helper function to get the auth token
function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Helper function to handle API responses with better error handling
async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type")
  const isJson = contentType && contentType.includes("application/json")

  if (!response.ok) {
    // If the server responds with an error, handle it better
    let errorMessage
    try {
      const data = isJson ? await response.json() : await response.text()
      errorMessage = isJson
        ? data.detail || data.message || JSON.stringify(data)
        : data || `HTTP error ${response.status}`
    } catch (e) {
      errorMessage = `HTTP error ${response.status}`
    }
    throw new Error(errorMessage)
  }

  // Handle successful response
  if (isJson) {
    return await response.json()
  } else {
    return await response.text()
  }
}

// Authentication API calls
export const authApi = {
  // Login user
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    return handleResponse(response)
  },

  // Register new user with improved error handling
  register: async (username: string, email: string, password: string) => {
    console.log("Registering user:", { username, email })

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, email, password, password2: password }),
      credentials: "include",
    })

    return handleResponse(response)
  },

  // Verify JWT token
  verifyToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    return handleResponse(response)
  },

  // Refresh JWT token
  refreshToken: async (refresh: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    })

    return handleResponse(response)
  },

  // Logout user
  logout: async (refresh: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    })

    return handleResponse(response)
  },
}

// Songs API calls
export const songsApi = {
  // Get all songs
  getAllSongs: async (params = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>).toString()
    const url = `${API_BASE_URL}/songs/${queryParams ? `?${queryParams}` : ""}`

    console.log("Fetching songs from:", url)
    try {
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      })

      return handleResponse(response)
    } catch (error) {
      console.error("Error in getAllSongs:", error)
      throw new Error("Failed to fetch songs. Please check your network connection.")
    }
  },

  // Get user's liked songs
  getLikedSongs: async () => {
    console.log("Fetching liked songs")
    try {
      const response = await fetch(`${API_BASE_URL}/songs/liked/`, {
        headers: {
          ...getAuthHeader(),
        },
      })

      console.log("Liked songs response status:", response.status)
      return handleResponse(response)
    } catch (error) {
      console.error("Error fetching liked songs:", error)
      throw error
    }
  },

  // Search songs
  searchSongs: async (query: string) => {
    const url = `${API_BASE_URL}/songs/?search=${encodeURIComponent(query)}`

    console.log("Searching songs:", url)
    try {
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      })

      return handleResponse(response)
    } catch (error) {
      console.error("Error in searchSongs:", error)
      throw new Error("Failed to search songs. Please check your network connection.")
    }
  },

  // Get song by ID
  getSongById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/songs/${id}/`, {
      headers: {
        ...getAuthHeader(),
      },
    })

    return handleResponse(response)
  },

  // Upload a new song
  uploadSong: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/songs/`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
        // Don't set Content-Type here as it's automatically set with FormData
      },
      body: formData,
    })

    return handleResponse(response)
  },

  // Update a song
  updateSong: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/songs/${id}/`, {
      method: "PATCH",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    })

    return handleResponse(response)
  },

  // Delete a song
  deleteSong: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/songs/${id}/`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    })

    if (response.status === 204) {
      return true // Successfully deleted
    }

    return handleResponse(response)
  },

  // Like a song
  likeSong: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/songs/${id}/like/`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    } catch (error) {
      console.error("Error in likeSong:", error)
      throw new Error("Failed to like song. Please try again.")
    }
  },

  // Dislike a song
  dislikeSong: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/songs/${id}/dislike/`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    } catch (error) {
      console.error("Error in dislikeSong:", error)
      throw new Error("Failed to dislike song. Please try again.")
    }
  },
}

// User API calls
export const userApi = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      headers: {
        ...getAuthHeader(),
      },
    })

    return handleResponse(response)
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: "PATCH",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    return handleResponse(response)
  },
}

// Playlist API calls
export const playlistApi = {
  // Get all playlists
  getAllPlaylists: async () => {
    console.log("Fetching all playlists")
    console.log("Auth headers:", getAuthHeader())

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/`, {
        headers: {
          ...getAuthHeader(),
        },
      })

      console.log("Playlist response status:", response.status)
      return handleResponse(response)
    } catch (error) {
      console.error("Error fetching playlists:", error)
      throw error
    }
  },

  // Search playlists
  searchPlaylists: async (query: string) => {
    const url = `${API_BASE_URL}/playlists/?search=${encodeURIComponent(query)}`

    console.log("Searching playlists:", url)
    const response = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    })

    return handleResponse(response)
  },

  // Get playlist by ID
  getPlaylistById: async (id: string) => {
    console.log(`Fetching playlist with ID: ${id}`)

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${id}/`, {
        headers: {
          ...getAuthHeader(),
        },
      })

      console.log(`Playlist ${id} response status:`, response.status)
      return handleResponse(response)
    } catch (error) {
      console.error(`Error fetching playlist ${id}:`, error)
      throw error
    }
  },

  // Create a new playlist
  createPlaylist: async (playlistData: any) => {
    console.log("Creating playlist with data:", playlistData)

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      })

      console.log("Create playlist response status:", response.status)
      return handleResponse(response)
    } catch (error) {
      console.error("Error creating playlist:", error)
      throw error
    }
  },

  // Update a playlist
  updatePlaylist: async (id: string, playlistData: any) => {
    console.log(`Updating playlist ${id} with data:`, playlistData)

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${id}/`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      })

      console.log(`Update playlist ${id} response status:`, response.status)
      return handleResponse(response)
    } catch (error) {
      console.error(`Error updating playlist ${id}:`, error)
      throw error
    }
  },

  // Delete a playlist
  deletePlaylist: async (id: string) => {
    console.log(`Deleting playlist ${id}`)

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${id}/`, {
        method: "DELETE",
        headers: {
          ...getAuthHeader(),
        },
      })

      console.log(`Delete playlist ${id} response status:`, response.status)
      if (response.status === 204) {
        return true // Successfully deleted
      }

      return handleResponse(response)
    } catch (error) {
      console.error(`Error deleting playlist ${id}:`, error)
      throw error
    }
  },

  // Add song to playlist
  addSongToPlaylist: async (playlistId: string, songId: string) => {
    console.log(`Adding song ${songId} to playlist ${playlistId}`)

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/add_song/`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song_id: songId }),
      })

      console.log(`Add song to playlist response status:`, response.status)
      return handleResponse(response)
    } catch (error) {
      console.error(`Error adding song ${songId} to playlist ${playlistId}:`, error)
      throw error
    }
  },

  // Remove song from playlist
  removeSongFromPlaylist: async (playlistId: string, songId: string) => {
    console.log(`Removing song ${songId} from playlist ${playlistId}`)

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/remove_song/`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song_id: songId }),
      })

      console.log(`Remove song from playlist response status:`, response.status)
      return handleResponse(response)
    } catch (error) {
      console.error(`Error removing song ${songId} from playlist ${playlistId}:`, error)
      throw error
    }
  },

  // Update playlist cover image
  updatePlaylistCover: async (id: string, formData: FormData) => {
    console.log(`Updating cover image for playlist ${id}`)

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${id}/`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          // Don't set Content-Type here as it's automatically set with FormData
        },
        body: formData,
      })

      console.log(`Update playlist cover response status:`, response.status)
      return handleResponse(response)
    } catch (error) {
      console.error(`Error updating cover for playlist ${id}:`, error)
      throw error
    }
  },
}
