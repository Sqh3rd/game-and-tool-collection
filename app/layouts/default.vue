<template>
    <Toolbar class="sticky top-0 rounded-none border-0 border-b-2">
        <template #start>
            <NuxtLink :class="TEXT_BUTTON_LOOK" to="/">Home</NuxtLink>
            <ButtonGroup>
                <SecondaryButton label="Games" :icon="PrimeIcons.CHEVRON_DOWN" icon-pos="right"
                    @click="gamesMenu?.toggle" aria-haspopup="true" aria-controls="games_menu" text disabled />
                <Menu ref="gamesMenu" id="games_menu" :model="games" :popup="true">
                    <template #item="{ item, props }">
                        <SecondaryButton as="a" :label="item.label" :href="props.href" text />
                    </template>
                </Menu>
                <SecondaryButton label="Tools" :icon="PrimeIcons.CHEVRON_DOWN" icon-pos="right"
                    @click="toolsMenu?.toggle" aria-haspopup="true" aria-controls="tools_menu" text />
                <Menu ref="toolsMenu" id="tools_menu" :model="tools" :popup="true">
                    <template #item="{ item, props }">
                        <SecondaryButton as="a" :label="item.label" :href="item.href" text />
                    </template>
                </Menu>
            </ButtonGroup>
        </template>
        <template #end v-if="!loggedIn">
            <ToggleSwitch v-model="themeToggle" />
            <NuxtLink :class="TEXT_BUTTON_LOOK" to="/login">Log In</NuxtLink>
        </template>
        <template #end v-else>
            <ToggleSwitch v-model="themeToggle" />
            <NuxtLink :class="TEXT_BUTTON_LOOK" to="/profile">Profile</NuxtLink>
            <SecondaryButton label="Log out" text @click="logout" />
        </template>
    </Toolbar>
    <slot />
</template>

<script setup lang="ts">
import Menu from '~/components/volt/Menu.vue';
import Toolbar from '~/components/volt/Toolbar.vue';
import { PrimeIcons } from '@primevue/core';
import ButtonGroup from '~/components/volt/ButtonGroup.vue';
import SecondaryButton from '~/components/volt/SecondaryButton.vue';
import ToggleSwitch from '~/components/volt/ToggleSwitch.vue';

const { loggedIn, clear: clearSession } = useUserSession()

const gamesMenu = ref();
const games = ref([
    { label: "Wow such empty" }
]);
const toolsMenu = ref();
const tools = ref([
    { label: "F/AGRC", href: "/tools/fagrc" }
]);

const themeToggle = ref(true);

async function logout() {
    await clearSession();
    await navigateTo("/");
}

const TEXT_BUTTON_LOOK = `px-3 py-2 dark:text-surface-400 text-surface-500 dark:hover:bg-surface-800 duration-200 rounded-md`;
</script>