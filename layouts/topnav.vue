<style scoped>
.topnav {
  height: 30%;
  min-height: 2rem;

  width: 100%;
  border-bottom: 2px solid;
  display: flex;

  .padding {
    flex-grow: 1;
  }

  .option-container {
    height: 100%;
    display: inline-flex;
    align-self: center;
    padding: 0.5rem 0;

    > a {
      color: var(--primary-color);
      text-decoration: none;
      border-right: 1px solid var(--accent-border-color);
      padding: 0 0.5rem;
      height: 100%;
    }

    :last-child {
      border-right: 0;
    }

    > a:hover {
      background-color: var(--accent-color);
    }
  }
}

.content-container {
  width: 100%;
}
</style>

<template>
  <div class="topnav">
    <div class="option-container">
      <a href="/home">Home</a>
      <a href="/take-me">Take me</a>
      <a href="/country-roads">Country Roads</a>
    </div>

    <div class="padding" />

    <div class="option-container">
      <a href="/log-in">Log in</a>
      <a href="/register">Register</a>
    </div>
  </div>
  <div class="content-container">
    <slot />
  </div>
</template>
