import { useEffect } from 'react'
import { useContent } from './context/ContentContext'
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
import { SchemaOrg } from './components/SchemaOrg'
import './index.css'

function App() {
  const { content, loading } = useContent()

  // Update SEO meta tags dynamically
  useEffect(() => {
    if (loading) return

    // Update title
    const title = content.seo_title || 'Кладбище «Киово» — Информационный портал'
    document.title = title

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = content.seo_description || 'Официальный информационный портал кладбища «Киово». Расположение, часы работы, контакты администрации, правила посещения.'

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.name = 'keywords'
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.content = content.seo_keywords || 'кладбище Киово, Лобня, ритуальные услуги, захоронения, мемориал'

    // Update Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.content = title

    // Update Open Graph description
    let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement
    if (!ogDesc) {
      ogDesc = document.createElement('meta')
      ogDesc.setAttribute('property', 'og:description')
      document.head.appendChild(ogDesc)
    }
    ogDesc.content = content.seo_description || 'Официальный информационный портал кладбища «Киово»'

    // Update favicon if set
    if (content.favicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = content.favicon
      }
    }
  }, [content, loading])

  return (
    <>
      <SchemaOrg />
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
