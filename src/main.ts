import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { loggerPlugin } from '@/plugins/logger.ts';
import { reportError } from '@/services/errorReporter';

const app = createApp(App);
const pinia = createPinia();

pinia.use(loggerPlugin);

app.use(pinia);
app.use(router);

app.config.errorHandler = (err, instance, info) => {
  const componentName =
    instance?.$options.__name || instance?.$options.name || 'AnonymousComponent';
  const currentRoute = router.currentRoute.value.fullPath;

  reportError(err, {
    component: componentName,
    info,
    route: currentRoute
  });
};

router.onError((err) => {
  reportError(err, { info: 'Vue Router Error', route: router.currentRoute.value.fullPath });
});

window.addEventListener('vite:preloadError', (event: Event) => {
  reportError((event as CustomEvent).detail, { info: 'Vite Preload Error' });
  window.location.reload();
});

window.addEventListener('error', (event) => {
  reportError(event.error || event.message, { info: 'Global Window Error' });
});

window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, { info: 'Unhandled Promise Rejection' });
});

app.mount('#app');
