import axios from 'axios'

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL
const DEFAULT_TOKEN = import.meta.env.VITE_API_DEFAULT_TOKEN

class ApiService {
  constructor() {
    this.baseUrl = null
    this.token = null
    this.loadConfig()
  }

  // Load configuration dari localStorage
  loadConfig() {
    const savedConfig = localStorage.getItem('apiConfig')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      this.baseUrl = config.baseUrl || DEFAULT_BASE_URL
      this.token = config.token || DEFAULT_TOKEN
    } else {
      this.baseUrl = DEFAULT_BASE_URL
      this.token = DEFAULT_TOKEN
    }
  }

  // Save configuration ke localStorage
  saveConfig(baseUrl, token) {
    const config = { baseUrl, token }
    localStorage.setItem('apiConfig', JSON.stringify(config))
    this.loadConfig()
  }

  // Get full API endpoint URL
  getEndpointUrl(endpoint = 'diskon') {
    if (!this.baseUrl || !this.token) {
      this.loadConfig()
    }

    // Jika ada full URL yang disimpan (untuk custom API URL)
    const savedFullUrl = localStorage.getItem('discountApiUrl')
    if (savedFullUrl && endpoint === 'diskon') {
      return savedFullUrl
    }

    return `${this.baseUrl}/${this.token}/${endpoint}`
  }

  // Helper untuk extract token dari URL
  extractTokenFromUrl(url) {
    try {
      const urlObj = new URL(url)
      const parts = urlObj.pathname.split('/')
      // URL format: /api/{token}/diskon
      if (parts.length >= 3) {
        return parts[2]
      }
    } catch (error) {
      console.error('Error extracting token:', error)
    }
    return null
  }

  // Set custom API URL (full URL)
  setCustomApiUrl(fullUrl) {
    localStorage.setItem('discountApiUrl', fullUrl)

    // Extract token dari URL untuk digunakan di endpoint lain
    const token = this.extractTokenFromUrl(fullUrl)
    if (token) {
      this.saveConfig(DEFAULT_BASE_URL, token)
    }

    this.loadConfig()
  }

  // Get current API configuration
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      token: this.token,
      fullUrl: localStorage.getItem('discountApiUrl')
    }
  }

  // Reset ke default
  resetToDefault() {
    localStorage.removeItem('apiConfig')
    localStorage.removeItem('discountApiUrl')
    this.loadConfig()
  }

  // Axios instance dengan default config
  createInstance() {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  }

  // GET request
  async get(endpoint = 'diskon', params = {}) {
    try {
      const url = this.getEndpointUrl(endpoint)
      const response = await axios.get(url, { params })
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // POST request
  async post(endpoint = 'diskon', data = {}) {
    try {
      const url = this.getEndpointUrl(endpoint)
      const response = await axios.post(url, data)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // PUT request
  async put(endpoint = 'diskon', id, data = {}) {
    try {
      const url = `${this.getEndpointUrl(endpoint)}/${id}`
      const response = await axios.put(url, data)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // DELETE request
  async delete(endpoint = 'diskon', id) {
    try {
      const url = `${this.getEndpointUrl(endpoint)}/${id}`
      const response = await axios.delete(url)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })

      switch (error.response.status) {
        case 400:
          throw new Error('Permintaan tidak valid. Periksa data yang dikirim.')
        case 401:
          throw new Error('Token API tidak valid atau kedaluwarsa.')
        case 404:
          throw new Error('Endpoint tidak ditemukan.')
        case 429:
          throw new Error('Terlalu banyak permintaan. Silakan coba lagi nanti.')
        case 500:
          throw new Error('Terjadi kesalahan di server.')
        default:
          throw new Error(`Error ${error.response.status}: ${error.response.data}`)
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      console.error('No response received:', error.request)
      throw new Error('Tidak ada respons dari server. Periksa koneksi internet Anda.')
    } else {
      // Error lainnya
      console.error('Request setup error:', error.message)
      throw new Error(`Gagal membuat permintaan: ${error.message}`)
    }
  }

  // Test koneksi API
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.token}/diskon`)
      return {
        success: true,
        status: response.status,
        data: response.data,
        message: 'Koneksi API berhasil'
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        message: error.message,
        error: error.response?.data
      }
    }
  }

  // Get statistics
  async getStats() {
    try {
      const data = await this.get('diskon')
      return {
        total: data?.length || 0,
        byType: {
          percentage: data?.filter(d => d.type === 'percentage')?.length || 0,
          fixed: data?.filter(d => d.type === 'fixed')?.length || 0
        }
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return {
        total: 0,
        byType: { percentage: 0, fixed: 0 }
      }
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export untuk penggunaan langsung
export default {
  install: (app) => {
    app.config.globalProperties.$api = apiService
  },
  api: apiService
}
