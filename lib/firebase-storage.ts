import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image from a local URI to Firebase Storage
 * @param uri Local file URI (from expo-image-picker)
 * @param coupleId The ID of the couple (folder name)
 * @returns The public download URL of the uploaded image
 */
export const uploadImageToFirebase = async (uri: string, coupleId: string | number): Promise<string> => {
  try {
    // 1. Convert URI to Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Create a unique filename
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storagePath = `collages/${coupleId}/${Date.now()}_${filename}`;

    // 3. Create a reference to the file location
    const storageRef = ref(storage, storagePath);

    // 4. Upload the blob
    await uploadBytes(storageRef, blob);

    // 5. Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
