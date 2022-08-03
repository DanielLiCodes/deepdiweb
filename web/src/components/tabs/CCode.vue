<template>
    <div ref = "codeBlock">
        <code-highlight language="c">
            <!-- <pre :class="languageClass"><code><slot /></code></pre> -->
            <pre>{{(cCode == undefined || cCode == '' ) ? dataToDisplay:cCode}}</pre>
        </code-highlight>
    </div>
</template>
<script> 
import CodeHighlight from "vue-code-highlight/src/CodeHighlight.vue";
import "vue-code-highlight/themes/prism-solarizedlight.css";
import { mapState } from 'vuex'
import Prism from 'prismjs'
import 'prismjs/components/prism-c'
export default {
  data: function(){
    return {dataToDisplay:"//C Code from retdec here!\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", shortname:""}
  },
  name: 'CCode',
  components:{
      CodeHighlight
  },
  computed: mapState(['cCode']),
  mounted () {
    Prism.highlightAllUnder(this.$refs.codeBlock)
  },
  beforeUpdate () {
    this.$el.querySelector('code').textContent = this.$store.state.cCode.replace(/^[\r\n\s]*|[\r\n\s]*$/g, '')
    Prism.highlightAllUnder(this.$refs.codeBlock)
  },
  methods: {
  }

}
</script>
<style>
    text {
        font-weight: 300;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serf;
        font-size: 14px;
    }
</style>