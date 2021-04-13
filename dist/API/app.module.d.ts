import { Connection } from 'typeorm';
export default class AppModule {
    private readonly connection;
    constructor(connection: Connection);
}
