class Category{

    private categoryid: Number;
    private categorydescription: string;
    private categoryvalue: Number;
    
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

    setId(id: Number){
        this.categoryid = id;
    }

    setDescription(description: string){
        this.categorydescription = description;
    }

    setValue(value: Number){
        this.categoryvalue = value;
    }
}

export default Category;