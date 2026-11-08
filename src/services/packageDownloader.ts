import JSZip from 'jszip';
import type { Tool } from '../types/tool';

export type PackageType = 'main' | 'backup' | 'combined';

export interface DownloadResult {
  success: boolean;
  message: string;
  filename?: string;
}

/**
 * Dispatches a browser download from a Blob or URL
 */
function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads the requested tool package from the server endpoint.
 * Ensures the ZIP file is generated and transferred to the user's computer.
 */
export async function downloadPackage(slug: string, type: PackageType): Promise<DownloadResult> {
  try {
    const res = await fetch(`/api/tools/${slug}/download/${type}`);
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorJson.error || 'PACKAGE UNAVAILABLE'
      };
    }

    const disposition = res.headers.get('Content-Disposition');
    let filename = `${slug}-${type}.zip`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blob = await res.blob();
    triggerBrowserDownload(blob, filename);

    const messageMap: Record<PackageType, string> = {
      main: 'MAIN PACKAGE READY',
      backup: 'BACKUP PACKAGE READY',
      combined: 'COMBINED PACKAGE READY'
    };

    return {
      success: true,
      message: messageMap[type],
      filename
    };
  } catch (err) {
    console.error('Download error:', err);
    return {
      success: false,
      message: 'NETWORK ERROR: UNABLE TO DOWNLOAD PACKAGE'
    };
  }
}

/**
 * Client-side JSZip generator (used by admin or offline fallback)
 */
export async function generateClientZip(tool: Tool, type: PackageType): Promise<DownloadResult> {
  const zip = new JSZip();
  let filename = `${tool.slug}-${type}.zip`;

  if (type === 'main') {
    if (!tool.main?.batContent || !tool.main?.pyContent) {
      return { success: false, message: 'PACKAGE UNAVAILABLE: MAIN INCOMPLETE' };
    }
    zip.file(tool.main.batFilename || 'run.bat', tool.main.batContent);
    zip.file(tool.main.pyFilename || 'code.py', tool.main.pyContent);
  } else if (type === 'backup') {
    if (!tool.backup?.enabled || !tool.backup?.batContent || !tool.backup?.pyContent) {
      return { success: false, message: 'PACKAGE UNAVAILABLE: BACKUP DISABLED' };
    }
    zip.file(tool.backup.batFilename || 'run_backup.bat', tool.backup.batContent);
    zip.file(tool.backup.pyFilename || 'code_backup.py', tool.backup.pyContent);
  } else if (type === 'combined') {
    if (!tool.main?.batContent || !tool.main?.pyContent || !tool.backup?.batContent || !tool.backup?.pyContent) {
      return { success: false, message: 'PACKAGE UNAVAILABLE: MISSING ASSETS' };
    }
    zip.file(tool.main.batFilename || 'run.bat', tool.main.batContent);
    zip.file(tool.main.pyFilename || 'code.py', tool.main.pyContent);
    zip.file(tool.backup.batFilename || 'run_backup.bat', tool.backup.batContent);
    zip.file(tool.backup.pyFilename || 'code_backup.py', tool.backup.pyContent);
    filename = `${tool.slug}-full-pack.zip`;
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerBrowserDownload(blob, filename);

  const messageMap: Record<PackageType, string> = {
    main: 'MAIN PACKAGE READY',
    backup: 'BACKUP PACKAGE READY',
    combined: 'COMBINED PACKAGE READY'
  };

  return {
    success: true,
    message: messageMap[type],
    filename
  };
}
