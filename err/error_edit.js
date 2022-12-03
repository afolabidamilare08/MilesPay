const Joierrorformat = (error) => {


    let what_to_return = error.message.replace('\"','')
    what_to_return = what_to_return.replace('\" ',' ')
    what_to_return = what_to_return.replace('_',' ')

    return {
        error_message: what_to_return,
        special_message:null
    }

}



const MongoDBerrorformat  = (error,unit) => {

    if( error.code === 11000 ){

        if( error.message.includes('username')){
            return "That username has already been taken"
        }

        if( error.message.includes('email')){
            return "That email has already been used"
        }

        if( error.message.includes('phone_number')){
            return "That phone number has already been used"
        }

    }else{
        if( error.message.includes('Cannot read properties of null') ){
            return `This ${unit} dose not exist`;
        }
    }

    return "server error"

}


module.exports = { Joierrorformat, MongoDBerrorformat }