import { ref, computed, watch, type Ref } from 'vue'

export function usePagination<T>(items: Ref<T[]>, pageSize = 5) {
  const currentPage = ref<number>(1)

  const totalPages = computed<number>(() => {
    return Math.max(1, Math.ceil(items.value.length / pageSize))
  })

  const pagedItems = computed<T[]>({
    get() {
      const startIndex = (currentPage.value - 1) * pageSize
      const endIndex = startIndex + pageSize
      return items.value.slice(startIndex, endIndex)
    },
    set(newValue) {
      const startIndex = (currentPage.value - 1) * pageSize
      items.value.splice(startIndex, pageSize, ...newValue)
    }
  })

  const next = (): void => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prev = (): void => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const goTo = (page: number): void => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages) {
      currentPage.value = newTotalPages
    }
  })

  return {
    currentPage,
    totalPages,
    pagedItems,
    next,
    prev,
    goTo,
  }
}