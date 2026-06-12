import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';

export default function App() {
  // 📆 DETECCIÓN AUTOMÁTICA DEL AÑO EN CURSO
  const añoActual = new Date().getFullYear();

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // 💰 ESTADOS DE IMPORTES MODIFICABLES
  const [precioLaborable, setPrecioLaborable] = useState(28);
  const [precioFestivoFinde, setPrecioFestivoFinde] = useState(70);

  // Base de datos de usuarios (Dinámica)
  const [usuariosDB, setUsuariosDB] = useState([
    { id: '1', nombre: 'Juan Carlos', user: 'Juan Carlos', pass: 'jc01', rol: 'empleado', color: '#EF4444', activo: true },
    { id: '2', nombre: 'Lucas', user: 'Lucas', pass: 'Lucas06', rol: 'empleado', color: '#10B981', activo: true },
    { id: '3', nombre: 'Óscar Idañez', user: 'Óscar Idañez', pass: 'Idañez07', rol: 'empleado', color: '#3B82F6', activo: true },
    { id: '4', nombre: 'Óscar Ibarreta', user: 'Óscar Ibarreta', pass: 'Ibarreta08', rol: 'empleado', color: '#F59E0B', activo: true },
    { id: 'admin1', nombre: 'Responsable Técnico (Friti)', user: 'Friti', pass: 'friti43', rol: 'admin', color: '#475569', activo: true },
    { id: 'admin2', nombre: 'Responsable Técnico (Toni)', user: 'Toni', pass: 'tonaxo45', rol: 'admin', color: '#475569', activo: true },
    { id: 'admin3', nombre: 'Responsable Técnico (Carmen)', user: 'Carmen', pass: 'carmen62', rol: 'admin', color: '#475569', activo: true }
  ]);

  // Formulario para registrar un NUEVO Técnico en el sistema
  const [nuevoNombreTecnico, setNuevoNombreTecnico] = useState('');
  const [nuevoUserTecnico, setNuevoUserTecnico] = useState('');
  const [nuevoPassTecnico, setNuevoPassTecnico] = useState('');
  const [nuevoColorTecnico, setNuevoColorTecnico] = useState('#8B5CF6'); // Violeta por defecto

  // 🦇 Festivos de Valencia oficiales
  const festivosBase = {
    '01-01': { nombre: 'Año Nuevo', tipo: 'Nacional', icono: '🇪🇸' },
    '01-06': { nombre: 'Reyes', tipo: 'Nacional', icono: '🇪🇸' },
    '01-22': { nombre: 'S. Vicente M.', tipo: 'Local', icono: '📍' },
    '03-19': { nombre: 'San José', tipo: 'Autonómico', icono: '🦇' },
    '05-01': { nombre: 'Trabajador', tipo: 'Nacional', icono: '🇪🇸' },
    '06-24': { nombre: 'San Juan', tipo: 'Autonómico', icono: '🦇' },
    '08-15': { nombre: 'Asunción', tipo: 'Nacional', icono: '🇪🇸' },
    '10-09': { nombre: 'Día CV', tipo: 'Autonómico', icono: '🦇' },
    '10-12': { nombre: 'Hispanidad', tipo: 'Nacional', icono: '🇪🇸' },
    '11-01': { todos: 'Todos los Santos', tipo: 'Nacional', icono: '🇪🇸' },
    '12-08': { nombre: 'Inmaculada', tipo: 'Nacional', icono: '🇪🇸' },
    '12-25': { nombre: 'Navidad', tipo: 'Nacional', icono: '🇪🇸' }
  };

  const festivosDelAño = {};
  Object.keys(festivosBase).forEach(mesDia => {
    festivosDelAño[`${añoActual}-${mesDia}`] = festivosBase[mesDia];
  });

  // ⚙️ MOTOR DE ASIGNACIÓN ANUAL COMPLETA (Lee los técnicos activos dinámicamente)
  const generarCalendarioAnual = (forzarAleatorioCompleto = false, listaUsuariosModerna = usuariosDB) => {
    let nuevoCuadrante = {};
    let fechaBucle = new Date(añoActual, 0, 1);
    
    // Filtramos solo los empleados que existen en el momento de generar
    const idsEmpleados = listaUsuariosModerna.filter(u => u.rol === 'empleado' && u.activo).map(u => u.id);
    
    if (idsEmpleados.length === 0) return {};

    let indiceOrden = 0;
    let poolAleatorioSemanal = [...idsEmpleados].sort(() => Math.random() - 0.5);

    // Configuración por defecto original (parche junio para los 4 iniciales)
    const ordenEstrictoJunio = idsEmpleados.includes('1') ? ['1', '4', '2', '3'] : idsEmpleados;
    const fechaPivoteStricta = new Date(añoActual, 5, 19);

    while (fechaBucle.getFullYear() === añoActual) {
      const a = fechaBucle.getFullYear();
      const m = String(fechaBucle.getMonth() + 1).padStart(2, '0');
      const d = String(fechaBucle.getDate()).padStart(2, '0');
      const isoKey = `${a}-${m}-${d}`;
      const diaSemana = fechaBucle.getDay(); 

      if (forzarAleatorioCompleto) {
        // Rotación semanal pura los jueves para incluir a todos los técnicos (viejos y nuevos)
        if (diaSemana === 4 && isoKey !== `${añoActual}-01-01`) {
          poolAleatorioSemanal = [...idsEmpleados].sort(() => Math.random() - 0.5);
          indiceOrden = (indiceOrden + 1) % idsEmpleados.length;
        }
        nuevoCuadrante[isoKey] = poolAleatorioSemanal[indiceOrden % poolAleatorioSemanal.length];
      } else {
        if (fechaBucle < fechaPivoteStricta) {
          if (fechaBucle.getDate() !== 1 && diaSemana === 5) {
            indiceOrden = (indiceOrden + 1) % idsEmpleados.length;
          }
          nuevoCuadrante[isoKey] = idsEmpleados[indiceOrden % idsEmpleados.length];
        } else {
          if (fechaBucle.getTime() === fechaPivoteStricta.getTime()) {
            indiceOrden = 0;
          } else if (diaSemana === 4) {
            indiceOrden = (indiceOrden + 1) % ordenEstrictoJunio.length;
          }
          nuevoCuadrante[isoKey] = ordenEstrictoJunio[indiceOrden % ordenEstrictoJunio.length];
        }
      }
      fechaBucle.setDate(fechaBucle.getDate() + 1);
    }
    return nuevoCuadrante;
  };

  const [guardiasAnuales, setGuardiasAnuales] = useState(() => generarCalendarioAnual(false));

  // Estados de sesión, Login y Calendario
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); 
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputContraseña, setInputContraseña] = useState('');
  const [mesActual, setMesActual] = useState(new Date().getMonth()); 

  // Reemplazos Masivos y Formularios Vacaciones / Días libres
  const [idSaliente, setIdSaliente] = useState('1');
  const [idEntrante, setIdEntrante] = useState('2');
  const [fechaEfectiva, setFechaEfectiva] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoTramiteSeleccionado, setTipoTramiteSeleccionado] = useState('Vacaciones'); 

  // Listado global de peticiones / Vacaciones activas
  const [peticiones, setPeticiones] = useState([
    { id: '101', tecnicoId: '2', nombre: 'Lucas', tipo: 'Vacaciones', inicio: `${añoActual}-06-12`, fin: `${añoActual}-06-19`, estado: 'Pendiente' },
    { id: '102', tecnicoId: '3', nombre: 'Óscar Idañez', tipo: 'Día Libre', inicio: `${añoActual}-07-05`, fin: `${añoActual}-07-05`, estado: 'Pendiente' },
    { id: '103', tecnicoId: '4', nombre: 'Óscar Ibarreta', tipo: 'Vacaciones', inicio: `${añoActual}-08-10`, fin: `${añoActual}-08-17`, estado: 'Aprobado' }
  ]);

  // Edición de Credenciales y Vacaciones por el Admin
  const [idSeleccionadoModificar, setIdSeleccionadoModificar] = useState('1');
  const [nuevoUserAdmin, setNuevoUserAdmin] = useState('Juan Carlos');
  const [nuevoPassAdmin, setNuevoPassAdmin] = useState('jc01');
  
  // Nuevos campos para que el admin fuerce vacaciones directas
  const [adminTipoVacacion, setAdminTipoVacacion] = useState('Vacaciones');
  const [adminFechaInicio, setAdminFechaInicio] = useState('');
  const [adminFechaFin, setAdminFechaFin] = useState('');

  // 📝 DAR DE ALTA UN NUEVO TÉCNICO EN LA APLICACIÓN
  const registrarNuevoTecnico = () => {
    if (!nuevoNombreTecnico.trim() || !nuevoUserTecnico.trim() || !nuevoPassTecnico.trim()) {
      Alert.alert('Campos Incompletos', 'Por favor, rellena el nombre, usuario y clave del nuevo integrante.');
      return;
    }

    const nuevoId = Date.now().toString();
    const nuevoObjetoTecnico = {
      id: nuevoId,
      nombre: nuevoNombreTecnico.trim(),
      user: nuevoUserTecnico.trim(),
      pass: nuevoPassTecnico.trim(),
      rol: 'empleado',
      color: nuevoColorTecnico,
      activo: true
    };

    const listaActualizada = [...usuariosDB, nuevoObjetoTecnico];
    setUsuariosDB(listaActualizada);

    // Reseteamos campos
    setNuevoNombreTecnico('');
    setNuevoUserTecnico('');
    setNuevoPassTecnico('');
    
    Alert.alert(
      '¡Técnico Creado!', 
      `El usuario "${nuevoObjetoTecnico.user}" ha sido añadido. Si deseas incluirlo en el cuadrante general de este año, pulsa abajo el botón de "Regenerar Cuadrante Aleatorio".`
    );
  };

  // Cambiar técnico en admin y rellenar sus datos reales
  const seleccionarTecnicoParaModificar = (id) => {
    setIdSeleccionadoModificar(id);
    const empleado = usuariosDB.find(u => u.id === id);
    if (empleado) {
      setNuevoUserAdmin(empleado.user);
      setNuevoPassAdmin(empleado.pass);
    }
  };

  // 📐 MODIFICAR/CREAR VACACIONES DIRECTAMENTE DESDE EL ADMIN
  const asignarVacacionDirectaAdmin = () => {
    if (!adminFechaInicio.trim() || !adminFechaFin.trim()) {
      Alert.alert('Error', 'Debes rellenar las fechas de inicio y fin.');
      return;
    }
    const empleado = usuariosDB.find(u => u.id === idSeleccionadoModificar);
    const nuevaAusencia = {
      id: Date.now().toString(),
      tecnicoId: idSeleccionadoModificar,
      nombre: empleado ? empleado.nombre : 'Técnico',
      tipo: adminTipoVacacion,
      inicio: adminFechaInicio.trim(),
      fin: adminFechaFin.trim(),
      estado: 'Aprobado'
    };

    setPeticiones([...peticiones, nuevaAusencia]);
    setAdminFechaInicio('');
    setAdminFechaFin('');
    Alert.alert('Éxito', `Periodo de ${adminTipoVacacion} asignado correctamente.`);
  };

  // 🗑️ ELIMINAR O QUITAR VACACIONES DESDE EL PANEL DE ADMIN
  const eliminarVacacionAdmin = (idVacacion) => {
    Alert.alert(
      'Eliminar Ausencia',
      '¿Estás seguro de que deseas eliminar este registro de vacaciones/días libres?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          setPeticiones(peticiones.filter(p => p.id !== idVacacion));
        }}
      ]
    );
  };

  // 🎲 DISPARADOR DE MEZCLA Y REGENERACIÓN COMPLETA
  const handleRegenerarAleatorioAnual = () => {
    Alert.alert(
      '🎲 Repartir Guardias del Año',
      '¿Seguro que deseas redistribuir las guardias? Se incluirán todos los técnicos activos actuales (antiguos y nuevos incorporados).',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, mezclar año', onPress: () => {
          const nuevoMix = generarCalendarioAnual(true, usuariosDB);
          setGuardiasAnuales(nuevoMix);
          Alert.alert('Éxito', 'Se ha recalculado el cuadrante anual con la plantilla actual.');
        }}
      ]
    );
  };

  // Calcular importe de la semana actual
  const calcularInformacionSemanaActual = () => {
    const hoy = new Date();
    const diaDeLaSemana = hoy.getDay();
    
    const distanciaAlJueves = (diaDeLaSemana >= 4) ? (diaDeLaSemana - 4) : (diaDeLaSemana + 3);
    const juevesInicio = new Date(hoy);
    juevesInicio.setDate(hoy.getDate() - distanciaAlJueves);

    let totalSemana = 0;
    let tecnicoIdSemana = null;

    for (let i = 0; i < 7; i++) {
      const iteracion = new Date(juevesInicio);
      iteracion.setDate(juevesInicio.getDate() + i);
      
      const a = iteracion.getFullYear();
      const m = String(iteracion.getMonth() + 1).padStart(2, '0');
      const d = String(iteracion.getDate()).padStart(2, '0');
      const clave = `${a}-${m}-${d}`;

      if (i === 0) {
        tecnicoIdSemana = guardiasAnuales[clave];
      }

      const dSemana = iteracion.getDay();
      const esFinDeSemana = (dSemana === 0 || dSemana === 6);
      const infoFestivo = festivosDelAño[clave];
      const esFestivo = infoFestivo && (infoFestivo.tipo === 'Nacional' || infoFestivo.tipo === 'Autonómico');

      if (esFinDeSemana || esFestivo) {
        totalSemana += Number(precioFestivoFinde);
      } else {
        totalSemana += Number(precioLaborable);
      }
    }

    const empleadoData = usuariosDB.find(u => u.id === tecnicoIdSemana);
    return {
      nombre: empleadoData ? empleadoData.nombre : 'Sin Asignar',
      coste: totalSemana
    };
  };

  const infoSemanaAdmin = calcularInformacionSemanaActual();

  const calcularNominasDelMes = (mes) => {
    const numDias = new Date(añoActual, mes + 1, 0).getDate();
    let resumen = {};
    usuariosDB.forEach(u => { if(u.rol === 'empleado') resumen[u.id] = 0; });

    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${añoActual}-${mesStr}-${diaStr}`;
      const idAsignada = guardiasAnuales[fechaClave];
      
      if (idAsignada && resumen[idAsignada] !== undefined) {
        const fechaObj = new Date(añoActual, mes, dia);
        const diaSemana = fechaObj.getDay();
        const esFinDeSemana = (diaSemana === 0 || diaSemana === 6);
        const infoFestivo = festivosDelAño[fechaClave];
        const esFestivoOficial = infoFestivo && (infoFestivo.tipo === 'Nacional' || infoFestivo.tipo === 'Autonómico');

        if (esFinDeSemana || esFestivoOficial) {
          resumen[idAsignada] += Number(precioFestivoFinde);
        } else {
          resumen[idAsignada] += Number(precioLaborable);
        }
      }
    }
    return resumen;
  };

  const nominasMesActual = calcularNominasDelMes(mesActual);

  const obtenerDiasMes = (mes) => {
    const primerDia = new Date(añoActual, mes, 1).getDay();
    const diasEnBlanco = primerDia === 0 ? 6 : primerDia - 1;
    const numDias = new Date(añoActual, mes + 1, 0).getDate();

    let celdas = [];
    for (let i = 0; i < diasEnBlanco; i++) {
      celdas.push({ tipo: 'vacio', id: `vacio-${i}` });
    }
    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${añoActual}-${mesStr}-${diaStr}`;
      const fechaObj = new Date(añoActual, mes, dia);
      celdas.push({ tipo: 'dia', dia, fechaClave, esFinde: fechaObj.getDay() === 0 || fechaObj.getDay() === 6 });
    }
    return celdas;
  };

  const celdasCalendario = obtenerDiasMes(mesActual);

  const iniciarSesion = () => {
    const userClean = inputUsuario.toLowerCase().trim();
    const usuarioEncontrado = usuariosDB.find(
      u => u.user.toLowerCase() === userClean && u.pass === inputContraseña
    );
    if (usuarioEncontrado) {
      setUsuarioLogueado(usuarioEncontrado);
      setInputUsuario('');
      setInputContraseña('');
    } else {
      Alert.alert('Acceso Denegado', 'Usuario o contraseña incorrectos.');
    }
  };

  const cerrarSesion = () => setUsuarioLogueado(null);

  const aplicarCambioCredenciales = () => {
    if (!nuevoUserAdmin.trim() || !nuevoPassAdmin.trim()) {
      Alert.alert('Error', 'Introduce campos válidos.');
      return;
    }
    setUsuariosDB(usuariosDB.map(u => {
      if (u.id === idSeleccionadoModificar) {
        return { ...u, user: nuevoUserAdmin.trim(), pass: nuevoPassAdmin.trim() };
      }
      return u;
    }));
    Alert.alert('Éxito', 'Credenciales modificadas correctamente.');
  };

  const enviarSolicitud = () => {
    if (!fechaInicio || !fechaFin) {
      Alert.alert('Error', 'Completa las fechas.');
      return;
    }
    const nuevaPeticion = {
      id: Date.now().toString(),
      tecnicoId: usuarioLogueado.id,
      nombre: usuarioLogueado.nombre, 
      tipo: tipoTramiteSeleccionado,
      inicio: fechaInicio,
      fin: fechaFin,
      estado: 'Pendiente'
    };
    setPeticiones([...peticiones, nuevaPeticion]);
    Alert.alert('Éxito', 'Solicitud enviada al Responsable.');
    setFechaInicio('');
    setFechaFin('');
  };

  const resolverPeticion = (id, nuevoEstado) => {
    setPeticiones(peticiones.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    Alert.alert('Estado Actualizado', `Marcada como: ${nuevoEstado}`);
  };

  const ejecutarReemplazoMasivo = () => {
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fechaEfectiva)) {
      Alert.alert('Formato Incorrecto', 'Usa AAAA-MM-DD.');
      return;
    }
    const copiaGuardias = { ...guardiasAnuales };
    const [rA, rM, rD] = fechaEfectiva.split('-').map(Number);
    const limiteFecha = new Date(rA, rM - 1, rD);

    Object.keys(copiaGuardias).forEach((fechaKey) => {
      const [kA, kM, kD] = fechaKey.split('-').map(Number);
      const fechaActual = new Date(kA, kM - 1, kD);
      if (fechaActual >= limiteFecha && copiaGuardias[fechaKey] === idSaliente) {
        copiaGuardias[fechaKey] = idEntrante;
      }
    });

    setGuardiasAnuales(copiaGuardias);
    Alert.alert('Reemplazo Completado', `Se transfirieron las guardias.`);
    setFechaEfectiva('');
  };

  const cambiarMes = (direccion) => {
    if (direccion === 'ant' && mesActual > 0) setMesActual(mesActual - 1);
    if (direccion === 'sig' && mesActual < 11) setMesActual(mesActual + 1);
  };

  // VISTA 1: LOGIN
  if (!usuarioLogueado) {
    return (
      <SafeAreaView style={styles.contenedorLogin}>
        <View style={styles.tarjetaLogin}>
          <Text style={styles.loginTitulo}>🔑 Acceso Cuadrante {añoActual}</Text>
          <Text style={styles.loginSubtitulo}>Introduce tus credenciales de equipo</Text>
          <Text style={styles.labelInput}>Nombre de usuario</Text>
          <TextInput style={styles.entradaTextoLogin} placeholder="Usuario" value={inputUsuario} onChangeText={setInputUsuario} autoCapitalize="none"/>
          <Text style={[styles.labelInput, {marginTop: 15}]}>Contraseña</Text>
          <TextInput style={styles.entradaTextoLogin} placeholder="••••••••" secureTextEntry={true} value={inputContraseña} onChangeText={setInputContraseña} autoCapitalize="none"/>
          <TouchableOpacity style={styles.botonLogin} onPress={iniciarSesion}>
            <Text style={styles.textoBotonLogin}>Entrar al Panel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // VISTA 2: ADMINISTRADOR
  if (usuarioLogueado.rol === 'admin') {
    const todosLosEmpleados = usuariosDB.filter(u => u.rol === 'empleado');
    const peticionesDelSeleccionado = peticiones.filter(p => p.tecnicoId === idSeleccionadoModificar);

    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.cabeceraAdmin}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.titulo}>👑 Panel de Control Técnico</Text>
            <Text style={styles.subtitulo} numberOfLines={1}>Administrador activo: {usuarioLogueado.user}</Text>
          </View>
          <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
            <Text style={styles.textoBotonCerrar}>Salir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cuerpo}>
          
          {/* ✨ NUEVA SECCIÓN: CONTRATAR / AÑADIR NUEVO OPERARIO A LA PLANTILLA */}
          <View style={[styles.tarjeta, { borderColor: '#8B5CF6', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#7C3AED' }]}>➕ Registrar Alta de Nuevo Técnico</Text>
            <Text style={styles.labelInput}>Nombre y Apellido Completo</Text>
            <TextInput style={styles.entradaTexto} placeholder="Ej: Carlos Gómez" value={nuevoNombreTecnico} onChangeText={setNuevoNombreTecnico}/>
            
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Usuario Login</Text>
                <TextInput style={styles.entradaTexto} placeholder="carlos01" value={nuevoUserTecnico} onChangeText={setNuevoUserTecnico} autoCapitalize="none"/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Contraseña</Text>
                <TextInput style={styles.entradaTexto} placeholder="Clave123" value={nuevoPassTecnico} onChangeText={setNuevoPassTecnico} autoCapitalize="none"/>
              </View>
            </View>

            <Text style={[styles.labelInput, { marginTop: 8 }]}>Color identificativo en Calendario</Text>
            <View style={styles.grupoBotonesGrid}>
              {['#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E', '#14B8A6'].map((col) => (
                <TouchableOpacity 
                  key={col} 
                  style={[styles.miniBotonColor, { backgroundColor: col }, nuevoColorTecnico === col && { borderWidth: 2, borderColor: '#000' }]} 
                  onPress={() => setNuevoColorTecnico(col)}
                />
              ))}
            </View>

            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#8B5CF6' }]} onPress={registrarNuevoTecnico}>
              <Text style={styles.textoBotonEnviar}>💾 Dar de Alta Técnico en Base de Datos</Text>
            </TouchableOpacity>
          </View>

          {/* SECCIÓN: REGENERAR CUADRANTE GENERAL (RESTAURADO) */}
          <View style={[styles.tarjeta, { backgroundColor: '#F8FAFC', borderColor: '#475569', borderWidth: 1 }]}>
            <Text style={styles.tituloSeccion}>🎲 Distribución Automatizada del Año</Text>
            <Text style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>
              Genera o redistribuye las guardias de forma aleatoria de enero a diciembre equilibrando los turnos entre todos los técnicos creados.
            </Text>
            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#475569', marginTop: 0 }]} onPress={handleRegenerarAleatorioAnual}>
              <Text style={styles.textoBotonEnviar}>🎲 Combinar y Repartir Guardias Anuales</Text>
            </TouchableOpacity>
          </View>

          {/* SECCIÓN: SOLICITUDES PENDIENTES */}
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#059669' }]}>📌 Solicitudes Pendientes (Buzón de Entrada)</Text>
            {peticiones.filter(p => p.estado === 'Pendiente').length === 0 ? (
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', padding: 10 }}>No hay solicitudes web pendientes.</Text>
            ) : (
              peticiones.filter(p => p.estado === 'Pendiente').map((pet) => (
                <View key={pet.id} style={styles.contenedorItemPeticion}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.peticionNombre}>{pet.nombre}</Text>
                      <View style={[styles.badgeTipo, { backgroundColor: pet.tipo === 'Vacaciones' ? '#3B82F6' : '#F59E0B' }]}>
                        <Text style={styles.textoBadge}>{pet.tipo.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.peticionFechas}>📅 {pet.inicio} al {pet.fin}</Text>
                  </View>
                  <View style={styles.bloqueAccionesPeticion}>
                    <TouchableOpacity style={[styles.botonAccionMini, { backgroundColor: '#10B981' }]} onPress={() => resolverPeticion(pet.id, 'Aprobado')}>
                      <Text style={styles.textoBotonMini}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.botonAccionMini, { backgroundColor: '#EF4444', marginLeft: 6 }]} onPress={() => resolverPeticion(pet.id, 'Rechazado')}>
                      <Text style={styles.textoBotonMini}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* CONTROL DE CREDENCIALES + MODIFICADOR INTUITIVO DE VACACIONES */}
          <View style={[styles.tarjeta, { borderColor: '#6366F1', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#4F46E5' }]}>⚙️ Gestión de Credenciales y Vacaciones</Text>
            <Text style={styles.labelInput}>Selecciona un técnico del equipo para gestionar:</Text>
            
            <View style={styles.grupoBotonesGridVertical}>
              {todosLosEmpleados.map((emp) => (
                <TouchableOpacity 
                  key={emp.id} 
                  style={[styles.botonSelectorGrande, idSeleccionadoModificar === emp.id && { backgroundColor: '#6366F1' }]} 
                  onPress={() => seleccionarTecnicoParaModificar(emp.id)}
                >
                  <Text style={[styles.textoSelectorMini, idSeleccionadoModificar === emp.id && { color: '#FFF', fontWeight: 'bold' }]}>
                    👤 {emp.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* VISOR Y MODIFICADOR DE VACACIONES DIRECTAS */}
            <View style={styles.contenedorSubTarjetaVacaciones}>
              <Text style={styles.tituloMiniVacaciones}>📆 Calendario actual de ausencias aprobadas/registradas:</Text>
              {peticionesDelSeleccionado.length === 0 ? (
                <Text style={styles.textoNoVacaciones}>Este operario no tiene vacaciones asignadas actualmente.</Text>
              ) : (
                peticionesDelSeleccionado.map(p => (
                  <View key={p.id} style={styles.itemMiniVacacion}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '500', color: '#1E293B' }}>
                        {p.tipo === 'Vacaciones' ? '🌴 Vacaciones' : '☕ Día Libre'} 
                        <Text style={{fontWeight: 'normal', fontSize: 11, color: p.estado === 'Aprobado' ? '#10B981' : '#F59E0B'}}> ({p.estado})</Text>
                      </Text>
                      <Text style={{ fontSize: 11, color: '#475569' }}>{p.inicio} hasta {p.fin}</Text>
                    </View>
                    <TouchableOpacity style={styles.botonEliminarVacacionDirecta} onPress={() => eliminarVacacionAdmin(p.id)}>
                      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* FORMULARIO DE INSERCIÓN/MODIFICACIÓN RÁPIDA DE VACACIONES */}
              <View style={styles.divisorAdminVacaciones}>
                <Text style={styles.tituloSubFormulario}>➕ Asignar / Modificar Ausencias Directamente:</Text>
                
                <View style={[styles.grupoBotonesGrid, { marginVertical: 4 }]}>
                  <TouchableOpacity 
                    style={[styles.botonSelectorMini, adminTipoVacacion === 'Vacaciones' && { backgroundColor: '#3B82F6' }]} 
                    onPress={() => setAdminTipoVacacion('Vacaciones')}
                  >
                    <Text style={[styles.textoSelectorMini, adminTipoVacacion === 'Vacaciones' && { color: '#FFF', fontWeight: 'bold' }]}>🌴 Vacaciones</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.botonSelectorMini, adminTipoVacacion === 'Día Libre' && { backgroundColor: '#F59E0B' }]} 
                    onPress={() => setAdminTipoVacacion('Día Libre')}
                  >
                    <Text style={[styles.textoSelectorMini, adminTipoVacacion === 'Día Libre' && { color: '#FFF', fontWeight: 'bold' }]}>☕ Día Libre</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <TextInput 
                    style={[styles.entradaTexto, { flex: 1 }]} 
                    placeholder="Inicio (AAAA-MM-DD)" 
                    value={adminFechaInicio} 
                    onChangeText={setAdminFechaInicio}
                  />
                  <TextInput 
                    style={[styles.entradaTexto, { flex: 1 }]} 
                    placeholder="Fin (AAAA-MM-DD)" 
                    value={adminFechaFin} 
                    onChangeText={setAdminFechaFin}
                  />
                </View>

                <TouchableOpacity style={styles.botonAsignarDirecto} onPress={asignarVacacionDirectaAdmin}>
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>⚡ Asignar / Guardar Periodo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECCIÓN DE CREDENCIALES DEL OPERARIO */}
            <Text style={[styles.labelInput, { marginTop: 12 }]}>Editar Usuario de Acceso</Text>
            <TextInput style={styles.entradaTexto} placeholder="Nombre de Usuario" value={nuevoUserAdmin} onChangeText={setNuevoUserAdmin} autoCapitalize="none"/>
            
            <Text style={[styles.labelInput, { marginTop: 8 }]}>Editar Contraseña</Text>
            <TextInput style={styles.entradaTexto} placeholder="Contraseña" value={nuevoPassAdmin} onChangeText={setNuevoPassAdmin} autoCapitalize="none"/>
            
            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#6366F1' }]} onPress={aplicarCambioCredenciales}>
              <Text style={styles.textoBotonEnviar}>💾 Guardar Credenciales de Usuario</Text>
            </TouchableOpacity>
          </View>

          {/* GUARDIA SEMANAL ACTUAL */}
          <View style={[styles.tarjeta, { borderColor: '#3B82F6', borderWidth: 1 }]}>
            <Text style={styles.tituloSeccion}>📅 Control de Guardia Semanal</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 12, color: '#64748B' }}>Técnico Activo:</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>⚡ {infoSemanaAdmin.nombre}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: '#64748B' }}>Coste de Guardia:</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981' }}>{infoSemanaAdmin.coste} €</Text>
              </View>
            </View>
          </View>

          {/* SUSTITUCIÓN DE EMERGENCIA */}
          <View style={[styles.tarjeta, { borderColor: '#EF4444', borderWidth: 1 }]}>
            <Text style={[styles.tituloSeccion, { color: '#B91C1C' }]}>🚨 Sustitución de Emergencia</Text>
            
            <Text style={styles.labelInput}>1. ¿Quién causa baja?</Text>
            <View style={styles.grupoBotonesGridVertical}>
              {todosLosEmpleados.map((emp) => (
                <TouchableOpacity key={emp.id} style={[styles.botonSelectorGrande, idSaliente === emp.id && { backgroundColor: '#EF4444' }]} onPress={() => setIdSaliente(emp.id)}>
                  <Text style={[styles.textoSelectorMini, idSaliente === emp.id && { color: '#FFF', fontWeight: 'bold' }]}>{emp.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, { marginTop: 10 }]}>2. ¿Quién hereda las guardias?</Text>
            <View style={styles.grupoBotonesGridVertical}>
              {todosLosEmpleados.map((emp) => (
                <TouchableOpacity key={emp.id} style={[styles.botonSelectorGrande, idEntrante === emp.id && { backgroundColor: '#10B981' }]} onPress={() => setIdEntrante(emp.id)}>
                  <Text style={[styles.textoSelectorMini, idEntrante === emp.id && { color: '#FFF', fontWeight: 'bold' }]}>{emp.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, { marginTop: 10 }]}>3. Fecha Efectiva (AAAA-MM-DD)</Text>
            <TextInput style={styles.entradaTexto} placeholder={`Ej: ${añoActual}-06-15`} value={fechaEfectiva} onChangeText={setFechaEfectiva} />
            <TouchableOpacity style={styles.botonEjecutarMasivo} onPress={ejecutarReemplazoMasivo}>
              <Text style={styles.textoBotonEnviar}>⚡ Aplicar Cambio Masivo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // VISTA 3: TÉCNICOS (EMPLEADOS)
  const misTecnicos = usuariosDB.filter(u => u.rol === 'empleado');
  const totalEurosPropio = nominasMesActual[usuarioLogueado.id] || 0;

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.cabecera}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.circuloColor, { backgroundColor: usuarioLogueado.color, width: 16, height: 16 }]} />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.titulo}>👋 ¡Hola, {usuarioLogueado.nombre}!</Text>
            <Text style={styles.subtitulo}>Año en curso: {añoActual}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.textoBotonCerrar}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cuerpo}>
        <View style={styles.tarjetaResumenPropia}>
          <Text style={styles.tituloSeccionBlanco}>💰 Mis Ingresos Calculados ({meses[mesActual]})</Text>
          <Text style={styles.cifraNominaGrande}>{totalEurosPropio} €</Text>
        </View>

        {/* CALENDARIO */}
        <View style={styles.tarjeta}>
          <View style={styles.selectorMesContenedor}>
            <TouchableOpacity onPress={() => cambiarMes('ant')} disabled={mesActual === 0}>
              <Text style={[styles.flechaSelector, mesActual === 0 && { color: '#CBD5E1' }]}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.tituloMes}>{meses[mesActual]} {añoActual}</Text>
            <TouchableOpacity onPress={() => cambiarMes('sig')} disabled={mesActual === 11}>
              <Text style={[styles.flechaSelector, mesActual === 11 && { color: '#CBD5E1' }]}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.diasSemanaContenedor}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
              <Text key={i} style={styles.textoDiaSemana}>{d}</Text>
            ))}
          </View>

          <View style={styles.rejillaCalendario}>
            {celdasCalendario.map((celda) => {
              if (celda.tipo === 'vacio') return <View key={celda.id} style={styles.celdaVacia} />;

              const compId = guardiasAnuales[celda.fechaClave];
              const compData = misTecnicos.find(c => c.id === compId);
              
              const colorFondo = compData ? compData.color : '#E2E8F0';
              const esMiGuardia = compId === usuarioLogueado.id;
              const infoFestivo = festivosDelAño[celda.fechaClave];
              const esFestivoTarifaCara = infoFestivo && (infoFestivo.tipo === 'Nacional' || infoFestivo.tipo === 'Autonómico');

              return (
                <TouchableOpacity 
                  key={celda.fechaClave} 
                  style={[
                    styles.celdaDia, 
                    { backgroundColor: colorFondo }, 
                    esMiGuardia && { borderWidth: 2, borderColor: '#1E293B' },
                    infoFestivo && { borderColor: '#EF4444', borderWidth: 2 } 
                  ]}
                  onPress={() => {
                    const precioDia = (celda.esFinde || esFestivoTarifaCara) ? precioFestivoFinde : precioLaborable;
                    Alert.alert(
                      `Día ${celda.dia} de ${meses[mesActual]}`, 
                      `${compData ? `Guardia: ${compData.nombre}` : '❌ SIN ASIGNAR'}\nTurno: ${precioDia}€`
                    );
                  }}
                >
                  <View style={styles.contenedorTextoDia}>
                    <Text style={[styles.textoDia, compData ? { color: '#FFFFFF', fontWeight: 'bold' } : { color: '#64748B' }]}>
                      {celda.dia}
                    </Text>
                    {infoFestivo && <Text numberOfLines={1} style={styles.textoMiniFestivo}>{infoFestivo.icono}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* TRÁMITES TÉCNICO */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>🚀 Solicitar Vacaciones o Día Libre</Text>
          
          <Text style={styles.labelInput}>Selecciona el tipo:</Text>
          <View style={[styles.grupoBotonesGrid, { marginBottom: 12 }]}>
            <TouchableOpacity 
              style={[styles.botonSelectorMini, tipoTramiteSeleccionado === 'Vacaciones' && { backgroundColor: '#3B82F6' }]} 
              onPress={() => setTipoTramiteSeleccionado('Vacaciones')}
            >
              <Text style={[styles.textoSelectorMini, tipoTramiteSeleccionado === 'Vacaciones' && { color: '#FFF', fontWeight: 'bold' }]}>🌴 Vacaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.botonSelectorMini, tipoTramiteSeleccionado === 'Día Libre' && { backgroundColor: '#F59E0B' }]} 
              onPress={() => setTipoTramiteSeleccionado('Día Libre')}
            >
              <Text style={[styles.textoSelectorMini, tipoTramiteSeleccionado === 'Día Libre' && { color: '#FFF', fontWeight: 'bold' }]}>☕ Día Libre</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.entradaTexto} placeholder={`Inicio (Ej: ${añoActual}-06-15)`} value={fechaInicio} onChangeText={setFechaInicio} />
          <TextInput style={[styles.entradaTexto, { marginTop: 10 }]} placeholder={`Fin (Ej: ${añoActual}-06-22)`} value={fechaFin} onChangeText={setFechaFin} />
          
          <TouchableOpacity style={styles.botonEnviar} onPress={enviarSolicitud}>
            <Text style={styles.textoBotonEnviar}>Enviar Petición a Revisión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorLogin: { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  tarjetaLogin: { backgroundColor: '#FFFFFF', width: '85%', padding: 25, borderRadius: 16 },
  loginTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  loginSubtitulo: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  labelInput: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 6 },
  entradaTextoLogin: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, fontSize: 14, color: '#0F172A' },
  botonLogin: { backgroundColor: '#3B82F6', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  textoBotonLogin: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  contenedor: { flex: 1, backgroundColor: '#F0F4F8' },
  cabecera: { backgroundColor: '#1E293B', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cabeceraAdmin: { backgroundColor: '#475569', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },
  botonCerrarSesion: { backgroundColor: '#EF4444', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  textoBotonCerrar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  cuerpo: { flex: 1 },
  circuloColor: { borderRadius: 8 },
  
  tarjeta: { backgroundColor: '#FFFFFF', margin: 12, padding: 12, borderRadius: 12 },
  tarjetaResumenPropia: { backgroundColor: '#1E293B', margin: 12, padding: 16, borderRadius: 12 },
  tituloSeccionBlanco: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8' },
  cifraNominaGrande: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginVertical: 4 },
  tituloSeccion: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 5 },

  contenedorItemPeticion: { padding: 10, backgroundColor: '#F8FAFC', borderRadius: 8, marginVertical: 4, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  peticionNombre: { fontWeight: 'bold', fontSize: 14, color: '#1E293B' },
  peticionFechas: { fontSize: 12, color: '#475569', marginTop: 2 },
  badgeTipo: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  textoBadge: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  bloqueAccionesPeticion: { flexDirection: 'row', alignItems: 'center' },
  botonAccionMini: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  textoBotonMini: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  selectorMesContenedor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloMes: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  flechaSelector: { fontSize: 18, color: '#3B82F6', paddingHorizontal: 15 },
  diasSemanaContenedor: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
  textoDiaSemana: { fontWeight: 'bold', color: '#64748B', width: 35, textAlign: 'center', fontSize: 12 },
  rejillaCalendario: { flexDirection: 'row', flexWrap: 'wrap' },
  celdaDia: { width: '12%', height: 46, margin: '1.1%', justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  celdaVacia: { width: '12%', height: 46, margin: '1.1%' },
  contenedorTextoDia: { alignItems: 'center', justifyContent: 'center' },
  textoDia: { fontSize: 12 },
  textoMiniFestivo: { fontSize: 9, color: '#FFFFFF', marginTop: 1 },
  
  entradaTexto: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 8, fontSize: 13, color: '#334155' },
  botonEnviar: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  textoBotonEnviar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  grupoBotonesGrid: { flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 5 },
  grupoBotonesGridVertical: { marginVertical: 5 },
  botonSelectorMini: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginHorizontal: 2 },
  botonSelectorGrande: { backgroundColor: '#F1F5F9', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, marginVertical: 3, alignItems: 'flex-start' },
  textoSelectorMini: { fontSize: 12, color: '#475569' },
  botonEjecutarMasivo: { backgroundColor: '#EF4444', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },

  contenedorSubTarjetaVacaciones: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginTop: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  tituloMiniVacaciones: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 5 },
  textoNoVacaciones: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginBottom: 5 },
  itemMiniVacacion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  botonEliminarVacacionDirecta: { backgroundColor: '#EF4444', padding: 6, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  divisorAdminVacaciones: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#CBD5E1' },
  tituloSubFormulario: { fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  botonAsignarDirecto: { backgroundColor: '#3B82F6', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  
  miniBotonColor: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
});