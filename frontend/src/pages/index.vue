<script setup lang="ts">
import { onMounted } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useTransactionStore } from '@/stores/use-transaction-store'

useSEO({
  title: 'Dashboard - NgernNgern ThongThong',
  description: 'ภาพรวมรายรับรายจ่ายส่วนตัว',
  keywords: ['dashboard', 'finance', 'income', 'expense'],
})

const transactionStore = useTransactionStore()
const { summary, transactions } = storeToRefs(transactionStore)

function formatAmount(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

onMounted(() => {
  transactionStore.fetchTransactions()
  transactionStore.fetchSummary()
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">ภาพรวม</h1>

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

    <VRow>
      <VCol cols="12" md="6">
        <VCard title="รายการล่าสุด">
          <VList lines="two">
            <VListItem
              v-for="t in transactions.slice(0, 5)"
              :key="t.id"
            >
              <template #prepend>
                <VAvatar :color="t.type === 'income' ? 'success' : 'error'" variant="tonal" size="36">
                  <VIcon :icon="t.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'" size="18" />
                </VAvatar>
              </template>
              <VListItemTitle>{{ t.description }}</VListItemTitle>
              <VListItemSubtitle>
                {{ formatDate(t.date) }} — {{ t.category ?? 'ไม่ระบุหมวดหมู่' }}
              </VListItemSubtitle>
              <template #append>
                <span :class="t.type === 'income' ? 'text-success' : 'text-error'">
                  {{ formatAmount(t.amount) }}
                </span>
              </template>
            </VListItem>
            <VListItem v-if="transactions.length === 0" class="text-center text-medium-emphasis py-4">
              ยังไม่มีรายการ
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'transaction-page' }">
              <VBtn variant="text" size="small">ดูรายการทั้งหมด</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
