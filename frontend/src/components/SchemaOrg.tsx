import { useContent } from '../context/ContentContext'

export function SchemaOrg() {
  const { content } = useContent()

  // Parse coordinates
  const coords = content.location_coords || '56.0342, 37.4815'
  const [lat, lng] = coords.replace(/[°NSEW]/g, '').split(',').map((s: string) => s.trim())

  // Parse phone
  const phone = content.contacts_phone || '+7 (499) 322-48-42'
  const phoneClean = phone.replace(/[^0-9+]/g, '')

  // Get hours
  const weekday = content.contacts_weekday || '09:00–17:00'
  const saturday = content.contacts_saturday || '10:00–14:00'
  const sunday = content.contacts_sunday || 'Выходной'

  // Parse hours to times
  const parseHours = (hours: string) => {
    const match = hours.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/)
    return match ? { opens: match[1], closes: match[2] } : { opens: '09:00', closes: '17:00' }
  }

  const weekdayHours = parseHours(weekday)
  const saturdayHours = parseHours(saturday)
  const isSundayOpen = sunday !== 'Выходной' && sunday !== 'Выходные'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Cemetery',
    name: 'Кладбище «Киово»',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'д. Киово, северная окраина',
      addressLocality: 'Лобня',
      addressRegion: 'Московская область',
      postalCode: '141730',
      addressCountry: 'RU'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: parseFloat(lat) || 56.0342,
      longitude: parseFloat(lng) || 37.4815
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: weekdayHours.opens,
        closes: weekdayHours.closes
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: saturdayHours.opens,
        closes: saturdayHours.closes
      },
      ...(isSundayOpen ? [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: parseHours(sunday).opens,
        closes: parseHours(sunday).closes
      }] : [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '00:00',
        closes: '00:00'
      }])
    ],
    telephone: phoneClean,
    url: 'https://kladbishe-kiovo.ru',
    description: content.seo_description || 'Муниципальное кладбище в городском округе Лобня Московской области',
    sameAs: content.location_address ? undefined : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  )
}
