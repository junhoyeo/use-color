import { describe, it } from 'vitest';
import { expectTypeOf } from 'expect-type';
import type {
  Color,
  RgbColor,
  OklchColor,
  HslColor,
  AnyColor,
} from '../ColorObject.js';
import type {
  ColorInput,
  ColorStringInput,
  AnyColorInput,
  AsValidColor,
  ColorObjectInput,
} from '../ColorInput.js';
import type { RGBA, OKLCH, HSLA } from '../color.js';

describe('Color discriminated union types', () => {
  it('Color<rgb> produces correct type with space: rgb', () => {
    expectTypeOf<Color<'rgb'>>().toMatchTypeOf<{ space: 'rgb' }>();
    expectTypeOf<Color<'rgb'>>().toMatchTypeOf<RGBA>();
    expectTypeOf<Color<'rgb'>>().toEqualTypeOf<{ space: 'rgb' } & RGBA>();
  });

  it('Color<oklch> produces correct type with space: oklch', () => {
    expectTypeOf<Color<'oklch'>>().toMatchTypeOf<{ space: 'oklch' }>();
    expectTypeOf<Color<'oklch'>>().toMatchTypeOf<OKLCH>();
    expectTypeOf<Color<'oklch'>>().toEqualTypeOf<{ space: 'oklch' } & OKLCH>();
  });

  it('Color<hsl> produces correct type with space: hsl', () => {
    expectTypeOf<Color<'hsl'>>().toMatchTypeOf<{ space: 'hsl' }>();
    expectTypeOf<Color<'hsl'>>().toMatchTypeOf<HSLA>();
    expectTypeOf<Color<'hsl'>>().toEqualTypeOf<{ space: 'hsl' } & HSLA>();
  });

  it('RgbColor alias equals Color<rgb>', () => {
    expectTypeOf<RgbColor>().toEqualTypeOf<Color<'rgb'>>();
    expectTypeOf<RgbColor>().toMatchTypeOf<{ space: 'rgb'; r: number; g: number; b: number; a: number }>();
  });

  it('OklchColor alias equals Color<oklch>', () => {
    expectTypeOf<OklchColor>().toEqualTypeOf<Color<'oklch'>>();
    expectTypeOf<OklchColor>().toMatchTypeOf<{ space: 'oklch'; l: number; c: number; h: number; a: number }>();
  });

  it('HslColor alias equals Color<hsl>', () => {
    expectTypeOf<HslColor>().toEqualTypeOf<Color<'hsl'>>();
    expectTypeOf<HslColor>().toMatchTypeOf<{ space: 'hsl'; h: number; s: number; l: number; a: number }>();
  });

  it('AnyColor union accepts all three color types', () => {
    expectTypeOf<RgbColor>().toMatchTypeOf<AnyColor>();
    expectTypeOf<OklchColor>().toMatchTypeOf<AnyColor>();
    expectTypeOf<HslColor>().toMatchTypeOf<AnyColor>();
    expectTypeOf<AnyColor>().toEqualTypeOf<RgbColor | OklchColor | HslColor>();
  });

  it('AnyColor has common alpha property accessible without narrowing', () => {
    type AlphaOnly = { a: number };
    expectTypeOf<AnyColor>().toMatchTypeOf<AlphaOnly>();
  });

  it('Color with invalid space returns never', () => {
    // @ts-expect-error - 'invalid' is not a valid ColorSpace
    type InvalidColor = Color<'invalid'>;
    expectTypeOf<InvalidColor>().toEqualTypeOf<never>();
  });

  it('Discriminated union narrowing works for rgb', () => {
    type NarrowedRgb = Extract<AnyColor, { space: 'rgb' }>;
    expectTypeOf<NarrowedRgb>().toEqualTypeOf<RgbColor>();
    expectTypeOf<NarrowedRgb>().toMatchTypeOf<{ r: number; g: number; b: number }>();
  });

  it('Discriminated union narrowing works for oklch', () => {
    type NarrowedOklch = Extract<AnyColor, { space: 'oklch' }>;
    expectTypeOf<NarrowedOklch>().toEqualTypeOf<OklchColor>();
    expectTypeOf<NarrowedOklch>().toMatchTypeOf<{ l: number; c: number; h: number }>();
  });

  it('Discriminated union narrowing works for hsl', () => {
    type NarrowedHsl = Extract<AnyColor, { space: 'hsl' }>;
    expectTypeOf<NarrowedHsl>().toEqualTypeOf<HslColor>();
    expectTypeOf<NarrowedHsl>().toMatchTypeOf<{ h: number; s: number; l: number }>();
  });
});

describe('ColorInput types', () => {
  it('ColorStringInput accepts valid hex strings', () => {
    expectTypeOf<ColorStringInput<'#fff'>>().toEqualTypeOf<'#fff'>();
    expectTypeOf<ColorStringInput<'#ffffff'>>().toEqualTypeOf<'#ffffff'>();
    expectTypeOf<ColorStringInput<'#ff0000ff'>>().toEqualTypeOf<'#ff0000ff'>();
  });

  it('ColorStringInput accepts valid rgb strings', () => {
    expectTypeOf<ColorStringInput<'rgb(255, 0, 0)'>>().toEqualTypeOf<'rgb(255, 0, 0)'>();
    expectTypeOf<ColorStringInput<'rgba(255, 0, 0, 0.5)'>>().toEqualTypeOf<'rgba(255, 0, 0, 0.5)'>();
    expectTypeOf<ColorStringInput<'rgb(255 0 0)'>>().toEqualTypeOf<'rgb(255 0 0)'>();
    expectTypeOf<ColorStringInput<'rgb(255 0 0 / 0.5)'>>().toEqualTypeOf<'rgb(255 0 0 / 0.5)'>();
  });

  it('ColorStringInput accepts valid oklch strings', () => {
    expectTypeOf<ColorStringInput<'oklch(0.5 0.2 180)'>>().toEqualTypeOf<'oklch(0.5 0.2 180)'>();
    expectTypeOf<ColorStringInput<'oklch(0.5 0.2 180 / 0.5)'>>().toEqualTypeOf<'oklch(0.5 0.2 180 / 0.5)'>();
  });

  it('ColorStringInput returns never for invalid strings', () => {
    expectTypeOf<ColorStringInput<'not-a-color'>>().toEqualTypeOf<never>();
    expectTypeOf<ColorStringInput<'invalid'>>().toEqualTypeOf<never>();
    expectTypeOf<ColorStringInput<''>>().toEqualTypeOf<never>();
  });

  it('ColorObjectInput accepts RGBA, OKLCH, and HSLA objects', () => {
    expectTypeOf<RGBA>().toMatchTypeOf<ColorObjectInput>();
    expectTypeOf<OKLCH>().toMatchTypeOf<ColorObjectInput>();
    expectTypeOf<HSLA>().toMatchTypeOf<ColorObjectInput>();
  });

  it('ColorInput union includes valid hex and rgb strings as assignable members', () => {
    expectTypeOf<'#ff0000'>().toMatchTypeOf<ColorInput<'#ff0000'>>();
    expectTypeOf<'rgb(255, 0, 0)'>().toMatchTypeOf<ColorInput<'rgb(255, 0, 0)'>>();
  });
});

describe('AnyColorInput types', () => {
  it('AnyColorInput union includes all valid string formats as assignable members', () => {
    expectTypeOf<'#fff'>().toMatchTypeOf<AnyColorInput<'#fff'>>();
    expectTypeOf<'rgb(255, 0, 0)'>().toMatchTypeOf<AnyColorInput<'rgb(255, 0, 0)'>>();
    expectTypeOf<'oklch(0.5 0.2 180)'>().toMatchTypeOf<AnyColorInput<'oklch(0.5 0.2 180)'>>();
  });

  it('AnyColorInput accepts color object types', () => {
    expectTypeOf<RGBA>().toMatchTypeOf<AnyColorInput>();
    expectTypeOf<OKLCH>().toMatchTypeOf<AnyColorInput>();
    expectTypeOf<HSLA>().toMatchTypeOf<AnyColorInput>();
  });
});

describe('AsValidColor constraint helper', () => {
  it('AsValidColor returns T for valid hex strings', () => {
    expectTypeOf<AsValidColor<'#fff'>>().toEqualTypeOf<'#fff'>();
    expectTypeOf<AsValidColor<'#ffffff'>>().toEqualTypeOf<'#ffffff'>();
    expectTypeOf<AsValidColor<'#ff0000ff'>>().toEqualTypeOf<'#ff0000ff'>();
  });

  it('AsValidColor returns T for valid rgb strings', () => {
    expectTypeOf<AsValidColor<'rgb(255, 0, 0)'>>().toEqualTypeOf<'rgb(255, 0, 0)'>();
    expectTypeOf<AsValidColor<'rgba(255, 0, 0, 0.5)'>>().toEqualTypeOf<'rgba(255, 0, 0, 0.5)'>();
    expectTypeOf<AsValidColor<'rgb(255 0 0)'>>().toEqualTypeOf<'rgb(255 0 0)'>();
  });

  it('AsValidColor returns T for valid oklch strings', () => {
    expectTypeOf<AsValidColor<'oklch(0.5 0.2 180)'>>().toEqualTypeOf<'oklch(0.5 0.2 180)'>();
    expectTypeOf<AsValidColor<'oklch(0.7 0.15 45 / 0.8)'>>().toEqualTypeOf<'oklch(0.7 0.15 45 / 0.8)'>();
  });

  it('AsValidColor returns never for invalid strings', () => {
    expectTypeOf<AsValidColor<'not-a-color'>>().toEqualTypeOf<never>();
    expectTypeOf<AsValidColor<'invalid'>>().toEqualTypeOf<never>();
    expectTypeOf<AsValidColor<'hsl(0, 100%, 50%)'>>().toEqualTypeOf<never>();
    expectTypeOf<AsValidColor<''>>().toEqualTypeOf<never>();
  });

  it('AsValidColor rejects malformed color strings', () => {
    expectTypeOf<AsValidColor<'#gggggg'>>().toEqualTypeOf<never>();
    expectTypeOf<AsValidColor<'rgb()'>>().toEqualTypeOf<never>();
    expectTypeOf<AsValidColor<'oklch()'>>().toEqualTypeOf<never>();
    expectTypeOf<AsValidColor<'fff'>>().toEqualTypeOf<never>();
  });
});
