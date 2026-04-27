import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { GeneralInfo } from './components/GeneralInfo'
import { Location } from './components/Location'
import { HoursAndRules } from './components/HoursAndRules'
import { Contacts } from './components/Contacts'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import './index.css'

function App() {
  return (
    <>
      <Navigation />
      <Hero />
      <GeneralInfo />
      <Location />
      <HoursAndRules />
      <Contacts />
      <FAQ />
      <Footer />
    </>
  )
}

export default App
