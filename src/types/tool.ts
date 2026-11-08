export type ToolCategory = 'Utility' | 'Animation' | 'System' | 'Creative' | 'Security';
export type ToolStatus = 'active' | 'maintenance' | 'broken';

export interface ToolPackageFile {
  filename: string;
  content: string;
}

export interface ToolMainPackage {
  batFilename: string;
  batContent: string;
  pyFilename: string;
  pyContent: string;
  available: boolean;
  broken: boolean;
}

export interface ToolBackupPackage {
  enabled: boolean;
  batFilename: string;
  batContent: string;
  pyFilename: string;
  pyContent: string;
  available: boolean;
}

export interface Tool {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  version: string;
  asciiPreview: string;
  tags: string[];
  status: ToolStatus;
  author?: string;
  createdAt: string;
  updatedAt: string;
  main: ToolMainPackage;
  backup: ToolBackupPackage;
  downloadCount: number;
}

// Public-facing representation with NO internal file names or source code exposed
export interface PublicTool {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  version: string;
  asciiPreview: string;
  tags: string[];
  status: ToolStatus;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  main: {
    available: boolean;
    broken: boolean;
  };
  backup: {
    enabled: boolean;
    available: boolean;
  };
}
