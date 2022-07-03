const path = require('path');

class FileUpload{

    static fileTypes = /jpeg|jpg|png/;

    static checkFile = (file, fileTypes = this.fileTypes) => {
        const ext = path.extname(file.name).toLowerCase().split('.')[1];
        const extname = fileTypes.test(ext);
        
        if (!extname) {
            throw new Error('File only supports the following filetypes - ' + fileTypes);
        }
        
        if(file.truncated){
            throw new Error('File is too big. allow maximum 1 MB to upload');
        }
    
        return true;
    }
    
    static uploadFile = async (file, originalPath)=>{
    
        const fileName = Date.now() + path.extname(file.name);
        const savePath = path.join(__dirname,originalPath,fileName);
        
        await file.mv(savePath);
    
        return fileName;
    }
    
    static fileCheckAndUpload = async (file, originalPath, fileTypes = this.fileTypes)=>{
        this.checkFile(file, fileTypes);
        return await this.uploadFile(file, originalPath);
    }
}


module.exports = {
    checkFile: FileUpload.checkFile,
    uploadFile: FileUpload.uploadFile, 
    fileCheckAndUpload: FileUpload.fileCheckAndUpload
};