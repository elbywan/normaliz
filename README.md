# normaliz

#### A tiny library that normalizes data according to a schema.

```js

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

const options = {
    // Required fields
    entity: 'items',
    schema: {
        // An 'item' includes:
        post: {}, // - a post
        users: {  // - some users
            // An 'item.user' includes:
            comments: {} // - some comments
        }
    },
    // Optional fields
    mappings: {
        // The 'items.post' field refers to the 'posts' entity
        post: 'posts'
    },
    keys: {
        // The 'users' entity has an id field named 'userId'
        users: 'userId',
        // Custom id for comments
        comments: comment => comment.id + ' - ' + comment.sub_id
    }
}

const entities = normaliz(payload, options)

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
    }
}
```