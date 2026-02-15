<template>
  <div class="h-full w-full p-5 flex justify-center">
    <div class="w-1/2 max-w-xl min-w-xs flex flex-col justify-center">
      <h2 class="text-xl font-semibold text-center pb-6">Register</h2>
      <Form
        v-slot="$form"
        :initial-values="userData"
        :resolver="zodResolver(User.insertSchema)"
        class="flex flex-col justify-center gap-4"
        @submit="register"
      >
        <div class="flex flex-col">
          <label for="name">Username <span class="text-danger">*</span></label>
          <InputText
            id="name"
            name="name"
            required
            fluid
          />
          <Message
            v-if="$form.name?.invalid && $form.name.error"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.name.error.message }}
          </Message>
        </div>
        <div class="flex flex-col">
          <label for="e-mail">E-Mail <span class="text-danger">*</span></label>
          <InputText
            id="e-mail"
            name="email"
            type="e-mail"
            required
            fluid
          />
          <Message
            v-if="$form.email?.invalid && $form.email.error"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email.error.message }}
          </Message>
        </div>
        <div class="flex flex-col">
          <label for="password"
            >Password <span class="text-danger">*</span></label
          >
          <Password
            id="password"
            name="password"
            toggle-mask
            required
            fluid
          >
            <template #maskicon="{ toggleCallback }">
              <i
                :class="MASK_ICON_CLASSES"
                @click="all(toggleCallback, togglePasswordMasked)"
              />
            </template>
            <template #unmaskicon="{ toggleCallback }">
              <i
                :class="UNMASK_ICON_CLASSES"
                @click="all(toggleCallback, togglePasswordMasked)"
              />
            </template>
            <template #content> Password must have </template>
            <template #footer>
              <Divider />
              <ul class="pl-2 my-0 leading-normal flex flex-col gap-0.5">
                <template
                  v-for="check in passwordChecks"
                  :key="check.message"
                >
                  <li
                    v-if="
                      $form.password?.value
                      && !hasRelevantError($form.password?.errors, check.code)
                    "
                    class="text-success flex flex-row items-center"
                  >
                    <i class="pi pi-check" />
                    <span class="pl-2">{{ check.message }}</span>
                  </li>
                  <li
                    v-else
                    class="text-danger flex flex-row items-center"
                  >
                    <i class="pi pi-times" />
                    <span class="pl-2">{{ check.message }}</span>
                  </li>
                </template>
              </ul>
            </template>
          </Password>
          <Message
            v-if="$form.password?.invalid && $form.password.error"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.password.error.message }}
          </Message>
        </div>
        <div class="flex flex-col">
          <label for="confirmPassword"
            >Confirm Password <span class="text-danger">*</span></label
          >
          <Password
            id="confirmPassword"
            name="confirmPassword"
            :feedback="false"
            :invalid="
              confirmPasswordValid($form.confirmPassword, $form.password)
            "
            :pt:root="ptTogglePasswordMasked"
            fluid
            required
          />
          <Message
            v-if="$form.confirmPassword?.value !== $form.password?.value"
            severity="error"
            size="small"
            variant="simple"
          >
            Passwords do not match
          </Message>
          <Message
            v-else-if="
              $form.confirmPassword?.invalid && $form.confirmPassword.error
            "
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.confirmPassword.error.message }}
          </Message>
        </div>
        <Button
          type="submit"
          label="Register"
        />
      </Form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  Form,
  type FormFieldState,
  type FormSubmitEvent,
} from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { useToast, type PasswordPassThroughMethodOptions } from "primevue";
import type { $ZodIssue } from "zod/v4/core";
import Button from "~/components/volt/Button.vue";
import Divider from "~/components/volt/Divider.vue";
import InputText from "~/components/volt/InputText.vue";
import Message from "~/components/volt/Message.vue";
import Password from "~/components/volt/Password.vue";
import { serverErrorSchema, User } from "~~/shared/types/db";

const MASK_ICON_CLASSES =
  "pi pi-eye end-3 text-surface-500 dark:text-surface-400 absolute top-1/2 -mt-2 w-4 h-4";
const UNMASK_ICON_CLASSES =
  "pi pi-eye-slash end-3 text-surface-500 dark:text-surface-400 absolute top-1/2 -mt-2 w-4 h-4";

const ID = Symbol(this);

const { startLoad, endLoad } = useGlobalSpinnerStore();
const { fetch: refreshUserSession } = useUserSession();
const [isPasswordMasked, togglePasswordMasked] = useToggle(true);

const toast = useToast();

const ptTogglePasswordMasked = computed(() => {
  const isPasswordUnmasked = !isPasswordMasked.value;
  return (options: PasswordPassThroughMethodOptions) => {
    options.state.unmasked = isPasswordUnmasked;
    return {};
  };
});

const userData = ref<User.Insert>({
  email: "",
  name: "",
  password: "",
  confirmPassword: "",
});

const passwordChecks = [
  { code: "l", message: "At least one lowercase character" },
  { code: "u", message: "At least one uppercase character" },
  { code: "n", message: "At least one numeric character" },
  { code: "s", message: "At least one special character" },
  { code: ["too_small", "too_big"], message: "Between 16 and 256 characters" },
];

const hasRelevantError = (
  errors: $ZodIssue[] | undefined,
  codes: string | string[],
): boolean =>
  [codes]
    .flat()
    .some(
      (code) =>
        !!errors?.some
        && typeof errors.some === "function"
        && errors.some(
          (it) =>
            it.code === code
            || (it.code === "custom" && !!it.params && !!it.params[code]),
        ),
    );

const confirmPasswordValid = (
  confirmPasswordState: FormFieldState | undefined,
  passwordState: FormFieldState | undefined,
) =>
  confirmPasswordState?.invalid
  || (!(confirmPasswordState?.pristine && passwordState?.pristine)
    && confirmPasswordState?.value !== passwordState?.value);

async function register(event: FormSubmitEvent) {
  if (!event.valid) return;
  if (!User.insertSchema.safeParse(event.values)) return;
  startLoad(ID);
  try {
    await $fetch("/api/register", { method: "POST", body: event.values });

    await refreshUserSession();
    await navigateTo("/");
  } catch (e: unknown) {
    const serverError = serverErrorSchema.safeParse(e);
    if (serverError.success) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: String(serverError.data.message),
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

<style></style>
