/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

import {
it,
expect,
describe
} from 'vitest'

import { guardFor } from '@cosmicmind/foundation'

import {
Entity,
Event,
defineEvent
} from '../../src'

interface User extends Entity {
  name: string
}

const createUserEvent = defineEvent<Event<User>>({
  attributes: {
    id: {
      validate: (value: string): boolean => 2 < value.length,
    },
    correlationId: {
      validate: (value: string): boolean => 2 < value.length,
    },
    createdAt: {
      validate: (value: Date): boolean => value instanceof Date,
    },
    message: {
      validate: (value: User): boolean => guardFor(value),
    },
  },
})

describe('Event', () => {
  it('interface', () => {
    const id = '123'
    const correlationId = '456'
    const createdAt = new Date()
    const message = {
      id,
      createdAt,
      name: 'daniel',
    }

    const e1 = createUserEvent({
      id,
      correlationId,
      createdAt,
      message,
    })

    expect(e1.id).toBe(id)
    expect(e1.correlationId).toBe(correlationId)
    expect(e1.createdAt).toBe(createdAt)
    expect(e1.message).toStrictEqual(message)
  })

  it('EventLifecycle', () => {
    const id = '123'
    const correlationId = '456'
    const createdAt = new Date()
    const message = {
      id,
      createdAt,
      name: 'daniel',
    }

    const createEvent = defineEvent<Event<User>>({
      trace(target: Event<User>) {
        expect(guardFor(target)).toBeTruthy()
      },
      createdAt(target: Event<User>) {
        expect(guardFor(target)).toBeTruthy()
      },
      attributes: {
        id: {
          validate: (value: string): boolean => {
            expect(value).toBe(id)
            return 2 < value.length
          },
        },
        correlationId: {
          validate: (value: string): boolean => {
            expect(value).toBe(correlationId)
            return 2 < value.length
          },
        },
        createdAt: {
          validate: (value: Date): boolean => {
            expect(value).toBe(createdAt)
            return value instanceof Date
          },
        },
        message: {
          validate: (value: User): boolean => {
            expect(guardFor(value)).toBeTruthy()
            return guardFor(value)
          },
        },
      },
    })

    const e1 = createEvent({
      id,
      correlationId,
      createdAt,
      message,
    })

    expect(e1.id).toBe(id)
    expect(e1.correlationId).toBe(correlationId)
    expect(e1.createdAt).toBe(createdAt)
    expect(e1.message).toStrictEqual(message)
  })
})
