import { useContent } from '../context/ContentContext';

export function Footer() {
  const { content } = useContent();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-800 text-stone-300 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">Кладбище «Киово»</h3>
            <p className="text-stone-400 text-sm">
              Муниципальное кладбище в городском округе Лобня Московской области
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Навигация</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white transition-colors">О кладбище</a></li>
              <li><a href="#location" className="hover:text-white transition-colors">Расположение</a></li>
              <li><a href="#infrastructure" className="hover:text-white transition-colors">Инфраструктура</a></li>
              <li><a href="#contacts" className="hover:text-white transition-colors">Контакты</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">Контакты</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${content.contacts_phone?.replace(/\s/g, '') || '+74993224842'}`} className="hover:text-white transition-colors">
                  {content.contacts_phone || '+7 (499) 322-48-42'}
                </a>
              </li>
              <li>
                <span className="text-stone-400">{content.contacts_address || 'Кабинет администрации у центрального входа'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 pt-6 text-center text-sm text-stone-500">
          <p>&copy; {currentYear} Кладбище «Киово». Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
