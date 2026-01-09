<template>
  <div
    class="w-1/2 max-w-xl min-w-xs flex flex-col justify-center content-center"
  >
    <h1 class="text-xl font-semibold text-center pb-6">Log In</h1>
    <Form
      v-slot="$form"
      :initial-values="credentials"
      :resolver="zodResolver(loginSchema)"
      class="flex flex-col justify-center gap-4"
      @submit.prevent="login"
    >
      <div class="flex flex-col">
        <label for="e-mail">E-Mail</label>
        <InputText
          id="e-mail"
          name="email"
          type="e-mail"
          fluid
        />
      </div>
      <div class="flex flex-col">
        <label for="password">Password</label>
        <Password
          id="password"
          name="password"
          :feedback="false"
          toggle-mask
          fluid
        />
      </div>
      <Button type="submit">Log In</Button>
      <span
        >Don't have an account yet? Then
        <NuxtLink
          class="text-primary"
          to="/register"
          >register now
        </NuxtLink></span
      >
    </Form>
  </div>
</template>

<script lang="ts" setup>
import { Form } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "~/components/volt/Button.vue";
import InputText from "~/components/volt/InputText.vue";
import Password from "~/components/volt/Password.vue";
import { useGlobalSpinnerStore } from "~/stores/globalSpinner";
import type { Login } from "~~/shared/types/common";

const { fetch: refreshSession } = useUserSession();
const { startLoad, endLoad } = useGlobalSpinnerStore();
const credentials = ref<Login>({ email: "", password: "" });
const id = Symbol("login");

async function login() {
  try {
    startLoad(id);
    await $fetch("/api/login", { method: "POST", body: credentials });

    await refreshSession();
    await navigateTo("/");
  } catch {
    alert("Bad credentials");
  }
  endLoad(id);
}
</script>
