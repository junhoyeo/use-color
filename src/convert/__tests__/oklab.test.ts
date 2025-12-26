import { describe, expect, it } from 'vitest'
import type { OKLCH, Oklab } from '../../types/color.js'
import { D65 } from '../constants.js'
import { oklabToOklch, oklabToXyz, oklchToOklab, xyzToOklab } from '../oklab.js'
import type { XYZ } from '../xyz.js'

describe('xyzToOklab', () => {
  describe('achromatic colors', () => {
    it('converts D65 white to L=1, a≈0, b≈0', () => {
      const xyz: XYZ = { x: D65.x, y: D65.y, z: D65.z }
      const result = xyzToOklab(xyz)
      expect(result.L).toBeCloseTo(1, 3)
      expect(result.a).toBeCloseTo(0, 3)
      expect(result.b).toBeCloseTo(0, 3)
    })

    it('converts black (0,0,0) to L=0, a=0, b=0', () => {
      const xyz: XYZ = { x: 0, y: 0, z: 0 }
      const result = xyzToOklab(xyz)
      expect(result.L).toBe(0)
      expect(result.a).toBe(0)
      expect(result.b).toBe(0)
    })

    it('converts Y=0.5 gray to L≈0.793', () => {
      const xyz: XYZ = { x: D65.x * 0.5, y: 0.5, z: D65.z * 0.5 }
      const result = xyzToOklab(xyz)
      expect(result.L).toBeCloseTo(0.793, 2)
      expect(result.a).toBeCloseTo(0, 2)
      expect(result.b).toBeCloseTo(0, 2)
    })
  })

  describe('primary sRGB colors in XYZ', () => {
    it('converts sRGB red XYZ to Oklab', () => {
      const xyz: XYZ = { x: 0.4124564, y: 0.2126729, z: 0.0193339 }
      const result = xyzToOklab(xyz)
      expect(result.L).toBeCloseTo(0.628, 2)
      expect(result.a).toBeGreaterThan(0)
      expect(result.b).toBeGreaterThan(0)
    })

    it('converts sRGB green XYZ to Oklab', () => {
      const xyz: XYZ = { x: 0.3575761, y: 0.7151522, z: 0.119192 }
      const result = xyzToOklab(xyz)
      expect(result.L).toBeCloseTo(0.866, 2)
      expect(result.a).toBeLessThan(0)
      expect(result.b).toBeGreaterThan(0)
    })

    it('converts sRGB blue XYZ to Oklab', () => {
      const xyz: XYZ = { x: 0.1804375, y: 0.072175, z: 0.9505494 }
      const result = xyzToOklab(xyz)
      expect(result.L).toBeCloseTo(0.452, 2)
      expect(result.a).toBeLessThan(0)
      expect(result.b).toBeLessThan(0)
    })
  })

  describe('mathematical properties', () => {
    it('lightness increases monotonically with Y', () => {
      const y1 = xyzToOklab({ x: 0, y: 0.25, z: 0 })
      const y2 = xyzToOklab({ x: 0, y: 0.5, z: 0 })
      const y3 = xyzToOklab({ x: 0, y: 0.75, z: 0 })
      const y4 = xyzToOklab({ x: 0, y: 1.0, z: 0 })
      expect(y1.L).toBeLessThan(y2.L)
      expect(y2.L).toBeLessThan(y3.L)
      expect(y3.L).toBeLessThan(y4.L)
    })
  })
})

describe('oklabToXyz', () => {
  describe('achromatic colors', () => {
    it('converts L=1, a=0, b=0 to D65 white', () => {
      const lab: Oklab = { L: 1, a: 0, b: 0 }
      const result = oklabToXyz(lab)
      expect(result.x).toBeCloseTo(D65.x, 3)
      expect(result.y).toBeCloseTo(D65.y, 3)
      expect(result.z).toBeCloseTo(D65.z, 2)
    })

    it('converts L=0, a=0, b=0 to black', () => {
      const lab: Oklab = { L: 0, a: 0, b: 0 }
      const result = oklabToXyz(lab)
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
      expect(result.z).toBe(0)
    })

    it('converts mid-gray to correct XYZ', () => {
      const lab: Oklab = { L: 0.5, a: 0, b: 0 }
      const result = oklabToXyz(lab)
      expect(result.y).toBeCloseTo(0.125, 2)
    })
  })

  describe('chromatic colors', () => {
    it('converts Oklab red-ish to XYZ', () => {
      const lab: Oklab = { L: 0.628, a: 0.225, b: 0.126 }
      const result = oklabToXyz(lab)
      expect(result.x).toBeGreaterThan(0)
      expect(result.y).toBeGreaterThan(0)
      expect(result.z).toBeGreaterThan(0)
      expect(result.x).toBeGreaterThan(result.y)
    })

    it('converts Oklab blue-ish to XYZ', () => {
      const lab: Oklab = { L: 0.452, a: -0.032, b: -0.312 }
      const result = oklabToXyz(lab)
      expect(result.z).toBeGreaterThan(result.x)
      expect(result.z).toBeGreaterThan(result.y)
    })
  })
})

describe('XYZ ↔ Oklab round-trip conversion', () => {
  const xyzCases: Array<{ name: string; xyz: XYZ }> = [
    { name: 'black', xyz: { x: 0, y: 0, z: 0 } },
    { name: 'D65 white', xyz: { x: D65.x, y: D65.y, z: D65.z } },
    { name: 'sRGB red', xyz: { x: 0.4124564, y: 0.2126729, z: 0.0193339 } },
    { name: 'sRGB green', xyz: { x: 0.3575761, y: 0.7151522, z: 0.119192 } },
    { name: 'sRGB blue', xyz: { x: 0.1804375, y: 0.072175, z: 0.9505494 } },
    { name: 'sRGB yellow', xyz: { x: 0.7700325, y: 0.9278251, z: 0.1385259 } },
    { name: 'sRGB cyan', xyz: { x: 0.5380136, y: 0.7873272, z: 1.0697414 } },
    { name: 'sRGB magenta', xyz: { x: 0.5928939, y: 0.2848479, z: 0.9698833 } },
  ]

  it.each(xyzCases)('XYZ → Oklab → XYZ preserves $name', ({ xyz }) => {
    const lab = xyzToOklab(xyz)
    const result = oklabToXyz(lab)

    if (xyz.x === 0 && xyz.y === 0 && xyz.z === 0) {
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
      expect(result.z).toBe(0)
    } else {
      expect(result.x).toBeCloseTo(xyz.x, 6)
      expect(result.y).toBeCloseTo(xyz.y, 6)
      expect(result.z).toBeCloseTo(xyz.z, 6)
    }
  })

  const oklabCases: Array<{ name: string; lab: Oklab }> = [
    { name: 'black', lab: { L: 0, a: 0, b: 0 } },
    { name: 'white', lab: { L: 1, a: 0, b: 0 } },
    { name: 'mid-gray', lab: { L: 0.5, a: 0, b: 0 } },
    { name: 'red-ish', lab: { L: 0.628, a: 0.225, b: 0.126 } },
    { name: 'green-ish', lab: { L: 0.866, a: -0.234, b: 0.179 } },
    { name: 'blue-ish', lab: { L: 0.452, a: -0.032, b: -0.312 } },
    { name: 'high chroma', lab: { L: 0.5, a: 0.3, b: -0.2 } },
  ]

  it.each(oklabCases)('Oklab → XYZ → Oklab preserves $name', ({ lab }) => {
    const xyz = oklabToXyz(lab)
    const result = xyzToOklab(xyz)

    if (lab.L === 0) {
      expect(result.L).toBe(0)
      expect(result.a).toBe(0)
      expect(result.b).toBe(0)
    } else {
      expect(result.L).toBeCloseTo(lab.L, 6)
      expect(result.a).toBeCloseTo(lab.a, 6)
      expect(result.b).toBeCloseTo(lab.b, 6)
    }
  })
})

describe('oklabToOklch', () => {
  describe('primary hue colors', () => {
    it('converts red-ish Oklab (positive a, positive b)', () => {
      const lab: Oklab = { L: 0.628, a: 0.225, b: 0.126 }
      const result = oklabToOklch(lab)
      expect(result.l).toBe(0.628)
      expect(result.c).toBeCloseTo(0.258, 3)
      expect(result.h).toBeCloseTo(29.25, 1)
      expect(result.a).toBe(1)
    })

    it('converts green-ish Oklab (negative a, positive b)', () => {
      const lab: Oklab = { L: 0.866, a: -0.234, b: 0.179 }
      const result = oklabToOklch(lab)
      expect(result.l).toBe(0.866)
      expect(result.c).toBeCloseTo(0.295, 3)
      expect(result.h).toBeCloseTo(142.6, 1)
      expect(result.a).toBe(1)
    })

    it('converts blue-ish Oklab (negative a, negative b)', () => {
      const lab: Oklab = { L: 0.452, a: -0.032, b: -0.312 }
      const result = oklabToOklch(lab)
      expect(result.l).toBe(0.452)
      expect(result.c).toBeCloseTo(0.314, 3)
      expect(result.h).toBeCloseTo(264.1, 1)
      expect(result.a).toBe(1)
    })

    it('converts yellow-ish Oklab (positive a, negative b becomes wrapped)', () => {
      const lab: Oklab = { L: 0.968, a: -0.071, b: 0.199 }
      const result = oklabToOklch(lab)
      expect(result.l).toBe(0.968)
      expect(result.c).toBeCloseTo(0.211, 3)
      expect(result.h).toBeCloseTo(109.6, 1)
      expect(result.a).toBe(1)
    })
  })

  describe('achromatic colors (grayscale)', () => {
    it('converts black: L=0, a=0, b=0 to c=0, h=0', () => {
      const lab: Oklab = { L: 0, a: 0, b: 0 }
      const result = oklabToOklch(lab)
      expect(result).toEqual({ l: 0, c: 0, h: 0, a: 1 })
    })

    it('converts white: L=1, a=0, b=0 to c=0, h=0', () => {
      const lab: Oklab = { L: 1, a: 0, b: 0 }
      const result = oklabToOklch(lab)
      expect(result).toEqual({ l: 1, c: 0, h: 0, a: 1 })
    })

    it('converts mid-gray: L=0.5, a=0, b=0 to c=0, h=0', () => {
      const lab: Oklab = { L: 0.5, a: 0, b: 0 }
      const result = oklabToOklch(lab)
      expect(result).toEqual({ l: 0.5, c: 0, h: 0, a: 1 })
    })

    it('treats near-zero chroma as achromatic', () => {
      const lab: Oklab = { L: 0.7, a: 0.00001, b: 0.00001 }
      const result = oklabToOklch(lab)
      expect(result.c).toBe(0)
      expect(result.h).toBe(0)
    })

    it('treats exactly at threshold as achromatic', () => {
      const lab: Oklab = { L: 0.5, a: 0.00005, b: 0.00005 }
      const result = oklabToOklch(lab)
      expect(result.c).toBe(0)
      expect(result.h).toBe(0)
    })
  })

  describe('hue quadrants', () => {
    it('handles positive a, positive b (Q1: 0-90 degrees)', () => {
      const lab: Oklab = { L: 0.5, a: 0.1, b: 0.1 }
      const result = oklabToOklch(lab)
      expect(result.h).toBeCloseTo(45, 1)
    })

    it('handles negative a, positive b (Q2: 90-180 degrees)', () => {
      const lab: Oklab = { L: 0.5, a: -0.1, b: 0.1 }
      const result = oklabToOklch(lab)
      expect(result.h).toBeCloseTo(135, 1)
    })

    it('handles negative a, negative b (Q3: 180-270 degrees)', () => {
      const lab: Oklab = { L: 0.5, a: -0.1, b: -0.1 }
      const result = oklabToOklch(lab)
      expect(result.h).toBeCloseTo(225, 1)
    })

    it('handles positive a, negative b (Q4: 270-360 degrees)', () => {
      const lab: Oklab = { L: 0.5, a: 0.1, b: -0.1 }
      const result = oklabToOklch(lab)
      expect(result.h).toBeCloseTo(315, 1)
    })
  })

  describe('hue axis alignment', () => {
    it('positive a axis is h=0', () => {
      const lab: Oklab = { L: 0.5, a: 0.2, b: 0 }
      const result = oklabToOklch(lab)
      expect(result.h).toBe(0)
    })

    it('positive b axis is h=90', () => {
      const lab: Oklab = { L: 0.5, a: 0, b: 0.2 }
      const result = oklabToOklch(lab)
      expect(result.h).toBe(90)
    })

    it('negative a axis is h=180', () => {
      const lab: Oklab = { L: 0.5, a: -0.2, b: 0 }
      const result = oklabToOklch(lab)
      expect(result.h).toBe(180)
    })

    it('negative b axis is h=270', () => {
      const lab: Oklab = { L: 0.5, a: 0, b: -0.2 }
      const result = oklabToOklch(lab)
      expect(result.h).toBe(270)
    })
  })
})

describe('oklchToOklab', () => {
  describe('primary hue angles', () => {
    it('h=0 (red axis): a=c, b=0', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 0, a: 1 }
      const result = oklchToOklab(lch)
      expect(result.L).toBe(0.5)
      expect(result.a).toBeCloseTo(0.2, 10)
      expect(result.b).toBeCloseTo(0, 10)
    })

    it('h=90 (yellow axis): a=0, b=c', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 1 }
      const result = oklchToOklab(lch)
      expect(result.L).toBe(0.5)
      expect(result.a).toBeCloseTo(0, 10)
      expect(result.b).toBeCloseTo(0.2, 10)
    })

    it('h=180 (cyan/green axis): a=-c, b=0', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 }
      const result = oklchToOklab(lch)
      expect(result.L).toBe(0.5)
      expect(result.a).toBeCloseTo(-0.2, 10)
      expect(result.b).toBeCloseTo(0, 10)
    })

    it('h=270 (blue axis): a=0, b=-c', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 270, a: 1 }
      const result = oklchToOklab(lch)
      expect(result.L).toBe(0.5)
      expect(result.a).toBeCloseTo(0, 10)
      expect(result.b).toBeCloseTo(-0.2, 10)
    })
  })

  describe('achromatic colors (grayscale)', () => {
    it('converts black: l=0, c=0 to a=0, b=0', () => {
      const lch: OKLCH = { l: 0, c: 0, h: 0, a: 1 }
      const result = oklchToOklab(lch)
      expect(result).toEqual({ L: 0, a: 0, b: 0 })
    })

    it('converts white: l=1, c=0 to a=0, b=0', () => {
      const lch: OKLCH = { l: 1, c: 0, h: 0, a: 1 }
      const result = oklchToOklab(lch)
      expect(result).toEqual({ L: 1, a: 0, b: 0 })
    })

    it('converts mid-gray: l=0.5, c=0 to a=0, b=0', () => {
      const lch: OKLCH = { l: 0.5, c: 0, h: 0, a: 1 }
      const result = oklchToOklab(lch)
      expect(result).toEqual({ L: 0.5, a: 0, b: 0 })
    })

    it('ignores hue when chroma is zero', () => {
      const result1 = oklchToOklab({ l: 0.5, c: 0, h: 0, a: 1 })
      const result2 = oklchToOklab({ l: 0.5, c: 0, h: 180, a: 1 })
      const result3 = oklchToOklab({ l: 0.5, c: 0, h: 270, a: 1 })
      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })

    it('treats near-zero chroma as achromatic', () => {
      const lch: OKLCH = { l: 0.7, c: 0.00005, h: 45, a: 1 }
      const result = oklchToOklab(lch)
      expect(result.a).toBe(0)
      expect(result.b).toBe(0)
    })
  })

  describe('diagonal hue angles', () => {
    it('h=45 gives equal positive a and b', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 45, a: 1 }
      const result = oklchToOklab(lch)
      const expected = 0.2 * Math.cos((45 * Math.PI) / 180)
      expect(result.a).toBeCloseTo(expected, 10)
      expect(result.b).toBeCloseTo(expected, 10)
    })

    it('h=135 gives negative a and positive b', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 135, a: 1 }
      const result = oklchToOklab(lch)
      const expectedA = 0.2 * Math.cos((135 * Math.PI) / 180)
      const expectedB = 0.2 * Math.sin((135 * Math.PI) / 180)
      expect(result.a).toBeCloseTo(expectedA, 10)
      expect(result.b).toBeCloseTo(expectedB, 10)
    })

    it('h=225 gives equal negative a and b', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 225, a: 1 }
      const result = oklchToOklab(lch)
      const expected = 0.2 * Math.cos((225 * Math.PI) / 180)
      expect(result.a).toBeCloseTo(expected, 10)
      expect(result.b).toBeCloseTo(expected, 10)
    })

    it('h=315 gives positive a and negative b', () => {
      const lch: OKLCH = { l: 0.5, c: 0.2, h: 315, a: 1 }
      const result = oklchToOklab(lch)
      const expectedA = 0.2 * Math.cos((315 * Math.PI) / 180)
      const expectedB = 0.2 * Math.sin((315 * Math.PI) / 180)
      expect(result.a).toBeCloseTo(expectedA, 10)
      expect(result.b).toBeCloseTo(expectedB, 10)
    })
  })
})

describe('round-trip conversion', () => {
  const oklabCases: Array<{ name: string; lab: Oklab }> = [
    { name: 'black', lab: { L: 0, a: 0, b: 0 } },
    { name: 'white', lab: { L: 1, a: 0, b: 0 } },
    { name: 'mid-gray', lab: { L: 0.5, a: 0, b: 0 } },
    { name: 'red-ish', lab: { L: 0.628, a: 0.225, b: 0.126 } },
    { name: 'green-ish', lab: { L: 0.866, a: -0.234, b: 0.179 } },
    { name: 'blue-ish', lab: { L: 0.452, a: -0.032, b: -0.312 } },
    { name: 'cyan-ish', lab: { L: 0.905, a: -0.145, b: -0.039 } },
    { name: 'magenta-ish', lab: { L: 0.702, a: 0.275, b: -0.169 } },
    { name: 'yellow-ish', lab: { L: 0.968, a: -0.071, b: 0.199 } },
  ]

  it.each(oklabCases)('Oklab -> OKLCH -> Oklab preserves $name', ({ lab }) => {
    const oklch = oklabToOklch(lab)
    const result = oklchToOklab(oklch)

    if (lab.a === 0 && lab.b === 0) {
      expect(result.L).toBe(lab.L)
      expect(result.a).toBe(0)
      expect(result.b).toBe(0)
    } else {
      expect(result.L).toBe(lab.L)
      expect(result.a).toBeCloseTo(lab.a, 10)
      expect(result.b).toBeCloseTo(lab.b, 10)
    }
  })

  const oklchCases: Array<{ name: string; lch: OKLCH }> = [
    { name: 'black', lch: { l: 0, c: 0, h: 0, a: 1 } },
    { name: 'white', lch: { l: 1, c: 0, h: 0, a: 1 } },
    { name: 'mid-gray', lch: { l: 0.5, c: 0, h: 0, a: 1 } },
    { name: 'pure red hue', lch: { l: 0.628, c: 0.258, h: 29.23, a: 1 } },
    { name: 'pure green hue', lch: { l: 0.866, c: 0.295, h: 142.5, a: 1 } },
    { name: 'pure blue hue', lch: { l: 0.452, c: 0.313, h: 264.05, a: 1 } },
    { name: 'h=0', lch: { l: 0.5, c: 0.2, h: 0, a: 1 } },
    { name: 'h=90', lch: { l: 0.5, c: 0.2, h: 90, a: 1 } },
    { name: 'h=180', lch: { l: 0.5, c: 0.2, h: 180, a: 1 } },
    { name: 'h=270', lch: { l: 0.5, c: 0.2, h: 270, a: 1 } },
    { name: 'h=359', lch: { l: 0.5, c: 0.2, h: 359, a: 1 } },
  ]

  it.each(oklchCases)('OKLCH -> Oklab -> OKLCH preserves $name', ({ lch }) => {
    const lab = oklchToOklab(lch)
    const result = oklabToOklch(lab)

    if (lch.c === 0) {
      expect(result.l).toBe(lch.l)
      expect(result.c).toBe(0)
      expect(result.h).toBe(0)
    } else {
      expect(result.l).toBe(lch.l)
      expect(result.c).toBeCloseTo(lch.c, 10)
      expect(result.h).toBeCloseTo(lch.h, 5)
    }
  })
})

describe('edge cases', () => {
  it('handles very small chroma values', () => {
    const lab: Oklab = { L: 0.5, a: 0.0001, b: 0.0001 }
    const result = oklabToOklch(lab)
    expect(result.c).toBeCloseTo(0.000141, 5)
    expect(result.h).toBeCloseTo(45, 1)
  })

  it('handles very large chroma values (out of sRGB gamut)', () => {
    const lab: Oklab = { L: 0.5, a: 0.5, b: 0.5 }
    const result = oklabToOklch(lab)
    expect(result.c).toBeCloseTo(Math.SQRT1_2, 3)
    expect(result.h).toBeCloseTo(45, 1)
  })

  it('handles h=360 same as h=0', () => {
    const lch360: OKLCH = { l: 0.5, c: 0.2, h: 360, a: 1 }
    const lch0: OKLCH = { l: 0.5, c: 0.2, h: 0, a: 1 }
    const result360 = oklchToOklab(lch360)
    const result0 = oklchToOklab(lch0)
    expect(result360.a).toBeCloseTo(result0.a, 10)
    expect(result360.b).toBeCloseTo(result0.b, 10)
  })

  it('handles lightness at boundaries', () => {
    expect(oklabToOklch({ L: 0, a: 0.1, b: 0.1 }).l).toBe(0)
    expect(oklabToOklch({ L: 1, a: 0.1, b: 0.1 }).l).toBe(1)
    expect(oklchToOklab({ l: 0, c: 0.2, h: 45, a: 1 }).L).toBe(0)
    expect(oklchToOklab({ l: 1, c: 0.2, h: 45, a: 1 }).L).toBe(1)
  })

  it('preserves mathematical identity: c = sqrt(a^2 + b^2)', () => {
    const lch: OKLCH = { l: 0.5, c: 0.3, h: 60, a: 1 }
    const lab = oklchToOklab(lch)
    const calculatedC = Math.sqrt(lab.a * lab.a + lab.b * lab.b)
    expect(calculatedC).toBeCloseTo(lch.c, 10)
  })

  it('preserves mathematical identity: h = atan2(b, a)', () => {
    const lab: Oklab = { L: 0.5, a: 0.15, b: 0.26 }
    const lch = oklabToOklch(lab)
    const calculatedH = Math.atan2(lab.b, lab.a) * (180 / Math.PI)
    expect(lch.h).toBeCloseTo(calculatedH, 10)
  })
})
