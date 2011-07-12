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

    callbacks: null,

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
            records: {},
            callbacks: {}
        });
        return store;
    },

    createRecord: function(obj, noAdd) {
        var record = this.model.createRecord(obj);
        if(!noAdd) {
            this.addRecord(record);
        }
        return record;
    },

    // add to store (nix mit DP)
    addRecord: function(record) {
        this.records[record.m_id] = record;
        // trigger event #RECORDS_DID_CHANGE#
        // konfigurierbard über 2. parameter fireEvent: event nur einmal feuern bei bulkimport (find)
    },

    // remove from store (nix mit DP)
    removeRecord: function(record) {
        var m_id = record && record.type === 'M.Model' ? record.m_id : record;
        if(m_id && this.records[m_id]) {
            delete this.records[m_id];
        } else {
            // throw error
        }
        // trigger event #RECORDS_DID_CHANGE#
    },

    removeAllRecords: function() {
        this.records = {};
    },

    /**
     * returns YES/NO (zeigt an ob find erfolgreich aufgerufen wurde, NICHT, ob etwas gefunden wurde --> callbacks)
     *
     * obj:
     *  - callbacks
     *      - success
     *          - target (optional)
     *          - action
     *      - error
     *          - target (optional)
     *          - action
     *      - appendRecords
     *
     * @param obj
     */
    find: function(obj) {
        if(!this.dataProvider) {
            M.Logger.log('No data provider specified for this store.', M.ERR);
            return;
        }
        obj = obj ? obj : {};

        /* extends the given obj with self as model property in obj */
        try {
            var transactionId = M.UniqueId.uuid();
            this.callbacks[transactionId] = $.extend(obj.callbacks, {appendRecords: obj.appendRecords ? obj.appendRecords : NO});
            this.dataProvider.find($.extend(obj, {
                model: this.model,
                transactionId: transactionId,
                callbacks: {
                    success: {
                        target: this,
                        action: 'onSuccess'
                    },
                    error: {
                        target: this,
                        action: 'onError'
                    }
                }
            }));
        } catch(e) {
            return NO;
        }

        return YES;

        // TODO: success/error callbacks für store um events zu feuern
    },

    del: function(obj, noRemove) {
        //this.dataProvider.del(obj);
        // success/error callbacks für store um events zu feuern
        // mit paratemer kann gezieltes record angesprochen werden (id ....)
        // 'noRemove' --> nach del removeRecord aufrufen
        if(obj) {

        } else {
            
        }
    },

    save: function(obj) {
        if(obj && obj.record && typeof(obj.record) === 'object') {
            var transactionId = M.UniqueId.uuid();
            this.callbacks[transactionId] = obj.callbacks;
            this.dataProvider.save({
                model: obj.record,
                transactionId: transactionId,
                callbacks: {
                    success: {
                        target: this,
                        action: 'onSuccess'
                    },
                    error: {
                        target: this,
                        action: 'onError'
                    }
                }
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
    },

    onSuccess: function(transactionId, records) {
        if(this.callbacks && this.callbacks[transactionId]) {
            if(!this.callbacks[transactionId].appendRecords) {
                this.records = {};
            }

            if(records) {
                if(records.constructor == Array) {
                    var that = this;
                    _.each(records, function(record) {
                        that.addRecord(record);
                    });
                } else {
                    this.addRecord(records);
                }
            }

            var callback = this.callbacks[transactionId].success;
            if(callback && M.EventDispatcher.checkHandler(callback)) {
                if(records.constructor == Array) {
                    this.bindToCaller(callback.target, callback.action)();
                } else {
                    this.bindToCaller(callback.target, callback.action)();
                }
            }
            
            delete this.callbacks[transactionId];
        }
    },

    onError: function(transactionId, error) {
        if(this.callbacks && this.callbacks[transactionId]) {
            var callback = this.callbacks[transactionId].error;
            delete this.callbacks[transactionId];
        }
    }

});