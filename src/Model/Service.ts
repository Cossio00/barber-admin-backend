class Service{

    private serviceid: string;
    private serviceclientid: string;
    private servicedate: string;
    private servicecategoryid: Number;
    private servicestatus: string;

    constructor(body: any){
        this.serviceid = body.serviceid
        this.serviceclientid = body.serviceclientid;
        this.servicedate = body.servicedate;
        this.servicecategoryid = body.servicecategoryid;
        this.servicestatus = body.servicestatus;   
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
    
    getServiceStatus(){
        return this.servicestatus;
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
    
    setServiceStatus(serviceStatus: string){
        this.servicestatus = serviceStatus;
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