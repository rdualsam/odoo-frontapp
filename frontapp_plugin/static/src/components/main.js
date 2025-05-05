/** @odoo-module **/

import { mount, whenReady } from "@odoo/owl";
import { startWebClient } from "@web/start";
import { App } from "./app/app";
import { templates } from "@web/core/assets";

startWebClient(App);
