export function Navigation() {
  const navItems = [
    { href: '#about', label: 'О кладбище' },
    { href: '#location', label: 'Расположение' },
    { href: '#hours', label: 'Часы работы' },
    { href: '#contacts', label: 'Контакты' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav className="bg-stone-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-xl font-semibold hover:text-stone-300 transition-colors">
            Кладбище «Киово»
          </a>
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-stone-300 transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <details className="relative">
              <summary className="cursor-pointer p-2 hover:bg-stone-700 rounded list-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-stone-800 rounded shadow-lg py-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 hover:bg-stone-700 text-sm"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
}
