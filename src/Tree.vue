<template>
<div class="hsy-tree" :id="id">
  <node v-for="c in mutableData" :data="c" :loader="loader" :customLabel="customLabel" :customHtmlLabel="customHtmlLabel" :topLevelIndent="topLevelIndent" :indent="indent" :cbExpanded="expanded" :cbAbbred="abbred" :cbChanged="changed"></node>
</div>
</template>

<script>
import Node from './Node'

let id = 0;

export default {
  name: 'Tree',

  data() {
    return {
      checked: [],
      mutableData: [],
      id: 'hsy-tree-' + (++id)
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    topLevelIndent: {
      type: Number,
      default: 0
    },
    indent: {
      type: Number,
      default: 20
    },
    keyMap: {
      type: Object,
      default: () => {
        return {
          label: 'label',
          children: 'children'
        }
      }
    },
    isCheckable: {
      type: Boolean,
      default: false
    },
    loader: {
      type: Function,
      default: Node.EMPTY_FN
    },
    cbNodeClicked: {
      type: Function,
      default: Node.EMPTY_FN
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    prepareEvenOddClass: {
      type: Boolean,
      default: true
    },
    cbCheckboxClicked: {
      type: Function,
      default: Node.EMPTY_FN
    },
    cbExpanded: {
      type: Function,
      default: Node.EMPTY_FN
    },
    cbAbbred: {
      type: Function,
      default: Node.EMPTY_FN
    },
    cbChanged: {
      type: Function,
      default: Node.EMPTY_FN
    },
    customLabel: {
      type: Function,
      default: Node.EMPTY_FN
    },
    customHtmlLabel: {
      type: Function,
      default: Node.EMPTY_FN
    }
  },
  watch: {
    data: {
      immediate: true,
      handler(val) {
        this.mutableData = this.preparedData(val)
      }
    }
  },
  methods: {
    preparedData(data) {
      let i = 1
      let idx = 0
      let ret = data.map((item) => {
        let r = Object.assign({}, item)
        r.label = item[this.keyMap['label']]
        r.children = item[this.keyMap['children']]
        return r
      })
      let walk = (items, level = 0, idx = 0) => {
        items.forEach((item) => {
          idx++
          item.idx = idx
          item.level = level
          idx = walk(item.children, level + 1, idx)
        })

        return idx
      }
      if (this.prepareEvenOddClass) {
        walk(ret)
      }
      return ret
    },
    walk(nodes, cb) {
      if (!nodes || typeof nodes.every !== 'function') return
      nodes.every((node) => {
        if (false === cb(node)) {
          return false
        }
        this.walk(node.children, cb)
        return true
      })
    },
    updateEvenOddClass() {
      let level0 = document.querySelectorAll(`#${this.id} > .node`)
      level0 = Array.prototype.slice.call(level0)

      let op = (node) => {
        let id = node.id
        let body = document.querySelector(`#${id} > .body`)
        let style = window.getComputedStyle(body)
        nodes.push(node)
        if (style.getPropertyValue('display') !== 'none') {
          let children = document.querySelectorAll(`#${id} > .body > .node`)
          children = Array.prototype.slice.call(children)
          if (children.length) {
            this.walk(children, op)
          }
        }
        return true
      }

      let nodes = []
      this.walk(level0, op)

      let i = 1
      nodes.forEach((node) => {
        let cls = i % 2 === 0 ? 'even' : 'odd'
        let clss = node.className.split(' ')
        clss = clss.filter((cls) => {
          return cls !== 'even' && cls !== 'odd'
        })
        clss.push(cls)
        node.className = clss.join(' ')
        i++
      })
    },
    expanded() {
      if (this.prepareEvenOddClass) {
        this.updateEvenOddClass()
        this.cbExpanded !== Node.EMPTY_FN && this.cbExpanded()
      }
    },
    abbred() {
      if (this.prepareEvenOddClass) {
        this.updateEvenOddClass()
        this.cbAbbred !== Node.EMPTY_FN && this.cbAbbred()
      }
    },
    changed(checked) {
      if (this.cbChanged !== Node.EMPTY_FN) {
        let ret = []
        checked.forEach((idx) => {
          this.walk(this.mutableData, (d) => {
            if (d.idx === idx) {
              ret.push(d)
              if (ret.length === checked.length) {
                return false
              }
            }
          })
        })
        this.cbChanged(ret)
      }
    }
  },
  updated() {
    this.updateEvenOddClass()
  },
  mounted() {
    this.updateEvenOddClass()
  },
  components: {
    node: Node
  }
}
</script>

<style>
.hsy-tree {
  font: 10px "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif;
}

.hsy-tree>.node {
  font-size: 1.2em;
  cursor: pointer;
}

.hsy-tree .node .header {
  height: 28px;
  line-height: 28px;
  transition: all .35s ease-in-out;
}

.hsy-tree .node .header>div {
  display: inline-block;
}

.hsy-tree .node>.header i {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: url('assets/arrow-up.svg') no-repeat center;
  vertical-align: middle;
}

.hsy-tree .node>.header span {
  vertical-align: middle;
}

.hsy-tree .node>.header i {
  transition: all .35s ease-in-out;
}

.hsy-tree .node.expanded>.header i {
  transform: rotate(180deg);
}

.hsy-tree .node.even>.header {
  background-color: #F3F5F9;
}

.hsy-tree .node.odd>.header {
  background-color: #fff;
}

.hsy-tree .node .header input[type=checkbox] {
  display: none;
}

.hsy-tree .node .header>label {
  display: inline-block;
  background: url('assets/chk.svg') no-repeat;
  width: 14px;
  height: 14px;
  vertical-align: middle;
  margin: 0;
  cursor: pointer;
}

.hsy-tree .node .header>label.checked {
  background: url('assets/chked.svg') no-repeat;
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hsy-tree .node.loading>.header>div:after {
  content: "";
  display: inline-block;
  width: 14px;
  height: 14px;
  background: url('assets/loading.png') no-repeat;
  background-size: contain;
  vertical-align: middle;
  margin-left: 5px;
  animation: loading 1s ease-in-out infinite;
}

.hsy-tree .node .body {
  overflow: hidden;
  transition: all .35s ease-in-out;
}
</style>
