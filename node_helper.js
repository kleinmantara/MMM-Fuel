/**
 * @file node_helper.js
 *
 * @author fewieden
 * @license MIT
 *
 * @see  https://github.com/fewieden/MMM-Fuel
 */

/**
 * @external node_helper
 * @see https://github.com/MichMich/MagicMirror/blob/master/modules/node_modules/node_helper/index.js
 */
const NodeHelper = require('node_helper');

/**
 * @external fs-extra
 * @see https://www.npmjs.com/package/fs-extra
 */
const fs = require('fs-extra');

/**
 * @external path
 * @see https://nodejs.org/api/path.html
 */
const path = require('path');

/**
 * @module node_helper
 * @description Backend for the module to query data from the API providers.
 *
 * @requires external:fs-extra
 * @requires external:node_helper
 */
module.exports = NodeHelper.create({

    /**
     * @function start
     * @description Logs a start message to the console.
     * @override
     */
    start() {
        console.log(`Starting module helper: ${this.name}`);
    },

    /**
     * @function socketNotificationReceived
     * @description Receives socket notifications from the module.
     * @async
     * @override
     *
     * @param {string} notification - Notification name
     * @param {*} payload - Detailed payload of the notification.
     *
     * @returns {void}
     */
    async socketNotificationReceived(notification, payload) {
        if (notification === 'CONFIG') {
            this.config = payload;
            if (await fs.pathExists(path.join(__dirname, 'apis', `${this.config.provider}.js`))) {
                // eslint-disable-next-line global-require, import/no-dynamic-require
                this.provider = await require(`./apis/${this.config.provider}`)(this.config);
                this.getData();
                setInterval(() => {
                    this.getData();
                }, this.config.updateInterval);
            } else {
                console.log(`${this.name}: Couldn't load provider ${this.config.provider}`);
            }
        }
    },

    /**
     * @function getData
     * @description Uses API provider to get data.
     * @async
     *
     * @returns {void}
     */
    async getData() {
        try {
            const data = await this.provider.getData();
            this.sendSocketNotification('PRICELIST', data);
        } catch (e) {
            console.log(e);
        }
    }
});
