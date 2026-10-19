/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fromSpringPage } from './page.ts'

test('fromSpringPage: map content và đưa số phân trang vào page', () => {
  const result = fromSpringPage(
    { content: [1, 2], number: 1, size: 2, totalElements: 5, totalPages: 3 },
    (n: number) => n * 10,
  )
  assert.deepEqual(result, {
    content: [10, 20],
    page: { size: 2, number: 1, totalElements: 5, totalPages: 3 },
  })
})

test('fromSpringPage: trang rỗng', () => {
  const result = fromSpringPage(
    { content: [], number: 0, size: 20, totalElements: 0, totalPages: 0 },
    (n: number) => n,
  )
  assert.deepEqual(result.content, [])
  assert.equal(result.page.totalElements, 0)
})
