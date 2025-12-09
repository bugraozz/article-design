export default function PagesPanel({ pages, activePageId, onSelectPage }) {
  return (
    <div className="w-48 h-full bg-gray-50 border-r p-4">
      <h2 className="text-lg font-semibold mb-4">Sayfalar</h2>

      <div className="flex flex-col gap-3">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onSelectPage(page.id)}
            className={`w-full h-24 border rounded flex items-center justify-center text-sm transition ${
              page.id === activePageId
                ? "bg-blue-100 border-blue-500"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>
    </div>
  );
}
