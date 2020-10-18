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
    acc[item] = [
      []
    ]
  }
  return acc
}, {})

export function normaliz(data, {
  entity,
  from,
  schema,
  options = {}
} = {}, entities = {}, clone = true) {
  if (!data)
    return data
  if (clone)
    data = JSON.parse(JSON.stringify(data))
  if (!(schema instanceof Array))
    throw new Error('Invalid schema - expecting an array. Got: ' + schema)
  if (typeof entity !== 'string')
    throw new Error('Invalid entity - expecting a string. Got: ' + entity)

  const dataIsArray = Array.isArray(data)
  if (!dataIsArray)
    data = [data]

  const collection = options.mapping || entity

  entities = data.reduce((entities, item) => {
    const id =
      options.key ?
      typeof options.key === 'function' ?
      options.key(item) :
      item[options.key] :
      item.id

    Object.entries(objectifySchema(schema)).forEach(([innerEntity, [innerSchema, innerOptions = {}]]) => {
      let entityValue = item[innerEntity]
      if (!entityValue)
        return
      let innerKeyId = innerOptions.key || 'id'
      entities = normaliz(entityValue, {
        entity: innerEntity,
        schema: innerSchema,
        options: innerOptions,
      }, entities, false)
      if (!(innerOptions.normalize === false)) {
        if (Array.isArray(entityValue)) {
          item[innerEntity] = entityValue.map(v =>
            typeof innerKeyId === 'function' ? innerKeyId(v) : v[innerKeyId]
          )
        } else {
          item[innerEntity] =
            typeof innerKeyId === 'function' ? innerKeyId(entityValue) : entityValue[innerKeyId]
        }
      } else {
        item[innerEntity] = entityValue
      }
    })

    if (!(options.normalize === false)) {
      if (!entities[collection])
        entities[collection] = {}
      entities[collection][id] = item
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

  Object.entries(objectifySchema(schema)).forEach(([innerEntity, [innerSchema, innerOptions = {}]]) => {
    let entityValue = entity[innerEntity]
    if (!entityValue)
      return

    const collection = innerOptions.mapping || innerEntity
    const dontNormalize = innerOptions.normalize === false

    const denormalize = entity => (
      denormaliz(entity, {
        entities,
        schema: innerSchema,
        options: innerOptions
      })
    )

    entity[innerEntity] =
      Array.isArray(entityValue) ?
      entity[innerEntity].map(value => denormalize(dontNormalize ? value : entities[collection][value])) :
      denormalize(dontNormalize ? entityValue : entities[collection][entityValue])
  })

  return JSON.parse(JSON.stringify(entity))
}