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

    opId: 0,

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
     * {
     *   id: 12,
     *   query: 'bla bla bla',
     *   appendRecords: YES,
     *   callbacks: {
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    find: function(obj) {
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }

        /* initialize obj object if not done already */
        obj = obj || {};

        /* store this operation's application callbacks for further use */
        this.callbacks[this.opId] = obj.callbacks;

        /* add the appendRecord property to the callbacks object to be able to use this later, too */
        if(this.callbacks[this.opId]) {
            this.callbacks[this.opId].appendRecords = obj.appendRecords ? obj.appendRecords : NO;
        } else {
            this.callbacks[this.opId] = {
                appendRecords: obj.appendRecords ? obj.appendRecords : NO
            }
        }

        /* if an id is passed, remove a possible query (to make it easier for the data provider to decide what to do) */
        if(obj && obj.id && typeof(obj.id) !== 'object') {
            if(obj && obj.query && typeof(obj.query) !== 'object') {
                delete obj.query;
            }
        /* if neither an id nor a query is passed, log an error and return */
        } else {
            if(!(obj && obj.query && typeof(obj.query) !== 'object')) {
                M.Logger.log('No valid id or query passed when calling find() in store for model ' + this.model.name + '.', M.ERR);
                return;
            }
        }

        /* call the data provider's save method and pass id/query, callbacks and some meta information */
        this.dataProvider.save({
            id: obj.id,
            query: obj.query,
            opId: this.opId++,
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
    },

    /**
     * {
     *   appendRecords: YES,
     *   callbacks: {
     *     successOp: {
     *       target: MyApp.MyController,
     *       action: 'opWorked'
     *     },
     *     successTx: {
     *       target: MyApp.MyController,
     *       action: 'txWorked'
     *     },
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     errorOp: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     errorTx: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    findAll: function(obj) {
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }

        /* initialize obj object if not done already */
        obj = obj || {};

        /* store this operation's application callbacks for further use */
        this.callbacks[this.opId] = obj.callbacks;

        /* add the appendRecord property to the callbacks object to be able to use this later, too */
        if(this.callbacks[this.opId]) {
            this.callbacks[this.opId].appendRecords = obj.appendRecords ? obj.appendRecords : NO;
        } else {
            this.callbacks[this.opId] = {
                appendRecords: obj.appendRecords ? obj.appendRecords : NO
            }
        }

        /* remove id and query from obj to force findAll in data provider */
        delete obj.id;
        delete obj.query;

        /* call the data provider's find method and pass the model, callbacks and some meta information */
        this.dataProvider.find({
            transactionSize: obj.transactionSize,
            model: this.model,
            opId: this.opId++,
            callbacks: {
                successOp: {
                    target: this,
                    action: 'onSuccessOp'
                },
                successTx: {
                    target: this,
                    action: 'onSuccessTx'
                },
                success: {
                    target: this,
                    action: 'onSuccess'
                },
                errorOp: {
                    target: this,
                    action: 'onErrorOp'
                },
                errorTx: {
                    target: this,
                    action: 'onErrorTx'
                },
                error: {
                    target: this,
                    action: 'onError'
                }
            }
        });
    },

    /**
     * {
     *   id: 12,
     *   callbacks: {
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     *
     * {
     *   record: aRecordObject,
     *   callbacks: {
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    del: function(obj) {
        // TODO: 'noRemove' --> nach del removeRecord aufrufen
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }

        /* initialize obj object if not done already */
        obj = obj || {};

        /* store this operation's application callbacks for further use */
        this.callbacks[this.opId] = obj.callbacks;

        /* add the removeRecord property to the callbacks object to be able to use this later, too */
        if(this.callbacks[this.opId]) {
            this.callbacks[this.opId].removeRecord = (typeof(obj.removeRecord) === 'boolean') ? obj.removeRecord : YES;
        } else {
            this.callbacks[this.opId] = {
                removeRecord: (typeof(obj.removeRecord) === 'boolean') ? obj.removeRecord : YES
            }
        }

        /* If there is an id passed, try to get the corresponding record */
        if(obj && obj.id && typeof(obj.id) !== 'object') {
            /* if additionally a record was passed, use this instead */
            obj.record = obj.record ? obj.record : this.getRecordById(obj.id);

            /* if no record could be retrieved (or was passed), log an error and return */
            if(!obj.record) {
                M.Logger.log('No valid id passed when calling del() in store for model ' + this.model.name + '.', M.ERR);
                return;
            }
        }

        /* If there is a record passed (or retrieved by a given id), delete this record */
        if(obj && obj.record && typeof(obj.record) === 'object') {
            /* call the data provider's del method and pass the record, callbacks and some meta information */
            this.dataProvider.del({
                record: obj.record,
                opId: this.opId++,
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
        /* If neither an id nor a record is passed, log an error and return */
        } else {
            M.Logger.log('No valid id or record passed when calling del() in store for model ' + this.model.name + '.', M.ERR);
            return;
        }
    },

    /**
     * {
     *   records: [aRecordObject, anotherRecordObject, aThirdRecordObject],
     *   callbacks: {
     *     successOp: {
     *       target: MyApp.MyController,
     *       action: 'opWorked'
     *     },
     *     successTx: {
     *       target: MyApp.MyController,
     *       action: 'txWorked'
     *     },
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     errorOp: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     errorTx: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    delBulk: function(obj) {
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }

        /* initialize obj object if not done already */
        obj = obj || {};

        /* store this operation's application callbacks for further use */
        this.callbacks[this.opId] = obj.callbacks;

        /* if no records were passed, log an error and return */
        if(!(obj.records)) {
            M.Logger.log('No records passed to be deleted (delBulk()) in store for model ' + this.model.name + '.', M.ERR);
            return;
        }

        /* call the data provider's del method, provide the records array, callbacks and some meta information */
        this.dataProvider.save({
            record: obj.records,
            opId: this.opId,
            transactionSize: obj.transactionSize ? obj.transactionSize : obj.records.length,
            callbacks: {
                successOp: {
                    target: this,
                    action: 'onSuccessOp'
                },
                successTx: {
                    target: this,
                    action: 'onSuccessTx'
                },
                success: {
                    target: this,
                    action: 'onSuccess'
                },
                errorOp: {
                    target: this,
                    action: 'onErrorOp'
                },
                errorTx: {
                    target: this,
                    action: 'onErrorTx'
                },
                error: {
                    target: this,
                    action: 'onError'
                }
            }
        });
    },

    /**
     * {
     *   callbacks: {
     *     successOp: {
     *       target: MyApp.MyController,
     *       action: 'opWorked'
     *     },
     *     successTx: {
     *       target: MyApp.MyController,
     *       action: 'txWorked'
     *     },
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     errorOp: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     errorTx: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    delAll: function(obj) {
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }

        /* initialize obj object if not done already */
        obj = obj || {};

        /* retrieve all records, that can not be deleted (c.p. state machine) */
        var newRecords = this.getRecordsByState([M.STATE_NEW, M.STATE_NEW_VALID, M.STATE_NEW_INVALID]);

        /* compute all records, that can deleted (c.p. state machine) */
        obj.records = _.difference(this.records, newRecords);

        /* remove the newRecords directly (since the haven't been saved before and only exist in memory) */
        for(var record in newRecords) {
            /* TODO: maybe call callback, but what about transactions then? */
            delete this.records[record];
        }

        // TODO: remove newRecords and call callback

        /* if no records were found that can be stored, return */
        if(!obj.records) {
            M.Logger.log('Nothing to be deleted in store for model ' + this.model.name + '.', M.INFO);
            return;
        }

        /* use delBulk to actually delete those records */
        this.delBulk(obj);
    },

    /**
     * {
     *   id: 12,
     *   callbacks: {
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     *
     * {
     *   record: aRecordObject,
     *   callbacks: {
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    save: function(obj) {
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }
        
        /* initialize obj object if not done already */
        obj = obj || {};

        /* store this operation's application callbacks for further use */
        this.callbacks[this.opId] = obj.callbacks;

        /* If there is an id passed, try to get the corresponding record */
        if(obj && obj.id && typeof(obj.id) !== 'object') {
            /* if additionally a record was passed, use this instead */
            obj.record = obj.record ? obj.record : this.getRecordById(obj.id);

            /* if no record could be retrieved (or was passed), log an error and return */
            if(!obj.record) {
                M.Logger.log('No valid id passed when calling save() in store for model ' + this.model.name + '.', M.ERR);
                return;
            }
        }

        /* If there is a record passed (or retrieved by a given id), save this record */
        if(obj && obj.record && typeof(obj.record) === 'object') {
            /* call the data provider's save method and pass the record, callbacks and some meta information */
            this.dataProvider.save({
                record: obj.record,
                opId: this.opId++,
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
        /* If neither an id nor a record is passed, log an error and return */
        } else {
            M.Logger.log('No valid id or record passed when calling save() in store for model ' + this.model.name + '.', M.ERR);
            return;
        }
    },

    /**
     * {
     *   records: [aRecordObject, anotherRecordObject, aThirdRecordObject],
     *   callbacks: {
     *     successOp: {
     *       target: MyApp.MyController,
     *       action: 'opWorked'
     *     },
     *     successTx: {
     *       target: MyApp.MyController,
     *       action: 'txWorked'
     *     },
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     errorOp: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     errorTx: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    saveBulk: function(obj) {
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }
        
        /* initialize obj object if not done already */
        obj = obj || {};

        /* store this operation's application callbacks for further use */
        this.callbacks[this.opId] = obj.callbacks;

        /* if no records were passed, log an error and return */
        if(!(obj.records)) {
            M.Logger.log('No records passed to be saved (saveBulk()) in store for model ' + this.model.name + '.', M.ERR);
            return;
        }

        /* call the data provider's save method, provide the records array, callbacks and some meta information */
        this.dataProvider.save({
            record: obj.records,
            opId: this.opId,
            transactionSize: obj.transactionSize ? obj.transactionSize : obj.records.length,
            callbacks: {
                successOp: {
                    target: this,
                    action: 'onSuccessOp'
                },
                successTx: {
                    target: this,
                    action: 'onSuccessTx'
                },
                success: {
                    target: this,
                    action: 'onSuccess'
                },
                errorOp: {
                    target: this,
                    action: 'onErrorOp'
                },
                errorTx: {
                    target: this,
                    action: 'onErrorTx'
                },
                error: {
                    target: this,
                    action: 'onError'
                }
            }
        });
    },

    /**
     * {
     *   callbacks: {
     *     successOp: {
     *       target: MyApp.MyController,
     *       action: 'opWorked'
     *     },
     *     successTx: {
     *       target: MyApp.MyController,
     *       action: 'txWorked'
     *     },
     *     success: {
     *       target: MyApp.MyController,
     *       action: 'itWorked'
     *     },
     *     errorOp: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     errorTx: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     },
     *     error: {
     *       action: function(e) {
     *         console.log(e);
     *       }
     *     }
     *   }
     * }
     */
    saveAll: function(obj) {
        /* check if the store is valid */
        if(!this.checkStore()) {
            return;
        }

        /* initialize obj object if not done already */
        obj = obj || {};

        /* retrieve all records, that can be saved (c.p. state machine) */
        obj.records = this.getRecordsByState([M.STATE_DIRTY_VALID, M.STATE_NEW_VALID]);

        /* if no records were found that can be stored, return */
        if(!obj.records) {
            M.Logger.log('Nothing to be saved in store for model ' + this.model.name + '.', M.INFO);
            return;
        }

        /* use saveBulk to actually save those records */
        this.saveBulk(obj);
    },

    getRecordById: function(id) {
        return this.records[id];
    },

    getNumberOfRecords: function() {
        return _.size(this.records);
    },

    /**
     * returns all records that match the given state (or one of them if an array is passed)
     *
     * @param state
     */
    getRecordsByState: function(state) {
        if(!_.isArray(state)) {
            /* to keep code clean underneath we always use _.include with an array even if it's one state passed */
            state = [state];
        }
        return _.select(this.records, function(rec) {
            return _.include(state, rec.state);
        });
    },

    onSuccessOp: function(opId, obj) {
        if(this.callbacks && this.callbacks[opId]) {
            var callback = this.callbacks[opId].successOp;
            delete this.callbacks[opId];
        }

        if(obj && obj.operationType) {
            switch(obj.operationType) {
                case 'find':
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.record, obj.opCount, obj.opTotal, obj.txCount, obj.txTotal, obj.txOpCount, obj.txOpTotal])();
                    }
                    break;
                case 'save':
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.record, obj.opCount, obj.opTotal, obj.txCount, obj.txTotal, obj.txOpCount, obj.txOpTotal])();
                    }
                    break;
                case 'del':
                    /* remove record from record list */
                    if(this.records) {
                        delete this.records[obj.record.m_id]
                    }
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.record, obj.opCount, obj.opTotal, obj.txCount, obj.txTotal, obj.txOpCount, obj.txOpTotal])();
                    }
                    break;
            }
        }
    },

    onSuccessTx: function(opId, obj) {
        if(this.callbacks && this.callbacks[opId]) {
            var callback = this.callbacks[opId].successTx;
            delete this.callbacks[opId];
        }

        if(obj && obj.operationType) {
            switch(obj.operationType) {
                case 'find':
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.records, obj.txCount, obj.txTotal])();
                    }
                    break;
                case 'save':
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.records, obj.txCount, obj.txTotal])();
                    }
                    break;
                case 'del':
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.records, obj.txCount, obj.txTotal])();
                    }
                    break;
            }
        }
    },

    onSuccess: function(opId, obj) {
        var callback = null;
        if(this.callbacks && this.callbacks[opId]) {
            callback = this.callbacks[opId].successOp;
            delete this.callbacks[opId];
        }

        if(obj && obj.operationType) {
            switch(obj.operationType) {
                case 'find':
                    if(!this.callbacks[opId].appendRecords) {
                        this.records = {};
                    }
                    if(obj.records) {
                        if(!_.isArray(obj.records)) {
                            obj.records = [obj.records];
                        }
                        var that = this;
                        _.each(obj.records, function(record) {
                            that.addRecord(record);
                        });
                    }
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.records])();
                    }
                    break;
                case 'save':
                    if(obj.records) {
                        if(!_.isArray(obj.records)) {
                            obj.records = [obj.records];
                        }
                    }
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.records])();
                    }
                    break;
                case 'del':
                    if(obj.records) {
                        if(!_.isArray(obj.records)) {
                            obj.records = [obj.records];
                        }
                        /* remove records from record list (only, if this is a single value, otherwise they were deleted in successOp before) */
                        if(this.records && obj.records.length === 1) {
                            delete this.records[obj.records[0].m_id]
                        }
                    }
                    if(callback && M.EventDispatcher.checkHandler(callback)) {
                        this.bindToCaller(callback.target, callback.action, [obj.records])();
                    }
                    break;
            }
        }
    },

    onErrorOp: function(opId, obj) {
        if(this.callbacks && this.callbacks[opId]) {
            var callback = this.callbacks[opId].errorOp;
            delete this.callbacks[opId];
        }
    },

    onErrorTx: function(opId, obj) {
        if(this.callbacks && this.callbacks[opId]) {
            var callback = this.callbacks[opId].errorTx;
            delete this.callbacks[opId];
        }
    },

    onError: function(opId, obj) {
        if(this.callbacks && this.callbacks[opId]) {
            var callback = this.callbacks[opId].error;
            delete this.callbacks[opId];
        }
    },

    checkStore: function() {
        if(!this.dataProvider) {
            M.Logger.log('No data provider specified for this store.', M.ERR);
            return NO;
        }
        return YES;
    }

});