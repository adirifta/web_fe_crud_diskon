<template>
  <div class="api-config">
    <h4>Konfigurasi API</h4>

    <div class="api-connection-test" v-if="connectionResult">
      <div :class="['connection-status', connectionResult.success ? 'success' : 'error']">
        {{ connectionResult.message }}
      </div>
    </div>

    <div class="api-input-group">
      <input
        type="text"
        v-model="apiFullUrl"
        placeholder="https://crudcrud.com/api/your-token/diskon"
        class="api-url-input"
      >
      <button @click="saveApiUrl" class="btn-apply">
        Terapkan
      </button>
      <button @click="testConnection" class="btn-test">
        Test
      </button>
    </div>

    <div class="api-advanced" v-if="showAdvanced">
      <div class="form-group">
        <label>Base URL</label>
        <input type="text" v-model="apiBaseUrl" placeholder="https://crudcrud.com/api">
      </div>
      <div class="form-group">
        <label>Token</label>
        <input type="text" v-model="apiToken" placeholder="bc0c...">
      </div>
      <button @click="saveAdvancedConfig" class="btn-save">
        Simpan Konfigurasi
      </button>
    </div>

    <p class="api-help">
      Masukkan URL API CRUD CRUD Anda untuk mengelola diskon
    </p>

    <button @click="toggleAdvanced" class="btn-toggle">
      {{ showAdvanced ? 'Sembunyikan' : 'Konfigurasi Lanjutan' }}
    </button>

    <button @click="resetToDefault" class="btn-reset">
      Reset ke Default
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { apiService } from '../services/api'

export default {
  name: 'ApiConfig',
  emits: ['api-updated'],
  setup(props, { emit }) {
    const apiFullUrl = ref('')
    const apiBaseUrl = ref('')
    const apiToken = ref('')
    const showAdvanced = ref(false)
    const connectionResult = ref(null)

    const loadConfig = () => {
      const config = apiService.getConfig()
      apiFullUrl.value = config.fullUrl || ''
      apiBaseUrl.value = config.baseUrl || 'https://crudcrud.com/api'
      apiToken.value = config.token || ''
    }

    const saveApiUrl = () => {
      if (apiFullUrl.value) {
        apiService.setCustomApiUrl(apiFullUrl.value)
        emit('api-updated')
        alert('API URL berhasil disimpan!')
      }
    }

    const saveAdvancedConfig = () => {
      if (apiBaseUrl.value && apiToken.value) {
        apiService.saveConfig(apiBaseUrl.value, apiToken.value)
        emit('api-updated')
        alert('Konfigurasi API berhasil disimpan!')
      }
    }

    const testConnection = async () => {
      connectionResult.value = null
      const result = await apiService.testConnection()
      connectionResult.value = result

      setTimeout(() => {
        connectionResult.value = null
      }, 5000)
    }

    const toggleAdvanced = () => {
      showAdvanced.value = !showAdvanced.value
    }

    const resetToDefault = () => {
      if (confirm('Reset konfigurasi API ke default?')) {
        apiService.resetToDefault()
        loadConfig()
        emit('api-updated')
        alert('Konfigurasi telah direset ke default!')
      }
    }

    onMounted(() => {
      loadConfig()
    })

    return {
      apiFullUrl,
      apiBaseUrl,
      apiToken,
      showAdvanced,
      connectionResult,
      saveApiUrl,
      saveAdvancedConfig,
      testConnection,
      toggleAdvanced,
      resetToDefault
    }
  }
}
</script>

<style scoped>
/* Tambah styling untuk komponen ApiConfig yang diperluas */
.api-connection-test {
  margin-bottom: 1rem;
}

.connection-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.connection-status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.connection-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.api-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.api-url-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.btn-apply,
.btn-test,
.btn-save,
.btn-toggle,
.btn-reset {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-apply {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-test {
  background: #2196F3;
  color: white;
}

.btn-save {
  background: #4CAF50;
  color: white;
  margin-top: 1rem;
}

.btn-toggle {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
  margin-right: 0.5rem;
}

.btn-reset {
  background: transparent;
  color: #f44336;
  border: 1px solid #f44336;
}

.btn-apply:hover,
.btn-test:hover,
.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-toggle:hover {
  background: #667eea;
  color: white;
}

.btn-reset:hover {
  background: #f44336;
  color: white;
}

.api-advanced {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.api-advanced .form-group {
  margin-bottom: 1rem;
}

.api-advanced label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.api-advanced input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.api-help {
  font-size: 0.875rem;
  color: #666;
  margin: 1rem 0;
}
</style>
