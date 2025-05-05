/** @odoo-module **/

import { Component, useState, useSubEnv, useRef } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
//import { Navbar } from "./navbar";
//import { Todoo } from "../todoo/todoo";
//import { Dashboard } from "../dashboard/dashboard";
import { Contact } from "../contact/contact";
//import { TodoStore } from "../todoo/todo_store";

export class App extends Component {
    static template = "frontapp.App";
    static components = { Contact };

    setup() {
        this.csrf_token = odoo.csrf_token;
        this.orm = useService("orm");
        this.searchInputRef = useRef("add-input");
        this.loginRef = useRef("login");
        this.errorRef = useRef("error");
        this.contacts = useState([]);
    }

    async searchContact(ev) {
        if (ev.keyCode === 13 || !ev.keyCode) {
            await this.loadContacts(this.searchInputRef.el.value);
        }
    }

    showLoginForm() {
        this.loginRef.el.style.display = "block";
    }

    async loadContacts(searchParam) {
        try {
            const result = await this.orm.call("res.partner", "search_from_frontapp", ["", searchParam, {}]);
            this.contacts.splice(0, this.contacts.length, ...result);
        } catch(error) {
            if (error && error.message && error.code == 100) {
                this.showLoginForm();
            }
            this.errorRef.el.innerHTML = error.message;
        }
//            console.log(result);
//        const result = await this.orm.searchRead("res.partner", [], ["name", "email"]).then((result) => {
//            console.log(result);
//        }).then((result) => {;
//            console.log(result);
//        }).catch((error) => {;
//            console.log("Error loading contacts:", error);
//        });
    }

    async createOdooContact(name, frontappContext, company_type) {
        const result = await this.orm.call("res.partner", "create_contact_from_frontapp", [name, frontappContext, company_type])
        await this.loadContacts(name);
//        this.orm.call("res.partner", "create_contact_from_frontapp", [name, frontappContext, company_type]).then((result) => {
//            await this.loadContacts(name);
//        }).catch((error) => {
//            console.log("Error creating contact:", error);
//        });
    }

    async createContact(ev) {
        if (this.searchInputRef.el.value == "") {
            this.errorRef.el.innerHTML = "Contact name cannot be blank! (write the name in the search box)";
            return;
        }
        await this.createOdooContact(this.searchInputRef.el.value, {}, "person");
    }

    async createCompany(ev) {
        if (this.searchInputRef.el.value == "") {
            this.errorRef.el.innerHTML = "Company name cannot be blank! (write the name in the search box)";
            return;
        }
        await this.createOdooContact(this.searchInputRef.el.value, {}, "company");
    }

//  static components = { Navbar };
//
//  setup() {
//    this.apps = [
//      { id: "todoo", name: "Todoo", Component: Todoo },
//      { id: "dashboard", name: "Dashboard", Component: Dashboard },
//      { id: "contacts", name: "Contacts", Component: Contacts },
//    ];
//    this.state = useState({
//      currentApp: this.apps[0],
//    });
//    const todoStore = useState(new TodoStore());
//
//    // add store to environment
//    useSubEnv({ todoStore });
//  }
//
//  selectApp(appId) {
//    const newApp = this.apps.find((app) => app.id === appId);
//    this.state.currentApp = newApp;
//  }
}
