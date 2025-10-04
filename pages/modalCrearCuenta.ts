import {Page, Locator} from '@playwright/test';

export class ModalCrearCuenta {
    readonly page:Page;  //readonly solo se lee una vez, y no va cambiar la variable
    readonly tipoDeCuentaDropdown: Locator;
    readonly montoInput: Locator;
    readonly botonCancelar: Locator;
    readonly botonCrearCuenta: Locator;

    //constructor inicializa los elementos  
    constructor(page: Page) {
        this.page = page;
        this.tipoDeCuentaDropdown = page.getByRole('combobox', {name: 'Tipo de cuenta *'});
        this.montoInput = page.getByRole('spinbutton', {name: 'Monto inicial *'});
        this.botonCancelar = page.getByTestId('boton-cancelar-crear-cuenta') ;
        this.botonCrearCuenta = page.getByTestId('boton-crear-cuenta');

    }

    async seleccionarTipoDeCuenta(tipoDeCuenta: string) {
        await this.tipoDeCuentaDropdown.click();
        await this.page.getByRole('option', {name: tipoDeCuenta}).click();
    }

    async completarMontoDeCuenta(monto: string) {
        await this.montoInput.fill(monto);
    }   

}