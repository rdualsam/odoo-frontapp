/** @odoo-module **/

import {Component, useRef} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";
import {useFrontappStore} from "../../hooks/frontapp_store";

export class Opportunity extends Component {
    static template = "frontapp_plugin.Opportunity";
    static props = {opportunity: Object};

    setup() {
        this.frontappStore = useFrontappStore();
        this.errorRef = useRef("error");
        this.orm = useService("orm");
    }

    async toggleOpportunityLink() {
        const frontappContext = this.frontappStore.frontappContext;
        this.orm
            .call("crm.lead", "toggle_opportunity_link", [
                [this.props.opportunity.id],
                !this.props.opportunity.isLinked,
                frontappContext,
            ])
            .then((result) => {
                this.props.opportunity.isLinked = !this.props.opportunity.isLinked;
            })
            .catch((error) => {
                console.log("Error toggling opportunity link:", error);
            });
    }
}
