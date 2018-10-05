<template lang="pug">

.home
  img(alt="VR logo" src="../assets/logo.png")
  hello-world(msg="Добро пожаловать на ВсеРамки.рф")

</template>

<script>

import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'home',
  components: {
    HelloWorld,
  },
};

</script>
