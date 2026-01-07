<template>
  <div class="w-1/2 max-w-xl min-w-xs flex flex-col justify-center">
    <h2 class="text-xl font-semibold text-center pb-6">Register</h2>
    <Form v-slot="$form" :initial-values="userData" :resolver="zodResolver(newUserSchema)" @submit="register"
      class="flex flex-col justify-center gap-4">
      <div class="flex flex-col">
        <label for="name">Username <span class="text-danger">*</span></label>
        <InputText id="name" name="name" required fluid />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.name.error.message }}
        </Message>
      </div>
      <div class="flex flex-col">
        <label for="e-mail">E-Mail <span class="text-danger">*</span></label>
        <InputText id="e-mail" name="email" type="e-mail" required fluid />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email.error.message }}
        </Message>
      </div>
      <div class="flex flex-col">
        <label for="password">Password <span class="text-danger">*</span></label>
        <Password id="password" name="password" toggle-mask required fluid>
          <template #maskicon="{ toggleCallback }">
            <i :class="MASK_ICON_CLASSES" @click="all(toggleCallback, togglePasswordMasked)">
            </i>
          </template>
          <template #unmaskicon="{ toggleCallback }">
            <i :class="UNMASK_ICON_CLASSES" @click="all(toggleCallback, togglePasswordMasked)">
            </i>
          </template>
          <template #content>
            Password must have
          </template>
          <template #footer>
            <Divider />
            <ul class="pl-2 my-0 leading-normal flex flex-col gap-0.5">
              <template v-for="check in passwordChecks">
                <li v-if="$form.password?.value && !hasRelevantError($form.password?.errors, check.code)"
                  class="text-success flex flex-row items-center">
                  <i class="pi pi-check"></i>
                  <span class="pl-2">{{ check.message }}</span>
                </li>
                <li v-else class="text-danger flex flex-row items-center">
                  <i class="pi pi-times"></i>
                  <span class="pl-2">{{ check.message }}</span>
                </li>
              </template>
            </ul>
          </template>
        </Password>
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          {{ $form.password.error.message }}
        </Message>
      </div>
      <div class="flex flex-col">
        <label for="confirmPassword">Confirm Password <span class="text-danger">*</span></label>
        <Password id="confirmPassword" name="confirmPassword" :feedback="false"
          :invalid="confirmPasswordValid($form.confirmPassword, $form.password)" fluid
          :pt:root="ptTogglePasswordMasked" />
        <Message v-if="$form.confirmPassword?.value !== $form.password?.value" severity="error" size="small"
          variant="simple">
          Passwords do not match
        </Message>
        <Message v-else-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple">
          {{ $form.confirmPassword.error.message }}
        </Message>
      </div>
      <Button type="submit" :disabled="!$form.valid || $form.email?.pristine" label="Register" />
    </Form>
  </div>
</template>

<script lang="ts" setup>
import InputText from "~/components/volt/InputText.vue";
import Password from "~/components/volt/Password.vue";
import Button from "~/components/volt/Button.vue";
import Message from "~/components/volt/Message.vue";
import { Form, type FormFieldState, type FormSlots, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { $ZodIssue } from "zod/v4/core";
import Divider from "~/components/volt/Divider.vue";
import type { PasswordPassThroughMethodOptions } from "primevue";

const MASK_ICON_CLASSES = "pi pi-eye end-3 text-surface-500 dark:text-surface-400 absolute top-1/2 -mt-2 w-4 h-4";
const UNMASK_ICON_CLASSES = "pi pi-eye-slash end-3 text-surface-500 dark:text-surface-400 absolute top-1/2 -mt-2 w-4 h-4";

const [isPasswordMasked, togglePasswordMasked] = useToggle(true);

const ptTogglePasswordMasked = computed(() => {
  const isPasswordUnmasked = !isPasswordMasked.value;
  return (options: PasswordPassThroughMethodOptions) => {
    options.state.unmasked = isPasswordUnmasked;
    return {};
  }
})

const userData = ref<NewUser>({
  email: "",
  name: "",
  password: "",
  confirmPassword: ""
});

const passwordChecks = [
  { code: "l", message: "At least one lowercase character" },
  { code: "u", message: "At least one uppercase character" },
  { code: "n", message: "At least one numeric character" },
  { code: "s", message: "At least one special character" },
  { code: ["too_small", "too_big"], message: "Between 16 and 256 characters" },
];

const hasRelevantError = (errors: $ZodIssue[] | undefined, codes: string | string[]): boolean =>
  [codes].flat()
    .some(code => !!errors?.some(it => it.code === code || (it.code === "custom" && (!!it.params && !!it.params[code]))));

const confirmPasswordValid = (confirmPasswordState: FormFieldState | undefined, passwordState: FormFieldState | undefined) =>
  confirmPasswordState?.invalid || (!(confirmPasswordState?.pristine && passwordState?.pristine) && (confirmPasswordState?.value !== passwordState?.value));

async function register(event: FormSubmitEvent) {
  if (!event.valid) return;
  try {
    await $fetch("/api/register", {
      method: "POST",
      body: event.values
    });
  } catch (e: unknown) {
    console.log(e);
  }
}
</script>

<style></style>