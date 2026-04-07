import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    "dist",
    "src/services/api.js",
    "src/registrationpage/loginpages/Logincontext.jsx",
    "src/registrationpage/loginpages/login.jsx",
    "src/registrationpage/Registration.jsx",
    "src/registrationpage/wishlisht/wihlist.jsx",
    "src/registrationpage/wishlisht/wishlistcontext.jsx",
    "src/home/Home.jsx",
    "src/home/content/catalog/CatalogPage.jsx",
    "src/home/content/catagory/Men.jsx",
    "src/home/content/catagory/Women.jsx",
    "src/home/content/cartpages/Cart.jsx",
    "src/home/content/Detailspage/Details.jsx",
    "src/home/content/checkout/Checkout.jsx",
    "src/home/content/orderpage/order.jsx",
    "src/home/content/orderpage/ordercontext.jsx",
    "src/home/content/Userdetails/Userdetails.jsx",
    "src/admin/Adminhome.jsx/**",
    "src/admin/Protected .jsx",
    "src/admin/orderpages/Orderpage.jsx",
    "src/admin/users/users.jsx",
    "src/admin/addminproduct/**",
    "src/admin/Removeproduct/**",
    "src/admin/addproduct/**",
    "src/admin/updateproduct/**",
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
