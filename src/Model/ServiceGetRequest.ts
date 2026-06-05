class ServiceGet {
    private serviceid: string;
    private clientid: string;
    private clientname: string;
    private servicedate: string;
    private servicecategory: string;
    private servicecategoryname: string;
    private categoryvalue: number;
    private servicestatus: string;


    constructor(body: any) {
        this.serviceid = body.serviceid;
        this.clientid = body.clientid;
        this.clientname = body.clientname;
        this.servicedate = body.servicedate;
        this.servicecategory = body.servicecategory;
        this.servicecategoryname = body.servicecategoryname;
        this.categoryvalue = body.categoryvalue;
        this.servicestatus = body.servicestatus;
    }

    getServiceId() {
        return this.serviceid;
    }

    getClientID() {
        return this.clientid;
    }

    getClientName() {
        return this.clientname;
    }

    getServiceDate() {
        return this.servicedate;
    }

    getServiceCategory() {
        return this.servicecategory;
    }
    
    getServiceCategoryName() {
        return this.servicecategoryname;
    }

    getCategoryValue() {
        return this.categoryvalue;
    }
    
    getServiceStatus() {
        return this.servicestatus;
    }

    setServiceId(id: string) {
        this.serviceid = id;
    }

    setServiceClient(clientId: string) {
        this.clientid = clientId;
    }

    setClientName(clientName: string) {
        this.clientname = clientName;
    }

    setServiceDate(serviceDate: string) {
        this.servicedate = serviceDate;
    }

    setServiceCategory(serviceCategory: string) {
        this.servicecategory = serviceCategory;
    }
    
    setServiceCategoryName(categoryName: string) {
        this.servicecategoryname = categoryName;
    }

    setCategoryValue(value: number) {
        this.categoryvalue = value;
    }
    
    setServiceStatus(serviceStatus: string) {
        this.servicestatus = serviceStatus;
    }
}

class ServicesGet {
    private services: Array<ServiceGet>;

    constructor() {
        this.services = [];
    }

    add(service: ServiceGet) {
        this.services.push(service);
    }

    list() {
        return this.services;
    }
}

export { ServiceGet, ServicesGet };
