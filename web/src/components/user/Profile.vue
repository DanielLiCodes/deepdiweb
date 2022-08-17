<template>
  <div class="container mt-4">
    <section class="jumbotron text-center">
      <div class="container">
        <h1 class="jumbotron-heading">
          <!-- <i class="fa fa-user-circle" /> {{ user.username }} -->
        </h1>
        <p>
          <!-- {{ user.email }} -->
          {{userEmail}}
        </p>
        <p class="lead text-muted">
          You can view and delete your uploaded documents, and manage permissions from your outstanding files
        </p>
      </div>
    </section>

    <table class="table">
      <thead class="thead-dark">
        <th>Id</th>
        <th>Project Name</th>
        <th>Created</th>
        <th>Default Permission Level</th>
        <th />
      </thead>
      <!-- <tr v-for="doc in odaMasters">
        <td>{{ doc.short_name }}</td>
        <td>
          <router-link :to="{ name: 'Disassembler', params: { shortName: doc.short_name }}">
            {{ doc.project_name }}
          </router-link>
        </td>
        <td>{{ doc.creation_date }}</td>
        <td>{{ doc.default_permission_level.name }}</td>
        <td style="text-align: right;">
          <button
            class="btn btn-danger"
            @click="deleteDocument(doc)"
          >
            <i class="fa fa-trash" />
          </button>
        </td>
      </tr> -->
    </table>
  </div>
</template>

<script>
import * as api from '../../api/oda'
export default {
  data () {
    return {
      userEmail: null,
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  async mounted () {
    console.log("in profile")
    try{
      const temp = await api.validate(localStorage.token)
      this.userEmail = temp.decoded.email
      console.log(temp)
    } catch (e) {
      this.$router.push('/login')
    }
    // if (!localStorage.token || !temp.decoded) {
    //   this.$router.push('/login')
    // }
    console.log(this.odaMasters)
  },
  methods: {
    async deleteDocument (doc) {
      await api.deleteDocument(doc.short_name)
      this.odaMasters = await api.listMyDocuments()
    }
  }
}
</script>
