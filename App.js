import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';

export default function App() {
  // Estados de autenticación
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); 
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputContraseña, setInputContraseña] = useState('');

  // Control de navegación interna
  const [mesActual, setMesActual] = useState(5); // Por defecto Junio (índice 5)

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Base de datos de usuarios (con estado activo/baja)
  const [usuariosDB, setUsuariosDB] = useState([
    { id: '1', nombre: 'Juan Carlos', user: 'Juan Carlos', pass: 'jc01', rol: 'empleado', color: '#EF4444', activo: true },
    { id: '2', nombre: 'Lucas', user: 'Lucas', pass: 'Lucas06', rol: 'empleado', color: '#10B981', activo: true },
    { id: '3', nombre: 'Oscar Idañez', user: 'Oscar Idañez', pass: 'Idañez07', rol: 'empleado', color: '#3B82F6', activo: true },
    { id: '4', nombre: 'Oscar Ibarreta', user: 'Oscar Ibarreta', pass: 'Ibarreta08', rol: 'empleado', color: '#F59E0B', activo: true },
    { id: 'admin', nombre: 'Jefe de Equipo', user: 'Friti', pass: 'friti43', rol: 'admin', color: '#475569', activo: true }
  ]);

  // Calendario Oficial de Festivos en Valencia (Año 2026)
  const festivos2026 = {
    '2026-01-01': { nombre: 'Año Nuevo', tipo: 'Nacional', icono: '🇪🇸' },
    '2026-01-06': { nombre: 'Reyes', tipo: 'Nacional', icono: '🇪🇸' },
    '2026-01-22': { nombre: 'S. Vicente M.', tipo: 'Local', icono: '📍' },
    '2026-03-19': { nombre: 'San José', tipo: 'Autonómico', icono: '🦇' },
    '2026-04-03': { nombre: 'Viernes S.', tipo: 'Nacional', icono: '🇪🇸' },
    '2026-04-06': { nombre: 'L. Pascua', tipo: 'Autonómico', icono: '🦇' },
    '2026-04-13': { nombre: 'S. Vicente F.', tipo: 'Local', icono: '📍' },
    '2026-05-01': { nombre: 'Trabajador', tipo: 'Nacional', icono: '🇪🇸' },
    '2026-06-24': { nombre: 'San Juan', tipo: 'Autonómico', icono: '🦇' },
    '2026-08-15': { nombre: 'Asunción', tipo: 'Nacional', icono: '🇪🇸' },
    '2026-09-09': { nombre: 'Día CV', tipo: 'Autonómico', icono: '🦇' },
    '2026-10-12': { nombre: 'Hispanidad', tipo: 'Nacional', icono: '🇪🇸' },
    '2026-12-08': { nombre: 'Inmaculada', tipo: 'Nacional', icono: '🇪🇸' },
    '2026-12-25': { nombre: 'Navidad', tipo: 'Nacional', icono: '🇪🇸' }
  };

  // Funciones auxiliares para la generación del cuadrante inicial
  function generarSemanaViernes(fechaInicioStr, compañeroId) {
    let resultado = {};
    let fecha = new Date(fechaInicioStr);
    for (let i = 0; i < 7; i++) {
      const isoString = fecha.toISOString().split('T')[0];
      resultado[isoString] = compañeroId;
      fecha.setDate(fecha.getDate() + 1);
    }
    return resultado;
  }

  function generarDiasEspeciales(fechaInicioStr, fechaFinStr, compañeroId) {
    let resultado = {};
    let fecha = new Date(fechaInicioStr);
    const fechaFin = new Date(fechaFinStr);
    while (fecha <= fechaFin) {
      const isoString = fecha.toISOString().split('T')[0];
      resultado[isoString] = compañeroId;
      fecha.setDate(fecha.getDate() + 1);
    }
    return resultado;
  }

  // ESTADO DINÁMICO PARA LAS GUARDIAS - CORREGIDO Y ORDENADO CRONOLÓGICAMENTE
  const [guardiasAnuales2026, setGuardiasAnuales2026] = useState({
    ...generarDiasEspeciales('2026-01-01', '2026-01-01', '1'),
    ...generarSemanaViernes('2026-01-02', '2'),
    ...generarSemanaViernes('2026-01-09', '3'),
    ...generarSemanaViernes('2026-01-16', '4'),
    ...generarSemanaViernes('2026-01-23', '1'),
    ...generarDiasEspeciales('2026-01-30', '2026-01-31', '2'),
    ...generarDiasEspeciales('2026-02-01', '2026-02-05', '2'),
    ...generarSemanaViernes('2026-02-06', '3'),
    ...generarSemanaViernes('2026-02-13', '4'),
    ...generarSemanaViernes('2026-02-20', '1'),
    ...generarDiasEspeciales('2026-02-27', '2026-02-28', '2'),
    ...generarDiasEspeciales('2026-03-01', '2026-03-05', '2'), 
    ...generarSemanaViernes('2026-03-06', '3'),
    ...generarSemanaViernes('2026-03-13', '4'),
    ...generarSemanaViernes('2026-03-20', '1'),
    ...generarSemanaViernes('2026-03-27', '2'),
    ...generarSemanaViernes('2026-04-03', '3'),
    ...generarSemanaViernes('2026-04-10', '4'),
    ...generarSemanaViernes('2026-04-17', '1'),
    ...generarSemanaViernes('2026-04-24', '2'),
    ...generarSemanaViernes('2026-05-01', '3'),
    ...generarSemanaViernes('2026-05-08', '4'),
    ...generarSemanaViernes('2026-05-15', '1'),
    ...generarSemanaViernes('2026-05-22', '2'),
    ...generarDiasEspeciales('2026-05-29', '2026-05-31', '3'),
    ...generarDiasEspeciales('2026-06-01', '2026-06-04', '3'),
    ...generarSemanaViernes('2026-06-05', '4'),
    ...generarSemanaViernes('2026-06-12', '1'),
    ...generarSemanaViernes('2026-06-19', '2'),
    ...generarSemanaViernes('2026-06-26', '3'),
    ...generarSemanaViernes('2026-07-03', '4'),
    ...generarSemanaViernes('2026-07-10', '1'),
    ...generarSemanaViernes('2026-07-17', '2'),
    ...generarSemanaViernes('2026-07-24', '3'),
    ...generarDiasEspeciales('2026-07-31', '2026-07-31', '4'),
    ...generarDiasEspeciales('2026-08-01', '2026-08-06', '4'),
    ...generarSemanaViernes('2026-08-07', '1'),
    ...generarSemanaViernes('2026-08-14', '2'),
    ...generarSemanaViernes('2026-08-21', '3'),
    ...generarSemanaViernes('2026-08-28', '4'),
    ...generarSemanaViernes('2026-09-04', '1'),
    ...generarSemanaViernes('2026-09-11', '2'),
    ...generarSemanaViernes('2026-09-18', '3'),
    ...generarSemanaViernes('2026-09-25', '4'),
    ...generarSemanaViernes('2026-10-02', '1'),
    ...generarSemanaViernes('2026-10-09', '2'),
    ...generarSemanaViernes('2026-10-16', '3'),
    ...generarSemanaViernes('2026-10-23', '4'),
    ...generarDiasEspeciales('2026-10-30', '2026-10-31', '1'),
    ...generarDiasEspeciales('2026-11-01', '2026-11-05', '1'),
    ...generarSemanaViernes('2026-11-06', '2'),
    ...generarSemanaViernes('2026-11-13', '3'),
    ...generarSemanaViernes('2026-11-20', '4'),
    ...generarSemanaViernes('2026-11-27', '1'),
    ...generarSemanaViernes('2026-12-04', '2'),
    ...generarSemanaViernes('2026-12-11', '3'),
    ...generarSemanaViernes('2026-12-18', '4'),
    ...generarSemanaViernes('2026-12-25', '1'),
    ...generarDiasEspeciales('2026-12-26', '2026-12-31', '1'), 
  });

  // Estados de control para los reemplazos de Friti
  const [idSaliente, setIdSaliente] = useState('1');
  const [idEntrante, setIdEntrante] = useState('2');
  const [fechaEfectiva, setFechaEfectiva] = useState('');

  // 🔄 FUNCIÓN ACTUALIZADA: REGENERAR Y ROTAR EL ORDEN DEL CUADRANTE
  const rotarYGenerarNuevoAño = () => {
    const operariosActivos = usuariosDB.filter(u => u.rol === 'empleado' && u.activo);
    
    if (operariosActivos.length === 0) return;

    const nuevoOrden = [...operariosActivos];
    const primerElemento = nuevoOrden.shift();
    if (primerElemento) nuevoOrden.push(primerElemento);

    let nuevoCuadrante = {};
    let fechaBucle = new Date('2026-01-01');
    let indiceOperario = 0;

    while (fechaBucle.getFullYear() === 2026) {
      const isoKey = fechaBucle.toISOString().split('T')[0];
      
      if (fechaBucle.getDay() === 5 && isoKey !== '2026-01-01') {
        indiceOperario = (indiceOperario + 1) % nuevoOrden.length;
      }

      nuevoCuadrante[isoKey] = nuevoOrden[indiceOperario].id;
      fechaBucle.setDate(fechaBucle.getDate() + 1);
    }

    setGuardiasAnuales2026(nuevoCuadrante);
    Alert.alert(
      '🔄 Rueda Rotada',
      `Se ha reconfigurado el orden del cuadrante. Las posiciones han cambiado para evitar repetir los festivos del año anterior.`
    );
  };

  // Lógica económica
  const calcularNominasDelMes = (mes) => {
    const año = 2026;
    const numDias = new Date(año, mes + 1, 0).getDate();
    let resumen = { '1': 0, '2': 0, '3': 0, '4': 0 };

    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${año}-${mesStr}-${diaStr}`;
      const idAsignada = guardiasAnuales2026[fechaClave];
      
      if (idAsignada && resumen[idAsignada] !== undefined) {
        const fechaObj = new Date(año, mes, dia);
        const diaSemana = fechaObj.getDay();
        const esFinDeSemana = (diaSemana === 0 || diaSemana === 6);
        const esFestivo = festivos2026[fechaClave] !== undefined;

        resumen[idAsignada] += (esFinDeSemana || esFestivo) ? 70 : 28;
      }
    }
    return resumen;
  };

  const nominasMesActual = calcularNominasDelMes(mesActual);

  const obtenerDiasMes = (mes) => {
    const año = 2026;
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnBlanco = primerDia === 0 ? 6 : primerDia - 1;
    const numDias = new Date(año, mes + 1, 0).getDate();

    let celdas = [];
    for (let i = 0; i < diasEnBlanco; i++) {
      celdas.push({ tipo: 'vacio', id: `vacio-${i}` });
    }
    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${año}-${mesStr}-${diaStr}`;
      const fechaObj = new Date(año, mes, dia);
      celdas.push({ tipo: 'dia', dia, fechaClave, esFinde: fechaObj.getDay() === 0 || fechaObj.getDay() === 6 });
    }
    return celdas;
  };

  const celdasCalendario = obtenerDiasMes(mesActual);

  // Historial de peticiones
  const [peticiones, setPeticiones] = useState([
    { id: '101', tecnicoId: '2', nombre: 'Lucas', tipo: 'Vacaciones', inicio: '2026-06-12', fin: '2026-06-19', estado: 'Pendiente' },
    { id: '102', tecnicoId: '4', nombre: 'Oscar Ibarreta', tipo: 'Día Libre', inicio: '2026-06-24', fin: '2026-06-24', estado: 'Pendiente' }
  ]);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoPeticion, setTipoPeticion] = useState('Vacaciones');

  const iniciarSesion = () => {
    const usuarioEncontrado = usuariosDB.find(
      u => u.user.toLowerCase() === inputUsuario.toLowerCase().trim() && u.pass === inputContraseña
    );

    if (usuarioEncontrado) {
      setUsuarioLogueado(usuarioEncontrado);
      setInputUsuario('');
      setInputContraseña('');
    } else {
      Alert.alert('Acceso Denegado', 'El usuario o la contraseña son incorrectos.');
    }
  };

  const cerrarSesion = () => setUsuarioLogueado(null);

  const enviarSolicitud = () => {
    if (!fechaInicio || !fechaFin) {
      Alert.alert('Error', 'Por favor, introduce las fechas de inicio y fin.');
      return;
    }
    const nuevaPeticion = {
      id: Date.now().toString(),
      tecnicoId: usuarioLogueado.id,
      nombre: usuarioLogueado.nombre, 
      tipo: tipoPeticion,
      inicio: fechaInicio,
      fin: fechaFin,
      estado: 'Pendiente'
    };
    setPeticiones([...peticiones, nuevaPeticion]);
    Alert.alert('Éxito', 'Tu solicitud ha sido enviada al Encargado.');
    setFechaInicio('');
    setFechaFin('');
  };

  const gestionarPeticion = (id, nuevoEstado) => {
    setPeticiones(peticiones.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  // REEMPLAZO MASIVO POR BAJA
  const ejecutarReemplazoMasivo = () => {
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fechaEfectiva)) {
      Alert.alert('Formato Incorrecto', 'Por favor, introduce la fecha en formato AAAA-MM-DD.');
      return;
    }
    if (idSaliente === idEntrante) {
      Alert.alert('Error', 'El trabajador saliente y el entrante no pueden ser la misma persona.');
      return;
    }

    const copiaGuardias = { ...guardiasAnuales2026 };
    const limiteFecha = new Date(fechaEfectiva);
    let contadorCambios = 0;

    Object.keys(copiaGuardias).forEach((fechaKey) => {
      const fechaActual = new Date(fechaKey);
      if (fechaActual >= limiteFecha && copiaGuardias[fechaKey] === idSaliente) {
        copiaGuardias[fechaKey] = idEntrante;
        contadorCambios++;
      }
    });

    setGuardiasAnuales2026(copiaGuardias);
    setUsuariosDB(usuariosDB.map(u => u.id === idSaliente ? { ...u, activo: false } : u));

    const tSaliente = usuariosDB.find(u => u.id === idSaliente);
    const tEntrante = usuariosDB.find(u => u.id === idEntrante);

    Alert.alert(
      'Reemplazo Completado',
      `Se han transferido con éxito ${contadorCambios} guardias de ${tSaliente?.nombre} a ${tEntrante?.nombre} a partir del ${fechaEfectiva}.\n\nEl empleado saliente ha sido marcado como Inactivo.`
    );
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
          <Text style={styles.loginTitulo}>🔑 Acceso Cuadrante 2026</Text>
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

  // VISTA 2: ADMINISTRADOR (FRITI)
  if (usuarioLogueado.rol === 'admin') {
    const todosLosEmpleados = usuariosDB.filter(u => u.rol === 'empleado');
    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.cabeceraAdmin}>
          <View>
            <Text style={styles.titulo}>👑 Panel de Friti (Jefe)</Text>
            <Text style={styles.subtitulo}>Control de Turnos y Reorganización Anual</Text>
          </View>
          <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
            <Text style={styles.textoBotonCerrar}>Salir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cuerpo}>
          
          {/* BOTÓN HISTÓRICO: ROTAR Y GENERAR NUEVO ORDEN DE GUARDIAS */}
          <View style={[styles.tarjeta, { borderColor: '#3B82F6', borderWidth: 1 }]}>
            <Text style={[styles.tituloSeccion, { color: '#1D4ED8' }]}>🔄 Rotación del Orden Anual</Text>
            <Text style={styles.textoInfoPrecios}>
              Usa este botón al inicio de los periodos o del año para barajar la rueda de turnos. Así, los técnicos rotarán y no repetirán las mismas fechas exactas ni los mismos festivos que el año pasado.
            </Text>
            <TouchableOpacity style={styles.botonRotar} onPress={rotarYGenerarNuevoAño}>
              <Text style={styles.textoBotonEnviar}>🎲 Reordenar y Rotar Calendario 2026</Text>
            </TouchableOpacity>
          </View>

          {/* SUSTITUCIÓN POR BAJA */}
          <View style={[styles.tarjeta, { borderColor: '#EF4444', borderWidth: 1 }]}>
            <Text style={[styles.tituloSeccion, { color: '#B91C1C' }]}>🚨 Sustitución de Emergencia (Bajas / Salidas)</Text>
            <Text style={styles.textoInfoPrecios}>Transfiere de golpe todas las guardias futuras de un operario a otro.</Text>
            
            <Text style={styles.labelInput}>1. ¿Quién causa baja o sale?</Text>
            <View style={styles.grupoBotonesGrid}>
              {todosLosEmpleados.map((emp) => (
                <TouchableOpacity 
                  key={emp.id} 
                  style={[styles.botonSelectorMini, idSaliente === emp.id && {backgroundColor: '#EF4444'}]} 
                  onPress={() => setIdSaliente(emp.id)}
                >
                  <Text style={[styles.textoSelectorMini, idSaliente === emp.id && {color: '#FFF', fontWeight:'bold'}]}>
                    {emp.nombre.split(' ')[0]} {!emp.activo && '(Baja)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, {marginTop: 10}]}>2. ¿Quién hereda sus guardias?</Text>
            <View style={styles.grupoBotonesGrid}>
              {todosLosEmpleados.filter(e => e.activo).map((emp) => (
                <TouchableOpacity 
                  key={emp.id} 
                  style={[styles.botonSelectorMini, idEntrante === emp.id && {backgroundColor: '#10B981'}]} 
                  onPress={() => setIdEntrante(emp.id)}
                >
                  <Text style={[styles.textoSelectorMini, idEntrante === emp.id && {color: '#FFF', fontWeight:'bold'}]}>
                    {emp.nombre.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, {marginTop: 10}]}>3. ¿A partir de qué fecha? (AAAA-MM-DD)</Text>
            <TextInput style={styles.entradaTexto} placeholder="Ej: 2026-06-15" value={fechaEfectiva} onChangeText={setFechaEfectiva} />

            <TouchableOpacity style={styles.botonEjecutarMasivo} onPress={ejecutarReemplazoMasivo}>
              <Text style={styles.textoBotonEnviar}>⚡ Aplicar Cambio de Guardia Permanente</Text>
            </TouchableOpacity>
          </View>

          {/* SOLICITUDES PENDIENTES */}
          <Text style={styles.tituloAdmin}>📥 Solicitudes Pendientes</Text>
          {peticiones.filter(p => p.estado === 'Pendiente').length === 0 ? (
            <Text style={styles.textoNoPeticiones}>No hay solicitudes pendientes. 🎉</Text>
          ) : (
            peticiones.filter(p => p.estado === 'Pendiente').map((pet) => (
              <View key={pet.id} style={styles.tarjetaPeticion}>
                <View style={styles.infoPeticion}>
                  <Text style={styles.nombrePet}>{pet.nombre}</Text>
                  <Text style={styles.detallesPet}>{pet.tipo}: del {pet.inicio} al {pet.fin}</Text>
                </View>
                <View style={styles.accionesPet}>
                  <TouchableOpacity style={[styles.botonAccion, styles.botonAprobar]} onPress={() => gestionarPeticion(pet.id, 'Aprobada')}>
                    <Text style={styles.textoBotonAccion}>Aprobar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // VISTA 3: TÉCNICOS
  const misTecnicos = usuariosDB.filter(u => u.rol === 'empleado');
  const totalEurosPropio = nominasMesActual[usuarioLogueado.id] || 0;

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.cabecera}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <View style={[styles.circuloColor, {backgroundColor: usuarioLogueado.color, width:16, height:16}]} />
          <View style={{marginLeft: 5}}>
            <Text style={styles.titulo}>👋 ¡Hola, {usuarioLogueado.nombre}!</Text>
            <Text style={styles.subtitulo}>Calendario Personalizado de Guardias</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.textoBotonCerrar}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cuerpo}>
        <View style={styles.tarjetaResumenPropia}>
          <Text style={styles.tituloSeccionBlanco}>💰 Mis Ingresos de Guardia ({meses[mesActual]})</Text>
          <Text style={styles.cifraNominaGrande}>{totalEurosPropio} €</Text>
        </View>

        {/* COMPAÑEROS */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>👥 Estado del Equipo este Mes</Text>
          <View style={styles.listaCompañeros}>
            {misTecnicos.map((comp) => (
              <View key={comp.id} style={styles.itemCompañero}>
                <View style={[styles.circuloColor, { backgroundColor: comp.activo ? comp.color : '#94A3B8' }]} />
                <Text style={[
                  styles.nombreCompañero, 
                  comp.id === usuarioLogueado.id && {fontWeight: 'bold'},
                  !comp.activo && {textDecorationLine: 'line-through', color: '#94A3B8'}
                ]}>
                  {comp.nombre} {!comp.activo && '(Baja)'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CALENDARIO CON FESTIVOS VISIBLES */}
        <View style={styles.tarjeta}>
          <View style={styles.selectorMesContenedor}>
            <TouchableOpacity onPress={() => cambiarMes('ant')} disabled={mesActual === 0}>
              <Text style={[styles.flechaSelector, mesActual === 0 && {color: '#CBD5E1'}]}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.tituloMes}>{meses[mesActual]}</Text>
            <TouchableOpacity onPress={() => cambiarMes('sig')} disabled={mesActual === 11}>
              <Text style={[styles.flechaSelector, mesActual === 11 && {color: '#CBD5E1'}]}>▶</Text>
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

              const compId = guardiasAnuales2026[celda.fechaClave];
              const compData = misTecnicos.find(c => c.id === compId);
              const colorFondo = compData ? compData.color : '#F1F5F9';
              const esMiGuardia = compId === usuarioLogueado.id;
              const infoFestivo = festivos2026[celda.fechaClave];

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
                    const precioDia = (celda.esFinde || infoFestivo) ? 70 : 28;
                    Alert.alert(
                      `Día ${celda.dia} de ${meses[mesActual]}`, 
                      `${compData ? `Guardia: ${compData.nombre}` : 'Sin guardia'}\nTurno: ${precioDia}€${infoFestivo ? `\nFestivo: ${infoFestivo.nombre}` : ''}`
                    );
                  }}
                >
                  <View style={styles.contenedorTextoDia}>
                    <Text style={[styles.textoDia, compData && { color: '#FFFFFF', fontWeight: 'bold' }]}>
                      {celda.dia}
                    </Text>
                    {infoFestivo && (
                      <Text numberOfLines={1} style={styles.textoMiniFestivo}>
                        {infoFestivo.icono || '📍'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* TRÁMITES */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>🚀 Solicitar Vacaciones</Text>
          <TextInput style={styles.entradaTexto} placeholder="Fecha Inicio (Ej: 2026-06-15)" value={fechaInicio} onChangeText={setFechaInicio} />
          <TextInput style={[styles.entradaTexto, {marginTop: 10}]} placeholder="Fecha Fin (Ej: 2026-06-22)" value={fechaFin} onChangeText={setFechaFin} />
          <TouchableOpacity style={styles.botonEnviar} onPress={enviarSolicitud}>
            <Text style={styles.textoBotonEnviar}>Enviar a Friti</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorLogin: { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  tarjetaLogin: { backgroundColor: '#FFFFFF', width: '85%', padding: 25, borderRadius: 16, elevation: 5 },
  loginTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  loginSubtitulo: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  labelInput: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 5 },
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
  
  tarjeta: { backgroundColor: '#FFFFFF', margin: 12, padding: 12, borderRadius: 12, elevation: 2 },
  tarjetaResumenPropia: { backgroundColor: '#1E293B', margin: 12, padding: 16, borderRadius: 12, elevation: 3 },
  tituloSeccionBlanco: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8' },
  cifraNominaGrande: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginVertical: 4 },

  tituloSeccion: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 5 },
  textoInfoPrecios: { fontSize: 11, color: '#64748B', marginBottom: 10 },
  listaCompañeros: { flexDirection: 'row', flexWrap: 'wrap' },
  itemCompañero: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 6 },
  circuloColor: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  nombreCompañero: { fontSize: 12, color: '#475569' },

  selectorMesContenedor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloMes: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  flechaSelector: { fontSize: 18, color: '#3B82F6', paddingHorizontal: 15 },
  diasSemanaContenedor: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
  textoDiaSemana: { fontWeight: 'bold', color: '#64748B', width: 35, textAlign: 'center', fontSize: 12 },
  rejillaCalendario: { flexDirection: 'row', flexWrap: 'wrap' },
  celdaDia: { width: '12%', height: 46, margin: '1.1%', justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  celdaVacia: { width: '12%', height: 46, margin: '1.1%' },
  contenedorTextoDia: { alignItems: 'center', justifyContent: 'center' },
  textoDia: { fontSize: 12, color: '#334155' },
  textoMiniFestivo: { fontSize: 9, color: '#FFFFFF', marginTop: 1 },
  
  entradaTexto: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 8, fontSize: 13 },
  botonEnviar: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  textoBotonEnviar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  grupoBotonesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  botonSelectorMini: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginHorizontal: 2 },
  textoSelectorMini: { fontSize: 11, color: '#475569' },
  botonEjecutarMasivo: { backgroundColor: '#EF4444', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  botonRotar: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  
  tituloAdmin: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginLeft: 15, marginTop: 15 },
  textoNoPeticiones: { textAlign: 'center', color: '#64748B', marginTop: 15, fontSize: 13, fontStyle: 'italic' },
  tarjetaPeticion: { backgroundColor: '#FFFFFF', margin: 12, padding: 15, borderRadius: 10, borderLeftWidth: 5, borderColor: '#3B82F6', elevation: 1 },
  nombrePet: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  detallesPet: { fontSize: 12, color: '#475569', marginTop: 3 },
  accionesPet: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  botonAccion: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 6, marginLeft: 10 },
  botonAprobar: { backgroundColor: '#10B981' },
  textoBotonAction: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }
});