import { act, renderHook } from '@testing-library/react-hooks';

import { useColor } from './useColor';

describe('When RGB object is given', () => {
  // given
  const colorInput = { r: 34, g: 114, b: 235, a: 1 }

  // when
  const { result } = renderHook(() => useColor(colorInput))
  const color = result.current[0]!

  it('Parse RGB/RGBA object', () => {
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
  // given
  const colorInput = { r: 34, g: 114, b: 235, a: 0.8 }

  // when
  const { result } = renderHook(() => useColor(colorInput))
  const color = result.current[0]!

  it('Parse RGB/RGBA object', () => {
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
