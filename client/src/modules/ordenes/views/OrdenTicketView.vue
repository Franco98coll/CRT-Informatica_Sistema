<template>
  <div class="print-wrap">
    <div class="ticket" ref="ticketRef">
      <div class="ticket-header">
        <img class="logo" src="../../../img/crt-cuadrado.jpg" alt="CRT" />
        <div class="title">
          <div>CRT</div>
          <div class="order">ORDEN N° {{ orden?.idOrden }}</div>
        </div>
      </div>
      <div class="top-grid">
        <div class="left">
          <div class="row">
            <span>Fecha de ingreso:</span>
            <strong>{{
              orden?.fechaHoraCreadoOrden?.replace("T", " ")
            }}</strong>
          </div>
          <div class="row">
            <span>Nombre:</span> <strong>{{ orden?.NombreCliente }}</strong>
          </div>
          <div class="row">
            <span>Teléfono:</span>
            <strong>{{ orden?.TelefonoCliente || "—" }}</strong>
          </div>
          <div class="row">
            <span>Tipo de equipo:</span>
            <strong>{{ orden?.TipoEquipo || "—" }}</strong>
          </div>
          <div class="row">
            <span>Marca:</span> <strong>{{ orden?.MarcaEquipo || "—" }}</strong>
          </div>
          <div class="row">
            <span>Modelo:</span>
            <strong>{{ orden?.ModeloEquipo || "—" }}</strong>
          </div>
          <div class="row">
            <span>N.S.:</span>
            <strong>{{ orden?.numeroDeSerieEquipo || "—" }}</strong>
          </div>
          <div class="row">
            <span>Falla:</span>
            <strong>{{ orden?.fallaEquipoOrden || "—" }}</strong>
          </div>
          <div class="row">
            <span>Observac.:</span>
            <strong>{{ orden?.diagnosticoAClienteOrden || "—" }}</strong>
          </div>
        </div>
        <div class="right">
          <div class="sig-title">Firma del cliente</div>
          <div class="sig-box"></div>
          <div class="sig-note">Aclaración y DNI</div>
        </div>
      </div>
      <div class="sep"></div>
      <div class="condiciones">
        <p>
          CONDICIONES DE RECEPCION: El cliente firma bajo juramento que es
          íntegramente responsable del origen y la legitimidad del/los aparato/s
          a reparar, accesorios y datos contenidos que pueda/n almacenar,
          deslindando a la empresa de toda irregularidad o ilegalidad en los
          mismos. Asimismo, si llegasen a detectarse irregularidades en lo antes
          mencionado, faculta a la empresa mediante la presente, a dar aviso a
          la autoridad pertinente mediante denuncia o exposición. Los tiempos de
          presupuestado y reparación del/los aparato/s es de entre 10 y 15 días
          y estos son estimativos y estarán sujetos a su complejidad (ingreso de
          repuestos, nuevas fallas detectadas, alta demanda, etc.). El valor del
          presupuesto tendrá una validez de 72hs, pasado ese tiempo podrá ser
          modificado previo aviso. Asimismo, una vez comunicado que el equipo
          está terminado, si la demora en retirar es mayor a quince (15) días
          corridos, el presupuesto puede ser modificado previo aviso debido a la
          volatilidad de los valores cambiarios. Los equipos sin reclamar por
          más de 90 días serán considerados en abandono bajo los términos de los
          Artículos 2525 y 2526 del Código Civil y Comercial se le dará el
          destino que la empresa considere pertinente. La empresa no se
          responsabiliza de la información almacenada en el/los aparato/s a
          reparar, el cliente debe tomar los recaudos de resguardo y backup de
          los mismos. La empresa se reserva el derecho de admisión de aparatos
          que se encuentren intervenidos por terceros y de ser ingresados se
          deslinda a la empresa de cualquier tipo de responsabilidad por falta o
          daño de algún componente, repuesto y/o accesorio. GARANTÍAS: Todas las
          garantías del servicio serán realizadas en nuestro local, quedando los
          gastos de transporte y/o envío a cargo del cliente. El tiempo de
          garantía será de 30 días (o a convenir según reparación) y será válido
          a partir de la notificación al cliente de la reparación efectiva. Será
          válida la garantía siempre y cuando la falla sea la misma que la
          reparada con anterioridad y la faja de seguridad no se encuentre
          removía y/o alterada. La garantía será anulada si el aparato presenta
          daño por golpes, mal uso intencional o accidental y/o uso indebido de
          accesorios originales o alternativos, intervenciones técnicas
          posteriores de terceros, daños por cambios en la corriente eléctrica
          de línea, líquidos o por factores climáticos (tormenta, lluvia, etc.).
          EL CLIENTE ASIENTE HABER LEÍDO LAS CONDICIONES Y ACEPTA EN CONFORMIDAD
          AL FIRMAR ESTA FICHA DE RECEPCIÓN DE LA QUE SE ENTREGA UNA COPIA
          FORMATO DIGITAL. -
        </p>
      </div>
    </div>
    <div class="actions no-print">
      <v-btn color="primary" @click="print">Imprimir</v-btn>
      <v-btn variant="text" @click="$router.back()">Volver</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const id = Number(route.params.id);
const orden = ref<any>(null);
const ticketRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  const { data } = await axios.get(`/api/ordenes/${id}`);
  orden.value = data;
  // Autoprint si viene con ?print=1
  if (route.query.print === "1") {
    if (window.top === window.self) {
      setTimeout(() => window.print(), 200);
    } else {
      try {
        window.parent.postMessage({ type: "ticket-ready", idOrden: id }, "*");
      } catch {}
    }
  }
});

function print() {
  window.print();
}
</script>

<style scoped>
.print-wrap {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ticket {
  width: 80mm;
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: #111;
}
.ticket-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.logo {
  width: 42px;
  height: auto;
}
.title {
  display: flex;
  flex-direction: column;
  font-weight: 700;
}
.title .order {
  font-size: 14px;
}
.top-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 8px;
  align-items: start;
}
.left {
  min-width: 0;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.row {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
}
.row span {
  opacity: 0.75;
}
.sep {
  border-top: 1px dashed #888;
  margin: 8px 0;
}
.condiciones {
  white-space: pre-line;
  text-align: justify;
  margin-left: 5px;
  font-size: 10px;
  opacity: 0.95;
}
.sig-title {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}
.sig-box {
  width: 100%;
  height: 35mm;
  border: 1px solid #111;
}
.sig-note {
  font-size: 10px;
  opacity: 0.8;
  margin-top: 4px;
  text-align: center;
}
.barcode {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
.no-print {
  margin-top: 12px;
}
@media print {
  .no-print {
    display: none !important;
  }
  .print-wrap {
    padding: 0;
  }
}
</style>

<!-- Reglas globales de impresión: mostrar solo el ticket -->
<style>
@media print {
  @page {
    size: 80mm auto;
    margin: 5mm;
  }
  html,
  body {
    background: #fff !important;
    margin: 0;
    padding: 0;
  }
  body * {
    visibility: hidden;
  }
  .ticket,
  .ticket * {
    visibility: visible;
  }
  .ticket {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
