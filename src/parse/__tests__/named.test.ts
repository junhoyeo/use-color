import { describe, expect, it } from 'vitest';
import {
  isNamedColor,
  NAMED_COLORS,
  parseNamed,
  tryParseNamed,
} from '../named.js';
import { ColorErrorCode, ColorParseError } from '../../errors.js';

describe('NAMED_COLORS', () => {
  it('contains 149 colors (148 named + transparent)', () => {
    expect(Object.keys(NAMED_COLORS).length).toBe(149);
  });

  it('all values are [r, g, b, a] tuples with correct ranges', () => {
    for (const [_name, value] of Object.entries(NAMED_COLORS)) {
      expect(value).toHaveLength(4);
      expect(value[0]).toBeGreaterThanOrEqual(0);
      expect(value[0]).toBeLessThanOrEqual(255);
      expect(value[1]).toBeGreaterThanOrEqual(0);
      expect(value[1]).toBeLessThanOrEqual(255);
      expect(value[2]).toBeGreaterThanOrEqual(0);
      expect(value[2]).toBeLessThanOrEqual(255);
      expect(value[3]).toBeGreaterThanOrEqual(0);
      expect(value[3]).toBeLessThanOrEqual(1);
    }
  });

  it('all keys are lowercase', () => {
    for (const key of Object.keys(NAMED_COLORS)) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});

describe('parseNamed', () => {
  describe('basic colors', () => {
    it('parses "red"', () => {
      expect(parseNamed('red')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('parses "green"', () => {
      expect(parseNamed('green')).toEqual({ r: 0, g: 128, b: 0, a: 1 });
    });

    it('parses "blue"', () => {
      expect(parseNamed('blue')).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    });

    it('parses "black"', () => {
      expect(parseNamed('black')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('parses "white"', () => {
      expect(parseNamed('white')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('parses "yellow"', () => {
      expect(parseNamed('yellow')).toEqual({ r: 255, g: 255, b: 0, a: 1 });
    });

    it('parses "cyan"', () => {
      expect(parseNamed('cyan')).toEqual({ r: 0, g: 255, b: 255, a: 1 });
    });

    it('parses "magenta"', () => {
      expect(parseNamed('magenta')).toEqual({ r: 255, g: 0, b: 255, a: 1 });
    });
  });

  describe('case-insensitivity', () => {
    it('parses "RED" (uppercase)', () => {
      expect(parseNamed('RED')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('parses "Red" (mixed case)', () => {
      expect(parseNamed('Red')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('parses "rEd" (mixed case)', () => {
      expect(parseNamed('rEd')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('parses "ALICEBLUE" (uppercase)', () => {
      expect(parseNamed('ALICEBLUE')).toEqual({ r: 240, g: 248, b: 255, a: 1 });
    });

    it('parses "AliceBlue" (mixed case)', () => {
      expect(parseNamed('AliceBlue')).toEqual({ r: 240, g: 248, b: 255, a: 1 });
    });
  });

  describe('transparent', () => {
    it('parses "transparent" as rgba(0, 0, 0, 0)', () => {
      expect(parseNamed('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });

    it('parses "TRANSPARENT" (case-insensitive)', () => {
      expect(parseNamed('TRANSPARENT')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });
  });

  describe('extended colors', () => {
    it('parses "aliceblue"', () => {
      expect(parseNamed('aliceblue')).toEqual({ r: 240, g: 248, b: 255, a: 1 });
    });

    it('parses "rebeccapurple"', () => {
      expect(parseNamed('rebeccapurple')).toEqual({ r: 102, g: 51, b: 153, a: 1 });
    });

    it('parses "yellowgreen"', () => {
      expect(parseNamed('yellowgreen')).toEqual({ r: 154, g: 205, b: 50, a: 1 });
    });

    it('parses "coral"', () => {
      expect(parseNamed('coral')).toEqual({ r: 255, g: 127, b: 80, a: 1 });
    });

    it('parses "crimson"', () => {
      expect(parseNamed('crimson')).toEqual({ r: 220, g: 20, b: 60, a: 1 });
    });

    it('parses "gold"', () => {
      expect(parseNamed('gold')).toEqual({ r: 255, g: 215, b: 0, a: 1 });
    });

    it('parses "indigo"', () => {
      expect(parseNamed('indigo')).toEqual({ r: 75, g: 0, b: 130, a: 1 });
    });
  });

  describe('gray/grey variants', () => {
    it('parses "gray" and "grey" as same color', () => {
      expect(parseNamed('gray')).toEqual(parseNamed('grey'));
    });

    it('parses "darkgray" and "darkgrey" as same color', () => {
      expect(parseNamed('darkgray')).toEqual(parseNamed('darkgrey'));
    });

    it('parses "lightgray" and "lightgrey" as same color', () => {
      expect(parseNamed('lightgray')).toEqual(parseNamed('lightgrey'));
    });

    it('parses "slategray" and "slategrey" as same color', () => {
      expect(parseNamed('slategray')).toEqual(parseNamed('slategrey'));
    });
  });

  describe('whitespace handling', () => {
    it('trims leading whitespace', () => {
      expect(parseNamed('  red')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('trims trailing whitespace', () => {
      expect(parseNamed('red  ')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('trims both leading and trailing whitespace', () => {
      expect(parseNamed('  red  ')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });
  });

  describe('invalid colors', () => {
    it('throws for unknown color "notacolor"', () => {
      expect(() => parseNamed('notacolor')).toThrow(ColorParseError);
      expect(() => parseNamed('notacolor')).toThrow("Unknown named color: 'notacolor'");
    });

    it('throws for misspelled color "redd"', () => {
      expect(() => parseNamed('redd')).toThrow(ColorParseError);
      expect(() => parseNamed('redd')).toThrow("Unknown named color: 'redd'");
    });

    it('throws for empty string', () => {
      expect(() => parseNamed('')).toThrow(ColorParseError);
      expect(() => parseNamed('')).toThrow('Invalid named color: empty string');
    });

    it('throws for whitespace only', () => {
      expect(() => parseNamed('   ')).toThrow(ColorParseError);
      expect(() => parseNamed('   ')).toThrow('Invalid named color: empty string');
    });

    it('throws for hex-like strings', () => {
      expect(() => parseNamed('#ff0000')).toThrow(ColorParseError);
    });

    it('throws for rgb-like strings', () => {
      expect(() => parseNamed('rgb(255,0,0)')).toThrow(ColorParseError);
    });

    it('error has correct error code', () => {
      try {
        parseNamed('invalid');
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_NAMED);
      }
    });
  });
});

describe('tryParseNamed', () => {
  describe('valid colors', () => {
    it('returns Ok for "red"', () => {
      const result = tryParseNamed('red');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      }
    });

    it('returns Ok for "transparent"', () => {
      const result = tryParseNamed('transparent');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ r: 0, g: 0, b: 0, a: 0 });
      }
    });

    it('returns Ok for case-insensitive "BLUE"', () => {
      const result = tryParseNamed('BLUE');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ r: 0, g: 0, b: 255, a: 1 });
      }
    });
  });

  describe('invalid colors', () => {
    it('returns Err for unknown color', () => {
      const result = tryParseNamed('notacolor');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ColorParseError);
        expect(result.error.code).toBe(ColorErrorCode.INVALID_NAMED);
        expect(result.error.message).toBe("Unknown named color: 'notacolor'");
      }
    });

    it('returns Err for empty string', () => {
      const result = tryParseNamed('');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ColorParseError);
        expect(result.error.code).toBe(ColorErrorCode.INVALID_NAMED);
      }
    });

    it('returns Err for misspelled color', () => {
      const result = tryParseNamed('bluu');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe(ColorErrorCode.INVALID_NAMED);
      }
    });
  });
});

describe('isNamedColor', () => {
  it('returns true for valid color "red"', () => {
    expect(isNamedColor('red')).toBe(true);
  });

  it('returns true for valid color "RED" (case-insensitive)', () => {
    expect(isNamedColor('RED')).toBe(true);
  });

  it('returns true for "transparent"', () => {
    expect(isNamedColor('transparent')).toBe(true);
  });

  it('returns true for extended color "rebeccapurple"', () => {
    expect(isNamedColor('rebeccapurple')).toBe(true);
  });

  it('returns false for unknown color', () => {
    expect(isNamedColor('notacolor')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isNamedColor('')).toBe(false);
  });

  it('returns false for whitespace only', () => {
    expect(isNamedColor('   ')).toBe(false);
  });

  it('returns false for hex string', () => {
    expect(isNamedColor('#ff0000')).toBe(false);
  });
});

describe('all 148 CSS4 named colors are present', () => {
  const expectedColors = [
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
    'beige', 'bisque', 'black', 'blanchedalmond', 'blue',
    'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
    'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson',
    'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
    'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
    'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
    'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
    'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
    'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
    'ghostwhite', 'gold', 'goldenrod', 'gray', 'green',
    'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred',
    'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush',
    'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
    'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
    'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
    'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
    'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid',
    'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
    'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab',
    'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
    'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
    'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple',
    'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon',
    'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver',
    'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
    'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
    'tomato', 'turquoise', 'violet', 'wheat', 'white',
    'whitesmoke', 'yellow', 'yellowgreen',
  ];

  it.each(expectedColors)('contains "%s"', (colorName) => {
    expect(NAMED_COLORS[colorName]).toBeDefined();
    expect(isNamedColor(colorName)).toBe(true);
  });

  it('contains "transparent"', () => {
    expect(NAMED_COLORS['transparent']).toBeDefined();
    expect(isNamedColor('transparent')).toBe(true);
  });
});
