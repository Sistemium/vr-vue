<template lang="pug">

#app

  #nav
    router-link(to="/") Home
    router-link(to="/about") About

  router-view

</template>
<style lang="scss">

@import "styles/variables";

body {
  background: $gray-background;
}

#app {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $black;
}

#nav {

  > * + * {
    margin-left: $margin-right;
  }

  padding: 30px;

  a {

    font-weight: bold;
    color: $primary-color;

    &.router-link-exact-active {
      color: $dark-gray;
    }

  }

}

</style>
