import { useState } from 'react';
import { useContent } from '../context/ContentContext';

const defaultFaqItems = [
  {
    question: 'Как найти конкретную могилу?',
    answer: 'Сообщите в администрацию ФИО погребённого и примерный год захоронения. Сотрудники предоставят номер участка, ряда и места. Электронный реестр доступен по QR-коду у входов.',
  },
  {
    question: 'Можно ли приехать на машине прямо к участку?',
    answer: 'Транспорт на территорию не допускается, так как есть только дорожки для пешеходов.',
  },
  {
    question: 'Работает ли вода зимой?',
    answer: 'Водоснабжение отключается с ноября по апрель во избежание разморозки труб. В этот период рекомендуется привозить воду с собой.',
  },
  {
    question: 'Как добраться в Радоницу и родительские субботы?',
    answer: 'Организуются дополнительные автобусные рейсы от ст. Лобня с 07:30 до 14:00. Расписание публикуется на сайте администрации г.о. Лобня за 5–7 дней до даты. Парковка у кладбища в эти дни работает в усиленном режиме.',
  },
  {
    question: 'Куда обращаться по вопросам вандализма или аварийных деревьев?',
    answer: 'Поста охраны нет, вместо него — администрация у центрального входа.',
  },
];

export function FAQ() {
  const { content } = useContent();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  let faqItems = defaultFaqItems;
  if (content.faq_items) {
    try {
      const parsed = JSON.parse(content.faq_items);
      if (Array.isArray(parsed)) {
        faqItems = parsed;
      }
    } catch (e) {
      console.error('Error parsing FAQ items:', e);
    }
  }

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-stone-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-8">
          {content.faq_title || 'Часто задаваемые вопросы'}
        </h2>

        <div className="space-y-4">
          {faqItems.map((item: { question: string; answer: string }, index: number) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
              >
                <span className="font-semibold text-stone-800 text-lg">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-stone-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <div className="pt-2 border-t border-stone-100">
                    <p className="text-stone-600 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
