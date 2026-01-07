<template>
  <div class="add-discount-view">
    <div class="back-link">
      <router-link to="/" class="back-button">
        ← Kembali ke Daftar Diskon
      </router-link>
    </div>

    <div class="form-container">
      <h2 class="form-title">{{ editingDiscount ? 'Ubah Diskon' : 'Tambah Diskon' }}</h2>

      <DiscountForm
        :editing="editingDiscount"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />

      <!-- Notification -->
      <div v-if="notification.show" class="notification" :class="notification.type">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DiscountForm from '../components/DiscountForm.vue'
import { useDiscountApi } from '../composables/useDiscountApi'

export default {
  components: {
    DiscountForm
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { createDiscount, updateDiscount, getDiscountById } = useDiscountApi()
    const editingDiscount = ref(null)
    const notification = ref({ show: false, message: '', type: 'success' })

    // Cek jika dalam mode edit
    onMounted(() => {
      if (route.params.id) {
        // Load discount data untuk edit
        editingDiscount.value = getDiscountById(route.params.id)
        if (!editingDiscount.value) {
          router.push('/')
        }
      }
    })

    const handleSubmit = async (discountData) => {
      try {
        if (editingDiscount.value) {
          await updateDiscount(editingDiscount.value._id, discountData)
          showNotification('Diskon berhasil diperbarui', 'success')
        } else {
          await createDiscount(discountData)
          showNotification('Diskon berhasil ditambahkan', 'success')
        }

        setTimeout(() => {
          router.push('/')
        }, 1500)
      } catch (error) {
        showNotification(error.message || 'Terjadi kesalahan', 'error')
      }
    }

    const handleCancel = () => {
      router.push('/')
    }

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type }
      setTimeout(() => {
        notification.value.show = false
      }, 3000)
    }

    return {
      editingDiscount,
      notification,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.add-discount-view {
  padding: 32px 0;
  min-height: calc(100vh - 140px);
}

.back-link {
  margin-bottom: 24px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3DAE2F;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 0;
  transition: color 0.2s;
}

.back-button:hover {
  color: #2E8B27;
}

.form-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #3DAE2F;
  margin: 0 0 24px 0;
  text-align: center;
}

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
  .add-discount-view {
    padding: 24px 0;
  }

  .form-container {
    padding: 24px;
    margin: 0 16px;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 20px;
    margin: 0 12px;
  }

  .form-title {
    font-size: 18px;
  }
}
</style>
