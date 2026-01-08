<template>
  <div
    class="w-1/2 max-w-xl min-w-xs flex flex-col justify-center content-center"
  >
    <h2 class="text-xl font-semibold text-center pb-6">Log In</h2>
    <form class="flex flex-col justify-center gap-4" @submit.prevent="login">
      <div class="flex flex-col">
        <label for="e-mail">E-Mail</label>
        <InputText
          id="e-mail"
          v-model="credentials.email"
          type="e-mail"
          fluid
        />
      </div>
      <div class="flex flex-col">
        <label for="password">Password</label>
        <Password
          id="password"
          v-model="credentials.password"
          :feedback="false"
          toggle-mask
          fluid
        />
      </div>
      <Button type="submit">Log In</Button>
      <span
        >Don't have an account yet? Then
        <NuxtLink class="text-primary" to="/register"
          >register now
        </NuxtLink></span
      >
    </form>
  </div>
</template>

<script setup>
import Button from "~/components/volt/Button.vue";
import InputText from "~/components/volt/InputText.vue";
import Password from "~/components/volt/Password.vue";
import { useGlobalSpinnerStore } from "~/stores/globalSpinner";

const { fetch: refreshSession } = useUserSession();
const { startLoad, endLoad } = useGlobalSpinnerStore();
const credentials = reactive({
  email: "",
  password: "",
});

async function login() {
  try {
    startLoad(this);
    await $fetch("/api/login", {
      method: "POST",
      body: credentials,
    });

    await refreshSession();
    await navigateTo("/");
  } catch {
    alert("Bad credentials");
  }
  endLoad(this);
}
</script>
