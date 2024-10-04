class ServiceGet{

    /* 
    SELECT s.serviceid,  c.clientid, c.clientname, s.servicedate
    FROM service s JOIN client c ON s.serviceclientid = c.clientid;

    */
    private serviceid: string;
    private clientid: string;
    private clientname: string;
    private servicedate: string;
    private servicecategory: string;

    constructor(body: any){
        this.serviceid = body.serviceid
        this.clientid = body.clientid;
        this.clientname = body.clientname;
        this.servicedate = body.servicedate;
        this.servicecategory = body.servicecategory
    }

    getServiceId(){
        return this.serviceid;
    }

    getClientID(){
        return this.clientid;
    }

    getClientName(){
        return this.clientname;
    }

    getServiceDate(){
        return this.servicedate;
    }

    getServiceCategory(){
        return this.servicecategory;
    }

    setServiceId(id : string){
        this.serviceid = id;
    }

    setServiceClient(clientId: string){
        this.clientid = clientId;
    }
    
    setClientName(clientName: string){
        this.clientname = clientName;
    }

    setServiceDate(serviceDate: string){
        this.servicedate = serviceDate;
    }

    setServiceCategory(serviceCategory: string){
        this.servicecategory = serviceCategory;
    }
}

class ServicesGet{

    private services: Array<ServiceGet>;

    constructor(){
        this.services = [];
    }

    add(service: ServiceGet){
        this.services.push(service);
    }

    list(){
        return this.services;
    }
}

export {ServiceGet, ServicesGet};