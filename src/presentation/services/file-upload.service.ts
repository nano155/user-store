import path from "path";
import fs from "fs"
import { UploadedFile } from "express-fileupload";
import { Uuid } from "../../config";
import { CustomError } from "../../domain";


export class FileUploadService{

    constructor(
        private readonly uuid = Uuid.v4
    ){}

    private checkFolder( folderpath: string){
        if(!fs.existsSync(folderpath)) {
            fs.mkdirSync(folderpath)
        }
    }

    async uploadSingle(
        file:UploadedFile,
        folder: string ='uploads',
        validExtension:string[] = ['png', 'jpg', 'jpeg', 'gif']
    ){
        try {
            const fileExtension = file.mimetype.split('/')[1] || ''

            if(!validExtension.includes(fileExtension)){
                throw CustomError.badRequest(`invalid extension: ${fileExtension}, valid ones ${validExtension} `)
            }
            const destination = path.resolve( __dirname, '../../../', folder);
            this.checkFolder(destination)

            const fileName = `${this.uuid()}.${fileExtension}`
            
            file.mv(`${destination}/${fileName}`)

            return fileName
        } catch (error) {
            throw error
            
        }
    }

    async uploadMultiple(
        files:UploadedFile[],
        folder: string ='uploads',
        validExtension:string[] = ['png', 'jpg', 'jpeg', 'gif']
    ){
        const fileNames = await Promise.all(
            files.map(file => this.uploadSingle(file, folder, validExtension))
        )

        return fileNames

    }
}