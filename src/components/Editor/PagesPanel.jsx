export default function PagesPanel({ pages, activePageId, onSelectPage }) {
  return (
    <div className="w-52 h-full bg-gray-50 border-r border-gray-200 p-4">
      <h2 className="text-base font-semibold mb-4 text-gray-700">Sayfalar</h2>

      <div className="flex flex-col gap-2.5">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onSelectPage(page.id)}
            className={`w-full h-24 border-2 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-150 ${
              page.id === activePageId
                ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md"
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>
    </div>
  );
}
