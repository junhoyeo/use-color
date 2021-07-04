<p align="center">
  <img alt="roller skate emoji" src="https://github.com/junhoyeo/use-color/raw/main/docs/images/roller-skate-emoji.png" width="96" />
  <h1 align="center">use-color</h1>
</p>

[![NPM version](https://badgen.net/npm/v/use-color)](https://www.npmjs.com/package/use-color) [![Package size](https://badgen.net/bundlephobia/minzip/use-color)](https://bundlephobia.com/result?p=use-color) [![codecov](https://codecov.io/gh/junhoyeo/use-color/branch/main/graph/badge.svg?token=OQKSGYD5UI)](https://codecov.io/gh/junhoyeo/use-color) [![Build](https://github.com/junhoyeo/use-color/actions/workflows/build.yml/badge.svg)](https://github.com/junhoyeo/use-color/actions/workflows/build.yml)

> The powerful **color** hook that all designers deserve.

```
yarn add use-color
```

```tsx
import { useColor } from 'use-color'
```

## Core functions
All the functions and types that power the hook are exported. Detailed documentation is TBD(planning to detach them as a core module).

```tsx
import { parseColor } from 'use-color/parser'
import { ColorInput } from 'use-color/types/ColorInput'

const givenColor: colorInput = 'rgb(34, 114, 235)'
const color = parseColor(givenColor)
```

## Parse
```tsx
const [color] = useColor('#2272eb')
color.rgb // { r: 34, g: 114, b: 235 }
color.rgba // { r: 34, g: 114, b: 235, a: 1 }

const [color] = useColor('rgb(34, 114, 235)')
color.string.hex // #2272eb

const [color] = useColor('rgba(34, 114, 235, 0.5)')
color.string.hex // #2272eb80
color.rgb // { r: 34, g: 114, b: 235 }
color.rgba // { r: 34, g: 114, b: 235, a: 0.5 }
```

## Stringify
```tsx
const [color] = useColor({ r: 255, g: 255, b: 255 })

color.string.hex // '#ffffff'
color.string.rgb // 'rgb(255, 255, 255)'
color.string.rgba // 'rgb(255, 255, 255, 1)'
```

### Stringify Options
```tsx
const [color] = useColor({ r: 255, g: 255, b: 255 }, {
  hex: {
    transform: 'lowercase', // 'lowercase' | 'uppercase'
    compress: false, // boolean
    ignoreAlpha: false, // boolean
  }
})
```

## Update
```tsx
// when
const [color, setColor] = useColor({ r: 144, g: 194, b: 255 })
setColor('#fff')
setColor('rgb(255, 255, 255)')
setColor({ r: 255, g: 255, b: 255 })

// then
color.rgb // { r: 255, g: 255, b: 255 }

// when
setColor(({ b }) => `rgba(144, 194, ${b})`)
setColor(({ b }) => ({ r: 144, g: 194, b }))

// then
color.rgb // { r: 144, g: 194, b: 255 }
```

## Compile-time Type checking
```diff
+ useColor('#00fffa')
- useColor('#00ffzz')
// Argument of type '"#00ffzaz"' is not assignable to parameter of type '...'.ts(2345)

+ useColor('rgb(255, 255, 255)')
- useColor('rgb(255, 255,)')
// Argument of type '"rgba(255, 255,)"' is not assignable to parameter of type '...'.ts(2345)

+ useColor('rgba(255, 255, 255, 1)')
- useColor('rgba(255, 255, 255)')
// Argument of type '"rgba(255, 255, 255)"' is not assignable to parameter of type '...'.ts(2345)
```

### Credits
- Color hex string type implementation with generic constraints: https://stackoverflow.com/questions/54674576/typescript-is-it-possible-validate-string-types-based-on-pattern-matching-or-e#answer-54675049
