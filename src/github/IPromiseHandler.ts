export interface IPromiseHandler<T> {
    then(args: any): any;
    catch(arg: any): any;
}
