import { UserCard } from "./user-card";

function main() {
  window.customElements.define("user-card", UserCard);
}

window.onload = main;
