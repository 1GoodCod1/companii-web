export type FileErrorKey = 'files.invalidType' | 'files.tooLarge';

export type FileDto = {
  id: string;
  path: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
};
