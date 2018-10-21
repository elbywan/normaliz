(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.normaliz = factory());
}(this, (function () { 'use strict';

    function normaliz (data, {
        entity,
        schema,
        mappings = {}, 
        keys = {}
    } = {}, entities = {}) {
        if(!data)
            return entities
        if(typeof schema !== 'object') {
            throw new Error('Invalid schema - expecting an object.\n' + schema.toString())
        }
        if(!Array.isArray(data)) {
            data = [ data ];
        }
        let collection = mappings[entity] || entity;
        let innerEntities = Object.keys(schema);
        entities = data.reduce((entities, item) => {
            const copy = Object.assign({}, item);
            const id =
                keys[entity] ?
                    typeof keys[entity] === 'function' ?
                        keys[entity](item) :
                    item[keys[entity]] :
                item.id;
            innerEntities.forEach(innerEntity => {
                let entityValue = copy[innerEntity];
                if(!entityValue)
                    return
                let innerKeyId = keys[innerEntity] || 'id';
                entities = normaliz(entityValue,{
                    entity: innerEntity,
                    schema: schema[innerEntity],
                    mappings,
                    keys
                }, entities);
                if(Array.isArray(entityValue)) {
                    copy[innerEntity] = entityValue.map(v =>
                        typeof innerKeyId === 'function' ? innerKeyId(v) : v[innerKeyId]
                    );
                } else {
                    copy[innerEntity] =
                        typeof innerKeyId === 'function' ? innerKeyId(entityValue) : entityValue[innerKeyId];
                }
            });
            if(typeof collection === 'function') {
                collection = mappings[entity](data);
            }
            if(!entities[collection])
                entities[collection] = {};
            entities[collection][id] = copy;
            return entities
        }, entities);

        return entities
    }

    return normaliz;

})));
