/** @odoo-module **/

import {Component} from "@odoo/owl";
import {markup} from "@odoo/owl";

export class Note extends Component {
    static template = "frontapp_plugin.Note";
    static props = {note: Object};

    setup() {
        this.markupBody = markup(this.props.note.body);
    }
}
