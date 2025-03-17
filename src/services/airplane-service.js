const { StatusCodes } = require('http-status-codes');
const {AirplaneRepository} = require('../repositories');
const { AppError } = require('../utils');

const airplaneRepository = new AirplaneRepository();

async function createAirplane(data){
    try {
        const airplane = await airplaneRepository.create(data);
        return airplane;
    }
    catch(error){
        if(error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new Airplance object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAirplane(){
    try {
        const airplane = await airplaneRepository.getAll();
        return airplane;
    }
    catch(error){
        throw new AppError('Cannot get Airplane object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
async function getAirplaneById(id){
    try {
        const airplane = await airplaneRepository.get(id);
        // if(!airplane){
        //     throw new AppError('Airplane not found', StatusCodes.NOT_FOUND);
        // }
        return airplane;
    }
    catch(error){
        if(error.statusCode == StatusCodes.NOT_FOUND){
            console.log(error.statusCode);
            throw new AppError('The airplane you requested to delete is not present', error.statusCode);
        }
        throw new AppError('Cannot get Airplane object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createAirplane,
    getAirplane,
    getAirplaneById
}
