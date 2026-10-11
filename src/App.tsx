import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AgeGate } from './screens/AgeGate'
import { DrinkPage } from './screens/DrinkPage'
import { IngredientPage } from './screens/IngredientPage'
import { Library } from './screens/Library'
import { MyBar } from './screens/MyBar'
import { NotFound } from './screens/NotFound'
import { Terms } from './screens/Terms'
import { useUserData } from './storage/UserDataContext'

const Placeholder = ({ name }: { name: string }) => <h1>{name}</h1>

export default function App() {
  const { data } = useUserData()
  const { pathname } = useLocation()

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
    <Routes>
      <Route path="/drinks/:id/make" element={<Placeholder name="Making mode" />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Library />} />
        <Route path="/drinks/:id" element={<DrinkPage />} />
        <Route path="/ingredients/:id" element={<IngredientPage />} />
        <Route path="/bar" element={<MyBar />} />
        <Route path="/favourites" element={<Placeholder name="Favourites" />} />
        <Route path="/settings" element={<Placeholder name="Settings" />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
