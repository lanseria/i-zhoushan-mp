
// @ts-check - enable TS check for js file
import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  /* configurations... */

  plugins: [
    // @ts-ignore
    require('windicss/plugin/line-clamp'),
    // ...
  ],
})
