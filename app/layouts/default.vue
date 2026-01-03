<template>
    <Toolbar class="sticky top-0 rounded-none border-0 border-b-2">
        <template #start>
            <ButtonGroup>
                <SecondaryButton as="a" label="Home" href="/" text />
            </ButtonGroup>
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
        <template #end>
            <SecondaryButton as="a" label="Log In" href="/login" text />
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

const gamesMenu = ref();
const games = ref([
    { label: "Wow such empty" }
]);
const toolsMenu = ref();
const tools = ref([
    { label: "F/AGRC", href: "/tools/fagrc" }
]);
</script>