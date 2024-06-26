class Category{

    constructor(body){
        this.categoryid = body.categoryid;
        this.categorydescription = body.categorydescription;
        this.categoryvalue = body.categoryvalue; 
    }

    getId(){
        return this.categoryid;
    }

    getDescription(){
        return this.categorydescription;
    }

    getValue(){
        return this.categoryvalue;
    }

    setId(id){
        this.categoryid = id;
    }

    setDescription(description){
        this.categorydescription = description;
    }

    setValue(value){
        this.categoryvalue = value;
    }
}

module.exports = Category;