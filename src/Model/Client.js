class Client{

    constructor(body){
        this.clientid = body.clientid;
        this.clientname = body.clientname;
        this.clientphone = body.clientphone;
    }

    getId(){
        return this.clientid;
    }

    getName(){
        return this.clientname;
    }

    getPhone(){
        return this.clientphone;
    }

    setId(id){
        this.clientid = id;
    }

    setName(name){
        this.clientname = name;
    }

    setPhone(phone){
        this.clientphone = phone;
    }
}


module.exports = Client;