import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Modality } from "@google/genai";

const styles = [
    {
        id: 'corporate',
        name: 'Corporate',
        imageUrl: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Generate a professional corporate headshot that looks authentic and approachable. Use soft, directional lighting that mimics a real-world office environment with large windows. The background should be a subtly blurred, modern office interior. The subject's expression should be confident yet relaxed, avoiding a stiff or overly posed look. Crucially, maintain natural skin texture and avoid an airbrushed finish. The final image should feel like a high-end photograph, not a digital creation."
    },
    {
        id: 'creative',
        name: 'Creative / Startup',
        imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Create an engaging, professional headshot suitable for a creative industry professional or startup founder. The lighting should be bright and natural, as if from a large window or in a well-lit studio. The background should be a clean, minimalist workspace. Capture a hint of personality in the expression—make it feel genuine and confident. Preserve natural skin details and texture for a realistic, high-quality photographic look. The goal is an image that feels authentic, not like a generic stock photo."
    },
    {
        id: 'tech_ceo',
        name: 'Tech CEO',
        imageUrl: 'https://images.pexels.com/photos/8112173/pexels-photo-8112173.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Create a modern and approachable headshot for a tech leader. The subject should be wearing a simple, high-quality dark crewneck or turtleneck. The background should be a dark, minimalist, and slightly textured wall. The lighting should be clean and cinematic, with a single key light creating soft shadows. The expression should be confident, forward-thinking, and authentic. Focus on a photorealistic quality that feels both professional and relatable."
    },
    {
        id: 'financial_legal',
        name: 'Financial / Legal',
        imageUrl: 'https://images.pexels.com/photos/7643770/pexels-photo-7643770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Produce a classic and authoritative headshot suitable for the finance or legal sector. The subject should be in a sharp, perfectly tailored business suit. The background should be a subtly blurred, professional environment like a modern high-rise office or a classic library with bookshelves. The lighting should be crisp and clear, conveying trust and competence. The expression must be confident and trustworthy, with a natural, photorealistic finish."
    },
    {
        id: 'classic',
        name: 'Classic Studio',
        imageUrl: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Produce a timeless, professional studio headshot with a high-end portrait photography aesthetic. Use classic lighting techniques like Rembrandt or butterfly lighting to create depth and dimension. The background should be a solid, textured neutral color like charcoal grey. The focus must be on a natural, confident expression. It is essential to preserve realistic skin texture and details, achieving timeless elegance rather than an artificial, overly smoothed appearance."
    },
    {
        id: 'black_white',
        name: 'Black & White',
        imageUrl: 'https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Generate a dramatic and sophisticated black and white corporate headshot. The image should be high-contrast monochrome, emulating a classic film portrait. Use lighting that creates a powerful chiaroscuro effect, with deep shadows and crisp highlights to accentuate facial features. The background should be a simple dark grey or black. The focus is on expression and texture, so it is crucial to maintain natural skin detail. The final result should be a powerful, timeless, and photorealistic portrait."
    },
    {
        id: 'outdoor',
        name: 'Natural Light',
        imageUrl: 'https://images.pexels.com/photos/1105058/pexels-photo-1105058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Generate a warm and approachable professional headshot using natural outdoor light. Emulate the soft, flattering light of the 'golden hour' (early morning or late afternoon). The background should be a beautifully blurred outdoor scene, such as a park or modern architecture, creating a pleasant bokeh effect. The subject's expression should feel candid and genuinely friendly. Ensure the final image has a natural, photographic quality, complete with realistic skin texture and lighting."
    },
    {
        id: 'modern',
        name: 'Modern Portrait',
        imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        prompt: "Create a modern, professional headshot with a clean, solid-colored background in a contemporary hue like teal or slate blue. The lighting should be soft and even, creating a friendly and approachable feel. The subject's expression should be relaxed and confident. Focus on a natural, photorealistic quality, preserving skin texture and detail for an authentic look that's perfect for a modern resume or social media profile."
    }
];


const App = () => {
    const [originalImage, setOriginalImage] = useState<{url: string, file: File} | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState(styles[0]);


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
                text: selectedStyle.prompt,
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
                <p>Upload a photo, choose your style, and let AI create a polished, business-ready headshot.</p>
                
                <div className="actions">
                    <label htmlFor="file-upload" className="btn">
                        Upload Photo
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                 <div className="style-selector">
                    <h2>Choose a Style</h2>
                    <div className="style-selector-wrapper">
                        <div className="style-grid">
                            {styles.map((style) => (
                                <div 
                                    key={style.id} 
                                    className={`style-card ${selectedStyle.id === style.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedStyle(style)}
                                    role="radio"
                                    aria-checked={selectedStyle.id === style.id}
                                    tabIndex={0}
                                >
                                    <img src={style.imageUrl} alt={style.name} />
                                    <h4>{style.name}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="actions">
                     <button 
                        onClick={handleGenerate} 
                        className="btn btn-primary"
                        disabled={!originalImage || isLoading}
                        aria-label="Generate professional headshot with selected style"
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