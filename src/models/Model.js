/* eslint-disable no-param-reassign */
import Vue from 'vue';
import isFunction from 'lodash/isFunction';
import store from 'sistemium-telegram/jsdata/store';
import log from 'sistemium-telegram/services/log';
import { serverDateTimeFormat } from 'sistemium-telegram/services/moments';

const { debug } = log('model');

export default class Model {

  constructor(config) {

    const { name, methods = {} } = config;

    methods.refreshData = refreshData;

    config.methods = { ...methods };

    this.savingIds = {};
    this.name = name;
    this.store = store;
    this.mapper = store.defineMapper(name, {
      notify: false,
      ...config,
      safeInject: data => this.safeInject(data),
      // TODO: find out how to get this working
      // afterLoadRelations(query, options, response) {
      //   debug('afterLoadRelations', query, options, response);
      // },
    });
    this.offs = {};

    function refreshData() {
      const { id } = this;
      return id ? store.find(name, id, { force: true }) : Promise.reject(Error('No id attribute'));
    }

  }

  create(params) {

    if (!params.deviceCts) {

      params.deviceCts = serverDateTimeFormat();

    }

    return this.store.create(this.name, params);
  }

  /**
   * Does pending save that helps subscription manager to resolve conflicts with server data
   * @param {Record} record
   * @param {Boolean} [immediate=false]
   * @returns {Promise<void>}
   */
  async safeSave(record, immediate = false) {

    try {
      const { id } = record;
      if (!immediate) {
        await new Promise((resolve, reject) => {
          const saving = this.savingIds[id];
          if (saving) {
            saving.reject('canceled');
            clearTimeout(saving.timeout);
          }
          this.savingIds[id] = {
            timeout: setTimeout(resolve, 700),
            reject,
          };
        });
      }
      delete this.savingIds[id];
      await record.save();
    } catch (e) {
      debug('safeSave:ignore', e);
    }

  }

  /**
   * Puts the data into the store if there's no safeSave() pending saves for the matching record
   * @param data
   */
  safeInject(data) {

    const saving = this.savingIds[data.id];

    if (!saving) {
      this.store.addToCache(this.name, data, {});
    } else {
      debug('safeInject:ignore', this.name, data.id);
    }

  }

  destroy({ id }) {
    return this.store.destroy(this.name, id);
  }

  get(id) {
    return this.store.get(this.name, id);
  }

  find(id, options) {
    const { name } = this;
    return this.store.find(name, id, options)
      .then(res => {
        debug('find:success', name, id);
        return res;
      })
      .catch(err => {
        debug('find:error', name, id, err.message || err);
        return Promise.reject(err);
      });
  }

  findAll(query, options) {
    const { name } = this;
    return this.store.findAll(name, query, options)
      .then(res => {
        debug('findAll:success', name, `(${res.length})`, query);
        return res;
      })
      .catch(err => {
        debug('findAll:error', name, query, err.message || err);
        return Promise.reject(err);
      });
  }

  /**
   * Does non-cached request with groupBy option
   * @param {Object} query
   * @param {Array} fields
   * @returns {*}
   */
  groupBy(query, fields) {

    const { name } = this;

    return new Promise((resolve, reject) => {

      const options = {
        force: true,
        groupBy: fields,
        usePendingFindAll: false,
        afterFindAllFn: (o, res) => {
          debug('groupBy:success', name, `(${res.length})`, query);
          resolve(res);
          this.store.emit('groupBy', name, query);
          return [];
        },
      };

      // fix for js-data bug
      const groupByParams = { _: true, ...query };

      this.store.findAll(name, groupByParams, options)
        .catch(err => {
          debug('groupBy:error', name, query, err.message || err);
          reject(err);
        });

    });

  }

  filter(query) {
    return Object.seal(this.store.filter(this.name, query));
  }

  remove(item) {
    return this.store.remove(this.name, item[this.mapper.idAttribute]);
  }

  mon(event, callback) {
    const listener = (name, data) => name === this.name && callback(name, data);
    this.store.on(event, listener);
    return () => this.store.off(event, listener);
  }

  bind(component) {

    const cid = componentId(component);

    const onDataChange = () => {
      // debug('bind:onDataChange', this.name, component.$vnode.tag);
      setTimeout(() => component.$forceUpdate());
    };

    this.offs[cid] = this.offs[cid] || {};
    const offs = this.offs[cid];

    if (offs[undefined]) {
      this.unbind(component, undefined);
    }

    offs.$$$ = [
      this.mon('groupBy', onDataChange),
      this.mon('add', onDataChange),
      this.mon('remove', onDataChange),
    ];

  }

  /**
   * Binds a components's property to the store record set by the specified filter
   * @param {Object} component
   * @param {Object} query
   * @param {string} property
   * @param {Function} [onChange]
   * @returns {*}
   */
  bindAll(component, query, property, onChange) {

    const cid = componentId(component);

    const onDataChange = () => {
      const res = this.filter(query);
      Vue.set(component, property, res);
      if (onChange) {
        onChange(res);
      }
      // debug('bind:onDataChange', this.name, component.$vnode.tag);
      setTimeout(() => component.$forceUpdate());
      return res;
    };

    this.offs[cid] = this.offs[cid] || {};
    const offs = this.offs[cid];

    if (offs[property]) {
      this.unbind(component, property);
    }

    offs[property] = [
      this.mon('add', onDataChange),
      this.mon('remove', onDataChange),
    ];

    return onDataChange();

  }

  /**
   * Binds a components's property to the store record
   * @param {Object} component
   * @param {(string|Function)} idOrFunction
   * @param {string} property
   * @param {Function} [onChange]
   * @returns {*}
   */
  bindOne(component, idOrFunction, property, onChange) {

    const fn = isFunction(idOrFunction) && idOrFunction;
    const id = !fn && idOrFunction;
    const cid = componentId(component);

    const getDataById = () => {
      const itemId = id || fn();
      // eslint-disable-next-line
      // console.info('getDataById', this.name, itemId);
      return itemId ? this.store.get(this.name, itemId) : null;
    };

    const onDataChange = () => {
      const data = getDataById();
      // eslint-disable-next-line
      // console.info('onDataChange', this.name, property, data);
      Vue.set(component, property, data);
      if (onChange) {
        onChange(data);
      }
      return data;
    };

    this.offs[cid] = this.offs[cid] || {};
    const offs = this.offs[cid];

    if (offs[property]) {
      this.unbind(component, property);
    }

    offs[property] = [
      this.mon('add', onDataChange),
      this.mon('remove', onDataChange),
    ];

    return onDataChange();

  }

  /**
   * Cleanup property bindings for the component
   * @param {Object} component
   * @param {String} property
   */

  unbind(component, property) {
    const cid = componentId(component);
    const offs = this.offs[cid];
    offs[property].forEach(off => off());
    delete offs[property];
  }

  /**
   * Removes all components's model bindings
   * @param {Object} component
   * @returns {*}
   */
  unbindAll(component) {

    const cid = componentId(component);

    if (!this.offs[cid]) {
      return;
    }

    Object.keys(this.offs[cid])
      .forEach(property => this.unbind(component, property));

    delete this.offs[cid];

  }

}

function componentId(component) {
  // TODO: refactor without private property usage
  // eslint-disable-next-line
  return component._uid;
}

