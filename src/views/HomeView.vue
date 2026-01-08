<template>
  <div class="home-view">
    <!-- Title Section -->
    <div class="title-section">
      <div class="title-left">
        <h2>Daftar Diskon</h2>
        <!-- Outlet Dropdown -->
        <div class="outlet-dropdown" @click="toggleOutletDropdown">
          <div class="outlet-selected">
            <span class="outlet-name">Kopi Anak Bangsa</span>
            <span class="dropdown-arrow">▼</span>
          </div>
          <div v-if="showOutletDropdown" class="outlet-dropdown-menu">
            <div class="outlet-item" @click="selectOutlet('Kopi Anak Bangsa')">
              <span class="outlet-icon">🏪</span>
              <span class="outlet-text">Kopi Anak Bangsa</span>
              <span v-if="selectedOutlet === 'Kopi Anak Bangsa'" class="check-icon">✓</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="outlet-item" @click="toggleApiConfig">
              <span class="outlet-icon">⚙️</span>
              <span class="outlet-text">Konfigurasi API</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Discounts List or Empty State -->
      <div v-if="discounts.length > 0" class="discounts-container">
        <!-- Stats and Search -->
        <div class="controls-section">
          <div class="stats">
            <span class="stats-label">Total jumlah diskon: </span>
            <span class="stats-value">{{ discounts.length }}</span>
          </div>
          <div class="search-container">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Cari diskon..."
                class="search-input"
                @input="filterDiscounts"
              >
            </div>
          </div>
        </div>

        <!-- Discounts Table -->
        <DiscountList
          :discounts="filteredDiscounts"
          @edit="editDiscount"
          @delete="confirmDelete"
        />

        <!-- Add Discount Button -->
        <div class="add-button-container">
          <router-link to="/tambah" class="add-discount-button">
            <span class="plus-icon">+</span>
            <span>Tambah diskon</span>
          </router-link>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-state-image">
          <img src="@/assets/empty-state.svg" alt="Belum Ada Diskon" class="empty-image">
        </div>
        <h3 class="empty-state-title">Belum Ada Diskon</h3>
        <p class="empty-state-description">
          Silahkan tambah diskon untuk menarik pelanggan dan meningkatkan penjualan.
        </p>
        <router-link to="/tambah" class="empty-state-button">
          <span class="plus-icon">+</span>
          <span>Tambah diskon</span>
        </router-link>
      </div>
    </div>

    <!-- Delete Modal -->
    <DeleteModal
      v-if="showDeleteModal"
      :discount="discountToDelete"
      @confirm="deleteDiscount"
      @cancel="closeDeleteModal"
    />

    <ApiConfigModal
      v-model:show="showApiConfig"
      @api-updated="fetchDiscounts"
    />

    <!-- Notification -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DiscountList from '../components/DiscountList.vue'
import DeleteModal from '../components/DeleteModal.vue'
import ApiConfig from '../components/ApiConfigModal.vue'
import { useDiscountApi } from '../composables/useDiscountApi'
import ApiConfigModal from '../components/ApiConfigModal.vue'

// Import image
import emptyDiscountImage from '@/assets/empty-state.svg'

export default {
  components: {
    DiscountList,
    DeleteModal,
    ApiConfig,
    ApiConfigModal
  },
  setup() {
    const router = useRouter()
    const {
      discounts,
      loading,
      error,
      fetchDiscounts,
      deleteDiscount: apiDelete
    } = useDiscountApi()

    const searchQuery = ref('')
    const showDeleteModal = ref(false)
    const discountToDelete = ref(null)
    const notification = ref({ show: false, message: '', type: 'success' })
    const showApiConfig = ref(false)

    const showOutletDropdown = ref(false)
    const selectedOutlet = ref('Kopi Anak Bangsa')

    const filteredDiscounts = computed(() => {
      if (!searchQuery.value) return discounts.value
      return discounts.value.filter(discount =>
        discount.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const filterDiscounts = () => {
      // Filtering handled by computed property
    }

    const editDiscount = (discount) => {
      router.push(`/edit/${discount._id}`)
    }

    const confirmDelete = (discount) => {
      discountToDelete.value = discount
      showDeleteModal.value = true
    }

    const deleteDiscount = async () => {
      if (!discountToDelete.value) return

      try {
        await apiDelete(discountToDelete.value._id)
        showNotification(`${discountToDelete.value.name} berhasil dihapus`, 'success')
        await fetchDiscounts()
      } catch (err) {
        showNotification('Gagal menghapus diskon', 'error')
      } finally {
        closeDeleteModal()
      }
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      discountToDelete.value = null
    }

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type }
      setTimeout(() => {
        notification.value.show = false
      }, 3000)
    }

    const toggleApiConfig = () => {
      showApiConfig.value = !showApiConfig.value
    }

    // Tambahkan fungsi untuk dropdown
    const toggleOutletDropdown = () => {
      showOutletDropdown.value = !showOutletDropdown.value
    }

    const selectOutlet = (outlet) => {
      selectedOutlet.value = outlet
      showOutletDropdown.value = false
      // Di sini bisa tambahkan logika untuk filter berdasarkan outlet
    }

    // Close dropdown ketika klik di luar
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.outlet-dropdown')
      if (dropdown && !dropdown.contains(event.target)) {
        showOutletDropdown.value = false
      }
    }

    // Event listener untuk klik di luar dropdown
    onMounted(() => {
      fetchDiscounts()
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      discounts,
      searchQuery,
      filteredDiscounts,
      showDeleteModal,
      discountToDelete,
      notification,
      showApiConfig,
      showOutletDropdown,
      selectedOutlet,
      filterDiscounts,
      editDiscount,
      confirmDelete,
      deleteDiscount,
      closeDeleteModal,
      showNotification,
      toggleApiConfig,
      toggleOutletDropdown,
      selectOutlet,
      fetchDiscounts,
      emptyDiscountImage
    }
  }
}
</script>

<style scoped>
.home-view {
  padding: 32px 0 64px;
  min-height: calc(100vh - 140px);
}

/* Title Section */
.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
}

.title-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* Outlet Dropdown */
.outlet-dropdown {
  padding-top: 10px;
  position: relative;
  display: inline-block;
  width: fit-content;
}

.outlet-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #7c7c7c;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.outlet-selected:hover {
  background: rgba(113, 113, 113, 0.15);
}

.outlet-name {
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.2s;
}

.outlet-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.outlet-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  z-index: 100;
  overflow: hidden;
}

.outlet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.outlet-item:hover {
  background: #f5f5f5;
}

.outlet-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.outlet-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.check-icon {
  color: #3DAE2F;
  font-weight: bold;
}

.dropdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

.title-actions {
  display: flex;
  align-items: center;
}

/* API Config Section */
.api-config-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Controls Section */
.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.stats-value {
  font-size: 16px;
  font-weight: 600;
  color: #3DAE2F;
}

.search-container {
  flex: 1;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3DAE2F;
  box-shadow: 0 0 0 3px rgba(61, 174, 47, 0.1);
}

/* Add Button Container */
.add-button-container {
  margin-top: 32px;
  text-align: center;
}

.add-discount-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3DAE2F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(61, 174, 47, 0.3);
}

.add-discount-button:hover {
  background: #2E8B27;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 174, 47, 0.4);
}

.plus-icon {
  font-size: 18px;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 50px 40px;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 480px;
}

.empty-image {
  width: 260px;
  height: 160px;
  object-fit: contain;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.empty-state-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 32px;
  background: #3DAE2F;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(61, 174, 47, 0.3);
}

.empty-state-button:hover {
  background: #2E8B27;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 174, 47, 0.4);
}

/* Settings Button */
.settings-button {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 48px;
  height: 48px;
  background: #3DAE2F;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(61, 174, 47, 0.3);
  transition: all 0.2s;
  z-index: 90;
}

.settings-button:hover {
  background: #2E8B27;
  transform: scale(1.05);
}

.settings-icon {
  font-size: 20px;
  color: white;
}

/* Notification */
.notification {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 12px 24px;
  border-radius: 8px;
  background: #fff;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  border-left: 4px solid;
}

.notification.success {
  border-left-color: #3DAE2F;
}

.notification.error {
  border-left-color: #FF3B30;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .title-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .title-left {
    width: 100%;
  }

  .outlet-dropdown {
    width: 100%;
  }

  .outlet-selected {
    width: 100%;
    justify-content: space-between;
  }

  .outlet-dropdown-menu {
    width: 100%;
    left: 0;
    right: 0;
  }

  .title-actions {
    justify-content: flex-end;
  }

  /* Tampilkan settings button di mobile jika diperlukan */
  .settings-button {
    display: flex;
    position: static;
    transform: none;
  }
}

@media (max-width: 480px) {
  .title-section h2 {
    font-size: 20px;
  }

  .empty-state {
    padding: 32px 20px;
  }

  .empty-state-title {
    font-size: 18px;
  }

  .empty-image {
    width: 100px;
    height: 100px;
  }
}
</style>
