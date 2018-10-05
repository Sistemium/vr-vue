<template lang="pug">

.catalogue

  el-table(
  :data="tableData"
  style="width: 100%"
  height="450"
  )
    el-table-column(
    prop="parent"
    label="Группа"
    width="150"
    )
    el-table-column(
    prop="article"
    label="Атрикул"
    width="150"
    )
    el-table-column(
    prop="name"
    label="Наименование"
    )

  el-pagination#paginator(
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
  :current-page.sync="currentPage"
  :page-sizes="[20, 50, 100, 500]"
  :page-size="pageSize"
  layout="total, sizes, prev, pager, next"
  :total="frames.length"
  )

</template>
<script>

import log from 'sistemium-telegram/services/log';
import Frames from '@/models/Frames';

const name = 'Catalogue';
const { debug, error } = log(name);

export default {

  name,

  data() {
    return {
      frames: [],
      currentPage: 1,
      pageSize: 20,
    };
  },

  computed: {
    tableData() {
      const { frames, pageSize, currentPage } = this;
      const start = (currentPage - 1) * pageSize;
      return frames.slice(start, start + pageSize);
    },
  },

  methods: {

    handleSizeChange(pageSize) {
      debug('handleSizeChange', pageSize, this.pageSize);
    },

    handleCurrentChange(page) {
      debug('handleCurrentChange', page, this.currentPage);
    },

  },

  async created() {
    try {
      const frames = await Frames.findAll();
      Frames.bindAll(this, {}, 'frames');
      debug(frames.length);
    } catch ({ message }) {
      error(message);
    }
  },
};

</script>
<style scoped lang="scss">

@import "../styles/variables";

#paginator {
  margin-top: $margin-top * 2;
}

</style>
