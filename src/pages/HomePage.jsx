import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const nav = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">

      <h1 className="text-4xl font-bold text-gray-800">
        Dergi / Makale Editör
      </h1>

      <button
        onClick={() => nav("/editor")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        Yeni Boş Döküman Oluştur
      </button>

      <label className="px-6 py-3 bg-green-600 text-white rounded-lg shadow cursor-pointer hover:bg-green-700">
        Word Dosyası Yükle
        <input type="file" className="hidden" />
      </label>

      <label className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow cursor-pointer hover:bg-purple-700">
        PDF Dosyası Yükle
        <input type="file" className="hidden" />
      </label>

    </div>
  );
}
