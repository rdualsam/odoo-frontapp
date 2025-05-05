# Copyright 2021 Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Frontapp CRM plugin for Odoo",
    "summary": """
        Plugin for FrontApp CRM""",
    "version": "18.0.1.0.0",
    "license": "LGPL-3",
    "author": "Akretion",
    "website": "https://github.com/akretion/odoo-frontapp",
    "depends": ["crm"],
    "maintainers": ["rvalyi"],
    "data": [
        "data/mail_data.xml",
        # "views/assets_template.xml",
        "views/frontapp_template.xml",
    ],
    'assets': {
        'frontapp_plugin.assets': [
            # bootstrap
            ('include', 'web._assets_helpers'),
            'web/static/src/scss/pre_variables.scss',
            'web/static/lib/bootstrap/scss/_variables.scss',
            'web/static/lib/bootstrap/scss/_variables-dark.scss',
            'web/static/lib/bootstrap/scss/_maps.scss',
            ('include', 'web._assets_bootstrap_backend'),

            # required for fa icons
            'web/static/src/libs/fontawesome/css/font-awesome.css',

            # include base files from framework
            ('include', 'web._assets_core'),

            # 'frontapp_plugin/static/src/components/**/*',
            'frontapp_plugin/static/src/components/main.js',
            'frontapp_plugin/static/src/components/app/*',
            'frontapp_plugin/static/src/components/contact/*',
            'frontapp_plugin/static/src/components/opportunity/*',
            'frontapp_plugin/static/src/components/note/*',
            'frontapp_plugin/static/dist/frontapp-plugin-sdk.js',
            'web/static/src/start.js',
        ],
    },
    "demo": [],
}
