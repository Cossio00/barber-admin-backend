class User {
    private userid: string;
    private username: string;
    private email: string;
    private password_hash: string;
    private phone?: string;
    private role: string;
    private barbershopid: string;

    constructor(body: any) {
        this.userid = body.userid;
        this.username = body.username;
        this.email = body.email;
        this.password_hash = body.password_hash;
        this.phone = body.phone;
        this.role = body.role;
        this.barbershopid = body.barbershopid;
    }

    getUserId() { return this.userid; }
    getUsername() { return this.username; }
    getEmail() { return this.email; }
    getPasswordHash() { return this.password_hash; }
    getPhone() { return this.phone; }
    getRole() { return this.role; }
    getBarbershopId() { return this.barbershopid; }


    setUserId(id: string) { this.userid = id; }
    setUsername(name: string) { this.username = name; }
    setEmail(email: string) { this.email = email; }
    setPasswordHash(hash: string) { this.password_hash = hash; }
    setPhone(phone: string) { this.phone = phone; }
    setRole(role: string) { this.role = role; }
    setBarbershopId(id: string) { this.barbershopid = id; }
}

export { User };