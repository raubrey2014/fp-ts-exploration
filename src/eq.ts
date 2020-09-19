/**
 * Eq represents a type class that "admits" equality
 *
 * A type class is defined by a set of functions, constants
 * and the types involved in those functions and constants that
 * enumerate everything that must be a part of a type of that
 * class.
 *
 * That is abstract, but it is brought to life concretely in the
 * form of a typescript interface.
 *
 * interface Blah {
 *  complain: () => string
 *  name: string
 * }
 *
 * This says, for anything to be a Blah, it needs to have these
 * two pieces, a 'complain' function that returns a string
 * and a name, of type string.
 */

import { Eq, getStructEq, contramap } from 'fp-ts/lib/Eq'
import { getEq } from 'fp-ts/lib/Array'

/**
 * So what does the Eq interface say?
 *
 * interface Eq<T> {
 *  readonly equals: (x: T, y: T) => boolean
 * }
 *
 * It says, you can be part of the class
 * E, if you have at least the single member of equals
 *
 * Below is an instantiation of Eq<number>
 *
 * The instantiation below in eqNumber is an arbitrary equality
 * operator, but it illuminates the concept.
 */

const eqNumber: Eq<number> = {
    equals: (x, y) => x === y,
}

/**
 * We can use the Eq type to define more complex functions
 * that take an instance of the Eq type class as an argument
 * and use its equals method to do some work..
 */

function elem<A>(E: Eq<A>): (a: A, list: A[]) => boolean {
    return (a: A, list: A[]): boolean => list.some((x) => E.equals(x, a))
}

elem(eqNumber)(11, [1, 2, 3, 4])
elem(eqNumber)(2, [1, 2, 3, 4])

/**
 * We can do some more complex equality checks,
 * and can use a utility function from fp-ts
 */

interface Point {
    x: number
    y: number
}

const eqPoint: Eq<Point> = getStructEq({
    x: eqNumber,
    y: eqNumber,
})

const eqArrayOfPoint: Eq<Array<Point>> = getEq(eqPoint)

elem(eqArrayOfPoint)(
    [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
    ],
    [
        [
            { x: 2, y: 2 }, // order matters! this will not be found
            { x: 1, y: 1 },
            { x: 3, y: 3 },
        ],
        [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ],
    ],
)

/**
 * With the help of a concept/funtion known as contramap,
 * we can use reduce or simplify a complex type B to a type
 * that we have an equality operator, A.
 */

interface User {
    id: number
    name: string
}

const eqUser: Eq<User> = contramap((u: User) => u.id)(eqNumber)

console.log(eqUser.equals({ id: 123, name: 'Ryan' }, { id: 234, name: 'Ryan' }))
