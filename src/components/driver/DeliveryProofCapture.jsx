import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

/**
 * Camera component for capturing delivery proof photos
 * Features:
 * - Camera access with fallback to file upload
 * - Image preview before submission
 * - Client-side image compression
 * - Retake functionality
 */
export default function DeliveryProofCapture({ onPhotoCapture, onCancel }) {
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [useFileInput, setUseFileInput] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    const startCamera = async () => {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use rear camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
                toast.success('Camera ready!');
            }
        } catch (error) {
            console.error('Camera access error:', error);

            if (error.name === 'NotAllowedError') {
                toast.error('Camera permission denied. Please allow camera access.');
            } else if (error.name === 'NotFoundError') {
                toast.error('No camera found. Using file upload instead.');
                setUseFileInput(true);
            } else {
                toast.error('Failed to access camera. Using file upload instead.');
                setUseFileInput(true);
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob with compression
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const file = new File([blob], `delivery_proof_${Date.now()}.jpg`, {
                        type: 'image/jpeg'
                    });

                    // Create preview URL
                    const previewUrl = URL.createObjectURL(blob);
                    setCapturedImage({ file, previewUrl });

                    // Stop camera
                    stopCamera();

                    toast.success('Photo captured!');
                }
            },
            'image/jpeg',
            0.85 // Quality (0.0 to 1.0)
        );
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image too large. Maximum size is 10MB.');
            return;
        }

        // Compress and preview
        compressImage(file).then((compressedFile) => {
            const previewUrl = URL.createObjectURL(compressedFile);
            setCapturedImage({ file: compressedFile, previewUrl });
            toast.success('Photo selected!');
        });
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large
                    const maxDimension = 1920;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        },
                        'image/jpeg',
                        0.85
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const retakePhoto = () => {
        if (capturedImage?.previewUrl) {
            URL.revokeObjectURL(capturedImage.previewUrl);
        }
        setCapturedImage(null);

        if (useFileInput) {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            startCamera();
        }
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            onPhotoCapture(capturedImage.file);

            // Cleanup
            if (capturedImage.previewUrl) {
                URL.revokeObjectURL(capturedImage.previewUrl);
            }
        }
    };

    const handleCancel = () => {
        stopCamera();
        if (capturedImage?.previewUrl) {
            URL.revokeObjectURL(capturedImage.previewUrl);
        }
        onCancel();
    };

    // Initialize camera or file input on mount
    React.useEffect(() => {
        if (!capturedImage && !useFileInput) {
            startCamera();
        }

        return () => {
            stopCamera();
            if (capturedImage?.previewUrl) {
                URL.revokeObjectURL(capturedImage.previewUrl);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {capturedImage ? 'Review Photo' : 'Capture Proof of Delivery'}
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Camera View / File Upload */}
                    {!capturedImage && (
                        <div className="space-y-4">
                            {!useFileInput ? (
                                <>
                                    {/* Camera Stream */}
                                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        {!cameraActive && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <svg className="w-16 h-16 mx-auto mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <p>Initializing camera...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Capture Button */}
                                    {cameraActive && (
                                        <button
                                            onClick={capturePhoto}
                                            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Capture Photo
                                        </button>
                                    )}

                                    {/* Switch to File Upload */}
                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            setUseFileInput(true);
                                        }}
                                        className="w-full py-3 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Or select from gallery
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* File Upload */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-600 mb-4">Select a photo from your device</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer transition"
                                        >
                                            Choose Photo
                                        </label>
                                    </div>

                                    {/* Switch to Camera */}
                                    <button
                                        onClick={() => {
                                            setUseFileInput(false);
                                            startCamera();
                                        }}
                                        className="w-full py-3 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Or use camera instead
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    {capturedImage && (
                        <div className="space-y-4">
                            <div className="rounded-lg overflow-hidden border-2 border-gray-300">
                                <img
                                    src={capturedImage.previewUrl}
                                    alt="Delivery proof"
                                    className="w-full h-auto"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>File:</strong> {capturedImage.file.name}
                                </p>
                                <p className="text-sm text-blue-800">
                                    <strong>Size:</strong> {(capturedImage.file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={retakePhoto}
                                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={confirmPhoto}
                                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                >
                                    Use This Photo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hidden canvas for image capture */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
        </div>
    );
}
