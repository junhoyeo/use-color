import { renderHook } from '@testing-library/react-hooks';

import { ColorInput } from './types/ColorInput';
import { useColor } from './useColor';

const toColorInput = <T extends string>(value: ColorInput<T>) => value

describe('RGB string', () => {
  describe.each([
    toColorInput('rgb(34,114,235)'),
    toColorInput('rgb(34,114, 235)'),
    toColorInput('rgb(34, 114,235)'),
    toColorInput('rgb(34, 114, 235)'),
  ])('When RGB string is given', (colorInput) => {
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

  it('Each value cannot be greater than the maximum', () => {
    const { result } = renderHook(() => useColor('rgb(0, 0, 260)'))
    const color = result.current[0]!

    expect(color.rgb).toEqual({ r: 0, g: 0, b: 255 })
    expect(color.rgba).toEqual({ r: 0, g: 0, b: 255, a: 1 })
    expect(color.strings.hex).toEqual('#0000ff')
  })

  it('Each value cannot be less than the minimum value', () => {
    const { result } = renderHook(() => useColor('rgb(-2, 0, 255)'))
    const color = result.current[0]!

    expect(color.rgb).toEqual({ r: 0, g: 0, b: 255 })
    expect(color.rgba).toEqual({ r: 0, g: 0, b: 255, a: 1 })
    expect(color.strings.hex).toEqual('#0000ff')
  })
})

describe('RGBA string', () => {
  describe.each([
    toColorInput('rgba(34,114,235,0.8)'),
    toColorInput('rgba(34,114, 235,0.8)'),
    toColorInput('rgba(34, 114,235, 0.80)'),
    toColorInput('rgba(34, 114, 235, 0.8)'),
  ])('When RGBA string is given', (colorInput) => {
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

  it('Each value cannot be greater than the maximum', () => {
    const { result } = renderHook(() => useColor('rgba(0, 0, 260, 2)'))
    const color = result.current[0]!

    expect(color.rgb).toEqual({ r: 0, g: 0, b: 255 })
    expect(color.rgba).toEqual({ r: 0, g: 0, b: 255, a: 1 })
    expect(color.strings.hex).toEqual('#0000ff')
  })

  it('Each value cannot be less than the minimum value', () => {
    const { result } = renderHook(() => useColor('rgba(-2, 0, 255, -1)'))
    const color = result.current[0]!

    expect(color.rgb).toEqual({ r: 0, g: 0, b: 255 })
    expect(color.rgba).toEqual({ r: 0, g: 0, b: 255, a: 0 })
    expect(color.strings.hex).toEqual('#0000ff00')
  })
})

describe('Hex string', () => {
  describe('When 3-digit Hex string is given', () => {
    // given
    const colorInput = '#ffa'

    // when
    const { result } = renderHook(() => useColor(colorInput))
    const color = result.current[0]!

    it('Parse RGB/RGBA object', () => {
      expect(color.rgb).toEqual({ r: 255, g: 255, b: 170 })
      expect(color.rgba).toEqual({ r: 255, g: 255, b: 170, a: 1 })
    })

    it('Stringifies to Hex string', () => {
      expect(color.strings.hex).toEqual('#ffffaa')
    })

    it('Stringifies to RGB/RGBA string', () => {
      expect(color.strings.rgb).toEqual('rgb(255, 255, 170)')
      expect(color.strings.rgba).toEqual('rgba(255, 255, 170, 1)')
    })
  })

  describe('When 4-digit Hex string is given', () => {
    // given
    const colorInput = '#f3af'

    // when
    const { result } = renderHook(() => useColor(colorInput))
    const color = result.current[0]!

    it('Parse RGB/RGBA object', () => {
      expect(color.rgb).toEqual({ r: 255, g: 51, b: 170 })
      expect(color.rgba).toEqual({ r: 255, g: 51, b: 170, a: 1 })
    })

    it('Stringifies to Hex string', () => {
      expect(color.strings.hex).toEqual('#ff33aa')
    })

    it('Stringifies to RGB/RGBA string', () => {
      expect(color.strings.rgb).toEqual('rgb(255, 51, 170)')
      expect(color.strings.rgba).toEqual('rgba(255, 51, 170, 1)')
    })
  })

  describe('When 6-digit Hex string is given', () => {
    // given
    const colorInput = '#ffaafa'

    // when
    const { result } = renderHook(() => useColor(colorInput))
    const color = result.current[0]!

    it('Parse RGB/RGBA object', () => {
      expect(color.rgb).toEqual({ r: 255, g: 170, b: 250 })
      expect(color.rgba).toEqual({ r: 255, g: 170, b: 250, a: 1 })
    })

    it('Stringifies to Hex string', () => {
      expect(color.strings.hex).toEqual('#ffaafa')
    })

    it('Stringifies to RGB/RGBA string', () => {
      expect(color.strings.rgb).toEqual('rgb(255, 170, 250)')
      expect(color.strings.rgba).toEqual('rgba(255, 170, 250, 1)')
    })
  })

  describe('When 8-digit Hex string is given', () => {
    // given
    const colorInput = '#2272eb80'

    // when
    const { result } = renderHook(() => useColor(colorInput))
    const color = result.current[0]!

    it('Parse RGB/RGBA object', () => {
      expect(color.rgb).toEqual({ r: 34, g: 114, b: 235 })
      expect(color.rgba).toEqual({ r: 34, g: 114, b: 235, a: 0.5 })
    })

    it('Stringifies to Hex string', () => {
      expect(color.strings.hex).toEqual('#2272eb7f')
    })

    it('Stringifies to RGB/RGBA string', () => {
      expect(color.strings.rgb).toEqual('rgb(34, 114, 235)')
      expect(color.strings.rgba).toEqual('rgba(34, 114, 235, 0.5)')
    })
  })
})

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
