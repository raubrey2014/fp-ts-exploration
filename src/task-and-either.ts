import * as Password from './password'
import { flow, pipe } from 'fp-ts/lib/function'
import * as T from 'fp-ts/lib/Task'
import * as E from 'fp-ts/lib/Either'

async function someTask(id: string): Promise<void> {
    console.log('Some task:', id)
}

const id = 'abc'
const task: T.Task<void> = () => someTask(id)

task()

/**
 * Remove the ambiguity of a task that cannot fail
 * by using Task instead of Promise
 */

const boolTask: T.Task<boolean> = async () => {
    try {
        await someTask('1234')
        return true
    } catch (e) {
        return false
    }
}

boolTask()

const pipeline = flow(
    Password.of,
    Password.validate({ minLength: 8, capitalLetterRequired: true }),
    E.chain(Password.hash((value) => E.right(`HASH${value}HASH`))),
)

console.log(
    pipe(
        '23456',
        pipeline,
        E.mapLeft((e) => e.message),
    ),
)
