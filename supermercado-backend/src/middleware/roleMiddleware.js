const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Middleware para verificar si el usuario tiene uno de los roles permitidos
 * @param {Array} roles - Array de roles permitidos
 */
function checkRole(roles) {
  return async (req, res, next) => {
    try {
      // Verificar que el token existe
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res
          .status(401)
          .json({ msg: 'No autorizado - Token no proporcionado' });
      }

      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findById(decoded.id).select('-password');
      if (!usuario) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }

      // Verificar si el usuario tiene uno de los roles permitidos
      if (!roles.includes(usuario.rol)) {
        return res.status(403).json({
          msg: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(
            ', '
          )}`,
        });
      }

      // Almacenar el usuario en la petición
      req.user = usuario;
      next();
    } catch (error) {
      return res.status(403).json({ msg: 'Token inválido o expirado' });
    }
  };
}

module.exports = checkRole;
