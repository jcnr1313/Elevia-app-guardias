import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';

export default function App() {
  // 📆 DETECCIÓN AUTOMÁTICA DEL AÑO EN CURSO
  const añoActual = new Date().getFullYear();

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // 💰 ESTADOS DE IMPORTES MODIFICABLES (Gestionados por el Admin)
  const [precioLaborable, setPrecioLaborable] = useState(28);
  const [precioFestivoFinde, setPrecioFestivoFinde] = useState(70);
  const [precioSemana, setPrecioSemana] = useState((28 * 5) + (70 * 2)); 

  // Base de datos de usuarios fija y segura
  const [usuariosDB, setUsuariosDB] = useState([
    { id: '1', nombre: 'Juan Carlos', user: 'Juan Carlos', pass: 'jc01', rol: 'empleado', color: '#EF4444', activo: true },
    { id: '2', nombre: 'Lucas', user: 'Lucas', pass: 'Lucas06', rol: 'empleado', color: '#10B981', activo: true },
    { id: '3', nombre: 'Oscar Idañez', user: 'Oscar Idañez', pass: 'Idañez07', rol: 'empleado', color: '#3B82F6', activo: true },
    { id: '4', nombre: 'Oscar Ibarreta', user: 'Oscar Ibarreta', pass: 'Ibarreta08', rol: 'empleado', color: '#F59E0B', activo: true },
    { id: 'admin', nombre: 'Jefe de Equipo', user: 'Friti', pass: 'friti43', rol: 'admin', color: '#475569', activo: true }
  ]);

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
    '11-01': { nombre: 'Todos los Santos', tipo: 'Nacional', icono: '🇪🇸' },
    '12-08': { nombre: 'Inmaculada', tipo: 'Nacional', icono: '🇪🇸' },
    '12-25': { nombre: 'Navidad', tipo: 'Nacional', icono: '🇪🇸' }
  };

  const festivosDelAño = {};
  Object.keys(festivosBase).forEach(mesDia => {
    festivosDelAño[`${añoActual}-${mesDia}`] = festivosBase[mesDia];
  });

  // ⚙️ MOTOR DE CUADRANTE: PARSEO CORREGIDO DE 7 DÍAS NATURALES (JUEVES A MIÉRCOLES)
  const generarCalendarioConNuevoOrden = () => {
    let nuevoCuadrante = {};
    let fechaBucle = new Date(añoActual, 0, 1); 

    // Historial previo
    const ordenInicial = ['1', '2', '3', '4']; 
    let indiceInicial = 0;

    // NUEVO ORDEN SOLICITADO: Juan Carlos (1) -> Oscar Ibarreta (4) -> Lucas (2) -> Oscar Idañez (3)
    const ordenNuevoSolicitado = ['1', '4', '2', '3']; 
    let indiceNuevo = 0;

    // Fecha exacta de arranque establecida por el usuario
    const fechaCambioOrden = new Date(2026, 5, 19); // 19 de Junio de 2026

    while (fechaBucle.getFullYear() === añoActual) {
      const a = fechaBucle.getFullYear();
      const m = String(fechaBucle.getMonth() + 1).padStart(2, '0');
      const d = String(fechaBucle.getDate()).padStart(2, '0');
      const isoKey = `${a}-${m}-${d}`;
      
      const diaSemana = fechaBucle.getDay(); // 4 = Jueves

      if (fechaBucle < fechaCambioOrden) {
        // Cuadrante viejo antes del cambio
        if (fechaBucle.getDate() !== 1 && fechaBucle.getDay() === 5) {
          indiceInicial = (indiceInicial + 1) % ordenInicial.length;
        }
        nuevoCuadrante[isoKey] = ordenInicial[indiceInicial];
      } else {
        // CORRECCIÓN: El día 19 fuerza el inicio de Juan Carlos. Los jueves posteriores avanzan tras cumplir los 7 días.
        if (fechaBucle.getTime() === fechaCambioOrden.getTime()) {
          indiceNuevo = 0; 
        } else if (diaSemana === 4) {
          indiceNuevo = (indiceNuevo + 1) % ordenNuevoSolicitado.length;
        }
        nuevoCuadrante[isoKey] = ordenNuevoSolicitado[indiceNuevo];
      }

      fechaBucle.setDate(fechaBucle.getDate() + 1);
    }
    return nuevoCuadrante;
  };

  const [guardiasAnuales, setGuardiasAnuales] = useState(() => generarCalendarioConNuevoOrden());

  // Estados de sesión y navegación
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); 
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputContraseña, setInputContraseña] = useState('');
  const [mesActual, setMesActual] = useState(new Date().getMonth()); 

  // Gestión Admin
  const [idSaliente, setIdSaliente] = useState('1');
  const [idEntrante, setIdEntrante] = useState('2');
  const [fechaEfectiva, setFechaEfectiva] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [peticiones, setPeticiones] = useState([
    { id: '101', tecnicoId: '2', nombre: 'Lucas', tipo: 'Vacaciones', inicio: `${añoActual}-06-12`, fin: `${añoActual}-06-19`, estado: 'Pendiente' }
  ]);

  const calcularNominasDelMes = (mes) => {
    const numDias = new Date(añoActual, mes + 1, 0).getDate();
    let resumen = { '1': 0, '2': 0, '3': 0, '4': 0 };

    if (!guardiasAnuales || Object.keys(guardiasAnuales).length === 0) return resumen;

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
    const usuarioEncontrado = usuariosDB.find(
      u => u.user.toLowerCase() === inputUsuario.toLowerCase().trim() && u.pass === inputContraseña
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

  const enviarSolicitud = () => {
    if (!fechaInicio || !fechaFin) {
      Alert.alert('Error', 'Completa las fechas.');
      return;
    }
    const nuevaPeticion = {
      id: Date.now().toString(),
      tecnicoId: usuarioLogueado.id,
      nombre: usuarioLogueado.nombre, 
      tipo: 'Vacaciones',
      inicio: fechaInicio,
      fin: fechaFin,
      estado: 'Pendiente'
    };
    setPeticiones([...peticiones, nuevaPeticion]);
    Alert.alert('Éxito', 'Enviado a Friti.');
    setFechaInicio('');
    setFechaFin('');
  };

  const contarGuardiasEnRango = (tecnicoId, inicio, fin) => {
    let contador = 0;
    try {
      const [iA, iM, iD] = inicio.split('-').map(Number);
      const [fA, fM, fD] = fin.split('-').map(Number);
      let fechaBucle = new Date(iA, iM - 1, iD);
      const fechaLimite = new Date(fA, fM - 1, fD);

      while (fechaBucle <= fechaLimite) {
        const a = fechaBucle.getFullYear();
        const m = String(fechaBucle.getMonth() + 1).padStart(2, '0');
        const d = String(fechaBucle.getDate()).padStart(2, '0');
        const isoKey = `${a}-${m}-${d}`;

        if (guardiasAnuales[isoKey] === tecnicoId) {
          contador++;
        }
        fechaBucle.setDate(fechaBucle.getDate() + 1);
      }
    } catch(e) { console.log(e); }
    return contador;
  };

  const aprobarVacacionesConValidacion = (peticion) => {
    const guardiasAfectadas = contarGuardiasEnRango(peticion.tecnicoId, peticion.inicio, peticion.fin);

    const ejecutarAprobacion = () => {
      const copiaGuardias = { ...guardiasAnuales };
      const [iA, iM, iD] = peticion.inicio.split('-').map(Number);
      const [fA, fM, fD] = peticion.fin.split('-').map(Number);

      let fechaBucle = new Date(iA, iM - 1, iD);
      const fechaLimite = new Date(fA, fM - 1, fD);

      while (fechaBucle <= fechaLimite) {
        const a = fechaBucle.getFullYear();
        const m = String(fechaBucle.getMonth() + 1).padStart(2, '0');
        const d = String(fechaBucle.getDate()).padStart(2, '0');
        const isoKey = `${a}-${m}-${d}`;

        if (copiaGuardias[isoKey] === peticion.tecnicoId) {
          copiaGuardias[isoKey] = null; 
        }
        fechaBucle.setDate(fechaBucle.getDate() + 1);
      }

      setGuardiasAnuales(copiaGuardias);
      setPeticiones(peticiones.map(p => p.id === peticion.id ? { ...p, estado: 'Aprobada' } : p));
      Alert.alert('Vacaciones Aprobadas', 'Se han liberado las fechas.');
    };

    if (guardiasAfectadas > 0) {
      Alert.alert(
        '⚠️ ADVERTENCIA DE GUARDIA',
        `¡Ojo Friti! Tiene ${guardiasAfectadas} guardias asignadas en estas fechas. ¿Proceder?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí, borrar y aprobar', style: 'destructive', onPress: ejecutarAprobacion }
        ]
      );
    } else {
      ejecutarAprobacion();
    }
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
    setUsuariosDB(usuariosDB.map(u => u.id === idSaliente ? { ...u, activo: false } : u));
    Alert.alert('Reemplazo Completado', `Se transfirieron las guardias.`);
    setFechaEfectiva('');
  };

  const cambiarMes = (direccion) => {
    if (direccion === 'ant' && mesActual > 0) setMesActual(mesActual - 1);
    if (direccion === 'sig' && mesActual < 11) setMesActual(mesActual + 1);
  };

  if (!guardiasAnuales || Object.keys(guardiasAnuales).length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Cargando calendario seguro...</Text>
      </View>
    );
  }

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

  // VISTA 2: ADMINISTRADOR (FRITI)
  if (usuarioLogueado.rol === 'admin') {
    const todosLosEmpleados = usuariosDB.filter(u => u.rol === 'empleado');
    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.cabeceraAdmin}>
          <View>
            <Text style={styles.titulo}>👑 Panel de Friti (Jefe)</Text>
            <Text style={styles.subtitulo}>Gestión Inteligente - Año {añoActual}</Text>
          </View>
          <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
            <Text style={styles.textoBotonCerrar}>Salir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cuerpo}>
          <View style={[styles.tarjeta, { borderColor: '#10B981', borderWidth: 1 }]}>
            <Text style={[styles.tituloSeccion, { color: '#065F46' }]}>💵 Ajuste de Importes y Tarifas (€)</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ width: '48%' }}>
                <Text style={styles.labelInput}>Día Laborable (€)</Text>
                <TextInput style={styles.entradaTexto} keyboardType="numeric" value={String(precioLaborable)} onChangeText={(val) => setPrecioLaborable(val.replace(/[^0-9]/g, ''))}/>
              </View>
              <View style={{ width: '48%' }}>
                <Text style={styles.labelInput}>Festivo / Finde (€)</Text>
                <TextInput style={styles.entradaTexto} keyboardType="numeric" value={String(precioFestivoFinde)} onChangeText={(val) => setPrecioFestivoFinde(val.replace(/[^0-9]/g, ''))}/>
              </View>
            </View>
          </View>

          <View style={[styles.tarjeta, { borderColor: '#EF4444', borderWidth: 1 }]}>
            <Text style={[styles.tituloSeccion, { color: '#B91C1C' }]}>🚨 Sustitución de Emergencia</Text>
            <Text style={styles.labelInput}>1. ¿Quién causa baja?</Text>
            <View style={styles.grupoBotonesGrid}>
              {todosLosEmpleados.map((emp) => (
                <TouchableOpacity key={emp.id} style={[styles.botonSelectorMini, idSaliente === emp.id && {backgroundColor: '#EF4444'}]} onPress={() => setIdSaliente(emp.id)}>
                  <Text style={[styles.textoSelectorMini, idSaliente === emp.id && {color: '#FFF', fontWeight:'bold'}]}>{emp.nombre.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, {marginTop: 10}]}>2. ¿Quién hereda sus guardias?</Text>
            <View style={styles.grupoBotonesGrid}>
              {todosLosEmpleados.filter(e => e.activo).map((emp) => (
                <TouchableOpacity key={emp.id} style={[styles.botonSelectorMini, idEntrante === emp.id && {backgroundColor: '#10B981'}]} onPress={() => setIdEntrante(emp.id)}>
                  <Text style={[styles.textoSelectorMini, idEntrante === emp.id && {color: '#FFF', fontWeight:'bold'}]}>{emp.nombre.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.labelInput, {marginTop: 10}]}>3. ¿A partir de qué fecha? (AAAA-MM-DD)</Text>
            <TextInput style={styles.entradaTexto} placeholder={`Ej: ${añoActual}-06-15`} value={fechaEfectiva} onChangeText={setFechaEfectiva} />
            <TouchableOpacity style={styles.botonEjecutarMasivo} onPress={ejecutarReemplazoMasivo}>
              <Text style={styles.textoBotonEnviar}>⚡ Aplicar Cambio Permanente</Text>
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
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <View style={[styles.circuloColor, {backgroundColor: usuarioLogueado.color, width:16, height:16}]} />
          <View style={{marginLeft: 5}}>
            <Text style={styles.titulo}>👋 ¡Hola, {usuarioLogueado.nombre}!</Text>
            <Text style={styles.subtitulo}>Calendario de Guardias - Año {añoActual}</Text>
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
          <Text style={{color: '#94A3B8', fontSize: 10, lineHeight: 14}}>
            Tarifas: Laborable {precioLaborable}€ | Finde y Festivos oficiales {precioFestivoFinde}€
          </Text>
        </View>

        {/* CALENDARIO */}
        <View style={styles.tarjeta}>
          <View style={styles.selectorMesContenedor}>
            <TouchableOpacity onPress={() => cambiarMes('ant')} disabled={mesActual === 0}>
              <Text style={[styles.flechaSelector, mesActual === 0 && {color: '#CBD5E1'}]}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.tituloMes}>{meses[mesActual]} {añoActual}</Text>
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
                    <Text style={[styles.textoDia, compData ? { color: '#FFFFFF', fontWeight: 'bold' } : {color: '#64748B'}]}>
                      {celda.dia}
                    </Text>
                    {infoFestivo && <Text numberOfLines={1} style={styles.textoMiniFestivo}>{infoFestivo.icono}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* TRÁMITES */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>🚀 Solicitar Vacaciones</Text>
          <TextInput style={styles.entradaTexto} placeholder={`Inicio (Ej: ${añoActual}-06-15)`} value={fechaInicio} onChangeText={setFechaInicio} />
          <TextInput style={[styles.entradaTexto, {marginTop: 10}]} placeholder={`Fin (Ej: ${añoActual}-06-22)`} value={fechaFin} onChangeText={setFechaFin} />
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
  tarjetaLogin: { backgroundColor: '#FFFFFF', width: '85%', padding: 25, borderRadius: 16 },
  loginTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  loginSubtitulo: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  labelInput: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 4 },
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
  
  tarjeta: { backgroundColor: '#FFFFFF', margin: 12, padding: 12, borderRadius: 12 },
  tarjetaResumenPropia: { backgroundColor: '#1E293B', margin: 12, padding: 16, borderRadius: 12 },
  tituloSeccionBlanco: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8' },
  cifraNominaGrande: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginVertical: 4 },

  tituloSeccion: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 5 },
  listaCompañeros: { flexDirection: 'row', flexWrap: 'wrap' },
  circuloColor: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },

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

  grupoBotonesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  botonSelectorMini: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginHorizontal: 2 },
  textoSelectorMini: { fontSize: 11, color: '#475569' },
  botonEjecutarMasivo: { backgroundColor: '#EF4444', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 }
});