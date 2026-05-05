import { useState, useEffect } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FacilityItem {
  icon: string;
  title: string;
  description: string;
  svg_filename?: string;
}

interface ContentData {
  [key: string]: string | Array<{ id: number; filename: string; title: string }>;
  general_info_title: string;
  general_info_content: string;
  location_title: string;
  location_address: string;
  location_coords: string;
  location_car: string;
  location_transport: string;
  infrastructure_title: string;
  infrastructure_content: string;
  infrastructure_facilities: string;
  hours_title: string;
  hours_summer: string;
  hours_winter: string;
  hours_rules: string;
  contacts_title: string;
  contacts_org: string;
  contacts_phone: string;
  contacts_address: string;
  contacts_weekday: string;
  contacts_saturday: string;
  contacts_sunday: string;
  faq_title: string;
  faq_items: string;
  gallery_images: Array<{ id: number; filename: string; title: string }>;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  favicon: string;
}

export function AdminPanel() {
  const defaultFaqItems: FaqItem[] = [
    {
      question: 'Как найти конкретную могилу?',
      answer: 'Сообщите в администрацию ФИО погребенного и примерный год захоронения. Сотрудники предоставят номер участка, ряда и места.',
    },
    {
      question: 'Можно ли приехать на машине прямо к участку?',
      answer: 'Транспорт на территорию не допускается, так как есть только дорожки для пешеходов.',
    },
    {
      question: 'Работает ли вода зимой?',
      answer: 'Водоснабжение отключается с ноября по апрель во избежание разморозки труб.',
    },
    {
      question: 'Куда обращаться по вопросам вандализма или аварийных деревьев?',
      answer: 'Поста охраны нет, вместо него — администрация у центрального входа.',
    },
  ];

  const defaultFacilities: FacilityItem[] = [
    { icon: 'building', title: 'Административное здание', description: 'Администрация находится возле центрального входа' },
    { icon: 'chapel', title: 'Часовня-молитвенный дом', description: 'Возле центрального входа, с левой стороны' },
    { icon: 'water', title: 'Водоразборные колонки', description: '3 точки, работают сезонно (май–октябрь)' },
    { icon: 'trash', title: 'Контейнерные площадки', description: 'возле администрации кладбища, около сектора 11, сектора 12 и сектора 24' },
    { icon: 'inventory', title: 'Места для инвентаря', description: 'Метелки, грабли и лопаты доступны в пункте охраны под залог документа' },
    { icon: 'map', title: 'Схема участков', description: 'Схема секторов расположена у центрального входа' },
  ];

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [content, setContent] = useState<ContentData>({
    general_info_title: '',
    general_info_content: '',
    location_title: '',
    location_address: '',
    location_coords: '',
    location_car: '',
    location_transport: '',
    infrastructure_title: '',
    infrastructure_content: '',
    infrastructure_facilities: '',
    hours_title: '',
    hours_summer: '',
    hours_winter: '',
    hours_rules: '',
    contacts_title: '',
    contacts_org: '',
    contacts_phone: '',
    contacts_address: '',
    contacts_weekday: '',
    contacts_saturday: '',
    contacts_sunday: '',
    faq_title: '',
    faq_items: '',
    gallery_images: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    favicon: '',
  });
  const [faqEditor, setFaqEditor] = useState<FaqItem[]>(defaultFaqItems);
  const [facilitiesEditor, setFacilitiesEditor] = useState<FacilityItem[]>(defaultFacilities);
  const [svgError, setSvgError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '' });
  const [seoForm, setSeoForm] = useState({ seo_title: '', seo_description: '', seo_keywords: '' });

  const API_BASE = '';

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      loadContent();
    } else {
      setLoading(false);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    
    try {
      const formData = new FormData();
      formData.append('username', loginForm.username);
      formData.append('password', loginForm.password);
      
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('admin_token', data.access_token);
        setIsAuthenticated(true);
        loadContent();
      } else {
        const error = await response.json();
        setLoginError(error.detail || 'Ошибка входа');
      }
    } catch (error) {
      setLoginError('Ошибка подключения');
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    try {
      const formData = new FormData();
      formData.append('old_password', passwordForm.old);
      formData.append('new_password', passwordForm.new);
      
      const response = await fetch(`${API_BASE}/api/change-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      if (response.ok) {
        alert('Пароль изменён! Теперь войдите с новым паролем');
        setPasswordForm({ old: '', new: '' });
        setShowPasswordChange(false);
        handleLogout(); // Выход после смены пароля
      } else {
        const error = await response.json();
        alert(error.detail || 'Ошибка');
      }
    } catch (error) {
      alert('Ошибка подключения');
    }
  }

  function parseJsonArray<T>(raw: unknown, fallback: T[]): T[] {
    if (!raw) return fallback;
    if (Array.isArray(raw)) return raw as T[];
    if (typeof raw !== 'string') return fallback;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
      return fallback;
    }
  }

  function updateFaqItem(index: number, key: keyof FaqItem, value: string) {
    setFaqEditor(prev => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function updateFacilityItem(index: number, key: keyof FacilityItem, value: string) {
    setFacilitiesEditor(prev => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function addFaqItem() {
    setFaqEditor(prev => [...prev, { question: '', answer: '' }]);
  }

  function removeFaqItem(index: number) {
    setFaqEditor(prev => prev.filter((_, i) => i !== index));
  }

  function addFacilityItem() {
    setFacilitiesEditor(prev => [...prev, { icon: 'building', title: '', description: '' }]);
  }

  function removeFacilityItem(index: number) {
    setFacilitiesEditor(prev => prev.filter((_, i) => i !== index));
  }

  async function uploadInfrastructureSvg(index: number, file?: File) {
    if (!file) return;
    setSvgError('');

    const svgText = await file.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgTag = svgDoc.querySelector('svg');
    if (!svgTag) {
      setSvgError('Файл не содержит корректный тег <svg>.');
      return;
    }

    const viewBox = svgTag.getAttribute('viewBox')?.trim() ?? '';
    const width = svgTag.getAttribute('width')?.replace('px', '').trim() ?? '';
    const height = svgTag.getAttribute('height')?.replace('px', '').trim() ?? '';
    const sizeOk = viewBox === '0 0 64 64' || (width === '64' && height === '64');
    if (!sizeOk) {
      setSvgError('SVG должен иметь viewBox "0 0 64 64" или width/height = 64px.');
      return;
    }

    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/upload-infrastructure-svg`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      setSvgError('Не удалось загрузить SVG на сервер.');
      return;
    }

    const data = await response.json();
    setFacilitiesEditor(prev =>
      prev.map((item, i) => (i === index ? { ...item, svg_filename: String(data.filename || '') } : item)),
    );
  }

  async function loadContent() {
    try {
      const response = await fetch(`${API_BASE}/api/content`);
      const data = await response.json();

      // Ensure all string fields are strings
      const safeData: ContentData = {
        general_info_title: String(data.general_info_title || ''),
        general_info_content: String(data.general_info_content || ''),
        location_title: String(data.location_title || ''),
        location_address: String(data.location_address || ''),
        location_coords: String(data.location_coords || ''),
        location_car: String(data.location_car || ''),
        location_transport: String(data.location_transport || ''),
        infrastructure_title: String(data.infrastructure_title || ''),
        infrastructure_content: String(data.infrastructure_content || ''),
        infrastructure_facilities: String(data.infrastructure_facilities || ''),
        hours_title: String(data.hours_title || ''),
        hours_summer: String(data.hours_summer || ''),
        hours_winter: String(data.hours_winter || ''),
        hours_rules: String(data.hours_rules || ''),
        contacts_title: String(data.contacts_title || ''),
        contacts_org: String(data.contacts_org || ''),
        contacts_phone: String(data.contacts_phone || ''),
        contacts_address: String(data.contacts_address || ''),
        contacts_weekday: String(data.weekday || ''),
        contacts_saturday: String(data.saturday || ''),
        contacts_sunday: String(data.sunday || ''),
        faq_title: String(data.faq_title || ''),
        faq_items: String(data.faq_items || ''),
        gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
        seo_title: String(data.seo_title || ''),
        seo_description: String(data.seo_description || ''),
        seo_keywords: String(data.seo_keywords || ''),
        favicon: String(data.favicon || ''),
      };

      setSeoForm({
        seo_title: String(data.seo_title || ''),
        seo_description: String(data.seo_description || ''),
        seo_keywords: String(data.seo_keywords || ''),
      });

      setContent(safeData);
      setFaqEditor(parseJsonArray<FaqItem>(data.faq_items, defaultFaqItems));
      setFacilitiesEditor(parseJsonArray<FacilityItem>(data.infrastructure_facilities, defaultFacilities));
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveContent(section: string) {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      const formData = new FormData();
      const titleKey = `${section}_title`;
      const contentKey = `${section}_content`;
      
      const titleValue = content[titleKey];
      const contentValue = content[contentKey];
      
      if (typeof titleValue === 'string' && titleValue) formData.append('title', titleValue);
      if (typeof contentValue === 'string' && contentValue) formData.append('content', contentValue);

      if (section === 'faq') {
        formData.append('items', JSON.stringify(faqEditor, null, 2));
      }
      if (section === 'infrastructure') {
        formData.append('facilities', JSON.stringify(facilitiesEditor, null, 2));
      }
      
      // Extra fields - base list
      let extraFields = ['address', 'coords', 'car', 'transport', 'summer', 'winter', 'rules', 'org', 'phone'];
      
      // Add reception hours when saving contacts
      if (section === 'contacts') {
        extraFields = extraFields.concat(['weekday', 'saturday', 'sunday']);
      }
      
      extraFields.forEach(field => {
        const key = `${section}_${field}`;
        const value = content[key];
        if (typeof value === 'string' && value) {
          formData.append(field, value);
        }
      });

      const response = await fetch(`${API_BASE}/api/content/${section}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        alert('Сохранено!');
      } else {
        alert('Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const fileInput = document.getElementById('gallery_file') as HTMLInputElement;
    const titleInput = document.getElementById('gallery_title') as HTMLInputElement;
    
    if (!fileInput.files?.[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('title', titleInput.value);

    try {
      const response = await fetch(`${API_BASE}/api/gallery/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        fileInput.value = '';
        titleInput.value = '';
        loadContent();
        alert('Фото загружено!');
      }
    } catch (error) {
      alert('Ошибка загрузки');
    }
  }

  async function deleteImage(id: number) {
    if (!confirm('Удалить фото?')) return;
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) loadContent();
    } catch (error) {
      alert('Ошибка удаления');
    }
  }

  async function uploadFavicon(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const fileInput = document.getElementById('favicon_file') as HTMLInputElement;
    if (!fileInput.files?.[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const response = await fetch(`${API_BASE}/api/upload-favicon`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        fileInput.value = '';
        alert('Favicon загружен!');
        loadContent();
      } else {
        alert('Ошибка загрузки');
      }
    } catch (error) {
      alert('Ошибка подключения');
    }
  }

  async function saveSeoSettings(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    try {
      const formData = new FormData();
      formData.append('seo_title', seoForm.seo_title);
      formData.append('seo_description', seoForm.seo_description);
      formData.append('seo_keywords', seoForm.seo_keywords);

      const response = await fetch(`${API_BASE}/api/content`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        alert('SEO настройки сохранены!');
        loadContent();
      } else {
        alert('Ошибка сохранения');
      }
    } catch (error) {
      alert('Ошибка подключения');
    }
  }

  const tabs = [
    { id: 'general', label: 'Общие сведения' },
    { id: 'location', label: 'Расположение' },
    { id: 'infrastructure', label: 'Инфраструктура' },
    { id: 'hours', label: 'Часы работы' },
    { id: 'contacts', label: 'Контакты' },
    { id: 'faq', label: 'FAQ' },
    { id: 'gallery', label: 'Галерея' },
    { id: 'settings', label: 'Настройки' },
  ];

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">CMS - Кладбище «Киово»</h1>
          <h2 className="text-lg text-gray-600 mb-6 text-center">Вход для администраторов</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя пользователя</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">CMS - Кладбище «Киово»</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-gray-600 hover:text-gray-800"
            >
              Сменить пароль
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Выйти
            </button>
          </div>
        </div>

        {showPasswordChange && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Смена пароля</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
                <input
                  type="password"
                  value={passwordForm.old}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                  Изменить пароль
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordChange(false); setPasswordForm({ old: '', new: '' }); }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t whitespace-nowrap ${
                activeTab === tab.id ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* General Info */}
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Общие сведения</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={content.general_info_title || ''}
                    onChange={(e) => setContent({ ...content, general_info_title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Текст</label>
                  <textarea
                    value={typeof content.general_info_content === 'string' ? content.general_info_content : ''}
                    onChange={(e) => setContent({ ...content, general_info_content: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={10}
                  />
                </div>
                <button
                  onClick={() => saveContent('general_info')}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}

          {/* Location */}
          {activeTab === 'location' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Расположение</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={content.location_title || ''}
                    onChange={(e) => setContent({ ...content, location_title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                  <textarea
                    value={content.location_address || ''}
                    onChange={(e) => setContent({ ...content, location_address: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Координаты</label>
                  <input
                    type="text"
                    value={content.location_coords || ''}
                    onChange={(e) => setContent({ ...content, location_coords: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Инструкция (авто)</label>
                  <textarea
                    value={typeof content.location_car === 'string' ? content.location_car : ''}
                    onChange={(e) => setContent({ ...content, location_car: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Инструкция (транспорт)</label>
                  <textarea
                    value={typeof content.location_transport === 'string' ? content.location_transport : ''}
                    onChange={(e) => setContent({ ...content, location_transport: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={6}
                  />
                </div>
                <button
                  onClick={() => saveContent('location')}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}

          {/* Infrastructure */}
          {activeTab === 'infrastructure' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Инфраструктура</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={content.infrastructure_title || ''}
                    onChange={(e) => setContent({ ...content, infrastructure_title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={content.infrastructure_content || ''}
                    onChange={(e) => setContent({ ...content, infrastructure_content: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Карточки инфраструктуры</label>
                    <button
                      type="button"
                      onClick={addFacilityItem}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      Добавить карточку
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">SVG: рекомендованный размер — viewBox 0 0 64 64 (или width/height 64px)</p>
                  {facilitiesEditor.map((item, index) => (
                    <div key={index} className="border rounded p-4 space-y-3 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-3">
                        <select
                          value={item.icon}
                          onChange={(e) => updateFacilityItem(index, 'icon', e.target.value)}
                          className="border rounded px-3 py-2"
                        >
                          <option value="building">building</option>
                          <option value="chapel">chapel</option>
                          <option value="water">water</option>
                          <option value="trash">trash</option>
                          <option value="inventory">inventory</option>
                          <option value="map">map</option>
                        </select>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateFacilityItem(index, 'title', e.target.value)}
                          placeholder="Заголовок"
                          className="border rounded px-3 py-2"
                        />
                      </div>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateFacilityItem(index, 'description', e.target.value)}
                        placeholder="Описание"
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                      />
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".svg"
                          onChange={(e) => uploadInfrastructureSvg(index, e.target.files?.[0])}
                          className="border rounded px-3 py-2"
                        />
                        {item.svg_filename && <span className="text-sm text-gray-600">{item.svg_filename}</span>}
                        <button
                          type="button"
                          onClick={() => removeFacilityItem(index)}
                          className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                  {svgError && <p className="text-sm text-red-600">{svgError}</p>}
                </div>
                <button
                  onClick={() => saveContent('infrastructure')}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}

          {/* Hours */}
          {activeTab === 'hours' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Часы работы</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={content.hours_title || ''}
                    onChange={(e) => setContent({ ...content, hours_title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Лето</label>
                    <input
                      type="text"
                      value={content.hours_summer || ''}
                      onChange={(e) => setContent({ ...content, hours_summer: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Зима</label>
                    <input
                      type="text"
                      value={content.hours_winter || ''}
                      onChange={(e) => setContent({ ...content, hours_winter: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Правила</label>
                  <textarea
                    value={typeof content.hours_rules === 'string' ? content.hours_rules : ''}
                    onChange={(e) => setContent({ ...content, hours_rules: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={6}
                  />
                </div>
                <button
                  onClick={() => saveContent('hours')}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}

          {/* Contacts */}
          {activeTab === 'contacts' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Контакты</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={content.contacts_title || ''}
                    onChange={(e) => setContent({ ...content, contacts_title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Организация</label>
                  <input
                    type="text"
                    value={content.contacts_org || ''}
                    onChange={(e) => setContent({ ...content, contacts_org: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                    type="text"
                    value={content.contacts_phone || ''}
                    onChange={(e) => setContent({ ...content, contacts_phone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                  <textarea
                    value={content.contacts_address || ''}
                    onChange={(e) => setContent({ ...content, contacts_address: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Пн-Пт</label>
                    <input
                      type="text"
                      value={content.contacts_weekday || ''}
                      onChange={(e) => setContent({ ...content, contacts_weekday: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Сб</label>
                    <input
                      type="text"
                      value={content.contacts_saturday || ''}
                      onChange={(e) => setContent({ ...content, contacts_saturday: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Вс</label>
                    <input
                      type="text"
                      value={content.contacts_sunday || ''}
                      onChange={(e) => setContent({ ...content, contacts_sunday: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  onClick={() => saveContent('contacts')}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">FAQ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={content.faq_title || ''}
                    onChange={(e) => setContent({ ...content, faq_title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Вопросы и ответы</label>
                    <button
                      type="button"
                      onClick={addFaqItem}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      Добавить вопрос
                    </button>
                  </div>
                  <div className="space-y-3">
                    {faqEditor.map((item, index) => (
                      <div key={index} className="border rounded p-4 bg-gray-50 space-y-2">
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                          placeholder="Вопрос"
                          className="w-full border rounded px-3 py-2"
                        />
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                          placeholder="Ответ"
                          className="w-full border rounded px-3 py-2"
                          rows={3}
                        />
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => removeFaqItem(index)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => saveContent('faq')}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}

          {/* Gallery */}
          {activeTab === 'gallery' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Галерея</h2>
              <form onSubmit={uploadImage} className="mb-6 p-4 bg-gray-50 rounded">
                <div className="grid grid-cols-3 gap-4">
                  <input type="file" id="gallery_file" accept="image/*" className="border rounded px-3 py-2" required />
                  <input type="text" id="gallery_title" placeholder="Описание" className="border rounded px-3 py-2" />
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                    Загрузить
                  </button>
                </div>
              </form>
              <div className="grid grid-cols-4 gap-4">
                {Array.isArray(content.gallery_images) && content.gallery_images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={`/uploads/${img.filename}`} alt={img.title} className="w-full h-48 object-cover rounded" />
                    <p className="text-sm mt-1">{img.title || 'Без названия'}</p>
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
                {!Array.isArray(content.gallery_images) && <p className="text-gray-500">Загрузка...</p>}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Настройки сайта</h2>
              <div className="space-y-4">
                {/* SEO Settings */}
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-medium mb-4">SEO параметры</h3>
                  <form onSubmit={saveSeoSettings} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок (title)</label>
                      <input
                        type="text"
                        value={seoForm.seo_title}
                        onChange={(e) => setSeoForm({ ...seoForm, seo_title: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Кладбище «Киово» — Информационный портал"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Описание (description)</label>
                      <textarea
                        value={seoForm.seo_description}
                        onChange={(e) => setSeoForm({ ...seoForm, seo_description: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        placeholder="Официальный информационный портал кладбища «Киово»..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ключевые слова (keywords)</label>
                      <input
                        type="text"
                        value={seoForm.seo_keywords}
                        onChange={(e) => setSeoForm({ ...seoForm, seo_keywords: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="кладбище Киово, Лобня, ритуальные услуги"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                      Сохранить SEO
                    </button>
                  </form>
                </div>

                {/* Favicon */}
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-medium mb-2">Favicon</h3>
                  <p className="text-sm text-gray-600 mb-4">Загрузите иконку для сайта (favicon.ico или favicon.svg)</p>
                  <form onSubmit={uploadFavicon} className="flex gap-4 items-center">
                    <input type="file" id="favicon_file" accept=".ico,.svg,.png" className="border rounded px-3 py-2" required />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                      Загрузить
                    </button>
                  </form>
                  {content.favicon && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Текущий favicon:</p>
                      <img src={content.favicon} alt="Favicon" className="h-8 w-8 mt-2" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
