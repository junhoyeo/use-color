import { expectTypeOf } from 'expect-type'
import { describe, it } from 'vitest'
import type {
  Digit,
  NumberString,
  RgbaFunctionString,
  RgbFunctionString,
  RgbModernString,
  RgbString,
} from './Rgb.js'

describe('Rgb types', () => {
  it('Digit validates numeric characters', () => {
    expectTypeOf<'0'>().toMatchTypeOf<Digit>()
    expectTypeOf<'5'>().toMatchTypeOf<Digit>()
    expectTypeOf<'9'>().toMatchTypeOf<Digit>()
  })

  it('NumberString validates numeric values', () => {
    expectTypeOf<NumberString<'255'>>().toEqualTypeOf<'255'>()
    expectTypeOf<NumberString<'0.5'>>().toEqualTypeOf<'0.5'>()
    expectTypeOf<NumberString<'100%'>>().toEqualTypeOf<'100%'>()
    expectTypeOf<NumberString<'abc'>>().toEqualTypeOf<never>()
  })

  it('RgbFunctionString validates legacy comma syntax', () => {
    expectTypeOf<RgbFunctionString<'rgb(255, 0, 0)'>>().toEqualTypeOf<'rgb(255, 0, 0)'>()
    expectTypeOf<RgbFunctionString<'rgb(255,0,0)'>>().toEqualTypeOf<'rgb(255,0,0)'>()
    expectTypeOf<RgbFunctionString<'rgb(100%, 0%, 50%)'>>().toEqualTypeOf<'rgb(100%, 0%, 50%)'>()
    expectTypeOf<RgbFunctionString<'rgb(255, 255)'>>().toEqualTypeOf<never>()
    expectTypeOf<RgbFunctionString<'invalid'>>().toEqualTypeOf<never>()
  })

  it('RgbaFunctionString validates rgba syntax', () => {
    expectTypeOf<
      RgbaFunctionString<'rgba(255, 0, 0, 0.5)'>
    >().toEqualTypeOf<'rgba(255, 0, 0, 0.5)'>()
    expectTypeOf<RgbaFunctionString<'rgba(255,0,0,1)'>>().toEqualTypeOf<'rgba(255,0,0,1)'>()
    expectTypeOf<
      RgbaFunctionString<'rgba(100%, 0%, 50%, 50%)'>
    >().toEqualTypeOf<'rgba(100%, 0%, 50%, 50%)'>()
    expectTypeOf<RgbaFunctionString<'rgba(255, 0, 0)'>>().toEqualTypeOf<never>()
  })

  it('RgbModernString validates CSS4 space syntax', () => {
    expectTypeOf<RgbModernString<'rgb(255 0 0)'>>().toEqualTypeOf<'rgb(255 0 0)'>()
    expectTypeOf<RgbModernString<'rgb(255 0 0 / 0.5)'>>().toEqualTypeOf<'rgb(255 0 0 / 0.5)'>()
    expectTypeOf<RgbModernString<'rgb(100% 0% 50%)'>>().toEqualTypeOf<'rgb(100% 0% 50%)'>()
    expectTypeOf<
      RgbModernString<'rgb(100% 0% 50% / 50%)'>
    >().toEqualTypeOf<'rgb(100% 0% 50% / 50%)'>()
    expectTypeOf<RgbModernString<'rgb(255, 0, 0)'>>().toEqualTypeOf<never>()
  })

  it('RgbString validates all RGB formats', () => {
    expectTypeOf<RgbString<'rgb(255, 0, 0)'>>().toEqualTypeOf<'rgb(255, 0, 0)'>()
    expectTypeOf<RgbString<'rgb(255,0,0)'>>().toEqualTypeOf<'rgb(255,0,0)'>()
    expectTypeOf<RgbString<'rgba(255, 0, 0, 0.5)'>>().toEqualTypeOf<'rgba(255, 0, 0, 0.5)'>()
    expectTypeOf<RgbString<'rgb(255 0 0)'>>().toEqualTypeOf<'rgb(255 0 0)'>()
    expectTypeOf<RgbString<'rgb(255 0 0 / 0.5)'>>().toEqualTypeOf<'rgb(255 0 0 / 0.5)'>()
    expectTypeOf<RgbString<'rgb(255, 255)'>>().toEqualTypeOf<never>()
    expectTypeOf<RgbString<'not-a-color'>>().toEqualTypeOf<never>()
  })

  it('Digit rejects non-numeric characters', () => {
    expectTypeOf<'a'>().not.toMatchTypeOf<Digit>()
    expectTypeOf<'z'>().not.toMatchTypeOf<Digit>()
    expectTypeOf<'#'>().not.toMatchTypeOf<Digit>()
    expectTypeOf<'.'>().not.toMatchTypeOf<Digit>()
    expectTypeOf<'%'>().not.toMatchTypeOf<Digit>()
  })

  it('Digit accepts all numeric characters 0-9', () => {
    expectTypeOf<'1'>().toMatchTypeOf<Digit>()
    expectTypeOf<'2'>().toMatchTypeOf<Digit>()
    expectTypeOf<'3'>().toMatchTypeOf<Digit>()
    expectTypeOf<'4'>().toMatchTypeOf<Digit>()
    expectTypeOf<'6'>().toMatchTypeOf<Digit>()
    expectTypeOf<'7'>().toMatchTypeOf<Digit>()
    expectTypeOf<'8'>().toMatchTypeOf<Digit>()
  })

  it('NumberString validates integer values', () => {
    expectTypeOf<NumberString<'0'>>().toEqualTypeOf<'0'>()
    expectTypeOf<NumberString<'1'>>().toEqualTypeOf<'1'>()
    expectTypeOf<NumberString<'128'>>().toEqualTypeOf<'128'>()
    expectTypeOf<NumberString<'999'>>().toEqualTypeOf<'999'>()
  })

  it('NumberString validates decimal values', () => {
    expectTypeOf<NumberString<'0.0'>>().toEqualTypeOf<'0.0'>()
    expectTypeOf<NumberString<'0.1'>>().toEqualTypeOf<'0.1'>()
    expectTypeOf<NumberString<'0.25'>>().toEqualTypeOf<'0.25'>()
    expectTypeOf<NumberString<'1.5'>>().toEqualTypeOf<'1.5'>()
  })

  it('NumberString validates percentage values', () => {
    expectTypeOf<NumberString<'0%'>>().toEqualTypeOf<'0%'>()
    expectTypeOf<NumberString<'50%'>>().toEqualTypeOf<'50%'>()
    expectTypeOf<NumberString<'100%'>>().toEqualTypeOf<'100%'>()
    expectTypeOf<NumberString<'33.33%'>>().toEqualTypeOf<'33.33%'>()
  })

  it('NumberString rejects invalid formats', () => {
    expectTypeOf<NumberString<'abc'>>().toEqualTypeOf<never>()
    expectTypeOf<NumberString<'12px'>>().toEqualTypeOf<never>()
    expectTypeOf<NumberString<''>>().toEqualTypeOf<never>()
  })

  it('RgbFunctionString validates boundary values', () => {
    expectTypeOf<RgbFunctionString<'rgb(0, 0, 0)'>>().toEqualTypeOf<'rgb(0, 0, 0)'>()
    expectTypeOf<RgbFunctionString<'rgb(0,0,0)'>>().toEqualTypeOf<'rgb(0,0,0)'>()
    expectTypeOf<RgbFunctionString<'rgb(255, 255, 255)'>>().toEqualTypeOf<'rgb(255, 255, 255)'>()
    expectTypeOf<RgbFunctionString<'rgb(128, 64, 32)'>>().toEqualTypeOf<'rgb(128, 64, 32)'>()
  })

  it('RgbFunctionString validates percentage syntax', () => {
    expectTypeOf<RgbFunctionString<'rgb(0%, 0%, 0%)'>>().toEqualTypeOf<'rgb(0%, 0%, 0%)'>()
    expectTypeOf<RgbFunctionString<'rgb(100%,100%,100%)'>>().toEqualTypeOf<'rgb(100%,100%,100%)'>()
    expectTypeOf<RgbFunctionString<'rgb(50%, 25%, 75%)'>>().toEqualTypeOf<'rgb(50%, 25%, 75%)'>()
  })

  it('RgbFunctionString rejects invalid formats', () => {
    expectTypeOf<RgbFunctionString<'rgb()'>>().toEqualTypeOf<never>()
    expectTypeOf<RgbFunctionString<'rgb(255)'>>().toEqualTypeOf<never>()
    expectTypeOf<RgbFunctionString<'rgb(255, 0)'>>().toEqualTypeOf<never>()
    expectTypeOf<RgbFunctionString<'rgba(255, 0, 0)'>>().toEqualTypeOf<never>()
  })

  it('RgbaFunctionString validates boundary values', () => {
    expectTypeOf<RgbaFunctionString<'rgba(0, 0, 0, 0)'>>().toEqualTypeOf<'rgba(0, 0, 0, 0)'>()
    expectTypeOf<RgbaFunctionString<'rgba(0,0,0,0)'>>().toEqualTypeOf<'rgba(0,0,0,0)'>()
    expectTypeOf<
      RgbaFunctionString<'rgba(255, 255, 255, 1)'>
    >().toEqualTypeOf<'rgba(255, 255, 255, 1)'>()
    expectTypeOf<
      RgbaFunctionString<'rgba(128, 64, 32, 0.5)'>
    >().toEqualTypeOf<'rgba(128, 64, 32, 0.5)'>()
  })

  it('RgbaFunctionString validates alpha variations', () => {
    expectTypeOf<RgbaFunctionString<'rgba(255, 0, 0, 0)'>>().toEqualTypeOf<'rgba(255, 0, 0, 0)'>()
    expectTypeOf<
      RgbaFunctionString<'rgba(255, 0, 0, 0.25)'>
    >().toEqualTypeOf<'rgba(255, 0, 0, 0.25)'>()
    expectTypeOf<
      RgbaFunctionString<'rgba(255, 0, 0, 0.5)'>
    >().toEqualTypeOf<'rgba(255, 0, 0, 0.5)'>()
    expectTypeOf<
      RgbaFunctionString<'rgba(255, 0, 0, 0.75)'>
    >().toEqualTypeOf<'rgba(255, 0, 0, 0.75)'>()
    expectTypeOf<RgbaFunctionString<'rgba(255, 0, 0, 1)'>>().toEqualTypeOf<'rgba(255, 0, 0, 1)'>()
  })

  it('RgbModernString validates space-separated syntax', () => {
    expectTypeOf<RgbModernString<'rgb(0 0 0)'>>().toEqualTypeOf<'rgb(0 0 0)'>()
    expectTypeOf<RgbModernString<'rgb(255 255 255)'>>().toEqualTypeOf<'rgb(255 255 255)'>()
    expectTypeOf<RgbModernString<'rgb(128 64 32)'>>().toEqualTypeOf<'rgb(128 64 32)'>()
  })

  it('RgbModernString validates alpha with slash syntax', () => {
    expectTypeOf<RgbModernString<'rgb(255 0 0 / 0)'>>().toEqualTypeOf<'rgb(255 0 0 / 0)'>()
    expectTypeOf<RgbModernString<'rgb(255 0 0 / 0.25)'>>().toEqualTypeOf<'rgb(255 0 0 / 0.25)'>()
    expectTypeOf<RgbModernString<'rgb(255 0 0 / 1)'>>().toEqualTypeOf<'rgb(255 0 0 / 1)'>()
    expectTypeOf<RgbModernString<'rgb(255 0 0 / 50%)'>>().toEqualTypeOf<'rgb(255 0 0 / 50%)'>()
  })

  it('RgbModernString validates percentage with alpha', () => {
    expectTypeOf<RgbModernString<'rgb(100% 50% 0%)'>>().toEqualTypeOf<'rgb(100% 50% 0%)'>()
    expectTypeOf<
      RgbModernString<'rgb(100% 50% 0% / 0.5)'>
    >().toEqualTypeOf<'rgb(100% 50% 0% / 0.5)'>()
    expectTypeOf<
      RgbModernString<'rgb(100% 50% 0% / 100%)'>
    >().toEqualTypeOf<'rgb(100% 50% 0% / 100%)'>()
  })

  it('RgbString rejects completely invalid formats', () => {
    expectTypeOf<RgbString<''>>().toEqualTypeOf<never>()
    expectTypeOf<RgbString<'invalid'>>().toEqualTypeOf<never>()
    expectTypeOf<RgbString<'#fff'>>().toEqualTypeOf<never>()
    expectTypeOf<RgbString<'hsl(0, 100%, 50%)'>>().toEqualTypeOf<never>()
  })

  it('RgbString validates complete format coverage', () => {
    expectTypeOf<RgbString<'rgb(0, 0, 0)'>>().toEqualTypeOf<'rgb(0, 0, 0)'>()
    expectTypeOf<RgbString<'rgb(100%, 0%, 0%)'>>().toEqualTypeOf<'rgb(100%, 0%, 0%)'>()
    expectTypeOf<RgbString<'rgba(0, 0, 0, 0)'>>().toEqualTypeOf<'rgba(0, 0, 0, 0)'>()
    expectTypeOf<RgbString<'rgba(255, 255, 255, 1)'>>().toEqualTypeOf<'rgba(255, 255, 255, 1)'>()
    expectTypeOf<RgbString<'rgb(0 0 0)'>>().toEqualTypeOf<'rgb(0 0 0)'>()
    expectTypeOf<RgbString<'rgb(255 255 255 / 1)'>>().toEqualTypeOf<'rgb(255 255 255 / 1)'>()
  })
})
