<template>
  <div class="w-full h-full p-5 flex justify-center">
    <div class="w-1/2 max-w-xl min-w-xs flex flex-col justify-center">
      <h1 class="text-xl font-semibold text-center pb-6">Log In</h1>
      <Form
        v-slot="$form"
        :initial-values="credentials"
        :resolver="zodResolver(loginSchema)"
        class="flex flex-col justify-center gap-4"
        @submit="login"
      >
        <div class="flex flex-col">
          <label for="e-mail">E-Mail</label>
          <InputText
            id="e-mail"
            name="email"
            type="e-mail"
            fluid
          />
          <Message
            v-if="$form.email?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.email.error.message }}</Message
          >
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
        <Button type="submit" label="Log In" />
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
  </div>
</template>

<script lang="ts" setup>
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { useToast } from "primevue";
import Button from "~/components/volt/Button.vue";
import InputText from "~/components/volt/InputText.vue";
import Message from "~/components/volt/Message.vue";
import Password from "~/components/volt/Password.vue";
import { useGlobalSpinnerStore } from "~/stores/globalSpinner";
import type { Login } from "~~/shared/types/common";
import { isPrimitive } from "~~/shared/utils/type-assertions";

const ID = Symbol(this);

const { fetch: refreshSession } = useUserSession();
const { startLoad, endLoad } = useGlobalSpinnerStore();
const credentials = ref<Login>({ email: "", password: "" });
const toast = useToast();

async function login(event: FormSubmitEvent) {
  if (!event.valid) return;
  if (!loginSchema.safeParse(event.values)) return;

  try {
    startLoad(ID);
    await $fetch("/api/login", { method: "POST", body: event.values });

    await refreshSession();
    await navigateTo("/");
  } catch (e: unknown) {
    if (
      isPrimitive(e, "object")
      && "data" in e
      && isPrimitive(e.data, "object")
      && "message" in e.data
    ) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: String(e.data.message),
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Error occured while trying to log in. Please try again",
        life: 3000,
      });
    }
  }
  endLoad(ID);
}
</script>
