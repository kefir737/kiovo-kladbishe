import { useContent } from '../context/ContentContext';

interface Facility {
  icon?: string;
  title: string;
  description: string;
  svg_filename?: string;
}

const defaultFacilities: Facility[] = [
  {
    icon: 'building',
    title: 'Административное здание',
    description: 'Администрация находится возле центрального входа',
  },
  {
    icon: 'chapel',
    title: 'Часовня-молитвенный дом',
    description: 'Возле центрального входа, с левой стороны',
  },
  {
    icon: 'water',
    title: 'Водоразборные колонки',
    description: '3 точки, работают сезонно (май–октябрь)',
  },
  {
    icon: 'trash',
    title: 'Контейнерные площадки',
    description: 'возле администрации кладбища, около сектора 11, сектора 12 и сектора 24',
  },
  {
    icon: 'inventory',
    title: 'Места для инвентаря',
    description: 'Метелки, грабли и лопаты доступны в пункте охраны под залог документа',
  },
  {
    icon: 'map',
    title: 'Схема участков',
    description: 'Схема секторов расположена у центрального входа',
  },
];

function getFallbackIcon(icon?: string) {
  switch (icon) {
    case 'chapel':
      return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
    case 'water':
      return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
    case 'trash':
      return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
    case 'inventory':
      return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
    case 'map':
      return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
    case 'building':
    default:
      return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  }
}

export function Infrastructure() {
  const { content } = useContent();

  let facilities = defaultFacilities;
  if (typeof content.infrastructure_facilities === 'string' && content.infrastructure_facilities) {
    try {
      const parsed = JSON.parse(content.infrastructure_facilities);
      if (Array.isArray(parsed) && parsed.length > 0) {
        facilities = parsed;
      }
    } catch (e) {
      console.error('Error parsing infrastructure facilities:', e);
    }
  }

  return (
    <section id="infrastructure" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-4">
          {content.infrastructure_title || 'Планировка и инфраструктура'}
        </h2>
        <p className="text-stone-600 mb-10 text-lg">
          {content.infrastructure_content || 'Территория разделена на 12 пронумерованных участков. У каждого входа размещены стенды со схемой расположения рядов и мест.'}
        </p>

        {/* Facilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, index) => (
            <div
              key={index}
              className="bg-stone-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-stone-600 mb-4">
                {facility.svg_filename ? (
                  <img
                    src={`/uploads/${facility.svg_filename}`}
                    alt={facility.title}
                    className="w-8 h-8 object-contain"
                    loading="lazy"
                  />
                ) : (
                  getFallbackIcon(facility.icon)
                )}
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                {facility.title}
              </h3>
              <p className="text-stone-600 text-sm">{facility.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
