import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RouteChange } from './components/RouteChange'
import { AgeGate } from './screens/AgeGate'
import { DrinkPage } from './screens/DrinkPage'
import { Favourites } from './screens/Favourites'
import { IngredientPage } from './screens/IngredientPage'
import { Library } from './screens/Library'
import { MakingMode } from './screens/MakingMode'
import { MyBar } from './screens/MyBar'
import { NotFound } from './screens/NotFound'
import { Settings } from './screens/Settings'
import { Terms } from './screens/Terms'
import { useUserData } from './storage/UserDataContext'
import { applyTheme } from './theme/applyTheme'

export default function App() {
  const { data } = useUserData()
  const { pathname } = useLocation()
  const { theme, scheme } = data.settings

  useEffect(() => applyTheme(theme, scheme), [theme, scheme])

  if (!data.settings.ageConfirmed) {
    return pathname === '/terms' ? (
      <main className="gate">
        <Terms />
      </main>
    ) : (
      <AgeGate />
    )
  }

  return (
    <>
      <RouteChange />
      <Routes>
      <Route path="/drinks/:id/make" element={<MakingMode />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Library />} />
        <Route path="/drinks/:id" element={<DrinkPage />} />
        <Route path="/ingredients/:id" element={<IngredientPage />} />
        <Route path="/bar" element={<MyBar />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      </Routes>
    </>
  )
}
