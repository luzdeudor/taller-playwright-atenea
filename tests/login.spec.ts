import { test, expect, request } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import TestData from '../data/testData.json';
import { DashboardPage } from '../pages/dashboardPage'
import { register } from 'module';
import { RegisterPage } from '../pages/registerPage';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

test.beforeEach(async ({page}) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.visitarPaginaLogin();
})

test('TC-7 Verificar inicio de sesión exitoso con credenciales válidas', async ({ page }) => {
    await loginPage.completarYHacerClicBotonLogin(TestData.usuarioValido)
    await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
    await expect(dashboardPage.dashboardTitle).toBeVisible();

});

test('TC11 Loguearse con nuevo usuario creado por backend', async ({page, request}) => {
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

  expect(response.status()).toBe(201);
  
  const responsePromiseLogin = page.waitForResponse('http://localhost:4000/api/auth/login');
  await loginPage.completarYHacerClicBotonLogin({email: email, password: TestData.usuarioValido.password});


  const responseLogin = await responsePromiseLogin;
  const responseBodyLoginJson = await responseLogin.json();

  expect(responseLogin.status()).toBe(200);
  expect(responseBodyLoginJson).toHaveProperty('token');
  expect(typeof responseBodyLoginJson.token).toBe('string');
  expect(responseBodyLoginJson).toHaveProperty('user');
  expect(responseBodyLoginJson.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: TestData.usuarioValido.nombre,
    lastName: TestData.usuarioValido.apellido,
    email: email,
  }));


  await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
  await expect(dashboardPage.dashboardTitle).toBeVisible();

});