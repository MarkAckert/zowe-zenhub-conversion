import { WaffleEpic } from "../waffle/WaffleEpic";
import { HttpClient } from "../util/HttpClient";
import { appendFile } from "fs";


// tslint:disable
export class ZenhubApis {

    private api: HttpClient;

    constructor(){
        this.api = new HttpClient();
    }
    
    public convertToEpic(epic: WaffleEpic){
        
    }
    
    public getBoardColumns(repoId: number) {
        this.api.get(`/p1/repositories/${repoId}/board`).then((result) => {
            console.log(result.body);
            console.log(result.status);
        });
    }

}