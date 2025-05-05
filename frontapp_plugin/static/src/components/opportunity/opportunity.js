/** @odoo-module **/

import { Component } from "@odoo/owl";
//import { useAutofocus } from "../utils";

export class Opportunity extends Component {
  static template = "frontapp_plugin.Opportunity";
//  static components = { TodoItem };
  static props = { opportunity: Object };

//  setup() {
//    this.store = useTodoStore();
//    useAutofocus("input");
//  }

//  addTodo(ev) {
//    if (ev.keyCode === 13 && ev.target.value != "") {
//      this.store.addTodo(this.props.list.id, ev.target.value);
//      ev.target.value = "";
//    }
//  }
}
