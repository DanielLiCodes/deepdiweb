<template>
    <div>
    <input type="file" @change="previewFiles">
    <button v-on:click="disassembleRetdec(shortname)">Disassemble!</button>
    <code-highlight class = "code_holder" id = "code_holder" language="cpp">
        {{dataToDisplay}}
    </code-highlight>
    </div>
</template>
<script> 
import CodeHighlight from "vue-code-highlight/src/CodeHighlight.vue";
import "vue-code-highlight/themes/duotone-sea.css";
import { uploadFile, disassembleByRetdec } from '../../api/oda'

export default {
  data: function(){
    return {dataToDisplay:"C Code from retdec here!\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", shortname:""}
  },
  name: 'CCode',
  components:{
      CodeHighlight
  },
  methods: {
   previewFiles(event) {
    uploadFile({filedata:event.target.files[0], projectName:event.target.files[0].name}).then((result)=>{
        this.shortname = result;
        return result
    });
   },
   disassembleRetdec (short) {
    var x = disassembleByRetdec(short);
    x.then((result)=>{
        this.dataToDisplay = result;
        return result
    });
   },
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