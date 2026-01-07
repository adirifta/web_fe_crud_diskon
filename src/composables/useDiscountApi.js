import { ref } from 'vue'
import { apiService } from '../services/api'

export function useDiscountApi() {
  const discounts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const stats = ref({
    total: 0,
    byType: { percentage: 0, fixed: 0 }
  })

  const fetchDiscounts = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await apiService.get('diskon')
      discounts.value = Array.isArray(data) ? data : []

      // Update stats
      stats.value.total = discounts.value.length
      stats.value.byType.percentage = discounts.value.filter(d => d.type === 'percentage').length
      stats.value.byType.fixed = discounts.value.filter(d => d.type === 'fixed').length
    } catch (err) {
      error.value = err.message
      console.error('Error fetching discounts:', err)

      // Fallback untuk development jika API tidak tersedia
      if (err.message.includes('koneksi') || err.message.includes('respons')) {
        console.warn('Using mock data for development')
        discounts.value = getMockDiscounts()
        stats.value.total = discounts.value.length
      }
    } finally {
      loading.value = false
    }
  }

  const createDiscount = async (discountData) => {
    try {
      // Validasi nama unik
      const existing = discounts.value.find(d =>
        d.name.toLowerCase() === discountData.name.toLowerCase()
      )

      if (existing) {
        throw new Error('Nama diskon sudah digunakan, silahkan gunakan nama lain.')
      }

      const response = await apiService.post('diskon', discountData)

      // Tambah ke local state
      discounts.value.push(response)
      stats.value.total++
      if (response.type === 'percentage') {
        stats.value.byType.percentage++
      } else {
        stats.value.byType.fixed++
      }

      return response
    } catch (err) {
      // Cek jika error dari API atau validasi kita
      if (err.message.includes('sudah digunakan')) {
        throw err
      }

      // Error lainnya
      if (err.response?.status === 400) {
        throw new Error('Nama diskon sudah digunakan, silahkan gunakan nama lain.')
      }
      throw new Error('Gagal menambahkan diskon: ' + err.message)
    }
  }

  const updateDiscount = async (id, discountData) => {
    try {
      // Validasi nama unik (kecuali untuk diskon yang sama)
      const existing = discounts.value.find(d =>
        d._id !== id &&
        d.name.toLowerCase() === discountData.name.toLowerCase()
      )

      if (existing) {
        throw new Error('Nama diskon sudah digunakan, silahkan gunakan nama lain.')
      }

      const response = await apiService.put('diskon', id, discountData)

      // Update local state
      const index = discounts.value.findIndex(d => d._id === id)
      if (index !== -1) {
        const oldType = discounts.value[index].type
        const newType = response.type

        discounts.value[index] = response

        // Update stats type jika berubah
        if (oldType !== newType) {
          if (oldType === 'percentage') {
            stats.value.byType.percentage--
            stats.value.byType.fixed++
          } else {
            stats.value.byType.fixed--
            stats.value.byType.percentage++
          }
        }
      }

      return response
    } catch (err) {
      if (err.message.includes('sudah digunakan')) {
        throw err
      }
      throw new Error('Gagal memperbarui diskon: ' + err.message)
    }
  }

  const deleteDiscount = async (id) => {
    try {
      // Dapatkan data sebelum dihapus untuk update stats
      const discount = discounts.value.find(d => d._id === id)

      await apiService.delete('diskon', id)

      // Update local state
      const index = discounts.value.findIndex(d => d._id === id)
      if (index !== -1) {
        discounts.value.splice(index, 1)
        stats.value.total--

        if (discount?.type === 'percentage') {
          stats.value.byType.percentage--
        } else if (discount?.type === 'fixed') {
          stats.value.byType.fixed--
        }
      }

      return true
    } catch (err) {
      throw new Error('Gagal menghapus diskon: ' + err.message)
    }
  }

  const getDiscountById = (id) => {
    return discounts.value.find(d => d._id === id)
  }

  const searchDiscounts = (query) => {
    if (!query) return discounts.value

    const searchTerm = query.toLowerCase()
    return discounts.value.filter(discount =>
      discount.name.toLowerCase().includes(searchTerm) ||
      (discount.description && discount.description.toLowerCase().includes(searchTerm))
    )
  }

  // Mock data untuk development
  const getMockDiscounts = () => {
    return [
      {
        _id: '1',
        name: 'Diskon Opening',
        type: 'percentage',
        value: 15,
        description: 'Diskon pembukaan toko',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Burger Hemat',
        type: 'fixed',
        value: 10000,
        description: 'Diskon burger spesial',
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Cheese Lover Promo',
        type: 'percentage',
        value: 20,
        description: 'Promo untuk pecinta keju',
        createdAt: new Date().toISOString()
      }
    ]
  }

  // Test koneksi API
  const testApiConnection = async () => {
    return await apiService.testConnection()
  }

  // Update API configuration
  const updateApiConfig = (config) => {
    if (config.fullUrl) {
      apiService.setCustomApiUrl(config.fullUrl)
    } else if (config.baseUrl && config.token) {
      apiService.saveConfig(config.baseUrl, config.token)
    }

    // Reload data setelah update config
    fetchDiscounts()
  }

  // Get current API config
  const getApiConfig = () => {
    return apiService.getConfig()
  }

  return {
    discounts,
    loading,
    error,
    stats,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    getDiscountById,
    searchDiscounts,
    testApiConnection,
    updateApiConfig,
    getApiConfig
  }
}
