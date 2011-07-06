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
            records: {}
        });
        return store;
    },

    createRecord: function(obj, noAdd) {
        var record = this.model.createRecord(obj);
        if(!noAdd) {
            this.add(record);
        }
        return record;
    },

    // add to store (nix mit DP)
    add: function(record) {
        this.records[record.m_id] = record;
        // trigger event #RECORDS_DID_CHANGE#
        // konfigurierbard über 2. parameter fireEvent: event nur einmal feuern bei bulkimport (find)
    },

    // remove from store (nix mit DP)
    remove: function(record) {
        var m_id = record && record.type === 'M.Model' ? record.m_id : record;
        if(m_id && this.records[m_id]) {
            delete this.records[m_id];
        } else {
            // throw error
        }
        // trigger event #RECORDS_DID_CHANGE#
    },

    find: function(obj) {
        this.dataProvider.find(obj);
        // success/error callbacks für store um events zu feuern
    },

    del: function(obj) {
        this.dataProvider.del(obj);
        // success/error callbacks für store um events zu feuern
        // über property festlegen ob DELETE nur für store gilt oder für die echten daten dahinter (data provider)
        // mit paratemer kann gezieltes record angesprochen werden (id ....)
    },

    save: function(options) {
        if(options && options.record && typeof(options.record)) {
            this.dataProvider.save({
                model: options.record
            });
        } else {
            
        }
        // success/error callbacks für store um events zu feuern
        // speichert alle nicht gespeicherten records "überall"
        // mit paratemer kann gezieltes record angesprochen werden (id ....)
    },

    getRecordForId: function(id) {
        return this.records[id];
    },

    getNumberOfRecords: function() {
        return _.size(this.records);
    }

});