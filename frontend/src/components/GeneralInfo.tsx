import { useContent } from '../context/ContentContext';

export function GeneralInfo() {
  const { content } = useContent();

  const defaultContent = `Кладбище «Киово» — муниципальное кладбище, расположенное в городском округе Лобня Московской области. 
Имеет статус <strong className="text-stone-800">закрытого для новых захоронений</strong> (допускаются 
подзахоронения в родственные могилы и урновые захоронения по согласованию).`;

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-6">
          {content.general_info_title || 'Общие сведения'}
        </h2>
        <div className="prose prose-stone max-w-none">
          <p 
            className="text-stone-600 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.general_info_content || defaultContent }}
          />
        </div>
        
        <div className="mt-8 p-6 bg-stone-100 rounded-lg border-l-4 border-stone-600">
          <p className="text-stone-700">
            <strong>Важно:</strong> Для оформления документов, уточнения границ участков, получения разрешений 
            на установку надгробий или заказа ухода обращайтесь лично или по телефону. При себе иметь паспорт 
            и документы, подтверждающие родство или право распоряжения местом захоронения.
          </p>
        </div>
      </div>
    </section>
  );
}
