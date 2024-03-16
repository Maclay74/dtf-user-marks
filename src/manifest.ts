import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/icon16.png',
    32: 'img/icon32.png',
    48: 'img/icon48.png',
    128: 'img/icon128.png',
  },
  content_scripts: [
    {
      matches: ['https://dtf.ru/*'],
      js: ['src/content/index.ts'],
    },
  ],
  permissions: ['storage'],
  host_permissions: ['https://dtf.ru/'],
  web_accessible_resources: [
    {
      resources: [
        'img/icon16.png',
        'img/icon32.png',
        'img/icon48.png',
        'img/icon128.png',
      ],
      matches: [],
    },
  ],
})
