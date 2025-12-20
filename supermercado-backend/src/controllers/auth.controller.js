const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @route POST /auth/register
 * @description Registra un nuevo usuario
 */
async function register(req, res) {
  try {
    const { username, password, email, rol } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!username || !password || !email) {
      return res.status(400).json({ msg: 'Todos los campos son requeridos' });
    }

    // Validar que el rol sea válido si se proporciona
    const rolesPermitidos = ['administrador', 'empleado', 'cliente'];
    if (rol && !rolesPermitidos.includes(rol)) {
      return res.status(400).json({
        msg: `Rol inválido. Roles permitidos: ${rolesPermitidos.join(', ')}`,
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      $or: [{ username }, { email }],
    });
    if (usuarioExistente) {
      return res.status(400).json({ msg: 'El usuario o email ya existe' });
    }

    // Encripta la contraseña antes de guardarla
    const hashed = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      username,
      password: hashed,
      email,
      rol: rol || 'cliente', // Por defecto es cliente
    });
    await nuevoUsuario.save();

    res
      .status(201)
      .json({ msg: 'Usuario creado exitosamente', rol: nuevoUsuario.rol });
  } catch (error) {
    console.error('Error en registro:', error);
    res
      .status(500)
      .json({ msg: 'Error al crear usuario', error: error.message });
  }
}

/**
 * @route POST /auth/login
 * @description Inicia sesión de un usuario
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: 'Username y contraseña son requeridos' });
    }

    // Busca al usuario en la base de datos
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Compara la contraseña ingresada con la almacenada
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    // Genera un token JWT con el ID del usuario
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      token,
      user: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res
      .status(500)
      .json({ msg: 'Error al iniciar sesión', error: error.message });
  }
}

module.exports = {
  register,
  login,
};
