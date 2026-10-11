import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AgeGate } from './screens/AgeGate'
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
        <Route path="/" element={<Placeholder name="Drinks" />} />
        <Route path="/drinks/:id" element={<Placeholder name="Drink" />} />
        <Route path="/ingredients/:id" element={<Placeholder name="Ingredient" />} />
        <Route path="/bar" element={<Placeholder name="My bar" />} />
        <Route path="/favourites" element={<Placeholder name="Favourites" />} />
        <Route path="/settings" element={<Placeholder name="Settings" />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
