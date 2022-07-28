<template>
  <div>
    <div class="oda-sidebar-title">
      Functions
    </div>
    <div
    >
      <table
        id="strings-table"
        class="table table-striped sidebar-table table-condensed"
      >
        <thead>
          <tr>
            <th
              class="col-sm-4"
              style="width:1%"
            >
              Address
            </th>
            <th
              class="col-sm-4"
              style="text-align: left; width:100%"
            >
              Function Name
            </th>
          </tr>
        </thead>
        <tbody
          class="scrollContent"
          style="position:absolute; inset: 6rem 0 0; overflow: scroll;"
        >
          <tr
            v-for="func in getFuncs"
          >
            <td
              class="str-vma"
              style="width:1%"
            >
              <span
                class="clickable"
                @click="setAddress(func)"
              >0x{{ func.vma.toString(16) }}</span>
            </td>
            <td
              class="string"
              style="text-align: left; width:100%"
            >
              {{ func.name }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { bus, NAVIGATE_TO_ADDRESS } from '../../bus'

export default {
  name: 'Functions',
  data () {
    return {
      allFuncs: null
    }
  },
  computed: {
    getFuncs: function () {
      console.log(this.$store.state.function_list)
      if (this.$store.state.function_list === undefined) {
        return []
      }
      const l = []
      for (const [key, value] of Object.entries(this.$store.state.function_list)) {
        l.push(value)
      }
      _(l).sortBy('vma')
      return l
    }
  },
  methods: {
    setAddress: function (func) {
      bus.$emit(NAVIGATE_TO_ADDRESS, { address: func.vma })
    }
  }
}
</script>

<style scoped>
  .clickable {
    color: #0088CC;
    text-decoration: none;
    cursor: pointer;
  }

  .clickable:hover {
    text-decoration: underline;
  }

  #strings-table {
    font-size: 0.85rem;
  }

  .table td {
    padding: 3px 8px;
  }
</style>
