export type HexConfig = {
  transform?: 'lowercase' | 'uppercase'
  compress?: boolean
  ignoreAlpha?: boolean
}

export type Config = {
  hex?: HexConfig
}

export const defaultConfig: Config = {
  hex: {
    transform: 'lowercase',
    compress: false,
    ignoreAlpha: false,
  },
}
