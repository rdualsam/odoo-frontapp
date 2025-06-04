/** @odoo-module */

import {useEnv, useState} from "@odoo/owl";

export class FrontappStore {
    constructor() {
        this.frontappContext = {conversation: {id: "no_conversation"}};
    }
}

export function useFrontappStore() {
    const env = useEnv();
    return useState(env.frontappStore);
}
