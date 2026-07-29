import { defineStore } from "pinia";

export const useSideMenuStore = defineStore("SIDE_MENU", () => {
  // Properties
  const expandedStates = reactive<Map<symbol, boolean>>(new Map());

  // Getters?
  const getExpandedState = (id: symbol) =>
    computed(() => expandedStates.get(id));

  // Actions
  const registerSideMenu = (id: symbol, initiallyExpanded = true) => {
    expandedStates.set(id, initiallyExpanded);
  };
  const toggleExpanded = (id: symbol) => {
    expandedStates.set(id, !expandedStates.get(id));
  };

  return { expandedStates, getExpandedState, registerSideMenu, toggleExpanded };
});
