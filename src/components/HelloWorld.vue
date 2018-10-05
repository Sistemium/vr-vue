<template lang="pug">

.hello
  h1 {{ msg }}
  p The project it just initialized and no functionality is implemented yet

</template>
<script>

import log from 'sistemium-telegram/services/log';

const name = 'HelloWorld';
const { debug } = log(name);

debug('imported');

export default {
  name,
  props: {
    msg: String,
  },
};

</script>
<style scoped lang="scss">

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

</style>
