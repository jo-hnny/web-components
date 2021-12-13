import templateHtml from "bundle-text:./template.html";

export class UserCard extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const template = document.createElement("template");
    template.innerHTML = templateHtml;
    const content = template.content.cloneNode(true);

    shadow.appendChild(content);
  }
}
