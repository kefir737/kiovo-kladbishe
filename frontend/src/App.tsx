import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { GeneralInfo } from './components/GeneralInfo'
import { Gallery } from './components/Gallery'
import { Location } from './components/Location'
import { Infrastructure } from './components/Infrastructure'
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
      <Gallery />
      <Location />
      <Infrastructure />
      <HoursAndRules />
      <Contacts />
      <FAQ />
      <Footer />
    </>
  )
}

export default App
