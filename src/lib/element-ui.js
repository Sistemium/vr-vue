import Vue from 'vue';
import ElementUI from 'element-ui';
import lang from 'element-ui/lib/locale/lang/ru-RU';
import locale from 'element-ui/lib/locale';
import '@/theme/index.css';
import '@/styles/element-ui.scss';
// import 'element-ui/lib/theme-chalk/index.css';
// import 'element-ui/lib/theme-chalk/reset.css';

// import '@/styles/element-ui-config.scss';

locale.use(lang);
Vue.use(ElementUI);
