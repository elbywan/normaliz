(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.normaliz = factory());
}(this, (function () { 'use strict';

    function normaliz (data, {
        entity,
        from,
        schema,
        mappings = {}, 
        keys = {}
    } = {}, entities = {}) {
        if(!data)
            return entities
        if(typeof schema !== 'object') {
            throw new Error('Invalid schema - expecting an object.\n' + schema.toString())
        }
        const dataIsArray =  Array.isArray(data);
        if(!dataIsArray) {
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
            if(from) {
                Object.entries(from).forEach(([ fromEntity, fromId ]) => {
                    if(!entities[fromEntity])
                        entities[fromEntity] = {};
                    if(!entities[fromEntity][fromId])
                        entities[fromEntity][fromId] = {};
                    if(dataIsArray) {
                        if(!entities[fromEntity][fromId][collection])
                            entities[fromEntity][fromId][collection] = [];
                        entities[fromEntity][fromId][collection].push(id);
                    } else {
                        entities[fromEntity][fromId][collection] = id;
                    }
                });
            }
            return entities
        }, entities);

        return entities
    }

    return normaliz;

})));
