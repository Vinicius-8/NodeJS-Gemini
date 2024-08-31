
import { GoogleAIFileManager, UploadFileResponse } from "@google/generative-ai/server";
import fs from 'fs';
import path from 'path';
import { GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: './arquivo.env' });
dotenv.config();

interface UploadResult {
    file_url: string;
    measure_value: Number;
}

export async function uploadImageToGemini(base64Image: string): Promise<UploadResult> {
    // Initialize GoogleAIFileManager with  API_KEY.    
    const apiKey: string = process.env.GEMINI_API_KEY as string;   
    if(apiKey === undefined){
        throw Error("CAN'T LOAD API KEY");
    }
    
    const fileManagerGemini: GoogleAIFileManager = new GoogleAIFileManager(apiKey);
    
    // convert image base64 to png
    const imageBuffer: Buffer = Buffer.from(base64Image.split(",")[1], 'base64'); 
    const tempFilePath: string = path.join(__dirname, 'uploaded_image.jpeg');
    fs.writeFileSync(tempFilePath, imageBuffer);
    
    
    // upload to gemini
    const uploadResponse: UploadFileResponse = await fileManagerGemini.uploadFile(tempFilePath, {
        mimeType: "image/jpeg",
        displayName: "Jetpack drawing",
    });
    

    // initiate model
    const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(apiKey);
    const model: GenerativeModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });    

    // Generate content using text and the URI reference for the uploaded file.
    const result: GenerateContentResult = await model.generateContent([
        {fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri
        }},
        { text: "Read the numeric value on the gas or water meter and report only the numeric value as the answer." },
    ]);

    // verify if is a number       
    const geminiRead: number = parseInt(result.response.text(), 10);     
    if(isNaN(geminiRead)){    
        throw Error("Invalid integer");
    }
        
    // remove temp file 
    fs.unlinkSync(tempFilePath);   
     
    return { 
        file_url: uploadResponse.file.uri,        
        measure_value: geminiRead,        
    };


}