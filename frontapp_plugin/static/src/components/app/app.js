/** @odoo-module **/

import {Component, useState, useSubEnv, useRef, onMounted, useEffect} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";
import {Contact} from "../contact/contact";
import {rpc} from "@web/core/network/rpc";
import {loadJS} from "@web/core/assets";
import {FrontappStore, useFrontappStore} from "../../hooks/frontapp_store";
import {session} from "@web/session";

export class App extends Component {
    static template = "frontapp.App";
    static components = {Contact};

    setup() {
        this.orm = useService("orm");
        this.searchInputRef = useRef("add-input");
        this.loginRef = useRef("login");
        this.errorRef = useRef("error");
        this.csrf_token = useRef("csrf_token");
        this.contacts = useState([]);
        this.session = session;
        const frontappStore = useState(new FrontappStore());
        useSubEnv({frontappStore});
        this.frontappStore = useFrontappStore();

        // Front app initialization
        useEffect(
            () => {
                const subscription = window.Front.contextUpdates.subscribe(
                    async (context) => {
                        switch (context.type) {
                            case "noConversation":
                                console.log("No conversation context:", context);
                                break;
                            case "singleConversation":
                                frontappStore.frontappContext = context;
                                const contacts = [];

                                if (context.conversation?.assignee) {
                                    contacts.push(context.conversation.assignee.email);
                                }
                                if (context.conversation?.recipient) {
                                    contacts.push(
                                        context.conversation.recipient.handle
                                    );
                                }

                                this.searchInputRef.el.value = "";
                                this.errorRef.el.innerHTML = "";
                                await this.loadContacts(contacts, "");

                                break;
                            case "multiConversations":
                                frontappStore.frontappContext = context;
                                console.log(
                                    "Multi conversations context:",
                                    frontappStore
                                );
                                break;
                            default:
                                //                            console.error(`Unsupported context type: ${context.type}`);
                                break;
                        }
                    }
                );
                return () => subscription.unsubscribe();
            },
            () => []
        );
        onMounted(() => {
            this.csrf_token.el.value = odoo.csrf_token;
        });
    }

    async searchContact(ev) {
        if (ev.keyCode === 13 || !ev.keyCode) {
            await this.loadContacts([], this.searchInputRef.el.value);
        }
    }

    showLoginForm() {
        this.loginRef.el.style.display = "block";
        this.csrf_token.el.value = odoo.csrf_token;
    }

    async loadContacts(contact_emails, searchParam) {
        try {
            const result = await this.orm.call("res.partner", "search_from_frontapp", [
                contact_emails,
                searchParam,
                this.frontappStore.frontappContext,
            ]);
            this.contacts.splice(0, this.contacts.length, ...result);
        } catch (error) {
            if (error && error.message && error.code == 100) {
                this.showLoginForm();
            }
            this.errorRef.el.innerHTML = error.message;
        }
    }

    async createOdooContact(name, frontappContext, company_type) {
        const result = await this.orm.call(
            "res.partner",
            "create_contact_from_frontapp",
            [name, frontappContext, company_type]
        );
        await this.loadContacts([], name);
    }

    async createContact(ev) {
        if (this.searchInputRef.el.value == "") {
            this.errorRef.el.innerHTML =
                "Contact name cannot be blank! (write the name in the search box)";
            return;
        }
        await this.createOdooContact(this.searchInputRef.el.value, {}, "person");
    }

    async createCompany(ev) {
        if (this.searchInputRef.el.value == "") {
            this.errorRef.el.innerHTML =
                "Company name cannot be blank! (write the name in the search box)";
            return;
        }
        await this.createOdooContact(this.searchInputRef.el.value, {}, "company");
    }
}
