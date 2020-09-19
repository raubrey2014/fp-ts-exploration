/**
 * The intuition around a semigroup is that they provide a mechanism
 * to "combine", "merge", or "concat" two or several (using fold)
 * data points into one.
 *
 * A semigroup is a pair (A, *) in which A is a
 * non-empty set and * looks like...
 *
 *
 * *: (x: A, y: A) => A
 *
 * Takes two elements of A and returns an element of A.
 *
 * Another key of semigroups is that they are associative.
 * This means that we do not need to worry about the order
 * multiple of the operations that executed, making semigroups
 * naturally capture the essence of parallelizble operations.
 *
 * Think or multiplication, or concatenation of strings (order matter though!
 * so note it this has nothing to do with commutativity), or
 * evaluation of boolean expressions connected with &&.
 *
 * In fp-ts we get another type-class implemented in a ts interface.
 * One member, concat.
 */

import { Semigroup, getStructSemigroup, semigroupAll, getFunctionSemigroup, semigroupAny } from 'fp-ts/lib/Semigroup'

const semigroupProduct: Semigroup<number> = {
    concat: (x, y) => x * y,
}

const semigroupSum: Semigroup<number> = {
    concat: (x, y) => x + y,
}

/**
 * You can build a semigroup instance for type A using an Ord of
 * type A.
 */

import { ordNumber, contramap } from 'fp-ts/lib/Ord'
import { getMeetSemigroup, getJoinSemigroup } from 'fp-ts/lib/Semigroup'

const semigroupMin: Semigroup<number> = getMeetSemigroup(ordNumber)
const semigroupMax: Semigroup<number> = getJoinSemigroup(ordNumber)

semigroupMin.concat(2, 1) // 1
semigroupMax.concat(2, 1) // 2

/**
 * We can have more complex operations with structs
 */
type Point = {
    x: number
    y: number
}

const semigroupPoint: Semigroup<Point> = {
    concat: (p1, p2) => ({
        x: semigroupSum.concat(p1.x, p2.x),
        y: semigroupSum.concat(p1.y, p2.y),
    }),
}

/**
 * Again, fp-ts provides that same boiler plate code
 */

type Vector = {
    from: Point
    to: Point
}

const semigroupVector: Semigroup<Vector> = getStructSemigroup({
    from: semigroupPoint,
    to: semigroupPoint,
})

/**
 * There are even functions that derive a Semigroup instance
 * for functions.
 *
 * This reminds me of "deriving" equality and ord operators through
 * contramap. We mapped to a "simpler" type ultimately to a determining
 * operation.
 *
 * Note, semigroupAll is a boolean semigroup under conjunction, as
 * opposed to under disjunction.
 *
 * So if we have a function (a: A) => S and a semigroup for S, we
 * can derive a semigroup for all A.
 */

/**
 * Presumably this will be used in the following way:
 * "Find a way to convert a point to a boolean and then we
 * can apply this known semigroup we have for booleans"
 */
const semigroupPredicate: Semigroup<(p: Point) => boolean> = getFunctionSemigroup(semigroupAll)<Point>()

/**
 * Now we can do more meaningful things than "turn a Point into a boolean",
 * and "merge" results from real (Point) => boolean functions.
 */

const isPositiveX = (p: Point): boolean => p.x >= 0
const isPositiveY = (p: Point): boolean => p.y >= 0
const isPositiveXY = semigroupPredicate.concat(isPositiveX, isPositiveY)

isPositiveXY({ x: 1, y: 1 }) // true
isPositiveXY({ x: -1, y: 1 }) // false

/**
 * But how will this be useful if we can only operate on two
 * elements?
 *
 * Introduct fold. The fold operation takes a semigroup, initial value,
 * and an array of elements. It applies the semigroup concat against
 * the each element in the array chained with the previous element,
 * starting with the initial value as that first value's previous.
 */

import { fold } from 'fp-ts/lib/Semigroup'
import { getApplySemigroup, some, none } from 'fp-ts/lib/Option'
import { getMonoid } from 'fp-ts/lib/Array'
import { assert } from 'console'

const sum = fold(semigroupSum)

console.log(sum(0, [1, 2, 3, 4]))

console.log(fold(semigroupProduct))

/**
 * Here we continue to combine concepts learned previously,
 * through some what seem like arbitrary examples.
 *
 * Arbitrary task: "merge" multiple Option<A> types
 *
 * Remember, Option<A> = Some<A> | None.
 * So merging might look like...
 * None && None = None
 * None && Some = None
 * Some && None = None
 * Some && Some = ?
 *
 * How to we combine two A and get an A? Or...
 * How to solve (a: A, b: A) => A? That's literally
 * the type definition of a semigroup :)
 */

// getApplySemigroup is a way to apply a semigroup on an Option type
const S = getApplySemigroup(semigroupSum)

// Where normally, we would just apply semigroupSum onto numbers,
// now we can handle Option<number>
S.concat(some(1), some(3)) // 4
S.concat(some(1), none) // none

/**
 * So in culmination, sometimes we may want to "merge" in
 * a more useful case. Say, in the case that we stored
 * duplicate records for a user.
 *
 * Note that this is the first introduction of a moniod,
 * described as a semigroup for array of a type...
 *
 * ???
 * semigroup<number> === monoid<string>
 * ???
 */

interface Customer {
    name: string
    favoriteThings: string[]
    hasMadePurchase: boolean
}
const semigroupCustomer: Semigroup<Customer> = getStructSemigroup({
    // not sure why, but join is "get the longer" in this scenario
    // So, "get the longer", or "use the rsult of the Ord to know"
    // which element to select in the merge
    // We will also use contramap to "reduce" our complex string type
    // to the simpler number type via the length
    name: getJoinSemigroup(contramap((s: string) => s.length)(ordNumber)),
    favoriteThings: getMonoid<string>(),
    hasMadePurchase: semigroupAny,
})

const customer1 = {
    name: 'Ryan',
    favoriteThings: ['coffee'],
    hasMadePurchase: false,
}

const customer2 = {
    name: 'Ryan Aubrey',
    favoriteThings: ['reading'],
    hasMadePurchase: true,
}

const merged = semigroupCustomer.concat(customer1, customer2)
assert(merged.name === 'Ryan Aubrey')
assert(merged.favoriteThings.length === 2)
assert(merged.hasMadePurchase)
console.log('Successfully merged customer: ', merged.name)
