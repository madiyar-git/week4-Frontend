<script setup lang="ts">
import { ref, computed, watch, markRaw, onMounted, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTaskStore } from '@/stores/tasks';

import TasksTable from '@/components/TasksTable.vue';
import TaskList from '@/components/TaskList.vue';
import { useSaveInClipBoard } from '@/composables/useSaveInClipBoard';

interface Tab {
  key: string;
  label: string;
  component: object;
  icon?: string;
}

const taskStore = useTaskStore();
const { tasks } = storeToRefs(taskStore);

const tabs: Tab[] = [
  { key: 'table', label: 'Table', component: markRaw(TasksTable), icon: '📊' },
  { key: 'list', label: 'List', component: markRaw(TaskList), icon: '📑' }
];

const route = useRoute();
const router = useRouter();

const activeComponentRef = ref<
  InstanceType<typeof TasksTable> | InstanceType<typeof TaskList> | null
>(null);

const activeTabKey = computed(() => {
  const queryTab = route.query.tab as string;
  const exists = tabs.some((t) => t.key === queryTab);
  return exists ? queryTab : tabs[0]?.key;
});

const activeTab = computed(() => {
  return tabs.find((t) => t.key === activeTabKey.value) || tabs[0];
});

const tabProps = computed(() => {
  if (activeTabKey.value === 'list') {
    return { modelValue: tasks.value };
  }
  return {};
});

const selectTab = (key: string) => {
  router.replace({
    query: { ...route.query, tab: key }
  });
};

watch(
  () => route.query.tab,
  (newTab) => {
    const isValid = tabs.some((t) => t.key === newTab);
    if (!isValid) {
      router.replace({ query: { ...route.query, tab: tabs[0]?.key } });
    }
  },
  { immediate: true }
);
</script>

<template>
  <main class="app-main">
    <div class="tasks-container">
      <h2 @click="useSaveInClipBoard('My Tasks')">My Tasks</h2>

      <div class="header-actions">
        <div class="tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTabKey === tab.key }]"
            @click="selectTab(tab.key)"
          >
            <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <KeepAlive :max="2">
        <component
          :is="activeTab?.component"
          :key="activeTab?.key"
          v-bind="tabProps"
          ref="activeComponentRef"
        />
      </KeepAlive>
    </div>
  </main>
</template>

<style scoped>
.app-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
}

.tasks-container {
  width: 100%;
  max-width: 1000px;
  box-sizing: border-box;
}

h2 {
  margin: 0 0 24px 0;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: #ffffff;
  cursor: pointer;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.tabs-nav {
  display: flex;
  gap: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #b3b3b3;
  padding: 6px 14px;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #ffffff;
}

.tab-btn.active {
  background-color: #1ed760;
  color: #000000;
}

.tab-icon {
  font-size: 0.95rem;
}
</style>
