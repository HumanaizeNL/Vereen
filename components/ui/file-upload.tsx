'use client';

import * as React from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploadProps {
  clientId: string;
  onUploadComplete?: (files: string[]) => void;
  accept?: string;
  maxFiles?: number;
}

export function FileUpload({
  clientId,
  onUploadComplete,
  accept = '.csv,.pdf,.docx,.rtf',
  maxFiles = 10,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithStatus: FileWithStatus[] = newFiles.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => {
      const combined = [...prev, ...filesWithStatus];
      return combined.slice(0, maxFiles);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileWithStatus: FileWithStatus, index: number) => {
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: 'uploading', progress: 0 } : f
      )
    );

    const formData = new FormData();
    formData.append('file', fileWithStatus.file);
    formData.append('client_id', clientId);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'success', progress: 100 } : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : f
        )
      );
    }
  };

  const uploadAll = async () => {
    const uploadPromises = files
      .filter((f) => f.status === 'pending')
      .map((f, i) => uploadFile(f, files.indexOf(f)));

    await Promise.all(uploadPromises);

    const successfulFiles = files
      .filter((f) => f.status === 'success')
      .map((f) => f.file.name);

    if (onUploadComplete && successfulFiles.length > 0) {
      onUploadComplete(successfulFiles);
    }
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload
            className={cn(
              'w-12 h-12',
              isDragging ? 'text-primary' : 'text-gray-400'
            )}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Sleep bestanden hierheen of{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
              >
                blader
              </button>
            </p>
            <p className="text-xs text-gray-500">
              CSV, PDF, DOCX of RTF (max {maxFiles} bestanden)
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Bestanden ({files.length})
              {successCount > 0 && (
                <span className="ml-2 text-green-600">
                  {successCount} geüpload
                </span>
              )}
              {errorCount > 0 && (
                <span className="ml-2 text-red-600">{errorCount} mislukt</span>
              )}
            </p>
            {pendingCount > 0 && (
              <Button onClick={uploadAll} size="sm">
                Upload {pendingCount} bestand{pendingCount !== 1 ? 'en' : ''}
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((fileWithStatus, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-white"
              >
                <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileWithStatus.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileWithStatus.file.size / 1024).toFixed(1)} KB
                  </p>
                  {fileWithStatus.status === 'error' && fileWithStatus.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {fileWithStatus.error}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {fileWithStatus.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {fileWithStatus.status === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {fileWithStatus.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  {fileWithStatus.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
