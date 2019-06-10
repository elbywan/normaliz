# normaliz

### A tiny library that normalizes data according to a schema.

```js

import { normaliz, denormaliz } from 'normaliz'

const payload = {
    id: 1,
    title: 'My Item',
    post: { id: 4, date: '01-01-1970' },
    users: [{
        userId: 1,
        name: 'john'
    }, {
        userId: 2,
        name: 'jane',
        comments: [{
            id: 3,
            sub_id: 1,
            content: 'Hello'
        }]
    }]
}
// Note: payload can also be an array of items.


const entities = normaliz(payload, {
    /* Required fields */
    entity: 'items',
    schema: [
        // An 'item' includes
        // a post
        'post', [
        // a list of users
        'users', [
            // An 'item.user' includes
            // a list of comments
            'comments'
        ]]
    ],
    /* Optional fields */
    mappings: {
        // The 'items.post' field refers to the 'posts' entity
        post: 'posts'
    },
    keys: {
        // The 'users' entity has an id field named 'userId'
        users: 'userId',
        // Custom id for comments
        comments: comment => comment.id + ' - ' + comment.sub_id
    },
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
        1: { userId: 1, name: 'john' },
        2: { userId: 2, name: 'jane', comments: [ '3 - 1' ] }
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
    // Required fields
    entities,
    schema: [
        'post', [
        'users', [
            'comments'
        ]]
    ],
    mappings: { post: 'posts' }
})
```