export const useSpinnerStore = defineStore("SPINNER", () => {
  // Properties
  const currentlyLoading = ref<symbol[]>([]);

  // Getters
  const isLoading = computed(() => currentlyLoading.value.length > 0);

  //Actions
  const startLoad = (it: symbol) => {
    currentlyLoading.value.push(it);
  };
  const endLoad = (it: symbol) => {
    const index = currentlyLoading.value.indexOf(it);
    currentlyLoading.value.splice(index, 1);
  };

  return { currentlyLoading, isLoading, startLoad, endLoad };
});
