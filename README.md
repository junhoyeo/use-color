<p align="center">
  <img alt="roller skate emoji" src="./docs/images/roller-skate-emoji.png" width="96" />
  <h1 align="center">use-color</h1>
</p>

> The powerful **color** hook that all designers deserve.

```
yarn add use-color
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
setColor({ r: 255, g: 255, b: 255 })

// then
color.rgb // { r: 255, g: 255, b: 255 }

// when
setColor(({ b }) => ({ r: 144, g: 194, b }))

// then
color.rgb // { r: 144, g: 194, b: 255 }
```

## Compile-time Type checking
```tsx
useColor('#00ffzaz')
// Argument of type '"#00ffzaz"' is not assignable to parameter of type '...'.ts(2345)

useColor('rgb(255, 255,)')
// Argument of type '"rgba(255, 255,)"' is not assignable to parameter of type '...'.ts(2345)

useColor('rgba(255, 255, 255)')
// Argument of type '"rgba(255, 255, 255)"' is not assignable to parameter of type '...'.ts(2345)
```
