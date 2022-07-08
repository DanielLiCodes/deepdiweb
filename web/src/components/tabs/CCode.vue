<template>
    <code-highlight language="cpp">
            using namespace std;

            int main(){
                int n;
                cin >> n;
                while(n--){
                    int days, hours, minutesWorked;
                    cin >> days >> hours;
                    hours*=60;
                    minutesWorked=0;
                    while(days--){
                        int startMinutes, endMinutes;
                        int temp;
                        char zzz;
                        cin >> startMinutes;
                        startMinutes*=60;
                        cin >> zzz >> temp;
                        startMinutes+=temp;
                        cin >> endMinutes;
                        endMinutes*=60;
                        cin >> zzz >> temp;
                        endMinutes+=temp;
                        minutesWorked+=(endMinutes-startMinutes);
                    }
                    if(minutesWorked >= hours){
                        cout << "YES" << endl;
                    }else{
                        cout << "NO" << endl;
                    }
                    
                }
            }
    </code-highlight>

</template>
<script> 
import CodeHighlight from "vue-code-highlight/src/CodeHighlight.vue";
import "vue-code-highlight/themes/duotone-sea.css";

export default {
  name: 'CCode',
  components:{
      CodeHighlight
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