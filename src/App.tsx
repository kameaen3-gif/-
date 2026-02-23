/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Upload, Image as ImageIcon, Loader2, AlertCircle, Camera, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis('');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: "لطفاً این تصویر را با دقت بسیار زیاد و جزئیات کامل به زبان فارسی توضیح دهید. توضیحات باید شامل اشیاء، رنگ‌ها، فضا و هر نکته مهم دیگری باشد که در تصویر دیده می‌شود. لحن شما محترمانه و دقیق باشد.",
            },
          ],
        },
      });

      setAnalysis(response.text || 'متأسفانه توضیحی دریافت نشد.');
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('خطایی در تحلیل تصویر رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] font-sans selection:bg-blue-100" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ImageIcon className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">تحلیل‌گر هوشمند تصویر</h1>
          </div>
          {image && (
            <button 
              onClick={reset}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>شروع مجدد</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Upload Section */}
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-white hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="text-blue-600 w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">تصویر خود را اینجا آپلود کنید</p>
                <p className="text-sm text-gray-500 mt-1">یا برای انتخاب فایل کلیک کنید</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[500px] object-contain rounded-xl"
                />
              </div>

              {/* Action Button */}
              {!analysis && !loading && (
                <button
                  onClick={analyzeImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <Camera className="w-6 h-6" />
                  تحلیل تصویر با هوش مصنوعی
                </button>
              )}

              {/* Loading State */}
              {loading && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col items-center gap-4 shadow-sm">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-gray-600 animate-pulse">در حال تحلیل تصویر توسط هوش مصنوعی...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Result Section */}
              {analysis && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-2 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-xl font-bold text-gray-800">نتیجه تحلیل</h2>
                  </div>
                  <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-right" dir="rtl">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-gray-400 text-sm">
        <p>قدرت گرفته از هوش مصنوعی گوگل (Gemini)</p>
      </footer>
    </div>
  );
}
