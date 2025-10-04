import { test, expect, request, APIRequestContext} from "@playwright/test";
import { DashboardPage } from "../pages/dashboardPage";
import TestData from '../data/testData.json';
import { ModalEnviarTransferencia } from "../pages/modalEnviarTransferencia";
import fs from 'fs/promises';

    let dashboardPage: DashboardPage;
    let modalEnviarTransferencia: ModalEnviarTransferencia;

    const testUsuarioEnvia = test.extend({
        storageState: require.resolve('../playwright/.auth/usuarioEnvia.json')
    })
     const testUsuarioRecibe = test.extend({
        storageState: require.resolve('../playwright/.auth/usuarioRecibe.json')
    })

    test.beforeEach(async ({page}) => {
        dashboardPage = new DashboardPage(page);
        modalEnviarTransferencia = new ModalEnviarTransferencia(page);
        await dashboardPage.visitarPaginaDashboard();
    })


    testUsuarioEnvia('TC-12 Transacción exitosa', async ({ page }) => {
        testUsuarioEnvia.info().annotations.push({
            type:'Información de usuario que recibe',
            description: TestData.usuarioValido.email
        });
        
        await expect(dashboardPage.dashboardTitle).toBeVisible();
        await dashboardPage.botonEnviarDinero.click();
        await modalEnviarTransferencia.completarYHacerClicBotonEnviar(TestData.usuarioValido.email, '200');
        await expect(page.getByText('Transferencia enviada a ' + TestData.usuarioValido.email)).toBeVisible();
    
    });

    testUsuarioRecibe('TC-13 Verificar que usuario reciba la transferencia', async ({ page }) => {
        await expect(dashboardPage.dashboardTitle).toBeVisible();
        await expect(page.getByText('Transferencia de email').first()).toBeVisible();
        await page.waitForTimeout(5000);
    
    });

    //Test unificado que envìa dinero por API y verifica por UI
    testUsuarioRecibe('TC-14 Verificar transferencia recibida(Enviada por API)', async ({page, request}) => {
       // #1 Preparacion para lectura de datos y TOKEN del remitente
       
       //Leemos el archivo de datos del usuario que envia  para obtener su email.
       const usuarioEnviaData = require.resolve('../playwright/.auth/usuarioEnvia.data.json');
       const usuarioEnviaContenidoData = await fs.readFile(usuarioEnviaData, 'utf-8');
       const datosDeUsuarioEnvia = JSON.parse(usuarioEnviaContenidoData); //convertimos el archivo en un objeto JSON
       const emailDeUsuarioEnvia = datosDeUsuarioEnvia.email;
       expect(emailDeUsuarioEnvia, 'El email del usuario que envia no se leyo correctamente desde el archivo').toBeDefined();

        // Leemos el archivo de autenticación del remitente para obtener su JWT
        const usuarioEnviaAuth = require.resolve('../playwright/.auth/usuarioEnvia.json');
        const usuarioEnviaContenidoAuth = await fs.readFile(usuarioEnviaAuth, 'utf-8');
        const datosDeUsuarioEnviaAuth = JSON.parse(usuarioEnviaContenidoAuth);

        const jwtDeUsuarioEnvia = datosDeUsuarioEnviaAuth.origins[0]?.localStorage.find((item: any) => item.name === 'jwt');
        expect(jwtDeUsuarioEnvia, 'El JWT del usuario que envia no se leyo correctamente desde el archivo').toBeDefined();
        const jwt = jwtDeUsuarioEnvia.value;


       // 2# Obtener cuenta y enviar transferencia via API

       //Primero, obtenemos la cuenta del remitente para saber el ID de origen
        const respuestaDeCuentas = await request.get('http://localhost:4000/api/accounts', {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        expect(respuestaDeCuentas.ok(),`La API para obtener cuentas falló: ${respuestaDeCuentas.status()}`).toBeTruthy();
        const cuentas = await respuestaDeCuentas.json();
        expect(cuentas.length, 'No se encontraron cuentas para el usuario').toBeGreaterThan(0);
        const idDeCuentaOrigen = cuentas[0]._id; //Tomamaos el valor de ID de la primera cuenta

        const montoAleatorio = Math.floor(Math.random() * 100) + 1; //Monto aleatorio entre 1 y 100
        console.log(`Enviando transferencia de $${montoAleatorio} desde la cuenta ${idDeCuentaOrigen} a ${emailDeUsuarioEnvia} a ${TestData.usuarioValido.email}`); //quitar email
        
        //Ahora con todos los datos, podemos enviar la transferencia de dinero de 1 cuenta a la otra.
        const respuestaDeTransferencia = await request.post('http://localhost:4000/api/transactions/transfer', {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            data: {
                fromAccountId: idDeCuentaOrigen,
                toEmail: TestData.usuarioValido.email, //Destinatario fijo
                amount: montoAleatorio
            }
        });
        expect(respuestaDeTransferencia.ok(), `La API para transferir falló: ${respuestaDeTransferencia.status()}`).toBeTruthy();

        // #3 Verificacion: Comprobar que el monto llego al destinatario por UI
        await page.reload();
        await page.waitForLoadState('networkidle');
        await expect(dashboardPage.dashboardTitle).toBeVisible();

        //Verificamos que se muestre el mail del remitente en la fila, en el primer lugar
        await expect(dashboardPage.elementosListaTransferencia.first()).toContainText(emailDeUsuarioEnvia);

        //Verificamos que se muestre el monto correcto
        //  Usamos una expresion regular para buscar el numero 5.00 eje.
        const montoRegex = new RegExp(String(montoAleatorio.toFixed(2))); //2 acepta dos decimales
        await expect(dashboardPage.elementosListaMontoTransferencia.first()).toContainText(montoRegex);

        //await page.waitForTimeout(5000);
    });









