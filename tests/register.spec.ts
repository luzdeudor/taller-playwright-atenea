import { test, expect, request} from '@playwright/test'; //librerias utilizando, expect son aserciones
import { RegisterPage }  from '../pages/registerPage'; 
import TestData from '../data/testData.json';
import { BackendUtils } from '../utils/backendUtils';

let registerPage: RegisterPage;
let backendUtils: BackendUtils;


test.beforeEach(async ({page}) => {
  registerPage = new RegisterPage(page);
  await registerPage.visitarPaginaRegistro();
}); 

test('TC-1 Verificación de elementos visuales en la página de registro', async ({ page }) => {
  await expect(registerPage.firstNameInput).toBeVisible();
  await expect(registerPage.lastNameInput).toBeVisible();
  await expect(registerPage.emailInput).toBeVisible();
  await expect(registerPage.passwordInput).toBeVisible();
  await expect(registerPage.registerButton).toBeVisible();
});

test('TC-2 Verificar Boton de registro esta inhabilitado por defecto', async({page}) => {
  await expect(registerPage.registerButton).toBeDisabled();

});

test('TC-3  Verificar que el botón de registro se habilita al completar los campos obligatorios', async ({ page }) => {
  await registerPage.completarFormularioRegistro(TestData.usuarioValido);
  await registerPage.hacerClicBotonRegistro();
  //await registerPage.firstNameInput.fill('Luana');
  //await registerPage.lastNameInput.fill('Deudor');
  //await registerPage.emailInput.fill('luz@gmail.com');
  //await registerPage.passwordInput.fill('123456');
  //await expect(registerPage.registerButton).toBeEnabled();

// usando solo el json await registerPage.completarFormularioRegistro(TestData.usuarioValido.nombre, TestData.usuarioValido.apellido, TestData.usuarioValido.email, TestData.usuarioValido.password);
});

test('TC4 Verificar redireccionamiento a página de inicio de sesión al hacer clic en el boton de registro', async ({ page}) => {
  await registerPage.loginButton.click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC5 Verificar Registro exitoso con datos vàlidos', async({page}) => {
  test.step('Completar el formulario de registro con datos válidos', async() => {
    const email = (TestData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (TestData.usuarioValido.email.split('@')[1]);
    TestData.usuarioValido.email = email;
    await registerPage.completarYHacerClicBotonRegistro(TestData.usuarioValido)
  });
    await expect(page.getByText('Registro exitoso')).toBeVisible();

});

test('TC6 Verificar que un usuario no pueda registrase con un correo electrónico ya existente', async({page}) => {
  const email = (TestData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (TestData.usuarioValido.email.split('@')[1]);
  TestData.usuarioValido.email = email;

  await registerPage.completarYHacerClicBotonRegistro(TestData.usuarioValido);
  await expect(page.getByText('Registro exitoso')).toBeVisible();
  await registerPage.visitarPaginaRegistro();
  await registerPage.completarYHacerClicBotonRegistro(TestData.usuarioValido);
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso')).not.toBeVisible();

});


test('TC-8 Verificar registro exitoso con datos válidos verificando respuesta de la API', async ({page}) => {
    test.step('Completar el formulario', async () => {
        const email = (TestData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (TestData.usuarioValido.email.split('@')[1]);
        TestData.usuarioValido.email = email;
        await registerPage.completarFormularioRegistro(TestData.usuarioValido)         
    });
        const responsePromise = page.waitForResponse('http://localhost:4000/api/auth/signup');
        await registerPage.hacerClicBotonRegistro();
        const response = await responsePromise;
        const responseBody = await response.json();
        
        expect(response.status()).toBe(201);
        expect(responseBody).toHaveProperty('token');
        expect(typeof responseBody.token).toBe('string');
        expect(responseBody).toHaveProperty('user');
        expect(responseBody.user).toEqual(expect.objectContaining({
          id: expect.any(String),
          firstName: TestData.usuarioValido.nombre,
          lastName: TestData.usuarioValido.apellido,
          email: TestData.usuarioValido.email,
        }));

        await expect(page.getByText('Registro exitoso')).toBeVisible();
});

test('TC-9 Generar signup desde la API-backend', async ({page, request}) => {
  const email = (TestData.usuarioValido.email.split('@')[0]) + Date.now().toString() +'@' + (TestData.usuarioValido.email.split('@')[1]);
  //const responseBackend = await backendUtils.enviarRequestDeBackend
  const response = await request.post('http://localhost:4000/api/auth/signup', {
    headers: {
      'Accept': 'application/vnd.githun.v3+json',
      'Content-Type': 'application/json'
    },
    data: {
      firstName: TestData.usuarioValido.nombre,
      lastName:  TestData.usuarioValido.apellido,
      email: email,
      password: TestData.usuarioValido.password,
    }
  });
  const responseBody = await response.json();
  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.usuarioValido.nombre,
    lastName: TestData.usuarioValido.apellido,
    email: email,
  }));
});

test('TC10 Verificar comportamiento del front ante un error 500 en el registro', async ({page, request}) => {
  const email = (TestData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (TestData.usuarioValido.email.split('@')[1]);
  
  //Interceptar solicitud de registro y devolver un error
  await page.route('**/api/auth/signup', route => {
    route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({message: 'Email already in use'}),
    });
  });
  
  //Llenar el formulario. La navegación se hace en beforeEach
  await registerPage.firstNameInput.fill(TestData.usuarioValido.nombre);
  await registerPage.lastNameInput.fill(TestData.usuarioValido.apellido);
  await registerPage.emailInput.fill(email);
  await registerPage.passwordInput.fill(TestData.usuarioValido.password);

  //Hacer clic en el Boton de registro
  await registerPage.registerButton.click();

  //Verificar que se muestra un mensaje de error
  //NOTA: El texto 'Error en el registro' es una suposicion y prodría necesitar
  await expect(page.getByText('Email already in use')).toBeVisible();

});





