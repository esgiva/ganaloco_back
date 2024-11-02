const fs = require('fs/promises');
const mongoose = require('mongoose');

///////////////////////////////////////////Estructura de base de datos Crear usuarios////////////////////////////////////////
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    cedula: { type: String, required: true },
    ciudad: { type: String, required: true },
    numeroCelular: { type: String, required: true },
    role: { type: String, default: 'user' }
  });

  const User = mongoose.model('User', userSchema,'participantes');

///////////////////////////////////////////Estructura de base de datos Crear Administrador////////////////////////////////////////
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const Admin = mongoose.model('Admin', AdminSchema,'participantes');

/////////////////////////////////////////////LOGIN/////////////////////////////////////////////////////////////////////

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
      const validateUser = await User.findOne({ username, password });

      if (validateUser) {
          console.log("Login exitoso para:", username);
          // Supongamos que `validateUser` tiene un campo `role` y otros datos del usuario
          return res.json({
              success: true,
              message: 'Login Success',
              user: {
                  username: validateUser.username,
                  nombre: validateUser.nombre,
                  role: validateUser.role, // Asegúrate de que el modelo de usuario tenga un campo `role`
              },
          });
      } else {
          return res.status(400).json({ success: false, message: 'El usuario o contraseña no son correctas' });
      }
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};


/////////////////////////////////////////////Create User/////////////////////////////////////////////////////////////////////

const createUser = async (req, res) => {
  const { username, password, nombre, fechaNacimiento, cedula, ciudad, numeroCelular } = req.body;
  const role = 'user';

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Usuario ya existe' });
    }

    const newUser = new User({
      username,
      password,
      nombre,
      fechaNacimiento,
      cedula,
      ciudad,
      numeroCelular,
      role
    });

    await newUser.save();
    res.json({ success: true, message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

/////////////////////////////////////////////Create User/////////////////////////////////////////////////////////////////////

const createAdmin = async (req, res) => {
  const { username, password } = req.body;
  const role = 'admin';

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Usuario ya existe' });
    }

    const newAdmin = new Admin({
      username,
      password,
      role
    });

    await newAdmin.save();
    res.json({ success: true, message: 'Usuario Administrador creado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};


/////////////////////////////////////////////Estructura de base de datos registrar codigo /////////////////////////////////////////////////////////////////////

const codeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  codigo: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  estado: { type: String, required: true },
  user: { type: String, required: true }

});

const Codigo = mongoose.model('premios', codeSchema,'lista');

//////////////////////////////////////////Registrar Codigos////////////////////////////////////////////////

const newCode = async (req, res) => {
  const { codigo } = req.body;
  // Obtener el nombre del usuario desde req.user (asumiendo que el usuario autenticado está en req.user)
  
  try {
    // Verificar si el código ya está registrado
    const codigoExistente = await Codigo.findOne({ codigo });

    if (codigoExistente) {
        if (codigoExistente.estado === 'libre') {
            // Cambiar el estado a 'registrado'
            codigoExistente.estado = 'registrado';

            await codigoExistente.save();
            return res.status(200).json({ mensaje: 'El código ha sido registrado exitosamente.' });
        } else if (codigoExistente.estado === 'registrado') {
            return res.status(400).json({ mensaje: 'El código ya está registrado.' });
        }
    } else {
        // Si el código no existe, mostrar un error
        return res.status(400).json({ mensaje: 'Código no válido.' });
    }
} catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el código.', error });
}};


//////////////////////////////////////////Llamar Datos del participante////////////////////////////////////////////////

const getAllParticip = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar usuarios y solo seleccionar los campos: correo, ciudad, y numero
    const allParticipantes = await User.find(
      { username, password },   // Condiciones de búsqueda
      { nombre:1, numeroCelular: 1, ciudad: 1, _id: 0 }  // Proyección: solo los campos que quieres traer
    );

    if (allParticipantes.length > 0) {
      console.log("Consulta exitosa");

      return res.json(allParticipantes);  
    } else {
      return res.status(404).json({ mensaje: 'Usuarios no encontrados' });
    }
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error en la consulta', error });
  }
};

//////////////////////////////////////////Llamar codigos////////////////////////////////////////////////

const getCodes = async (req, res) => {
  try {
    const codes = await Code.find().populate('nombre', 'username');
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los códigos' });
  }
};


module.exports = {
    loginUser,
    createUser,
    createAdmin,
    newCode,
    getAllParticip,
    getCodes

}