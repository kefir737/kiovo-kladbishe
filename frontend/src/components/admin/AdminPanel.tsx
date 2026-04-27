import { useState, useEffect } from 'react';
import { RichTextEditor } from './RichTextEditor';

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
  hours_title: string;
  hours_summer: string;
  hours_winter: string;
  hours_rules: string;
  contacts_title: string;
  contacts_org: string;
  contacts_phone: string;
  contacts_address: string;
  hours_weekday: string;
  hours_saturday: string;
  hours_sunday: string;
  faq_title: string;
  faq_items: string;
  gallery_images: Array<{ id: number; filename: string; title: string }>;
}

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [content, setContent] = useState<ContentData>({} as ContentData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '' });

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
        alert('Пароль изменён!');
        setPasswordForm({ old: '', new: '' });
        setShowPasswordChange(false);
      } else {
        const error = await response.json();
        alert(error.detail || 'Ошибка');
      }
    } catch (error) {
      alert('Ошибка подключения');
    }
  }

  async function loadContent() {
    try {
      const response = await fetch(`${API_BASE}/api/content`);
      const data = await response.json();
      setContent(data);
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
      
      // Extra fields
      const extraFields = ['address', 'coords', 'car', 'transport', 'summer', 'winter', 'rules', 'org', 'phone', 'weekday', 'saturday', 'sunday', 'items'];
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

  const tabs = [
    { id: 'general', label: 'Общие сведения' },
    { id: 'location', label: 'Расположение' },
    { id: 'infrastructure', label: 'Инфраструктура' },
    { id: 'hours', label: 'Часы работы' },
    { id: 'contacts', label: 'Контакты' },
    { id: 'faq', label: 'FAQ' },
    { id: 'gallery', label: 'Галерея' },
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
                  <RichTextEditor
                    value={content.general_info_content || ''}
                    onChange={(value) => setContent({ ...content, general_info_content: value })}
                    placeholder="Введите текст..."
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
                  <RichTextEditor
                    value={content.location_car || ''}
                    onChange={(value) => setContent({ ...content, location_car: value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Инструкция (транспорт)</label>
                  <RichTextEditor
                    value={content.location_transport || ''}
                    onChange={(value) => setContent({ ...content, location_transport: value })}
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
                  <RichTextEditor
                    value={content.hours_rules || ''}
                    onChange={(value) => setContent({ ...content, hours_rules: value })}
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
                      value={content.hours_weekday || ''}
                      onChange={(e) => setContent({ ...content, hours_weekday: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Сб</label>
                    <input
                      type="text"
                      value={content.hours_saturday || ''}
                      onChange={(e) => setContent({ ...content, hours_saturday: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Вс</label>
                    <input
                      type="text"
                      value={content.hours_sunday || ''}
                      onChange={(e) => setContent({ ...content, hours_sunday: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Вопросы (JSON)</label>
                  <textarea
                    value={content.faq_items || ''}
                    onChange={(e) => setContent({ ...content, faq_items: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={10}
                  />
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
                {content.gallery_images?.map((img) => (
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
