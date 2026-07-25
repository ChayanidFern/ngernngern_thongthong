<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import type { CreateTransactionBody, Transaction, UpdateTransactionBody } from '@/models'

const transactionStore = useTransactionStore()
const { transactions, summary, isLoading, error } = storeToRefs(transactionStore)

const filterType = ref<'all' | 'income' | 'expense'>('all')

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Type', key: 'type' },
  { title: 'Description', key: 'description' },
  { title: 'Category', key: 'category' },
  { title: 'Amount', key: 'amount', align: 'end' as const },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

// Dialog state
const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const deletingTransaction = ref<Transaction | null>(null)

const form = ref<CreateTransactionBody & UpdateTransactionBody>({
  type: 'income',
  amount: 0,
  description: '',
  category: null,
  date: new Date().toISOString().slice(0, 10),
})

const typeOptions = [
  { title: 'รายรับ (Income)', value: 'income' },
  { title: 'รายจ่าย (Expense)', value: 'expense' },
]

const categoryOptions = [
  'เงินเดือน',
  'ค่าอาหาร',
  'ค่าเดินทาง',
  'ค่าที่พัก',
  'ค่าน้ำค่าไฟ',
  'ค่าโทรศัพท์',
  'ช้อปปิ้ง',
  'ความบันเทิง',
  'การศึกษา',
  'อื่น ๆ',
]

function openCreate() {
  editingTransaction.value = null
  form.value = {
    type: 'income',
    amount: 0,
    description: '',
    category: null,
    date: new Date().toISOString().slice(0, 10),
  }
  dialog.value = true
}

function openEdit(transaction: Transaction) {
  editingTransaction.value = transaction
  form.value = {
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category,
    date: transaction.date,
  }
  dialog.value = true
}

function openDelete(transaction: Transaction) {
  deletingTransaction.value = transaction
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingTransaction.value)
      await transactionStore.updateTransaction(editingTransaction.value.id, form.value)
    else
      await transactionStore.createTransaction(form.value as CreateTransactionBody)
    dialog.value = false
    await transactionStore.fetchSummary()
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingTransaction.value) return
  isSubmitting.value = true
  try {
    await transactionStore.deleteTransaction(deletingTransaction.value.id)
    deleteDialog.value = false
    await transactionStore.fetchSummary()
  }
  finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function formatAmount(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getTypeColor(type: string) {
  return type === 'income' ? 'success' : 'error'
}

function getTypeLabel(type: string) {
  return type === 'income' ? 'รายรับ' : 'รายจ่าย'
}

watch(filterType, (val) => {
  transactionStore.fetchTransactions(val === 'all' ? undefined : val)
})

onMounted(() => {
  transactionStore.fetchTransactions()
  transactionStore.fetchSummary()
})
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายรับทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-success">
                {{ summary ? formatAmount(summary.totalIncome) : '0.00' }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="error" variant="tonal" size="48">
              <VIcon icon="ri-arrow-down-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายจ่ายทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-error">
                {{ summary ? formatAmount(summary.totalExpense) : '0.00' }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="48">
              <VIcon icon="ri-wallet-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">ยอดคงเหลือ</div>
              <div class="text-h5 font-weight-bold" :class="summary && summary.balance >= 0 ? 'text-success' : 'text-error'">
                {{ summary ? formatAmount(summary.balance) : '0.00' }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Transaction Table -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4 flex-wrap gap-4">
        <span class="text-h6">รายการรายรับรายจ่าย</span>
        <div class="d-flex align-center gap-4">
          <VSelect
            v-model="filterType"
            :items="[
              { title: 'ทั้งหมด', value: 'all' },
              { title: 'รายรับ', value: 'income' },
              { title: 'รายจ่าย', value: 'expense' },
            ]"
            label="Filter"
            density="compact"
            style="width: 160px"
          />
          <VBtn
            color="primary"
            prepend-icon="ri-add-line"
            @click="openCreate"
          >
            เพิ่มรายการ
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VDataTable
        :headers="headers"
        :items="transactions"
        :loading="isLoading"
        hover
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.type="{ item }">
          <VChip :color="getTypeColor(item.type)" size="small">
            {{ getTypeLabel(item.type) }}
          </VChip>
        </template>

        <template #item.category="{ item }">
          {{ item.category ?? '-' }}
        </template>

        <template #item.amount="{ item }">
          <span :class="item.type === 'income' ? 'text-success' : 'text-error'">
            {{ formatAmount(item.amount) }}
          </span>
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">แก้ไข</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">ลบ</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            ยังไม่มีรายการ กด "เพิ่มรายการ" เพื่อสร้างรายการใหม่
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VSelect
              v-model="form.type"
              :items="typeOptions"
              label="ประเภท"
              class="mb-4"
              required
            />
            <VTextField
              v-model.number="form.amount"
              label="จำนวนเงิน"
              type="number"
              min="0"
              step="0.01"
              prepend-inner-icon="ri-money-baht-line"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.description"
              label="รายละเอียด"
              prepend-inner-icon="ri-file-list-line"
              class="mb-4"
              required
            />
            <VCombobox
              v-model="form.category"
              :items="categoryOptions"
              label="หมวดหมู่"
              prepend-inner-icon="ri-folder-line"
              class="mb-4"
              clearable
            />
            <VTextField
              v-model="form.date"
              label="วันที่"
              type="date"
              prepend-inner-icon="ri-calendar-line"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">ยกเลิก</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingTransaction ? 'บันทึก' : 'สร้าง' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="ลบรายการ">
        <VCardText>
          คุณแน่ใจหรือไม่ว่าต้องการลบรายการ <strong>{{ deletingTransaction?.description }}</strong>? การกระทำนี้ไม่สามารถย้อนกลับได้
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">ยกเลิก</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            ลบ
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
