import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Modality } from "@google/genai";

const App = () => {
    const [originalImage, setOriginalImage] = useState<{url: string, file: File} | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file.');
                return;
            }
            setError(null);
            setGeneratedImage(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage({ url: reader.result as string, file });
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!originalImage) {
            setError('Please upload an image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = await fileToBase64(originalImage.file);

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: originalImage.file.type,
                },
            };

            const textPart = {
                text: "Transform this into a professional business headshot for a LinkedIn profile. The background should be a neutral, blurred office setting. Please ensure the lighting is flattering and the attire is business casual.",
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [imagePart, textPart],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            let imageFound = false;
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                  if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                    setGeneratedImage(imageUrl);
                    imageFound = true;
                    break; 
                  }
                }
            }
            
            if (!imageFound) {
                 throw new Error("The AI did not return an image. Please try a different photo.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'An unexpected error occurred while generating the image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="container">
                <h1>Professional Headshot Generator</h1>
                <p>Upload your photo and let AI transform it into a polished, business-ready headshot.</p>
                
                <div className="actions">
                    <label htmlFor="file-upload" className="btn">
                        Upload Photo
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                    <button 
                        onClick={handleGenerate} 
                        className="btn"
                        disabled={!originalImage || isLoading}
                        aria-label="Generate professional headshot"
                    >
                        {isLoading ? 'Generating...' : 'Generate Headshot'}
                    </button>
                    {generatedImage && (
                        <a href={generatedImage} download="professional-headshot.png" className="btn btn-success">
                            Download Image
                        </a>
                    )}
                </div>

                {error && <p className="error-message" role="alert">{error}</p>}

                <div className="image-grid">
                    <div className="image-container">
                        <h3>Original Photo</h3>
                        {originalImage ? (
                            <img src={originalImage.url} alt="Original upload" />
                        ) : (
                            <p className="placeholder">Your photo will appear here.</p>
                        )}
                    </div>
                    <div className="image-container">
                        <h3>Generated Headshot</h3>
                        {isLoading && <div className="loader" aria-label="Loading generated image"></div>}
                        {!isLoading && generatedImage ? (
                            <img src={generatedImage} alt="Generated professional headshot" />
                        ) : !isLoading && (
                            <p className="placeholder">Your professional headshot will appear here.</p>
                        )}
                    </div>
                </div>
            </div>
            <footer>
                <p>Crafted by Mohamed Aref</p>
                <p>&copy; {new Date().getFullYear()} Mohamed Aref. All Rights Reserved.</p>
            </footer>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);