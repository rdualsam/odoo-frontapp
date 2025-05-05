/** @odoo-module **/

import { Component } from "@odoo/owl";
import { markup } from "@odoo/owl";

export class Note extends Component {
  static template = "frontapp_plugin.Note";
  static props = { note: Object };

  setup() {
//    this.store = useTodoStore();
    this.markupBody = markup(this.props.note.body);
  }

//  addTodo(ev) {
//    if (ev.keyCode === 13 && ev.target.value != "") {
//      this.store.addTodo(this.props.list.id, ev.target.value);
//      ev.target.value = "";
//    }
//  }
}
