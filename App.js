import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// CONFIGURACIÓN DE TU SERVIDOR EN LA NUBE
// ==========================================
const SUPABASE_URL = "https://wzgoimvoxnnjaytmlpff.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_wqksW-E9AUDHJdVG1_VqWw_dCyBrvvZ"; 

const supabaseFetch = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Error en el servidor');
    }
    return await response.json();
  } catch (error) {
    console.error("Error Supabase:", error);
    throw error;
  }
};

export default function App() {
  const anioActual = 2026;

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Tarifas de guardia editables
  const [precioLaborable, setPrecioLaborable] = useState('28');
  const [precioFestivoFinde, setPrecioFestivoFinde] = useState('70');

  // Estados Globales
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [peticiones, setPeticiones] = useState([]);
  const [cargandoDatosGlobales, setCargandoDatosGlobales] = useState(true);

  // Estados altas técnico
  const [nuevoNombreTecnico, setNuevoNombreTecnico] = useState('');
  const [nuevoUserTecnico, setNuevoUserTecnico] = useState('');
  const [nuevoPassTecnico, setNuevoPassTecnico] = useState('');
  const [nuevoColorTecnico, setNuevoColorTecnico] = useState('#8B5CF6');
  const [nuevosDiasTotales, setNuevosDiasTotales] = useState('30');

  // Estados solicitudes empleado
  const [empFechaInicio, setEmpFechaInicio] = useState('');
  const [empFechaFin, setEmpFechaFin] = useState('');
  const [empTipoAusencia, setEmpTipoAusencia] = useState('Vacaciones');

  // Estados control admin
  const [idSeleccionadoModificar, setIdSeleccionadoModificar] = useState('');
  const [nuevoUserAdmin, setNuevoUserAdmin] = useState('');
  const [nuevoPassAdmin, setNuevoPassAdmin] = useState('');
  const [diasTotalesAdmin, setDiasTotalesAdmin] = useState('30');
  const [adminTipoVacacion, setAdminTipoVacacion] = useState('Vacaciones');
  const [adminFechaInicio, setAdminFechaInicio] = useState('');
  const [adminFechaFin, setAdminFechaFin] = useState('');

  const [guardiasAnuales, setGuardiasAnuales] = useState({});
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); 
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputContraseña, setInputContraseña] = useState('');
  const [mesActual, setMesActual] = useState(new Date().getMonth()); 

  // ==========================================================
  // CALENDARIO DE FESTIVOS VALENCIA / ESPAÑA 2026
  // ==========================================================
  const festivosBase = {
    '01-01': { nombre: 'Año Nuevo', tipo: 'Nacional', icono: '🇪🇸' },
    '01-06': { nombre: 'Reyes Magos', tipo: 'Nacional', icono: '🇪🇸' },
    '01-22': { nombre: 'San Vicente Mártir', tipo: 'Local Valencia', icono: '🦇' },
    '03-19': { nombre: 'San José', tipo: 'Autonómico', icono: '🔥' }, 
    '04-02': { nombre: 'Jueves Santo', tipo: 'Nacional', icono: '🇪🇸' },
    '04-03': { nombre: 'Viernes Santo', tipo: 'Nacional', icono: '🇪🇸' },
    '04-06': { nombre: 'Lunes de Pascua', tipo: 'Autonómico', icono: '🍊' },
    '05-01': { nombre: 'Trabajador', tipo: 'Nacional', icono: '🇪🇸' },
    '06-24': { nombre: 'San Juan', tipo: 'Autonómico', icono: '🍊' },
    '08-15': { nombre: 'Asunción de la Virgen', tipo: 'Nacional', icono: '🇪🇸' },
    '10-09': { nombre: 'Día de la Comunidad Valenciana', tipo: 'Autonómico', icono: '🍊' },
    '10-12': { nombre: 'Fiesta Nacional de España', tipo: 'Nacional', icono: '🇪🇸' },
    '11-01': { nombre: 'Todos los Santos', tipo: 'Nacional', icono: '🇪🇸' },
    '12-06': { nombre: 'Día de la Constitución', tipo: 'Nacional', icono: '🇪🇸' },
    '12-08': { nombre: 'Inmaculada Concepción', tipo: 'Nacional', icono: '🇪🇸' },
    '12-25': { nombre: 'Navidad', tipo: 'Nacional', icono: '🇪🇸' }
  };

  const festivosDelAnio = {};
  Object.keys(festivosBase).forEach(mesDia => {
    festivosDelAnio[`${anioActual}-${mesDia}`] = festivosBase[mesDia];
  });

  const calcularDiasEntreFechas = (inicioStr, finStr) => {
    const fin = new Date(finStr);
    const inicio = new Date(inicioStr);
    if (isNaN(fin) || isNaN(inicio) || fin < inicio) return 0;
    const diffTime = Math.abs(fin - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const comprobarSiEstaDeVacaciones = (fechaISO, tecnicoId, listaPeticiones = peticiones) => {
    const fechaActual = new Date(fechaISO);
    return listaPeticiones.some(p => {
      if (p.tecnicoId === tecnicoId && p.estado === 'Aprobado') {
        const dInicio = new Date(p.inicio);
        const dFin = new Date(p.fin);
        return fechaActual >= dInicio && fechaActual <= dFin;
      }
      return false;
    });
  };

  const calcularImporteMensualGuardia = (username, mesInd) => {
    let totalAcumulado = 0;
    let diasLaborables = 0;
    let diasFestivosFinde = 0;

    const numDias = new Date(anioActual, mesInd + 1, 0).getDate();
    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mesInd + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${anioActual}-${mesStr}-${diaStr}`;
      
      if (guardiasAnuales[fechaClave] === username) {
        const deVacaciones = comprobarSiEstaDeVacaciones(fechaClave, username, peticiones);
        if (!deVacaciones) {
          const fechaObj = new Date(anioActual, mesInd, dia);
          const esFinde = fechaObj.getDay() === 0 || fechaObj.getDay() === 6;
          const esFestivo = !!festivosDelAnio[fechaClave];

          if (esFinde || esFestivo) {
            totalAcumulado += parseInt(precioFestivoFinde) || 70;
            diasFestivosFinde++;
          } else {
            totalAcumulado += parseInt(precioLaborable) || 28;
            diasLaborables++;
          }
        }
      }
    }
    return { totalAcumulado, diasLaborables, diasFestivosFinde };
  };

  // =========================================================================
  // 🔄 NUEVO ALGORITMO: GENERACIÓN INTELIGENTE EQUITATIVA DE FESTIVOS
  // =========================================================================
  const generarCalendarioInteligenteEquitativo = () => {
    let nuevoCuadrante = {};
    const listaTecnicos = usuariosDB.filter(u => u.activo);
    if (listaTecnicos.length === 0) return;

    // Inicializamos el contador de festivos/fines de semana realizados por cada técnico
    let contadorFestivos = {};
    listaTecnicos.forEach(t => {
      contadorFestivos[t.usuario] = 0;
    });

    // Pauta de rotación normal de base secuencial de técnicos para días laborables
    let indiceRotacionNormal = 0;

    let fechaBucle = new Date(anioActual, 0, 1);
    while (fechaBucle.getFullYear() === anioActual) {
      const currentMes = fechaBucle.getMonth();
      const currentDia = fechaBucle.getDate();
      
      const m = String(currentMes + 1).padStart(2, '0');
      const d = String(currentDia).padStart(2, '0');
      const isoKey = `${anioActual}-${m}-${d}`;

      const esFinde = fechaBucle.getDay() === 0 || fechaBucle.getDay() === 6;
      const esFestivoOca = !!festivosDelAnio[isoKey];

      if (esFinde || esFestivoOca) {
        // REPARTO EQUITATIVO: Buscamos qué técnico lleva MENOS festivos acumulados hasta el momento
        let tecnicoElegido = listaTecnicos[0].usuario;
        let minFestivos = contadorFestivos[tecnicoElegido];

        for (let i = 1; i < listaTecnicos.length; i++) {
          const uId = listaTecnicos[i].usuario;
          if (contadorFestivos[uId] < minFestivos) {
            minFestivos = contadorFestivos[uId];
            tecnicoElegido = uId;
          }
        }

        nuevoCuadrante[isoKey] = tecnicoElegido;
        contadorFestivos[tecnicoElegido] += 1; // Sumamos el festivo realizado al contador
      } else {
        // Día laborable estándar: Sigue la cola secuencial normal para no sobrecargar
        const tecNormal = listaTecnicos[indiceRotacionNormal % listaTecnicos.length].usuario;
        nuevoCuadrante[isoKey] = tecNormal;
        indiceRotacionNormal++;
      }

      fechaBucle.setDate(fechaBucle.getDate() + 1);
    }

    setGuardiasAnuales(nuevoCuadrante);
    Alert.alert("Cuadrante Optimizado", "Se han redistribuido las guardias equilibrando matemáticamente los festivos.");
  };

  const generarCalendarioAnualBase = (listaUsuariosModerna = usuariosDB) => {
    let nuevoCuadrante = {};
    let fechaBucle = new Date(anioActual, 0, 1);
    
    // Lista secuencial básica por defecto si no se optimiza
    while (fechaBucle.getFullYear() === anioActual) {
      const currentMes = fechaBucle.getMonth();
      const currentDia = fechaBucle.getDate();
      const m = String(currentMes + 1).padStart(2, '0');
      const d = String(currentDia).padStart(2, '0');
      const isoKey = `${anioActual}-${m}-${d}`;

      // Por defecto asignamos rotativamente o un valor base seguro
      const totalTecs = listaUsuariosModerna.filter(u => u.rol === 'empleado');
      if (totalTecs.length > 0) {
        const index = currentDia % totalTecs.length;
        nuevoCuadrante[isoKey] = totalTecs[index].usuario;
      } else {
        nuevoCuadrante[isoKey] = 'J.Carlos';
      }
      fechaBucle.setDate(fechaBucle.getDate() + 1);
    }
    return nuevoCuadrante;
  };

  const calcularContadoresVacaciones = (username, listaUsuarios = usuariosDB, listaPeticiones = peticiones) => {
    const usuario = listaUsuarios.find(u => u.usuario === username);
    const totales = usuario ? Number(usuario.dias_totales || 30) : 30;
    
    const disfrutados = listaPeticiones
      .filter(p => p.tecnicoId === username && p.estado === 'Aprobado')
      .reduce((sum, p) => sum + calcularDiasEntreFechas(p.inicio, p.fin), 0);

    return { totales, disfrutados, restantes: totales - disfrutados };
  };

  const cargarDatosDesdeServidor = async () => {
    try {
      setCargandoDatosGlobales(true);
      const datosUsuarios = await supabaseFetch('usuarios?select=*');
      setUsuariosDB(datosUsuarios);
      
      let datosVacaciones = [];
      try {
        datosVacaciones = await supabaseFetch('vacaciones?select=*');
        setPeticiones(datosVacaciones);
      } catch (errVac) {
        console.log("Aviso: Tabla vacaciones vacía.");
      }

      const calendarioInicial = generarCalendarioAnualBase(datosUsuarios);
      setGuardiasAnuales(calendarioInicial);

      const datosSesionLocal = await AsyncStorage.getItem('@sesion_guardia_v2');
      if (datosSesionLocal) {
        const sesionParseada = JSON.parse(datosSesionLocal);
        const fresco = datosUsuarios.find(u => u.usuario === sesionParseada.usuario);
        setUsuarioLogueado(fresco || sesionParseada);
      }
    } catch (e) {
      Alert.alert("Error de Sincronización", "Error al descargar datos de Supabase.");
    } finally {
      setCargandoDatosGlobales(false);
    }
  };

  useEffect(() => {
    cargarDatosDesdeServidor();
  }, []);

  const solicitarDiasEmpleado = async () => {
    if (!empFechaInicio.trim() || !empFechaFin.trim()) {
      Alert.alert("Campos Vacíos", "Especifica la fecha de inicio y fin (AAAA-MM-DD).");
      return;
    }

    const nuevaPeticion = {
      tecnicoId: usuarioLogueado.usuario,
      nombre: usuarioLogueado.nombre,
      tipo: empTipoAusencia,
      inicio: empFechaInicio.trim(),
      fin: empFechaFin.trim(),
      estado: 'Pendiente'
    };

    try {
      await supabaseFetch('vacaciones', { method: 'POST', body: JSON.stringify(nuevaPeticion) });
      Alert.alert("Solicitud Enviada", "Tu petición ha sido enviada al Administrador.");
      setEmpFechaInicio('');
      setEmpFechaFin('');
      cargarDatosDesdeServidor();
    } catch (err) {
      Alert.alert("Error de Envío", "No se pudo conectar con el servidor.");
    }
  };

  const registrarNuevoTecnico = async () => {
    if (!nuevoNombreTecnico.trim() || !nuevoUserTecnico.trim() || !nuevoPassTecnico.trim()) {
      Alert.alert('Campos Incompletos', 'Completa los datos del nuevo técnico.');
      return;
    }

    const nuevoObjetoTecnico = {
      nombre: nuevoNombreTecnico.trim(),
      usuario: nuevoUserTecnico.trim(),
      pass: nuevoPassTecnico.trim(),
      rol: 'empleado',
      color: nuevoColorTecnico,
      activo: true,
      dias_totales: parseInt(nuevosDiasTotales) || 30
    };

    try {
      await supabaseFetch('usuarios', { method: 'POST', body: JSON.stringify(nuevoObjetoTecnico) });
      Alert.alert('¡Éxito!', `El técnico se ha guardado en el servidor.`);
      cargarDatosDesdeServidor();
      setNuevoNombreTecnico('');
      setNuevoUserTecnico('');
      setNuevoPassTecnico('');
    } catch (error) {
      Alert.alert("Error", "No se pudo añadir al usuario.");
    }
  };

  const aplicarChangeCredenciales = async () => {
    if (!idSeleccionadoModificar) {
      Alert.alert('Error', 'Selecciona un técnico primero.');
      return;
    }
    try {
      await supabaseFetch(`usuarios?usuario=eq.${idSeleccionadoModificar}`, {
        method: 'PATCH',
        body: JSON.stringify({
          usuario: nuevoUserAdmin.trim(),
          pass: nuevoPassAdmin.trim(),
          dias_totales: parseInt(diasTotalesAdmin) || 30
        })
      });
      Alert.alert('Éxito', 'Perfil técnico actualizado.');
      cargarDatosDesdeServidor();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la actualización.");
    }
  };

  const iniciarSesion = async () => {
    const userClean = inputUsuario.toLowerCase().trim();
    const passClean = inputContraseña.trim(); 
    
    const usuarioEncontrado = usuariosDB.find(u => {
      const dbUser = u.usuario ? u.usuario.toLowerCase().trim() : '';
      const dbPass = u.pass ? u.pass.trim() : ''; 
      return dbUser === userClean && dbPass === passClean;
    });
    
    if (usuarioEncontrado) {
      setUsuarioLogueado(usuarioEncontrado);
      await AsyncStorage.setItem('@sesion_guardia_v2', JSON.stringify(usuarioEncontrado));
      setInputUsuario('');
      setInputContraseña('');
      if (usuarioEncontrado.rol === 'admin') {
        const primerEmp = usuariosDB.find(u => u.rol === 'empleado');
        if (primerEmp) seleccionarTecnicoParaModificar(primerEmp.usuario, usuariosDB);
      }
    } else {
      Alert.alert('Acceso Denegado', 'Credenciales incorrectas.');
    }
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('@sesion_guardia_v2');
    setUsuarioLogueado(null);
  };

  const seleccionarTecnicoParaModificar = (id, listaActora = usuariosDB) => {
    setIdSeleccionadoModificar(id);
    const empleado = listaActora.find(u => u.usuario === id);
    if (empleado) {
      setNuevoUserAdmin(empleado.usuario);
      setNuevoPassAdmin(empleado.pass);
      setDiasTotalesAdmin(String(empleado.dias_totales || 30));
    }
  };

  const asignarVacacionDirectaAdmin = async () => {
    if (!adminFechaInicio.trim() || !adminFechaFin.trim()) {
      Alert.alert('Error', 'Introduce las fechas correctas.');
      return;
    }
    const empleado = usuariosDB.find(u => u.usuario === idSeleccionadoModificar);
    const nuevaAusencia = {
      tecnicoId: idSeleccionadoModificar,
      nombre: empleado ? empleado.nombre : 'Técnico',
      tipo: adminTipoVacacion,
      inicio: adminFechaInicio.trim(),
      fin: adminFechaFin.trim(),
      estado: 'Aprobado' 
    };

    try {
      await supabaseFetch('vacaciones', { method: 'POST', body: JSON.stringify(nuevaAusencia) });
      Alert.alert('Éxito', `Ausencia aprobada directamente.`);
      setAdminFechaInicio('');
      setAdminFechaFin('');
      cargarDatosDesdeServidor();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la fila.');
    }
  };

  const resolverPeticion = async (id, nuevoEstado) => {
    try {
      await supabaseFetch(`vacaciones?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
      });
      Alert.alert('Procesado', `Solicitud marcada como: ${nuevoEstado}`);
      cargarDatosDesdeServidor();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la petición.');
    }
  };

  const obtenerDiasMes = (mes) => {
    const primerDia = new Date(anioActual, mes, 1).getDay();
    const diasEnBlanco = primerDia === 0 ? 6 : primerDia - 1;
    const numDias = new Date(anioActual, mes + 1, 0).getDate();

    let celdas = [];
    for (let i = 0; i < diasEnBlanco; i++) {
      celdas.push({ tipo: 'vacio', id: `vacio-${i}` });
    }
    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${anioActual}-${mesStr}-${diaStr}`;
      const fechaObj = new Date(anioActual, mes, dia);
      celdas.push({ tipo: 'dia', dia, fechaClave, esFinde: fechaObj.getDay() === 0 || fechaObj.getDay() === 6 });
    }
    return celdas;
  };

  const celdasCalendario = obtenerDiasMes(mesActual);

  const cambiarMes = (direccion) => {
    if (direccion === 'ant' && mesActual > 0) setMesActual(mesActual - 1);
    if (direccion === 'sig' && mesActual < 11) setMesActual(mesActual + 1);
  };

  if (cargandoDatosGlobales) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B' }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: '#FFF', marginTop: 15, fontSize: 13 }}>Sincronizando base de datos...</Text>
      </View>
    );
  }

  if (!usuarioLogueado) {
    return (
      <SafeAreaView style={styles.contenedorLogin}>
        <View style={styles.tarjetaLogin}>
          <Text style={styles.loginTitulo}>🔑 Acceso Cuadrante {anioActual}</Text>
          <Text style={styles.loginSubtitulo}>Sincronizado en tiempo real</Text>
          <Text style={styles.labelInput}>Usuario</Text>
          <TextInput style={styles.entradaTextoLogin} placeholder="Usuario" value={inputUsuario} onChangeText={setInputUsuario} autoCapitalize="none"/>
          <Text style={[styles.labelInput, {marginTop: 15}]}>Contraseña</Text>
          <TextInput style={styles.entradaTextoLogin} placeholder="••••••••" secureTextEntry={true} value={inputContraseña} onChangeText={setInputContraseña} autoCapitalize="none"/>
          <TouchableOpacity style={styles.botonLogin} onPress={iniciarSesion}>
            <Text style={styles.textoBotonLogin}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // 👑 VISTA: ADMINISTRADOR
  // ==========================================================
  if (usuarioLogueado.rol === 'admin') {
    const todosLosEmpleados = usuariosDB.filter(u => u.rol === 'empleado');

    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.cabeceraAdmin}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.titulo}>👑 Panel de Control</Text>
            <Text style={styles.subtitulo}>Admin: {usuarioLogueado.usuario}</Text>
          </View>
          <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
            <Text style={styles.textoBotonCerrar}>Salir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cuerpo}>
          
          {/* Tarifas Editables + BOTÓN GENERAR GUARDIA INTELIGENTE */}
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#10B981' }]}>💰 Tarifas de Guardia y Generación</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Laborable (€)</Text>
                <TextInput style={styles.entradaTexto} keyboardType="numeric" value={precioLaborable} onChangeText={setPrecioLaborable}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Festivo/Finde (€)</Text>
                <TextInput style={styles.entradaTexto} keyboardType="numeric" value={precioFestivoFinde} onChangeText={setPrecioFestivoFinde}/>
              </View>
            </View>
            
            {/* SOLUCIÓN: Botón Inteligente para evitar repetición de festivos */}
            <TouchableOpacity style={styles.botonInteligente} onPress={generarCalendarioInteligenteEquitativo}>
              <Text style={styles.textoBotonInteligente}>🔄 Generar Cuadrante Inteligente (Festivos Equitativos)</Text>
            </TouchableOpacity>
          </View>

          {/* Balance de Vacaciones */}
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1 }]}>
            <Text style={[styles.tituloSeccion, { color: '#059669' }]}>📊 Balance de Vacaciones del Equipo</Text>
            <View style={{ marginTop: 4 }}>
              {todosLosEmpleados.map((emp) => {
                const con = calcularContadoresVacaciones(emp.usuario, usuariosDB, peticiones);
                return (
                  <View key={emp.usuario} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '500', color: '#1E293B', fontSize: 13 }}>👤 {emp.nombre}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Text style={{ fontSize: 12 }}>Asignados: <Text style={{ fontWeight: 'bold' }}>{con.totales}</Text></Text>
                      <Text style={{ fontSize: 12, color: '#3B82F6' }}>Gastados: <Text style={{ fontWeight: 'bold' }}>{con.disfrutados}</Text></Text>
                      <Text style={{ fontSize: 12, color: '#10B981' }}>Disponibles: <Text style={{ fontWeight: 'bold' }}>{con.restantes}</Text></Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Alta de Técnicos */}
          <View style={[styles.tarjeta, { borderColor: '#8B5CF6', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#7C3AED' }]}>➕ Registrar Alta de Nuevo Técnico</Text>
            <Text style={styles.labelInput}>Nombre Completo</Text>
            <TextInput style={styles.entradaTexto} placeholder="Ej: Carlos Gómez" value={nuevoNombreTecnico} onChangeText={setNuevoNombreTecnico}/>
            
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Usuario Login</Text>
                <TextInput style={styles.entradaTexto} value={nuevoUserTecnico} onChangeText={setNuevoUserTecnico} autoCapitalize="none"/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Contraseña</Text>
                <TextInput style={styles.entradaTexto} value={nuevoPassTecnico} onChangeText={setNuevoPassTecnico} autoCapitalize="none"/>
              </View>
            </View>
            <Text style={styles.labelInput}>Días Totales Iniciales</Text>
            <TextInput style={styles.entradaTexto} keyboardType="numeric" value={nuevosDiasTotales} onChangeText={setNuevosDiasTotales}/>

            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#8B5CF6' }]} onPress={registrarNuevoTecnico}>
              <Text style={styles.textoBotonEnviar}>💾 Guardar en Servidor</Text>
            </TouchableOpacity>
          </View>

          {/* Buzón de Solicitudes */}
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#059669' }]}>📌 Solicitudes Recibidas (Pendientes)</Text>
            {peticiones.filter(p => p.estado === 'Pendiente').length === 0 ? (
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', padding: 10 }}>No hay peticiones nuevas.</Text>
            ) : (
              peticiones.filter(p => p.estado === 'Pendiente').map((pet) => (
                <View key={pet.id} style={styles.contenedorItemPeticion}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.peticionNombre}>{pet.nombre} ({pet.tipo})</Text>
                    <Text style={styles.peticionFechas}>📅 {pet.inicio} al {pet.fin}</Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>Días a restar: {calcularDiasEntreFechas(pet.inicio, pet.fin)}</Text>
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

          {/* Gestión de Credenciales */}
          <View style={[styles.tarjeta, { borderColor: '#6366F1', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#4F46E5' }]}>⚙️ Editar Credenciales y Vacaciones Directas</Text>
            <View style={styles.grupoBotonesGridVertical}>
              {todosLosEmpleados.map((emp) => (
                <TouchableOpacity 
                  key={emp.usuario} 
                  style={[styles.botonSelectorGrande, idSeleccionadoModificar === emp.usuario && { backgroundColor: '#6366F1' }]} 
                  onPress={() => seleccionarTecnicoParaModificar(emp.usuario)}
                >
                  <Text style={[styles.textoSelectorMini, idSeleccionadoModificar === emp.usuario && { color: '#FFF' }]}>
                    👤 {emp.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, {marginTop: 10}]}>Editar Usuario Login</Text>
            <TextInput style={styles.entradaTexto} value={nuevoUserAdmin} onChangeText={setNuevoUserAdmin} autoCapitalize="none"/>
            <Text style={styles.labelInput}>Editar Contraseña</Text>
            <TextInput style={styles.entradaTexto} value={nuevoPassAdmin} onChangeText={setNuevoPassAdmin} autoCapitalize="none"/>
            <Text style={styles.labelInput}>Modificar Asignación Total Días</Text>
            <TextInput style={styles.entradaTexto} keyboardType="numeric" value={diasTotalesAdmin} onChangeText={setDiasTotalesAdmin}/>

            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#6366F1' }]} onPress={aplicarChangeCredenciales}>
              <Text style={styles.textoBotonEnviar}>💾 Actualizar Técnico</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 }} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#4F46E5' }}>🌴 Forzar Periodo Aprobado:</Text>
            
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.entradaTexto} placeholder="Inicio: AAAA-MM-DD" value={adminFechaInicio} onChangeText={setAdminFechaInicio}/>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.entradaTexto} placeholder="Fin: AAAA-MM-DD" value={adminFechaFin} onChangeText={setAdminFechaFin}/>
              </View>
            </View>
            
            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#10B981' }]} onPress={asignarVacacionDirectaAdmin}>
              <Text style={styles.textoBotonEnviar}>🌴 Asignar Periodo</Text>
            </TouchableOpacity>
          </View>

          {/* SOLUCIÓN AL CALENDARIO (Admin) - Muestra correctamente quién está de guardia */}
          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>📅 Vista Global de Cuadrante (Verificando Vacaciones)</Text>
            <View style={styles.selectorMesContenedor}>
              <TouchableOpacity onPress={() => cambiarMes('ant')} disabled={mesActual === 0}><Text style={styles.flechaSelector}>◀</Text></TouchableOpacity>
              <Text style={styles.tituloMes}>{meses[mesActual]} {anioActual}</Text>
              <TouchableOpacity onPress={() => cambiarMes('sig')} disabled={mesActual === 11}><Text style={styles.flechaSelector}>▶</Text></TouchableOpacity>
            </View>

            <View style={styles.rejillaCalendario}>
              {celdasCalendario.map((celda, i) => {
                if (celda.tipo === 'vacio') return <View key={`vacio-${i}`} style={styles.celdaVacia} />;
                
                let compId = guardiasAnuales[celda.fechaClave];
                let estaDeVacaciones = comprobarSiEstaDeVacaciones(celda.fechaClave, compId, peticiones);
                
                // FIX: Busca al técnico en la lista completa (incluyendo administradores como J.Carlos)
                let compData = usuariosDB.find(c => c.usuario === compId);
                
                const infoFestivo = festivosDelAnio[celda.fechaClave];
                const esFestivoOFinde = celda.esFinde || !!infoFestivo;
                const costeDia = esFestivoOFinde ? precioFestivoFinde : precioLaborable;

                return (
                  <View key={celda.fechaClave} style={[styles.celdaDia, esFestivoOFinde && { backgroundColor: '#FFF1F2' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.numeroDia, esFestivoOFinde && { fontWeight: 'bold', color: '#EF4444' }]}>
                        {celda.dia} {infoFestivo ? infoFestivo.icono : ''}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 7, color: esFestivoOFinde ? '#E11D48' : '#10B981', alignSelf: 'center', fontWeight: 'bold' }}>{costeDia}€</Text>
                    
                    <View style={[styles.indicadorGuardia, { backgroundColor: estaDeVacaciones ? '#94A3B8' : (compData ? compData.color : '#475569') }]}>
                      <Text style={styles.textoIndicador} numberOfLines={1}>
                        {estaDeVacaciones ? 'PALMA' : (compData ? compData.nombre.split(' ')[0] : (compId || 'Libre'))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // 👤 VISTA: EMPLEADO / TÉCNICO
  // ==========================================================
  const misTecnicos = usuariosDB.filter(u => u.rol === 'empleado');
  const contadoresPropios = calcularContadoresVacaciones(usuarioLogueado.usuario, usuariosDB, peticiones);
  const desgloseFinanciero = calcularImporteMensualGuardia(usuarioLogueado.usuario, mesActual);

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.cabecera}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>👋 Hola, {usuarioLogueado.nombre}</Text>
          <Text style={{ fontSize: 11, color: '#475569', fontWeight: '500' }}>Técnico de Guardia Activo</Text>
        </View>
        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.textoBotonCerrar}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cuerpo}>
        {/* Marcador Financiero */}
        <View style={[styles.tarjeta, { backgroundColor: '#0F172A', borderColor: '#10B981', borderWidth: 1 }]}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            💰 Guardias Estimadas de {meses[mesActual]}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>{desgloseFinanciero.totalAcumulado} €</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                Laborables: {desgloseFinanciero.diasLaborables} | Festivos/Finde: {desgloseFinanciero.diasFestivosFinde}
              </Text>
            </View>
            <View style={{ backgroundColor: '#1E293B', padding: 10, borderRadius: 10 }}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{anioActual}</Text>
            </View>
          </View>
        </View>

        {/* Marcadores Vacaciones */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
          <View style={[styles.miniTarjetaContador, { flex: 1, backgroundColor: '#E2E8F0' }]}>
            <Text style={styles.labelContadorMini}>Asignados</Text>
            <Text style={styles.cifraContadorMini}>{contadoresPropios.totales}</Text>
          </View>
          <View style={[styles.miniTarjetaContador, { flex: 1, backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.labelContadorMini, { color: '#1E40AF' }]}>Disfrutados</Text>
            <Text style={[styles.cifraContadorMini, { color: '#1E40AF' }]}>{contadoresPropios.disfrutados}</Text>
          </View>
          <View style={[styles.miniTarjetaContador, { flex: 1, backgroundColor: '#D1FAE5' }]}>
            <Text style={[styles.labelContadorMini, { color: '#065F46' }]}>Quedan</Text>
            <Text style={[styles.cifraContadorMini, { color: '#065F46' }]}>{contadoresPropios.restantes}</Text>
          </View>
        </View>

        {/* Solicitudes de Vacaciones */}
        <View style={[styles.tarjeta, { borderColor: '#3B82F6', borderWidth: 1 }]}>
          <Text style={[styles.tituloSeccion, { color: '#1D4ED8' }]}>✉️ Tramitar Vacaciones o Días</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
            {['Vacaciones', 'Día Libre'].map((tipo) => (
              <TouchableOpacity key={tipo} style={[styles.botonSelectorGrande, { flex: 1 }, empTipoAusencia === tipo && { backgroundColor: '#3B82F6' }]} onPress={() => setEmpTipoAusencia(tipo)}>
                <Text style={[styles.textoSelectorMini, { textAlign: 'center' }, empTipoAusencia === tipo && { color: '#FFF' }]}>{tipo}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ flex: 1 }}>
              <TextInput style={styles.entradaTexto} placeholder="Inicio: AAAA-MM-DD" value={empFechaInicio} onChangeText={setEmpFechaInicio}/>
            </View>
            <View style={{ flex: 1 }}>
              <TextInput style={styles.entradaTexto} placeholder="Fin: AAAA-MM-DD" value={empFechaFin} onChangeText={setEmpFechaFin}/>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#3B82F6' }]} onPress={solicitarDiasEmpleado}>
            <Text style={styles.textoBotonEnviar}>🚀 Enviar Solicitud Remota</Text>
          </TouchableOpacity>
        </View>

        {/* Historial Propio */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>📋 Mis Solicitudes de Ausencia</Text>
          {peticiones.filter(p => p.tecnicoId === usuarioLogueado.usuario).map((pet, ind) => (
            <View key={ind} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#F1F5F9' }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{pet.tipo} ({calcularDiasEntreFechas(pet.inicio, pet.fin)} días)</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>📅 {pet.inicio} al {pet.fin}</Text>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: pet.estado === 'Aprobado' ? '#10B981' : '#F59E0B' }}>{pet.estado}</Text>
            </View>
          ))}
        </View>

        {/* Calendario Empleado */}
        <View style={styles.tarjeta}>
          <View style={styles.selectorMesContenedor}>
            <TouchableOpacity onPress={() => cambiarMes('ant')} disabled={mesActual === 0}><Text style={styles.flechaSelector}>◀</Text></TouchableOpacity>
            <Text style={styles.tituloMes}>{meses[mesActual]} {anioActual}</Text>
            <TouchableOpacity onPress={() => cambiarMes('sig')} disabled={mesActual === 11}><Text style={styles.flechaSelector}>▶</Text></TouchableOpacity>
          </View>

          <View style={styles.rejillaCalendario}>
            {celdasCalendario.map((celda, i) => {
              if (celda.tipo === 'vacio') return <View key={`vacio-${i}`} style={styles.celdaVacia} />;

              const compId = guardiasAnuales[celda.fechaClave];
              let estaDeVacaciones = comprobarSiEstaDeVacaciones(celda.fechaClave, compId, peticiones);
              const compData = usuariosDB.find(c => c.usuario === compId);
              
              const infoFestivo = festivosDelAnio[celda.fechaClave];
              const esFestivoOFinde = celda.esFinde || !!infoFestivo;
              const costeDia = esFestivoOFinde ? precioFestivoFinde : precioLaborable;

              return (
                <View key={celda.fechaClave} style={[styles.celdaDia, esFestivoOFinde && { backgroundColor: '#FFF1F2' }]}>
                  <Text style={[styles.numeroDia, esFestivoOFinde && { fontWeight: 'bold', color: '#EF4444' }]}>
                    {celda.dia} {infoFestivo ? infoFestivo.icono : ''}
                  </Text>
                  <Text style={{ fontSize: 7, color: esFestivoOFinde ? '#E11D48' : '#10B981', textAlign: 'center', fontWeight: 'bold' }}>{costeDia}€</Text>
                  
                  <View style={[styles.indicadorGuardia, { backgroundColor: estaDeVacaciones ? '#94A3B8' : (compData ? compData.color : '#475569') }]}>
                    <Text style={styles.textoIndicador} numberOfLines={1}>
                      {estaDeVacaciones ? 'PALMA' : (compData ? compData.nombre.split(' ')[0] : (compId || 'Libre'))}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 🎨 DISEÑO GRÁFICO (STYLING)
// ==========================================
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F1F5F9' },
  contenedorLogin: { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', padding: 20 },
  tarjetaLogin: { backgroundColor: '#FFF', width: '100%', maxWidth: 350, padding: 24, borderRadius: 16 },
  loginTitulo: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  loginSubtitulo: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  cabecera: { backgroundColor: '#FFF', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cabeceraAdmin: { backgroundColor: '#FFF', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 11, color: '#64748B' },
  botonCerrarSesion: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  textoBotonCerrar: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  cuerpo: { flex: 1, padding: 10 },
  tarjeta: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 10 },
  tituloSeccion: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  labelInput: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 2 },
  entradaTexto: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', padding: 8, borderRadius: 8, fontSize: 11, marginBottom: 8, color: '#000' },
  entradaTextoLogin: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 10, fontSize: 14 },
  botonLogin: { backgroundColor: '#10B981', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  textoBotonLogin: { color: '#FFF', fontWeight: 'bold' },
  botonEnviar: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  textoBotonEnviar: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  botonInteligente: { backgroundColor: '#10B981', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  textoBotonInteligente: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  contenedorItemPeticion: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  peticionNombre: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
  peticionFechas: { fontSize: 12, color: '#475569' },
  bloqueAccionesPeticion: { flexDirection: 'row' },
  botonAccionMini: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  textoBotonMini: { color: '#FFF', fontWeight: 'bold' },
  grupoBotonesGridVertical: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  botonSelectorGrande: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  textoSelectorMini: { fontSize: 12, color: '#475569' },
  selectorMesContenedor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  flechaSelector: { fontSize: 18, color: '#1E293B', paddingHorizontal: 10 },
  tituloMes: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  rejillaCalendario: { flexDirection: 'row', flexWrap: 'wrap' },
  celdaDia: { width: '14.28%', height: 54, borderWidth: 0.2, borderColor: '#E2E8F0', padding: 2, justifyContent: 'space-between' },
  celdaVacia: { width: '14.28%', height: 54 },
  numeroDia: { fontSize: 10, color: '#64748B' },
  indicadorGuardia: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 1, alignItems: 'center' },
  textoIndicador: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  miniTarjetaContador: { padding: 10, borderRadius: 10, alignItems: 'center' },
  labelContadorMini: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
  cifraContadorMini: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 2 }
});

// ==========================================
// CONFIGURACIÓN DE TU SERVIDOR EN LA NUBE
// ==========================================
const SUPABASE_URL = "https://wzgoimvoxnnjaytmlpff.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_wqksW-E9AUDHJdVG1_VqWw_dCyBrvvZ"; 

const supabaseFetch = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Error en el servidor');
    }
    return await response.json();
  } catch (error) {
    console.error("Error Supabase:", error);
    throw error;
  }
};

export default function App() {
  const anioActual = 2026;

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Tarifas de guardia editables
  const [precioLaborable, setPrecioLaborable] = useState('28');
  const [precioFestivoFinde, setPrecioFestivoFinde] = useState('70');

  // Estados Globales
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [peticiones, setPeticiones] = useState([]);
  const [cargandoDatosGlobales, setCargandoDatosGlobales] = useState(true);

  // Estados altas técnico
  const [nuevoNombreTecnico, setNuevoNombreTecnico] = useState('');
  const [nuevoUserTecnico, setNuevoUserTecnico] = useState('');
  const [nuevoPassTecnico, setNuevoPassTecnico] = useState('');
  const [nuevoColorTecnico, setNuevoColorTecnico] = useState('#8B5CF6');
  const [nuevosDiasTotales, setNuevosDiasTotales] = useState('30');

  // Estados solicitudes empleado
  const [empFechaInicio, setEmpFechaInicio] = useState('');
  const [empFechaFin, setEmpFechaFin] = useState('');
  const [empTipoAusencia, setEmpTipoAusencia] = useState('Vacaciones');

  // Estados control admin
  const [idSeleccionadoModificar, setIdSeleccionadoModificar] = useState('');
  const [nuevoUserAdmin, setNuevoUserAdmin] = useState('');
  const [nuevoPassAdmin, setNuevoPassAdmin] = useState('');
  const [diasTotalesAdmin, setDiasTotalesAdmin] = useState('30');
  const [adminTipoVacacion, setAdminTipoVacacion] = useState('Vacaciones');
  const [adminFechaInicio, setAdminFechaInicio] = useState('');
  const [adminFechaFin, setAdminFechaFin] = useState('');

  const [guardiasAnuales, setGuardiasAnuales] = useState({});
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); 
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputContraseña, setInputContraseña] = useState('');
  const [mesActual, setMesActual] = useState(new Date().getMonth()); 

  // ==========================================================
  // CALENDARIO DE FESTIVOS VALENCIA / ESPAÑA 2026
  // ==========================================================
  const festivosBase = {
    '01-01': { nombre: 'Año Nuevo', tipo: 'Nacional', icono: '🇪🇸' },
    '01-06': { nombre: 'Reyes Magos', tipo: 'Nacional', icono: '🇪🇸' },
    '01-22': { nombre: 'San Vicente Mártir', tipo: 'Local Valencia', icono: '🦇' },
    '03-19': { nombre: 'San José', tipo: 'Autonómico', icono: '🔥' }, 
    '04-02': { nombre: 'Jueves Santo', tipo: 'Nacional', icono: '🇪🇸' },
    '04-03': { nombre: 'Viernes Santo', tipo: 'Nacional', icono: '🇪🇸' },
    '04-06': { nombre: 'Lunes de Pascua', tipo: 'Autonómico', icono: '🍊' },
    '05-01': { nombre: 'Trabajador', tipo: 'Nacional', icono: '🇪🇸' },
    '06-24': { nombre: 'San Juan', tipo: 'Autonómico', icono: '🍊' },
    '08-15': { nombre: 'Asunción de la Virgen', tipo: 'Nacional', icono: '🇪🇸' },
    '10-09': { nombre: 'Día de la Comunidad Valenciana', tipo: 'Autonómico', icono: '🍊' },
    '10-12': { nombre: 'Fiesta Nacional de España', tipo: 'Nacional', icono: '🇪🇸' },
    '11-01': { nombre: 'Todos los Santos', tipo: 'Nacional', icono: '🇪🇸' },
    '12-06': { nombre: 'Día de la Constitución', tipo: 'Nacional', icono: '🇪🇸' },
    '12-08': { nombre: 'Inmaculada Concepción', tipo: 'Nacional', icono: '🇪🇸' },
    '12-25': { nombre: 'Navidad', tipo: 'Nacional', icono: '🇪🇸' }
  };

  const festivosDelAnio = {};
  Object.keys(festivosBase).forEach(mesDia => {
    festivosDelAnio[`${anioActual}-${mesDia}`] = festivosBase[mesDia];
  });

  const calcularDiasEntreFechas = (inicioStr, finStr) => {
    const fin = new Date(finStr);
    const inicio = new Date(inicioStr);
    if (isNaN(fin) || isNaN(inicio) || fin < inicio) return 0;
    const diffTime = Math.abs(fin - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const comprobarSiEstaDeVacaciones = (fechaISO, tecnicoId, listaPeticiones = peticiones) => {
    const fechaActual = new Date(fechaISO);
    return listaPeticiones.some(p => {
      if (p.tecnicoId === tecnicoId && p.estado === 'Aprobado') {
        const dInicio = new Date(p.inicio);
        const dFin = new Date(p.fin);
        return fechaActual >= dInicio && fechaActual <= dFin;
      }
      return false;
    });
  };

  const calcularImporteMensualGuardia = (username, mesInd) => {
    let totalAcumulado = 0;
    let diasLaborables = 0;
    let diasFestivosFinde = 0;

    const numDias = new Date(anioActual, mesInd + 1, 0).getDate();
    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mesInd + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${anioActual}-${mesStr}-${diaStr}`;
      
      if (guardiasAnuales[fechaClave] === username) {
        const deVacaciones = comprobarSiEstaDeVacaciones(fechaClave, username, peticiones);
        if (!deVacaciones) {
          const fechaObj = new Date(anioActual, mesInd, dia);
          const esFinde = fechaObj.getDay() === 0 || fechaObj.getDay() === 6;
          const esFestivo = !!festivosDelAnio[fechaClave];

          if (esFinde || esFestivo) {
            totalAcumulado += parseInt(precioFestivoFinde) || 70;
            diasFestivosFinde++;
          } else {
            totalAcumulado += parseInt(precioLaborable) || 28;
            diasLaborables++;
          }
        }
      }
    }
    return { totalAcumulado, diasLaborables, diasFestivosFinde };
  };

  // =========================================================================
  // 🔄 NUEVO ALGORITMO: GENERACIÓN INTELIGENTE EQUITATIVA DE FESTIVOS
  // =========================================================================
  const generarCalendarioInteligenteEquitativo = () => {
    let nuevoCuadrante = {};
    const listaTecnicos = usuariosDB.filter(u => u.activo);
    if (listaTecnicos.length === 0) return;

    // Inicializamos el contador de festivos/fines de semana realizados por cada técnico
    let contadorFestivos = {};
    listaTecnicos.forEach(t => {
      contadorFestivos[t.usuario] = 0;
    });

    // Pauta de rotación normal de base secuencial de técnicos para días laborables
    let indiceRotacionNormal = 0;

    let fechaBucle = new Date(anioActual, 0, 1);
    while (fechaBucle.getFullYear() === anioActual) {
      const currentMes = fechaBucle.getMonth();
      const currentDia = fechaBucle.getDate();
      
      const m = String(currentMes + 1).padStart(2, '0');
      const d = String(currentDia).padStart(2, '0');
      const isoKey = `${anioActual}-${m}-${d}`;

      const esFinde = fechaBucle.getDay() === 0 || fechaBucle.getDay() === 6;
      const esFestivoOca = !!festivosDelAnio[isoKey];

      if (esFinde || esFestivoOca) {
        // REPARTO EQUITATIVO: Buscamos qué técnico lleva MENOS festivos acumulados hasta el momento
        let tecnicoElegido = listaTecnicos[0].usuario;
        let minFestivos = contadorFestivos[tecnicoElegido];

        for (let i = 1; i < listaTecnicos.length; i++) {
          const uId = listaTecnicos[i].usuario;
          if (contadorFestivos[uId] < minFestivos) {
            minFestivos = contadorFestivos[uId];
            tecnicoElegido = uId;
          }
        }

        nuevoCuadrante[isoKey] = tecnicoElegido;
        contadorFestivos[tecnicoElegido] += 1; // Sumamos el festivo realizado al contador
      } else {
        // Día laborable estándar: Sigue la cola secuencial normal para no sobrecargar
        const tecNormal = listaTecnicos[indiceRotacionNormal % listaTecnicos.length].usuario;
        nuevoCuadrante[isoKey] = tecNormal;
        indiceRotacionNormal++;
      }

      fechaBucle.setDate(fechaBucle.getDate() + 1);
    }

    setGuardiasAnuales(nuevoCuadrante);
    Alert.alert("Cuadrante Optimizado", "Se han redistribuido las guardias equilibrando matemáticamente los festivos.");
  };

  const generarCalendarioAnualBase = (listaUsuariosModerna = usuariosDB) => {
    let nuevoCuadrante = {};
    let fechaBucle = new Date(anioActual, 0, 1);
    
    // Lista secuencial básica por defecto si no se optimiza
    while (fechaBucle.getFullYear() === anioActual) {
      const currentMes = fechaBucle.getMonth();
      const currentDia = fechaBucle.getDate();
      const m = String(currentMes + 1).padStart(2, '0');
      const d = String(currentDia).padStart(2, '0');
      const isoKey = `${anioActual}-${m}-${d}`;

      // Por defecto asignamos rotativamente o un valor base seguro
      const totalTecs = listaUsuariosModerna.filter(u => u.rol === 'empleado');
      if (totalTecs.length > 0) {
        const index = currentDia % totalTecs.length;
        nuevoCuadrante[isoKey] = totalTecs[index].usuario;
      } else {
        nuevoCuadrante[isoKey] = 'J.Carlos';
      }
      fechaBucle.setDate(fechaBucle.getDate() + 1);
    }
    return nuevoCuadrante;
  };

  const calcularContadoresVacaciones = (username, listaUsuarios = usuariosDB, listaPeticiones = peticiones) => {
    const usuario = listaUsuarios.find(u => u.usuario === username);
    const totales = usuario ? Number(usuario.dias_totales || 30) : 30;
    
    const disfrutados = listaPeticiones
      .filter(p => p.tecnicoId === username && p.estado === 'Aprobado')
      .reduce((sum, p) => sum + calcularDiasEntreFechas(p.inicio, p.fin), 0);

    return { totales, disfrutados, restantes: totales - disfrutados };
  };

  const cargarDatosDesdeServidor = async () => {
    try {
      setCargandoDatosGlobales(true);
      const datosUsuarios = await supabaseFetch('usuarios?select=*');
      setUsuariosDB(datosUsuarios);
      
      let datosVacaciones = [];
      try {
        datosVacaciones = await supabaseFetch('vacaciones?select=*');
        setPeticiones(datosVacaciones);
      } catch (errVac) {
        console.log("Aviso: Tabla vacaciones vacía.");
      }

      const calendarioInicial = generarCalendarioAnualBase(datosUsuarios);
      setGuardiasAnuales(calendarioInicial);

      const datosSesionLocal = await AsyncStorage.getItem('@sesion_guardia_v2');
      if (datosSesionLocal) {
        const sesionParseada = JSON.parse(datosSesionLocal);
        const fresco = datosUsuarios.find(u => u.usuario === sesionParseada.usuario);
        setUsuarioLogueado(fresco || sesionParseada);
      }
    } catch (e) {
      Alert.alert("Error de Sincronización", "Error al descargar datos de Supabase.");
    } finally {
      setCargandoDatosGlobales(false);
    }
  };

  useEffect(() => {
    cargarDatosDesdeServidor();
  }, []);

  const solicitarDiasEmpleado = async () => {
    if (!empFechaInicio.trim() || !empFechaFin.trim()) {
      Alert.alert("Campos Vacíos", "Especifica la fecha de inicio y fin (AAAA-MM-DD).");
      return;
    }

    const nuevaPeticion = {
      tecnicoId: usuarioLogueado.usuario,
      nombre: usuarioLogueado.nombre,
      tipo: empTipoAusencia,
      inicio: empFechaInicio.trim(),
      fin: empFechaFin.trim(),
      estado: 'Pendiente'
    };

    try {
      await supabaseFetch('vacaciones', { method: 'POST', body: JSON.stringify(nuevaPeticion) });
      Alert.alert("Solicitud Enviada", "Tu petición ha sido enviada al Administrador.");
      setEmpFechaInicio('');
      setEmpFechaFin('');
      cargarDatosDesdeServidor();
    } catch (err) {
      Alert.alert("Error de Envío", "No se pudo conectar con el servidor.");
    }
  };

  const registrarNuevoTecnico = async () => {
    if (!nuevoNombreTecnico.trim() || !nuevoUserTecnico.trim() || !nuevoPassTecnico.trim()) {
      Alert.alert('Campos Incompletos', 'Completa los datos del nuevo técnico.');
      return;
    }

    const nuevoObjetoTecnico = {
      nombre: nuevoNombreTecnico.trim(),
      usuario: nuevoUserTecnico.trim(),
      pass: nuevoPassTecnico.trim(),
      rol: 'empleado',
      color: nuevoColorTecnico,
      activo: true,
      dias_totales: parseInt(nuevosDiasTotales) || 30
    };

    try {
      await supabaseFetch('usuarios', { method: 'POST', body: JSON.stringify(nuevoObjetoTecnico) });
      Alert.alert('¡Éxito!', `El técnico se ha guardado en el servidor.`);
      cargarDatosDesdeServidor();
      setNuevoNombreTecnico('');
      setNuevoUserTecnico('');
      setNuevoPassTecnico('');
    } catch (error) {
      Alert.alert("Error", "No se pudo añadir al usuario.");
    }
  };

  const aplicarChangeCredenciales = async () => {
    if (!idSeleccionadoModificar) {
      Alert.alert('Error', 'Selecciona un técnico primero.');
      return;
    }
    try {
      await supabaseFetch(`usuarios?usuario=eq.${idSeleccionadoModificar}`, {
        method: 'PATCH',
        body: JSON.stringify({
          usuario: nuevoUserAdmin.trim(),
          pass: nuevoPassAdmin.trim(),
          dias_totales: parseInt(diasTotalesAdmin) || 30
        })
      });
      Alert.alert('Éxito', 'Perfil técnico actualizado.');
      cargarDatosDesdeServidor();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la actualización.");
    }
  };

  const iniciarSesion = async () => {
    const userClean = inputUsuario.toLowerCase().trim();
    const passClean = inputContraseña.trim(); 
    
    const usuarioEncontrado = usuariosDB.find(u => {
      const dbUser = u.usuario ? u.usuario.toLowerCase().trim() : '';
      const dbPass = u.pass ? u.pass.trim() : ''; 
      return dbUser === userClean && dbPass === passClean;
    });
    
    if (usuarioEncontrado) {
      setUsuarioLogueado(usuarioEncontrado);
      await AsyncStorage.setItem('@sesion_guardia_v2', JSON.stringify(usuarioEncontrado));
      setInputUsuario('');
      setInputContraseña('');
      if (usuarioEncontrado.rol === 'admin') {
        const primerEmp = usuariosDB.find(u => u.rol === 'empleado');
        if (primerEmp) seleccionarTecnicoParaModificar(primerEmp.usuario, usuariosDB);
      }
    } else {
      Alert.alert('Acceso Denegado', 'Credenciales incorrectas.');
    }
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('@sesion_guardia_v2');
    setUsuarioLogueado(null);
  };

  const seleccionarTecnicoParaModificar = (id, listaActora = usuariosDB) => {
    setIdSeleccionadoModificar(id);
    const empleado = listaActora.find(u => u.usuario === id);
    if (empleado) {
      setNuevoUserAdmin(empleado.usuario);
      setNuevoPassAdmin(empleado.pass);
      setDiasTotalesAdmin(String(empleado.dias_totales || 30));
    }
  };

  const asignarVacacionDirectaAdmin = async () => {
    if (!adminFechaInicio.trim() || !adminFechaFin.trim()) {
      Alert.alert('Error', 'Introduce las fechas correctas.');
      return;
    }
    const empleado = usuariosDB.find(u => u.usuario === idSeleccionadoModificar);
    const nuevaAusencia = {
      tecnicoId: idSeleccionadoModificar,
      nombre: empleado ? empleado.nombre : 'Técnico',
      tipo: adminTipoVacacion,
      inicio: adminFechaInicio.trim(),
      fin: adminFechaFin.trim(),
      estado: 'Aprobado' 
    };

    try {
      await supabaseFetch('vacaciones', { method: 'POST', body: JSON.stringify(nuevaAusencia) });
      Alert.alert('Éxito', `Ausencia aprobada directamente.`);
      setAdminFechaInicio('');
      setAdminFechaFin('');
      cargarDatosDesdeServidor();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la fila.');
    }
  };

  const resolverPeticion = async (id, nuevoEstado) => {
    try {
      await supabaseFetch(`vacaciones?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
      });
      Alert.alert('Procesado', `Solicitud marcada como: ${nuevoEstado}`);
      cargarDatosDesdeServidor();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la petición.');
    }
  };

  const obtenerDiasMes = (mes) => {
    const primerDia = new Date(anioActual, mes, 1).getDay();
    const diasEnBlanco = primerDia === 0 ? 6 : primerDia - 1;
    const numDias = new Date(anioActual, mes + 1, 0).getDate();

    let celdas = [];
    for (let i = 0; i < diasEnBlanco; i++) {
      celdas.push({ tipo: 'vacio', id: `vacio-${i}` });
    }
    for (let dia = 1; dia <= numDias; dia++) {
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaClave = `${anioActual}-${mesStr}-${diaStr}`;
      const fechaObj = new Date(anioActual, mes, dia);
      celdas.push({ tipo: 'dia', dia, fechaClave, esFinde: fechaObj.getDay() === 0 || fechaObj.getDay() === 6 });
    }
    return celdas;
  };

  const celdasCalendario = obtenerDiasMes(mesActual);

  const cambiarMes = (direccion) => {
    if (direccion === 'ant' && mesActual > 0) setMesActual(mesActual - 1);
    if (direccion === 'sig' && mesActual < 11) setMesActual(mesActual + 1);
  };

  if (cargandoDatosGlobales) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B' }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: '#FFF', marginTop: 15, fontSize: 13 }}>Sincronizando base de datos...</Text>
      </View>
    );
  }

  if (!usuarioLogueado) {
    return (
      <SafeAreaView style={styles.contenedorLogin}>
        <View style={styles.tarjetaLogin}>
          <Text style={styles.loginTitulo}>🔑 Acceso Cuadrante {anioActual}</Text>
          <Text style={styles.loginSubtitulo}>Sincronizado en tiempo real</Text>
          <Text style={styles.labelInput}>Usuario</Text>
          <TextInput style={styles.entradaTextoLogin} placeholder="Usuario" value={inputUsuario} onChangeText={setInputUsuario} autoCapitalize="none"/>
          <Text style={[styles.labelInput, {marginTop: 15}]}>Contraseña</Text>
          <TextInput style={styles.entradaTextoLogin} placeholder="••••••••" secureTextEntry={true} value={inputContraseña} onChangeText={setInputContraseña} autoCapitalize="none"/>
          <TouchableOpacity style={styles.botonLogin} onPress={iniciarSesion}>
            <Text style={styles.textoBotonLogin}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // 👑 VISTA: ADMINISTRADOR
  // ==========================================================
  if (usuarioLogueado.rol === 'admin') {
    const todosLosEmpleados = usuariosDB.filter(u => u.rol === 'empleado');

    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.cabeceraAdmin}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.titulo}>👑 Panel de Control</Text>
            <Text style={styles.subtitulo}>Admin: {usuarioLogueado.usuario}</Text>
          </View>
          <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
            <Text style={styles.textoBotonCerrar}>Salir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cuerpo}>
          
          {/* Tarifas Editables + BOTÓN GENERAR GUARDIA INTELIGENTE */}
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#10B981' }]}>💰 Tarifas de Guardia y Generación</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Laborable (€)</Text>
                <TextInput style={styles.entradaTexto} keyboardType="numeric" value={precioLaborable} onChangeText={setPrecioLaborable}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Festivo/Finde (€)</Text>
                <TextInput style={styles.entradaTexto} keyboardType="numeric" value={precioFestivoFinde} onChangeText={setPrecioFestivoFinde}/>
              </View>
            </View>
            
            {/* SOLUCIÓN: Botón Inteligente para evitar repetición de festivos */}
            <TouchableOpacity style={styles.botonInteligente} onPress={generarCalendarioInteligenteEquitativo}>
              <Text style={styles.textoBotonInteligente}>🔄 Generar Cuadrante Inteligente (Festivos Equitativos)</Text>
            </TouchableOpacity>
          </View>

          {/* Balance de Vacaciones */}
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1 }]}>
            <Text style={[styles.tituloSeccion, { color: '#059669' }]}>📊 Balance de Vacaciones del Equipo</Text>
            <View style={{ marginTop: 4 }}>
              {todosLosEmpleados.map((emp) => {
                const con = calcularContadoresVacaciones(emp.usuario, usuariosDB, peticiones);
                return (
                  <View key={emp.usuario} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '500', color: '#1E293B', fontSize: 13 }}>👤 {emp.nombre}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Text style={{ fontSize: 12 }}>Asignados: <Text style={{ fontWeight: 'bold' }}>{con.totales}</Text></Text>
                      <Text style={{ fontSize: 12, color: '#3B82F6' }}>Gastados: <Text style={{ fontWeight: 'bold' }}>{con.disfrutados}</Text></Text>
                      <Text style={{ fontSize: 12, color: '#10B981' }}>Disponibles: <Text style={{ fontWeight: 'bold' }}>{con.restantes}</Text></Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Alta de Técnicos */}
          <View style={[styles.tarjeta, { borderColor: '#8B5CF6', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#7C3AED' }]}>➕ Registrar Alta de Nuevo Técnico</Text>
            <Text style={styles.labelInput}>Nombre Completo</Text>
            <TextInput style={styles.entradaTexto} placeholder="Ej: Carlos Gómez" value={nuevoNombreTecnico} onChangeText={setNuevoNombreTecnico}/>
            
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Usuario Login</Text>
                <TextInput style={styles.entradaTexto} value={nuevoUserTecnico} onChangeText={setNuevoUserTecnico} autoCapitalize="none"/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelInput}>Contraseña</Text>
                <TextInput style={styles.entradaTexto} value={nuevoPassTecnico} onChangeText={setNuevoPassTecnico} autoCapitalize="none"/>
              </View>
            </View>
            <Text style={styles.labelInput}>Días Totales Iniciales</Text>
            <TextInput style={styles.entradaTexto} keyboardType="numeric" value={nuevosDiasTotales} onChangeText={setNuevosDiasTotales}/>

            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#8B5CF6' }]} onPress={registrarNuevoTecnico}>
              <Text style={styles.textoBotonEnviar}>💾 Guardar en Servidor</Text>
            </TouchableOpacity>
          </View>

          {/* Buzón de Solicitudes */}
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#059669' }]}>📌 Solicitudes Recibidas (Pendientes)</Text>
            {peticiones.filter(p => p.estado === 'Pendiente').length === 0 ? (
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', padding: 10 }}>No hay peticiones nuevas.</Text>
            ) : (
              peticiones.filter(p => p.estado === 'Pendiente').map((pet) => (
                <View key={pet.id} style={styles.contenedorItemPeticion}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.peticionNombre}>{pet.nombre} ({pet.tipo})</Text>
                    <Text style={styles.peticionFechas}>📅 {pet.inicio} al {pet.fin}</Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>Días a restar: {calcularDiasEntreFechas(pet.inicio, pet.fin)}</Text>
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

          {/* Gestión de Credenciales */}
          <View style={[styles.tarjeta, { borderColor: '#6366F1', borderWidth: 1.5 }]}>
            <Text style={[styles.tituloSeccion, { color: '#4F46E5' }]}>⚙️ Editar Credenciales y Vacaciones Directas</Text>
            <View style={styles.grupoBotonesGridVertical}>
              {todosLosEmpleados.map((emp) => (
                <TouchableOpacity 
                  key={emp.usuario} 
                  style={[styles.botonSelectorGrande, idSeleccionadoModificar === emp.usuario && { backgroundColor: '#6366F1' }]} 
                  onPress={() => seleccionarTecnicoParaModificar(emp.usuario)}
                >
                  <Text style={[styles.textoSelectorMini, idSeleccionadoModificar === emp.usuario && { color: '#FFF' }]}>
                    👤 {emp.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, {marginTop: 10}]}>Editar Usuario Login</Text>
            <TextInput style={styles.entradaTexto} value={nuevoUserAdmin} onChangeText={setNuevoUserAdmin} autoCapitalize="none"/>
            <Text style={styles.labelInput}>Editar Contraseña</Text>
            <TextInput style={styles.entradaTexto} value={nuevoPassAdmin} onChangeText={setNuevoPassAdmin} autoCapitalize="none"/>
            <Text style={styles.labelInput}>Modificar Asignación Total Días</Text>
            <TextInput style={styles.entradaTexto} keyboardType="numeric" value={diasTotalesAdmin} onChangeText={setDiasTotalesAdmin}/>

            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#6366F1' }]} onPress={aplicarChangeCredenciales}>
              <Text style={styles.textoBotonEnviar}>💾 Actualizar Técnico</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 }} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#4F46E5' }}>🌴 Forzar Periodo Aprobado:</Text>
            
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.entradaTexto} placeholder="Inicio: AAAA-MM-DD" value={adminFechaInicio} onChangeText={setAdminFechaInicio}/>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput style={styles.entradaTexto} placeholder="Fin: AAAA-MM-DD" value={adminFechaFin} onChangeText={setAdminFechaFin}/>
              </View>
            </View>
            
            <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#10B981' }]} onPress={asignarVacacionDirectaAdmin}>
              <Text style={styles.textoBotonEnviar}>🌴 Asignar Periodo</Text>
            </TouchableOpacity>
          </View>

          {/* SOLUCIÓN AL CALENDARIO (Admin) - Muestra correctamente quién está de guardia */}
          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>📅 Vista Global de Cuadrante (Verificando Vacaciones)</Text>
            <View style={styles.selectorMesContenedor}>
              <TouchableOpacity onPress={() => cambiarMes('ant')} disabled={mesActual === 0}><Text style={styles.flechaSelector}>◀</Text></TouchableOpacity>
              <Text style={styles.tituloMes}>{meses[mesActual]} {anioActual}</Text>
              <TouchableOpacity onPress={() => cambiarMes('sig')} disabled={mesActual === 11}><Text style={styles.flechaSelector}>▶</Text></TouchableOpacity>
            </View>

            <View style={styles.rejillaCalendario}>
              {celdasCalendario.map((celda, i) => {
                if (celda.tipo === 'vacio') return <View key={`vacio-${i}`} style={styles.celdaVacia} />;
                
                let compId = guardiasAnuales[celda.fechaClave];
                let estaDeVacaciones = comprobarSiEstaDeVacaciones(celda.fechaClave, compId, peticiones);
                
                // FIX: Busca al técnico en la lista completa (incluyendo administradores como J.Carlos)
                let compData = usuariosDB.find(c => c.usuario === compId);
                
                const infoFestivo = festivosDelAnio[celda.fechaClave];
                const esFestivoOFinde = celda.esFinde || !!infoFestivo;
                const costeDia = esFestivoOFinde ? precioFestivoFinde : precioLaborable;

                return (
                  <View key={celda.fechaClave} style={[styles.celdaDia, esFestivoOFinde && { backgroundColor: '#FFF1F2' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.numeroDia, esFestivoOFinde && { fontWeight: 'bold', color: '#EF4444' }]}>
                        {celda.dia} {infoFestivo ? infoFestivo.icono : ''}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 7, color: esFestivoOFinde ? '#E11D48' : '#10B981', alignSelf: 'center', fontWeight: 'bold' }}>{costeDia}€</Text>
                    
                    <View style={[styles.indicadorGuardia, { backgroundColor: estaDeVacaciones ? '#94A3B8' : (compData ? compData.color : '#475569') }]}>
                      <Text style={styles.textoIndicador} numberOfLines={1}>
                        {estaDeVacaciones ? 'PALMA' : (compData ? compData.nombre.split(' ')[0] : (compId || 'Libre'))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // 👤 VISTA: EMPLEADO / TÉCNICO
  // ==========================================================
  const misTecnicos = usuariosDB.filter(u => u.rol === 'empleado');
  const contadoresPropios = calcularContadoresVacaciones(usuarioLogueado.usuario, usuariosDB, peticiones);
  const desgloseFinanciero = calcularImporteMensualGuardia(usuarioLogueado.usuario, mesActual);

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.cabecera}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>👋 Hola, {usuarioLogueado.nombre}</Text>
          <Text style={{ fontSize: 11, color: '#475569', fontWeight: '500' }}>Técnico de Guardia Activo</Text>
        </View>
        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.textoBotonCerrar}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cuerpo}>
        {/* Marcador Financiero */}
        <View style={[styles.tarjeta, { backgroundColor: '#0F172A', borderColor: '#10B981', borderWidth: 1 }]}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            💰 Guardias Estimadas de {meses[mesActual]}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>{desgloseFinanciero.totalAcumulado} €</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                Laborables: {desgloseFinanciero.diasLaborables} | Festivos/Finde: {desgloseFinanciero.diasFestivosFinde}
              </Text>
            </View>
            <View style={{ backgroundColor: '#1E293B', padding: 10, borderRadius: 10 }}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{anioActual}</Text>
            </View>
          </View>
        </View>

        {/* Marcadores Vacaciones */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
          <View style={[styles.miniTarjetaContador, { flex: 1, backgroundColor: '#E2E8F0' }]}>
            <Text style={styles.labelContadorMini}>Asignados</Text>
            <Text style={styles.cifraContadorMini}>{contadoresPropios.totales}</Text>
          </View>
          <View style={[styles.miniTarjetaContador, { flex: 1, backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.labelContadorMini, { color: '#1E40AF' }]}>Disfrutados</Text>
            <Text style={[styles.cifraContadorMini, { color: '#1E40AF' }]}>{contadoresPropios.disfrutados}</Text>
          </View>
          <View style={[styles.miniTarjetaContador, { flex: 1, backgroundColor: '#D1FAE5' }]}>
            <Text style={[styles.labelContadorMini, { color: '#065F46' }]}>Quedan</Text>
            <Text style={[styles.cifraContadorMini, { color: '#065F46' }]}>{contadoresPropios.restantes}</Text>
          </View>
        </View>

        {/* Solicitudes de Vacaciones */}
        <View style={[styles.tarjeta, { borderColor: '#3B82F6', borderWidth: 1 }]}>
          <Text style={[styles.tituloSeccion, { color: '#1D4ED8' }]}>✉️ Tramitar Vacaciones o Días</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
            {['Vacaciones', 'Día Libre'].map((tipo) => (
              <TouchableOpacity key={tipo} style={[styles.botonSelectorGrande, { flex: 1 }, empTipoAusencia === tipo && { backgroundColor: '#3B82F6' }]} onPress={() => setEmpTipoAusencia(tipo)}>
                <Text style={[styles.textoSelectorMini, { textAlign: 'center' }, empTipoAusencia === tipo && { color: '#FFF' }]}>{tipo}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ flex: 1 }}>
              <TextInput style={styles.entradaTexto} placeholder="Inicio: AAAA-MM-DD" value={empFechaInicio} onChangeText={setEmpFechaInicio}/>
            </View>
            <View style={{ flex: 1 }}>
              <TextInput style={styles.entradaTexto} placeholder="Fin: AAAA-MM-DD" value={empFechaFin} onChangeText={setEmpFechaFin}/>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.botonEnviar, { backgroundColor: '#3B82F6' }]} onPress={solicitarDiasEmpleado}>
            <Text style={styles.textoBotonEnviar}>🚀 Enviar Solicitud Remota</Text>
          </TouchableOpacity>
        </View>

        {/* Historial Propio */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>📋 Mis Solicitudes de Ausencia</Text>
          {peticiones.filter(p => p.tecnicoId === usuarioLogueado.usuario).map((pet, ind) => (
            <View key={ind} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#F1F5F9' }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{pet.tipo} ({calcularDiasEntreFechas(pet.inicio, pet.fin)} días)</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>📅 {pet.inicio} al {pet.fin}</Text>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: pet.estado === 'Aprobado' ? '#10B981' : '#F59E0B' }}>{pet.estado}</Text>
            </View>
          ))}
        </View>

        {/* Calendario Empleado */}
        <View style={styles.tarjeta}>
          <View style={styles.selectorMesContenedor}>
            <TouchableOpacity onPress={() => cambiarMes('ant')} disabled={mesActual === 0}><Text style={styles.flechaSelector}>◀</Text></TouchableOpacity>
            <Text style={styles.tituloMes}>{meses[mesActual]} {anioActual}</Text>
            <TouchableOpacity onPress={() => cambiarMes('sig')} disabled={mesActual === 11}><Text style={styles.flechaSelector}>▶</Text></TouchableOpacity>
          </View>

          <View style={styles.rejillaCalendario}>
            {celdasCalendario.map((celda, i) => {
              if (celda.tipo === 'vacio') return <View key={`vacio-${i}`} style={styles.celdaVacia} />;

              const compId = guardiasAnuales[celda.fechaClave];
              let estaDeVacaciones = comprobarSiEstaDeVacaciones(celda.fechaClave, compId, peticiones);
              const compData = usuariosDB.find(c => c.usuario === compId);
              
              const infoFestivo = festivosDelAnio[celda.fechaClave];
              const esFestivoOFinde = celda.esFinde || !!infoFestivo;
              const costeDia = esFestivoOFinde ? precioFestivoFinde : precioLaborable;

              return (
                <View key={celda.fechaClave} style={[styles.celdaDia, esFestivoOFinde && { backgroundColor: '#FFF1F2' }]}>
                  <Text style={[styles.numeroDia, esFestivoOFinde && { fontWeight: 'bold', color: '#EF4444' }]}>
                    {celda.dia} {infoFestivo ? infoFestivo.icono : ''}
                  </Text>
                  <Text style={{ fontSize: 7, color: esFestivoOFinde ? '#E11D48' : '#10B981', textAlign: 'center', fontWeight: 'bold' }}>{costeDia}€</Text>
                  
                  <View style={[styles.indicadorGuardia, { backgroundColor: estaDeVacaciones ? '#94A3B8' : (compData ? compData.color : '#475569') }]}>
                    <Text style={styles.textoIndicador} numberOfLines={1}>
                      {estaDeVacaciones ? 'PALMA' : (compData ? compData.nombre.split(' ')[0] : (compId || 'Libre'))}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 🎨 DISEÑO GRÁFICO (STYLING)
// ==========================================
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F1F5F9' },
  contenedorLogin: { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', padding: 20 },
  tarjetaLogin: { backgroundColor: '#FFF', width: '100%', maxWidth: 350, padding: 24, borderRadius: 16 },
  loginTitulo: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  loginSubtitulo: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  cabecera: { backgroundColor: '#FFF', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cabeceraAdmin: { backgroundColor: '#FFF', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 11, color: '#64748B' },
  botonCerrarSesion: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  textoBotonCerrar: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  cuerpo: { flex: 1, padding: 10 },
  tarjeta: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 10 },
  tituloSeccion: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  labelInput: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 2 },
  entradaTexto: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', padding: 8, borderRadius: 8, fontSize: 11, marginBottom: 8, color: '#000' },
  entradaTextoLogin: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 10, fontSize: 14 },
  botonLogin: { backgroundColor: '#10B981', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  textoBotonLogin: { color: '#FFF', fontWeight: 'bold' },
  botonEnviar: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  textoBotonEnviar: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  botonInteligente: { backgroundColor: '#10B981', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  textoBotonInteligente: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  contenedorItemPeticion: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  peticionNombre: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
  peticionFechas: { fontSize: 12, color: '#475569' },
  bloqueAccionesPeticion: { flexDirection: 'row' },
  botonAccionMini: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  textoBotonMini: { color: '#FFF', fontWeight: 'bold' },
  grupoBotonesGridVertical: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  botonSelectorGrande: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  textoSelectorMini: { fontSize: 12, color: '#475569' },
  selectorMesContenedor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  flechaSelector: { fontSize: 18, color: '#1E293B', paddingHorizontal: 10 },
  tituloMes: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  rejillaCalendario: { flexDirection: 'row', flexWrap: 'wrap' },
  celdaDia: { width: '14.28%', height: 54, borderWidth: 0.2, borderColor: '#E2E8F0', padding: 2, justifyContent: 'space-between' },
  celdaVacia: { width: '14.28%', height: 54 },
  numeroDia: { fontSize: 10, color: '#64748B' },
  indicadorGuardia: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 1, alignItems: 'center' },
  textoIndicador: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  miniTarjetaContador: { padding: 10, borderRadius: 10, alignItems: 'center' },
  labelContadorMini: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
  cifraContadorMini: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 2 }
});