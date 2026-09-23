declare module 'vue-virtual-scroller' {
  import type { App, DefineComponent } from 'vue';

  export const RecycleScroller: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export const DynamicScroller: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export const DynamicScrollerItem: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;

  const plugin: {
    install: (app: App) => void;
  };
  export default plugin;
}
