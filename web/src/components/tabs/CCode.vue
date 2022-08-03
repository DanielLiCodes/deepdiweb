
<template>
    <div>
        <code-highlight language="c">
            {{cCode==undefined || cCode == '' ? dataToDisplay:cCode}}
        </code-highlight>
    </div>
</template>
<script> 
import CodeHighlight from "vue-code-highlight/src/CodeHighlight.vue";
import "vue-code-highlight/themes/duotone-sea.css";
import { mapState } from 'vuex'
// import Prism from 'prismjs'
import 'prismjs/components/prism-c'
export default {
  data: function(){
    return {dataToDisplay:"C Code from retdec here!\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", shortname:""}
  },
  name: 'CCode',
  components:{
      CodeHighlight
  },
  computed:mapState(['cCode']),
  mounted: {
  },
  methods: {
  }, 
//   props:{
      
//   },
//   data(){
//   },
//   mounted() {
//         //add code here
//   },
//   methods: {
    
//   }
}
</script>
<style>
    text {
        font-weight: 300;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serf;
        font-size: 14px;
    }
</style>