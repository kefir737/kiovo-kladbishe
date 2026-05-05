import { useContent } from '../context/ContentContext';

export function Gallery() {
  const { content, loading } = useContent();

  if (loading) {
    return (
      <section className="py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">
            Фотогалерея
          </h2>
          <p className="text-center text-stone-500">Загрузка...</p>
        </div>
      </section>
    );
  }

  const images = Array.isArray(content.gallery_images) ? content.gallery_images : [];

  if (images.length === 0) {
    return null; // Don't show section if no images
  }

  return (
    <section id="gallery" className="py-16 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">
          Фотогалерея
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {images.map((image: any) => (
            <div
              key={image.id}
              className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={`/uploads/${image.filename}`}
                alt={image.alt || image.title || 'Фото'}
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
