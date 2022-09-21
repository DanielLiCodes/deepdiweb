<template>
  <div class="status-bar">
    [normal] ONLINE DISASSEMBLER 4EVER!
    <div style="position:absolute; right: 10px; top:2px;">
      | {{ projectName }} : {{ binary.options.architecture }} ({{ prettyBytes(binary.size) }})
      | 0x{{ toHex(selectedAddress) }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  data () {
    return {
    }
  },
  computed: {
    toHex (value) {
      if (value !== 0 && !value) return ''
      const stringValue = value.toString(16)
      let s = '000000000' + stringValue
      let bytes = 8
      if (stringValue.length > 8) {
        s = '000000000000000000' + stringValue
        bytes = 16
      }

      return s.substr(s.length - bytes)
    },
    prettyBytes (num) {
      // jacked from: https://github.com/sindresorhus/pretty-bytes
      if (typeof num !== 'number' || isNaN(num)) {
        throw new TypeError('Expected a number')
      }

      var exponent;
      var unit;
      var neg = num < 0;
      var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

      if (neg) {
        num = -num;
      }

      if (num < 1) {
        return (neg ? '-' : '') + num + ' B';
      }

      exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
      num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
      unit = units[exponent];

      return (neg ? '-' : '') + num + ' ' + unit;
    },

    projectName: function () {
      return this.$store.state.projectName
    },
    binary: function () {
      return this.$store.state.binary
    },
    selectedAddress: function () {
      return this.$store.getters.selectedAddress
    }
  }
}
</script>

<style scoped>
  .status-bar {
    padding-top:2px;
    padding-left: 4px;
    position: absolute;
    bottom: 0px;
    height: 20px;
    left: 0px;
    right: 0px;
    background-color: rgb(245, 245, 245);
    color: gray;
    font-size: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  }
</style>
