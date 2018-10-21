const normaliz = require('../dist')

test('normaliz', () => {
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
    const options = {
        entity: 'items',
        schema: {
            post: {},
            users: {
                comments: {}
            }
        },
        mappings: {
            post: 'posts'
        },
        keys: {
            users: 'userId',
            comments: comment => comment.id + ' - ' + comment.sub_id
        }
    }

    const entities = normaliz(payload, options)
    expect(entities).toEqual({
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
    })
})