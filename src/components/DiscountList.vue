<template>
  <div class="discount-list">
    <!-- Table Header -->
    <div class="table-header">
      <div class="header-cell name-cell">
        <span>Nama Diskon</span>
        <button class="sort-button" @click="toggleNameSort">
          <span v-if="sortField === 'name' && sortDirection === 'asc'">↑</span>
          <span v-else-if="sortField === 'name' && sortDirection === 'desc'">↓</span>
          <span v-else>↕</span>
        </button>
      </div>
      <div class="header-cell value-cell">
        <span>Nilai Diskon</span>
        <button class="sort-button" @click="toggleValueSort">
          <span v-if="sortField === 'value' && sortDirection === 'asc'">↑</span>
          <span v-else-if="sortField === 'value' && sortDirection === 'desc'">↓</span>
          <span v-else>↕</span>
        </button>
      </div>
      <div class="header-cell actions-cell">Aksi</div>
    </div>

    <!-- Table Body -->
    <div class="table-body">
      <div
        v-for="discount in sortedDiscounts"
        :key="discount._id"
        class="table-row"
      >
        <div class="cell name-cell">
          <div class="discount-name">{{ discount.name }}</div>
          <div v-if="discount.description" class="discount-description">
            {{ discount.description }}
          </div>
        </div>
        <div class="cell value-cell">
          <span class="discount-value">
            {{ formatDiscountValue(discount) }}
          </span>
        </div>
        <div class="cell actions-cell">
          <button @click="$emit('edit', discount)" class="action-button edit-button">
            Ubah
          </button>
          <button @click="$emit('delete', discount)" class="action-button delete-button">
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DiscountList',
  props: {
    discounts: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  emits: ['edit', 'delete'],
  setup(props) {
    const sortField = ref('name')
    const sortDirection = ref('asc')

    const sortedDiscounts = computed(() => {
      const sorted = [...props.discounts]

      sorted.sort((a, b) => {
        let aValue, bValue

        if (sortField.value === 'name') {
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
        } else {
          aValue = a.value
          bValue = b.value
        }

        if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
        return 0
      })

      return sorted
    })

    const toggleNameSort = () => {
      if (sortField.value === 'name') {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = 'name'
        sortDirection.value = 'asc'
      }
    }

    const toggleValueSort = () => {
      if (sortField.value === 'value') {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = 'value'
        sortDirection.value = 'desc'
      }
    }

    const formatDiscountValue = (discount) => {
      if (discount.type === 'percentage') {
        return `${discount.value}%`
      } else {
        return `Rp ${parseInt(discount.value).toLocaleString('id-ID')}`
      }
    }

    return {
      sortField,
      sortDirection,
      sortedDiscounts,
      toggleNameSort,
      toggleValueSort,
      formatDiscountValue
    }
  }
}
</script>

<style scoped>
.discount-list {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Table Header */
.table-header {
  display: grid;
  grid-template-columns: 3fr 1fr 2fr;
  background: rgba(61, 174, 47, 0.05);
  border-bottom: 1px solid #e0e0e0;
  padding: 0 16px;
}

.header-cell {
  padding: 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #3DAE2F;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-cell {
  grid-column: 1;
}

.value-cell {
  grid-column: 2;
}

.actions-cell {
  grid-column: 3;
  justify-content: center;
}

.sort-button {
  background: none;
  border: none;
  color: #3DAE2F;
  cursor: pointer;
  padding: 2px;
  font-size: 12px;
  transition: color 0.2s;
  opacity: 0.7;
}

.sort-button:hover {
  opacity: 1;
}

/* Table Body */
.table-body {
  max-height: 500px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 3fr 1fr 2fr;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
  transition: background 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(61, 174, 47, 0.02);
}

.cell {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Name Cell */
.discount-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.discount-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* Value Cell */
.discount-value {
  font-size: 14px;
  font-weight: 600;
  color: #3DAE2F;
  padding: 4px 12px;
  background: rgba(61, 174, 47, 0.1);
  border-radius: 6px;
  display: inline-block;
}

/* Actions Cell */
.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-button {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-button {
  background: #3DAE2F;
  color: white;
}

.edit-button:hover {
  background: #2E8B27;
  transform: translateY(-1px);
}

.delete-button {
  background: #FF3B30;
  color: white;
}

.delete-button:hover {
  background: #CC2A20;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .discount-list {
    border-radius: 8px;
  }

  .table-header {
    grid-template-columns: 2fr 1fr 1.5fr;
    padding: 0 12px;
  }

  .table-row {
    grid-template-columns: 2fr 1fr 1.5fr;
    padding: 0 12px;
  }

  .header-cell {
    padding: 12px 4px;
    font-size: 11px;
  }

  .cell {
    padding: 12px 4px;
  }

  .discount-name {
    font-size: 13px;
  }

  .discount-value {
    font-size: 13px;
    padding: 3px 10px;
  }

  .action-button {
    padding: 5px 12px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .table-header {
    grid-template-columns: 1.5fr 1fr 1fr;
  }

  .table-row {
    grid-template-columns: 1.5fr 1fr 1fr;
  }

  .actions-cell {
    flex-direction: column;
    gap: 4px;
  }

  .action-button {
    width: 100%;
    padding: 6px;
  }
}
</style>
