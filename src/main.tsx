import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { createStore } from './storage/store'
import { UserDataProvider } from './storage/UserDataContext'
import './styles.css'

// Registers the offline cache. The returned update function is deliberately never called:
// a new version takes over only once every tab of the app has been closed.
registerSW()

createStore().then((store) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <UserDataProvider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserDataProvider>
    </StrictMode>,
  )
})
