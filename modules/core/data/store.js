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
 * A store is used to manage a model and all of its records. It provides CRUD methods for creating,
 * reading (find), updating (save) and deleting (del) records of a certain type of model.
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

    records: null,

    /**
     * This method creates and initializes a store.
     *
     * @param obj
     * @returns {M.Store} The store.
     */
    create: function(obj) {
        var store = M.Store.extend({
            model: obj.model,
            dataProvider: obj.dataProvider,
            records: []
        });
        return store;
    },

    createRecord: function() {
        // ruft "add" auf (evtl. über params...)
        // nutzen von model registry oder implementieren der funktionalität: eindeutige ID etc...
    },

    add: function() {
        // reines add zu den records
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