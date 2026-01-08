<template>
  <!-- Modal Overlay -->
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <!-- Modal Content -->
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-header-left">
          <h3 class="modal-title">Konfigurasi API</h3>
        </div>
        <button class="modal-close" @click="closeModal">
          <span>×</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Connection Test Result -->
        <div v-if="connectionResult" class="connection-test-result">
          <div :class="['connection-status', connectionResult.success ? 'success' : 'error']">
            {{ connectionResult.message }}
          </div>
        </div>

        <!-- API URL Input -->
        <div class="api-input-section">
          <div class="input-group">
            <label class="input-label">API URL crudcrud.com</label>
            <div class="input-wrapper">
              <input
                type="text"
                v-model="apiFullUrl"
                placeholder="https://crudcrud.com/api/bc0c.../diskon"
                class="api-url-input"
              />
              <button @click="testConnection" class="btn-test">
                Test
              </button>
            </div>
            <p class="input-hint">Masukkan URL API CRUD CRUD Anda untuk mengelola diskon</p>
          </div>
        </div>

        <!-- Apply Button -->
        <div class="action-buttons">
          <button @click="saveApiUrl" class="btn-apply">
            Terapkan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { apiService } from '../services/api'

export default {
  name: 'ApiConfigModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show', 'api-updated'],
  setup(props, { emit }) {
    const apiFullUrl = ref('')
    const connectionResult = ref(null)

    // Load config saat komponen dimuat
    const loadConfig = () => {
      const config = apiService.getConfig()
      apiFullUrl.value = config.fullUrl || ''
    }

    // Simpan API URL
    const saveApiUrl = () => {
      if (apiFullUrl.value) {
        apiService.setCustomApiUrl(apiFullUrl.value)
        emit('api-updated')
        closeModal()
        alert('API URL berhasil diterapkan!')
      } else {
        alert('Harap masukkan URL API terlebih dahulu')
      }
    }

    // Test koneksi API
    const testConnection = async () => {
      if (!apiFullUrl.value) {
        connectionResult.value = {
          success: false,
          message: 'Harap masukkan URL API terlebih dahulu'
        }
        return
      }

      connectionResult.value = null

      try {
        const result = await apiService.testConnection()
        connectionResult.value = result
      } catch (error) {
        connectionResult.value = {
          success: false,
          message: 'Terjadi kesalahan saat menguji koneksi'
        }
      }

      // Clear result setelah 5 detik
      setTimeout(() => {
        connectionResult.value = null
      }, 5000)
    }

    // Tutup modal
    const closeModal = () => {
      emit('update:show', false)
      connectionResult.value = null
    }

    // Reset to default
    const resetToDefault = () => {
      if (confirm('Reset konfigurasi API ke default?')) {
        apiService.resetToDefault()
        loadConfig()
        emit('api-updated')
        alert('Konfigurasi telah direset ke default!')
      }
    }

    // Load config saat modal dibuka
    onMounted(() => {
      loadConfig()
    })

    // Watch untuk perubahan props.show
    watch(() => props.show, (newVal) => {
      if (newVal) {
        loadConfig()
      } else {
        connectionResult.value = null
      }
    })

    return {
      apiFullUrl,
      connectionResult,
      saveApiUrl,
      testConnection,
      closeModal,
      resetToDefault
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.15);
  transform: rotate(90deg);
}

.modal-close span {
  line-height: 1;
  margin-top: -2px;
}

/* Modal Body */
.modal-body {
  padding: 24px;
}

/* Connection Test Result */
.connection-test-result {
  margin-bottom: 20px;
}

.connection-status {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeInUp 0.3s ease-out;
}

.connection-status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.connection-status.success {
  background: rgba(61, 174, 47, 0.1);
  color: #2E8B27;
  border: 1px solid rgba(61, 174, 47, 0.2);
}

.connection-status.success::before {
  background: #2E8B27;
}

.connection-status.error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.connection-status.error::before {
  background: #f44336;
}

/* API Input Section */
.api-input-section {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.api-url-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  transition: all 0.2s;
}

.api-url-input:focus {
  outline: none;
  border-color: #3DAE2F;
  background: white;
  box-shadow: 0 0 0 3px rgba(61, 174, 47, 0.1);
}

.api-url-input::placeholder {
  color: #999;
}

.input-hint {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Buttons */
.btn-test,
.btn-apply {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-test {
  background: #2196F3;
  color: white;
  min-width: 80px;
}

.btn-test:hover {
  background: #0b7dda;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-apply {
  background: linear-gradient(135deg, #3DAE2F 0%, #2E8B27 100%);
  color: white;
  width: 100%;
  padding: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 174, 47, 0.4);
}

.btn-apply:active {
  transform: translateY(0);
}

.action-buttons {
  margin-top: 32px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 16px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .input-wrapper {
    flex-direction: column;
  }

  .btn-test {
    width: 100%;
    margin-top: 8px;
  }

  .btn-apply {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 16px;
  }

  .api-url-input {
    font-size: 13px;
  }

  .btn-test,
  .btn-apply {
    font-size: 13px;
  }
}
</style>
