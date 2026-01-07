<template>
  <div class="home-view">
    <!-- Title Section -->
    <div class="title-section">
      <h2>Daftar Diskon</h2>
      <div class="outlet-badge">
        Kopi Anak Bangsa
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- API Configuration (Hidden by default) -->
      <div v-if="showApiConfig" class="api-config-section">
        <ApiConfig @api-updated="fetchDiscounts" />
      </div>

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

      <!-- Settings Button -->
      <button class="settings-button" @click="toggleApiConfig">
        <span class="settings-icon">⚙️</span>
      </button>
    </div>

    <!-- Delete Modal -->
    <DeleteModal
      v-if="showDeleteModal"
      :discount="discountToDelete"
      @confirm="deleteDiscount"
      @cancel="closeDeleteModal"
    />

    <!-- Notification -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DiscountList from '../components/DiscountList.vue'
import DeleteModal from '../components/DeleteModal.vue'
import ApiConfig from '../components/ApiConfig.vue'
import { useDiscountApi } from '../composables/useDiscountApi'

// Import image
import emptyDiscountImage from '@/assets/empty-state.svg'

export default {
  components: {
    DiscountList,
    DeleteModal,
    ApiConfig
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

    onMounted(() => {
      fetchDiscounts()
    })

    return {
      discounts,
      searchQuery,
      filteredDiscounts,
      showDeleteModal,
      discountToDelete,
      notification,
      showApiConfig,
      filterDiscounts,
      editDiscount,
      confirmDelete,
      deleteDiscount,
      closeDeleteModal,
      showNotification,
      toggleApiConfig,
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
  align-items: center;
  margin-bottom: 20px;
}

.title-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.outlet-badge {
  background: rgba(61, 174, 47, 0.1);
  border: 1px solid #3DAE2F;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #3DAE2F;
}

/* Divider */
.divider {
  height: 1px;
  background: linear-gradient(90deg,
    rgba(224, 224, 224, 0) 0%,
    rgba(224, 224, 224, 1) 50%,
    rgba(224, 224, 224, 0) 100%);
  margin: 24px 0;
}

/* Content Wrapper */
.content-wrapper {
  position: relative;
}

/* API Config Section */
.api-config-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
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
  padding: 60px 40px;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 480px;
}

.empty-state-image {
  margin-bottom: 32px;
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
  .home-view {
    padding: 24px 0 48px;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .empty-state {
    padding: 40px 24px;
    margin: 24px 0;
  }

  .empty-image {
    width: 120px;
    height: 120px;
  }

  .settings-button {
    bottom: 80px;
    right: 16px;
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
