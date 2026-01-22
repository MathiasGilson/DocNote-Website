import { supabase, type FileRecord } from './supabase';

const BUCKET_NAME = 'files';

export async function uploadFile(file: File): Promise<FileRecord | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to upload files');
  }

  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const storagePath = `${user.id}/${timestamp}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file);

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data, error: dbError } = await supabase
    .from('files')
    .insert({
      user_id: user.id,
      filename: file.name,
      storage_path: storagePath,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .maybeSingle();

  if (dbError) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(`Failed to save file metadata: ${dbError.message}`);
  }

  return data;
}

export async function getUserFiles(): Promise<FileRecord[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch files: ${error.message}`);
  }

  return data || [];
}

export async function getFileUrl(storagePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600);

  if (!data?.signedUrl) {
    throw new Error('Failed to generate file URL');
  }

  return data.signedUrl;
}

export async function deleteFile(fileId: string, storagePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (storageError) {
    throw new Error(`Failed to delete file from storage: ${storageError.message}`);
  }

  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    throw new Error(`Failed to delete file record: ${dbError.message}`);
  }
}

export async function downloadFile(storagePath: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message}`);
  }

  return data;
}
