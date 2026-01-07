<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <h3>Hapus Diskon</h3>
      </div>
      <div class="modal-body">
        <p v-if="discount">Apakah Anda yakin ingin menghapus diskon "{{ discount.name }}"?</p>
        <p v-else>Apakah Anda yakin ingin menghapus diskon yang dipilih?</p>
        <p class="warning-text">Diskon yang dihapus tidak bisa dikembalikan lagi.</p>
      </div>
      <div class="modal-footer">
        <button @click="$emit('cancel')" class="btn-secondary">
          Batalkan
        </button>
        <button @click="$emit('confirm')" class="btn-delete">
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteModal',
  props: {
    discount: {
      type: Object,
      default: null
    }
  },
  emits: ['confirm', 'cancel']
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  background: rgba(61, 174, 47, 0.05);
}

.modal-header h3 {
  margin: 0;
  color: #FF3B30;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  line-height: 1.5;
  color: #333;
}

.warning-text {
  color: #FF3B30;
  font-weight: 500;
  font-size: 14px;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-delete {
  padding: 12px 24px;
  background: #FF3B30;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-delete:hover {
  background: #CC2A20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}
</style>
