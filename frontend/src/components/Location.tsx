import { useContent } from '../context/ContentContext';

export function Location() {
  const { content } = useContent();

  return (
    <section id="location" className="py-16 bg-stone-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-6">
          {content.location_title || 'Расположение и схема проезда'}
        </h2>
        
        {/* Address and Coordinates */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-stone-800 font-medium text-lg">
                {content.location_address || 'Адрес: Московская область, г.о. Лобня, д. Киово, северная окраина'}
              </p>
              <p className="text-stone-600 mt-2">
                Ориентир — указатель «Кладбище Киово» с автодороги Лобня–Киово
              </p>
              <p className="text-stone-600 mt-2">
                <strong>Координаты:</strong> {content.location_coords || '56.0342° N, 37.4815° E'}
              </p>
              <a 
                href="https://yandex.ru/maps/?text=56.0342,37.4815" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-600 hover:text-blue-700 underline"
              >
                Открыть в Яндекс.Картах
              </a>
            </div>
          </div>
        </div>

        {/* Car Directions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-stone-800">На автомобиле</h3>
          </div>
          <div className="text-stone-600" dangerouslySetInnerHTML={{ __html: content.location_car || `
            <ol className="list-decimal list-inside space-y-2">
              <li>От МКАД по Дмитровскому шоссе</li>
              <li>Съезд на Лобню</li>
              <li>Далее по ул. Ленина до перекрёстка с указателем на д. Киово</li>
              <li>По главной дороге деревни до шлагбаума кладбища</li>
            </ol>
          `}} />
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-stone-700">
              🅿️ У главного входа оборудована <strong>бесплатная парковка на ~60 мест</strong>. 
              В дни массового посещения (Радоница, родительские субботы, Троица) парковка заполняется к 09:30, 
              рекомендуется приезжать заранее или использовать общественный транспорт.
            </p>
          </div>
        </div>

        {/* Public Transport */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-stone-800">Общественным транспортом</h3>
          </div>
          <div className="text-stone-600" dangerouslySetInnerHTML={{ __html: content.location_transport || `
            <p>От ж/д станции <strong>«Лобня»</strong> (Савёловское направление МЦД-1):</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Автобусом № 22 или маршрутным такси № 22к</li>
              <li>До остановки «Деревня Киово»</li>
              <li>Далее пешком ~800 м по асфальтированной, затем грунтовой дороге</li>
            </ul>
            <p className="text-stone-700 font-medium">Время в пути от станции — 15–20 мин.</p>
          `}} />
        </div>
      </div>
    </section>
  );
}
