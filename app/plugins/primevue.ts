import {
  AnimateOnScroll,
  ConfirmationService,
  StyleClass,
  ToastService,
} from "primevue";
import PrimeVue from "primevue/config";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { unstyled: true });
  nuxtApp.vueApp.directive("styleclass", StyleClass);
  nuxtApp.vueApp.directive("animateonscroll", AnimateOnScroll);
  nuxtApp.vueApp.use(ToastService);
  nuxtApp.vueApp.use(ConfirmationService);
});
