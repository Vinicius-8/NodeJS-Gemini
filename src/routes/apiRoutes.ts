import { Router, Request, Response } from 'express';
import { isValidISODateTime } from '../utils/dateUtils';
import { isValidBase64Image } from '../utils/imageUtils';
import { uploadImageToGemini } from '../utils/geminiUtils';
import { AppDataSource } from "../database/dataSource";
import { Read } from '../entity/read.entity'
import { Raw, Repository } from 'typeorm';



const router = Router();


// route upload image
router.post('/upload', async (req: Request, res: Response) => {

    try {        
        
        const { image, customer_code, measure_datetime, measure_type } = req.body;

        // validate image        
        if (!isValidBase64Image(image)) {                        
            throw new Error("A Imagem em base64 inválida.");
        }

        // validate customer code
        if(typeof customer_code !== "string"){
            throw new Error("O dado customer_code não é uma string");
        }

        //validate date time
        if (!isValidISODateTime(measure_datetime)){
            throw new Error("A data não é válida");
        }

        // validate measure type
        if ((measure_type as string).toLowerCase() !== "water" && (measure_type as string).toLowerCase() !== "gas"){
            throw new Error("O tipo de medida é inválido");
        }

        // check existence of read
        const date: Date = new Date(measure_datetime);
        const month: number = date.getUTCMonth() + 1; // JS months are based in zero
        const year: number = date.getUTCFullYear();
        const readsRepository: Repository<Read>  = AppDataSource.getRepository(Read);
        
        // search in DB
        const existingRecord = await readsRepository.findOne({
            where: {
                measure_datetime: Raw(alias =>
                    `EXTRACT(MONTH FROM TO_TIMESTAMP(${alias}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) = :month AND EXTRACT(YEAR FROM TO_TIMESTAMP(${alias}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) = :year`,
                    { month, year }
                )
            }
        });

        // checks if it was already readed
        if (existingRecord?.measure_uuid !== null && existingRecord?.measure_type == measure_type){
            return res.status(409).json(
                {
                    error_code: '"DOUBLE_REPORT',
                    error_description: "Leitura do mês já realizada"
                });
                
        } 

   
        // upload to gemini     
        const geminiResponse = await uploadImageToGemini(image);

        //saves in the database        
        const read: Read = new Read();
        read.customer_code = customer_code;
        read.measure_datetime = measure_datetime;
        read.measure_type = measure_type;
        read.measure_value = Number(geminiResponse.measure_value);
        read.image_url = geminiResponse.file_url
                
        const databaseResponse: Read = await readsRepository.save(read);
               
        res.status(200).json({
            "image_url": geminiResponse.file_url,
            "measure_value": geminiResponse.measure_value,
            "measure_uuid": databaseResponse.measure_uuid
        });
        

    } catch (error) {           
        res.status(400).json(
            {
                error_code: 'INVALID_DATA',
                error_description:  error instanceof Error ? error.message : 'Erro na API'
            });
    }

    
});

router.patch('/confirm', async (req: Request, res: Response) => { // confirm reading
    try {
        const { measure_uuid, confirmed_value } = req.body;
        // validate string
        if(typeof measure_uuid !== 'string'){
            throw new Error("O dado measure_uuid não é uma string");
        }

        // validate integer
        if (!Number.isInteger(confirmed_value)){
            throw new Error("O dado confirmed_value não é um integer");
        }

        // check existence of uuid
        const readsRepository: Repository<Read> = AppDataSource.getRepository(Read);
        const record = await readsRepository.findOne({
            where: {
                measure_uuid: measure_uuid,                
            }, });
                
        if(record?.measure_uuid === undefined){
            // return 404 for failing
            return res.status(404).json(
                {
                    error_code: 'MEASURE_NOT_FOUND',
                    error_description:'Leitura não encontrada'
                });
        }

        // verify confirmation 
        if(record.has_confirmed){
            return res.status(409).json(
                {
                    error_code: 'CONFIRMATION_DUPLICATE',
                    error_description: 'Leitura do mês já realizada'
                });
        }

        // save in the database
        record.has_confirmed = true;
        record.measure_value = confirmed_value;
        readsRepository.update(record.measure_uuid, record);

        res.status(200).json({'success': true});
        
    } catch (error) {                
        res.status(400).json(
            {
                error_code: 'INVALID_DATA',
                error_description: error instanceof Error ? error.message : 'Erro na API'
            });
    }

});

router.get('/:customer_code/list', async (req: Request, res: Response) => { // listing all customer's readings
    const customer_code: string = req.params.customer_code; // get query parameter
    const measure_type: string | undefined = req.query.measure_type as string | undefined; 
    if (customer_code === undefined) {
        return res.status(400);
    } 

    try {
        
        const whereClause: any = { customer_code };
        // measure_type only if defined
        if (measure_type) {
            if (measure_type.toLowerCase() !== 'water' && measure_type.toLowerCase() !== 'gas') {
                return res.status(400).json({
                    error_code: 'INVALID_TYPE',
                    error_description: 'Tipo de medição não permitida'
                });
            }
            whereClause.measure_type = measure_type.toLowerCase(); // adds another param to where clause
        }

        
        // search in the database
        const readsRepository: Repository<Read> = AppDataSource.getRepository(Read);
        const reads: Read[] = await readsRepository.find({ where: whereClause });
        
        // return empty
        if(reads.length < 1){
            throw Error();
        }

        // Retorna os registros como resposta JSON                
        res.status(200).json({
            "customer_code": customer_code,
            "measures": reads
        });

    } catch (error) {
        res.status(404).json(
            {
                error_code: 'MEASURES_NOT_FOUND',
                error_description: 'Nenhuma leitura encontrada'
            });
    }
});


export default router;