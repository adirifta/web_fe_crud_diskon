<template>
  <form @submit.prevent="handleSubmit" class="discount-form">
    <div class="form-group">
      <label for="name" class="form-label">Nama Diskon</label>
      <input
        type="text"
        id="name"
        v-model="form.name"
        placeholder="Misal: Diskon opening, diskon akhir tahun"
        class="form-input"
        :class="{ 'error': errors.name }"
        required
      >
      <div v-if="errors.name" class="error-message">
        {{ errors.name }}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Diskon</label>
      <div class="discount-input-group">
        <div class="discount-type-selector">
          <button
            type="button"
            class="type-button"
            :class="{ 'active': form.type === 'percentage' }"
            @click="form.type = 'percentage'"
          >
            %
          </button>
          <button
            type="button"
            class="type-button"
            :class="{ 'active': form.type === 'fixed' }"
            @click="form.type = 'fixed'"
          >
            Rp
          </button>
        </div>
        <input
          type="number"
          v-model="form.value"
          :placeholder="form.type === 'percentage' ? '0' : '0'"
          min="0"
          :max="form.type === 'percentage' ? 100 : null"
          step="0.01"
          class="form-input discount-value-input"
          :class="{ 'error': errors.value }"
          required
        >
      </div>
      <div v-if="errors.value" class="error-message">
        {{ errors.value }}
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">
        Batalkan
      </button>
      <button type="submit" class="btn-primary">
        {{ editing ? 'Simpan Perubahan' : 'Simpan' }}
      </button>
    </div>
  </form>
</template>

<script>
import { ref, reactive, watch } from 'vue'

export default {
  name: 'DiscountForm',
  props: {
    editing: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const form = reactive({
      name: props.editing?.name || '',
      type: props.editing?.type || 'percentage',
      value: props.editing?.value || 0
    })

    const errors = reactive({
      name: '',
      value: ''
    })

    const validate = () => {
      let isValid = true

      // Reset errors
      errors.name = ''
      errors.value = ''

      // Validate name
      if (!form.name.trim()) {
        errors.name = 'Nama diskon tidak boleh kosong.'
        isValid = false
      } else if (form.name.trim().length < 3) {
        errors.name = 'Nama diskon minimal 3 karakter.'
        isValid = false
      }

      // Validate value
      if (form.value === null || form.value === '') {
        errors.value = 'Diskon tidak boleh kosong.'
        isValid = false
      } else if (form.type === 'percentage' && (form.value < 0 || form.value > 100)) {
        errors.value = 'Diskon persentase harus antara 0-100%.'
        isValid = false
      } else if (form.type === 'fixed' && form.value < 0) {
        errors.value = 'Diskon nominal tidak boleh negatif.'
        isValid = false
      }

      return isValid
    }

    const handleSubmit = () => {
      if (validate()) {
        emit('submit', {
          name: form.name.trim(),
          type: form.type,
          value: parseFloat(form.value)
        })
      }
    }

    // Watch for editing prop changes
    watch(() => props.editing, (newEditing) => {
      if (newEditing) {
        form.name = newEditing.name
        form.type = newEditing.type
        form.value = newEditing.value
      }
    }, { immediate: true })

    return {
      form,
      errors,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.discount-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3DAE2F;
  box-shadow: 0 0 0 3px rgba(61, 174, 47, 0.1);
}

.form-input.error {
  border-color: #FF3B30;
  background: #FFF5F5;
}

.discount-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.discount-type-selector {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.type-button {
  padding: 12px 20px;
  border: none;
  background: #f8f9fa;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.type-button.active {
  background: #3DAE2F;
  color: white;
}

.type-button:not(.active):hover {
  background: #f0f0f0;
}

.discount-value-input {
  flex: 1;
}

.error-message {
  font-size: 12px;
  color: #FF3B30;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3DAE2F;
  color: white;
  box-shadow: 0 2px 8px rgba(61, 174, 47, 0.3);
}

.btn-primary:hover {
  background: #2E8B27;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 174, 47, 0.4);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f0f0f0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
