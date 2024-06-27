class Category{

    private categoryid: Number;
    private categorydescription: string;
    private categoryvalue: Number;
    
    constructor(body: Category){
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

class Categories{

    private categories: Array<Category>;

    constructor(){
        this.categories = [];
    }

    add(category: Category){
        this.categories.push(category);
    }

    list(){
        return this.categories;
    }
}
export {Category, Categories};