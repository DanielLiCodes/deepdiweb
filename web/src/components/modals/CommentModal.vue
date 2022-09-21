<template>
  <div>
    <b-modal
      ref="commentModal"
      size="lg"
      title="Edit Comment"
      no-fade
      @ok="ok"
      @hidden="onHidden"
    >
      <div class="form-group">
        <label for="commentInput">Comment On Address 0x{{ toHex(address) }}</label>
        <input
          id="commentInput"
          ref="inputField"
          v-model="comment"
          type="text"
          class="form-control"
          placeholder="Comment ..."
          @keyup.enter="ok"
        >
        <!-- <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small> -->
      </div>
    </b-modal>
  </div>
</template>

<script>
import { bus, SHOW_COMMENT_MODAL, MODAL_HIDDEN } from '../../bus'

export default {
  name: 'CommentModal',
  data () {
    return {
      address: null,
      comment: null
    }
  },
  created () {
    const self = this
    bus.$on(SHOW_COMMENT_MODAL, function (event) {
      self.address = event.addr
      if (self.$store.getters.commentsByAddress[self.address]) {
        self.comment = self.$store.getters.commentsByAddress[self.address].comment
      } else {
        self.comment = ''
      }
      self.$refs.commentModal.show()
      setTimeout(() => {
        self.$refs.inputField.setSelectionRange(0, self.comment.length)
        self.$refs.inputField.focus()
      }, 1)
    })
  },
  methods: {
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
    onHidden () {
      bus.$emit(MODAL_HIDDEN)
    },
    async ok () {
      await this.$store.dispatch('addComment', { comment: this.comment, vma: this.address })
      this.$refs.commentModal.hide()
    }
  }
}
</script>

<style scoped></style>
