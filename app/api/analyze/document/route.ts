import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Get file info
    const fileName = file.name;
    const fileType = file.type;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Read file as text
    const bytes = await file.arrayBuffer();
    let content = '';

    // Handle different file types
    switch (fileExtension) {
      case 'txt':
      case 'md':
        content = new TextDecoder().decode(bytes);
        break;
      
      case 'pdf':
        // For PDF, we'd need a parser like pdf-parse
        // For now, return placeholder
        content = `[PDF Document: ${fileName}]\n\n[PDF content extraction requires additional processing. File size: ${file.size} bytes]`;
        break;
      
      case 'doc':
      case 'docx':
        // For Word docs, we'd need a parser like mammoth
        content = `[Word Document: ${fileName}]\n\n[DOCX content extraction requires additional processing. File size: ${file.size} bytes]`;
        break;
      
      case 'jpg':
      case 'jpeg':
      case 'png':
        // For images, we'd need OCR like tesseract
        content = `[Image: ${fileName}]\n\n[Image OCR requires additional processing. File size: ${file.size} bytes]`;
        break;
      
      default:
        // Try to decode as text
        try {
          content = new TextDecoder().decode(bytes);
        } catch {
          content = `[Binary file: ${fileName}]\n\n[Unable to extract text content. File type: ${fileType}]`;
        }
    }

    // Limit content length
    const maxLength = 15000;
    const truncatedContent = content.length > maxLength
      ? content.slice(0, maxLength) + '... [content truncated]'
      : content;

    return Response.json({
      fileName,
      fileType,
      content: truncatedContent,
      wordCount: content.split(/\s+/).length,
      size: file.size,
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}

// Increase body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
