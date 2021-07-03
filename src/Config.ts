export type Config = {
  hex?: {
    transform?: 'lowercase' | 'uppercase'
    compress?: boolean
    ignoreAlpha?: boolean
  }
}

export const defaultConfig: Config = {
  hex: {
    transform: 'lowercase',
    compress: false,
    ignoreAlpha: false,
  },
}
