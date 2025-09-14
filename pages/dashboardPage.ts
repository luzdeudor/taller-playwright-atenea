import {Page, Locator} from '@playwright/test';

export class DashboardPage {
    readonly page:Page;  //readonly solo se lee una vez, y no va cambiar la variable
    readonly dashboardTitle: Locator;


    //constructor inicializa los elementos  
    constructor(page: Page) {
        this.page = page;
        this.dashboardTitle = page.getByTestId('titulo-dashboard');
    }

    async visitarPaginaDashboard() {
        await this.page.goto('http://localhost:3000/dashboard');

    }




}