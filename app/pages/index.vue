<template>
    <div style="height: 200vh">
        <span>Users: {{ userCount }}</span>
    </div>
</template>

<script setup lang="ts">
const userCount = await $fetch("/api/user/count", {
    method: "GET"
});
</script>
