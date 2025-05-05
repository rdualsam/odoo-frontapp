/** @odoo-module **/

import { Component, useState, onMounted, useRef } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { jsonrpc } from "@web/core/network/rpc_service";



const INITIAL_STATE = {
    name: "frontapp-odoo",
    nextId: 1,
    contacts: [],
    frontappContext: { conversation: { id: "no_conversation" } },
};

export class FrontappService {
    constructor(env) {
        this.env = env;
        this.state = { ...INITIAL_STATE };
    }

    async addContact(contact) {
        console.log("ADD CONTACT", contact);
        if (contact) {
            this.state.contacts.push(contact);
        }
    }

    async toggleContactLink(id) {
        await this.ensureFrontappContext();
        const contact = this.state.contacts.find((t) => t.id === id);

        return jsonrpc("/web/dataset/call_kw/res.partner", {
            model: "res.partner",
            method: "toggle_contact_link",
            args: [
                [contact.id],
                !contact.isLinked,
                this.state.frontappContext,
            ],
            kwargs: {},
        }).then(() => {
            contact.isLinked = !contact.isLinked;
        });
    }

    deleteContact(id) {
        const index = this.state.contacts.findIndex((t) => t.id === id);
        this.state.contacts.splice(index, 1);
    }

    resetContacts() {
        this.state.contacts = [];
    }

    async createOpportunity(id) {
        const contact = this.state.contacts.find((t) => t.id === id);
        const input = document.getElementById("opp_input_" + id);
        const name = input.value;

        if (name === "") {
            $("#error")[0].innerHTML = "Opportunity text cannot be blank!";
            return;
        }

        return jsonrpc("/web/dataset/call_kw/res.partner", {
            model: "res.partner",
            method: "create_contact_opportunity",
            args: [[contact.id], name, this.state.frontappContext],
            kwargs: {},
        }).then((contacts) => {
            contact.isLinked = true;
            input.value = "";
            this.resetContacts();
            contacts.forEach((contact_item) => {
                this.addContact(contact_item);
            });
        });
    }

    async toggleOpportunityLink(id) {
        await this.ensureFrontappContext();
        let opportunity = false;

        this.state.contacts.forEach((contact) => {
            const opp = contact.opportunities.find((t) => t.id === id);
            if (opp) {
                opportunity = opp;
            }
        });

        return jsonrpc("/web/dataset/call_kw/crm.lead", {
            model: "crm.lead",
            method: "toggle_opportunity_link",
            args: [
                [opportunity.id],
                !opportunity.isLinked,
                this.state.frontappContext,
            ],
            kwargs: {},
        }).then(() => {
            opportunity.isLinked = !opportunity.isLinked;
        });
    }

    async createNote(id) {
        const contact = this.state.contacts.find((t) => t.id === id);
        const input = document.getElementById("note_input_" + id);
        const body = input.value;

        if (body === "") {
            $("#error")[0].innerHTML = "Note body cannot be blank!";
            return;
        }

        return jsonrpc("/web/dataset/call_kw/res.partner", {
            model: "res.partner",
            method: "create_contact_note",
            args: [[contact.id], body, this.state.frontappContext],
            kwargs: {},
        }).then((contacts) => {
            contact.isLinked = true;
            input.value = "";
            this.resetContacts();
            contacts.forEach((contact_item) => {
                this.addContact(contact_item);
            });
        });
    }

    ensureFrontappContext(frontappContext) {
        if (frontappContext) {
            this.state.frontappContext = frontappContext;
        }

        if (window.location !== window.parent.location) {
            if (
                !(
                    this.state.frontappContext &&
                    this.state.frontappContext.conversation &&
                    this.state.frontappContext.conversation.subject !== undefined
                )
            ) {
                const error =
                    "Warning no FrontApp Conversion found!<br/>You might try select a conversation or try to refresh your browser using F5 if the problem persists.";
                $("#error")[0].innerHTML = error;
                throw error;
            }
        }
    }
}

const frontappService = {
    dependencies: ["rpc"],
    async start(env, { rpc }) {
        return new FrontappService(env);
    },
};

registry.category("services").add("frontapp", frontappService);

// -------------------------------------------------------------------------
// Components
// -------------------------------------------------------------------------
export class Note extends Component {
    static template = noteTemplate;
    static props = ["note"];
}

export class Opportunity extends Component {
    static template = opportunityTemplate;
    static props = ["opportunity"];

    setup() {
        this.frontappService = useService("frontapp");
    }

    async dispatch(action, payload) {
        await this.frontappService[action](payload);
        this.render();
    }
}

export class Contact extends Component {
    static template = contactTemplate;
    static props = ["contact"];
    static components = { Opportunity, Note };

    setup() {
        this.frontappService = useService("frontapp");
    }

    async dispatch(action, payload) {
        await this.frontappService[action](payload);
        this.render();
    }
}

export class App extends Component {
    static template = appTemplate;
    static components = { Contact };

    setup() {
        this.inputRef = useRef("add-input");
        this.frontappService = useService("frontapp");

        this.state = useState({
            filter: "all",
            contacts: () => this.frontappService.state.contacts,
            frontappContext: () => this.frontappService.state.frontappContext
        });

        onMounted(() => {
            this.inputRef.el?.focus();

            // Front app initialization
            if (window.Front) {
                window.Front.contextUpdates.subscribe((context) => {
                    switch (context.type) {
                        case "noConversation":
                            console.log("No conversation selected");
                            break;
                        case "singleConversation":
                            console.log("Selected conversation:", context.conversation);
                            const contacts = [];

                            if (context.conversation?.assignee) {
                                contacts.push(context.conversation.assignee.email);
                            }
                            if (context.conversation?.recipient) {
                                contacts.push(context.conversation.recipient.handle);
                            }

                            if ($("#search_input")[0]) {
                                $("#search_input")[0].value = "";
                                $("#error")[0].innerHTML = "";
                            }

                            this.loadContacts(contacts, context);
                            break;
                        case "multiConversations":
                            console.log("Multiple conversations selected", context.conversations);
                            break;
                        default:
                            console.error(`Unsupported context type: ${context.type}`);
                            break;
                    }
                });
            }

            // Demo data for localhost testing
            if (window.location === window.parent.location) {
                this.loadContacts(
                    [
                        "hello@dualsun.com",
                        "info@agrolait.com",
                        "info@deltapc.com",
                        "billy.fox45@example.com",
                    ],
                    {}
                );
            }
        });
    }

    async addContact(ev) {
        if (ev.keyCode === 13) {
            await this.frontappService.addContact(ev.target.value);
            ev.target.value = "";
        }
    }

    async createContact() {
        await this.frontappService.ensureFrontappContext();
        if (this.inputRef.el.value === "") {
            $("#error")[0].innerHTML =
                "Contact name cannot be blank! (write the name in the search box)";
            return;
        }
        await this.createOdooContact(
            this.frontappService.state.frontappContext,
            this.inputRef.el.value,
            "person"
        );
        this.inputRef.el.value = "";
    }

    async createCompany() {
        await this.frontappService.ensureFrontappContext();
        if (this.inputRef.el.value === "") {
            $("#error")[0].innerHTML =
                "Company name cannot be blank! (write it in the search box)";
            return;
        }
        await this.createOdooContact(
            this.frontappService.state.frontappContext,
            this.inputRef.el.value,
            "company"
        );
        this.inputRef.el.value = "";
    }

    async createOdooContact(frontappContext, name, company_type) {
        const data = await jsonrpc("/web/dataset/call_kw/res.partner", {
            model: "res.partner",
            method: "create_contact_from_frontapp",
            args: [name, frontappContext, company_type],
            kwargs: {},
        });

        this.frontappService.resetContacts();
        data.forEach((contact) => {
            this.frontappService.addContact(contact);
        });
    }

    async searchContact(ev) {
        if (ev.keyCode === 13 || !ev.keyCode) {
            await this.loadContacts(
                [],
                this.frontappService.state.frontappContext,
                this.inputRef.el.value
            );
        }
    }

    async loadContacts(contact_emails, frontappContext, search_param) {
        await this.frontappService.ensureFrontappContext(frontappContext);

        try {
            const contacts = await jsonrpc("/web/dataset/call_kw/res.partner", {
                model: "res.partner",
                method: "search_from_frontapp",
                args: [contact_emails, search_param, frontappContext],
                kwargs: {},
            });

            this.frontappService.resetContacts();

            if (contacts.length > 0) {
                $("#info")[0].innerHTML = "";
            } else {
                let searchResult = "<p>No contact matching this conversation!";
                if (search_param) {
                    searchResult += ` search_param: ${search_param};`;
                }
                if (contact_emails) {
                    searchResult += ` emails: ${contact_emails.join(", ")}`;
                }
                searchResult +=
                    "</p><p>You can search for a contact (by name or email) and link it to the conversation.</p>" +
                    "<p>Or you can also create a new Odoo contact or company.</p>";
                $("#info")[0].innerHTML = searchResult;
            }

            contacts.forEach((contact) => {
                this.frontappService.addContact(contact);
            });
        } catch (error) {
            if (error?.message?.code === 100) {
                this.showLoginForm();
            } else {
                console.log("contact search KO!", error);
            }
        }
    }

    showLoginForm() {
        $("#login")[0].style.display = "block";
        $("#csrf_token")[0].value = odoo.csrf_token;
    }

    get displayedContacts() {
        const contacts = this.state.contacts();
        switch (this.state.filter) {
            case "linked":
                return contacts.filter((t) => t.isLinked);
            case "all":
                return contacts;
        }
    }

    setFilter(filter) {
        this.state.filter = filter;
    }
}

// Registry registration
registry.category("actions").add("web.frontapp", App);
