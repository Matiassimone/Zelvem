import { describe, expect, it } from 'vitest'

import { messages } from './messages'

/** Flattens a message tree into sorted dot-paths, so shapes can be compared. */
function shapeOf(tree: object, prefix = ''): string[] {
  return Object.entries(tree)
    .flatMap(([key, value]) =>
      typeof value === 'string'
        ? [`${prefix}${key}`]
        : shapeOf(value as object, `${prefix}${key}.`),
    )
    .sort()
}

describe('i18n messages', () => {
  it('en mirrors the full es key structure — no missing translations', () => {
    expect(shapeOf(messages.en)).toEqual(shapeOf(messages.es))
  })
})
