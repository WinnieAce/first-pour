import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { createStore } from './storage/store'
import { UserDataProvider } from './storage/UserDataContext'
import './styles.css'

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
