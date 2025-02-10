// 'use client';

// import { useState } from 'react';

// export default function StreamingTest() {
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);

//   const fetchStreamingData = async () => {
//     setResponse('');
//     setLoading(true);

//     const res = await fetch('http://localhost:8001/langchain/stream', {
//       method: 'POST',
//       headers: {
//         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzg2ODA3NTYsImV4cCI6MTczOTk3Njc1Nn0.oDgaPSFoDW1R9eUYlcCGE_x3jwo1EZRFMF7RrJnd_cY'
//       },
//       body: JSON.stringify({ prompt: "conte uma pidada longa" })
//     });

//     if (!res.body) {
//       setLoading(false);
//       return;
//     }

//     const reader = res.body.getReader();
//     const decoder = new TextDecoder();

//     let result = '';

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       result += decoder.decode(value, { stream: true });
//       setResponse((prev) => prev + decoder.decode(value, { stream: true }));
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="p-4 max-w-lg mx-auto">
//       <h1 className="text-xl font-bold mb-4">Teste de Streaming</h1>
//       <button
//         onClick={fetchStreamingData}
//         className="px-4 py-2 bg-blue-500 text-white rounded-md"
//         disabled={loading}
//       >
//         {loading ? 'Carregando...' : 'Iniciar Streaming'}
//       </button>
//       <div className="mt-4 p-2 border border-gray-300 rounded-md">
//         <pre className="whitespace-pre-wrap">{response || 'Aguardando resposta...'}</pre>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState } from 'react';

export default function StreamingTest() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStreamingData = async () => {
    setResponse('');
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzg2ODA3NTYsImV4cCI6MTczOTk3Njc1Nn0.oDgaPSFoDW1R9eUYlcCGE_x3jwo1EZRFMF7RrJnd_cY");

    const raw = JSON.stringify({ "prompt": "conte uma piada bem longa" });

    try {
      const res = await fetch("http://localhost:8001/langchain/stream", {
        method: "POST",
        headers: myHeaders,
        body: raw,
      });

      if (!res.body) {
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setResponse((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setResponse("Erro ao buscar os dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Teste de Streaming</h1>
      <button
        onClick={fetchStreamingData}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        disabled={loading}
      >
        {loading ? 'Carregando...' : 'Iniciar Streaming'}
      </button>
      <div className="mt-4 p-2 border border-gray-300 rounded-md">
        <pre className="whitespace-pre-wrap">{response || 'Aguardando resposta...'}</pre>
      </div>
    </div>
  );
}
