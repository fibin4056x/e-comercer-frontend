import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WishlistProvider from './registrationpage/wishlisht/wishlistcontext.jsx'
import App from './App.jsx'
import Logincontext from './registrationpage/loginpages/Logincontext.jsx'
import OrderProvider from './home/content/orderpage/ordercontext.jsx' 
// 
createRoot(document.getElementById('root')).render(
  <StrictMode>
   
    <Logincontext>
      <WishlistProvider>
      <OrderProvider>
        <App />
      </OrderProvider>
    </WishlistProvider> 
    </Logincontext>
   
  </StrictMode>,
)
