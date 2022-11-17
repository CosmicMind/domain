/* Copyright (C) 2022, CosmicMind, Inc. <http://cosmicmind.com>. All rights reserved. */

/**
 * @module Entity
 */

import {
  clone,
  guardFor,
  FoundationError,
} from '@cosmicmind/foundation'

export type Entity = Record<string, unknown>

/**
 * The `EntityAttributeKey` defines the allowable keys for
 * a given type `T`.
 */
export type EntityAttributeKey<T> = keyof T extends string | symbol ? keyof T : never

export type EntityAttributeLifecycle<T, V> = {
  validate?(value: Readonly<V>, state: Readonly<T>): boolean | never
  updated?(newValue: Readonly<V>, oldValue: Readonly<V>, state: Readonly<T>): void
  deleted?(value: Readonly<V>, state: Readonly<T>): void
}

/**
 * The `EntityAttributeLifecycleMap` defined the key-value
 * pairs used in handling attribute events.
 */
export type EntityAttributeLifecycleMap<T> = {
  [P in keyof T]?: EntityAttributeLifecycle<T, T[P]>
}

export type EntityLifecycle<T> = {
  trace?(target: Readonly<T>): void
  createdAt?(target: Readonly<T>): void
  updated?(newTarget: Readonly<T>, oldTarget: Readonly<T>): void
  attributes?: EntityAttributeLifecycleMap<T>
}

/**
 * The `EntityError`.
 */
export class EntityError extends FoundationError {}

export const defineEntity = <E extends Entity>(handler: EntityLifecycle<E> = {}): (entity: E) => E =>
  (entity: E): E => createEntity(entity, handler)

/**
 * The `createEntityHandler` prepares the `EntityLifecycle` for
 * the given `handler`.
 */
function createEntityHandler<T extends object>(target: T, handler: EntityLifecycle<T>): ProxyHandler<T> {
  let state = clone(target) as Readonly<T>

  return {
    /**
     * The `set` updates the given attribute with the given value.
     */
    set<A extends EntityAttributeKey<T>, V extends T[A]>(target: T, attr: A, value: V): boolean | never {
      const h = handler.attributes?.[attr]

      if (false === h?.validate?.(value, state)) {
        throw new EntityError(`${String(attr)} is invalid`)
      }

      const oldValue = target[attr]
      const oldTarget = state
      const ret = Reflect.set(target, attr, value)

      state = clone(target) as Readonly<T>

      h?.updated?.(value, oldValue, state)

      handler.updated?.(state, oldTarget)
      handler.trace?.(state)

      return ret
    },
  }
}

/**
 * The `createEntity` creates a new `Proxy` instance with the
 * given `target` and `handler`.
 */
function createEntity<T extends object>(target: T, handler: EntityLifecycle<T> = {}): T | never {
  if (guardFor(target)) {
    const { attributes } = handler

    if (guardFor(attributes)) {
      for (const attr in attributes) {
        if (false === attributes[attr]?.validate?.(target[attr], {} as Readonly<T>)) {
          throw new EntityError(`${String(attr)} is invalid`)
        }
      }
    }

    const state = clone(target) as Readonly<T>
    handler.createdAt?.(state)
    handler.trace?.(state)
  }

  return new Proxy(target, createEntityHandler(target, handler))
}