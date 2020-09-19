import * as O from 'fp-ts/lib/Option'
import { pipe, flow } from 'fp-ts/lib/function'

interface Foo {
    bar: string
}

const foo = {
    bar: 'hello',
} as Foo | undefined

const getBar = ({ bar }) => bar
const getBaz = ({ baz }) => baz

// Nested baz...
console.log(
    pipe(
        { bar: undefined },
        O.fromNullable,
        O.map(({ bar }) =>
            pipe(
                bar,
                O.fromNullable,
                O.map(({ baz }) => baz),
            ),
        ),
    ),
)

// Get rid of nesting with flatten
console.log(
    pipe(
        { bar: undefined },
        O.fromNullable,
        O.map(({ bar }) =>
            pipe(
                bar,
                O.fromNullable,
                O.map(({ baz }) => baz),
            ),
        ),
        O.flatten,
    ),
)

// Achieve flatmap with Chain
console.log(
    pipe({ bar: { baz: 'hello' } }, O.fromNullable, O.map(getBar), O.chain(flow(O.fromNullable, O.map(getBaz)))),
)
