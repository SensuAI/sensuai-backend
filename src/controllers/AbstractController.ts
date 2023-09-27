import {Router} from 'express';
import {AWSError, CognitoIdentityServiceProvider} from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

//Middlewares
import ValidationErrorMiddleware from '../middlewares/validationError';

export default abstract class AbstractController{
    private _router:Router = Router();
    private _prefix: string;

    protected handleErrors = ValidationErrorMiddleware.handleErrors;
    
    public get prefix(): string {
        return this._prefix;
    }
    
    public get router():Router {
        return this._router;
    }
    
    protected constructor(prefix:string){
        this._prefix=prefix;
        this.initRoutes()
    }
    //Inicializar las rutas
    protected abstract initRoutes():void; 
    //Validar el cuerpo de la petición
    protected abstract validateBody(type: any): any;

}