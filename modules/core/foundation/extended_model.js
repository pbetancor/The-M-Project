// Creator:   Pablo Betancor (pbetancor@avantic.net)
// Date:      13.04.2012
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ========================================================================== 

m_require('core/foundation/model.js');

/**
 * @class
 * Extended version of model.js to add new features like count() function.
 */
M.ExtendedModel = M.Model.extend(
/** @scope M.ExtendedModel.prototype */ {

	type: 'M.Model',
	
	count: function(obj) {
		if(!this.dataProvider) {
            M.Logger.log('No data provider given.', M.ERR);
        }
        obj = obj ? obj : {};
        
        return this.dataProvider.count($.extend(obj, {model: this}));
	}, 
	
	create: function(obj, dp) {
        var model = M.ExtendedModel.extend({
            __meta: {},
            name: obj.__name__,
            dataProvider: dp,
            recordManager: {},
            usesValidation: obj.usesValidation ? obj.usesValidation : this.usesValidation
        });
        delete obj.__name__;
        delete obj.usesValidation;

        for(var prop in obj) {
            if(typeof(obj[prop]) === 'function') {
                model[prop] = obj[prop];
            } else if(obj[prop].type === 'M.ModelAttribute') {
                model.__meta[prop] = obj[prop];
            }
        }

        /* add ID, _createdAt and _modifiedAt properties in meta for timestamps  */
        model.__meta[M.META_CREATED_AT] = this.attr('String', { // could be 'Date', too
            isRequired:YES
        });
        model.__meta[M.META_UPDATED_AT] = this.attr('String', { // could be 'Date', too
            isRequired:YES
        });

        model.recordManager = M.RecordManager.extend({records:[]});

        /* save model in modelList with model name as key */
        this.modelList[model.name] = model;

        return model;
    }
});