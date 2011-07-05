// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Dominik
// Date:      05.07.2011
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('core/utility/logger.js');

/**
 * @class
 *
 * .......
 *
 * @extends M.Object
 */
M.Store = M.Object.extend(
/** @scope M.Store.prototype */ {

    /**
     * The type of this object.
     * @type String
     */
    type: 'M.Store',

    model: null,

    dataProvider: null,

    records: [],

    create: function() {
        // erzeugt store (config-objekt...)
        // ruft "add" auf (evtl. über params...)

        // nutzen von model registry oder implementieren der funktionalität: eindeutige ID etc...
    },

    add: function() {
        // reines add zu den records
    },

    createRecord: function() {
        // erzeugt record auf basis von model und pusht in records
    },

    find: function() {
        // ohne parameter: findAll() ....
    },

    del: function() {
        // über property festlegen ob DELETE nur für store gilt oder für die echten daten dahinter (data provider)
        // mit paratemer kann gezieltes record angesprochen werden (id ....)
    },

    save: function() {
        // speichert alle nicht gespeicherten records "überall"
        // mit paratemer kann gezieltes record angesprochen werden (id ....)
    },

    getRecordForId: function() {
        // gibt record mit bes. ID zurück
    }

});