# normaliz

[![Npm](https://img.shields.io/npm/v/normaliz.svg)](https://www.npmjs.com/package/normaliz)
[![Build Status](https://travis-ci.org/elbywan/normaliz.svg?branch=master)](https://travis-ci.org/elbywan/normaliz)
[![Coverage Status](https://coveralls.io/repos/github/elbywan/normaliz/badge.svg?branch=master)](https://coveralls.io/github/elbywan/normaliz?branch=master)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/normaliz)](https://bundlephobia.com/result?p=normaliz)

## A tiny library that normalizes data according to a schema.

**Inspired by [normalizr](https://github.com/paularmstrong/normalizr) which is a great library. I just needed something more intuitive and lightweight.**

### Features

- 💸 **Lightweight** (~ 800 bytes minzipped)

- 💪 **Simple but powerful and intuitive API**

- ✅ **Battle tested**

### Setup

`npm i normaliz`

### Usage

```js
import { normaliz, denormaliz } from 'normaliz'

const payload = {
  id: 1,
  title: 'My Item',
  post: { id: 4, date: '01-01-1970' },
  users: [
    {
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
    }
  ]
}
// Note: payload can also be an array of items.

const entities = normaliz(payload, {
  entity: 'items',
  schema: [
    // An 'item' contains:
    // - a post, stored under the 'posts' key…
    ['post', { mapping: 'posts' }]
    // - and a list of users.
    [ 'users',
      [
        // An 'item.user' contains a list of comments.
        // A comment has a custom id value made with the concatenation of the  'id' and the 'sub_id' fields.
        [ 'comments', { key: comment => comment.id + ' - ' + comment.sub_id } ]
      ],
      // Use the 'userId' field as the key instead of the default ('id' field).
      { key: 'userId' }
    ]
  ],
  // If the payload belongs to an existing entity pointed out by its id
  from: {
    itemsContainer: 'container_1'
  }
})

// Normalized entities:

{
  items : {
    1: {
      id: 1,
      title: 'My Item',
      post: 4,
      users: [ 1, 2 ]
    }
  },
  users: {
    1: { userId: 1, name: 'john' },
    2: { userId: 2, name: 'jane', comments: [ '3 - 1' ] }
  },
  posts: {
    4: { id: 4, date: '01-01-1970' }
  },
  comments: {
    '3 - 1': { id: 3, sub_id: 1, content: 'Hello' }
  },
  itemsContainer: {
    container_1: {
      items: 1
    }
  },
}

// De-normalize an entity
const originalData = denormaliz(entities.items[1], {
  entities,
  schema: [
    [ 'post', { mapping: 'posts' }],
    [ 'users', [ 'comments' ]]
  ]
})
```
