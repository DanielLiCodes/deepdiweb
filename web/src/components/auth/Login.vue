<template>
  <div class="container">
    <div class="form-horizontal mt-4">
      <div class="row">
        <div class="col-md-3" />
        <div class="col-md-6">
          <h2>Sign In To Disassembler</h2>
          <hr>
        </div>
      </div>
      <div
        v-if="password_error"
        class="row"
      >
        <div class="col-md-3" />
        <div class="col-md-6">
          <div
            class="alert alert-danger"
            role="alert"
          >
            {{ password_error }}
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3 field-label-responsive">
          <label for="name" />
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <div class="input-group mb-2 mr-sm-2 mb-sm-0">
              <div
                class="input-group-addon"
                style="width: 2.6rem"
              >
                <i class="fa fa-user" />
              </div>
              <input
                id="name"
                v-model="username"
                type="text"
                name="name"
                class="form-control"
                placeholder="Username/Email"
                required
                autofocus
              >
            </div>
          </div>
        </div>
        <div class="col-md-3" />
      </div>
      <div class="row">
        <div class="col-md-3" />
        <div class="col-md-6">
          <div class="form-group">
            <label
              class="sr-only"
              for="password"
            >Password</label>
            <div class="input-group mb-2 mr-sm-2 mb-sm-0">
              <div
                class="input-group-addon"
                style="width: 2.6rem"
              >
                <i class="fa fa-key" />
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                name="password"
                class="form-control"
                placeholder="Password"
                required
                @keyup.enter="login"
              >
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="form-control-feedback">
            <span class="text-danger align-middle" />
          </div>
        </div>
      </div>
      <!-- <div class="row">
        <div class="col-md-3"></div>
        <div class="col-md-6" style="padding-top: .35rem">
          <div class="form-check mb-2 mr-sm-2 mb-sm-0">
            <label class="form-check-label">
              <input class="form-check-input" name="remember"
                     type="checkbox">
              <span style="padding-bottom: .15rem">Remember me</span>
            </label>
          </div>
        </div>
      </div>  -->
      <div
        class="row"
        style="padding-top: 1rem"
      >
        <div class="col-md-3" />
        <div class="col-md-6">
          <button
            type="submit"
            class="btn btn-success"
            @click="login"
          >
            <i class="fa fa-sign-in" /> Login
          </button>
          <router-link to="PasswordReset">
            Forgot Your Password?
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import * as api from '../../api/oda'
import router from '../../router'

export default {
  data () {
    return {
      username: null,
      password: null,
      password_error: null
    }
  },
  async mounted() {
    try{
      if(!localStorage.token){
        return
      }
      await api.validate(localStorage.token);
      this.$router.push('/user/profile')
    } catch(e) {
      console.log(e)
    }
  },
  methods: {
    async login() {
      if(!this.username || !this.password) {
        this.password_error = 'Please fill in all fields'
        return
      }
      this.password_error = null
      const resp = await api.login(this.username, this.password)
      localStorage.token = resp;
      const userData = await api.validate(resp);
      router.push('/user/profile')
    }
    // async login() {
    //   const resp = await api.validate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRsaTEzN0B1Y3IuZWR1IiwiaWF0IjoxNjYwNzA5OTMzLCJleHAiOjE2NjA3MDk5Mzh9.5K0DkaTWZ1InMfo7DYVZmWXdQ7VOdQkJLCnC6b16gZU')
    //   console.log(resp)
    // }
    // login () {
    //   this.$store.dispatch('login', {
    //     username: this.username,
    //     password: this.password
    //   }).then(() => {
    //     this.$router.push('/')
    //   }).catch((e) => {
    //     this.password_error = _.get(e, 'response.data.non_field_errors[0]')
    //   })
    // }
  }
}
</script>
