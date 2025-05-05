/** @odoo-module **/

import { Component } from "@odoo/owl";
import { Opportunity } from "../opportunity/opportunity";
import { Note } from "../note/note";
import { useService } from "@web/core/utils/hooks";

//import { useAutofocus } from "../utils";

export class Contact extends Component {
    static template = "frontapp_plugin.Contact";
    static components = { Opportunity, Note };
    static props = { contact: Object };

    setup() {
        this.orm = useService("orm");
    }

//  addTodo(ev) {
//    if (ev.keyCode === 13 && ev.target.value != "") {
//      this.store.addTodo(this.props.list.id, ev.target.value);
//      ev.target.value = "";
//    }
//  }
    createOpportunity() {
        var input =  document.getElementById('opp_input_' + this.props.contact.id);
        var name = input.value;
        this.orm.call("res.partner", "create_contact_opportunity", [[this.props.contact.id], name, {}]).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.log("Error creating opportunity:", error);
        });
//        if (ev.keyCode === 13 && ev.target.value != "") {
//            this.contact.opportunity = ev.target.value;
//            ev.target.value = "";
//        }
    }

    createNote() {
        var input =  document.getElementById('note_input_' + this.props.contact.id);
        var name = input.value;
        this.orm.call("res.partner", "create_contact_note", [[this.props.contact.id], name, {}]).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.log("Error creating note:", error);
        });
    }
}
