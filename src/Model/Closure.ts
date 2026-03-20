class Closure{
    
    private closureid: string;
    private closuremonthyear: string; 
    private closureclosed_at: string;
    private closuretotalcalculated: Number;

    constructor(body: Closure){
        this.closureid = body.closureid;
        this.closuremonthyear = body.closuremonthyear;
        this.closureclosed_at = body.closureclosed_at;
        this.closuretotalcalculated = body.closuretotalcalculated;  
    }

    getClosureId(){
        return this.closureid;
    }

    getClosureMonthYear(){
        return this.closuremonthyear;
    }

    getClosureClosedAt(){
        return this.closureclosed_at;
    }
    
    getClosureTotalCalculated(){
        return this.closuretotalcalculated;
    }

    setClosureId(id: string){
        this.closureid = id;
    }

    setClosureMonthYear(monthYear: string){
        this.closuremonthyear = monthYear;
    }

    setClosureClosedAt(closedAt: string){
        this.closureclosed_at = closedAt;
    }

    setClosureTotalCalculated(totalCalculated: Number){
        this.closuretotalcalculated = totalCalculated;
    }

}

class Closures{

    private closures: Array<Closure>;

    constructor(){
        this.closures = [];
    }

    add(closure: Closure){
        this.closures.push(closure);
    }

    list(){
        return this.closures;
    }
}

export {Closure, Closures};