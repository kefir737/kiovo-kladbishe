import { useContent } from '../context/ContentContext';

export function HoursAndRules() {
  const { content } = useContent();

  return (
    <section id="hours" className="py-16 bg-stone-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-8">
          {content.hours_title || 'Часы работы и правила посещения'}
        </h2>

        {/* Hours Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Summer Hours */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-stone-800">Май–сентябрь</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{content.hours_summer || '08:00–20:00'}</p>
          </div>

          {/* Winter Hours */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-stone-800">Октябрь–апрель</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{content.hours_winter || '09:00–18:00'}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-green-800">
            <strong>Вход свободный.</strong> Захоронения и подзахоронения — только по предварительному разрешению.
          </p>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Основные правила
          </h3>
          
          <div className="space-y-4" dangerouslySetInnerHTML={{ __html: content.hours_rules || `
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">!</span>
              <p className="text-stone-600">
                <strong className="text-stone-800">Запрещается:</strong> разводить костры, оставлять стеклянную тару, 
                повреждать ограждения, самовольно высаживать деревья
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold">!</span>
              <p className="text-stone-600">
                <strong className="text-stone-800">Транспорт:</strong> допускается только по пропускам 
                (для маломобильных граждан — по заявке в администрацию)
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">i</span>
              <p className="text-stone-600">
                <strong className="text-stone-800">Уход за могилами:</strong> осуществляется родственниками 
                или по договору с аккредитованной ритуальной организацией
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">i</span>
              <p className="text-stone-600">
                <strong className="text-stone-800">Установка памятников, оград и цоколей:</strong> требует 
                согласования проекта и получения разрешения
              </p>
            </div>
          `}} />
        </div>
      </div>
    </section>
  );
}
