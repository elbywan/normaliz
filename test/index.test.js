import {
  normaliz,
  denormaliz
} from '../src'

describe('normaliz', () => {
  it('should normalize a payload', () => {
    const payload = {
      id: 1,
      title: 'My Item',
      post: {
        id: 4,
        date: '01-01-1970'
      },
      users: [{
        userId: 1,
        name: 'john',
        comments: {
          id: 1,
          sub_id: 2,
          content: 'Blah'
        }
      }, {
        userId: 2,
        name: 'jane',
        comments: [{
          id: 3,
          sub_id: 1,
          content: 'Hello'
        }]
      }],
      nested: {
        posts: {
          id: 5,
          date: '01-02-1970'
        }
      }
    }
    const entities = normaliz(payload, {
      entity: 'items',
      schema: [
        ['post', {
          mapping: 'posts'
        }],
        ['users',
          [
            ['comments', {
              key: comment => comment.id + ' - ' + comment.sub_id
            }]
          ],
          {
            key: 'userId'
          }
        ],
        ['nested',
          ['posts'],
          {
            normalize: false
          }
        ]
      ],
      from: {
        itemsContainer: 'container_1'
      }
    })
    expect(entities).toEqual({
      items: {
        1: {
          id: 1,
          title: 'My Item',
          post: 4,
          users: [1, 2],
          nested: {
            posts: 5
          }
        }
      },
      users: {
        1: {
          userId: 1,
          name: 'john',
          comments: '1 - 2'
        },
        2: {
          userId: 2,
          name: 'jane',
          comments: ['3 - 1']
        }
      },
      posts: {
        4: {
          id: 4,
          date: '01-01-1970'
        },
        5: {
          id: 5,
          date: '01-02-1970'
        }
      },
      comments: {
        '1 - 2': {
          id: 1,
          sub_id: 2,
          content: 'Blah'
        },
        '3 - 1': {
          id: 3,
          sub_id: 1,
          content: 'Hello'
        }
      },
      itemsContainer: {
        container_1: {
          items: 1
        }
      },
    })
  })

  it('should normalize a payload that includes an array with a from option', () => {
    const payload = [{
        id: 1,
        field: 'value 1'
      },
      {
        id: 2,
        field: 'value 2',
        refs: [{
          id: 'a'
        }, {
          id: 'b'
        }]
      }
    ]

    const options = {
      entity: 'subitems',
      from: {
        'items': 1
      },
      schema: ['refs']
    }
    const entities = normaliz(payload, options)
    expect(entities).toEqual({
      items: {
        1: {
          subitems: [1, 2]
        }
      },
      subitems: {
        1: {
          id: 1,
          field: 'value 1'
        },
        2: {
          id: 2,
          field: 'value 2',
          refs: ['a', 'b']
        }
      },
      refs: {
        a: {
          id: 'a'
        },
        b: {
          id: 'b'
        }
      }
    })
  })

  it('should return the data argument itself if falsey', () => {
    expect(normaliz(null)).toBe(null)
  })

  it('should throw if the schema is not an array', () => {
    expect(() => normaliz({}, {
      schema: null
    })).toThrow()
  })

  it('should throw if the entity is not a string', () => {
    expect(() => normaliz({}, {
      schema: [],
      entity: null
    })).toThrow()
  })
})

describe('denormaliz', () => {
  it('should denormalize data back to its original shape', () => {
    const entities = {
      items: {
        1: {
          id: 1,
          title: 'My Item',
          post: 4,
          users: [1, 2],
          nested: {
            posts: 5
          }
        }
      },
      users: {
        1: {
          userId: 1,
          name: 'john'
        },
        2: {
          userId: 2,
          name: 'jane',
          comments: ['3 - 1']
        }
      },
      posts: {
        4: {
          id: 4,
          date: '01-01-1970'
        },
        5: {
          id: 5,
          date: '01-02-1970'
        }
      },
      comments: {
        '3 - 1': {
          id: 3,
          sub_id: 1,
          content: 'Hello'
        }
      },
      itemsContainer: {
        container_1: {
          items: 1
        }
      },
    }
    const item = denormaliz(entities.items[1], {
      entities,
      schema: [
        ['post', {
          mapping: 'posts'
        }],
        ['users', ['comments']],
        ['nested', ['posts'], {
          normalize: false
        }]
      ],
      mappings: {
        post: 'posts'
      }
    })
    expect(item).toEqual({
      id: 1,
      title: 'My Item',
      post: {
        id: 4,
        date: '01-01-1970'
      },
      users: [{
        userId: 1,
        name: 'john'
      }, {
        userId: 2,
        name: 'jane',
        comments: [{
          id: 3,
          sub_id: 1,
          content: 'Hello'
        }]
      }],
      nested: {
        posts: {
          id: 5,
          date: '01-02-1970'
        }
      }
    })
  })

  it('should return the data argument itself if falsey', () => {
    expect(denormaliz(null)).toBe(null)
  })

  it('should throw if the schema is not an array', () => {
    expect(() => denormaliz({}, {
      schema: null
    })).toThrow()
  })
})