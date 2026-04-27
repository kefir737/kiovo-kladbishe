export function Gallery() {
  // Placeholder images - replace with actual cemetery photos
  const images = [
    { src: 'https://placehold.co/600x400/e5e5e5/666666?text=Фото+1', alt: 'Территория кладбища' },
    { src: 'https://placehold.co/600x400/e5e5e5/666666?text=Фото+2', alt: 'Центральная аллея' },
    { src: 'https://placehold.co/600x400/e5e5e5/666666?text=Фото+3', alt: 'Часовня' },
    { src: 'https://placehold.co/600x400/e5e5e5/666666?text=Фото+4', alt: 'Мемориал' },
  ];

  return (
    <section className="py-16 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">
          Фотогалерея
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
