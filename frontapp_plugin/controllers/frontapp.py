# Copyright 2021 AKRETION
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo.http import Controller, request, route
from odoo.http import request

class FrontappPluginController(Controller):
    @route(
        ["/frontapp-plugin"],
        methods=["GET"],
        type="http",
        auth="public",
    )
    def index(self, **params):
        session_info = request.env['ir.http'].session_info()
        return request.render("frontapp_plugin.frontapp-plugin", {'session_info': session_info})
