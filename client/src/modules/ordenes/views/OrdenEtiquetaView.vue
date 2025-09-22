<template>
  <div class="print-wrap">
    <div class="label" ref="labelRef">
      <div class="label-header">
        <img class="logo" src="../../../img/crt-cuadrado.jpg" alt="CRT" />
        <div class="title">
          <div>CRT</div>
        </div>
      </div>
      <div class="line compact">
        <span>ORDEN Nº:</span><strong>{{ orden?.idOrden }}</strong>
      </div>
      <div class="line">servicio@crtinformatica.com</div>
      <div class="line">Guatemala este 654, · San Juan</div>
      <div class="line">2644642702 — 4211883</div>
      <div class="web">WWW.CRTINFORMATICA.COM</div>
      <div class="qr">
        <img v-if="qrSrc" :src="qrSrc" alt="QR" />
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
import QRCode from "qrcode";

const route = useRoute();
const id = Number(route.params.id);
const orden = ref<any>(null);
const labelRef = ref<HTMLElement | null>(null);
const qrSrc = ref<string>("");

onMounted(async () => {
  const { data } = await axios.get(`/api/ordenes/${id}`);
  orden.value = data;
  const url = `${window.location.origin}/seguimiento?orden=${id}`;
  qrSrc.value = await QRCode.toDataURL(url, { width: 220, margin: 0 });
  if (route.query.print === "1") {
    if (window.top === window.self) {
      setTimeout(() => window.print(), 200);
    } else {
      try {
        window.parent.postMessage({ type: "label-ready", idOrden: id }, "*");
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.label {
  width: 58mm;
  font-family: Arial, sans-serif;
  font-size: 11px;
  color: #111;
}
.label-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.logo {
  width: 38px;
  height: auto;
}
.title {
  display: flex;
  flex-direction: column;
  font-weight: 700;
}
.line {
  margin: 2px 0;
}
.compact {
  display: flex;
  justify-content: space-between;
}
.compact span {
  opacity: 0.9;
}
.web {
  text-align: center;
  font-weight: 700;
  margin: 6px 0;
  border-top: 1px dashed #666;
  border-bottom: 1px dashed #666;
  padding: 2px 0;
}
.qr {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}
.qr img {
  width: 220px;
  height: 220px;
}
.no-print {
  margin-top: 8px;
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

<!-- Reglas globales de impresión: mostrar solo la etiqueta -->
<style>
@media print {
  @page {
    size: 58mm auto;
    margin: 4mm;
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
  .label,
  .label * {
    visibility: visible;
  }
  .label {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
