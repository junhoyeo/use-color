import { expectTypeOf } from 'expect-type';
import { describe, it } from 'vitest';
import type {
  HslaLegacyString,
  HslaString,
  HslInputString,
  HslLegacyString,
  HslModernAlphaString,
  HslModernString,
  HslString,
} from '../Hsl.js';

describe('Hsl types', () => {
  it('HslLegacyString validates legacy comma format', () => {
    expectTypeOf<HslLegacyString<'hsl(180, 50%, 50%)'>>().toEqualTypeOf<'hsl(180, 50%, 50%)'>();
    expectTypeOf<HslLegacyString<'hsl(0, 100%, 50%)'>>().toEqualTypeOf<'hsl(0, 100%, 50%)'>();
    expectTypeOf<HslLegacyString<'hsl(360,0%,100%)'>>().toEqualTypeOf<'hsl(360,0%,100%)'>();
    expectTypeOf<HslLegacyString<'hsl(180 50% 50%)'>>().toEqualTypeOf<never>();
    expectTypeOf<HslLegacyString<'hsla(180, 50%, 50%, 1)'>>().toEqualTypeOf<never>();
  });

  it('HslaLegacyString validates legacy comma format with alpha', () => {
    expectTypeOf<
      HslaLegacyString<'hsla(180, 50%, 50%, 0.5)'>
    >().toEqualTypeOf<'hsla(180, 50%, 50%, 0.5)'>();
    expectTypeOf<HslaLegacyString<'hsla(0,100%,50%,1)'>>().toEqualTypeOf<'hsla(0,100%,50%,1)'>();
    expectTypeOf<
      HslaLegacyString<'hsla(180, 50%, 50%, 50%)'>
    >().toEqualTypeOf<'hsla(180, 50%, 50%, 50%)'>();
    expectTypeOf<HslaLegacyString<'hsla(180, 50%, 50%)'>>().toEqualTypeOf<never>();
    expectTypeOf<HslaLegacyString<'hsl(180, 50%, 50%)'>>().toEqualTypeOf<never>();
  });

  it('HslModernString validates modern space format', () => {
    expectTypeOf<HslModernString<'hsl(180 50% 50%)'>>().toEqualTypeOf<'hsl(180 50% 50%)'>();
    expectTypeOf<HslModernString<'hsl(0 100% 50%)'>>().toEqualTypeOf<'hsl(0 100% 50%)'>();
    expectTypeOf<HslModernString<'hsla(180 50% 50%)'>>().toEqualTypeOf<'hsla(180 50% 50%)'>();
    expectTypeOf<HslModernString<'hsl(180, 50%, 50%)'>>().toEqualTypeOf<never>();
  });

  it('HslModernAlphaString validates modern space format with alpha', () => {
    expectTypeOf<
      HslModernAlphaString<'hsl(180 50% 50% / 0.5)'>
    >().toEqualTypeOf<'hsl(180 50% 50% / 0.5)'>();
    expectTypeOf<
      HslModernAlphaString<'hsl(180 50% 50%/1)'>
    >().toEqualTypeOf<'hsl(180 50% 50%/1)'>();
    expectTypeOf<
      HslModernAlphaString<'hsl(180 50% 50% / 50%)'>
    >().toEqualTypeOf<'hsl(180 50% 50% / 50%)'>();
    expectTypeOf<
      HslModernAlphaString<'hsla(180 50% 50% / 0.8)'>
    >().toEqualTypeOf<'hsla(180 50% 50% / 0.8)'>();
    expectTypeOf<HslModernAlphaString<'hsl(180 50% 50%)'>>().toEqualTypeOf<never>();
  });

  it('HslString accepts both legacy and modern without alpha', () => {
    expectTypeOf<HslString<'hsl(180, 50%, 50%)'>>().toEqualTypeOf<'hsl(180, 50%, 50%)'>();
    expectTypeOf<HslString<'hsl(180 50% 50%)'>>().toEqualTypeOf<'hsl(180 50% 50%)'>();
    expectTypeOf<HslString<'hsl(invalid)'>>().toEqualTypeOf<never>();
  });

  it('HslaString accepts both legacy and modern with alpha', () => {
    expectTypeOf<
      HslaString<'hsla(180, 50%, 50%, 0.5)'>
    >().toEqualTypeOf<'hsla(180, 50%, 50%, 0.5)'>();
    expectTypeOf<HslaString<'hsl(180 50% 50% / 0.5)'>>().toEqualTypeOf<'hsl(180 50% 50% / 0.5)'>();
  });

  it('HslInputString accepts all valid HSL formats', () => {
    expectTypeOf<HslInputString<'hsl(180, 50%, 50%)'>>().toEqualTypeOf<'hsl(180, 50%, 50%)'>();
    expectTypeOf<
      HslInputString<'hsla(180, 50%, 50%, 0.5)'>
    >().toEqualTypeOf<'hsla(180, 50%, 50%, 0.5)'>();
    expectTypeOf<HslInputString<'hsl(180 50% 50%)'>>().toEqualTypeOf<'hsl(180 50% 50%)'>();
    expectTypeOf<
      HslInputString<'hsl(180 50% 50% / 0.5)'>
    >().toEqualTypeOf<'hsl(180 50% 50% / 0.5)'>();
  });

  it('HslInputString rejects invalid formats', () => {
    expectTypeOf<HslInputString<'hsl(180, 50%)'>>().toEqualTypeOf<never>();
    expectTypeOf<HslInputString<'hsl(180)'>>().toEqualTypeOf<never>();
    expectTypeOf<HslInputString<'hsl()'>>().toEqualTypeOf<never>();
    expectTypeOf<HslInputString<'rgb(255, 0, 0)'>>().toEqualTypeOf<never>();
    expectTypeOf<HslInputString<'invalid'>>().toEqualTypeOf<never>();
    expectTypeOf<HslInputString<''>>().toEqualTypeOf<never>();
  });

  it('HslInputString validates edge case values', () => {
    expectTypeOf<HslInputString<'hsl(0, 0%, 0%)'>>().toEqualTypeOf<'hsl(0, 0%, 0%)'>();
    expectTypeOf<HslInputString<'hsl(360, 100%, 100%)'>>().toEqualTypeOf<'hsl(360, 100%, 100%)'>();
    expectTypeOf<HslInputString<'hsl(0 0% 0%)'>>().toEqualTypeOf<'hsl(0 0% 0%)'>();
  });
});
