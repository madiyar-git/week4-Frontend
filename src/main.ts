import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { loggerPlugin } from '@/plugins/logger.ts';

const app = createApp(App);
const pinia = createPinia();

pinia.use(loggerPlugin);

app.use(pinia);
app.use(router);

app.mount('#app');
