import {test as setup, expect} from '@playwright/test';
import { BackendUtils } from '../utils/backendUtils';
import TestData from '../data/testData.json';
import {LoginPage } from '../pages/loginPage';
import { request } from 'http';
import { DashboardPage } from '../pages/dashboardPage';
import { ModalCrearCuenta } from '../pages/modalCrearCuenta';
import fs from 'fs/promises'; // Devolver promesas dentro de un archivo . NODE
import path from 'path';  //encontrar archivos dentro un directorio

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let modalCrearCuenta: ModalCrearCuenta;

//Guardar la sesión de los dos usuarios
const usuarioEnviaAuthFile = 'playwright/.auth/usuarioEnvia.json';
const usuarioRecibeAuthFile = 'playwright/.auth/usuarioRecibe.json';
const usuarioEnviaDataFile =  'playwright/.auth/usuarioEnvia.data.json';

setup.beforeEach(async ({page}) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    modalCrearCuenta = new ModalCrearCuenta(page);
    await loginPage.visitarPaginaLogin();
});

setup('Generar usuario  que envía dinero', async ({page, request}) => {
    const nuevoUsuario = await BackendUtils.crearUsuarioPorAPI(request, TestData.usuarioValido);

    //Guardamos los datos del nuevo usuario para poder usarlo en los tests de transacciones  -- fs: file system, resolve: de varias rutas lo convierte en una ruta absoluta
    await fs.writeFile(path.resolve(__dirname, '..', usuarioEnviaDataFile), JSON.stringify(nuevoUsuario, null, 2));

    await loginPage.completarYHacerClicBotonLogin(nuevoUsuario);
    await dashboardPage.botonDeAgregarCuenta.click();
    await modalCrearCuenta.seleccionarTipoDeCuenta('Débito');
    await modalCrearCuenta.completarMontoDeCuenta('100');
    await modalCrearCuenta.botonCrearCuenta.click();
    await expect(page.getByText('Cuenta creada exitosamente')).toBeVisible();

    await page.context().storageState({path: usuarioEnviaAuthFile});
});

setup('Loguearse con usuario que recibe dinero', async ({page}) => {
    await loginPage.completarYHacerClicBotonLogin(TestData.usuarioValido);
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await page.context().storageState({path: usuarioRecibeAuthFile});
});