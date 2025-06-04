/** @odoo-module **/

import {Component} from "@odoo/owl";
import {Opportunity} from "../opportunity/opportunity";
import {Note} from "../note/note";
import {useService} from "@web/core/utils/hooks";
import {useFrontappStore} from "../../hooks/frontapp_store";
import {rpc} from "@web/core/network/rpc";

//import { useAutofocus } from "../utils";

export class Contact extends Component {
    static template = "frontapp_plugin.Contact";
    static components = {Opportunity, Note};
    static props = {contact: Object};

    setup() {
        this.orm = useService("orm");
        this.frontappStore = useFrontappStore();
    }

    createOpportunity() {
        var input = document.getElementById("opp_input_" + this.props.contact.id);
        var name = input.value;
        this.orm
            .call("res.partner", "create_contact_opportunity", [
                [this.props.contact.id],
                name,
                this.frontappStore.frontappContext,
            ])
            .then((result) => {
                console.log(result);
                input.value = "";
            })
            .catch((error) => {
                console.log("Error creating opportunity:", error);
            });
    }

    async toggleContactLink() {
        const frontappContext = this.frontappStore.frontappContext;
        this.orm
            .call("res.partner", "toggle_contact_link", [
                [this.props.contact.id],
                !this.props.contact.isLinked,
                frontappContext,
            ])
            .then((result) => {
                this.props.contact.isLinked = !this.props.contact.isLinked;
            })
            .catch((error) => {
                console.log("Error creating opportunity:", error);
            });
    }

    createNote() {
        var input = document.getElementById("note_input_" + this.props.contact.id);
        var name = input.value;
        this.orm
            .call("res.partner", "create_contact_note", [
                [this.props.contact.id],
                name,
                {},
            ])
            .then((result) => {
                input.value = "";
            })
            .catch((error) => {
                console.log("Error creating note:", error);
            });
    }
}
