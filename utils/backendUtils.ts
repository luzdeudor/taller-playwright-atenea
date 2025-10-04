import {APIRequestContext, expect} from '@playwright/test';


export class BackendUtils {
   
    static async crearUsuarioPorAPI(request: APIRequestContext, usuario: any) {
        const email = (usuario.email.split('@')[0]) + Date.now().toString() + '@' + usuario.email.split('@')[1];
        const response = await request.post('http://localhost:4000/api/auth/signup', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                //'Accept': '*/*',
                'Content-Type': 'application/json',
            },
            data: {
                firstName: usuario.nombre,
                lastName:  usuario.apellido,
                email: email,
                password: usuario.contraseña,
            }
        });
           expect(response.status()).toBe(201);
           return {email: email, contraseña: usuario.contraseña};
    }

}