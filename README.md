# vue-tree

This is yet another vue tree component.

## Install

Use npm to download code:

```
npm install hsy-vue-tree -S
```

then import it into your project, add below code into your `main.js`:

```js
import Tree from 'hsy-vue-tree'

Vue.use(Tree)
```

## Usage

```html
<template>
  <tree :data="data" :loader="loader" :cbChanged="changed"></tree>
  <div class="result">
    Selected: {{ checked }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [{
        label: '江苏',
        children: [{
          label: '南京',
          children: []
        }]
      }, {
        label: '浙江',
        children: [{
          label: '杭州',
          children: [{
            label: '建邺区',
            isChecked: true,
            children: []
          }]
        }]
      }],
      checked: ''
    }
  },
  methods: {
    loader(node, resolve) {
      setTimeout(() => {
        if (node.data.label === '建邺区') {
          resolve([{
            label: '南湖街道',
            children: []
          }, {
            label: '奥体',
            children: []
          }])
        } else {
          resolve([])
        }
      }, 3000)
    },
    changed(checked) {
      this.checked = checked.map((c) => {
        return c.label
      }).join(', ')
    }
  }
}
</script>
```

## Props

Coming...

## Screenshot

<img src="http://og9g58alt.bkt.clouddn.com/tree.png" width="500">
