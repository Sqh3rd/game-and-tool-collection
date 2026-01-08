export const useGlobalSpinnerStore = defineStore(GLOBAL_SPINNER, () => {
  // Properties
  const currentlyLoading = ref<Component[]>([]);

  // Getters
  const isLoading = computed(() => currentlyLoading.value.length > 0);

  //Actions
  const startLoad = (it: Component) => {
    currentlyLoading.value.push(it);
  };
  const endLoad = (it: Component) => {
    const index = currentlyLoading.value.indexOf(it);
    currentlyLoading.value.splice(index, 1);
  };

  return { currentlyLoading, isLoading, startLoad, endLoad };
});
