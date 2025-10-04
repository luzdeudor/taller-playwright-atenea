import {Page, Locator} from '@playwright/test';

export class RegisterPage {
    readonly page:Page;  //readonly solo se lee una vez, y no va cambiar la variable
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly registerButton: Locator;
    readonly loginButton: Locator;


    //constructor inicializa los elementos  
    constructor(page: Page) {
        this.page = page;
        this.firstNameInput = page.locator('input[name="firstName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.registerButton = page.getByTestId('boton-registrarse');
        this.loginButton = page.getByTestId('boton-login-header-signup');

    }

    async visitarPaginaRegistro() {
        await this.page.goto('http://localhost:3000/');
        //await this.registerButton.click();

    }
/*
    async completarFormularioRegistro(firstName: string, lastName: string, email: string, passwordInput: string) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.emailInput.fill(email);
        await this.passwordInput.fill(email);
    }*/

    async completarFormularioRegistro(usuario: {nombre: string, apellido: string, email: string, contraseña: string}) {
        await this.firstNameInput.fill(usuario.nombre);
        await this.lastNameInput.fill(usuario.apellido);
        await this.emailInput.fill(usuario.email);
        await this.passwordInput.fill(usuario.contraseña);
    }


    async hacerClicBotonRegistro() {
        await this.registerButton.click();
    }

    async completarYHacerClicBotonRegistro(usuario: {nombre: string, apellido: string, email: string, contraseña: string}){
        await this.completarFormularioRegistro(usuario);
        await this.hacerClicBotonRegistro();
    }



}