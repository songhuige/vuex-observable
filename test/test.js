import Vue from 'vue'
import Vuex from 'vuex'
import { observableAction } from '../src'
import { delay } from 'rxjs/operators'

Vue.use(Vuex)

describe('vuex-observable', () => {
  it('should work', done => {
    const store = new Vuex.Store({
      state: {
        pinging: false
      },
      mutations: {
        ping: state => state.pinging = true,
        pong: state => state.pinging = false
      },
      actions: {
        ping: observableAction((action$, { commit }) => {
          action$.subscribe((payload) => commit('ping', payload))
        }),
        pong: observableAction((action$, { commit }) => {
          action$.subscribe((payload) => commit('pong', payload))
        }),
        pingDelay: observableAction((action$, { commit }) => {
          action$.pipe(delay(100)).subscribe((payload) => commit('ping', payload))
        }),
        pongDelay: observableAction((action$, { commit }) => {
          const delaySource = action$.pipe(delay(200));
          delaySource.subscribe((payload) => commit('pong', payload));
        }),
      }
    })

    let actionPayload = null;

    store.subscribeAction(({ payload }) => actionPayload = payload)

    let mutationPayload = null;
    store.subscribe(({ payload }) => mutationPayload = payload)

    expect(store.state.pinging).toBe(false);
    store.dispatch('ping', 'foo');
    expect(store.state.pinging).toBe(true);
    expect(actionPayload).toBe('foo');
    expect(mutationPayload).toBe('foo');

    store.dispatch('pong', 'bar');
    expect(store.state.pinging).toBe(false);
    expect(actionPayload).toBe('bar');
    expect(mutationPayload).toBe('bar');

    store.dispatch('pingDelay', 'baz');
    expect(actionPayload).toBe('baz');
    setTimeout(() => {
      expect(store.state.pinging).toBe(true);
      expect(mutationPayload).toBe('baz');
    }, 100)

    store.dispatch('pongDelay', 'qux')
    expect(actionPayload).toBe('qux');
    setTimeout(() => {
      expect(store.state.pinging).toBe(false);
      expect(mutationPayload).toBe('qux');
      done()
    }, 200)

  })
})
