import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const config = readFileSync(new URL('../src/data/site.ts', import.meta.url),'utf8')
const schema = readFileSync(new URL('../src/utils/schema.ts', import.meta.url),'utf8')

test('Korat site publishes the actual Ubon storefront schedule, Mon-Sat 09:00-19:00',()=>{
  assert.ok(config.includes('openingHoursText: envOr("PUBLIC_STORE_HOURS_TEXT", "จันทร์–เสาร์ 09:00–19:00")'))
  assert.ok(config.includes('openingHoursSchema: envOr("PUBLIC_STORE_OPENING_HOURS", "Mo-Sa 09:00-19:00")'))
  assert.ok(!config.includes('09:00–21:00'))
  assert.ok(!config.includes('Mo-Su 09:00-21:00'))
})
test('LocalBusiness JSON-LD closing hours and days match visible store hours',()=>{
  assert.ok(schema.includes('openingHours: STORE_LOCATION.openingHoursSchema'))
  const specification=schema.slice(schema.indexOf('openingHoursSpecification: {'))
  assert.ok(specification.includes('closes: "19:00"'))
  assert.ok(specification.includes('"Saturday"'))
  assert.ok(!specification.slice(0,420).includes('"Sunday"'))
  assert.ok(!specification.includes('closes: "21:00"'))
})
test('Korat stays an appointment area, not a fictional branch',()=>{
  assert.match(config,/isPhysicalBranch:\s*false/)
  assert.ok(config.includes('ไม่ใช่สาขาหรือสำนักงานประจำ'))
  assert.ok(config.includes('อุบลราชธานี'))
})
test('Astro generated homepage shows the same hours after build',()=>{
  const file = new URL('../dist/index.html',import.meta.url)
  assert.ok(existsSync(file),'Build dist/index.html before this test')
  const html=readFileSync(file,'utf8')
  assert.ok(html.includes('09:00–19:00'),'Homepage must show store hours')
  assert.ok(html.includes('Mo-Sa 09:00-19:00'),'JSON-LD must include Mon-Sat openingHours')
  assert.ok(!html.includes('Mo-Su 09:00-21:00'),'Never serve stale openingHours in homepage')
})
