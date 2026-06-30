<script setup lang="ts">
import { onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

interface StatDetail {
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
}

interface StatsResponse {
  orm: StatDetail;
  raw: StatDetail;
}

const { data: stats, loading, error, execute } = useApi<StatsResponse>();

onMounted(() => {
  execute({ method: 'GET', url: 'tasks/stats/' });
});
</script>

<template>
  <div class="demo-container">
    <h2>Аналитика задач (Тестирование UseApi)</h2>

    <div v-if="loading">Считаем статистику...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="stats" class="stats-grids">
      <div class="card">
        <h3>Данные из Django ORM</h3>
        <p>Всего: {{ stats.orm.total_tasks }}</p>
        <p>Выполнено: {{ stats.orm.completed_tasks }}</p>
        <p>Активно: {{ stats.orm.active_tasks }}</p>
      </div>

      <div class="card">
        <h3>Данные из Raw SQL (FILTER)</h3>
        <p>Всего: {{ stats.raw.total_tasks }}</p>
        <p>Выполнено: {{ stats.raw.completed_tasks }}</p>
        <p>Активно: {{ stats.raw.active_tasks }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grids {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.card {
  border: 1px solid #333;
  padding: 20px;
  border-radius: 8px;
  background: #1e1e1e;
  color: #fff;
}
.error {
  color: #ff3333;
}
</style>
