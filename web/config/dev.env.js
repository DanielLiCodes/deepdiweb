'use strict'
const { merge } = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      }
    ]
  },
  NODE_ENV: '"development"',
  API_ROOT_URL: '""'
})
