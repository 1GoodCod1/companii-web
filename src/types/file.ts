export type FileErrorKey = 'files.invalidType' | 'files.tooLarge';
export type FileVisibility = 'PUBLIC' | 'PRIVATE';

export type FileDto = {
  id: string;
  path: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  visibility?: FileVisibility;
};
