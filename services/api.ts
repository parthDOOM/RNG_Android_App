import * as FileSystem from 'expo-file-system';
import { DocumentPickerAsset } from 'expo-document-picker';

// IMPORTANT: Update this URL to your deployed API endpoint or local development URL
// For local development, if your API (main.py) runs on port 8000:
const API_URL = 'https://rng-api.onrender.com/predict_bin/';
// For your deployed Render URL (ensure it's the correct one for the new API):
// const API_URL = 'https://YOUR_RENDER_SERVICE_NAME.onrender.com/predict_bin/';


// This function is no longer needed as the API handles feature extraction.
// export const readBinaryFileAsBase64 = ...
// export const convertBase64ToBinaryFeatures = ...

export type ApiPredictionResponse = {
  predicted_class_id: number;
  predicted_class_name: string;
  probabilities: { [key: string]: number };
  detail: string;
  input_file_size_bytes: number;
  processing_time_seconds: float;
};

export const analyzeFileWithApi = async (
  fileAsset: DocumentPickerAsset
): Promise<ApiPredictionResponse> => {
  const formData = new FormData();
  
  // The 'file' key is what your FastAPI endpoint expects for UploadFile
  formData.append('file', {
    uri: fileAsset.uri,
    name: fileAsset.name,
    type: fileAsset.mimeType || 'application/octet-stream', // Or a more specific MIME type if known
  } as any);

  try {
    console.log(`Sending file ${fileAsset.name} to ${API_URL}`);
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        // 'Content-Type': 'multipart/form-data' is automatically set by fetch when using FormData
      },
    });

    const responseText = await response.text(); // Get raw response text for debugging
    console.log('API Raw Response:', responseText);

    if (!response.ok) {
      let errorDetail = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetail = errorJson.detail || errorDetail;
      } catch (e) {
        // Not a JSON error response, use raw text
        errorDetail += ` - ${responseText}`;
      }
      console.error('API Error Detail:', errorDetail);
      throw new Error(errorDetail);
    }

    const data: ApiPredictionResponse = JSON.parse(responseText);
    console.log('API Parsed Data:', data);
    return data;

  } catch (error) {
    console.error('Error in analyzeFileWithApi:', error);
    throw error;
  }
};