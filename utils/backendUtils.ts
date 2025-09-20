import {Page, Locator, request} from '@playwright/test';


export class BackendUtils {
    readonly page:Page;  //readonly solo se lee una vez, y no va cambiar la variable
   
   

    //constructor inicializa los elementos  
    constructor(page: Page) {
        this.page = page;
    }

    async enviarRequestDeBackend(endpoint: string, data: any) {
        const response = await this.page.request.post(endpoint, {
            headers: {
                'Accept': 'applications/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            data: data
        });
           const responseBody = await response.json();
           return responseBody; 
    }



}