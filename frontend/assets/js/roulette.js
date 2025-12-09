document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("roulette");
  if (!canvas) return;

  
  const API_URL = "http://23.23.138.3:4000/api"; 

 
  const cssSize = 400; 
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = cssSize + "px";
  canvas.style.height = cssSize + "px";
  canvas.width = Math.floor(cssSize * dpr);
  canvas.height = Math.floor(cssSize * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const R = cssSize / 2;
  ctx.translate(R, R); 


  const numbers = [
    0,32,15,19,4,21,2,25,17,34,
    6,27,13,36,11,30,8,23,10,5,
    24,16,33,1,20,14,31,9,22,18,
    29,7,28,12,35,3,26
  ];
  const redSet = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  const colorsHex = numbers.map(n => (n === 0 ? "#1faa2a" : redSet.has(n) ? "#d6292a" : "#1f2329"));
  const SLICE = (Math.PI * 2) / numbers.length;
  
  const baseRotation = -Math.PI / 2 - SLICE / 2; 

  let spinning = false;

 
  function drawWheel(angle = 0) {
    ctx.clearRect(-R, -R, cssSize, cssSize);
    const g = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.05);
    g.addColorStop(0, "#222");
    g.addColorStop(1, "#111");
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.98, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth = 12;
    ctx.strokeStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.98, 0, Math.PI * 2);
    ctx.stroke();

    const wheelR = R * 0.93;
    for (let i = 0; i < numbers.length; i++) {
      const start = baseRotation + i * SLICE + angle;
      const end = start + SLICE;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelR, start, end);
      ctx.closePath();
      ctx.fillStyle = colorsHex[i]; 
      ctx.fill();

      ctx.strokeStyle = "#000000aa";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.rotate(start + SLICE / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#0008";
      ctx.shadowBlur = 2;
      ctx.fillText(String(numbers[i]), wheelR * 0.78, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.fillStyle = "#1c1c1c";
    ctx.arc(0, 0, R * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWheel(0);

  
  const saldoElement = document.getElementById("saldo"); 
  const estadoJuego  = document.getElementById("estado-juego");
  const resultado    = document.getElementById("resultado");
  const grid         = document.getElementById("grid-numeros");
  const celda0       = document.getElementById("celda-0");
  const btnRojo      = document.getElementById("apostar-rojo");
  const btnNegro     = document.getElementById("apostar-negro");
  const girarBtn     = document.getElementById("girar");
  const montoInput   = document.getElementById("monto");
  
  const listaNumerosUl = document.getElementById("lista-numeros");
  const tablaApuestasBody = document.getElementById("tabla-apuestas");

  let currentBet = null;
  let apuestaMonto = 0;

  function clearSelectionVisual() {
    document.querySelectorAll(".celda-num").forEach(c => c.classList.remove("seleccionado"));
    document.querySelectorAll(".btn").forEach(b => b.classList.remove("activo"));
  }
  function selectNumber(num, el) {
    clearSelectionVisual();
    currentBet = num;
    el?.classList.add("seleccionado");
    estadoJuego && (estadoJuego.textContent = `Apuesta seleccionada: número ${num}`);
    girarBtn.disabled = false; 
  }
  if (celda0) celda0.addEventListener("click", () => selectNumber(0, celda0));
  if (grid) {
    if (!grid.querySelector(".celda-num[data-gen='1']")) {
      for (let n = 1; n <= 36; n++) {
        const div = document.createElement("div");
        div.className = "celda-num " + (redSet.has(n) ? "rojo" : "negro");
        div.dataset.gen = "1";
        div.textContent = n;
        div.addEventListener("click", () => selectNumber(n, div));
        grid.appendChild(div);
      }
    }
  }
  btnRojo?.addEventListener("click", () => {
    clearSelectionVisual();
    currentBet = "rojo"; 
    btnRojo.classList.add("activo");
    estadoJuego && (estadoJuego.textContent = "Apuesta seleccionada: 🔴 Rojo");
    girarBtn.disabled = false; 
  });
  btnNegro?.addEventListener("click", () => {
    clearSelectionVisual();
    currentBet = "negro"; 
    btnNegro.classList.add("activo");
    estadoJuego && (estadoJuego.textContent = "Apuesta seleccionada: ⚫ Negro");
    girarBtn.disabled = false;
  });

  if (girarBtn) girarBtn.disabled = true;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  girarBtn?.addEventListener("click", async () => {
    if (spinning || currentBet === null) return;

    
    const saldoActualTexto = saldoElement?.textContent || "0";
    const saldoActual = parseInt(saldoActualTexto.replace(/\D/g, ''), 10); 
    apuestaMonto = parseInt(montoInput?.value ?? "0", 10);
    
    
    if (isNaN(apuestaMonto) || apuestaMonto <= 0) {
      estadoJuego.textContent = "Por favor, ingresa un monto válido.";
      return;
    }

    
    if (apuestaMonto > saldoActual) {
        estadoJuego.textContent = "Saldo insuficiente para apostar esa cantidad.";
        return;
    }
    
    
    if (saldoElement) {
        saldoElement.textContent = saldoActual - apuestaMonto;
    }

    estadoJuego && (estadoJuego.textContent = "Girando la ruleta…");
    spinning = true;
    girarBtn.disabled = true; 

    let resultData;
    try {
      
      const res = await fetch(`${API_URL}/game/spin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ currentBet, apuestaMonto })
      });

      const data = await res.json().catch(()=>({}));
      
      if (!res.ok) {
        throw new Error(data.message || "Error en el servidor");
      }
      resultData = data;

    } catch (e) {
      estadoJuego.textContent = `Error: ${e.message || e}`;
      spinning = false;
      girarBtn.disabled = false;
      
      if (saldoElement) saldoElement.textContent = saldoActual; 
      return;
    }

    
    const numGanador = resultData.numGanador;
    const idx = numbers.indexOf(numGanador);
    if (idx === -1) { 
        spinning = false;
        return;
    }

    const targetBase = baseRotation + idx * SLICE + SLICE / 2;
    const target = (-Math.PI / 2) - targetBase; 
    const spins = 5;
    const totalAngle = spins * Math.PI * 2 + target;
    const spinTime = 5500;
    const start = performance.now();

    function animate(now) {
      const t = Math.min(1, (now - start) / spinTime);
      const a = totalAngle * easeOut(t);
      drawWheel(a);
      if (t < 1) requestAnimationFrame(animate);
      else {
        spinning = false;
        showResult(resultData);
      }
    }
    requestAnimationFrame(animate);
  });

  function showResult(data) {
    const { numGanador, colorGanador, nuevoSaldo, ganancia } = data;
    
    
    if (typeof nuevoSaldo !== "undefined" && saldoElement) {
      saldoElement.textContent = String(nuevoSaldo);
    }

    const msg = ganancia > 0
      ? `¡Ganaste! Número ${numGanador} (${colorGanador}).`
      : `Perdiste. El número fue ${numGanador} (${colorGanador}).`;
    
    estadoJuego && (estadoJuego.textContent = msg);
    
    if (resultado) {
        if(ganancia > 0) {
            resultado.textContent = `Ganancia: +${ganancia}`;
        } else {
            resultado.textContent = `Pérdida: -${apuestaMonto}`;
        }
    }

    const resultadoStr = ganancia > 0 ? 'Ganada' : 'Perdida';
    
    actualizarListaNumeros(numGanador, colorGanador);
    actualizarTablaApuestas(currentBet, apuestaMonto, resultadoStr); 

    clearSelectionVisual();
    currentBet = null;
    girarBtn.disabled = true;
  }

  function actualizarListaNumeros(numero, color) {
    if (!listaNumerosUl) return; 
    
    
    let colorClass = color;
    if(color === 'red') colorClass = 'rojo';
    if(color === 'black') colorClass = 'negro';
    if(color === 'green') colorClass = 'verde';

    const nuevoLi = document.createElement("li");
    nuevoLi.className = `numero-ganador ${colorClass}`; 
    nuevoLi.textContent = numero;
    
    listaNumerosUl.prepend(nuevoLi);
    if (listaNumerosUl.children.length > 5) {
      listaNumerosUl.lastChild.remove();
    }
  }

  function actualizarTablaApuestas(apuesta, monto, resultadoStr) {
    if (!tablaApuestasBody) return;
    
    const filaVacia = tablaApuestasBody.querySelector("td[colspan='3']");
    if (filaVacia) filaVacia.parentElement.remove(); 

    const nuevaFila = document.createElement("tr");
    const claseResultado = resultadoStr === 'Ganada' ? 'ganada' : 'perdida';
    nuevaFila.classList.add(claseResultado);

    const celdaApuesta = document.createElement("td");
    celdaApuesta.textContent = apuesta; 
    
    const celdaMonto = document.createElement("td");
    celdaMonto.textContent = monto; 
    
    const celdaResultado = document.createElement("td");
    celdaResultado.textContent = resultadoStr;

    nuevaFila.append(celdaApuesta, celdaMonto, celdaResultado);
    tablaApuestasBody.prepend(nuevaFila);

    while (tablaApuestasBody.rows.length > 5) {
      tablaApuestasBody.lastChild.remove();
    }
  }
});