import { X, ExternalLink, Download, AlertCircle } from 'lucide-react';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    mimeType?: string; // e.g. 'application/pdf', 'image/png'
    fileName?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, fileUrl, mimeType, fileName = 'Document' }) => {
    if (!isOpen) return null;

    const isPdf = mimeType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf');
    const isImage = !isPdf; // Simplified assumption, can be refined

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate max-w-md">
                        {fileName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-950 flex items-center justify-center relative overflow-auto">
                    {fileUrl ? (
                        isPdf ? (
                            <iframe
                                src={`${fileUrl}#toolbar=0`}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        ) : (
                            <img
                                src={fileUrl}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain p-4"
                            />
                        )
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <AlertCircle className="w-12 h-12 mb-2" />
                            <p>Preview not available</p>
                        </div>
                    )}
                </div>

                {/* Footer (Optional actions) */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-end">
                    <a
                        href={fileUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </a>
                </div>
            </div>
        </div>
    );
};
