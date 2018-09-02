export default function normaliz (data, {
    schema,
    mappings = {}, 
    keys = {}
} = {}, entities = {}) {
    if(!data)
        return entities
    if(Object.keys(schema).length !== 1) {
        throw new Error('Invalid schema - expecting exactly one root property but got more or 0 instead.\n' + schema.toString())
    }
    if(!Array.isArray(data)) {
        data = [ data ]
    }
    let entity = Object.keys(schema)[0]
    let collection = mappings[entity] || entity
    let innerEntities = Object.keys(schema[entity])
    entities = data.reduce((entities, item) => {
        const copy = Object.assign({}, item)
        const id =
            keys[entity] ?
                typeof keys[entity] === 'function' ?
                    keys[entity](item) :
                item[keys[entity]] :
            item.id
        innerEntities.forEach(innerEntity => {
            let entityValue = copy[innerEntity]
            if(!entityValue)
                return
            let innerKeyId = keys[innerEntity] || 'id'
            entities = normaliz(entityValue,{
                schema: {
                    [innerEntity]: schema[entity][innerEntity]
                },
                mappings,
                keys
            }, entities)
            if(Array.isArray(entityValue)) {
                copy[innerEntity] = entityValue.map(v =>
                    typeof innerKeyId === 'function' ? innerKeyId(v) : v[innerKeyId]
                )
            } else {
                copy[innerEntity] =
                    typeof innerKeyId === 'function' ? innerKeyId(entityValue) : entityValue[innerKeyId]
            }
        })
        if(typeof collection === 'function') {
            collection = mappings[entity](data)
        }
        if(!entities[collection])
            entities[collection] = {}
        entities[collection][id] = copy
        return entities
    }, entities)

    return entities
}