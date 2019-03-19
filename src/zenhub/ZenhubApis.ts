import { WaffleEpic } from "../waffle/WaffleEpic";
import { HttpClient } from "../util/HttpClient";


// tslint:disable
export class ZenhubApis {


    
    public convertToEpic(epic: WaffleEpic){
        new HttpClient( { "X-Authentication-Token" : "<token>" }).httpPost()
    }
    

}