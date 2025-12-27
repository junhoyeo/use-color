import { describe, expect, it } from 'vitest';
import { ColorErrorCode, ColorOutOfGamutError, ColorParseError } from '../errors.js';

describe('ColorErrorCode', () => {
  it('has all expected error codes', () => {
    expect(ColorErrorCode.INVALID_HEX).toBe('INVALID_HEX');
    expect(ColorErrorCode.INVALID_RGB).toBe('INVALID_RGB');
    expect(ColorErrorCode.INVALID_HSL).toBe('INVALID_HSL');
    expect(ColorErrorCode.INVALID_OKLCH).toBe('INVALID_OKLCH');
    expect(ColorErrorCode.INVALID_NAMED).toBe('INVALID_NAMED');
    expect(ColorErrorCode.INVALID_FORMAT).toBe('INVALID_FORMAT');
    expect(ColorErrorCode.OUT_OF_GAMUT).toBe('OUT_OF_GAMUT');
  });
});

describe('ColorParseError', () => {
  it('creates error with code and message', () => {
    const error = new ColorParseError(ColorErrorCode.INVALID_HEX, 'Invalid hex color: #gggggg');

    expect(error.code).toBe(ColorErrorCode.INVALID_HEX);
    expect(error.message).toBe('Invalid hex color: #gggggg');
    expect(error.name).toBe('ColorParseError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ColorParseError);
  });

  it('works with different error codes', () => {
    const rgbError = new ColorParseError(ColorErrorCode.INVALID_RGB, 'bad rgb');
    expect(rgbError.code).toBe(ColorErrorCode.INVALID_RGB);

    const hslError = new ColorParseError(ColorErrorCode.INVALID_HSL, 'bad hsl');
    expect(hslError.code).toBe(ColorErrorCode.INVALID_HSL);

    const oklchError = new ColorParseError(ColorErrorCode.INVALID_OKLCH, 'bad oklch');
    expect(oklchError.code).toBe(ColorErrorCode.INVALID_OKLCH);
  });

  it('has proper stack trace', () => {
    const error = new ColorParseError(ColorErrorCode.INVALID_FORMAT, 'Unknown format');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ColorParseError');
  });
});

describe('ColorOutOfGamutError', () => {
  it('creates error with source color and target gamut', () => {
    const error = new ColorOutOfGamutError(
      'oklch(0.9 0.4 150)',
      'sRGB',
      'Color exceeds sRGB gamut boundaries',
    );

    expect(error.code).toBe(ColorErrorCode.OUT_OF_GAMUT);
    expect(error.sourceColor).toBe('oklch(0.9 0.4 150)');
    expect(error.targetGamut).toBe('sRGB');
    expect(error.message).toBe('Color exceeds sRGB gamut boundaries');
    expect(error.name).toBe('ColorOutOfGamutError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ColorParseError);
    expect(error).toBeInstanceOf(ColorOutOfGamutError);
  });

  it('uses default message when not provided', () => {
    const error = new ColorOutOfGamutError('oklch(0.95 0.3 120)', 'sRGB');

    expect(error.message).toBe("Color 'oklch(0.95 0.3 120)' is outside the sRGB gamut");
    expect(error.sourceColor).toBe('oklch(0.95 0.3 120)');
    expect(error.targetGamut).toBe('sRGB');
  });

  it('works with different target gamuts', () => {
    const p3Error = new ColorOutOfGamutError('oklch(1 0.5 0)', 'P3');
    expect(p3Error.message).toBe("Color 'oklch(1 0.5 0)' is outside the P3 gamut");
    expect(p3Error.targetGamut).toBe('P3');

    const rec2020Error = new ColorOutOfGamutError('oklch(1 0.5 0)', 'Rec.2020');
    expect(rec2020Error.targetGamut).toBe('Rec.2020');
  });

  it('has proper stack trace', () => {
    const error = new ColorOutOfGamutError('oklch(0.9 0.4 150)', 'sRGB');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ColorOutOfGamutError');
  });
});
