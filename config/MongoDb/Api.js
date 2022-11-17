const models = require('./models');
const mongoose = require('mongoose');
const uri = "mongodb+srv://a9293340:f102041332@cluster0.nkdeoir.mongodb.net/ygo?retryWrites=true&w=majority";
let db;
const MongooseCRUD = (type,modelName,filters,update = null) => {

    db = mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const model = mongoose.model(modelName, models[modelName], modelName);

    let promise;
    switch (type){
        case 'C':
            promise = model.insertMany(filters)
            break;
        case 'R':
            promise = model.find(filters).exec()
            break;
        case 'U':
            promise = model.updateOne(filters,update).exec()
            break;
        case 'D':
            promise = model.deleteOne(filters).exec()
            break;
    }

    return promise;
}


module.exports = {
    MongooseCRUD
}