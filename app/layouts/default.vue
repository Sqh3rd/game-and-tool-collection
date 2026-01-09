<template>
  <div class="w-full h-full">
    <Toolbar
      class="sticky top-0 rounded-none border-0 border-b-2 h-20 w-full"
      pt:start:class="gap-2"
      pt:end:class="gap-2"
    >
      <template #start>
        <NuxtLink
          class="px-3"
          to="/"
        >
          <CustomIcon
            svg="main"
            class="w-10 h-10 fill-primary"
          />
        </NuxtLink>
        <ButtonGroup>
          <SecondaryButton
            label="Games"
            :icon="PrimeIcons.CHEVRON_DOWN"
            icon-pos="right"
            aria-haspopup="true"
            aria-controls="games_menu"
            text
            disabled
            @click="gamesMenu?.toggle"
          />
          <Menu
            id="games_menu"
            ref="gamesMenu"
            :model="games"
            :popup="true"
          >
            <template #item="{ item, props }">
              <SecondaryButton
                as="a"
                :label="item.label"
                :href="props.href"
                text
              />
            </template>
          </Menu>
          <SecondaryButton
            label="Tools"
            :icon="PrimeIcons.CHEVRON_DOWN"
            icon-pos="right"
            aria-haspopup="true"
            aria-controls="tools_menu"
            text
            @click="toolsMenu?.toggle"
          />
          <Menu
            id="tools_menu"
            ref="toolsMenu"
            :model="tools"
            :popup="true"
          >
            <template #item="{ item }">
              <NuxtLink
                :class="TEXT_BUTTON_LOOK"
                class="inline-block w-full"
                :to="item.href"
                >{{ item.label }}
              </NuxtLink>
            </template>
          </Menu>
        </ButtonGroup>
      </template>
      <template
        v-if="!loggedIn"
        #end
      >
        <ToggleSwitch
          v-model="darkModeToggle"
          :pt:slider:class="THEME_TOGGLE_SWITCH_CLASSES.SLIDER"
          :pt:handle:class="THEME_TOGGLE_SWITCH_CLASSES.HANDLE"
        >
          <template #handle="{ checked }">
            <i
              :class="[
                'text-xs pi',
                { 'pi-moon': checked, 'pi-sun': !checked },
              ]"
            />
          </template>
        </ToggleSwitch>
        <NuxtLink
          :class="TEXT_BUTTON_LOOK"
          to="/login"
          >Log In</NuxtLink
        >
      </template>
      <template
        v-else
        #end
      >
        <ToggleSwitch
          v-model="darkModeToggle"
          :pt:slider:class="THEME_TOGGLE_SWITCH_CLASSES.SLIDER"
          :pt:handle:class="THEME_TOGGLE_SWITCH_CLASSES.HANDLE"
        >
          <template #handle="{ checked }">
            <i
              :class="[
                'text-xs pi',
                { 'pi-moon': checked, 'pi-sun': !checked },
              ]"
            />
          </template>
        </ToggleSwitch>
        <NuxtLink
          :class="TEXT_BUTTON_LOOK"
          to="/profile"
          >Profile</NuxtLink
        >
        <SecondaryButton
          label="Log out"
          text
          @click="logout"
        />
      </template>
    </Toolbar>
    <div class="w-full h-full p-5 flex justify-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import Menu from "~/components/volt/Menu.vue";
import Toolbar from "~/components/volt/Toolbar.vue";
import { PrimeIcons } from "@primevue/core";
import ButtonGroup from "~/components/volt/ButtonGroup.vue";
import SecondaryButton from "~/components/volt/SecondaryButton.vue";
import ToggleSwitch from "~/components/volt/ToggleSwitch.vue";
import CustomIcon from "~/components/global/CustomIcon.vue";

const TEXT_BUTTON_LOOK = `px-3 py-2 dark:text-surface-400 text-surface-500 dark:hover:bg-surface-800 hover:bg-surface-100 duration-200 rounded-md`;
const THEME_TOGGLE_SWITCH_CLASSES = {
  SLIDER: `dark:p-checked:bg-surface-700 dark:peer-enabled:peer-hover:p-checked:bg-surface-600 p-checked:bg-surface-300`,
  HANDLE: `dark:p-checked:bg-surface-400 dark:p-checked:text-surface-700 p-checked:bg-surface-0 p-checked:text-surface-900`,
};

const { loggedIn, clear: clearSession } = useUserSession();

const gamesMenu = ref();
const games = ref([{ label: "Wow such empty" }]);
const toolsMenu = ref();
const tools = ref([{ label: "F/AGRC", href: "/tools/fagrc" }]);

async function logout() {
  await clearSession();
  await navigateTo("/");
}

const colorMode = useColorMode();
const darkModeToggle = ref(colorMode.value === "dark");
watchEffect(() => (colorMode.value = darkModeToggle.value ? "dark" : "light"));
</script>
