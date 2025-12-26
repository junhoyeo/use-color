import { bench, describe } from 'vitest'
import { parseColor, parseHex, parseHsl, parseRgb } from '../src/parse/index.js'

describe('Parsing performance', () => {
  describe('Hex parsing', () => {
    bench('parseHex - 6 digit', () => {
      parseHex('#ff0000')
    })

    bench('parseHex - 3 digit', () => {
      parseHex('#f00')
    })

    bench('parseHex - 8 digit with alpha', () => {
      parseHex('#ff000080')
    })
  })

  describe('RGB parsing', () => {
    bench('parseRgb - legacy format', () => {
      parseRgb('rgb(255, 0, 0)')
    })

    bench('parseRgb - modern CSS4', () => {
      parseRgb('rgb(255 0 0)')
    })

    bench('parseRgb - with alpha', () => {
      parseRgb('rgba(255, 0, 0, 0.5)')
    })
  })

  describe('HSL parsing', () => {
    bench('parseHsl - legacy format', () => {
      parseHsl('hsl(0, 100%, 50%)')
    })

    bench('parseHsl - modern CSS4', () => {
      parseHsl('hsl(0 100% 50%)')
    })
  })

  describe('Unified parsing', () => {
    bench('parseColor - hex', () => {
      parseColor('#ff0000')
    })

    bench('parseColor - rgb', () => {
      parseColor('rgb(255, 0, 0)')
    })

    bench('parseColor - named', () => {
      parseColor('red')
    })
  })
})
