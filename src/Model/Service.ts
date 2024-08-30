class Service{

    private serviceid: string;
    private serviceclientid: string;
    private servicedate: string;
    private servicecategoryid: Number;

    constructor(body: any){
        this.serviceid = body.serviceid
        this.serviceclientid = body.serviceclientid;
        this.servicedate = body.servicedate;
        this.servicecategoryid = body.servicecategoryid;
    }

    getServiceId(){
        return this.serviceid;
    }

    getServiceClient(){
        return this.serviceclientid;
    }

    getServiceDate(){
        return this.servicedate;
    }

    getServiceCategory(){
        return this.servicecategoryid;
    }

    setServiceId(id : string){
        this.serviceid = id;
    }

    setServiceClient(serviceClientId: string){
        this.serviceclientid = serviceClientId;
    }
    
    setServiceDate(serviceDate: string){
        this.servicedate = serviceDate;
    }

    setServiceCategory(serviceCategoryId: Number){
        this.servicecategoryid = serviceCategoryId;
    }
}

class Services{

    private services: Array<Service>;

    constructor(){
        this.services = [];
    }

    add(service: Service){
        this.services.push(service);
    }

    list(){
        return this.services;
    }
}

export {Service, Services};