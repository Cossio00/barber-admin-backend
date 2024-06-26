class Client{

    private clientid: string;
    private clientname: string;
    private clientphone: string;

    constructor(body: Client){
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

    setId(id: string){
        this.clientid = id;
    }

    setName(name: string){
        this.clientname = name;
    }

    setPhone(phone: string){
        this.clientphone = phone;
    }
}

export default Client;