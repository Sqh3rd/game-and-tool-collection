<template>
    <div class="w-full h-full flex justify-center p-5">
        <div class="w-1/2 flex flex-col justify-center content-center">
            <h2 class="text-xl font-semibold text-center pb-2">Log In</h2>
            <form @submit.prevent="login" class="flex flex-col justify-center gap-4">
                <div class="flex flex-col">
                    <label for="e-mail">E-Mail</label>
                    <InputText id="e-mail" v-model="credentials.email" type="e-mail" fluid />
                </div>
                <div class="flex flex-col">
                    <label for="password">Password</label>
                    <Password id="password" v-model="credentials.password" :feedback="false" toggle-mask fluid />
                </div>
                <Button type="submit">Log In</Button>
                <span>Don't have an account yet? Then <NuxtLink class="text-primary" to="/register">register now
                    </NuxtLink></span>
            </form>
        </div>
    </div>
</template>

<script setup>
import Button from "~/components/volt/Button.vue";
import InputText from "~/components/volt/InputText.vue";
import Password from "~/components/volt/Password.vue";
const { fetch: refreshSession } = useUserSession();
const credentials = reactive({
    email: "",
    password: "",
});

async function login() {
    try {
        await $fetch("/api/login", {
            method: "POST",
            body: credentials
        });

        await refreshSession();
        await navigateTo("/");
    } catch {
        alert("Bad credentials");
    }
}
</script>
