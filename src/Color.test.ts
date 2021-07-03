import { Color } from './Color';

describe('When RGB object is given', () => {
  const color = new Color({ r: 34, g: 114, b: 235 })

  it('Compute RGB/RGBA object', () => {
    expect(color.rgb).toEqual({ r: 34, g: 114, b: 235 })
    expect(color.rgba).toEqual({ r: 34, g: 114, b: 235, a: 1 })
  })

  it('Stringifies to Hex string', () => {
    expect(color.strings.hex).toEqual('#2272eb')
  })

  it('Stringifies to RGB/RGBA string', () => {
    expect(color.strings.rgb).toEqual('rgb(34, 114, 235)')
    expect(color.strings.rgba).toEqual('rgba(34, 114, 235, 1)')
  })
})

describe('When RGBA object is given', () => {
  const color = new Color({ r: 34, g: 114, b: 235, a: 0.8 })

  it('Compute RGB/RGBA object', () => {
    expect(color.rgb).toEqual({ r: 34, g: 114, b: 235 })
    expect(color.rgba).toEqual({ r: 34, g: 114, b: 235, a: 0.8 })
  })

  it('Stringifies to Hex string', () => {
    expect(color.strings.hex).toEqual('#2272ebcc')
  })

  it('Stringifies to RGB/RGBA string', () => {
    expect(color.strings.rgb).toEqual('rgb(34, 114, 235)')
    expect(color.strings.rgba).toEqual('rgba(34, 114, 235, 0.8)')
  })
})
