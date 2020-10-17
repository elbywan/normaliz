const objectifySchema = schema => schema.reduce((acc, item) => {
  if (item instanceof Array) {
    if (item[1] instanceof Array) {
      acc[item[0]] = [item[1], item[2]]
    } else {
      acc[item[0]] = [
        [], item[1]
      ]
    }
  } else {
    acc[item] = [[]]
  }
  return acc
}, {})


export function normaliz(data, {
  entity,
  from,
  schema,
  options = {}
} = {}, entities = {}) {
  if (!data)
    return data
  if (!(schema instanceof Array))
    throw new Error('Invalid schema - expecting an array. Got: ' + schema)
  if (typeof entity !== 'string')
    throw new Error('Invalid entity - expecting a string. Got: ' + entity)

  const dataIsArray = Array.isArray(data)
  if (!dataIsArray)
    data = [data]

  const collection = options.mapping || entity

  entities = data.reduce((entities, item) => {
    const copy = Object.assign({}, item)
    const id =
      options.key ?
      typeof options.key === 'function' ?
      options.key(item) :
      item[options.key] :
      item.id
    Object.entries(objectifySchema(schema)).forEach(([innerEntity, [innerSchema, innerOptions = {}]]) => {
      let entityValue = copy[innerEntity]
      if (!entityValue)
        return
      let innerKeyId = innerOptions.key || 'id'
      entities = normaliz(entityValue, {
        entity: innerEntity,
        schema: innerSchema,
        options: innerOptions
      }, entities)
      if (Array.isArray(entityValue)) {
        copy[innerEntity] = entityValue.map(v =>
          typeof innerKeyId === 'function' ? innerKeyId(v) : v[innerKeyId]
        )
      } else {
        copy[innerEntity] =
          typeof innerKeyId === 'function' ? innerKeyId(entityValue) : entityValue[innerKeyId]
      }
    })
    if (!entities[collection])
      entities[collection] = {}
    entities[collection][id] = copy
    if (from) {
      Object.entries(from).forEach(([fromEntity, fromId]) => {
        if (!entities[fromEntity])
          entities[fromEntity] = {}
        if (!entities[fromEntity][fromId])
          entities[fromEntity][fromId] = {}
        if (dataIsArray) {
          if (!entities[fromEntity][fromId][collection])
            entities[fromEntity][fromId][collection] = []
          entities[fromEntity][fromId][collection].push(id)
        } else {
          entities[fromEntity][fromId][collection] = id
        }
      })
    }
    return entities
  }, entities)

  return entities
}

export function denormaliz(entity, {
  entities,
  schema,
  options = {}
} = {}, data = {}) {
  if (!entity)
    return entity
  if (!(schema instanceof Array))
    throw new Error('Invalid schema - expecting an array. Got: ' + schema)

  const copy = Object.assign({}, entity)

  Object.entries(objectifySchema(schema)).forEach(([innerEntity, [innerSchema, innerOptions = {}]]) => {
    let entityValue = copy[innerEntity]
    if (!entityValue)
      return
    const collection = innerOptions.mapping || innerEntity

    const denormalizeById = id => (
      denormaliz(entities[collection][id], {
        entities,
        schema: innerSchema,
        options: innerOptions
      })
    )
    copy[innerEntity] =
      Array.isArray(entityValue) ?
      copy[innerEntity].map(denormalizeById) :
      denormalizeById(entityValue)

  })

  return copy
}