---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: "text-center"
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
---

# Web Components

## -johnny

---

# 什么是 Web Components

- Custom elements（自定义元素）：一组 JavaScript API，允许您定义 custom elements 及其行为，然后可以在您的用户界面中按照需要使用它们。

- Shadow DOM（影子 DOM）：一组 JavaScript API，用于将封装的“影子”DOM 树附加到元素（与主文档 DOM 分开呈现）并控制其关联的功能。通过这种方式，您可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。

- HTML templates（HTML 模板）： `<template>` 和 `<slot>` 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。

[example](https://github.com/github/time-elements)

---

# 定义一个 Web Components 组件

## template

```html {1,3,14}
<template id="jo-button">
  <style>
    :host button {
      height: 30px;
      padding: 0 20px;
      font-size: 12px;
      color: #fff;
      border: 1px solid #006eff;
      background-color: #006eff;
      cursor: pointer;
    }
  </style>
  <button>
    <slot></slot>
  </button>
</template>
```

---

# 定义一个 Web Components 组件

## js

```js {5|7|12}
class JoButton extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(
      document.getElementById("jo-button").content.cloneNode(true)
    );
  }
}

window.customElements.define("jo-button", JoButton);
```

---

# 其他注意点

1. 模板的其他定义方式
2. shadowRoot mode
3. slot
4. style

---

# custom css

```html
<!-- main page -->
<style>
  fancy-tabs {
    margin-bottom: 32px;
    --fancy-tabs-bg: black;
  }
</style>
<fancy-tabs>...</fancy-tabs>
```

```css
:host {
  background: var(--fancy-tabs-bg, #9e9e9e);
  border-radius: 10px;
  padding: 10px;
}
```

---

# 添加 disabled 状态

## template

```html
<template id="jo-button">
  <style>
    .button {
      display: inline-block;
      line-height: 30px;
      height: 30px;
      padding: 0 20px;
      font-size: 12px;
      cursor: pointer;
      border-width: 1px;
      border-style: solid;
    }

    .button.is-disabled {
      border-color: #aacfff;
      background-color: #aacfff;
      color: #fff;
    }
  </style>
  <div class="button">
    <slot></slot>
  </div>
</template>
```

---

# 添加 disabled 状态

## js

```js
class JoButton extends HTMLElement {
  static get observedAttributes() {
    return ["disabled", "type"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.appendChild(
      document.getElementById("jo-button").content.cloneNode(true)
    );
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "disabled":
        this.shadowRoot
          .querySelector(".button")
          .classList.toggle("is-disabled", this.disabled);
        break;
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
}

window.customElements.define("jo-button", JoButton);
```

---

# 知识点

```js
 static get observedAttributes() {
    return ["disabled", "type"];
  }
```

```js
attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "disabled":
        this.shadowRoot
          .querySelector(".button")
          .classList.toggle("is-disabled", this.disabled);
        break;
    }
  }
```

---

# 生命周期

- `connectedCallback`：当 custom element 首次被插入文档 DOM 时，被调用。
- `disconnectedCallback`：当 custom element 从文档 DOM 中删除时，被调用。
- `adoptedCallback`：当 custom element 被移动到新的文档时，被调用。
- `attributeChangedCallback`: 当 custom element 增加、删除、修改自身属性时，被调用。

---

# 自定义事件

## disabled 拦截

```js
class JoButton extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.appendChild(
      document.getElementById("jo-button").content.cloneNode(true)
    );

    this.initEvent();
  }

  initEvent() {
    let clickCount = 0;

    this.addEventListener("click", () => {
      if (this.disabled) return;

      this.dispatchEvent(
        new CustomEvent("onClick", { detail: { count: clickCount + 1 } })
      );
    });
  }
}
```

---

# CustomEvent

` event = new CustomEvent(typeArg, customEventInit);`

- typeArg: 一个表示 event 名字的字符串
- customEventInit
  - detail: 自定义数据
  - bubbles 一个布尔值，表示该事件能否冒泡
  - cancelable 一个布尔值，表示该事件是否可以取消

---

# 加上 type

```js
class JoButton extends HTMLElement {
  static get observedAttributes() {
    return ["disabled", "type"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("attributesChangedCallback", name, oldValue, newValue);
    switch (name) {
      case "disabled":
        this.shadowRoot
          .querySelector(".button")
          .classList.toggle("is-disabled", this.disabled);
        break;
      case "type":
        this.shadowRoot
          .querySelector(".button")
          .classList.replace(oldValue || "weak", newValue);
    }
  }

  get type() {
    return this.getAttribute("type") || "weak";
  }

  set type(value) {
    if (JoButton.typeEnum[value]) {
      this.setAttribute("type", value);
    }
  }
}
```

---

# 浏览器支持情况

## <img src="/img/can-i-use-web-components.png" class="w-200 mx-auto rounded shadow"/>

---

# 参考资料

- [Web Components 入门实例教程](https://www.ruanyifeng.com/blog/2019/08/web_components.html)
- [Web Components Tutorial for Beginners](https://www.robinwieruch.de/web-components-tutorial/)
- [Custom Elements v1: Reusable Web Components](https://developers.google.com/web/fundamentals/web-components/customelements)
- [Web Components - MDN ](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)
- [Web Components 在 GitHub 中的应用](https://zhuanlan.zhihu.com/p/19864255)
