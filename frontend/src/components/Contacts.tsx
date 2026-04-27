export function Contacts() {
  return (
    <section id="contacts" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-8">
          Контакты администрации
        </h2>

        <div className="bg-stone-50 rounded-lg shadow p-6 mb-8">
          <p className="text-stone-600 mb-6">
            Управляющая организация: <strong className="text-stone-800">МКУ «Ритуальные услуги г.о. Лобня»</strong>
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Phone numbers */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-stone-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-stone-800 font-medium">Приёмная:</p>
                  <a href="tel:+7495XXXXXXX" className="text-blue-600 hover:text-blue-700">+7 (495) XXX-XX-XX</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-stone-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-stone-800 font-medium">Диспетчер по захоронениям и пропускам:</p>
                  <a href="tel:+7495XXXXXXX" className="text-blue-600 hover:text-blue-700">+7 (495) XXX-XX-XX</a>
                </div>
              </div>
            </div>

            {/* Email and Address */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-stone-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-stone-800 font-medium">Email:</p>
                  <a href="mailto:kiovo.cemetery@lobnya.ru" className="text-blue-600 hover:text-blue-700">
                    kiovo.cemetery@lobnya.ru
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-stone-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <p className="text-stone-800 font-medium">Адрес:</p>
                  <p className="text-stone-600">Кабинет администрации у центрального входа, здание с вывеской «Ритуальные услуги»</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reception Hours */}
        <div className="bg-white border-2 border-stone-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Приём граждан
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-stone-50 rounded p-4 text-center">
              <p className="text-stone-500 text-sm">Пн–Пт</p>
              <p className="text-stone-800 font-semibold text-lg">09:00–17:00</p>
            </div>
            <div className="bg-stone-50 rounded p-4 text-center">
              <p className="text-stone-500 text-sm">Сб</p>
              <p className="text-stone-800 font-semibold text-lg">10:00–14:00</p>
            </div>
            <div className="bg-stone-100 rounded p-4 text-center">
              <p className="text-stone-500 text-sm">Вс</p>
              <p className="text-stone-600 font-semibold text-lg">Выходной</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            Для оформления документов, уточнения границ участков, получения разрешений на установку надгробий 
            или заказа ухода обращайтесь <strong>лично или по телефону</strong>. При себе иметь паспорт и документы, 
            подтверждающие родство или право распоряжения местом захоронения.
          </p>
        </div>
      </div>
    </section>
  );
}
