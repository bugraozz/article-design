import React from "react";

export default function AcademicArticleSetup() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Akademik Makale Oluşturma
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl text-center">
        Bu sayfa, akademik makale oluşturma sürecini başlatmak için tasarlanmıştır. Lütfen gerekli adımları takip edin.
      </p>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        onClick={() => alert("Collabora Online kurulumu ve WOPI entegrasyonu yapılacak.")}
      >
        Süreci Başlat
      </button>
    </div>
  );
}