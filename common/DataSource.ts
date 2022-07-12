import { createConnection, Entity } from "typeorm";

export class DataSource {
    private _connection;

    public Entities: Function[];

    async getConnection() {
        if(this._connection) return this._connection;

        const conn = await createConnection({
            "type": "postgres",
            "schema": "cmd_owner",
            "database": "cmds",
            "host": "127.0.0.1",
            "port": 5432,
            "username": "postgres",
            "password": "Win2008",
            "entities": Object.values(this.Entities),
        })
        this._connection = conn;
        return conn
    }

    setEntity(entities) { this.Entities = entities }
}

function Entities(Entities: any): (string | Function | import("typeorm").EntitySchema<any>)[] {
    throw new Error("Function not implemented.");
}
