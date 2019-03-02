(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.normaliz = {})));
}(this, (function (exports) { 'use strict';

    function normaliz (data, {
        entity,
        from,
        schema,
        mappings = {}, 
        keys = {}
    } = {}, entities = {}) {
        if(!data)
            return entities
        if(typeof schema !== 'object' || !(schema instanceof Array))
            throw new Error('Invalid schema - expecting an array. Got: ' + schema)

        const dataIsArray = Array.isArray(data);
        if(!dataIsArray)
            data = [ data ];

        let collection = mappings[entity] || entity;
        const objectSchema = schema.reduce((acc, item) => {
            if(typeof item === 'object' && item instanceof Array)
                acc[item[0]] = item[1];
            else
                acc[item] = [];
            return acc
        }, {});
        entities = data.reduce((entities, item) => {
            const copy = Object.assign({}, item);
            const id =
                keys[entity] ?
                    typeof keys[entity] === 'function' ?
                        keys[entity](item) :
                    item[keys[entity]] :
                item.id;
            Object.entries(objectSchema).forEach(([ innerEntity, innerSchema ]) => {
                let entityValue = copy[innerEntity];
                if(!entityValue)
                    return
                let innerKeyId = keys[innerEntity] || 'id';
                entities = normaliz(entityValue,{
                    entity: innerEntity,
                    schema: innerSchema,
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

    function denormaliz (entity, {
        entities,
        schema,
        mappings = {}, 
        keys = {}
    } = {}, data = {}) {
        if(!entity)
            return data
        if(typeof schema !== 'object' || !(schema instanceof Array))
            throw new Error('Invalid schema - expecting an array. Got: ' + schema)

        const copy = Object.assign({}, entity);
        const objectSchema = schema.reduce((acc, item) => {
            if(typeof item === 'object' && item instanceof Array)
                acc[item[0]] = item[1];
            else
                acc[item] = [];
            return acc
        }, {});
        Object.entries(objectSchema).forEach(([ innerEntity, innerSchema ]) => {
            let entityValue = copy[innerEntity];
            if(!entityValue)
                return
            const collection = innerEntity in mappings ?
                mappings[innerEntity] :
                innerEntity;
            const denormalizeById = id => (
                denormaliz(entities[collection][id], {
                    entities,
                    schema: innerSchema,
                    mappings
                })
            );
            copy[innerEntity] =
                Array.isArray(entityValue) ?
                    copy[innerEntity].map(denormalizeById) :
                    denormalizeById(entityValue);

        });

        return copy
    }

    exports.normaliz = normaliz;
    exports.denormaliz = denormaliz;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
