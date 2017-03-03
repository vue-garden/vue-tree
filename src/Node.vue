<template>
<div class="node" :class="cls" :id="id" :data-pid="pId">
  <div class="header" @click.self="autoExpand" :style="{'padding-left': (topLevelIndent + data.level * indent) + 'px'}">
    <label :class="{checked: isChecked}"><input type="checkbox" :value="data.idx" :checked="isChecked" v-on:change="checkboxChanged" @click="checkboxClicked"></label>
    <div @click="autoExpand">
      <i v-show="expandable"></i>
      <span v-if="!useCustomHtmlLabel">{{ label }}</span>
      <span v-if="useCustomHtmlLabel" v-html="customHtmlLabel(label)"></span>
    </div>
  </div>
  <transition v-on:before-enter="beforeEnter" v-on:enter="enter" v-on:after-enter="afterEnter" v-on:before-leave="beforeLeave" v-on:leave="leave">
    <div class="body" v-show="isBodyVisible">
      <hsy-tree-node v-for="c in data.children" :loader="loader" :customLabel="customLabel" :customHtmlLabel="customHtmlLabel" :topLevelIndent="topLevelIndent" :data="c" :pId="id" :indent="indent" :cbExpanded="cbExpanded" :cbAbbred="cbAbbred" :cbCheckboxClicked="cbCheckboxClicked"
        :cbChanged="cbChanged"></hsy-tree-node>
    </div>
  </transition>
</div>
</template>

<script>
const TRANS_EVENTS = ['webkitTransitionEnd', 'mozTransitionEnd', 'oTransitionEnd', 'transitionend']

let id = 0

const EMPTY_FN = () => {}

const fireChange = (() => {
  if ('createEvent' in document) {
    return (element) => {
      var evt = document.createEvent('HTMLEvents')
      evt.initEvent('change', false, true)
      element.dispatchEvent(evt)
    }
  } else
    return (element) => {
      element.fireEvent('onchange')
    }
})()

export default {
  name: 'hsy-tree-node',

  EMPTY_FN,

  data() {
    return {
      isChecked: !!this.data.isChecked,
      id: 'hsy-tree-node-' + (++id),
      loading: false,
      isBodyVisible: this.data.children.length > 0 || this.loader !== EMPTY_FN
    }
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    },
    pId: {
      type: [String, Number],
      default: ''
    },
    topLevelIndent: {
      type: Number,
      default: 0
    },
    indent: {
      type: Number,
      default: 0
    },
    cbCheckboxClicked: {
      type: Function,
      default: () => {}
    },
    loader: {
      type: Function,
      default: EMPTY_FN
    },
    cbExpanded: {
      type: Function,
      default: EMPTY_FN
    },
    cbAbbred: {
      type: Function,
      default: EMPTY_FN
    },
    cbChanged: {
      type: Function,
      default: EMPTY_FN
    },
    customLabel: {
      type: Function,
      default: EMPTY_FN
    },
    customHtmlLabel: {
      type: Function,
      default: EMPTY_FN
    }
  },
  computed: {
    expandable: {
      cache: false,
      get() {
        return this.data.children.length > 0 || this.loader !== EMPTY_FN
      }
    },
    cls() {
      let cls = {
        expanded: this.isBodyVisible,
        loading: this.loading
      }
      cls[`level-${this.data.level}`] = true
      return cls
    },
    label() {
      if (this.customLabel !== EMPTY_FN) {
        return this.customLabel(this.data)
      }
      return this.data.label
    },
    useCustomHtmlLabel() {
      return this.customHtmlLabel !== EMPTY_FN
    }
  },
  methods: {
    checkboxChanged(evt) {
      this.isChecked = evt.target.checked
    },
    checkboxClicked(evt) {
      this.data.isChecked = evt.target.checked

      let inputs = this.$el.querySelectorAll('.body input[type=checkbox]')
      inputs.forEach((ipt) => {
        ipt.checked = evt.target.checked
        fireChange(ipt)
      })

      let pId = this.$el.getAttribute('data-pid')
      while (pId !== '') {
        let children = document.querySelectorAll(`#${pId} > .body input[type=checkbox]`)
        let selected = document.querySelectorAll(`#${pId} > .body input[type=checkbox]:checked`)
        let ipt = document.querySelector(`#${pId} > .header input[type=checkbox]`)
        ipt.checked = children.length === selected.length
        fireChange(ipt)
        let parent = document.getElementById(pId)
        pId = parent.getAttribute('data-pid')
      }

      if (this.cbChanged !== EMPTY_FN) {
        let nodes = document.querySelectorAll('.hsy-tree input[type=checkbox]:checked')
        nodes = Array.prototype.slice.call(nodes)
        this.cbChanged(nodes.map((node) => {
          return parseInt(node.value)
        }))
      }

      this.cbCheckboxClicked(this, evt)
    },
    rect(el) {
      let style = window.getComputedStyle(el)
      let display = style.getPropertyValue('display')
      let top = style.getPropertyValue('top')
      let left = style.getPropertyValue('left')
      let height = style.getPropertyValue('height')
      el.style.height = 'auto'
      el.style.top = '-1000px'
      el.style.left = '-1000px'
      el.style.display = 'inline-block'
      let rect = el.getBoundingClientRect()
      el.style.display = display
      el.style.top = top
      el.style.left = left
      el.style.height = height
      return rect
    },
    trans(el) {
      return new Promise((resolve) => {
        TRANS_EVENTS.forEach((e) => {
          el.addEventListener(e, () => {
            resolve()
          })
        })
      })
    },
    beforeEnter(el) {
      let rect = this.rect(el)
      el._height = rect.height
      el.style.height = '0px'
    },
    enter(el, done) {
      if (el._height === 0) {
        this.$nextTick(() => {
          this.cbExpanded !== Node.EMPTY_FN && this.cbExpanded()
        })
      }
      this.trans(el).then(() => {
        done()
        this.$nextTick(() => {
          this.cbExpanded !== Node.EMPTY_FN && this.cbExpanded()
        })
      })
      setTimeout(() => {
        el.style.height = el._height + 'px'
      }, 10)
    },
    afterEnter(el) {
      el.style.height = 'auto'
    },
    beforeLeave(el) {
      let rect = this.rect(el)
      el._height = rect.height
      el.style.height = el._height + 'px'
    },
    leave(el, done) {
      let style = window.getComputedStyle(el)
      let height = style.getPropertyValue('height')
      if (parseInt(height) === 0) {
        this.$nextTick(() => {
          this.cbAbbred !== Node.EMPTY_FN && this.cbAbbred()
        })
      }
      this.trans(el).then(() => {
        done()
        this.$nextTick(() => {
          this.cbAbbred !== Node.EMPTY_FN && this.cbAbbred()
        })
      })
      setTimeout(() => {
        el.style.height = '0px'
      }, 10)
    },
    autoExpand() {
      let visible = this.isBodyVisible
      if (!visible && this.data.children.length === 0 && this.loader && this.loader !== EMPTY_FN) {
        this.loading = true
        new Promise((resolve) => {
          this.loader(this, (data) => {
            this.data.children = data.map((d) => {
              d.level = this.data.level + 1
              d.idx = ++id
              return d
            })
            resolve()
          })
        }).then(() => {
          this.isBodyVisible = true
          this.loading = false
        })
        return
      }
      this.isBodyVisible = !visible
    }
  }
}
</script>

<style>

</style>
