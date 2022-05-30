# Desafio Clase 26: Autorización y autenticación

## Iniciar proyecto con "node server.js"

### Consigna: INICIO DE SESIÓN

<p>Implementar sobre el entregable que venimos realizando un mecanismo de autenticación. Para ello:</p>
    <ul>
        <li>Se incluirá una vista de registro, en donde se pidan email y contraseña. Estos datos se persistirán usando MongoDb, en una (nueva) colección de usuarios, cuidando que la contraseña quede encriptada (sugerencia: usar la librería bcrypt).</li>
        <li>Una vista de login, donde se pida email y contraseña, y que realice la autenticación del lado del servidor a través de una estrategia de passport local.</li>
        <li>Cada una de las vistas (logueo - registro) deberá tener un botón para ser redirigido a la otra.</li>
        <li>Una vez logueado el usuario, se lo redirigirá al inicio, el cual ahora mostrará también su email, y un botón para desolguearse.</li>
        <li>Además, se activará un espacio de sesión controlado por la sesión de passport. Esta estará activa por 10 minutos y en cada acceso se recargará este tiempo.</li>
    </ul>
