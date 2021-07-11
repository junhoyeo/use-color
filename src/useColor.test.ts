import { act, renderHook } from '@testing-library/react-hooks';

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
    const color = result.current[0]

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
    const color = result.current[0]

    expect(color.rgb).toEqual({ r: 0, g: 0, b: 255 })
    expect(color.rgba).toEqual({ r: 0, g: 0, b: 255, a: 1 })
    expect(color.strings.hex).toEqual('#0000ff')
  })

  it('Each value cannot be less than the minimum value', () => {
    const { result } = renderHook(() => useColor('rgb(-2, 0, 255)'))
    const color = result.current[0]

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
    const color = result.current[0]

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
    const color = result.current[0]

    expect(color.rgb).toEqual({ r: 0, g: 0, b: 255 })
    expect(color.rgba).toEqual({ r: 0, g: 0, b: 255, a: 1 })
    expect(color.strings.hex).toEqual('#0000ff')
  })

  it('Each value cannot be less than the minimum value', () => {
    const { result } = renderHook(() => useColor('rgba(-2, 0, 255, -1)'))
    const color = result.current[0]

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
    const color = result.current[0]

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
    const color = result.current[0]

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
    const color = result.current[0]

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
    const color = result.current[0]

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
  const color = result.current[0]

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
  const color = result.current[0]

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

describe('Stringify Options', () => {
  describe('Hex string', () => {
    describe('transform', () => {
      it('Transform Hex string to lowercase as default', () => {
        const { result } = renderHook(() => useColor('#6AE1E1'))
        const color = result.current[0]

        expect(color?.strings.hex).toEqual('#6ae1e1')
      })

      it('Transform Hex string to uppercase when enabled', () => {
        const { result } = renderHook(() =>
          useColor('#6AE1E1', {
            hex: {
              transform: 'uppercase',
            },
          }),
        )
        const color = result.current[0]

        expect(color?.strings.hex).toEqual('#6AE1E1')
      })
    })

    describe('compress', () => {
      it.each([
        [toColorInput('#000000'), '#000000'],
        [toColorInput('#ffffff'), '#ffffff'],
        [toColorInput('#ff33ff'), '#ff33ff'],
        [toColorInput('#aa3300ff'), '#aa3300'],
        [toColorInput('#ffff0000'), '#ffff0000'],
      ])(
        'Return hex string without compression',
        (givenColor, expectedColor) => {
          // when
          const { result } = renderHook(() => useColor(givenColor))
          const color = result.current[0]

          // then
          expect(color?.strings.hex).toEqual(expectedColor)
        },
      )

      it.each([
        [toColorInput('#000000'), '#000'],
        [toColorInput('#ffffff'), '#fff'],
        [toColorInput('#ff33ff'), '#f3f'],
        [toColorInput('#aa3300ff'), '#a30'],
        [toColorInput('#ffff0000'), '#ff00'],
      ])('Compress hex string when enabled', (givenColor, expectedColor) => {
        // when
        const { result } = renderHook(() =>
          useColor(givenColor, {
            hex: {
              compress: true,
            },
          }),
        )
        const color = result.current[0]

        // then
        expect(color?.strings.hex).toEqual(expectedColor)
      })
    })

    describe('ignoreAlpha', () => {
      it('Hex string includes alpha channel as default if it exists', () => {
        const { result } = renderHook(() => useColor('rgba(34, 114, 235, 0.8)'))
        const color = result.current[0]

        expect(color?.strings.hex).toEqual('#2272ebcc')
      })

      it('Hex string excludes alpha channel when enabled', () => {
        const { result } = renderHook(() =>
          useColor('rgba(34, 114, 235, 0.8)', {
            hex: {
              ignoreAlpha: true,
            },
          }),
        )
        const color = result.current[0]

        expect(color?.strings.hex).toEqual('#2272eb')
      })
    })
  })
})

describe('Set color', () => {
  it('Change color with Hex string', () => {
    // given
    const { result } = renderHook(() => useColor('rgb(255, 0, 80)'))
    const [oldColor, setColor] = result.current

    expect(oldColor.rgb).toEqual({ r: 255, g: 0, b: 80 })
    expect(oldColor.strings.hex).toEqual('#ff0050')

    // when
    act(() => setColor('#00f2ea'))
    const [newColor] = result.current

    // then
    expect(newColor.rgb).toEqual({ r: 0, g: 242, b: 234 })
    expect(newColor.strings.hex).toEqual('#00f2ea')
  })

  it('Change color with RGB string', () => {
    // given
    const { result } = renderHook(() => useColor('#4b917d'))
    const [oldColor, setColor] = result.current

    expect(oldColor.rgb).toEqual({ r: 75, g: 145, b: 125 })
    expect(oldColor.strings.rgb).toEqual('rgb(75, 145, 125)')

    // when
    act(() => setColor('rgb(205, 245, 100)'))
    const [newColor] = result.current

    // then
    expect(newColor.rgb).toEqual({ r: 205, g: 245, b: 100 })
    expect(newColor.strings.hex).toEqual('#cdf564')
  })

  it('Change color with RGBA string', () => {
    // given
    const { result } = renderHook(() => useColor('#4b917dff'))
    const [oldColor, setColor] = result.current

    expect(oldColor.rgba).toEqual({ r: 75, g: 145, b: 125, a: 1 })
    expect(oldColor.strings.rgba).toEqual('rgba(75, 145, 125, 1)')

    // when
    act(() => setColor('rgba(205, 245, 100, 0.8)'))
    const [newColor] = result.current

    // then
    expect(newColor.rgba).toEqual({ r: 205, g: 245, b: 100, a: 0.8 })
    expect(newColor.strings.hex).toEqual('#cdf564cc')
  })

  it.each([
    [{ r: 0, g: 242, b: 234 }, '#00f2ea'],
    [{ r: 0, g: 242, b: 234, a: 0.35 }, '#00f2ea59'],
  ])('Change color with RGB/RGBA object', (givenColor, expectedColor) => {
    // given
    const { result } = renderHook(() => useColor('rgba(255, 0, 80, 1)'))
    const [oldColor, setColor] = result.current

    expect(oldColor.rgba).toEqual({ r: 255, g: 0, b: 80, a: 1 })
    expect(oldColor.strings.hex).toEqual('#ff0050')

    // when
    act(() => setColor(givenColor))
    const [newColor] = result.current

    // then
    expect(newColor.rgb).toEqual({ r: 0, g: 242, b: 234 })
    expect(newColor.strings.hex).toEqual(expectedColor)
  })

  it('Should pass current color when setColor takes a function', () => {
    // given
    const { result } = renderHook(() => useColor({ r: 0, g: 0, b: 0, a: 0 }))
    const [_, setColor] = result.current

    // when
    act(() =>
      setColor((currentColor) => {
        // then
        expect(currentColor).toStrictEqual({ r: 0, g: 0, b: 0, a: 0 })
        return { r: 255, g: 255, b: 255, a: 1 }
      }),
    )

    const [newColor, newSetColor] = result.current
    expect(newColor.rgba).toEqual({ r: 255, g: 255, b: 255, a: 1 })

    act(() =>
      newSetColor((currentColor) => {
        expect(currentColor).toStrictEqual({ r: 255, g: 255, b: 255, a: 1 })
        return { r: 200, g: 200, b: 200, a: 0.5 }
      }),
    )
  })
})

it('Update color', () => {
  // given
  const { result } = renderHook(() => useColor('rgb(34, 114, 235)'))
  const [oldColor, setColor] = result.current

  expect(oldColor.rgb).toEqual({ r: 34, g: 114, b: 235 })
  expect(oldColor.strings.hex).toEqual('#2272eb')

  // when
  act(() => setColor(({ g, b }) => ({ r: 127, g, b })))
  const [newColor] = result.current

  // then
  expect(newColor.rgb).toEqual({ r: 127, g: 114, b: 235 })
  expect(newColor.strings.hex).toEqual('#7f72eb')
})
