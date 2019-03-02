const { normaliz, denormaliz } = require('../dist')

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
    const entities = normaliz(payload, {
        entity: 'items',
        schema: [
            'post', [
            'users', [
                'comments'
            ]]
        ],
        mappings: {
            post: 'posts'
        },
        keys: {
            users: 'userId',
            comments: comment => comment.id + ' - ' + comment.sub_id
        },
        from: {
            itemsContainer: 'container_1'
        }
    })
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
        },
        itemsContainer: {
            container_1: {
                items: 1
            }
        },
    })
})

test('normaliz > from with array', () => {
    const payload = [
        { id: 1, field: 'value 1' },
        { id: 2, field: 'value 2', refs: [
            { id: 'a' }, { id: 'b' }
        ]}
    ]

    const options = {
        entity: 'subitems',
        from: {
            'items': 1
        },
        schema: [ 'refs' ]
    }
    const entities = normaliz(payload, options)
    expect(entities).toEqual({
        items: {
            1: {
                subitems: [ 1, 2 ]
            }
        },
        subitems: {
            1: { id: 1, field: 'value 1' },
            2: { id: 2, field: 'value 2', refs: [ 'a', 'b' ] }
        },
        refs: {
            a: { id: 'a'},
            b: { id: 'b'}
        }
    })
})

test('denormaliz', () => {
    const entities = {
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
    const item = denormaliz(entities.items[1], {
        entities,
        schema: [
            'post', [
            'users', [
                'comments'
            ]]
        ],
        mappings: { post: 'posts' }
    })
    expect(item).toEqual({
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
    })
})