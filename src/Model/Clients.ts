import Client from './Client';

class Clients{

    private clients: Array<Client>;

    constructor(){
        this.clients = [];
    }
    
    add(client : Client){
        this.clients.push(client);
    }

    list(){
        return this.clients;
    }
}

export default Clients;