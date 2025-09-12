import { test, expect } from '@playwright/test'; //librerias utilizando, expect son aserciones

test('TC-1 Verificación de elementos visuales en la página de registro', async ({ page }) => {
  await page.goto('http://localhost:3000//');

  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByTestId('boton-registrarse')).toBeVisible();

});

test('TC-2 Verificar Boton de registro esta inhabilitado por defecto', async({page}) => {
  await page.goto('http://localhost:3000//');
  await expect(page.getByTestId('boton-registrarse')).toBeDisabled();

});

test('TC-3  Verificar que el botón de registro se habilita al completar los campos', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await page.locator('input[name="firstName"]').fill('Luana');
  await page.locator('input[name="lastName"]').fill('Deudor');
  await page.locator('input[name="email"]').fill('luz@gmail.com');
  await page.locator('input[name="password"]').fill('123456');
  await expect(page.getByTestId('boton-registrarse')).toBeEnabled();

});

test('TC4 Verificar redireccionamiento a página de inicio de sesión al hacer clic', async ({ page}) => {
  await page.goto('http://localhost:3000');
  await page.getByTestId('boton-login-header-signup').click();
  await expect(page).toHaveURL('http://localhost:3000/login');
  await page.waitForTimeout(5000); //Espera para asegurar que la página se carga
});

test('TC5 Verificar Registro exitoso con datos vàlidos', async({page}) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Deudor');
  await page.locator('input[name="email"]').fill('florencia' + Date.now().toString() + '@gmail.com');
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso')).toBeVisible();

});

test('TC6 Verificar Registro exitoso con datos vàlidos', async({page}) => {
  const email = 'florencia' + Date.now().toString() + '@gmail.com';
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Deudor');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso')).toBeVisible();
  
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Juan');
  await page.locator('input[name="lastName"]').fill('Deudor');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso')).not.toBeVisible();

});
