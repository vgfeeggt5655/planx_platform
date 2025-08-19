
import { INTERNET_ARCHIVE_CREDS } from '../constants';

export const uploadToInternetArchive = (file: File, onProgress: (percentage: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
        const itemName = `plan-x-${file.type.split('/')[0]}-${Date.now()}`;
        const fileName = file.name.replace(/\s+/g, '_');
        const url = `https://s3.us.archive.org/${itemName}/${fileName}`;

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);

        // Set required headers
        xhr.setRequestHeader('Authorization', `LOW ${INTERNET_ARCHIVE_CREDS.ACCESS_KEY}:${INTERNET_ARCHIVE_CREDS.SECRET_KEY}`);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('x-amz-auto-make-bucket', '1');
        xhr.setRequestHeader('x-archive-meta-collection', 'opensource');
        
        const mediaType = file.type.startsWith('video/') ? 'movies' : 'texts';
        xhr.setRequestHeader('x-archive-meta-mediatype', mediaType);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentage = Math.round((event.loaded * 100) / event.total);
                onProgress(percentage);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const publicUrl = `https://archive.org/download/${itemName}/${fileName}`;
                resolve(publicUrl);
            } else {
                reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('A network error occurred during the upload.'));
        };

        xhr.send(file);
    });
};
