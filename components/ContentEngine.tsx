import React, { useState, useCallback } from 'react';
import { analyzeCombo, generateCombos, generateScript } from '../services/geminiService';
import type { ComboAnalysisResult, GeneratedCombo, ScriptResult } from '../types';
import { UploadIcon, SparklesIcon, LightBulbIcon, CheckCircleIcon, ImageIcon, TitleIcon, ScriptIcon } from './icons';
import Loader from './Loader';
import ResultCard from './ResultCard';
import ImageModal from './ImageModal';

const ContentEngine: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ComboAnalysisResult | null>(null);
    const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedCombos, setGeneratedCombos] = useState<GeneratedCombo[]>([]);
    const [isGeneratingCombos, setIsGeneratingCombos] = useState<boolean>(false);
    const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError("Unsupported file type. Please use PNG, JPG, or WEBP.");
                return;
            }
            if (file.size > 4 * 1024 * 1024) {
                setError("File size should not exceed 4MB.");
                return;
            }
            setError(null);
            setAnalysisResult(null);
            setGeneratedCombos([]);
            setScriptResult(null);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageFile || !title.trim()) {
            setError("Please provide both a thumbnail and a title.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setGeneratedCombos([]);
        setScriptResult(null);

        try {
            const base64String = await getBase64(imageFile);
            const result = await analyzeCombo(title, base64String, imageFile.type);
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, title]);

    const handleGenerateCombos = useCallback(async () => {
        if (!analysisResult || !title) return;
        setIsGeneratingCombos(true);
        setError(null);
        setScriptResult(null);
        try {
            const combos = await generateCombos(analysisResult, title);
            setGeneratedCombos(combos);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while generating content.');
        } finally {
            setIsGeneratingCombos(false);
        }
    }, [analysisResult, title]);

    const handleGenerateScript = useCallback(async () => {
        if (!analysisResult || !title) return;
        setIsGeneratingScript(true);
        setError(null);
        setGeneratedCombos([]);
        try {
            const result = await generateScript(analysisResult, title);
            setScriptResult(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while generating the script.');
        } finally {
            setIsGeneratingScript(false);
        }
    }, [analysisResult, title]);

    return (
        <>
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
            <div className="space-y-8">
                {/* Step 1: Input */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
                    <h2 className="text-2xl font-bold text-center mb-6">Step 1: Input Your Idea</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <label htmlFor="thumbnail-upload" className="w-full cursor-pointer group">
                            <div className="aspect-video bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 group-hover:border-indigo-500 transition-all duration-300 flex flex-col items-center justify-center text-center p-4">
                                {imagePreview ? <img src={imagePreview} alt="Thumbnail preview" className="max-h-full max-w-full object-contain rounded-md" /> : <div className="text-gray-400"><UploadIcon className="w-12 h-12 mx-auto mb-2" /><span className="font-semibold">Upload Thumbnail</span><p className="text-xs mt-1">PNG, JPG, WEBP (Max 4MB)</p></div>}
                            </div>
                        </label>
                        <input id="thumbnail-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        <div className="relative">
                            <TitleIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your viral video title idea..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 pr-4 pl-12 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                    </div>
                    <button onClick={handleAnalyze} disabled={!imageFile || !title.trim() || isLoading} className="mt-8 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg">
                        {isLoading ? <Loader /> : <SparklesIcon className="w-5 h-5" />}
                        <span>{isLoading ? 'Analyzing...' : 'Analyze Combination'}</span>
                    </button>
                    {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
                </div>

                {isLoading && <div className="flex flex-col items-center justify-center text-gray-400 p-8"><Loader /><p className="mt-2 text-lg">Analyzing your combination...</p></div>}

                {/* Step 2: Analysis & Generation */}
                {analysisResult && !isLoading && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg space-y-6">
                        <h2 className="text-2xl font-bold text-center">Step 2: AI Analysis & Generation</h2>
                        <ResultCard icon={<LightBulbIcon className="w-6 h-6 text-yellow-300" />} title="Overall Opinion"><p className="text-gray-300">{analysisResult.opinion}</p></ResultCard>
                        <ResultCard icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />} title="Strengths & Weaknesses">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><ul className="list-disc list-inside space-y-1 text-gray-300"><b>Strengths</b>{analysisResult.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul><ul className="list-disc list-inside space-y-1 text-gray-300"><b>Weaknesses</b>{analysisResult.weaknesses.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
                        </ResultCard>
                        <ResultCard icon={<SparklesIcon className="w-6 h-6 text-purple-400" />} title="Suggested Improvements"><ul className="list-disc list-inside space-y-2 text-gray-300">{analysisResult.improvements.map((item, index) => <li key={index}>{item}</li>)}</ul></ResultCard>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <button onClick={handleGenerateCombos} disabled={isGeneratingCombos || isGeneratingScript} className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-500 disabled:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                                {isGeneratingCombos ? <Loader /> : <ImageIcon className="w-5 h-5" />}
                                <span>{isGeneratingCombos ? 'Generating...' : 'Generate 3 New Combos'}</span>
                            </button>
                            <button onClick={handleGenerateScript} disabled={isGeneratingCombos || isGeneratingScript} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 disabled:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                                {isGeneratingScript ? <Loader /> : <ScriptIcon className="w-5 h-5" />}
                                <span>{isGeneratingScript ? 'Generating...' : 'Generate Viral Script'}</span>
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Step 3: Results */}
                {(isGeneratingCombos || generatedCombos.length > 0) && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
                         <h2 className="text-2xl font-bold text-center mb-6">Step 3: Generated Content</h2>
                        {isGeneratingCombos && <div className="flex flex-col items-center justify-center text-gray-400 p-8"><Loader /><p className="mt-2 text-lg">Generating new combinations...</p><p className="text-sm">This can take up to a minute.</p></div>}
                        {generatedCombos.length > 0 && (
                            <ResultCard icon={<ImageIcon className="w-6 h-6 text-indigo-400" />} title="Generated Combinations">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                    {generatedCombos.map((combo, index) => (
                                        <div key={index} className="bg-gray-800 p-3 rounded-lg space-y-2"><p className="font-semibold text-indigo-300 text-center">"{combo.title}"</p><button onClick={() => setSelectedImage(combo.imageUrl)} className="w-full aspect-video block bg-gray-900 rounded-md overflow-hidden transition-transform duration-200 hover:scale-[1.02] focus:ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-800"><img src={combo.imageUrl} alt={`Generated thumbnail for ${combo.title}`} className="w-full h-full object-cover" /></button></div>
                                    ))}
                                </div>
                            </ResultCard>
                        )}
                    </div>
                )}

                 {(isGeneratingScript || scriptResult) && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
                        <h2 className="text-2xl font-bold text-center mb-6">Step 3: Generated Content</h2>
                        {isGeneratingScript && <div className="flex flex-col items-center justify-center text-gray-400 p-8"><Loader /><p className="mt-2 text-lg">Generating your viral script...</p><p className="text-sm">This can take a moment.</p></div>}
                        {scriptResult && (
                             <ResultCard icon={<ScriptIcon className="w-6 h-6 text-green-400" />} title="Your Viral Video Script">
                                <div className="space-y-6 text-gray-300 prose prose-invert max-w-none">
                                    <h3 className="text-xl font-bold text-indigo-300 not-prose">Title: {scriptResult.title}</h3>
                                    <div><h4>Hook</h4><p>{scriptResult.hook}</p></div>
                                    <hr className="border-gray-600"/>
                                    {scriptResult.sections.map((section, index) => (
                                        <div key={index}>
                                            <h4>{index + 1}. {section.heading}</h4>
                                            <p>{section.content}</p>
                                            <p className="text-sm text-purple-300 p-3 bg-gray-800 rounded-md border-l-2 border-purple-400"><strong>Visuals:</strong> {section.visuals}</p>
                                        </div>
                                    ))}
                                    <hr className="border-gray-600"/>
                                    <div><h4>Call to Action</h4><p>{scriptResult.cta}</p></div>
                                    <div><h4>Outro</h4><p>{scriptResult.outro}</p></div>
                                </div>
                            </ResultCard>
                        )}
                    </div>
                 )}
            </div>
        </>
    );
};

export default ContentEngine;