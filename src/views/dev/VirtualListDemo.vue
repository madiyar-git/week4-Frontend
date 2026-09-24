<script setup lang="ts">
import { ref } from 'vue';
import type { Task } from '@/types/task';
import ManualVirtualList from '@/components/ManualVirtualList.vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

function generateTasks(count = 1200): Task[] {
  const priorities: Task['priority'][] = ['low', 'medium', 'high'];

  return Array.from(
    { length: count },
    (_, index): Task => ({
      id: index + 1,
      title: `Задача #${index + 1}: Оптимизация виртуального списка`,
      description: `Описание и контекст для проверки рендеринга задачи №${index + 1}`,
      completed: index % 3 === 0,
      priority: priorities[index % 3]!,
      created_at: new Date(Date.now() - index * 3600000)
    })
  );
}

const tasks = ref<Task[]>(generateTasks(1200));
const mode = ref<'plain' | 'manual' | 'scroller'>('scroller');
</script>

<template>
  <div class="demo-page">
    <h2>Сравнение списков (Всего задач: {{ tasks.length }})</h2>

    <div class="controls">
      <button :class="{ active: mode === 'plain' }" @click="mode = 'plain'">
        1. Обычный v-for
      </button>
      <button :class="{ active: mode === 'manual' }" @click="mode = 'manual'">
        2. Ручная реализация
      </button>
      <button :class="{ active: mode === 'scroller' }" @click="mode = 'scroller'">
        3. RecycleScroller
      </button>
    </div>

    <div v-if="mode === 'plain'" class="list-container plain-container">
      <div v-for="task in tasks" :key="task.id" class="task-card">
        <div class="task-header">
          <span class="task-id">#{{ task.id }}</span>
          <span class="task-title" :class="{ completed: task.completed }">
            {{ task.title }}
          </span>
          <span class="task-priority" :class="task.priority">
            {{ task.priority }}
          </span>
        </div>
        <p class="task-desc">{{ task.description }}</p>
      </div>
    </div>

    <ManualVirtualList
      v-else-if="mode === 'manual'"
      :items="tasks"
      :item-height="60"
      :container-height="600"
      :overscan="5"
    >
      <template #default="{ item }">
        <div class="task-card">
          <div class="task-header">
            <span class="task-id">#{{ item.id }}</span>
            <span class="task-title" :class="{ completed: item.completed }">
              {{ item.title }}
            </span>
            <span class="task-priority" :class="item.priority">
              {{ item.priority }}
            </span>
          </div>
          <p class="task-desc">{{ item.description }}</p>
        </div>
      </template>
    </ManualVirtualList>

    <RecycleScroller
      v-else-if="mode === 'scroller'"
      class="list-container"
      :items="tasks"
      :item-size="60"
      key-field="id"
      v-slot="{ item }"
    >
      <div class="task-card">
        <div class="task-header">
          <span class="task-id">#{{ item.id }}</span>
          <span class="task-title" :class="{ completed: item.completed }">
            {{ item.title }}
          </span>
          <span class="task-priority" :class="item.priority">
            {{ item.priority }}
          </span>
        </div>
        <p class="task-desc">{{ item.description }}</p>
      </div>
    </RecycleScroller>
  </div>
</template>

<style scoped>
.demo-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.controls button {
  padding: 8px 16px;
  background: #2a2a2e;
  border: 1px solid #444;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.controls button.active {
  background: #1db954;
  border-color: #1db954;
  color: #000;
  font-weight: bold;
}

.list-container {
  height: 600px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #18181c;
}

.plain-container {
  overflow-y: auto;
  padding: 0 10px;
}

.task-card {
  height: 60px;
  box-sizing: border-box;
  padding: 8px 12px;
  border-bottom: 1px solid #2a2a2e;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-id {
  color: #666;
  font-size: 12px;
}

.task-title {
  font-weight: bold;
  flex: 1;
}

.task-title.completed {
  text-decoration: line-through;
  color: #888;
}

.task-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-priority {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.task-priority.low {
  background: #2b3a2a;
  color: #63e2b7;
}
.task-priority.medium {
  background: #3a332a;
  color: #f2c97d;
}
.task-priority.high {
  background: #3a2a2a;
  color: #e88080;
}
</style>
