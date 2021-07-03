module.exports = {
  env: {
    test: {
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  },
}
