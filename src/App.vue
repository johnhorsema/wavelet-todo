<template>
  <div id="app">
    <h2>Todo Dapp, written in JavaScript + Rust (WebAssembly)</h2>
    <p>Powered by <a href="https://wavelet.perlin.net">Wavelet</a>. Click <a href="https://medium.com/perlin-network/build-a-decentralized-chat-using-javascript-rust-webassembly-c775f8484b52">here</a> to learn how it works, and <a href="https://github.com/perlin-network/decentralized-chat">here</a> for the source code. Join our <a href="https://discord.gg/dMYfDPM">Discord</a> to get PERLs.</p>
    <input class="nes-input" placeholder="Add todo..." v-on:keyup.enter="addTodo"/>
    <div class="spacer"></div>
    <ol>
      <li v-for="(todo, idx) in todos">
        <label>
          <input type="checkbox"
            class="nes-checkbox"
            @click="toggleTodo(idx)"
            :checked="todo.done">

          <del v-if="todo.done">
            {{ todo.content }}
          </del>
          <span v-else>
            {{ todo.content }}
          </span>
          <button class="nes-btn is-error" v-on:click="removeTodo(idx)">&times;</button>
        </label>
      </li>
    </ol>
    <hr/>
    <h3>Logs</h3>
    <textarea readonly>{{ log.join("\n") }}</textarea>
  </div>
</template>

<script>
import Vue from 'vue';
import JSBI from "jsbi";
import {Wavelet,Contract} from "wavelet-client";
const BigInt = JSBI.BigInt;

export default {
  name: 'app',
  mounted() {
    this.init();
  },
  data() {
    return {
      wallet: null,
      contract: null,
      todos: [],
      log: []
    }
  },
  methods: {
    async init() {
      var self = this
      return await this.$contract.init().then(resp => {
        self.getTodos()
        self.listen()
      })
    },
    async listen() {
      var self = this
      await this.$client.pollConsensus({
        onRoundEnded: msg => {
          (async () => {
              await self.$contract.fetchAndPopulateMemoryPages();
                self.getTodos();
          })();
        }
      });
    },
    getTodos() {
      var raw = this.$contract.test('get_todos', BigInt(0));
      this.todos = raw.logs[0].split('\n').reverse().map((a, aidx) => {
        var matched = a.split(' ');
        return {
          id: aidx,
          content: matched[0].replace(/[\<\>]/g, ''),
          done: eval(matched[1])
        }
      });
    },
    async addTodo({target}) {
      var self = this
      return await this.$contract.call(
        this.$wallet, 
        'add_todo', 
        BigInt(0), 
        BigInt(250000),
        {type: "string", value: target.value},
      ).then(resp => {
        target.value = '';
        self.log.push(resp.tx_id);
      })
    },
    async removeTodo(id) {
      var self = this
      return await this.$contract.call(
        this.$wallet, 
        'remove_todo', 
        BigInt(0), 
        BigInt(250000),
        {type: "uint32", value: id},
      ).then(resp => {
        self.log.push(resp.tx_id);
      })
    },
    async toggleTodo(id) {
      var self = this
      return await this.$contract.call(
        this.$wallet, 
        'toggle_todo', 
        BigInt(0), 
        BigInt(250000),
        {type: "uint32", value: id},
      ).then(resp => {
        self.log.push(resp.tx_id);
      })
    }
  }
}
</script>

<style>
html, body, pre, code, kbd, samp {
  font-family: "Press Start 2P";
}

body {
  background: #20262E;
  padding: 20px;
}

#app {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  transition: all 0.2s;
  margin: 2rem;
  padding: 2rem;
}

ol {
  margin-left: 16px;
}

li {
  margin: 8px 0;
}

h2 {
  font-weight: bold;
  margin-bottom: 15px;
}

del {
  color: rgba(0, 0, 0, 0.3);
}

.nes-btn {
  padding: 0px 4px;
  margin: 0px;
}

.spacer {
  height: 1rem;
}

textarea {
  width: 100%;
  border: none;
  height: 200px;
}
</style>